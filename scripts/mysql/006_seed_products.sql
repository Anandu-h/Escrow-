-- Seed minimal products required for orders FK
-- Assumes seller users with ids 301..305 already exist

INSERT INTO products (
  id,
  seller_id,
  name,
  description,
  price_cents,
  currency,
  condition_enum,
  is_active
) VALUES
  (101, 301, 'Wireless Headphones', 'Over-ear wireless headphones', 12999, 'USD', 'good', 1),
  (102, 302, '4K Monitor 27-inch', '27-inch UHD monitor', 32999, 'USD', 'good', 1),
  (103, 303, 'Mechanical Keyboard', 'RGB mechanical keyboard', 8999, 'USD', 'good', 1),
  (104, 304, 'USB-C Docking Station', 'Multiport USB-C dock', 14999, 'USD', 'good', 1),
  (105, 305, 'Bluetooth Speaker', 'Portable speaker', 6999, 'USD', 'good', 1);



