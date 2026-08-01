-- VoxCart MySQL Database Schema & Seed Data
-- Compatible with phpMyAdmin and standard MySQL / MariaDB installations
-- Collation set to utf8mb4_unicode_ci to support Arabic/Urdu scripts correctly

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `voxcart_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `voxcart_db`;

-- Drop tables in reverse-relationship order to prevent foreign key check failures on rerun
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `favourites`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `subcategories`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `brands`;
DROP TABLE IF EXISTS `units`;
DROP TABLE IF EXISTS `currencies`;
DROP TABLE IF EXISTS `users`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BRANDS TABLE
CREATE TABLE IF NOT EXISTS `brands` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `logo` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. UNITS TABLE
CREATE TABLE IF NOT EXISTS `units` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `name_ur` VARCHAR(100) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CURRENCIES TABLE
CREATE TABLE IF NOT EXISTS `currencies` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(10) NOT NULL UNIQUE,
  `symbol` VARCHAR(10) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `name_ur` VARCHAR(100) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. SUBCATEGORIES TABLE
CREATE TABLE IF NOT EXISTS `subcategories` (
  `id` VARCHAR(50) NOT NULL,
  `category_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `name_ur` VARCHAR(100) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `name_ur` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `img` VARCHAR(255) NOT NULL DEFAULT '📦',
  `unit` VARCHAR(50) NOT NULL DEFAULT 'item',
  `unit_ur` VARCHAR(50) NOT NULL DEFAULT 'عدد',
  `is_custom` TINYINT(1) DEFAULT 0,
  `sku` VARCHAR(100) DEFAULT NULL,
  `batch_number` VARCHAR(100) DEFAULT NULL,
  `manufacturing_date` VARCHAR(50) DEFAULT NULL,
  `expiry_date` VARCHAR(50) DEFAULT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 100,
  `description` TEXT DEFAULT NULL,
  `brand_id` VARCHAR(50) NOT NULL DEFAULT 'brand-general',
  `category_id` VARCHAR(50) NOT NULL DEFAULT 'Pantry',
  `subcategory_id` VARCHAR(50) DEFAULT NULL,
  `unit_id` VARCHAR(50) NOT NULL DEFAULT 'unit-piece',
  `currency_id` VARCHAR(50) NOT NULL DEFAULT 'curr-pkr',
  `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
  `sale_price` DECIMAL(10, 2) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`currency_id`) REFERENCES `currencies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=1;

-- 8. CART TABLE
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `product_id` INT NOT NULL,
  `qty` INT NOT NULL DEFAULT 1,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_product` (`user_id`, `product_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. FAVOURITES TABLE
