const fs = require('fs');
let code = fs.readFileSync('backend-php-mysql/api.php', 'utf8');

const target1 = `$stmt = $conn->prepare("INSERT INTO orders (id, user_id, items_json, subtotal, tax, total, currency, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')");
            $stmt->execute([$orderId, $userId, $itemsJson, $subtotal, $tax, $total, $currency]);`;

const replacement1 = `// Add additional payment and user fields
            $userEmail = isset($body['userEmail']) ? trim($body['userEmail']) : '';
            $paymentMethod = isset($body['paymentMethod']) ? trim($body['paymentMethod']) : 'Cash on Delivery';
            $paymentStatus = isset($body['paymentStatus']) ? trim($body['paymentStatus']) : 'Pending';
            $paymentDetails = isset($body['paymentDetails']) ? json_encode($body['paymentDetails']) : '{}';

            $stmt = $conn->prepare("INSERT INTO orders (id, user_id, user_email, items_json, subtotal, tax, total, currency, status, payment_method, payment_details, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)");
            $stmt->execute([$orderId, $userId, $userEmail, $itemsJson, $subtotal, $tax, $total, $currency, $paymentMethod, $paymentDetails, $paymentStatus]);`;

if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    fs.writeFileSync('backend-php-mysql/api.php', code);
    console.log("Updated api.php create_order");
} else {
    console.log("Could not find target in api.php");
}
