-- Pakka Sauda: demo seed. Owner: Workstream A.
-- Defines reset_demo(), which wipes every demo row (except reference_prices) and re-inserts the demo state.
-- Run this whole file once after schema.sql. Rehearsals call reset_demo() via the admin "Reset demo" button (P1).
-- IDs are fixed so lib/fixtures.ts, tests and the demo script can refer to them. Dates are relative to today.
-- All prices are ILLUSTRATIVE rupees per kg. Replace them with numbers based on AMIS on the day if they look off.

create or replace function reset_demo() returns void
language plpgsql as $$
begin
  delete from sauda_events;
  delete from evidence;
  delete from saudas;
  delete from bids;
  delete from listings;
  delete from profiles;

  insert into profiles (id, role, name, name_ur, phone, district, business_name, verified) values
    ('00000000-0000-4000-8000-000000000101', 'farmer',     'Rashid',      'راشد',      '0300-0000101', 'Okara',  null,                true),
    ('00000000-0000-4000-8000-000000000102', 'farmer',     'Naseem Bibi', 'نسیم بی بی', '0300-0000102', 'Okara',  null,                true),
    ('00000000-0000-4000-8000-000000000103', 'farmer',     'Akram',       'اکرم',      '0300-0000103', 'Okara',  null,                true),
    ('00000000-0000-4000-8000-000000000201', 'wholesaler', 'Imran',       'عمران',     '0300-0000201', 'Lahore', 'Imran Traders',     true),
    ('00000000-0000-4000-8000-000000000202', 'wholesaler', 'Bilal',       'بلال',      '0300-0000202', 'Lahore', 'Lahore Fresh',      true),
    ('00000000-0000-4000-8000-000000000203', 'wholesaler', 'Kashif',      'کاشف',      '0300-0000203', 'Lahore', 'Pak Agro Buyers',   false),
    ('00000000-0000-4000-8000-000000000301', 'admin',      'Reviewer',    'جائزہ کار',  null,           null,     null,                true);

  insert into listings (id, farmer_id, qty_low_kg, qty_high_kg, expected_grade, min_price_per_kg,
                        ready_from, ready_to, district, status, created_at) values
    -- Rashid: already collected, used for the dispute scene
    ('00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000101', 8000, 9000, 'A', 38,
     current_date - 6, current_date - 1, 'Okara', 'sold', now() - interval '8 days'),
    -- Naseem: open, one pending bid
    ('00000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000000102', 6000, 7000, 'A', 36,
     current_date + 3, current_date + 7, 'Okara', 'open', now() - interval '1 day'),
    -- Naseem: settled last week (gives the admin tiles and history real numbers)
    ('00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000000102', 5000, 5500, 'A', 37,
     current_date - 12, current_date - 8, 'Okara', 'sold', now() - interval '14 days'),
    -- Akram: open, one pending bid
    ('00000000-0000-4000-8000-000000001004', '00000000-0000-4000-8000-000000000103', 12000, 14000, 'B', 33,
     current_date + 7, current_date + 14, 'Okara', 'open', now() - interval '2 hours');

  insert into bids (id, listing_id, wholesaler_id, price_a, price_b, price_c, collection_date, loading_paid_by,
                    note, status, created_at) values
    ('00000000-0000-4000-8000-000000002001', '00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000201',
     45, 39, 30, current_date - 1, 'buyer', null, 'accepted', now() - interval '7 days'),
    ('00000000-0000-4000-8000-000000002002', '00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000202',
     44, 40, 32, current_date - 1, 'buyer', null, 'rejected', now() - interval '7 days'),
    ('00000000-0000-4000-8000-000000002003', '00000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000000202',
     42, 37, null, current_date + 5, 'buyer', 'Can collect on day 5', 'pending', now() - interval '20 hours'),
    ('00000000-0000-4000-8000-000000002004', '00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000000202',
     44, 38, null, current_date - 8, 'buyer', null, 'accepted', now() - interval '13 days'),
    ('00000000-0000-4000-8000-000000002005', '00000000-0000-4000-8000-000000001004', '00000000-0000-4000-8000-000000000201',
     40, 36, 28, current_date + 10, 'farmer', null, 'pending', now() - interval '1 hour');

  -- Dispute scene: buyer recorded 8,000 kg as grade C (Rs 30/kg). Farmer will dispute; the reviewer rules B (Rs 39/kg).
  -- token = 10% x mid-range 8,500 kg x Rs 45 (expected grade A) = 38,250
  insert into saudas (id, listing_id, bid_id, farmer_id, wholesaler_id, terms, status, token_due_by, token_paid_at,
                      collection_code, weighed_kg, delivered_grade, buyer_note, final_amount, platform_fee, created_at) values
    ('00000000-0000-4000-8000-000000003001', '00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000002001',
     '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201',
     jsonb_build_object('price', jsonb_build_object('A', 45, 'B', 39, 'C', 30),
                        'qty_low_kg', 8000, 'qty_high_kg', 9000, 'expected_grade', 'A',
                        'collection_date', current_date - 1, 'loading_paid_by', 'buyer',
                        'fee_percent', 1, 'token_amount', 38250),
     'collected', now() - interval '7 days', now() - interval '7 days',
     '4821', 8000, 'C', 'Many small and cut tubers', 240000, 2400, now() - interval '7 days');

  -- Settled history: 5,200 kg grade A at Rs 44 = 228,800; fee 2,288; token 10% x 5,250 x 44 = 23,100
  insert into saudas (id, listing_id, bid_id, farmer_id, wholesaler_id, terms, status, token_due_by, token_paid_at,
                      collection_code, weighed_kg, delivered_grade, final_amount, platform_fee,
                      created_at, agreed_at, settled_at) values
    ('00000000-0000-4000-8000-000000003002', '00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000002004',
     '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000202',
     jsonb_build_object('price', jsonb_build_object('A', 44, 'B', 38, 'C', null),
                        'qty_low_kg', 5000, 'qty_high_kg', 5500, 'expected_grade', 'A',
                        'collection_date', current_date - 8, 'loading_paid_by', 'buyer',
                        'fee_percent', 1, 'token_amount', 23100),
     'settled', now() - interval '13 days', now() - interval '13 days',
     '1937', 5200, 'A', 228800, 2288,
     now() - interval '13 days', now() - interval '8 days', now() - interval '8 days');

  insert into sauda_events (sauda_id, actor_id, type, payload, created_at) values
    ('00000000-0000-4000-8000-000000003001', '00000000-0000-4000-8000-000000000101', 'created',   null, now() - interval '7 days'),
    ('00000000-0000-4000-8000-000000003001', '00000000-0000-4000-8000-000000000201', 'token_paid', null, now() - interval '7 days'),
    ('00000000-0000-4000-8000-000000003001', '00000000-0000-4000-8000-000000000201', 'collected',
     '{"weighed_kg": 8000, "grade": "C"}', now() - interval '1 day'),
    ('00000000-0000-4000-8000-000000003002', '00000000-0000-4000-8000-000000000102', 'created',   null, now() - interval '13 days'),
    ('00000000-0000-4000-8000-000000003002', '00000000-0000-4000-8000-000000000202', 'token_paid', null, now() - interval '13 days'),
    ('00000000-0000-4000-8000-000000003002', '00000000-0000-4000-8000-000000000202', 'collected',
     '{"weighed_kg": 5200, "grade": "A"}', now() - interval '8 days'),
    ('00000000-0000-4000-8000-000000003002', '00000000-0000-4000-8000-000000000102', 'confirmed', null, now() - interval '8 days'),
    ('00000000-0000-4000-8000-000000003002', '00000000-0000-4000-8000-000000000102', 'balance_received', null, now() - interval '8 days');
end $$;

select reset_demo();