CREATE TABLE IF NOT EXISTS `favourites` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `product_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_fav_user_product` (`user_id`, `product_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. ORDERS TABLE
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `user_email` VARCHAR(150) NULL,
  `items_json` LONGTEXT NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  `tax` DECIMAL(10, 2) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `status` VARCHAR(50) NOT NULL DEFAULT 'Processing',
  `payment_method` VARCHAR(50) DEFAULT 'Cash on Delivery',
  `payment_details` LONGTEXT NULL,
  `payment_status` VARCHAR(50) DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================= USER SEEDING =================
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
('usr_admin', 'Admin Manager', 'admin@voxcart.com', 'admin', 'admin'),
('usr_test', 'Guest Shopper', 'guest@voxcart.com', 'guest', 'user')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);


-- ================= BRANDS SEEDING =================
INSERT INTO `brands` (`id`, `name`, `logo`, `status`) VALUES
('brand-nestle', 'Nestlé', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&h=150&q=80', 'Active'),
('brand-national', 'National Foods', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=150&h=150&q=80', 'Active'),
('brand-pepsico', 'PepsiCo', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&h=150&q=80', 'Active'),
('brand-unilever', 'Unilever', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&h=150&q=80', 'Active'),
('brand-general', 'General Brands', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=150&h=150&q=80', 'Active')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `logo`=VALUES(`logo`), `status`=VALUES(`status`);


-- ================= UNITS SEEDING =================
INSERT INTO `units` (`id`, `name`, `name_ur`, `status`) VALUES
('unit-piece', 'Piece', 'عدد', 'Active'),
('unit-kg', 'KG', 'کلو', 'Active'),
('unit-gram', 'Gram', 'گرام', 'Active'),
('unit-liter', 'Liter', 'لیٹر', 'Active'),
('unit-ml', 'ML', 'ملی لیٹر', 'Active'),
('unit-pack', 'Pack', 'پیکٹ', 'Active'),
('unit-box', 'Box', 'ڈبہ', 'Active'),
('unit-dozen', 'Dozen', 'درجن', 'Active')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `name_ur`=VALUES(`name_ur`), `status`=VALUES(`status`);


-- ================= CURRENCIES SEEDING =================
INSERT INTO `currencies` (`id`, `name`, `code`, `symbol`, `status`) VALUES
('curr-usd', 'US Dollar', 'USD', '$', 'Active'),
('curr-eur', 'Euro', 'EUR', '€', 'Active'),
('curr-gbp', 'British Pound', 'GBP', '£', 'Active'),
('curr-pkr', 'Pakistani Rupee', 'PKR', 'Rs', 'Active'),
('curr-aed', 'UAE Dirham', 'AED', 'د.إ', 'Active')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `code`=VALUES(`code`), `symbol`=VALUES(`symbol`), `status`=VALUES(`status`);


-- ================= CATEGORIES SEEDING =================
INSERT INTO `categories` (`id`, `name`, `name_ur`, `status`) VALUES
('Dairy', 'Dairy', 'دودھ کی مصنوعات', 'Active'),
('Fruits', 'Fruits', 'پھل', 'Active'),
('Vegetables', 'Vegetables', 'سبزیاں', 'Active'),
('Meat', 'Meat', 'گوشت', 'Active'),
('Beverages', 'Beverages', 'مشروبات', 'Active'),
('Pantry', 'Pantry', 'پنساری', 'Active')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `name_ur`=VALUES(`name_ur`), `status`=VALUES(`status`);


-- ================= SUBCATEGORIES SEEDING =================
INSERT INTO `subcategories` (`id`, `category_id`, `name`, `name_ur`, `status`) VALUES
('sub-milk', 'Dairy', 'Milk', 'دودھ', 'Active'),
('sub-cheese', 'Dairy', 'Cheese', 'پنیر', 'Active'),
('sub-butter', 'Dairy', 'Butter', 'مکھن', 'Active'),
('sub-eggs', 'Dairy', 'Eggs', 'انڈے', 'Active'),
('sub-fresh-fruits', 'Fruits', 'Fresh Fruits', 'تازہ پھل', 'Active'),
('sub-citrus', 'Fruits', 'Citrus', 'کھٹے پھل', 'Active'),
('sub-fresh-vegetables', 'Vegetables', 'Fresh Vegetables', 'تازہ سبزیاں', 'Active'),
('sub-tubers', 'Vegetables', 'Root Vegetables', 'جڑ والی سبزیاں', 'Active'),
('sub-chicken', 'Meat', 'Chicken', 'مرغی', 'Active'),
('sub-beef', 'Meat', 'Beef', 'بڑا گوشت', 'Active'),
('sub-fish', 'Meat', 'Fish', 'مچھلی', 'Active'),
('sub-soft-drinks', 'Beverages', 'Soft Drinks', 'سافٹ ڈرنکس', 'Active'),
('sub-water', 'Beverages', 'Mineral Water', 'منرل واٹر', 'Active'),
('sub-tea', 'Beverages', 'Tea & Coffee', 'چائے اور کافی', 'Active'),
('sub-rice', 'Pantry', 'Rice & Grains', 'چاول اور اناج', 'Active'),
('sub-pasta', 'Pantry', 'Pasta & Noodles', 'پاستا اور نوڈلز', 'Active'),
('sub-oil', 'Pantry', 'Cooking Oil', 'ککنگ آئل', 'Active'),
('sub-spices', 'Pantry', 'Spices & Salt', 'مصالحے اور نمک', 'Active')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `name_ur`=VALUES(`name_ur`), `status`=VALUES(`status`);


-- ================= PRODUCT SEEDING =================
INSERT INTO `products` (`id`, `name`, `name_ur`, `category`, `price`, `img`, `unit`, `unit_ur`, `brand_id`, `category_id`, `subcategory_id`, `unit_id`, `currency_id`, `stock_quantity`, `description`, `sku`) VALUES
-- Dairy
(1, 'Whole Milk', 'خالص دودھ', 'Dairy', 3.99, '🥛', 'gallon', 'گیلن', 'brand-general', 'Dairy', 'sub-milk', 'unit-piece', 'curr-pkr', 115, 'Delicious fresh Whole Milk carefully selected for outstanding quality. High nutrition and perfect taste guaranteed.', 'SKU-260001'),
(2, 'Large Eggs', 'انڈے', 'Dairy', 4.29, '🥚', 'dozen', 'درجن', 'brand-general', 'Dairy', 'sub-eggs', 'unit-piece', 'curr-pkr', 90, 'Fresh grade A farm large eggs.', 'SKU-260002'),
(3, 'Cheddar Cheese', 'پنیر', 'Dairy', 5.49, '🧀', 'block', 'ٹکڑا', 'brand-general', 'Dairy', 'sub-cheese', 'unit-piece', 'curr-pkr', 75, 'Sharp and creamy yellow cheddar cheese.', 'SKU-260003'),
(4, 'Butter', 'مکھن', 'Dairy', 4.79, '🧈', 'pack', 'پیکٹ', 'brand-general', 'Dairy', 'sub-butter', 'unit-piece', 'curr-pkr', 100, 'Unsalted pure cream butter.', 'SKU-260004'),
-- Fruits
(5, 'Bananas', 'کیلے', 'Fruits', 0.69, '🍌', 'lb', 'پاؤنڈ', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-piece', 'curr-pkr', 150, 'Fresh sweet yellow bananas.', 'SKU-260005'),
(6, 'Apples', 'سیب', 'Fruits', 1.99, '🍎', 'lb', 'پاؤنڈ', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-piece', 'curr-pkr', 120, 'Crisp organic red delicious apples.', 'SKU-260006'),
(7, 'Oranges', 'مالٹے', 'Fruits', 1.49, '🍊', 'lb', 'پاؤنڈ', 'brand-general', 'Fruits', 'sub-citrus', 'unit-piece', 'curr-pkr', 110, 'Juicy and sweet navel oranges.', 'SKU-260007'),
(8, 'Mangoes', 'آم', 'Fruits', 2.49, '🥭', 'each', 'عدد', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-piece', 'curr-pkr', 85, 'Premium quality honey mangoes.', 'SKU-260008'),
-- Vegetables
(9, 'Tomatoes', 'ٹماٹر', 'Vegetables', 2.49, '🍅', 'lb', 'پاؤنڈ', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-piece', 'curr-pkr', 130, 'Plump red vine-ripened tomatoes.', 'SKU-260009'),
(10, 'Potatoes', 'آلو', 'Vegetables', 1.29, '🥔', 'lb', 'پاؤنڈ', 'brand-general', 'Vegetables', 'sub-tubers', 'unit-piece', 'curr-pkr', 200, 'All-purpose brown russet potatoes.', 'SKU-260010'),
(11, 'Onions', 'پیاز', 'Vegetables', 1.19, '🧅', 'lb', 'پاؤنڈ', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-piece', 'curr-pkr', 180, 'Crisp multi-layered yellow onions.', 'SKU-260011'),
(12, 'Carrots', 'گاجر', 'Vegetables', 1.49, '🥕', 'lb', 'پاؤنڈ', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-piece', 'curr-pkr', 140, 'Sweet and crunchy orange carrots.', 'SKU-260012'),
-- Meat & Poultry
(13, 'Chicken Breast', 'مرغی کا گوشت', 'Meat', 7.99, '🍗', 'lb', 'پاؤنڈ', 'brand-general', 'Meat', 'sub-chicken', 'unit-piece', 'curr-pkr', 65, 'Boneless skinless fresh chicken breast.', 'SKU-260013'),
(14, 'Ground Beef', 'قیمہ', 'Meat', 8.49, '🥩', 'lb', 'پاؤنڈ', 'brand-general', 'Meat', 'sub-beef', 'unit-piece', 'curr-pkr', 55, 'Extra lean premium ground beef.', 'SKU-260014'),
(15, 'Salmon Fillet', 'مچھلی کا فلیٹ', 'Meat', 12.99, '🐟', 'lb', 'پاؤنڈ', 'brand-general', 'Meat', 'sub-fish', 'unit-piece', 'curr-pkr', 40, 'Wild-caught fresh Atlantic salmon fillet.', 'SKU-260015'),
-- Beverages
(16, 'Mineral Water', 'منرل واٹر', 'Beverages', 1.99, '💧', 'bottle', 'بوتل', 'brand-general', 'Beverages', 'sub-water', 'unit-piece', 'curr-pkr', 300, 'Pure natural spring mineral water.', 'SKU-260016'),
(17, 'Coca-Cola', 'کوکاکولا', 'Beverages', 1.89, '🥤', 'bottle', 'بوتل', 'brand-general', 'Beverages', 'sub-soft-drinks', 'unit-piece', 'curr-pkr', 250, 'Original taste Coca-Cola soft drink.', 'SKU-260017'),
(18, 'Green Tea', 'سبز چائے', 'Beverages', 3.49, '🍵', 'box', 'ڈبہ', 'brand-general', 'Beverages', 'sub-tea', 'unit-piece', 'curr-pkr', 95, 'Antioxidant-rich organic green tea bags.', 'SKU-260018'),
-- Pantry & Staples
(19, 'White Rice', 'چاول', 'Pantry', 2.99, '🍚', '5lb', 'پیکٹ', 'brand-general', 'Pantry', 'sub-rice', 'unit-piece', 'curr-pkr', 120, 'Premium long-grain white basmati rice.', 'SKU-260019'),
(20, 'Pasta', 'پاستا', 'Pantry', 1.79, '🍝', 'box', 'ڈبہ', 'brand-general', 'Pantry', 'sub-pasta', 'unit-piece', 'curr-pkr', 140, 'Enriched wheat semolina elbow pasta.', 'SKU-260020'),
(21, 'Cooking Oil', 'ککنگ آئل', 'Pantry', 8.99, '🫒', 'bottle', 'بوتل', 'brand-general', 'Pantry', 'sub-oil', 'unit-piece', 'curr-pkr', 80, '100% pure extra virgin cooking olive oil.', 'SKU-260021'),
(22, 'Sugar', 'چینی', 'Pantry', 2.49, '🍬', 'lb', 'پاؤنڈ', 'brand-general', 'Pantry', 'sub-spices', 'unit-piece', 'curr-pkr', 160, 'Fine granulated white cane sugar.', 'SKU-260022'),
(23, 'Salt', 'نمک', 'Pantry', 1.29, '🧂', 'pack', 'پیکٹ', 'brand-general', 'Pantry', 'sub-spices', 'unit-piece', 'curr-pkr', 220, 'Iodized fine-grain table salt.', 'SKU-260023')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `name_ur`=VALUES(`name_ur`), `price`=VALUES(`price`);

SET FOREIGN_KEY_CHECKS = 1;
