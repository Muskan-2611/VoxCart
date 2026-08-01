# VoxCart PHP + MySQL Backend Integration Guide

This directory contains the production-ready PHP + MySQL backend for **VoxCart**. It is fully compatible with **phpMyAdmin**, standard Apache virtual hosts, and XAMPP integrations.

By default, the React client works instantly out-of-the-box in the preview sandbox using an identical Express/Vite full-stack solution. When you are ready to export and deploy to production on a LAMP/WAMP server, simply follow the details below.

## 📂 Backend Structure
* `setup.sql` — Schema definition queries for `users`, `products`, `cart_items`, `favourites`, and `orders`. Contains complete Urdu translations seed data.
* `db.php` — Database link using PHP Data Objects (PDO) with standard CORS headers.
* `api.php` — Single entry point REST API handling auth, products, carts, favourites, orders, checkout, and admin dashboard statistics.

## 🚀 Setup Steps

### 1. Database Import
1. Open your **phpMyAdmin** dashboard (typically `http://localhost/phpmyadmin`).
2. Click on the **Databases** tab and create a new database named `voxcart_db` with `utf8mb4_unicode_ci` collation.
3. Select the `voxcart_db` database, go to the **Import** tab.
4. Click **Choose File**, select `setup.sql` from this directory, and click **Go** (or **Import**). This creates all tables and seeds the product inventory!

### 2. Configure PDO Connection
Open `db.php` in a text editor and adjust your credentials if they differ from the defaults:
```php
$host = 'localhost';
$db_name = 'voxcart_db';
$username = 'root';
$password = ''; // Your MySQL password (often empty on XAMPP)
```

### 3. Place Files on Apache Document Root
Copy the files in this directory (`db.php`, `api.php`) to a folder under your web document root (e.g., `C:/xampp/htdocs/voxcart-api/`). This serves the endpoints at `http://localhost/voxcart-api/api.php?action=...`.

### 4. Direct React App to PHP Server
In the React client application, check the entry config helper inside `src/utils/api.js`. Switch the `BACKEND_TYPE` from `"node"` to `"php"` and update the target hosting URL:
```javascript
const BACKEND_TYPE = "php"; // Toggle to "php" for Apache deployment
const phpBaseUrl = "http://localhost/voxcart-api/api.php";
```

## 🔒 Default Login Credentials
* **Admin Account:**
  - Email: `admin@voxcart.com`
  - Password: `admin`
* **Guest Customer Account:**
  - Email: `guest@voxcart.com`
  - Password: `guest`
