-- Seed sample orders for local testing
-- Safe to run multiple times if you clear the table between runs

INSERT INTO orders (
  product,
  buyer_name,
  seller_name,
  buyer_wallet,
  seller_wallet,
  amount_cents,
  currency,
  status,
  progress,
  delivery_status,
  escrow_hash,
  estimated_release_at
) VALUES
  (
    'Wireless Headphones',
    'Alice',
    'Bob',
    '0xB001111122223333444455556666777788889999',
    '0xS001AAAA2222BBBB3333CCCC4444DDDD5555EEEE',
    12999,
    'USD',
    'locked',
    25,
    'Processing',
    '0xescrowhash001',
    NOW() + INTERVAL 2 DAY
  ),
  (
    '4K Monitor 27-inch',
    'Charlie',
    'Diana',
    '0xB002111122223333444455556666777788889999',
    '0xS002AAAA2222BBBB3333CCCC4444DDDD5555EEEE',
    32999,
    'USD',
    'shipped',
    50,
    'Shipped',
    '0xescrowhash002',
    NOW() + INTERVAL 3 DAY
  ),
  (
    'Mechanical Keyboard',
    'Eve',
    'Frank',
    '0xB003111122223333444455556666777788889999',
    '0xS003AAAA2222BBBB3333CCCC4444DDDD5555EEEE',
    8999,
    'USD',
    'delivered',
    75,
    'Delivered',
    '0xescrowhash003',
    NOW() + INTERVAL 1 DAY
  ),
  (
    'USB-C Docking Station',
    'Grace',
    'Heidi',
    '0xB004111122223333444455556666777788889999',
    '0xS004AAAA2222BBBB3333CCCC4444DDDD5555EEEE',
    14999,
    'USD',
    'pending',
    10,
    'Pending',
    '0xescrowhash004',
    NOW() + INTERVAL 5 DAY
  ),
  (
    'Bluetooth Speaker',
    'Ivan',
    'Judy',
    '0xB005111122223333444455556666777788889999',
    '0xS005AAAA2222BBBB3333CCCC4444DDDD5555EEEE',
    6999,
    'USD',
    'completed',
    100,
    'Completed',
    '0xescrowhash005',
    NOW()
  );




