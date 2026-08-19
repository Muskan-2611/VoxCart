-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 16, 2026 at 04:23 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `voxcart_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `logo`, `status`) VALUES
('brand-adam\'s', 'Adam\'s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQExeihyCXvjloOQUipibLgx31-NFjDHNy_VzACh82LgQ&s', 'Active'),
('brand-bake-parlor', 'Bake Parlor', 'https://bakeparlor.com/wp-content/uploads/2025/03/logo-1.png', 'Active'),
('brand-general', 'General Brands', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=150&h=150&q=80', 'Active'),
('brand-gourmet', 'Gourmet', 'https://mir-s3-cdn-cf.behance.net/projects/404/0278ee201782093.Y3JvcCwxMzgwLDEwODAsMjkwLDA.jpg', 'Active'),
('brand-knor', 'Knor', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqHv74gyWVow1HgMDmh_UyU6YxfmTQu19kwyERmxEc1Q&s=10', 'Active'),
('brand-national-foods', 'National Foods', 'https://crystalpng.com/wp-content/uploads/2022/06/national-foods-logo.png', 'Active'),
('brand-nestle', 'Nestlé', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&h=150&q=80', 'Active'),
('brand-pakola', 'Pakola', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtVbpiq50DmjMjP6uitX546WpOIkMZuz0ZUKvGSjSqTA&s=10', 'Active'),
('brand-pepsico', 'PepsiCo', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&h=150&q=80', 'Active'),
('brand-tapal', 'Tapal', 'https://images.seeklogo.com/logo-png/26/2/tapal-tea-pvt-ltd-logo-png_seeklogo-262097.png', 'Active'),
('brand-unilever', 'Unilever', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLd5Pmh2eahiix0dIlLNxMPKRjeY6IvEMlR3sbS8IL3laKBcCxETRk9gc&s=10', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `name_ur` varchar(100) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `name_ur`, `status`) VALUES
('Bakery', 'Bakery', 'بیکری', 'Active'),
('Beverages', 'Beverages', 'مشروبات', 'Active'),
('Cleaning', 'Cleaning', 'صفائی کی اشیاء', 'Active'),
('Dairy', 'Dairy', 'دودھ کی مصنوعات', 'Active'),
('Frozen', 'Frozen Foods', 'منجمد اشیاء', 'Active'),
('Fruits', 'Fruits', 'پھل', 'Active'),
('Meat', 'Meat', 'گوشت', 'Active'),
('Pantry', 'Pantry', 'پنساری', 'Active'),
('Personal-Care', 'Personal Care', 'ذاتی استعمال', 'Active'),
('Seafood', 'Seafood', 'سمندری غذا', 'Active'),
('Snacks', 'Snacks', 'اسنیکس', 'Active'),
('Vegetables', 'Vegetables', 'سبزیاں', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `currencies`
--

CREATE TABLE `currencies` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(10) NOT NULL,
  `symbol` varchar(10) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `name`, `code`, `symbol`, `status`) VALUES
('curr-aed', 'UAE Dirham', 'AED', 'د.إ', 'Active'),
('curr-eur', 'Euro', 'EUR', '€', 'Active'),
('curr-gbp', 'British Pound', 'GBP', '£', 'Active'),
('curr-pkr', 'Pakistani Rupee', 'PKR', 'Rs', 'Active'),
('curr-sar', 'Saudi Riyal', 'SAR', '﷼', 'Active'),
('curr-usd', 'US Dollar', 'USD', '$', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `favourites`
--

CREATE TABLE `favourites` (
  `id` int(11) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `favourites`
--

INSERT INTO `favourites` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(57, 'usr_6a7de9341f45d', 3, '2026-08-13 16:06:01'),
(58, 'usr_6a7de9341f45d', 4, '2026-08-13 16:06:02'),
(59, 'usr_6a7de9341f45d', 5, '2026-08-13 16:06:03');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL DEFAULT 'guest',
  `user_name` varchar(100) NOT NULL DEFAULT 'Anonymous User',
  `user_email` varchar(100) NOT NULL DEFAULT 'guest@voxcart.com',
  `type` varchar(20) NOT NULL DEFAULT 'feedback',
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `rating` int(11) NOT NULL DEFAULT 5,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `admin_response` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `replied_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`id`, `user_id`, `user_name`, `user_email`, `type`, `subject`, `message`, `rating`, `status`, `admin_response`, `created_at`, `replied_at`) VALUES
('fb_4afa947382', 'usr_6a7de9341f45d', 'Mahnoor', 'itzmahnoor16@gmail.com', 'suggestion', 'list', 'improve', 5, 'Pending', NULL, '2026-08-14 12:03:16', NULL),
('fb_de32a166a4', 'usr_6a7de9341f45d', 'Mahnoor', 'itzmahnoor16@gmail.com', 'feedback', 'Website', 'The Website is amazing!', 5, 'Pending', NULL, '2026-08-13 13:07:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `user_email` varchar(150) DEFAULT NULL,
  `items_json` longtext NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `status` varchar(50) NOT NULL DEFAULT 'Processing',
  `payment_method` varchar(50) DEFAULT 'Cash on Delivery',
  `payment_details` longtext DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `user_email`, `items_json`, `subtotal`, `tax`, `total`, `currency`, `status`, `payment_method`, `payment_details`, `payment_status`, `created_at`) VALUES
