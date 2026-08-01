const fs = require('fs');
let code = fs.readFileSync('backend-php-mysql/api.php', 'utf8');

const target = `        // Map/Format items to standard format
        $formatted = [];
        foreach ($items as $item) {`;

const replacement = `        // Map/Format items to standard format
        $formatted = [];
        $seenNames = [];
        foreach ($items as $item) {`;

const target2 = `            $formatted[] = [
                "name" => $name,
                "nameUr" => $nameUr,
                "category" => $category,
                "price" => $price,
                "qty" => $qty,
                "unit" => $unit,
                "unitUr" => $unitUr
            ];
        }`;

const replacement2 = `            $nameKey = strtolower(trim($name));
            if (!in_array($nameKey, $seenNames)) {
                $seenNames[] = $nameKey;
                $formatted[] = [
                    "name" => $name,
                    "nameUr" => $nameUr,
                    "category" => $category,
                    "price" => $price,
                    "qty" => $qty,
                    "unit" => $unit,
                    "unitUr" => $unitUr
                ];
            }
        }`;

if (code.includes(target) && code.includes(target2)) {
    code = code.replace(target, replacement);
    code = code.replace(target2, replacement2);
    fs.writeFileSync('backend-php-mysql/api.php', code);
    console.log("Patched api.php successfully");
} else {
    console.log("Target not found");
}
