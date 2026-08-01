const fs = require('fs');
let code = fs.readFileSync('backend-php-mysql/api.php', 'utf8');

const target1 = `            $order['paymentMethod'] = isset($order['payment_method']) ? $order['payment_method'] : 'card';
            $order['paymentStatus'] = isset($order['payment_status']) ? $order['payment_status'] : 'paid';`;

const replacement1 = `            $order['paymentMethod'] = isset($order['payment_method']) ? $order['payment_method'] : 'card';
            $order['paymentStatus'] = isset($order['payment_status']) ? $order['payment_status'] : 'paid';
            $order['userEmail'] = isset($order['user_email']) ? $order['user_email'] : '';
            $order['paymentDetails'] = isset($order['payment_details']) ? json_decode($order['payment_details'], true) : [];`;

if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    fs.writeFileSync('backend-php-mysql/api.php', code);
    console.log("Updated api.php get_orders");
} else {
    console.log("Could not find target in api.php");
}
