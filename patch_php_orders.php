<?php
$content = file_get_contents('backend-php-mysql/api.php');

$search = "            \$stmt = \$conn->prepare(\"SELECT * FROM orders WHERE user_id = ? OR user_id = 'demo-user' OR user_id = 'guest' OR ? = 'demo-user' OR ? = 'all' ORDER BY created_at DESC\");";
$replace = "            \$stmt = \$conn->prepare(\"SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC\");";

if (strpos($content, $search) !== false) {
    $content = str_replace($search, $replace, $content);
    
    // We also need to fix the execute call
    $search_exec = "            \$stmt->execute([\$userId, \$userId, \$userId]);";
    $replace_exec = "            \$stmt->execute([\$userId]);";
    $content = str_replace($search_exec, $replace_exec, $content);
    
    file_put_contents('backend-php-mysql/api.php', $content);
    echo "PHP API updated successfully.\n";
} else {
    echo "String not found in PHP API.\n";
}
