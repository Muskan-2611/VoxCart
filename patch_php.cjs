const fs = require('fs');
let code = fs.readFileSync('backend-php-mysql/api.php', 'utf8');

const target = `            "generationConfig" => [
                "responseMimeType" => "application/json"
            ]`;

const replacement = `            "generationConfig" => [
                "responseMimeType" => "application/json",
                "responseSchema" => [
                    "type" => "ARRAY",
                    "items" => [
                        "type" => "OBJECT",
                        "properties" => [
                            "name" => [ "type" => "STRING" ],
                            "nameUr" => [ "type" => "STRING" ],
                            "category" => [ "type" => "STRING" ],
                            "price" => [ "type" => "NUMBER" ],
                            "qty" => [ "type" => "INTEGER" ],
                            "unit" => [ "type" => "STRING" ],
                            "unitUr" => [ "type" => "STRING" ]
                        ],
                        "required" => ["name", "nameUr", "category", "price", "qty", "unit", "unitUr"]
                    ]
                ]
            ]`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('backend-php-mysql/api.php', code);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
