const fs = require('fs');
let code = fs.readFileSync('backend-php-mysql/api.php', 'utf8');

const target1 = `        foreach ($recentOrders as &$ro) {
            $ro['items'] = json_decode($ro['items_json'], true);
            unset($ro['items_json']);
            $ro['subtotal'] = (float)$ro['subtotal'];
            $ro['tax'] = (float)$ro['tax'];
            $ro['total'] = (float)$ro['total'];
        }`;

const replacement1 = `        foreach ($recentOrders as &$ro) {
            $ro['items'] = json_decode($ro['items_json'], true);
            unset($ro['items_json']);
            $ro['subtotal'] = (float)$ro['subtotal'];
            $ro['tax'] = (float)$ro['tax'];
            $ro['total'] = (float)$ro['total'];
            
            // Format for JS frontend
            $ro['userId'] = isset($ro['user_id']) ? $ro['user_id'] : '';
            $ro['userEmail'] = isset($ro['user_email']) ? $ro['user_email'] : '';
            $ro['paymentMethod'] = isset($ro['payment_method']) ? $ro['payment_method'] : 'Cash on Delivery';
            $ro['paymentStatus'] = isset($ro['payment_status']) ? $ro['payment_status'] : 'Pending';
            $ro['paymentDetails'] = isset($ro['payment_details']) ? json_decode($ro['payment_details'], true) : [];
            $ro['createdAt'] = isset($ro['created_at']) ? $ro['created_at'] : date('Y-m-d H:i:s');
        }`;

if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    fs.writeFileSync('backend-php-mysql/api.php', code);
    console.log("Updated api.php admin_dashboard");
} else {
    console.log("Could not find target in api.php");
}
