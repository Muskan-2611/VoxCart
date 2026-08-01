const fs = require('fs');
let code = fs.readFileSync('backend-php-mysql/api.php', 'utf8');

const target1 = "SELECT * FROM orders WHERE user_id = ? OR user_id = 'demo-user' OR user_id = 'guest' OR ? = 'demo-user' OR ? = 'all' ORDER BY created_at DESC";
const replacement1 = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";

// Wait, the PHP variable $userId is written as \$userId in JS string literals if not careful, but I used double quotes in bash, which evaluates variables. Let's use single quotes for JS.

if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    code = code.replace("$stmt->execute([$userId, $userId, $userId]);", "$stmt->execute([$userId]);");
    fs.writeFileSync('backend-php-mysql/api.php', code);
    console.log("PHP API updated successfully.");
} else {
    console.log("String not found in PHP API.");
}
