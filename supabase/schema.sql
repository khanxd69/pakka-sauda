-- Pakka Sauda: database schema v1
-- Owner: Workstream A. Run ONCE in the Supabase SQL editor during Phase 0 (step A0.6).
-- Later changes go in supabase/patches/NNN_description.sql (A only) and are announced to the team.
-- Every table is created now, including those only used by P1 features, so nobody needs a schema change mid-build.
-- All money values are rupees. All quantities are kilograms. All prices are rupees PER KG.

create type role_t          as enum ('farmer','wholesaler','admin');
create type grade_t         as enum ('A','B','C');
create type listing_status  as enum ('open','sold','cancelled');
create type bid_status      as enum ('pending','accepted','rejected','withdrawn');
create type sauda_status    as enum ('token_due','awaiting_collection','collected','disputed','agreed','settled','cancelled');
create type cancel_reason_t as enum ('token_expired','grade_not_accepted','shortfall','buyer_walked_away',
                                     'crop_loss','farmer_sold_elsewhere','dispute_unresolved');

create table profiles (
  id            uuid primary key default gen_random_uuid(),
  role          role_t  not null,
  name          text    not null,
  name_ur       text,
  phone         text,
  district      text,
  business_name text,
  verified      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Reference prices are copied by hand from AMIS Punjab on the morning of the hackathon (Workstream D owns the values).
create table reference_prices (
  id           serial primary key,
  crop         text not null default 'potato',
  market       text not null,                 -- 'Lahore', 'Okara'
  price_per_kg numeric(10,2) not null check (price_per_kg > 0),
  source       text not null,                 -- 'AMIS Punjab' (or 'ILLUSTRATIVE' until replaced)
  source_price numeric(12,2),                 -- the number exactly as published
  source_unit  text not null,                 -- the unit exactly as published, e.g. 'Rs per 100 kg'
  source_date  date not null
);

create table listings (
  id               uuid primary key default gen_random_uuid(),
  farmer_id        uuid not null references profiles(id),
  crop             text not null default 'potato',
  qty_low_kg       numeric(10,2) not null check (qty_low_kg > 0),
  qty_high_kg      numeric(10,2) not null,
  expected_grade   grade_t not null,
  min_price_per_kg numeric(10,2) not null check (min_price_per_kg > 0),
  ready_from       date not null,
  ready_to         date not null,
  district         text not null,
  village          text,
  voice_transcript text,
  status           listing_status not null default 'open',
  created_at       timestamptz not null default now(),
  check (qty_high_kg >= qty_low_kg),
  check (ready_to >= ready_from)
);

create table bids (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null references listings(id) on delete cascade,
  wholesaler_id   uuid not null references profiles(id),
  price_a         numeric(10,2) not null check (price_a > 0),
  price_b         numeric(10,2) check (price_b > 0),   -- null = grade B not accepted
  price_c         numeric(10,2) check (price_c > 0),   -- null = grade C not accepted
  collection_date date not null,
  loading_paid_by text not null default 'buyer' check (loading_paid_by in ('buyer','farmer')),
  note            text,
  status          bid_status not null default 'pending',
  created_at      timestamptz not null default now(),
  unique (listing_id, wholesaler_id)                    -- placing a new bid upserts over the old one
);

create table saudas (
  id                   uuid primary key default gen_random_uuid(),
  listing_id           uuid not null references listings(id),
  bid_id               uuid not null references bids(id),
  farmer_id            uuid not null references profiles(id),
  wholesaler_id        uuid not null references profiles(id),
  terms                jsonb not null,               -- frozen SaudaTerms (see lib/types.ts)
  status               sauda_status not null default 'token_due',
  token_due_by         timestamptz not null,
  token_paid_at        timestamptz,
  collection_code      text,                         -- one-time 4-digit code, issued when the token is paid (P1)
  weighed_kg           numeric(10,2) check (weighed_kg > 0),
  delivered_grade      grade_t,                      -- grade recorded by the buyer at collection
  buyer_note           text,
  farmer_claimed_grade grade_t,                      -- grade the farmer says it is, when disputing
  dispute_reason       text,
  resolved_grade       grade_t,                      -- grade ruled by the reviewer
  resolution_note      text,
  final_amount         numeric(14,2),
  platform_fee         numeric(14,2),
  cancel_reason        cancel_reason_t,
  token_to             text check (token_to in ('farmer','buyer')),
  created_at           timestamptz not null default now(),
  agreed_at            timestamptz,
  settled_at           timestamptz,
  cancelled_at         timestamptz
);

-- Photos for collection and disputes (P1). The server stamps captured_at; the browser sends lat/lng.
create table evidence (
  id          uuid primary key default gen_random_uuid(),
  sauda_id    uuid not null references saudas(id) on delete cascade,
  uploaded_by uuid not null references profiles(id),
  kind        text not null check (kind in ('collection','dispute')),
  url         text not null,
  lat         double precision,
  lng         double precision,
  captured_at timestamptz not null default now()
);

-- Audit trail behind every timeline. Every state change writes exactly one row.
create table sauda_events (
  id         bigserial primary key,
  sauda_id   uuid not null references saudas(id) on delete cascade,
  actor_id   uuid references profiles(id),
  type       text not null,   -- created | token_paid | collected | confirmed | disputed | resolved | balance_received | cancelled
  payload    jsonb,
  created_at timestamptz not null default now()
);

create index on listings (status);
create index on bids (listing_id);
create index on bids (wholesaler_id);
create index on saudas (farmer_id);
create index on saudas (wholesaler_id);
create index on saudas (status);
create index on sauda_events (sauda_id);
create index on evidence (sauda_id);

-- The app talks to the database only from the server with the service-role key, which bypasses RLS.
-- Enabling RLS with no policies blocks the public anon key from reading anything.
alter table profiles         enable row level security;
alter table reference_prices enable row level security;
alter table listings         enable row level security;
alter table bids             enable row level security;
alter table saudas           enable row level security;
alter table evidence         enable row level security;
alter table sauda_events     enable row level security;

-- Accepting a bid happens in ONE transaction: sauda created, chosen bid accepted, other pending bids rejected,
-- listing marked sold, event written. Called from app/actions/bids.ts via supabase.rpc('accept_bid', {...}).
-- The token is TOKEN_PERCENT of the mid-range quantity at the bid's price for the farmer's expected grade
-- (falls back to the grade A price if the buyer did not price that grade).
create or replace function accept_bid(
  p_bid uuid,
  p_token_pct numeric default 10,
  p_fee_pct numeric default 1,
  p_token_window_minutes int default 30
) returns uuid
language plpgsql as $$
declare
  b bids;
  l listings;
  s_id uuid;
  ref_price numeric;
begin
  select * into b from bids where id = p_bid and status = 'pending' for update;
  if not found then raise exception 'BID_NOT_PENDING'; end if;

  select * into l from listings where id = b.listing_id and status = 'open' for update;
  if not found then raise exception 'LISTING_NOT_OPEN'; end if;

  ref_price := coalesce(
    case l.expected_grade when 'A' then b.price_a when 'B' then b.price_b else b.price_c end,
    b.price_a);

  update bids
     set status = case when id = p_bid then 'accepted'::bid_status else 'rejected'::bid_status end
   where listing_id = l.id and status = 'pending';

  update listings set status = 'sold' where id = l.id;

  insert into saudas (listing_id, bid_id, farmer_id, wholesaler_id, terms, token_due_by)
  values (
    l.id, b.id, l.farmer_id, b.wholesaler_id,
    jsonb_build_object(
      'price', jsonb_build_object('A', b.price_a, 'B', b.price_b, 'C', b.price_c),
      'qty_low_kg', l.qty_low_kg,
      'qty_high_kg', l.qty_high_kg,
      'expected_grade', l.expected_grade,
      'collection_date', b.collection_date,
      'loading_paid_by', b.loading_paid_by,
      'fee_percent', p_fee_pct,
      'token_amount', round((l.qty_low_kg + l.qty_high_kg) / 2 * ref_price * p_token_pct / 100, 2)
    ),
    now() + make_interval(mins => p_token_window_minutes)
  )
  returning id into s_id;

  insert into sauda_events (sauda_id, actor_id, type, payload)
  values (s_id, l.farmer_id, 'created', jsonb_build_object('bid_id', b.id));

  return s_id;
end $$;
