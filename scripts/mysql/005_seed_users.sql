-- Seed users to satisfy foreign key constraints
INSERT INTO users (id, email, password_hash, wallet_address) VALUES 
(201, 'buyer1@example.com', 'hash1', '0xBuyerA111122223333444455556666777788889999'),
(202, 'buyer2@example.com', 'hash2', '0xBuyerB111122223333444455556666777788889999'),
(203, 'buyer3@example.com', 'hash3', '0xBuyerC111122223333444455556666777788889999'),
(204, 'buyer4@example.com', 'hash4', '0xBuyerD111122223333444455556666777788889999'),
(205, 'buyer5@example.com', 'hash5', '0xBuyerE111122223333444455556666777788889999'),
(301, 'seller1@example.com', 'hash6', '0xSellerAaaaa2222bbbb3333cccc4444dddd5555'),
(302, 'seller2@example.com', 'hash7', '0xSellerBaaaa2222bbbb3333cccc4444dddd5555'),
(303, 'seller3@example.com', 'hash8', '0xSellerCaaaa2222bbbb3333cccc4444dddd5555'),
(304, 'seller4@example.com', 'hash9', '0xSellerDaaaa2222bbbb3333cccc4444dddd5555'),
(305, 'seller5@example.com', 'hash10', '0xSellerEaaaa2222bbbb3333cccc4444dddd5555');


