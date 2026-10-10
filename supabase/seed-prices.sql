-- Pakka Sauda: reference prices. Owner: Workstream D (fills in real AMIS numbers on the morning of the hackathon).
-- Source: AMIS Punjab (amis.pk), potato, Lahore and Okara markets.
-- Copy source_price and source_unit EXACTLY as published, then convert to rupees per kg in price_per_kg.
--   e.g. published "4000" per "100 Kg"  ->  price_per_kg = 40.00
--   e.g. published "1600" per "40 Kg"   ->  price_per_kg = 40.00
-- Until replaced, rows say source = 'ILLUSTRATIVE' and the UI shows that word. Never present them as real.
-- Re-running this file replaces all reference prices.

delete from reference_prices;

insert into reference_prices (crop, market, price_per_kg, source, source_price, source_unit, source_date) values
  ('potato', 'Lahore', 50.00, 'ILLUSTRATIVE', null, 'REPLACE: unit as published', current_date),
  ('potato', 'Okara',  46.00, 'ILLUSTRATIVE', null, 'REPLACE: unit as published', current_date);
