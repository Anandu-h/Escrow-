-- Seed sample orders compatible with current orders schema
-- Only required fields are populated; optional fields left NULL

INSERT INTO orders (
  product_id,
  buyer_id,
  seller_id,
  buyer_wallet,
  seller_wallet,
  amount_cents,
  currency,
  status,
  progress,
  delivery_status,
  escrow_hash
) VALUES
  (101, 201, 301, '0xBuyerA111122223333444455556666777788889999', '0xSellerAaaaa2222bbbb3333cccc4444dddd5555', 12999, 'USD', 'locked', 25, 'Processing', '0xescrowA001'),
  (102, 202, 302, '0xBuyerB111122223333444455556666777788889999', '0xSellerBaaaa2222bbbb3333cccc4444dddd5555', 32999, 'USD', 'shipped', 50, 'Shipped', '0xescrowB002'),
  (103, 203, 303, '0xBuyerC111122223333444455556666777788889999', '0xSellerCaaaa2222bbbb3333cccc4444dddd5555', 8999,  'USD', 'delivered', 75, 'Delivered', '0xescrowC003'),
  (104, 204, 304, '0xBuyerD111122223333444455556666777788889999', '0xSellerDaaaa2222bbbb3333cccc4444dddd5555', 14999, 'USD', 'pending', 10, 'Pending', '0xescrowD004'),
  (105, 205, 305, '0xBuyerE111122223333444455556666777788889999', '0xSellerEaaaa2222bbbb3333cccc4444dddd5555', 6999,  'USD', 'completed', 100, 'Completed', '0xescrowE005');


