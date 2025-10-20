-- Fix delivery_status column to allow longer descriptions
USE escrow_app;

-- Update the delivery_status column to allow longer text
ALTER TABLE orders MODIFY COLUMN delivery_status TEXT;

-- Also add a proper description column for detailed product info
ALTER TABLE orders ADD COLUMN description TEXT AFTER product;
