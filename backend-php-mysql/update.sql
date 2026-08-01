-- Run this to update an existing database
ALTER TABLE `orders` 
ADD COLUMN IF NOT EXISTS `user_email` VARCHAR(150) NULL AFTER `user_id`,
ADD COLUMN IF NOT EXISTS `payment_method` VARCHAR(50) DEFAULT 'Cash on Delivery' AFTER `status`,
ADD COLUMN IF NOT EXISTS `payment_details` LONGTEXT NULL AFTER `payment_method`,
ADD COLUMN IF NOT EXISTS `payment_status` VARCHAR(50) DEFAULT 'Pending' AFTER `payment_details`;

-- Remove foreign key if it exists to allow guest checkouts
ALTER TABLE `orders` DROP FOREIGN KEY `orders_ibfk_1`;