('ORD-294431', 'usr_6a736931324dc', 'miral@gmail.com', '[{\"id\":405,\"name\":\"Brownies\",\"nameUr\":\"\\u0628\\u0631\\u0627\\u0624\\u0646\\u06cc\\u0632\",\"category\":\"Bakery\",\"qty\":1,\"price\":250,\"currencyCode\":\"PKR\",\"unit\":\"Piece\",\"unitUr\":\"\\u0639\\u062f\\u062f\",\"total\":250,\"img\":\"https:\\/\\/sweetrack.pk\\/cdn\\/shop\\/files\\/2_6d4e8332-ebf4-464d-9740-d1193debc3f8.jpg?v=1775986045\"}]', 0.90, 0.05, 0.95, 'USD', 'Shipped', 'Cash on Delivery', '{\"gateway\":\"Cash on Delivery Fulfilment\",\"codNotes\":\"Customer requested payment at pickup\",\"deliveryCity\":\"Karachi\"}', 'Pending', '2026-08-12 17:14:54'),
('ORD-885412', 'usr_6a7de9341f45d', 'itzmahnoor16@gmail.com', '[{\"id\":2,\"name\":\"Large Eggs\",\"nameUr\":\"\\u0627\\u0646\\u0688\\u06d2\",\"category\":\"Dairy\",\"qty\":1,\"price\":350,\"currencyCode\":\"PKR\",\"unit\":\"Dozen\",\"unitUr\":\"\\u062f\\u0631\\u062c\\u0646\",\"total\":350,\"img\":\"https:\\/\\/encrypted-tbn0.gstatic.com\\/images?q=tbn:ANd9GcT3qdhhQ_WhPFWpiAlxTxtfNIHNxPZN9zeOIwT-_Dtr5P94uz_ZuXLkLy0&s=10\"},{\"id\":3,\"name\":\"Cheddar Cheese\",\"nameUr\":\"\\u067e\\u0646\\u06cc\\u0631\",\"category\":\"Dairy\",\"qty\":1,\"price\":360,\"currencyCode\":\"PKR\",\"unit\":\"Gram\",\"unitUr\":\"\\u06af\\u0631\\u0627\\u0645\",\"total\":360,\"img\":\"https:\\/\\/freshbasket.com.pk\\/cdn\\/shop\\/files\\/Adam_s-CheddarCheese_200g_12fab69e-d2ec-40ab-9624-459371beee52.jpg?v=1721719707\"},{\"id\":1,\"name\":\"Milk\",\"nameUr\":\"\\u062e\\u0627\\u0644\\u0635 \\u062f\\u0648\\u062f\\u06be\",\"category\":\"Dairy\",\"qty\":1,\"price\":380,\"currencyCode\":\"PKR\",\"unit\":\"ML\",\"unitUr\":\"\\u0645\\u0644\\u06cc \\u0644\\u06cc\\u0679\\u0631\",\"total\":380,\"img\":\"https:\\/\\/www.metro-online.pk\\/_next\\/image?url=https%3A%2F%2Fprodimages.metro-online.pk%2FProducts%2F1741238122105.jpg&w=3840&q=75\"},{\"id\":4,\"name\":\"Butter\",\"nameUr\":\"\\u0645\\u06a9\\u06be\\u0646\",\"category\":\"Dairy\",\"qty\":1,\"price\":300,\"currencyCode\":\"PKR\",\"unit\":\"Box\",\"unitUr\":\"\\u0688\\u0628\\u06c1\",\"total\":300,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=300&q=80\"}]', 5.00, 0.25, 5.25, 'USD', 'Delivered', 'Cash on Delivery', '{\"gateway\":\"Cash on Delivery Fulfilment\",\"codNotes\":\"Customer requested payment at pickup\",\"deliveryCity\":\"Karachi\"}', 'Pending', '2026-08-13 16:06:46');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `name_ur` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `img` varchar(255) NOT NULL DEFAULT '?',
  `unit` varchar(50) NOT NULL DEFAULT 'item',
  `unit_ur` varchar(50) NOT NULL DEFAULT 'عدد',
  `is_custom` tinyint(1) DEFAULT 0,
  `sku` varchar(100) DEFAULT NULL,
  `batch_number` varchar(100) DEFAULT NULL,
  `manufacturing_date` varchar(50) DEFAULT NULL,
  `expiry_date` varchar(50) DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 100,
  `description` text DEFAULT NULL,
  `brand_id` varchar(50) NOT NULL DEFAULT 'brand-general',
  `category_id` varchar(50) NOT NULL DEFAULT 'Pantry',
  `subcategory_id` varchar(50) DEFAULT NULL,
  `unit_id` varchar(50) NOT NULL DEFAULT 'unit-piece',
  `currency_id` varchar(50) NOT NULL DEFAULT 'curr-pkr',
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `sale_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `name_ur`, `category`, `price`, `img`, `unit`, `unit_ur`, `is_custom`, `sku`, `batch_number`, `manufacturing_date`, `expiry_date`, `stock_quantity`, `description`, `brand_id`, `category_id`, `subcategory_id`, `unit_id`, `currency_id`, `status`, `sale_price`, `created_at`) VALUES
(1, 'Milk', 'خالص دودھ', 'Dairy', 380.00, 'https://www.metro-online.pk/_next/image?url=https%3A%2F%2Fprodimages.metro-online.pk%2FProducts%2F1741238122105.jpg&w=3840&q=75', 'ML', 'ملی لیٹر', 0, 'SKU-260001', '', '', '', 93, 'Delicious fresh Whole Milk carefully selected for outstanding quality. High nutrition and perfect taste guaranteed.', 'brand-nestle', 'Dairy', 'sub-milk', 'unit-ml', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(2, 'Large Eggs', 'انڈے', 'Dairy', 350.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3qdhhQ_WhPFWpiAlxTxtfNIHNxPZN9zeOIwT-_Dtr5P94uz_ZuXLkLy0&s=10', 'Dozen', 'درجن', 0, 'SKU-260002', '', '', '', 78, 'Fresh grade A farm large eggs.', 'brand-general', 'Dairy', 'sub-eggs', 'unit-dozen', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(3, 'Cheddar Cheese', 'پنیر', 'Dairy', 360.00, 'https://freshbasket.com.pk/cdn/shop/files/Adam_s-CheddarCheese_200g_12fab69e-d2ec-40ab-9624-459371beee52.jpg?v=1721719707', 'Gram', 'گرام', 0, 'SKU-260003', '', '', '', 60, 'Sharp and creamy yellow cheddar cheese.', 'brand-adam\'s', 'Dairy', 'sub-cheese', 'unit-gram', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(4, 'Butter', 'مکھن', 'Dairy', 300.00, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=300&q=80', 'Box', 'ڈبہ', 0, 'SKU-260004', '', '', '', 75, 'Unsalted pure cream butter.', 'brand-general', 'Dairy', 'sub-butter', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(5, 'Bananas', 'کیلے', 'Fruits', 180.00, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=300&q=80', 'Dozen', 'درجن', 0, 'SKU-260005', '', '', '', 140, 'Fresh sweet yellow bananas.', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-dozen', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(6, 'Apples', 'سیب', 'Fruits', 400.00, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&q=80', 'KG', 'کلو', 0, 'SKU-260006', '', '', '', 112, 'Crisp organic red delicious apples.', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(7, 'Oranges', 'مالٹے', 'Fruits', 259.98, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVTNE0jtH2yTY7sKyvFz5Bf80MeZxqm2_s4sZuW2Iz6w&s=10', 'KG', 'کلو', 0, 'SKU-260007', '', '', '', 107, 'Juicy and sweet navel oranges.', 'brand-general', 'Fruits', 'sub-citrus', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(8, 'Mangoes', 'آم', 'Fruits', 500.00, 'https://i0.wp.com/post.medicalnewstoday.com/wp-content/uploads/sites/3/2022/01/mangoes_what_to_know_1296x728_header-1024x575.jpg?w=1155&h=1528', 'KG', 'کلو', 0, 'SKU-260008', '', '', '', 68, 'Premium quality honey mangoes.', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(9, 'Tomatoes', 'ٹماٹر', 'Vegetables', 370.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-ePI6e3Z-ME6OcWMLLTnh6klR02qVKSYQvLbtn3ytpg&s=10', 'Piece', 'عدد', 0, 'SKU-260009', '', '', '', 124, 'Plump red vine-ripened tomatoes.', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(10, 'Potatoes', 'آلو', 'Vegetables', 120.00, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80', 'KG', 'کلو', 0, 'SKU-260010', '', '', '', 195, 'All-purpose brown russet potatoes.', 'brand-general', 'Vegetables', 'sub-tubers', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(11, 'Onions', 'پیاز', 'Vegetables', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoybt5elubNFLyQYXo8YuSzvswQlYFReXuirJbywfS9A&s', 'KG', 'کلو', 0, 'SKU-260011', '', '', '', 174, 'Crisp multi-layered yellow onions.', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(12, 'Carrots', 'گاجر', 'Vegetables', 240.00, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80', 'KG', 'کلو', 0, 'SKU-260012', '', '', '', 137, 'Sweet and crunchy orange carrots.', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(13, 'Chicken Breast', 'مرغی کا گوشت', 'Meat', 500.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdgBUzaHMEZyqwsuLYXfATzWhUK4J2Q5AT6ZY-cVhytebfIP0_UJ0J67US&s=10', 'KG', 'کلو', 0, 'SKU-260013', '', '', '', 61, 'Boneless skinless fresh chicken breast.', 'brand-general', 'Meat', 'sub-chicken', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(14, 'Ground Beef', 'قیمہ', 'Meat', 700.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIYD0hEXj4ys7zaw8aoT_bPvKySKWF92KFx8zUcBQZiKz6qWxdjyNckf8&s=10', 'KG', 'کلو', 0, 'SKU-260014', '', '', '', 54, 'Extra lean premium ground beef.', 'brand-general', 'Meat', 'sub-beef', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(15, 'Salmon Fillet', 'مچھلی کا فلیٹ', 'Seafood', 1800.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNqlXMnzaKoNjClw_4Ekgy6r0hS9LFUGGBlJaIgp0btqfwHPu8tF-H0awX&s=10', 'KG', 'کلو', 0, 'SKU-260015', '', '', '', 39, 'Wild-caught fresh Atlantic salmon fillet.', 'brand-general', 'Seafood', 'sub-sea-fish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(16, 'Mineral Water', 'منرل واٹر', 'Beverages', 40.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaNZdlnCDYMm1Rr-KEMCgVqtsBCPBqEeVg91Iz8Y4tBLm_VZFYPnASWbOf&s=10', 'Liter', 'لیٹر', 0, 'SKU-260016', '', '', '', 298, 'Pure natural spring mineral water.', 'brand-nestle', 'Beverages', 'sub-water', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(17, 'Coca-Cola', 'کوکاکولا', 'Beverages', 120.00, 'https://catalog.sixty60.co.za/v2/files/69e728913984fd7b28c2ca29?width=1200&height=1200', 'Liter', 'لیٹر', 0, 'SKU-260017', '', '', '', 249, 'Original taste Coca-Cola soft drink.', 'brand-pepsico', 'Beverages', 'sub-soft-drinks', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(18, 'Green Tea', 'سبز چائے', 'Beverages', 190.00, 'https://www.hkarimbuksh.com/cdn/shop/products/tapal-tea-private-limited-tapal-green-tea-moroccan-mint-30-tea-bags-6955786633345_1024x.jpg?v=1630132581', 'Box', 'ڈبہ', 0, 'SKU-260018', '', '', '', 93, 'Antioxidant-rich organic green tea bags.', 'brand-tapal', 'Beverages', 'sub-tea', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(19, 'Rice', 'چاول', 'Pantry', 200.00, 'https://m.media-amazon.com/images/I/51Qn8ypC75L._AC_UF894,1000_QL80_.jpg', 'KG', 'کلو', 0, 'SKU-260019', '', '', '', 115, 'Premium long-grain white basmati rice.', 'brand-general', 'Pantry', 'sub-rice-&-lentils', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(20, 'Pasta', 'پاستا', 'Pantry', 120.00, 'https://springs.com.pk/cdn/shop/files/1358946338572.jpg?v=1754921289', 'Pack', 'پیکٹ', 0, 'SKU-260020', '', '', '', 129, 'Enriched wheat semolina elbow pasta.', 'brand-bake-parlor', 'Pantry', 'sub-pasta', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(21, 'Cooking Oil', 'ککنگ آئل', 'Pantry', 499.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo47POCQu8UTraQABH6zzhgX-1bSMeycdGeMLKTf36yXQbk2nsJNWV490&s=10', 'KG', 'کلو', 0, 'SKU-260021', '', '', '', 65, '100% pure extra virgin cooking olive oil.', 'brand-general', 'Pantry', 'sub-oil', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(22, 'Sugar', 'چینی', 'Pantry', 300.00, 'https://irp.cdn-website.com/cbf48001/dms3rep/multi/shutterstock_2463705563.jpg', 'KG', 'کلو', 0, 'SKU-260022', '', '', '', 157, 'Fine granulated white cane sugar.', 'brand-general', 'Pantry', 'sub-spices', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(23, 'Salt', 'نمک', 'Pantry', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzc8QcvqvnBGXbU8fmu0z0lH7qaLhwj4QqHucBxOs8hw7rleELu_oGv6MK&s=10', 'Pack', 'پیکٹ', 0, 'SKU-260023', '', '', '', 218, 'Iodized fine-grain table salt.', 'brand-national-foods', 'Pantry', 'sub-spices', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-10 17:17:17'),
(27, 'Pepsi', 'پیپسی', 'Beverages', 179.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjmMcy6lEqzfSvqbWZ8g4WLqqN6Gx3hwfNLy1hwmZvVUwR8DPTgpmiQQHJ&s=10', 'Liter', 'لیٹر', 1, '260024', '', '', '', 99, '', 'brand-pepsico', 'Beverages', 'sub-soft-drinks', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-11 05:32:59'),
(30, 'Big Apple', 'بگ ایپل', 'Beverages', 879.99, 'https://afzalwholesaler.com/cdn/shop/files/big-apple-1.5.jpg?v=1705984053', 'Liter', 'لیٹر', 1, '260026', '', '', '', 99, '', 'brand-general', 'Beverages', 'sub-soft-drinks', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-11 06:28:37'),
(31, 'Mozzarella cheese', 'موزریلا پنیر', 'Dairy', 685.00, 'https://freshbasket.com.pk/cdn/shop/files/Adams-MozzarellaCheese_200g.jpg?v=1721719732', 'Box', 'ڈبہ', 1, '260027', '', '', '', 100, '', 'brand-adam\'s', 'Dairy', 'sub-cheese', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-11 06:31:07'),
(32, 'Grape Fruit', 'گریپ فروٹ', 'Fruits', 300.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhQ41mCNU9Tzcc3hiogFqGzj3fTjrBPBn3qgcWoj0kcQLAoSRNCwD8hHQk7v2GVIetmIODOBaBDCR7q7xNi6YHXMHBTZAoH83GoAY-rlA&s', 'KG', 'کلو', 1, '260028', '', '', '', 95, '', 'brand-general', 'Fruits', 'sub-citrus', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-11 06:33:18'),
(33, 'Limes', 'لائم (سبز لیموں)', 'Fruits', 200.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi1i6d1nc9HQZejOcnob_UE2nFeWrojqzxgpq5aocZsQ&s=10', 'KG', 'کلو', 1, '260029', '', '', '', 98, '', 'brand-general', 'Fruits', 'sub-citrus', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-11 06:34:48'),
(34, 'Grapes', 'انگور', 'Fruits', 220.01, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYmYeRcIpIrvN4qU7j8QXalrVJenaRs4AeHFeTgfWlCcoe3o7YgirNPObk&s=10', 'KG', 'کلو', 1, '260030', '', '', '', 98, '', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-11 06:36:43'),
(35, 'Watermelon', 'تربوز', 'Fruits', 200.01, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl3-c9VMLsIWyRB21G8BgTivnrUKNCy16o309OWqPVzeoqN4Or7j1T6z-R&s=10', 'KG', 'کلو', 1, '260031', '', '', '', 98, '', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-11 06:37:32'),
(36, 'Cherry', 'چیری', 'Fruits', 400.02, 'https://www.tasteofhome.com/wp-content/uploads/2017/07/cherries.jpg?fit=680%2C453', 'Pack', 'پیکٹ', 1, '260032', '', '', '', 299, '', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-11 06:39:12'),
(37, 'Beef', 'گائے کا گوشت', 'Meat', 900.00, 'https://cdn.britannica.com/68/143268-050-917048EA/Beef-loin.jpg', 'KG', 'کلو', 1, '260033', '', '', '', 97, '', 'brand-general', 'Meat', 'sub-beef', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-11 06:40:41'),
(39, 'Noodles', 'نوڈلز', 'Pantry', 190.00, 'https://arysahulatbazar.pk/wp-content/uploads/2024/05/8961014033861-1.webp', 'Box', 'ڈبہ', 1, '260034', '', '', '', 100, '', 'brand-knor', 'Pantry', 'sub-pasta', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-11 06:45:28'),
(40, 'Spghattei', 'سپگیٹی', 'Pantry', 120.00, 'https://media.naheed.pk/catalog/product/cache/2f2d0cb0c5f92580479e8350be94f387/1/0/1019339-1.jpg', 'Pack', 'پیکٹ', 1, '260035', '', '', '', 100, '', 'brand-bake-parlor', 'Pantry', 'sub-pasta', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-11 06:47:08'),
(41, 'Red lentil', 'سرخ مسور کی دال', 'Pantry', 100.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEhaVv-JWIT1dnAM5EELFTjGdIxkBp3hGGeZcocI-z_g&s=10', 'KG', 'کلو', 1, '260036', '', '', '', 100, '', 'brand-general', 'Pantry', 'sub-rice-&-lentils', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-11 06:51:46'),
(42, 'Brown lentil', 'بھوری مسور کی دال', 'Pantry', 119.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAwuw-4OB1XZa9q9Q0IskRhNA9oMXRd5g5PXpEnBUsnA&s=10', 'KG', 'کلو', 1, '260037', '', '', '', 100, '', 'brand-general', 'Pantry', 'sub-rice-&-lentils', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-11 06:53:30'),
(43, 'Yellow Lentil', 'پیلی دال', 'Pantry', 150.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjsTSEMr9fm_q1DUPHiWYjit-acAaqQqqcy5vRp9S-7KmMFoTLNTrAWfN2&s=10', 'KG', 'کلو', 1, '260038', '', '', '', 100, '', 'brand-general', 'Pantry', 'sub-rice-&-lentils', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-11 06:54:40'),
(44, 'Chilli Powder', 'سرخ مرچ کا پاؤڈر', 'Pantry', 210.00, 'https://www.hkarimbuksh.com/cdn/shop/products/national-foods-limited-national-chilli-powder-100g-6954209706113_1800x.jpg?v=1629530468', 'Box', 'ڈبہ', 1, '260039', '', '', '', 1120, '', 'brand-national-foods', 'Pantry', 'sub-spices', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-11 06:57:07'),
(45, 'Black Pepper Powder', 'کالی مرچ کا پاؤڈر', 'Pantry', 280.01, 'https://www.hkarimbuksh.com/cdn/shop/products/national-foods-limited-national-black-pepper-powder-50g-6953393488001_1800x.jpg?v=1629530469', 'Box', 'ڈبہ', 1, '260040', '', '', '', 97, '', 'brand-national-foods', 'Pantry', 'sub-spices', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-11 06:58:27'),
(49, 'Yoghurt', 'دہی', 'Dairy', 275.00, 'https://pictures.grocerapps.com/lgthumb/grocerapp-nestle-original-yogurt-sweet--6597ced0e26b7.png', 'Gram', 'گرام', 1, '260041', '', '', '', 128, '', 'brand-nestle', 'Dairy', 'sub-yoghurt', 'unit-gram', 'curr-pkr', 'Active', NULL, '2026-07-12 16:31:15'),
(50, 'Apricots', 'خوبانی', 'Fruits', 300.00, 'https://www.froghollow.com/cdn/shop/products/apache-apricots-3lb_300x300.jpg?v=1678994078', 'Gram', 'گرام', 1, '260042', '', '', '', 199, '', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-gram', 'curr-pkr', 'Active', NULL, '2026-07-19 15:45:24'),
(51, 'Prawns', 'جھینگے', 'Seafood', 4000.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRL4GUIT9T4HQs98n9XtUnyDXPIjEguNlJd796-Xy_RCLsVr-hDjILxq2ih&s=10', 'KG', 'کلو', 1, '260043', '', '', '', 120, '', 'brand-general', 'Seafood', NULL, 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-23 14:34:40'),
(52, 'Pakola', 'پاکولا', 'Beverages', 170.00, 'https://foodpanda.dhmedia.io/image/nv/Pakistan/shops/IoJoIPof.jpeg?height=480', 'Liter', 'لیٹر', 1, '260045', '', '', '', 100, '', 'brand-pakola', 'Beverages', 'sub-soft-drinks', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-23 17:42:09'),
(53, 'Gourmet Cola', 'گورمے کولا', 'Beverages', 130.00, 'https://foodpanda.dhmedia.io/image/darkstores/nv-global-catalog/pk/6358bc04-71ee-438a-bdb0-10533c29a881.jpg?height=480', 'Box', 'ڈبہ', 1, '260046', '', '', '', 300, '', 'brand-gourmet', 'Beverages', 'sub-soft-drinks', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-23 17:44:58'),
(55, 'Golden Apple', 'گولڈن سیب', 'Fruits', 520.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4tAQ7LzFd5eZb6zCRXlrqqofpx-IrMKPOebBOXikrhw&s=10', 'KG', 'کلو', 1, '260055', '', '', '', 70, 'Sweet golden apples', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:51:57'),
(57, 'Mango Chaunsa', 'چونسہ آم', 'Fruits', 600.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmPuJhtLHx65M0avRN_sFPyxBXbZUsq_Kq76uXwDBmNQ&s=10', 'KG', 'کلو', 1, '260057', '', '', '', 90, 'Sweet Pakistani Chaunsa mangoes', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:51:57'),
(58, 'Mango Sindhri', 'سندھڑی آم', 'Fruits', 450.00, 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260058', '', '', '', 85, 'Fresh Sindhri mangoes', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:51:57'),
(61, 'Pomegranate', 'انار', 'Fruits', 500.00, 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260061', '', '', '', 60, 'Fresh juicy pomegranates', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:51:57'),
(62, 'Guava', 'امرود', 'Fruits', 180.00, 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260062', '', '', '', 90, 'Fresh green guava', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:51:57'),
(64, 'Pear', 'ناشپاتی', 'Fruits', 380.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTApQz47zWZUa8AMtkEYFWcGq_1VM--_Nqgz2ZVLNOxjw&s=10', 'KG', 'کلو', 1, '260064', '', '', '', 85, 'Fresh sweet pears', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(65, 'Peach', 'آڑو', 'Fruits', 420.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEnkUxQGfTK1Ez_cuYifue6zVxs1Zx6zZYwNs-uxl8TA&s=10', 'KG', 'کلو', 1, '260065', '', '', '', 70, 'Fresh juicy peaches', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(66, 'Plum', 'آلو بخارا', 'Fruits', 450.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2vW2RsfrgU2EJVPJ2qmvg4GElDwSHUrrgexXLAGGv8w&s=10', 'KG', 'کلو', 1, '260066', '', '', '', 65, 'Fresh sweet plums', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(67, 'Strawberry', 'اسٹرابیری', 'Fruits', 700.00, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=500&q=80', 'Box', 'ڈبہ', 1, '260067', '', '', '', 45, 'Fresh strawberries', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(69, 'Kiwi', 'کیوی', 'Fruits', 800.00, 'https://images.unsplash.com/photo-1585059895524-72359e06133a?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260069', '', '', '', 50, 'Fresh imported kiwi', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(70, 'Pineapple', 'انناس', 'Fruits', 350.00, 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=500&q=80', 'Piece', 'عدد', 1, '260070', '', '', '', 35, 'Fresh pineapple', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(71, 'Papaya', 'پپیتا', 'Fruits', 220.00, 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260071', '', '', '', 60, 'Fresh ripe papaya', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(72, 'Coconut', 'ناریل', 'Fruits', 300.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSK5JTDB9IdcTz_yZhGWj3Dg7Slxs6-K-3ZlGkO0MYcw&s', 'Piece', 'عدد', 1, '260072', '', '', '', 54, 'Fresh coconut', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(73, 'Lemon', 'لیموں', 'Fruits', 200.00, 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260073', '', '', '', 130, 'Fresh lemons', 'brand-general', 'Fruits', 'sub-citrus', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(74, 'Avocado', 'ایووکاڈو', 'Fruits', 950.00, 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260074', '', '', '', 30, 'Fresh avocado', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(75, 'Dragon Fruit', 'ڈریگن فروٹ', 'Fruits', 1200.00, 'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260075', '', '', '', 25, 'Premium dragon fruit', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(76, 'Melon', 'خربوزہ', 'Fruits', 180.00, 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260076', '', '', '', 90, 'Fresh sweet melon', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(77, 'Fig', 'انجیر', 'Fruits', 1500.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgF_TrRdLC0Tdw4Q9rKXU6dnZRB2lD_0Fq05A_Bd-veA&s=10', 'KG', 'کلو', 1, '260077', '', '', '', 20, 'Premium figs', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(78, 'Dates', 'کھجور', 'Fruits', 700.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwGpKhRqVKSdrPnA4lenjSx6d5zpv6z8XGpCeBc96g6w&s=10', 'KG', 'کلو', 1, '260078', '', '', '', 80, 'Fresh dates', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(79, 'Black Grapes', 'کالے انگور', 'Fruits', 500.00, 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260079', '', '', '', 65, 'Fresh black grapes', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(80, 'Mandarin', 'مالٹا', 'Fruits', 280.00, 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260080', '', '', '', 95, 'Sweet mandarin oranges', 'brand-general', 'Fruits', 'sub-citrus', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(81, 'Grapefruit', 'گریپ فروٹ', 'Fruits', 350.00, 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260081', '', '', '', 45, 'Fresh grapefruit', 'brand-general', 'Fruits', 'sub-citrus', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(82, 'Lychee', 'لیچی', 'Fruits', 650.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOk4aNxoWxR7kxtxIPCDmQd6c8TdUTWpLJIEw2rp15Zg&s=10', 'KG', 'کلو', 1, '260082', '', '', '', 40, 'Fresh lychee', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:20'),
(85, 'Red Onion', 'سرخ پیاز', 'Vegetables', 180.00, 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260085', '', '', '', 178, 'Fresh red onions', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:49'),
(87, 'Garlic', 'لہسن', 'Vegetables', 600.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCkiyaoUlh0omiKwkXqiPIZCL2Ja59aROe89S3yc8TWA&s=10', 'KG', 'کلو', 1, '260087', '', '', '', 69, 'Fresh garlic cloves', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:49'),
(88, 'Ginger', 'ادرک', 'Vegetables', 500.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNeWHzYUV6wE7AzAEi-4zBfW_rqiNc8LGJUd0dhNJN1g&s=10', 'KG', 'کلو', 1, '260088', '', '', '', 64, 'Fresh ginger root', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:49'),
(89, 'Green Chili', 'ہری مرچ', 'Vegetables', 220.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrd-DGj3975hzWpch6UL03y2oW1AB0UB17KhfqSSC2xg&s=10', 'KG', 'کلو', 1, '260089', '', '', '', 89, 'Fresh green chilies', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:49'),
(91, 'Cucumber', 'کھیرا', 'Vegetables', 180.00, 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260091', '', '', '', 100, 'Fresh cucumbers', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:49'),
(92, 'Capsicum Green', 'سبز شملہ مرچ', 'Vegetables', 350.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQWJ02NxqnvVszIxQabUdo8q785rHAQBZqsNm0mF8Cbw&s=10', 'KG', 'کلو', 1, '260092', '', '', '', 80, 'Fresh green capsicum', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:49'),
(93, 'Spinach', 'پالک', 'Vegetables', 120.00, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260093', '', '', '', 90, 'Fresh spinach leaves', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:49'),
(94, 'Cabbage', 'بند گوبھی', 'Vegetables', 150.00, 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260094', '', '', '', 85, 'Fresh cabbage', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:49'),
(95, 'Cauliflower', 'پھول گوبھی', 'Vegetables', 200.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI6QHFNF_EYrwEG0MfWsJsx8f2idnaa9lyljjpA_8ltg&s=10', 'KG', 'کلو', 1, '260095', '', '', '', 70, 'Fresh cauliflower', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:49'),
(96, 'Peas', 'مٹر', 'Vegetables', 350.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrhGbEjlhB_lMLE5EmTD9yDvms7g2aRAjxBT7XVPJ49A&s=10', 'KG', 'کلو', 1, '260096', '', '', '', 75, 'Fresh green peas', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:49'),
(97, 'Broccoli', 'بروکلی', 'Vegetables', 450.00, 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260097', '', '', '', 45, 'Fresh broccoli', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:49'),
(98, 'Eggplant', 'بینگن', 'Vegetables', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaFJ-U-BY_uyrY--I5waQ2ag4p1wnU9_EQswGBGv1mhA&s=10', 'KG', 'کلو', 1, '260098', '', '', '', 95, 'Fresh eggplants', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:52:49'),
(99, 'Lady Finger', 'بھنڈی', 'Vegetables', 260.00, 'https://healthwire.pk/wp-content/uploads/2022/03/lady-finger-benefits-840x480.jpg', 'KG', 'کلو', 1, '260099', '', '', '', 85, 'Fresh green lady finger', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(100, 'Pumpkin', 'کدو', 'Vegetables', 160.00, 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260100', '', '', '', 70, 'Fresh pumpkin', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(101, 'Bitter Gourd', 'کریلا', 'Vegetables', 280.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq7DHAWPphpbcUnXwlZEFgsKnruAPhhtdlCRNbVZYqkA&s=10', 'KG', 'کلو', 1, '260101', '', '', '', 60, 'Fresh bitter gourd', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(102, 'Bottle Gourd', 'لوکی', 'Vegetables', 150.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBCy7W5osxH1a1V39nOMCLr33SlHyTb2Tf2uEfzFXzfQ&s=10', 'KG', 'کلو', 1, '260102', '', '', '', 80, 'Fresh bottle gourd', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(103, 'Ridge Gourd', 'تورئی', 'Vegetables', 170.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsEdPkFnlDwKSigGB2Kx6KPWuLbk1-91SkM_hBDW8OmA&s=10', 'KG', 'کلو', 1, '260103', '', '', '', 65, 'Fresh ridge gourd', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(104, 'Radish', 'مولی', 'Vegetables', 140.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNKcFIGgxk_zWwF-JGgdRq3dmxghbKdFmk5cBul8IS3Q&s=10', 'KG', 'کلو', 1, '260104', '', '', '', 90, 'Fresh white radish', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(105, 'Turnip', 'شلجم', 'Vegetables', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStw6wVH9l_03RL71pTLcpv1dvnlXW0cqfwBxLvsDZ1vw&s=10', 'KG', 'کلو', 1, '260105', '', '', '', 75, 'Fresh turnips', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(107, 'Corn', 'مکئی', 'Vegetables', 180.00, 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=500&q=80', 'Piece', 'عدد', 1, '260107', '', '', '', 100, 'Fresh corn', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(108, 'Mushroom', 'مشروم', 'Vegetables', 900.00, 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260108', '', '', '', 30, 'Fresh mushrooms', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(109, 'Lettuce', 'سلاد پتہ', 'Vegetables', 250.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfgEkVASYHy7KrmuMmaRDa5uj8YNOWnbGqBKsHMbcH3w&s=10', 'KG', 'کلو', 1, '260109', '', '', '', 45, 'Fresh lettuce leaves', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(113, 'Red Capsicum', 'سرخ شملہ مرچ', 'Vegetables', 500.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgSuS9f25Ojd9Uqb1Lu3_U6oS8L3fY6jIoTODYlk5e2g&s=10', 'KG', 'کلو', 1, '260113', '', '', '', 35, 'Fresh red capsicum', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(114, 'Yellow Capsicum', 'پیلی شملہ مرچ', 'Vegetables', 500.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnwQfXsghhY69Zsn8dfAJObzEviHIbA7dCGW7rd6AOgg&s=10', 'KG', 'کلو', 1, '260114', '', '', '', 35, 'Fresh yellow capsicum', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(115, 'Spring Onion', 'ہرا پیاز', 'Vegetables', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE62xwGf3lRZzD7AAZNJj8T4ItAKC82q4f9J5OrhF83Q&s=10', 'KG', 'کلو', 1, '260115', '', '', '', 60, 'Fresh spring onions', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(117, 'Beetroot', 'چقندر', 'Vegetables', 250.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSU8Q39Np56besJp2SgVwTvB57Wc2KH9C2MsFXc7EhySg&s=10', 'KG', 'کلو', 1, '260117', '', '', '', 50, 'Fresh beetroot', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:53:07'),
(122, 'Chocolate Milk', 'چاکلیٹ دودھ', 'Dairy', 250.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ9yh1aYLSAv9IRCxyj1A2KzfQb3I2FHZg1Lh9Aypmog&s', 'ML', 'ملی لیٹر', 1, '260122', '', '', '', 90, 'Chocolate flavored milk', 'brand-nestle', 'Dairy', 'sub-milk', 'unit-ml', 'curr-pkr', 'Active', NULL, '2026-07-24 14:55:42'),
(123, 'Strawberry Milk', 'اسٹرابیری دودھ', 'Dairy', 250.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwjxIVd-9ViBi6IqTPvIolRJkbeRua1PdVCIij-49qYw&s=10', 'ML', 'ملی لیٹر', 1, '260123', '', '', '', 80, 'Strawberry flavored milk', 'brand-nestle', 'Dairy', 'sub-milk', 'unit-ml', 'curr-pkr', 'Active', NULL, '2026-07-24 14:55:42'),
(126, 'Greek Yogurt', 'یونانی دہی', 'Dairy', 450.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFfvbk88l1PuhaA8k8ZaT-77vMTcu_gTKFXhm9qlt4-w&s=10', 'Box', 'ڈبہ', 1, '260126', '', '', '', 50, 'Premium Greek yogurt', 'brand-nestle', 'Dairy', 'sub-yoghurt', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 14:55:42'),
(129, 'Cream Cheese', 'کریم پنیر', 'Dairy', 500.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgBsqJYBbEV5rw8p0vzsngY1vgudEz89Lnng9hNzaXjg&s=10', 'Box', 'ڈبہ', 1, '260129', '', '', '', 40, 'Soft cream cheese', 'brand-general', 'Dairy', 'sub-cheese', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 14:55:42'),
(131, 'Salted Butter', 'نمکین مکھن', 'Dairy', 380.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyXZ93pKin3L2HweSCXb0BWv5lo6gwwc72S6KS_8Bv-Q&s=10', 'Box', 'ڈبہ', 1, '260131', '', '', '', 80, 'Salted creamy butter', 'brand-adam\'s', 'Dairy', 'sub-butter', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 14:55:42'),
(132, 'Fresh Cream', 'تازہ کریم', 'Dairy', 300.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQINQqmeW4omuLbf9DxpPhKld1qg9tCzdSb71ZGuYSIoQ&s=10', 'ML', 'ملی لیٹر', 1, '260132', '', '', '', 70, 'Fresh dairy cream', 'brand-nestle', 'Dairy', 'sub-milk', 'unit-ml', 'curr-pkr', 'Active', NULL, '2026-07-24 14:55:42'),
(136, 'Paneer', 'پنیربلاک', 'Dairy', 600.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRw5Sgx_rTa-1xh5TG8DqMzb0Qo5NzlBmzqzNdSOdz-P6IqxSOXQKfh-xke&s=10', 'KG', 'کلو', 1, '260136', '', '', '', 50, 'Fresh paneer cheese', 'brand-adam\'s', 'Dairy', 'sub-cheese', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:55:42'),
(141, 'Red Apple', 'سرخ سیب', 'Fruits', 450.00, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260141', '', '', '', 120, 'Fresh red apples', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:56:24'),
(147, 'Kinnow', 'کینو', 'Fruits', 280.00, 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260147', '', '', '', 130, 'Fresh Pakistani kinnow', 'brand-general', 'Fruits', 'sub-citrus', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 14:56:24'),
(167, 'Blueberry', 'بلیو بیری', 'Fruits', 1500.00, 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=500&q=80', 'Pack', 'پیکٹ', 1, '260167', '', '', '', 30, 'Fresh blueberries', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 14:57:34'),
(168, 'Raspberry', 'راسبیری', 'Fruits', 1300.00, 'https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?auto=format&fit=crop&w=500&q=80', 'Pack', 'پیکٹ', 1, '260168', '', '', '', 25, 'Fresh raspberries', 'brand-general', 'Fruits', 'sub-fresh-fruits', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 14:57:34'),
(189, 'Turnip', 'شلجم', 'Vegetables', 150.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStw6wVH9l_03RL71pTLcpv1dvnlXW0cqfwBxLvsDZ1vw&s=10', 'KG', 'کلو', 1, '260189', '', '', '', 80, 'Fresh turnips', 'brand-general', 'Vegetables', 'sub-tubers', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:01:58'),
(191, 'Pumpkin', 'کدو', 'Vegetables', 180.00, 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260191', '', '', '', 100, 'Fresh pumpkin', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:01:58'),
(196, 'Mint Leaves', 'پودینہ', 'Vegetables', 80.00, 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=500&q=80', 'Bundle', 'گڈی', 1, '260196', '', '', '', 100, 'Fresh mint leaves', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:01:58'),
(197, 'Green Beans', 'سبز پھلیاں', 'Vegetables', 350.00, 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=500&q=80', 'KG', 'کلو', 1, '260197', '', '', '', 80, 'Fresh green beans', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:01:58'),
(198, 'Zucchini', 'زچینی', 'Vegetables', 300.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcyIv2f5G_kpG5x2H8AMMgrtVqS8PzV4Bmss4RYXjmrg&s=10', 'KG', 'کلو', 1, '260198', '', '', '', 60, 'Fresh zucchini', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:01:58'),
(199, 'Celery', 'سیلری', 'Vegetables', 400.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdp7ESNR-Ve_JBRTDq6_DwpTS6XE4gaxCCXV3cBklPSA&s=10', 'Piece', 'عدد', 1, '260199', '', '', '', 45, 'Fresh celery', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:01:58'),
(201, 'Chicken Wings', 'مرغی کے پر', 'Meat', 750.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5dp2kqLfnjs1PH-_V3oPho3yHtPbAo9i0ig4JCfKmgg&s=10', 'KG', 'کلو', 1, '260201', '', '', '', 70, 'Fresh chicken wings', 'brand-general', 'Meat', 'sub-chicken', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:04:22'),
(202, 'Chicken Leg', 'مرغی کی ٹانگ', 'Meat', 700.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVoYBtUKl000Is4XXFj2v2enQouh1qce1SQqcY68RxDQ&s=10', 'KG', 'کلو', 1, '260202', '', '', '', 75, 'Fresh chicken legs', 'brand-general', 'Meat', 'sub-chicken', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:04:22'),
(203, 'Chicken Boneless', 'بون لیس مرغی', 'Meat', 900.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZMZnYDyvGUt7GZZCY4v2iTrgurDmRY0Y-wMdhqikihg&s=10', 'KG', 'کلو', 1, '260203', '', '', '', 60, 'Boneless chicken meat', 'brand-general', 'Meat', 'sub-chicken', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:04:22'),
(205, 'Beef Steak', 'بیف اسٹیک', 'Meat', 1200.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgGFjmWJxQIAy3XbiCfFjO1MYbGyFgyZUqoh-Uu8Jc1Q&s=10', 'KG', 'کلو', 1, '260205', '', '', '', 40, 'Premium beef steak', 'brand-general', 'Meat', 'sub-beef', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:04:22'),
(207, 'Beef Cubes', 'بیف کیوبز', 'Meat', 1100.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtcRmDg587KkTWRtc0f6qoimSUZyajozU-LOTwTHczXw&s=10', 'KG', 'کلو', 1, '260207', '', '', '', 45, 'Fresh beef cubes', 'brand-general', 'Meat', 'sub-beef', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:04:22'),
(208, 'Mutton Curry Cut', 'بکرے کا گوشت', 'Meat', 1600.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKQfY1Hq8bvE9d-iP_jH0NZeHslRbNE4zk_0KQfO3n5A&s=10', 'KG', 'کلو', 1, '260208', '', '', '', 35, 'Fresh mutton curry cut', 'brand-general', 'Meat', 'sub-mutton', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:04:22'),
(209, 'Mutton Chops', 'مٹن چاپس', 'Meat', 1800.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPr_v1PtH3gLiCB8niIiyIcjBYPtXIGCtxnsl5Eu-QeQ&s=10', 'KG', 'کلو', 1, '260209', '', '', '', 30, 'Premium mutton chops', 'brand-general', 'Meat', 'sub-mutton', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:04:22'),
(211, 'Chicken Sausages', 'چکن ساسیج', 'Meat', 450.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZU21wdgEF_dbMLOS0rf9cZh8dlai1U2ZEoBGo9zBYug&s=10', 'Pack', 'پیکٹ', 1, '260211', '', '', '', 90, 'Chicken sausages pack', 'brand-general', 'Meat', 'sub-beef', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:04:22'),
(214, 'Chicken Liver', 'کلیجی', 'Meat', 600.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTudUBg7Bd2-9zdQICcy3-VKje8lHdlBuAQ7LLB_n2rgQ&s=10', 'KG', 'کلو', 1, '260214', '', '', '', 40, 'Fresh chicken liver', 'brand-general', 'Meat', 'sub-chicken', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:04:49'),
(217, 'Beef Ribs', 'بیف پسلیاں', 'Meat', 1500.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQsTPe85AqhU_t3N2Ky2ORUs596M1XgjSlDm8sW_iKPA&s=10', 'KG', 'کلو', 1, '260217', '', '', '', 35, 'Fresh beef ribs', 'brand-general', 'Meat', 'sub-beef', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:04:49'),
(219, 'Mutton Keema', 'مٹن قیمہ', 'Meat', 1700.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcST6Z5QIWJUYCBqj1jg4cotOLnq99DBHA1EkJUJTpvUHw&s=10', 'KG', 'کلو', 1, '260219', '', '', '', 30, 'Fresh mutton mince', 'brand-general', 'Meat', 'sub-mutton', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:04:49'),
(220, 'Frozen Chicken Burger Patty', 'چکن برگر پیٹی', 'Frozen', 500.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShafFcX4Qhkn8720roQG6ce4MiZVdGhFqTjrNfYFoxcg&s=10', 'Pack', 'پیکٹ', 1, '260220', '', '', '', 80, 'Frozen chicken burger patties', 'brand-general', 'Frozen', 'sub-frozen-food', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:04:49'),
(225, 'Rohu Fish', 'روہو مچھلی', 'Seafood', 650.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTz1e_lCp7Wb7RoSP4a1kOBcsL_k3wqxXztOt4z0jpHfQ&s=10', 'KG', 'کلو', 1, '260225', '', '', '', 80, 'Fresh Rohu fish', 'brand-general', 'Seafood', 'sub-sea-fish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:11'),
(226, 'Pomfret Fish', 'پاپلیٹ مچھلی', 'Seafood', 1800.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGOOAApXVrQisL3RzDNcPpKkG0-H6m-cuw8LfwiyaqFQ&s=10', 'KG', 'کلو', 1, '260226', '', '', '', 50, 'Premium pomfret fish', 'brand-general', 'Seafood', 'sub-sea-fish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:11'),
(227, 'Tuna Fish', 'ٹونا مچھلی', 'Seafood', 2200.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrigywk3XoILbqoHbJ2Pbm46EthrrujwRag6Y429Xfdg&s=10', 'KG', 'کلو', 1, '260227', '', '', '', 40, 'Fresh tuna fish', 'brand-general', 'Seafood', 'sub-sea-fish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:11'),
(229, 'Tilapia Fish', 'تلپیا مچھلی', 'Seafood', 700.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToeTyvvK6F2bp-2_tXGAVpN9W6t1kuL2rhNqwaoTH-8Q&s=10', 'KG', 'کلو', 1, '260229', '', '', '', 70, 'Fresh tilapia fish', 'brand-general', 'Seafood', 'sub-sea-fish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:11'),
(230, 'Mackerel Fish', 'میکرل مچھلی', 'Seafood', 900.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT441YmgdmfO2i5HEF87dAfLIQ6igFy_u2yklptGPnUEg&s=10', 'KG', 'کلو', 1, '260230', '', '', '', 45, 'Fresh mackerel', 'brand-general', 'Seafood', 'sub-sea-fish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:11'),
(231, 'Prawns Large', 'بڑے جھینگے', 'Seafood', 4200.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmVu8h3ctWfgpNOkmflwF_6BXdSDOeuAm4uoE4gu2-7g&s=10', 'KG', 'کلو', 1, '260231', '', '', '', 30, 'Large fresh prawns', 'brand-general', 'Seafood', 'sub-shellfish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:11'),
(232, 'Prawns Small', 'چھوٹے جھینگے', 'Seafood', 2800.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIYHYSONrgmvy9xSG8OimRXEsicpTbIeLEthjwaRDiRQ&s=10', 'KG', 'کلو', 1, '260232', '', '', '', 50, 'Fresh small prawns', 'brand-general', 'Seafood', 'sub-shellfish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:11'),
(233, 'King Prawns', 'کنگ جھینگے', 'Seafood', 5000.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQg2OZmsKVQ42F3E4dWnvYtiIkf_iWFjulPxxgkMPCV9Q&s=10', 'KG', 'کلو', 1, '260233', '', '', '', 25, 'Premium king prawns', 'brand-general', 'Seafood', 'sub-shellfish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:11'),
(234, 'Crab', 'کیکڑا', 'Seafood', 3000.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgpRZc28nuLx_kR7j3FMig32BOfjKNsVpHTAtQyiDYcg&s=10', 'KG', 'کلو', 1, '260234', '', '', '', 20, 'Fresh crab seafood', 'brand-general', 'Seafood', 'sub-shellfish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:11'),
(235, 'Squid', 'اسکوئڈ', 'Seafood', 2500.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVBf6JbWc67NC6Ua-7-Ij0zuBVlxNmRnNEVgRtRzrPww&s=10', 'KG', 'کلو', 1, '260235', '', '', '', 35, 'Fresh squid', 'brand-general', 'Seafood', 'sub-shellfish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:11'),
(236, 'Fish Fillet', 'مچھلی فلیٹ', 'Seafood', 1600.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToeTyvvK6F2bp-2_tXGAVpN9W6t1kuL2rhNqwaoTH-8Q&s=10', 'KG', 'کلو', 1, '260236', '', '', '', 45, 'Boneless fish fillet', 'brand-general', 'Seafood', 'sub-sea-fish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:11'),
(237, 'Red Snapper Fish', 'ریڈ سنیپر مچھلی', 'Seafood', 2200.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfQHkbS8dnbXGSkKFDWezxIcgUsM0_4i_TIzTDkjFriw&s=10', 'KG', 'کلو', 1, '260237', '', '', '', 35, 'Fresh red snapper fish', 'brand-general', 'Seafood', 'sub-sea-fish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:31'),
(238, 'Catla Fish', 'کاتلا مچھلی', 'Seafood', 700.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH5IX-W8i4IUmXK60Nj2EIiOu4IAXC_r4fMzZvWq_vQA&s=10', 'KG', 'کلو', 1, '260238', '', '', '', 60, 'Fresh catla fish', 'brand-general', 'Seafood', 'sub-sea-fish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:31'),
(239, 'Silver Carp Fish', 'سلور کارپ مچھلی', 'Seafood', 650.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKUQdpU6WbCShSNaRZJ56irZw9TM0qiZW_bMMyoBqeYQ&s=10', 'KG', 'کلو', 1, '260239', '', '', '', 55, 'Fresh silver carp', 'brand-general', 'Seafood', 'sub-sea-fish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:31'),
(245, 'Fish Fingers', 'فش فنگرز', 'Seafood', 850.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg8DyASrzFq7W3E05etDe1P9ZO-yqIG9OTCRYLOb2c1w&s=10', 'Pack', 'پیکٹ', 1, '260245', '', '', '', 85, 'Crispy fish fingers', 'brand-general', 'Seafood', 'sub-sea-fish', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:31'),
(246, 'Lobster', 'لابسٹر', 'Seafood', 7000.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9mDzlKbuKPlL-OhN61Nsr5i8VGef_aBVvMYwIpSDhww&s=10', 'KG', 'کلو', 1, '260246', '', '', '', 15, 'Premium lobster', 'brand-general', 'Seafood', 'sub-shellfish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:31'),
(247, 'Mussels', 'سیپیاں', 'Seafood', 2800.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxiuiRzJjqGR027-C9KvEWgEZlSAuirKE4jepoCgr8NQ&s=10', 'KG', 'کلو', 1, '260247', '', '', '', 20, 'Fresh mussels', 'brand-general', 'Seafood', 'sub-shellfish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:31'),
(248, 'Octopus', 'آکٹوپس', 'Seafood', 4000.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBekfty_RZvI8MxYs112R9G7a6sy1sa014arMAvsnzUA&s=10', 'KG', 'کلو', 1, '260248', '', '', '', 10, 'Fresh octopus seafood', 'brand-general', 'Seafood', 'sub-shellfish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:31'),
(249, 'Anchovy Fish', 'اینچووی مچھلی', 'Seafood', 1200.00, 'https://static.vecteezy.com/system/resources/previews/024/561/658/large_2x/fresh-raw-commersons-hardenbergs-indian-deviss-long-jawed-teri-anchovy-fish-ikan-bilis-photo.JPG', 'KG', 'کلو', 1, '260249', '', '', '', 25, 'Fresh anchovy fish', 'brand-general', 'Seafood', 'sub-sea-fish', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:05:31'),
(250, 'Basmati Rice', 'باسمتی چاول', 'Pantry', 450.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHz1xZMMcgVmkWr17Gv6vhPWxzF2_MGJEfWHnW4TfuLA&s=10', 'KG', 'کلو', 1, '260250', '', '', '', 120, 'Premium basmati rice', 'brand-general', 'Pantry', 'sub-rice-&-lentils', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(251, 'Sella Rice', 'سیلا چاول', 'Pantry', 500.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQcKHVldSbmdWacCpXpPOXARntrGps28xNottKSJ0-Tw&s=10', 'KG', 'کلو', 1, '260251', '', '', '', 100, 'Golden sella rice', 'brand-general', 'Pantry', 'sub-rice-&-lentils', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(252, 'White Flour Atta', 'سفید آٹا', 'Pantry', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTPqjfQDNetihI6S7cE4OnXFv44V5Jl9Bvp9FaLExQGw&s=10', 'KG', 'کلو', 1, '260252', '', '', '', 199, 'Fine wheat flour', 'brand-general', 'Pantry', 'sub-flour', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(253, 'Whole Wheat Atta', 'گندم کا آٹا', 'Pantry', 200.00, 'https://static-01.daraz.pk/p/8a0e691fa53fbb7a832988c98e7ac87e.jpg', 'KG', 'کلو', 1, '260253', '', '', '', 180, 'Whole wheat flour', 'brand-general', 'Pantry', 'sub-flour', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(254, 'Maida', 'میدہ', 'Pantry', 160.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiA45jCIaHo4TW8aycdC4Ua8jx2cmHrl6YVIP2bJ89sw&s=10', 'KG', 'کلو', 1, '260254', '', '', '', 139, 'Premium maida flour', 'brand-general', 'Pantry', 'sub-flour', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(255, 'Chana Daal', 'چنا دال', 'Pantry', 280.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbSvHqimE-fm2JJiPt6d7ueCdH9puj78HSGOxdzG9LHA&s=10', 'KG', 'کلو', 1, '260255', '', '', '', 150, 'Fresh chana daal', 'brand-general', 'Pantry', 'sub-rice-&-lentils', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(256, 'Moong Daal', 'مونگ دال', 'Pantry', 320.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0yWw6ujaS812sp3RXFNjtDgigClT1n3cYblL_xHr2Gg&s=10', 'KG', 'کلو', 1, '260256', '', '', '', 130, 'Premium moong daal', 'brand-general', 'Pantry', 'sub-rice-&-lentils', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(257, 'Mash Daal', 'ماش دال', 'Pantry', 350.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTl96AbVvV9OARWIM1yCoz4QJNbqw7BCHN1S3L37yOkyA&s=10', 'KG', 'کلو', 1, '260257', '', '', '', 110, 'Fresh mash daal', 'brand-general', 'Pantry', 'sub-rice-&-lentils', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(258, 'White Chickpeas', 'سفید چنے', 'Pantry', 300.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYkvtPihc2RhYSpXTVhFrbnQxA4r4kNROrFwV9Sxwc2g&s=10', 'KG', 'کلو', 1, '260258', '', '', '', 100, 'Premium chickpeas', 'brand-general', 'Pantry', 'sub-rice-&-lentils', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(259, 'Red Beans', 'لال لوبیا', 'Pantry', 400.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSo7NzPB_qv54zn6SpxDmPcfxiSC1QSgP4q06Wy3At0_A&s=10', 'KG', 'کلو', 1, '260259', '', '', '', 90, 'Fresh red beans', 'brand-general', 'Pantry', 'sub-rice-&-lentils', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00');
INSERT INTO `products` (`id`, `name`, `name_ur`, `category`, `price`, `img`, `unit`, `unit_ur`, `is_custom`, `sku`, `batch_number`, `manufacturing_date`, `expiry_date`, `stock_quantity`, `description`, `brand_id`, `category_id`, `subcategory_id`, `unit_id`, `currency_id`, `status`, `sale_price`, `created_at`) VALUES
(260, 'Black Pepper', 'کالی مرچ', 'Pantry', 300.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpw0wEIFB5v0VoEqSNRSjX2OeQ64K1elsUlR83GSDIlg&s=10', 'Box', 'ڈبہ', 1, '260260', '', '', '', 79, 'Ground black pepper', 'brand-national-foods', 'Pantry', 'sub-spices', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(261, 'Turmeric Powder', 'ہلدی پاؤڈر', 'Pantry', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMAWH-fkG4WmpmrPzwkhSjKND2V9jUxIn63xfyIhA8uw&s=10', 'Box', 'ڈبہ', 1, '260261', '', '', '', 100, 'Pure turmeric powder', 'brand-national-foods', 'Pantry', 'sub-spices', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(262, 'Cumin Powder', 'زیرہ پاؤڈر', 'Pantry', 250.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRddpUC9czdwA35bZm3zY57zg1ps1UwFFz97ERKbnGXuA&s=10', 'Box', 'ڈبہ', 1, '260262', '', '', '', 90, 'Fresh cumin powder', 'brand-national-foods', 'Pantry', 'sub-spices', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(263, 'Red Chilli Flakes', 'سرخ مرچ فلیکس', 'Pantry', 220.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2FmhiItF4gji3GhVY-4bfNOzHoAJphyNP7qEaPSMeiw&s=10', 'Box', 'ڈبہ', 1, '260263', '', '', '', 94, 'Chilli flakes', 'brand-national-foods', 'Pantry', 'sub-spices', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(264, 'Cinnamon Powder', 'دارچینی پاؤڈر', 'Pantry', 280.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsZMTO_htG-r6CI9rLSYy7ZO1JafDMpf5IEEYTiGCMEw&s=10', 'Box', 'ڈبہ', 1, '260264', '', '', '', 70, 'Cinnamon powder', 'brand-general', 'Pantry', 'sub-spices', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:00'),
(265, 'Tomato Ketchup', 'ٹماٹو کیچپ', 'Pantry', 220.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqERVLZMDiVHN7d8L6RdwxBLSAZBbiwY3HSvcEF3ikHg&s=10', 'Piece', 'عدد', 1, '260265', '', '', '', 100, 'Fresh tomato ketchup', 'brand-national-foods', 'Pantry', 'sub-sauces', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:35'),
(266, 'Chilli Sauce', 'چلی ساس', 'Pantry', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJeUg-wtKfAAfn6fiO-IzFxvE6zXp90BmSzn5WlPkb7Q&s=10', 'Piece', 'عدد', 1, '260266', '', '', '', 90, 'Hot chilli sauce', 'brand-national-foods', 'Pantry', 'sub-sauces', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:35'),
(267, 'Soy Sauce', 'سویا ساس', 'Pantry', 250.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf0vCwUysru8lAfjaQPxEvjJtqUXKSB7svNhLCWLiJxg&s=10', 'Piece', 'عدد', 1, '260267', '', '', '', 69, 'Premium soy sauce', 'brand-national-foods', 'Pantry', 'sub-sauces', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:35'),
(268, 'Mayonnaise', 'مایونیز', 'Pantry', 300.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTm1GF-tTy5MyxqXXVnIcOyXH6lNf9iAK1wjk_sBTIog&s', 'Pack', 'پیکٹ', 1, '260268', '', '', '', 80, 'Creamy mayonnaise', 'brand-general', 'Pantry', 'sub-sauces', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:35'),
(269, 'Hot Sauce', 'ہاٹ ساس', 'Pantry', 200.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW_z35bb6jXcblQ1jyFIl-TEOrvDjtlEhydtIiVZTCoQ&s=10', 'Piece', 'عدد', 1, '260269', '', '', '', 60, 'Spicy hot sauce', 'brand-general', 'Pantry', 'sub-sauces', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:35'),
(270, 'Corn Flakes', 'کارن فلیکس', 'Pantry', 450.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS10XQ77QKXBV9U_30qpnYfbsnlA8_tlNLoLnAjtowLww&s', 'Box', 'ڈبہ', 1, '260270', '', '', '', 70, 'Breakfast corn flakes', 'brand-nestle', 'Pantry', 'sub-breakfast', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:35'),
(271, 'Oats', 'اوٹس', 'Pantry', 400.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3OvVuqkzDXnCChEvZwOWtZkSSS6J3NwAPvslfpxjUrQ&s=10', 'Pack', 'پیکٹ', 1, '260271', '', '', '', 90, 'Healthy oats', 'brand-nestle', 'Pantry', 'sub-breakfast', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:35'),
(272, 'Honey', 'شہد', 'Pantry', 700.00, 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=500', 'Jar', 'مرتبان', 1, '260272', '', '', '', 50, 'Pure natural honey', 'brand-general', 'Pantry', 'sub-breakfast', 'unit-jar', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:35'),
(273, 'Peanut Butter', 'مونگ پھلی مکھن', 'Pantry', 600.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtmejkGP5i-XQY-1YOfH97FBUn8tKMUP89h5YXK8Np_g&s=10', 'Jar', 'مرتبان', 1, '260273', '', '', '', 45, 'Creamy peanut butter', 'brand-general', 'Pantry', 'sub-breakfast', 'unit-jar', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:35'),
(274, 'Biscuits Chocolate', 'چاکلیٹ بسکٹ', 'Snacks', 120.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW2JnqcXBIyBOHwxQJ8yuVULQPGMGxN7qeaFV9E1d8zA&s=10', 'Pack', 'پیکٹ', 1, '260274', '', '', '', 200, 'Chocolate biscuits', 'brand-general', 'Snacks', NULL, 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:35'),
(276, 'Chocolate Bar', 'چاکلیٹ', 'Snacks', 150.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeYPCunT60uuROjL9HC73bpemZXQKwx7U1vQQ5A7kqjQ&s=10', 'Piece', 'عدد', 1, '260276', '', '', '', 120, 'Milk chocolate bar', 'brand-general', 'Snacks', NULL, 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:35'),
(277, 'Popcorn', 'پاپ کارن', 'Snacks', 180.00, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500', 'Pack', 'پیکٹ', 1, '260277', '', '', '', 90, 'Ready popcorn', 'brand-general', 'Snacks', NULL, 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:35'),
(279, 'Macaroni', 'میکرونی', 'Pantry', 160.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH8VLIuMRwoU6BRPN3t1ULJZUxVtal-5Ks58bNe5wr8A&s=10', 'Pack', 'پیکٹ', 1, '260279', '', '', '', 148, 'Durum macaroni', 'brand-bake-parlor', 'Pantry', 'sub-pasta', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:06:35'),
(285, 'Chocolate Cake', 'چاکلیٹ کیک', 'Snacks', 900.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', 'Piece', 'عدد', 1, '260285', '', '', '', 40, 'Fresh chocolate cake', 'brand-general', 'Snacks', NULL, 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:11:09'),
(286, 'Cup Cake', 'کپ کیک', 'Snacks', 120.00, 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d', 'Piece', 'عدد', 1, '260286', '', '', '', 100, 'Soft cupcakes', 'brand-general', 'Snacks', NULL, 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:11:09'),
(287, 'Pizza Bread', 'پیزا بریڈ', 'Pantry', 250.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbf6x_6tkZShCvJFNbF4HH0ThB6ECTVP-bkL731AJi9A&s=10', 'Piece', 'عدد', 1, '260287', '', '', '', 70, 'Fresh pizza bread', 'brand-general', 'Pantry', 'sub-pasta', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:11:09'),
(288, 'Tea Biscuits', 'چائے بسکٹ', 'Snacks', 180.00, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35', 'Pack', 'پیکٹ', 1, '260288', '', '', '', 150, 'Tea biscuits pack', 'brand-general', 'Snacks', NULL, 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:11:09'),
(291, 'Tea Bags', 'ٹی بیگ', 'Beverages', 250.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpjlStaBlCfosgrLjqgPEZJ08brESKJzXTzX5CVzhTqA&s=10', 'Box', 'ڈبہ', 1, '260291', '', '', '', 120, 'Premium tea bags', 'brand-tapal', 'Beverages', 'sub-tea', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 15:12:13'),
(292, 'Coffee Powder', 'کافی پاؤڈر', 'Beverages', 600.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgAw39s0L7pajaF-MVm1M4c6k1BjTW-fnzzdrxd0e8NQ&s=10', 'Jar', 'مرتبان', 1, '260292', '', '', '', 70, 'Rich coffee powder', 'brand-general', 'Beverages', 'sub-tea', 'unit-jar', 'curr-pkr', 'Active', NULL, '2026-07-24 15:12:13'),
(293, 'Prime Energy Drink', 'پرائم انرجی ڈرنک', 'Beverages', 1895.00, 'https://drinkprime.com/cdn/shop/files/STL_Web_CollectionBanner_Mobile_1125x1071_69622d63-ed05-4f47-a057-c5bfbe43da53_1600x.jpg?v=1774366898', 'Piece', 'عدد', 1, '260293', '', '', '', 100, 'Refreshing energy drink', 'brand-general', 'Beverages', 'sub-soft-drinks', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:12:13'),
(294, 'Mango Juice', 'آم کا جوس', 'Beverages', 280.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt0EoauH8qqdGRE_ROM3ygp_s79n9-HKficnJ6nXRJTA&s=10', 'Liter', 'لیٹر', 1, '260294', '', '', '', 90, 'Fresh mango juice', 'brand-general', 'Beverages', 'sub-soft-drinks', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-24 15:12:13'),
(295, 'Lemon Soda', 'لیموں سوڈا', 'Beverages', 120.00, 'https://img.magnific.com/premium-psd/green-lime-soda-bottle_1117034-8399.jpg?semt=ais_hybrid&w=740&q=80', 'Liter', 'لیٹر', 1, '260295', '', '', '', 150, 'Refreshing lemon drink', 'brand-general', 'Beverages', 'sub-soft-drinks', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-24 15:12:13'),
(297, 'Broccoli', 'بروکلی', 'Vegetables', 500.00, 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc', 'KG', 'کلو', 1, '260297', '', '', '', 50, 'Fresh broccoli', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:12:13'),
(308, 'Olive Oil', 'زیتون کا تیل', 'Pantry', 1200.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1bIMtx6JgH61v901_fKmwdCNmj2qTyxBPN0ub4Bp3Hw&s=10', 'Liter', 'لیٹر', 1, '260308', '', '', '', 60, 'Premium olive oil', 'brand-general', 'Pantry', 'sub-oil', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-24 15:17:26'),
(309, 'Black Salt', 'کالا نمک', 'Pantry', 120.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK90llsUun5Ij3kjq6iICbv9gQjHaTmYGw2yv00czHHA&s=10', 'Pack', 'پیکٹ', 1, '260309', '', '', '', 150, 'Natural black salt', 'brand-general', 'Pantry', 'sub-spices', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:17:26'),
(311, 'Coriander Powder', 'دھنیا پاؤڈر', 'Pantry', 170.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2Qe-yWh9aDjbql17AIW5uXDVfGyFrjITZwKNDfgiLog&s=10', 'Box', 'ڈبہ', 1, '260311', '', '', '', 180, 'Fresh coriander powder', 'brand-national-foods', 'Pantry', 'sub-spices', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 15:17:26'),
(316, 'Biscuits', 'بسکٹ', 'Snacks', 80.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBil6Q6ilc6p9oTZ2QF2a3ZV0080Byw1mcslPJUV8Ztg&s=10', 'Pack', 'پیکٹ', 1, '260316', '', '', '', 200, 'Fresh crispy biscuits', 'brand-general', 'Snacks', NULL, 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:17:26'),
(318, 'Cake Rusk', 'کیک رسک', 'Pantry', 200.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN3YpCOEi356e2kl38LHRm8xCw8cPR44-gq3L39rmZMA&s=10', 'Pack', 'پیکٹ', 1, '260318', '', '', '', 100, 'Sweet cake rusk', 'brand-bake-parlor', 'Pantry', 'sub-pasta', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:17:26'),
(330, 'Lemon Drink', 'لیموں ڈرنک', 'Beverages', 150.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', 'Liter', 'لیٹر', 1, '260330', '', '', '', 120, 'Refreshing lemon drink', 'brand-general', 'Beverages', 'sub-soft-drinks', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-24 15:17:49'),
(334, 'French Beans', 'فرانسیسی پھلیاں', 'Vegetables', 300.00, 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=500', 'KG', 'کلو', 1, '260334', '', '', '', 70, 'Fresh green beans', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-kg', 'curr-pkr', 'Active', NULL, '2026-07-24 15:17:49'),
(353, '7UP', 'سیون اپ', 'Beverages', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRw7oJlJ41sRJE24fIMiWD4voICA_hXOHlpCT3EYG46ig&s', 'Liter', 'لیٹر', 1, '260353', '', '', '', 100, 'Lemon lime drink', 'brand-general', 'Beverages', 'sub-soft-drinks', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-24 15:23:46'),
(354, 'Sprite', 'اسپرائٹ', 'Beverages', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQiBjoPHfWeS1XBZWrQZYvFcFDwrJOAeAujORmrMwadQ&s=10', 'Liter', 'لیٹر', 1, '260354', '', '', '', 100, 'Fresh soft drink', 'brand-general', 'Beverages', 'sub-soft-drinks', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-24 15:23:46'),
(355, 'Fanta Orange', 'فانٹا اورنج', 'Beverages', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsGHqy_unt7KKt6Bjg45DYLTJLMMqtbqbgbceeFbN69Q&s=10', 'Liter', 'لیٹر', 1, '260355', '', '', '', 90, 'Orange flavored drink', 'brand-general', 'Beverages', 'sub-soft-drinks', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-24 15:23:46'),
(357, 'Orange Juice', 'اورنج جوس', 'Beverages', 250.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423', 'Pack', 'پیکٹ', 1, '260357', '', '', '', 80, 'Fresh orange juice', 'brand-general', 'Beverages', 'sub-soft-drinks', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:23:46'),
(361, 'White Bread', 'سفید بریڈ', 'Bakery', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsSG2g2FFk1VUMXg1Z0-6owpCYw8r6qSKpaZtM6Dn8rg&s=10', 'Pack', 'پیکٹ', 1, '260361', '', '', '', 100, 'Fresh bakery bread', 'brand-general', 'Bakery', 'sub-bread', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(362, 'Chocolate Cake', 'چاکلیٹ کیک', 'Bakery', 900.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80', 'Piece', 'عدد', 1, '260362', '', '', '', 50, 'Fresh chocolate cake', 'brand-general', 'Bakery', 'sub-cakes', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(363, 'Potato Chips', 'آلو چپس', 'Pantry', 120.00, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80', 'Pack', 'پیکٹ', 1, '260363', '', '', '', 200, 'Crispy potato chips', 'brand-general', 'Snacks', NULL, 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(365, 'Frozen Peas', 'منجمد مٹر', 'Frozen', 300.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZR8jdGmpIAgnPwLYNIY9hlXr7Xu35l6ujpeREX4vmng&s=10', 'Pack', 'پیکٹ', 1, '260365', '', '', '', 80, 'Frozen peas', 'brand-general', 'Frozen', NULL, 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(366, 'Frozen Nuggets', 'فروزن نگٹس', 'Frozen', 450.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaRMXhhyGeu6zlqIECHJzPjtjWh88WP_iDbdrXNGazIA&s=10', 'Pack', 'پیکٹ', 1, '260366', '', '', '', 70, 'Frozen chicken nuggets', 'brand-general', 'Frozen', 'sub-frozen-food', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(367, 'Shampoo', 'شیمپو', 'Personal-Care', 350.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWCK6ucxLD5hnvAS1O5D3CcX-clkIq87wXJKPGIURqxA&s', 'Piece', 'عدد', 1, '260367', '', '', '', 90, 'Hair shampoo', 'brand-unilever', 'Personal-Care', 'sub-shampoo', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(368, 'Bath Soap', 'صابن', 'Personal-Care', 120.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEYLjij3-8IS4qHiLLP_mnoi7lBF_vJD7cB9uEE8vjfQ&s=10', 'Piece', 'عدد', 1, '260368', '', '', '', 150, 'Bath soap', 'brand-unilever', 'Personal-Care', 'sub-soap', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(369, 'Toothpaste', 'ٹوتھ پیسٹ', 'Personal-Care', 250.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRl8art229XAS0sp55FnJK1YhyGEKMxYm4_T8rDex0yhQ&s=10', 'Pack', 'پیکٹ', 1, '260369', '', '', '', 100, 'Toothpaste', 'brand-unilever', 'Personal-Care', 'sub-toothpaste', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(370, 'Surf Excel', 'سرف ایکسل', 'Cleaning', 300.00, 'https://mart247.pk/wp-content/uploads/2020/11/2723.jpg.jpg', 'Pack', 'پیکٹ', 1, '260370', '', '', '', 120, 'Laundry detergent', 'brand-unilever', 'Cleaning', 'sub-detergent', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(371, 'Glass Cleaner', 'شیشہ صاف کرنے والا', 'Cleaning', 250.00, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=500&q=80', 'Bottle', 'بوتل', 1, '260371', '', '', '', 80, 'Glass cleaner', 'brand-unilever', 'Cleaning', 'sub-cleaners', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(372, 'Croissant', 'کروسان', 'Bakery', 220.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80', 'Piece', 'عدد', 1, '260372', '', '', '', 60, 'Fresh croissant', 'brand-general', 'Bakery', 'sub-cakes', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(374, 'Ice Cream', 'آئس کریم', 'Frozen', 450.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2WnRpNh7xb1SvYpW1E8wB2qKnXf47-Ii6ynhdFV0Ilg&s=10', 'Box', 'ڈبہ', 1, '260374', '', '', '', 70, 'Frozen ice cream', 'brand-general', 'Frozen', 'sub-frozen-food', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(375, 'Frozen Fries', 'فروزن فرائز', 'Frozen', 350.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7Q0kUyiAJlTrN77FNS6ORQRMPVPE6cjo2zdQ_VH-xvQ&s=10', 'Pack', 'پیکٹ', 1, '260375', '', '', '', 100, 'Frozen french fries', 'brand-general', 'Frozen', 'sub-frozen-food', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(376, 'Face Wash', 'فیس واش', 'Personal-Care', 400.00, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=500&q=80', 'Bottle', 'بوتل', 1, '260376', '', '', '', 80, 'Face wash', 'brand-unilever', 'Personal-Care', 'sub-shampoo', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(377, 'Floor Cleaner', 'فرش صاف کرنے والا', 'Cleaning', 280.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGhZ4a1ssPCOML__ERUZ0WjtyIgqWmlGhqRCUtzfKpgw&s=10', 'Liter', 'لیٹر', 1, '260377', '', '', '', 90, 'Floor cleaner', 'brand-unilever', 'Cleaning', 'sub-cleaners', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(378, 'Cookies', 'کوکیز', 'Pantry', 180.00, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=500&q=80', 'Pack', 'پیکٹ', 1, '260378', '', '', '', 150, 'Fresh cookies', 'brand-general', 'Snacks', NULL, 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(379, 'Donuts', 'ڈونٹس', 'Bakery', 300.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTujNWLwktdwy2CweR9V0JGYtW8reAchse6xhwY7HFZjw&s=10', 'Piece', 'عدد', 1, '260379', '', '', '', 60, 'Fresh donuts', 'brand-general', 'Bakery', 'sub-cakes', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:32'),
(381, 'Brown Bread', 'براؤن بریڈ', 'Bakery', 220.00, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=500&q=80', 'Pack', 'پیکٹ', 1, '260381', '', '', '', 100, 'Healthy brown bread', 'brand-general', 'Bakery', 'sub-bread', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:56'),
(382, 'Muffins', 'مفن', 'Bakery', 350.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPZuY6vDLj39Nb1Li8wt-bPK4ybnrwFKhOf1Kv3CSFGw&s=10', 'Piece', 'عدد', 1, '260382', '', '', '', 70, 'Fresh muffins', 'brand-general', 'Bakery', 'sub-cakes', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:56'),
(383, 'Cream Biscuits', 'کریم بسکٹ', 'Snacks', 130.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb-h5BaY3LNZ1xgLAPdojk591v6aY2QBETOUM1BNhHlA&s=10', 'Pack', 'پیکٹ', 1, '260383', '', '', '', 180, 'Cream filled biscuits', 'brand-general', 'Snacks', NULL, 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:56'),
(384, 'Namkeen', 'نمکین', 'Pantry', 150.00, 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=500&q=80', 'Pack', 'پیکٹ', 1, '260384', '', '', '', 120, 'Crunchy namkeen snacks', 'brand-general', 'Snacks', NULL, 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:56'),
(385, 'Frozen Samosa', 'فروزن سموسہ', 'Frozen', 400.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRoUjY2AuNdZCwQw33DeiQKZPonwFO3VZOhlEZqY_G7Q&s=10', 'Pack', 'پیکٹ', 1, '260385', '', '', '', 90, 'Frozen samosas', 'brand-general', 'Frozen', 'sub-frozen-food', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:56'),
(387, 'Hand Wash', 'ہینڈ واش', 'Personal-Care', 300.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRROcIyxMFhC2x2efgHdMVm3_yNiA_LiFO02SvLefO3LQ&s=10', 'Piece', 'عدد', 1, '260387', '', '', '', 100, 'Liquid hand wash', 'brand-unilever', 'Personal-Care', 'sub-soap', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:56'),
(388, 'Hair Oil', 'بالوں کا تیل', 'Personal-Care', 280.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9a2dhju1b-AdgWJJk-nHxjdHepW93796SHM5hL5EJMQ&s=10', 'Piece', 'عدد', 1, '260388', '', '', '', 90, 'Hair oil', 'brand-general', 'Personal-Care', 'sub-shampoo', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:56'),
(389, 'Dish Washing Liquid', 'برتن دھونے والا لیکوئڈ', 'Cleaning', 260.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcr6GLntwNY5lixB58pLlBxayAHd6grjpfpzhCt-xQvw&s', 'Liter', 'لیٹر', 1, '260389', '', '', '', 100, 'Dish cleaner', 'brand-unilever', 'Cleaning', 'sub-cleaners', 'unit-liter', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:56'),
(390, 'Tissue Box', 'ٹشو باکس', 'Cleaning', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyatkX2_2MyirXh2_OXhsGT4osoPkayFNOXQudo_L1eg&s=10', 'Box', 'ڈبہ', 1, '260390', '', '', '', 150, 'Soft tissue box', 'brand-general', 'Cleaning', 'sub-cleaners', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-24 15:30:56'),
(391, 'Vanilla Cake', 'ونیلا کیک', 'Bakery', 850.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg9GpYb1Xw2lMRga1TvZU0gY0oeNfu91bS_awjZmzWtw&s=10', 'Piece', 'عدد', 1, '260391', '', '', '', 50, 'Fresh vanilla cream cake', 'brand-general', 'Bakery', 'sub-cakes', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 15:40:07'),
(393, 'Frozen Spring Rolls', 'فروزن اسپرنگ رولز', 'Frozen', 500.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBsUnZAwE5Jxnnu-M1LuOtlg4uZoi1kS_CqNQfWrFbAQ&s=10', 'Pack', 'پیکٹ', 1, '260393', '', '', '', 70, 'Frozen snack rolls', 'brand-general', 'Frozen', NULL, 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:40:07'),
(395, 'Potato Chips', 'آلو چپس', 'Pantry', 150.00, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b', 'Pack', 'پیکٹ', 1, '260395', '', '', '', 120, 'Crispy potato chips', 'brand-general', 'Snacks', NULL, 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:40:07'),
(398, 'Washing Powder', 'واشنگ پاؤڈر', 'Cleaning', 450.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-GPLFIxu_X8_gM6w8DvX6pXMHQPKn16WKSEMdfQHlUg&s=10', 'Pack', 'پیکٹ', 1, '260398', '', '', '', 69, 'Laundry washing powder', 'brand-general', 'Cleaning', 'sub-laundry', 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-07-24 15:40:07'),
(401, 'Coriander', 'دھنیا', 'Vegetables', 30.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQznnAPuL5XhJtLe-V1s-N6QLDXbcku4LxenyMIw4sjAA&s=10', 'Piece', 'عدد', 1, '2600335', '', '', '', 99, '', 'brand-general', 'Vegetables', 'sub-fresh-vegetables', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-07-24 17:57:51'),
(402, 'Biryani Masala', 'بریانی مصالحہ', 'Pantry', 150.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTmtzVkjZPZBx4pSiKGb_ZD3NLOR0E7BjyAlIUgjLW5w&s=10', 'Box', 'ڈبہ', 1, '2600336', '', '', '', 99, '', 'brand-national-foods', 'Pantry', 'sub-spices', 'unit-box', 'curr-usd', 'Active', NULL, '2026-07-25 07:06:34'),
(403, 'Garam Masala', 'گرم مصالحہ', 'Pantry', 180.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIeDKHBvikaFy-Fshud6fPjIA2hlZSIqPUcsIMNd0oxg&s', 'Box', 'ڈبہ', 1, '2600337', '', '', '', 100, '', 'brand-general', 'Pantry', 'sub-spices', 'unit-box', 'curr-pkr', 'Active', NULL, '2026-07-25 07:09:44'),
(404, 'Chips', 'چپس', 'Snacks', 120.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoW1UXqkR7lhL6sxwgcc8aeACuJOfPw8yDcMR42-yV9A&s=10', 'Pack', 'پیکٹ', 1, '2600338', '', '', '', 100, 'A chips packet is a sealed, air-filled plastic or foil bag that holds thin, crispy fried potato slices or snacks. It uses a bright outer design to show the flavor and contains safe nitrogen gas inside to keep the snack fresh and stop it from breaking', 'brand-general', 'Snacks', NULL, 'unit-pack', 'curr-pkr', 'Active', NULL, '2026-08-05 11:30:47'),
(405, 'Brownies', 'براؤنیز', 'Bakery', 250.00, 'https://sweetrack.pk/cdn/shop/files/2_6d4e8332-ebf4-464d-9740-d1193debc3f8.jpg?v=1775986045', 'Piece', 'عدد', 1, '2600339', '', '', '', 129, 'Brownies are rich, sweet, baked chocolate squares with a dense, fudgy or soft, cake-like center and a shiny, crackly top.', 'brand-general', 'Bakery', 'sub-cakes', 'unit-piece', 'curr-pkr', 'Active', NULL, '2026-08-12 17:12:10');

-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` varchar(50) NOT NULL,
  `category_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `name_ur` varchar(100) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subcategories`
