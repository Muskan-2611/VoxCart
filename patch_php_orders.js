const fs = require('fs');
let code = fs.readFileSync('backend-php-mysql/api.php', 'utf8');

const target1 = "SELECT * FROM orders WHERE user_id = ? OR user_id = 'demo-user' OR user_id = 'guest' OR ? = 'demo-user' OR ? = 'all' ORDER BY created_at DESC";
const replacement1 = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";

const target2 = "$stmt->execute([$userId, $userId, $userId]);";
const replacement2 = "$stmt->execute([$userId]);";

if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    code = code.replace(target2, replacement2);
    fs.writeFileSync('backend-php-mysql/api.php', code);
    console.log("PHP API updated successfully.");
} else {
    console.log("String not found in PHP API.");
}