--

INSERT INTO `subcategories` (`id`, `category_id`, `name`, `name_ur`, `status`) VALUES
('sub-beef', 'Meat', 'Beef', 'بڑا گوشت', 'Active'),
('sub-bread', 'Bakery', 'Bread', 'روٹی', 'Active'),
('sub-breakfast', 'Pantry', 'Breakfast Items', 'ناشتے کی اشیاء', 'Active'),
('sub-butter', 'Dairy', 'Butter', 'مکھن', 'Active'),
('sub-cakes', 'Bakery', 'Cakes & Pastries', 'کیک اور پیسٹری', 'Active'),
('sub-cheese', 'Dairy', 'Cheese', 'پنیر', 'Active'),
('sub-chicken', 'Meat', 'Chicken', 'مرغی', 'Active'),
('sub-citrus', 'Fruits', 'Citrus', 'کھٹے پھل', 'Active'),
('sub-cleaners', 'Cleaning', 'House Cleaners', 'گھر کی صفائی', 'Active'),
('sub-detergent', 'Cleaning', 'Detergent', 'کپڑے دھونے کا پاؤڈر', 'Active'),
('sub-eggs', 'Dairy', 'Eggs', 'انڈے', 'Active'),
('sub-flour', 'Pantry', 'Flour & Atta', 'آٹا اور میدہ', 'Active'),
('sub-fresh-fruits', 'Fruits', 'Fresh Fruits', 'تازہ پھل', 'Active'),
('sub-fresh-vegetables', 'Vegetables', 'Fresh Vegetables', 'تازہ سبزیاں', 'Active'),
('sub-frozen-food', 'Frozen', 'Frozen Food', 'منجمد کھانے', 'Active'),
('sub-laundry', 'Cleaning', 'Laundry Care', 'کپڑے دھونے کا سامان', 'Active'),
('sub-milk', 'Dairy', 'Milk', 'دودھ', 'Active'),
('sub-mutton', 'Meat', 'Mutton', 'بکرے کا گوشت', 'Active'),
('sub-oil', 'Pantry', 'Cooking Oil', 'ککنگ آئل', 'Active'),
('sub-pasta', 'Pantry', 'Pasta & Noodles', 'پاستا اور نوڈلز', 'Active'),
('sub-rice-&-lentils', 'Pantry', 'Rice & Lentils', 'چاول اور دال', 'Active'),
('sub-sauces', 'Pantry', 'Sauces & Ketchup', 'ساس اور کیچپ', 'Active'),
('sub-sea-fish', 'Seafood', 'Sea Fish', 'سمندری مچھلی', 'Active'),
('sub-shampoo', 'Personal-Care', 'Shampoo', 'شیمپو', 'Active'),
('sub-shellfish', 'Seafood', 'Shellfish', 'سی فوڈ شیل فش', 'Active'),
('sub-soap', 'Personal-Care', 'Soap', 'صابن', 'Active'),
('sub-soft-drinks', 'Beverages', 'Soft Drinks', 'سافٹ ڈرنکس', 'Active'),
('sub-spices', 'Pantry', 'Spices & Salt', 'مصالحے اور نمک', 'Active'),
('sub-tea', 'Beverages', 'Tea & Coffee', 'چائے اور کافی', 'Active'),
('sub-toothpaste', 'Personal-Care', 'Toothpaste', 'ٹوتھ پیسٹ', 'Active'),
('sub-tubers', 'Vegetables', 'Root Vegetables', 'جڑ والی سبزیاں', 'Active'),
('sub-water', 'Beverages', 'Mineral Water', 'منرل واٹر', 'Active'),
('sub-yoghurt', 'Dairy', 'Yoghurt', 'دہی', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `name_ur` varchar(100) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `name`, `name_ur`, `status`) VALUES
('unit-box', 'Box', 'ڈبہ', 'Active'),
('unit-dozen', 'Dozen', 'درجن', 'Active'),
('unit-gram', 'Gram', 'گرام', 'Active'),
('unit-jar', 'Jar', 'مرتبان', 'Active'),
('unit-kg', 'KG', 'کلو', 'Active'),
('unit-liter', 'Liter', 'لیٹر', 'Active'),
('unit-ml', 'ML', 'ملی لیٹر', 'Active'),
('unit-pack', 'Pack', 'پیکٹ', 'Active'),
('unit-piece', 'Piece', 'عدد', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
('usr_6a7cb518a45d4', 'Muskan', 'muskanmehmood2611@gmail.com', 'Muskan_2611', 'admin', '2026-08-12 18:02:00'),
('usr_6a7de9341f45d', 'Mahnoor', 'itzmahnoor16@gmail.com', 'Mahnoor_16', 'user', '2026-08-13 15:56:36');

-- --------------------------------------------------------

--
-- Table structure for table `verifications`
--

CREATE TABLE `verifications` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `expires_at` bigint(20) NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `verifications`
--

INSERT INTO `verifications` (`id`, `email`, `code`, `expires_at`, `attempts`, `created_at`) VALUES
(16, 'sufyantanoli8809@gmail.com', '714436', 1786568781000, 0, '2026-08-12 20:56:25'),
(17, 'sktrader8809@gmail.com', '482350', 1786568886000, 0, '2026-08-12 20:58:09'),
(18, 'muski19822@gmail.com', '134285', 1786568946000, 0, '2026-08-12 20:59:10'),
(19, 'musaknmehmood2611@gmail.com', '971276', 1786569231000, 0, '2026-08-12 21:03:53'),
(21, 'muskan@gmail.com', '430366', 1786637011000, 0, '2026-08-13 15:53:34');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_user_product` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `currencies`
--
ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `favourites`
--
ALTER TABLE `favourites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_fav_user_product` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category` (`category`),
  ADD KEY `brand_id` (`brand_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `subcategory_id` (`subcategory_id`),
  ADD KEY `unit_id` (`unit_id`),
  ADD KEY `currency_id` (`currency_id`);

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `verifications`
--
ALTER TABLE `verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_verif_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6024;

--
-- AUTO_INCREMENT for table `favourites`
--
ALTER TABLE `favourites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=406;

--
-- AUTO_INCREMENT for table `verifications`
--
ALTER TABLE `verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `favourites`
--
ALTER TABLE `favourites`
  ADD CONSTRAINT `favourites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favourites_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_4` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_5` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_6` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD CONSTRAINT `subcategories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
