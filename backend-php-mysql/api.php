<?php
// VoxCart Unified REST API Entry Point
// Routing action calls directly to query actions

require_once 'db.php';

// Retrieve absolute request parameters
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Helper to extract JSON request body payload
function getRequestBody() {
    $json = file_get_contents('php://input');
    return json_decode($json, true);
}

function php_starts_with($haystack, $needle) {
    return (string)$needle !== '' && strncmp($haystack, $needle, strlen($needle)) === 0;
}

function php_ends_with($haystack, $needle) {
    return $needle !== '' && substr($haystack, -strlen($needle)) === $needle;
}

function parseVoiceCommandBackendPHP($text, $products) {
    $normalized = strtolower(trim($text));

    // Support recipe ingredients and healthy fruits programmatically in PHP
    $isBiryani = false;
    $biryaniPhrases = ["chicken biryani", "biryani ke ingredients", "biryani ingredients", "ingredients for chicken biryani", "chicken biryani ingredients", "chicken biryani ke ingredients", "biryani"];
    foreach ($biryaniPhrases as $phrase) {
        if (strpos($normalized, $phrase) !== false) {
            $isBiryani = true;
            break;
        }
    }

    if ($isBiryani) {
        $biryaniItems = [
            ["id" => 13, "qty" => 1, "unit" => "kg", "unitUr" => "کلو", "matched" => true], // Chicken
            ["id" => 19, "qty" => 1, "unit" => "kg", "unitUr" => "کلو", "matched" => true], // Rice
            ["id" => 11, "qty" => 500, "unit" => "g", "unitUr" => "گرام", "matched" => true], // Onions
            ["id" => 9,  "qty" => 500, "unit" => "g", "unitUr" => "گرام", "matched" => true], // Tomatoes
            ["id" => 10, "qty" => 500, "unit" => "g", "unitUr" => "گرام", "matched" => true], // Potatoes
            ["id" => 21, "qty" => 1, "unit" => "liters", "unitUr" => "لیٹر", "matched" => true], // Cooking oil
            ["id" => 23, "qty" => 1, "unit" => "packs", "unitUr" => "پیکٹ", "matched" => true], // Salt
            ["id" => null, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ", "matched" => false, "name" => "Biryani Masala / Spices", "nameUr" => "بریانی مصالحہ", "category" => "Pantry"],
            ["id" => null, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ", "matched" => false, "name" => "Ginger Garlic Paste", "nameUr" => "ادرک لہسن کا پیسٹ", "category" => "Pantry"],
            ["id" => null, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ", "matched" => false, "name" => "Yogurt / Dahi", "nameUr" => "دہی", "category" => "Dairy"],
            ["id" => null, "qty" => 1, "unit" => "piece", "unitUr" => "عدد", "matched" => false, "name" => "Fresh Mint / Pudina", "nameUr" => "پودینہ", "category" => "Vegetables"]
        ];

        $results = [];
        foreach ($biryaniItems as $item) {
            if ($item["matched"]) {
                $matchedProd = null;
                foreach ($products as $p) {
                    if ((int)$p["id"] === (int)$item["id"]) {
                        $matchedProd = $p;
                        break;
                    }
                }
                $results[] = [
                    "name" => $matchedProd ? $matchedProd["name"] : "Product Syncing",
                    "nameUr" => $matchedProd ? $matchedProd["nameUr"] : "نامعلوم چیز",
                    "category" => $matchedProd ? $matchedProd["category"] : "Pantry",
                    "price" => $matchedProd ? (float)$matchedProd["price"] : 1.99,
                    "qty" => $item["qty"],
                    "unit" => $item["unit"],
                    "unitUr" => $item["unitUr"],
                    "productId" => $item["id"],
                    "matched" => true,
                    "action" => "add"
                ];
            } else {
                $results[] = [
                    "name" => $item["name"],
                    "nameUr" => $item["nameUr"],
                    "category" => $item["category"],
                    "price" => 1.99,
                    "qty" => $item["qty"],
                    "unit" => $item["unit"],
                    "unitUr" => $item["unitUr"],
                    "productId" => null,
                    "matched" => false,
                    "action" => "add"
                ];
            }
        }
        return $results;
    }

    $isChai = false;
    $chaiPhrases = ["chai", "tea recipe", "tea ingredients", "make tea", "chai ke ingredients", "چائے", "green tea"];
    foreach ($chaiPhrases as $phrase) {
        if (strpos($normalized, $phrase) !== false) {
            $isChai = true;
            break;
        }
    }

    if ($isChai) {
        $chaiItems = [
            ["id" => 1, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ", "matched" => true], // Whole Milk
            ["id" => 18, "qty" => 1, "unit" => "box", "unitUr" => "ڈبہ", "matched" => true], // Green Tea / Chai
            ["id" => 22, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ", "matched" => true], // Sugar
            ["id" => null, "qty" => 1, "unit" => "piece", "unitUr" => "عدد", "matched" => false, "name" => "Ginger / Adrak", "nameUr" => "ادرک", "category" => "Vegetables"],
            ["id" => null, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ", "matched" => false, "name" => "Cardamom / Elaichi", "nameUr" => "الائچی", "category" => "Pantry"]
        ];

        $results = [];
        foreach ($chaiItems as $item) {
            if ($item["matched"]) {
                $matchedProd = null;
                foreach ($products as $p) {
                    if ((int)$p["id"] === (int)$item["id"]) {
                        $matchedProd = $p;
                        break;
                    }
                }
                $results[] = [
                    "name" => $matchedProd ? $matchedProd["name"] : "Product Syncing",
                    "nameUr" => $matchedProd ? $matchedProd["nameUr"] : "نامعلوم چیز",
                    "category" => $matchedProd ? $matchedProd["category"] : "Beverages",
                    "price" => $matchedProd ? (float)$matchedProd["price"] : 1.99,
                    "qty" => $item["qty"],
                    "unit" => $item["unit"],
                    "unitUr" => $item["unitUr"],
                    "productId" => $item["id"],
                    "matched" => true,
                    "action" => "add"
                ];
            } else {
                $results[] = [
                    "name" => $item["name"],
                    "nameUr" => $item["nameUr"],
                    "category" => $item["category"],
                    "price" => 1.99,
                    "qty" => $item["qty"],
                    "unit" => $item["unit"],
                    "unitUr" => $item["unitUr"],
                    "productId" => null,
                    "matched" => false,
                    "action" => "add"
                ];
            }
        }
        return $results;
    }

    $isFriedRice = false;
    $friedRicePhrases = ["fried rice", "egg fried rice", "fried rice ingredients", "fried rice recipe"];
    foreach ($friedRicePhrases as $phrase) {
        if (strpos($normalized, $phrase) !== false) {
            $isFriedRice = true;
            break;
        }
    }

    if ($isFriedRice) {
        $friedRiceItems = [
            ["id" => 2, "qty" => 1, "unit" => "dozen", "unitUr" => "درجن", "matched" => true], // Eggs
            ["id" => 19, "qty" => 1, "unit" => "kg", "unitUr" => "کلو", "matched" => true], // Rice
            ["id" => 21, "qty" => 1, "unit" => "pieces", "unitUr" => "عدد", "matched" => true], // Cooking oil
            ["id" => 11, "qty" => 1, "unit" => "kg", "unitUr" => "کلو", "matched" => true], // Onions
            ["id" => 23, "qty" => 1, "unit" => "packs", "unitUr" => "پیکٹ", "matched" => true], // Salt
            ["id" => null, "qty" => 1, "unit" => "bottle", "unitUr" => "بوتل", "matched" => false, "name" => "Soy Sauce", "nameUr" => "سویا ساس", "category" => "Pantry"],
            ["id" => null, "qty" => 1, "unit" => "bottle", "unitUr" => "بوتل", "matched" => false, "name" => "Vinegar", "nameUr" => "سرکہ", "category" => "Pantry"],
            ["id" => null, "qty" => 1, "unit" => "piece", "unitUr" => "عدد", "matched" => false, "name" => "Garlic / Lahsan", "nameUr" => "لہسن", "category" => "Vegetables"],
            ["id" => null, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ", "matched" => false, "name" => "White Pepper", "nameUr" => "سفید مرچ", "category" => "Pantry"]
        ];

        $results = [];
        foreach ($friedRiceItems as $item) {
            if ($item["matched"]) {
                $matchedProd = null;
                foreach ($products as $p) {
                    if ((int)$p["id"] === (int)$item["id"]) {
                        $matchedProd = $p;
                        break;
                    }
                }
                $results[] = [
                    "name" => $matchedProd ? $matchedProd["name"] : "Product Syncing",
                    "nameUr" => $matchedProd ? $matchedProd["nameUr"] : "نامعلوم چیز",
                    "category" => $matchedProd ? $matchedProd["category"] : "Pantry",
                    "price" => $matchedProd ? (float)$matchedProd["price"] : 1.99,
                    "qty" => $item["qty"],
                    "unit" => $item["unit"],
                    "unitUr" => $item["unitUr"],
                    "productId" => $item["id"],
                    "matched" => true,
                    "action" => "add"
                ];
            } else {
                $results[] = [
                    "name" => $item["name"],
                    "nameUr" => $item["nameUr"],
                    "category" => $item["category"],
                    "price" => 1.99,
                    "qty" => $item["qty"],
                    "unit" => $item["unit"],
                    "unitUr" => $item["unitUr"],
                    "productId" => null,
                    "matched" => false,
                    "action" => "add"
                ];
            }
        }
        return $results;
    }

    $isOmelette = false;
    $omelettePhrases = ["omelette", "omlet", "egg omelette", "omelette recipe", "omelette ingredients"];
    foreach ($omelettePhrases as $phrase) {
        if (strpos($normalized, $phrase) !== false) {
            $isOmelette = true;
            break;
        }
    }

    if ($isOmelette) {
        $omeletteItems = [
            ["id" => 2, "qty" => 1, "unit" => "dozen", "unitUr" => "درجن", "matched" => true], // Eggs
            ["id" => 11, "qty" => 1, "unit" => "kg", "unitUr" => "کلو", "matched" => true], // Onions
            ["id" => 9,  "qty" => 1, "unit" => "kg", "unitUr" => "کلو", "matched" => true], // Tomatoes
            ["id" => 21, "qty" => 1, "unit" => "pieces", "unitUr" => "عدد", "matched" => true], // Cooking oil
            ["id" => 23, "qty" => 1, "unit" => "packs", "unitUr" => "پیکٹ", "matched" => true], // Salt
            ["id" => null, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ", "matched" => false, "name" => "Green Chillies / Hari Mirch", "nameUr" => "ہری مرچیں", "category" => "Vegetables"],
            ["id" => null, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ", "matched" => false, "name" => "Black Pepper / Kali Mirch", "nameUr" => "کالی مرچ", "category" => "Pantry"],
            ["id" => null, "qty" => 1, "unit" => "piece", "unitUr" => "عدد", "matched" => false, "name" => "Coriander / Dhaniya", "nameUr" => "دھنیا", "category" => "Vegetables"]
        ];

        $results = [];
        foreach ($omeletteItems as $item) {
            if ($item["matched"]) {
                $matchedProd = null;
                foreach ($products as $p) {
                    if ((int)$p["id"] === (int)$item["id"]) {
                        $matchedProd = $p;
                        break;
                    }
                }
                $results[] = [
                    "name" => $matchedProd ? $matchedProd["name"] : "Product Syncing",
                    "nameUr" => $matchedProd ? $matchedProd["nameUr"] : "نامعلوم چیز",
                    "category" => $matchedProd ? $matchedProd["category"] : "Dairy",
                    "price" => $matchedProd ? (float)$matchedProd["price"] : 1.99,
                    "qty" => $item["qty"],
                    "unit" => $item["unit"],
                    "unitUr" => $item["unitUr"],
                    "productId" => $item["id"],
                    "matched" => true,
                    "action" => "add"
                ];
            } else {
                $results[] = [
                    "name" => $item["name"],
                    "nameUr" => $item["nameUr"],
                    "category" => $item["category"],
                    "price" => 1.99,
                    "qty" => $item["qty"],
                    "unit" => $item["unit"],
                    "unitUr" => $item["unitUr"],
                    "productId" => null,
                    "matched" => false,
                    "action" => "add"
                ];
            }
        }
        return $results;
    }

    $isAllFruits = false;
    $fruitPhrases = ["add all fruits", "all fruits", "healthy fruits", "healthy fruit", "fruits add karo", "phal add karo", "sare phal", "saare phal", "sare phalo", "saaray phal", "تمام پھل"];
    foreach ($fruitPhrases as $phrase) {
        if (strpos($normalized, $phrase) !== false) {
            $isAllFruits = true;
            break;
        }
    }

    if ($isAllFruits) {
        $fruitItems = [
            ["id" => 5, "qty" => 1, "unit" => "dozen", "unitUr" => "درجن"], // Bananas
            ["id" => 6, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"], // Apples
            ["id" => 7, "qty" => 1, "unit" => "dozen", "unitUr" => "درجن"], // Oranges
            ["id" => 8, "qty" => 1, "unit" => "piece", "unitUr" => "عدد"] // Mangoes
        ];

        $results = [];
        foreach ($fruitItems as $item) {
            $matchedProd = null;
            foreach ($products as $p) {
                if ((int)$p["id"] === (int)$item["id"]) {
                    $matchedProd = $p;
                    break;
                }
            }
            $results[] = [
                "name" => $matchedProd ? $matchedProd["name"] : "Product Syncing",
                "nameUr" => $matchedProd ? $matchedProd["nameUr"] : "نامعلوم چیز",
                "category" => $matchedProd ? $matchedProd["category"] : "Fruits",
                "price" => $matchedProd ? (float)$matchedProd["price"] : 1.99,
                "qty" => $item["qty"],
                "unit" => $item["unit"],
                "unitUr" => $item["unitUr"],
                "productId" => $item["id"],
                "matched" => true,
                "action" => "add"
            ];
        }
        return $results;
    }

    $isAllVegetables = false;
    $vegPhrases = ["add all vegetables", "all vegetables", "vegetables", "vegetable", "sabzi", "sabziyaan", "sabziyan", "sabzi add karo", "sari sabziyaan", "sari sabziyan", "saari sabziyan", "تمام سبزیاں"];
    foreach ($vegPhrases as $phrase) {
        if (strpos($normalized, $phrase) !== false) {
            $isAllVegetables = true;
            break;
        }
    }

    if ($isAllVegetables) {
        $vegItems = [
            ["id" => 9, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"], // Tomatoes
            ["id" => 10, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"], // Potatoes
            ["id" => 11, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"], // Onions
            ["id" => 12, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"] // Carrots
        ];

        $results = [];
        foreach ($vegItems as $item) {
            $matchedProd = null;
            foreach ($products as $p) {
                if ((int)$p["id"] === (int)$item["id"]) {
                    $matchedProd = $p;
                    break;
                }
            }
            $results[] = [
                "name" => $matchedProd ? $matchedProd["name"] : "Product Syncing",
                "nameUr" => $matchedProd ? $matchedProd["nameUr"] : "نامعلوم چیز",
                "category" => $matchedProd ? $matchedProd["category"] : "Vegetables",
                "price" => $matchedProd ? (float)$matchedProd["price"] : 1.99,
                "qty" => $item["qty"],
                "unit" => $item["unit"],
                "unitUr" => $item["unitUr"],
                "productId" => $item["id"],
                "matched" => true,
                "action" => "add"
            ];
        }
        return $results;
    }

    $isRecipeIngredients = false;
    $recipePhrases = ["recipe ingredients", "all recipe products", "all recipes", "recipe items", "recipe products", "recipe products list"];
    foreach ($recipePhrases as $phrase) {
        if (strpos($normalized, $phrase) !== false) {
            $isRecipeIngredients = true;
            break;
        }
    }

    if ($isRecipeIngredients) {
        $recipeItems = [
            ["id" => 19, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"], // Rice
            ["id" => 20, "qty" => 1, "unit" => "box", "unitUr" => "ڈبہ"], // Pasta
            ["id" => 21, "qty" => 1, "unit" => "piece", "unitUr" => "عدد"], // Cooking oil
            ["id" => 22, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"], // Sugar
            ["id" => 23, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"] // Salt
        ];

        $results = [];
        foreach ($recipeItems as $item) {
            $matchedProd = null;
            foreach ($products as $p) {
                if ((int)$p["id"] === (int)$item["id"]) {
                    $matchedProd = $p;
                    break;
                }
            }
            $results[] = [
                "name" => $matchedProd ? $matchedProd["name"] : "Product Syncing",
                "nameUr" => $matchedProd ? $matchedProd["nameUr"] : "نامعلوم چیز",
                "category" => $matchedProd ? $matchedProd["category"] : "Pantry",
                "price" => $matchedProd ? (float)$matchedProd["price"] : 1.99,
                "qty" => $item["qty"],
                "unit" => $item["unit"],
                "unitUr" => $item["unitUr"],
                "productId" => $item["id"],
                "matched" => true,
                "action" => "add"
            ];
        }
        return $results;
    }

    $isHealthyFoods = false;
    $healthyPhrases = ["healthy foods", "healthy food", "healthy items", "healthy products", "healthy groceries", "sehat bakhsh khorak"];
    foreach ($healthyPhrases as $phrase) {
        if (strpos($normalized, $phrase) !== false) {
            $isHealthyFoods = true;
            break;
        }
    }

    if ($isHealthyFoods) {
        $healthyItems = [
            ["id" => 18, "qty" => 1, "unit" => "box", "unitUr" => "ڈبہ"], // Green Tea
            ["id" => 5, "qty" => 1, "unit" => "dozen", "unitUr" => "درجن"], // Bananas
            ["id" => 6, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"], // Apples
            ["id" => 7, "qty" => 1, "unit" => "dozen", "unitUr" => "درجن"], // Oranges
            ["id" => 15, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"], // Salmon
            ["id" => 16, "qty" => 1, "unit" => "piece", "unitUr" => "عدد"] // Mineral Water
        ];

        $results = [];
        foreach ($healthyItems as $item) {
            $matchedProd = null;
            foreach ($products as $p) {
                if ((int)$p["id"] === (int)$item["id"]) {
                    $matchedProd = $p;
                    break;
                }
            }
            $results[] = [
                "name" => $matchedProd ? $matchedProd["name"] : "Product Syncing",
                "nameUr" => $matchedProd ? $matchedProd["nameUr"] : "نامعلوم چیز",
                "category" => $matchedProd ? $matchedProd["category"] : "Pantry",
                "price" => $matchedProd ? (float)$matchedProd["price"] : 1.99,
                "qty" => $item["qty"],
                "unit" => $item["unit"],
                "unitUr" => $item["unitUr"],
                "productId" => $item["id"],
                "matched" => true,
                "action" => "add"
            ];
        }
        return $results;
    }

    $numMap = [
        "one" => 1, "two" => 2, "three" => 3, "four" => 4, "five" => 5, "six" => 6, "seven" => 7, "eight" => 8, "nine" => 9, "ten" => 10,
        "eleven" => 11, "twelve" => 12, "dozen" => 12, "half" => 0.5, "couple" => 2, "a" => 1, "an" => 1, "some" => 1,
        "ایک" => 1, "ek" => 1, "دو" => 2, "do" => 2, "تین" => 3, "teen" => 3, "چار" => 4, "char" => 4, "پانچ" => 5, "panch" => 5,
        "چھ" => 6, "cheh" => 6, "che" => 6, "سات" => 7, "saat" => 7, "آٹھ" => 8, "aath" => 8, "نو" => 9, "nau" => 9, "no" => 9,
        "دس" => 10, "das" => 10, "درجن" => 12, "darjan" => 12, "adha" => 0.5, "آدھا" => 0.5
    ];

    $initialParts = preg_split('/\s*(?:and|also|plus|اور|aur|,)\s*/i', $normalized);
    $parts = [];

    foreach ($initialParts as $part) {
        $trimmed = trim($part);
        if (!$trimmed) continue;

        $words = preg_split('/\s+/', $trimmed);
        $currentGroup = [];
        
        for ($i = 0; $i < count($words); $i++) {
            $word = strtolower($words[$i]);
            $isDigit = preg_match('/^\d+(?:\.\d+)?$/', $word);
            $isNumWord = isset($numMap[$word]);
            $isRemovalWord = in_array($word, [
                "remove", "delete", "cancel", "subtract",
                "ہٹائیں", "نکالیں", "hatayen", "nikalen", "hatayein", "nikalein"
            ]);

            if ($i > 0 && ($isDigit || $isNumWord || $isRemovalWord)) {
                $parts[] = implode(" ", $currentGroup);
                $currentGroup = [$words[$i]];
            } else {
                $currentGroup[] = $words[$i];
            }
        }
        if (count($currentGroup) > 0) {
            $parts[] = implode(" ", $currentGroup);
        }
    }

    foreach ($parts as $part) {
        $trimmed = trim($part);
        if (!$trimmed) continue;

        $isRemoval = false;
        $removalWords = ["remove", "delete", "cancel", "subtract", "ہٹائیں", "نکالیں", "hatayen", "nikalen", "hatayein", "nikalein"];
        foreach ($removalWords as $rw) {
            if (php_starts_with($trimmed, $rw) || php_ends_with($trimmed, $rw)) {
                $isRemoval = true;
                break;
            }
        }

        $qty = 1;
        $textToMatch = $trimmed;

        $textToMatch = preg_replace('/^(please\s+)?(add|get|want|need|buy|bring|i want|i need|can i have|give me|grab|pick up)\s+/i', '', $textToMatch);
        $textToMatch = preg_replace('/^(پلیز\s+)?(شامل کریں|ڈالیں|لائیں|چاہیے|دیں)\s+/u', '', $textToMatch);
        $textToMatch = preg_replace('/\s+(please|now|shamil karein|شامل کریں|karein|کریں|dalein|ڈالیں|dein|دیں)$/u', '', $textToMatch);
        $textToMatch = trim($textToMatch);

        if (preg_match('/^(\d+(?:\.\d+)?)\s*(.*)/', $textToMatch, $digitMatch)) {
            $qty = (float)$digitMatch[1];
            $textToMatch = trim($digitMatch[2]);
        } else {
            $words = preg_split('/\s+/', $textToMatch);
            $firstWord = $words[0];
            if (isset($numMap[$firstWord])) {
                $qty = $numMap[$firstWord];
                $textToMatch = implode(" ", array_slice($words, 1));
            } else {
                foreach ($numMap as $key => $val) {
                    if (in_array($key, $words)) {
                        $qty = $val;
                        $textToMatch = trim(str_replace($key, '', $textToMatch));
                        break;
                    }
                }
            }
        }

        $textToMatch = preg_replace('/\s*(?:pound|pounds|lbs|lb|kg|kilo|kilos|gallon|gallons|box|boxes|bottle|bottles|packet|packets|pack|packs|of|کے|کا|کی)\s+/i', ' ', $textToMatch);
        $textToMatch = preg_replace('/\s*(?:درجن|پاؤنڈ|بوتل|عدد|پیکٹ|ڈبہ|ڈبے|کلو)\s*/u', ' ', $textToMatch);
        $textToMatch = preg_replace('/\s+/', ' ', $textToMatch);
        $textToMatch = trim($textToMatch);

        if (!$textToMatch) continue;

        // Simple fuzzy match in PHP
        $match = null;
        foreach ($products as $p) {
            $pName = strtolower(trim(isset($p['name']) ? $p['name'] : ''));
            $pNameUr = strtolower(trim(isset($p['nameUr']) ? $p['nameUr'] : ''));
            if ($pName === strtolower($textToMatch) || ($pNameUr && strtolower($textToMatch) === $pNameUr)) {
                $match = $p;
                break;
            }
        }
        if (!$match) {
            foreach ($products as $p) {
                $pName = strtolower(trim(isset($p['name']) ? $p['name'] : ''));
                if (strpos($pName, strtolower($textToMatch)) !== false || strpos(strtolower($textToMatch), $pName) !== false) {
                    $match = $p;
                    break;
                }
            }
        }

        if ($match) {
            $isAvailable = isset($match['status']) && strcasecmp($match['status'], 'Inactive') !== 0 && strcasecmp($match['status'], 'Unavailable') !== 0 && (!isset($match['stock_quantity']) || (int)$match['stock_quantity'] > 0 || !isset($match['stockQuantity']) || (int)$match['stockQuantity'] > 0);
            $results[] = [
                "name" => $match['name'],
                "nameUr" => $match['nameUr'],
                "category" => $match['category'],
                "price" => (float)$match['price'],
                "qty" => $qty,
                "unit" => $match['unit'],
                "unitUr" => $match['unitUr'],
                "productId" => $match['id'],
                "matched" => $isAvailable,
                "action" => $isRemoval ? "remove" : "add"
            ];
        } else {
            $results[] = [
                "name" => $textToMatch,
                "nameUr" => $textToMatch,
                "category" => "Pantry",
                "price" => 1.99,
                "qty" => $qty,
                "unit" => "item",
                "unitUr" => "عدد",
                "productId" => null,
                "matched" => false,
                "action" => $isRemoval ? "remove" : "add"
            ];
        }
    }

    return $results;
}

// Fetch lists of all categories, subcategories, brands, units, and currencies once for quick lookup
function getLookupData($conn) {
    $brands = $conn->query("SELECT * FROM brands")->fetchAll();
    $categories = $conn->query("SELECT * FROM categories")->fetchAll();
    $subcategories = $conn->query("SELECT * FROM subcategories")->fetchAll();
    $units = $conn->query("SELECT * FROM units")->fetchAll();
    $currencies = $conn->query("SELECT * FROM currencies")->fetchAll();
    return [$brands, $categories, $subcategories, $units, $currencies];
}

// Map database columns to matched relational names and fields matching JSON/Node output structure
function resolveProductFlatFields($product, $brands, $categories, $subcategories, $units, $currencies) {
    // Normalize brand
    $brandId = isset($product['brand_id']) ? $product['brand_id'] : (isset($product['brandId']) ? $product['brandId'] : '');
    $brandInput = isset($product['brand']) ? $product['brand'] : (isset($product['brandName']) ? $product['brandName'] : '');
    $brand = null;
    foreach ($brands as $b) {
        if (strcasecmp($b['id'], $brandId) === 0 || strcasecmp($b['name'], $brandInput) === 0) {
            $brand = $b;
            break;
        }
    }

    // Normalize category
    $categoryId = isset($product['category_id']) ? $product['category_id'] : (isset($product['categoryId']) ? $product['categoryId'] : '');
    $categoryInput = isset($product['category']) ? $product['category'] : '';
    $category = null;
    foreach ($categories as $c) {
        if (strcasecmp($c['id'], $categoryId) === 0 || strcasecmp($c['name'], $categoryInput) === 0) {
            $category = $c;
            break;
        }
    }

    // Normalize subcategory
    $subcategoryId = isset($product['subcategory_id']) ? $product['subcategory_id'] : (isset($product['subcategoryId']) ? $product['subcategoryId'] : '');
    $subcategoryInput = isset($product['subcategory']) ? $product['subcategory'] : (isset($product['subcategoryName']) ? $product['subcategoryName'] : (isset($product['sub_category']) ? $product['sub_category'] : ''));
    $subcategory = null;
    foreach ($subcategories as $s) {
        if (strcasecmp($s['id'], $subcategoryId) === 0 || strcasecmp($s['name'], $subcategoryInput) === 0) {
            $subcategory = $s;
            break;
        }
    }

    // Normalize unit
    $unitId = isset($product['unit_id']) ? $product['unit_id'] : (isset($product['unitId']) ? $product['unitId'] : '');
    $unitInput = isset($product['unit']) ? $product['unit'] : '';
    $unit = null;
    foreach ($units as $u) {
        if (strcasecmp($u['id'], $unitId) === 0 || strcasecmp($u['name'], $unitInput) === 0) {
            $unit = $u;
            break;
        }
    }

    // Normalize currency
    $currencyId = isset($product['currency_id']) ? $product['currency_id'] : (isset($product['currencyId']) ? $product['currencyId'] : (isset($product['currency']) ? $product['currency'] : ''));
    $currencyInput = isset($product['currencyCode']) ? $product['currencyCode'] : '';
    $currency = null;
    foreach ($currencies as $c) {
        if (strcasecmp($c['id'], $currencyId) === 0 || strcasecmp($c['code'], $currencyId) === 0 || strcasecmp($c['code'], $currencyInput) === 0) {
            $currency = $c;
            break;
        }
    }

    $resolvedBrandId = $brand ? $brand['id'] : ($brandId ?: "brand-general");
    $resolvedCategoryId = $category ? $category['id'] : ($categoryId ?: "Pantry");
    $resolvedSubcategoryId = $subcategory ? $subcategory['id'] : ($subcategoryId ?: "");
    $resolvedUnitId = $unit ? $unit['id'] : ($unitId ?: "unit-piece");
    $resolvedCurrencyId = $currency ? $currency['id'] : ($currencyId ?: "curr-pkr");

    $price = (float)$product['price'];
    $salePrice = (isset($product['sale_price']) && $product['sale_price'] !== null && $product['sale_price'] !== '') ? (float)$product['sale_price'] : ((isset($product['salePrice']) && $product['salePrice'] !== null && $product['salePrice'] !== '') ? (float)$product['salePrice'] : null);
    $stockQuantity = isset($product['stock_quantity']) ? (int)$product['stock_quantity'] : (isset($product['stockQuantity']) ? (int)$product['stockQuantity'] : 100);

    return [
        "id" => (int)$product['id'],
        "name" => $product['name'],
        "nameUr" => isset($product['name_ur']) ? $product['name_ur'] : (isset($product['nameUr']) ? $product['nameUr'] : $product['name']),
        "name_ur" => isset($product['name_ur']) ? $product['name_ur'] : (isset($product['nameUr']) ? $product['nameUr'] : $product['name']),
        "category" => $category ? $category['name'] : ($categoryInput ?: "Pantry"),
        "price" => $price,
        "img" => isset($product['img']) ? $product['img'] : '📦',
        "unit" => $unit ? $unit['name'] : ($unitInput ?: "Piece"),
        "unitUr" => $unit ? $unit['name_ur'] : (isset($product['unit_ur']) ? $product['unit_ur'] : (isset($product['unitUr']) ? $product['unitUr'] : "عدد")),
        "unit_ur" => $unit ? $unit['name_ur'] : (isset($product['unit_ur']) ? $product['unit_ur'] : (isset($product['unitUr']) ? $product['unitUr'] : "عدد")),
        "is_custom" => isset($product['is_custom']) ? (int)$product['is_custom'] : 1,
        "sku" => isset($product['sku']) ? $product['sku'] : null,
        "batchNumber" => isset($product['batch_number']) ? $product['batch_number'] : (isset($product['batchNumber']) ? $product['batchNumber'] : null),
        "batch_number" => isset($product['batch_number']) ? $product['batch_number'] : (isset($product['batchNumber']) ? $product['batchNumber'] : null),
        "manufacturingDate" => isset($product['manufacturing_date']) ? $product['manufacturing_date'] : (isset($product['manufacturingDate']) ? $product['manufacturingDate'] : null),
        "manufacturing_date" => isset($product['manufacturing_date']) ? $product['manufacturing_date'] : (isset($product['manufacturingDate']) ? $product['manufacturingDate'] : null),
        "expiryDate" => isset($product['expiry_date']) ? $product['expiry_date'] : (isset($product['expiryDate']) ? $product['expiryDate'] : null),
        "expiry_date" => isset($product['expiry_date']) ? $product['expiry_date'] : (isset($product['expiryDate']) ? $product['expiryDate'] : null),
        "stockQuantity" => $stockQuantity,
        "stock_quantity" => $stockQuantity,
        "description" => isset($product['description']) ? $product['description'] : null,
        "brandId" => $resolvedBrandId,
        "brand_id" => $resolvedBrandId,
        "categoryId" => $resolvedCategoryId,
        "category_id" => $resolvedCategoryId,
        "subcategoryId" => $resolvedSubcategoryId,
        "subcategory_id" => $resolvedSubcategoryId,
        "unitId" => $resolvedUnitId,
        "unit_id" => $resolvedUnitId,
        "currencyId" => $resolvedCurrencyId,
        "currency_id" => $resolvedCurrencyId,
        "currency" => $resolvedCurrencyId,
        "status" => isset($product['status']) ? $product['status'] : 'Active',
        "salePrice" => $salePrice,
        "sale_price" => $salePrice,
        "brandName" => $brand ? $brand['name'] : "General",
        "brandLogo" => $brand ? $brand['logo'] : "",
        "categoryUr" => $category ? $category['name_ur'] : "",
        "subcategoryName" => $subcategory ? $subcategory['name'] : "",
        "subcategoryNameUr" => $subcategory ? $subcategory['name_ur'] : "",
        "currencyCode" => $currency ? $currency['code'] : "PKR",
        "currencySymbol" => $currency ? $currency['symbol'] : "Rs"
    ];
}

switch ($action) {
    case 'health':
        echo json_encode(["status" => "ok", "platform" => "PHP " . phpversion(), "time" => date('Y-m-d H:i:s')]);
        break;

    // --- 1. USER AUTH DIRECTIVES
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $email = isset($body['email']) ? trim($body['email']) : '';
        $password = isset($body['password']) ? $body['password'] : '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "Email and password are required"]);
            break;
        }

        $stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE LOWER(email) = ?");
        $stmt->execute([strtolower($email)]);
        $user = $stmt->fetch();

        if (!$user || $user['password'] !== $password) {
            http_response_code(401);
            echo json_encode(["error" => "Invalid email or password"]);
            break;
        }

        // Return user context safely
        echo json_encode([
            "id" => $user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "role" => $user['role']
        ]);
        break;

    case 'register':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $name = isset($body['name']) ? trim($body['name']) : '';
        $email = isset($body['email']) ? trim($body['email']) : '';
        $password = isset($body['password']) ? $body['password'] : '';

        if (!$name || !$email || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            break;
        }

        // Check conflicts
        $stmt = $conn->prepare("SELECT id FROM users WHERE LOWER(email) = ?");
        $stmt->execute([strtolower($email)]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "Email already registered"]);
            break;
        }

        $userId = 'usr_' . uniqid();
        $stmt = $conn->prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'user')");
        $stmt->execute([$userId, $name, $email, $password]);

        echo json_encode([
            "id" => $userId,
            "name" => $name,
            "email" => $email,
            "role" => "user"
        ]);
        break;

    // --- 2. PRODUCT DIRECTIVES
    case 'get_products':
        $stmt = $conn->query("SELECT * FROM products ORDER BY id ASC");
        $products = $stmt->fetchAll();
        list($brands, $categories, $subcategories, $units, $currencies) = getLookupData($conn);
        $result = [];
        foreach ($products as $p) {
            $result[] = resolveProductFlatFields($p, $brands, $categories, $subcategories, $units, $currencies);
        }
        echo json_encode($result);
        break;

    case 'create_product':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        list($brands, $categories, $subcategories, $units, $currencies) = getLookupData($conn);

        $name = isset($body['name']) ? trim($body['name']) : '';
        $name_ur = isset($body['nameUr']) ? trim($body['nameUr']) : (isset($body['name_ur']) ? trim($body['name_ur']) : '');
        $price = isset($body['price']) ? (float)$body['price'] : 0.00;
        $img = isset($body['img']) ? trim($body['img']) : '📦';
        $unit = isset($body['unit']) ? trim($body['unit']) : 'item';
        $unit_ur = isset($body['unitUr']) ? trim($body['unitUr']) : (isset($body['unit_ur']) ? trim($body['unit_ur']) : 'عدد');

        if (!$name || $price === null || $price === '') {
            http_response_code(400);
            echo json_encode(["error" => "Missing product details"]);
            break;
        }

        // Relationship Normalizations with Name/ID fallbacks
        $brandId = isset($body['brandId']) ? trim($body['brandId']) : (isset($body['brand_id']) ? trim($body['brand_id']) : '');
        $brandName = isset($body['brand']) ? trim($body['brand']) : (isset($body['brandName']) ? trim($body['brandName']) : '');
        $matchedBrand = null;
        foreach ($brands as $b) {
            if (strcasecmp($b['id'], $brandId) === 0 || strcasecmp($b['name'], $brandName) === 0) {
                $matchedBrand = $b;
                break;
            }
        }
        $finalBrandId = $matchedBrand ? $matchedBrand['id'] : 'brand-general';

        $categoryId = isset($body['categoryId']) ? trim($body['categoryId']) : (isset($body['category_id']) ? trim($body['category_id']) : '');
        $categoryName = isset($body['category']) ? trim($body['category']) : '';
        $matchedCat = null;
        foreach ($categories as $c) {
            if (strcasecmp($c['id'], $categoryId) === 0 || strcasecmp($c['name'], $categoryName) === 0) {
                $matchedCat = $c;
                break;
            }
        }
        $finalCategoryId = $matchedCat ? $matchedCat['id'] : 'Pantry';

        $subcategoryId = isset($body['subcategoryId']) ? trim($body['subcategoryId']) : (isset($body['subcategory_id']) ? trim($body['subcategory_id']) : '');
        $subcategoryName = isset($body['subcategory']) ? trim($body['subcategory']) : (isset($body['subcategoryName']) ? trim($body['subcategoryName']) : (isset($body['sub_category']) ? trim($body['sub_category']) : ''));
        $matchedSub = null;
        foreach ($subcategories as $s) {
            if (strcasecmp($s['category_id'], $finalCategoryId) === 0 && (strcasecmp($s['id'], $subcategoryId) === 0 || strcasecmp($s['name'], $subcategoryName) === 0)) {
                $matchedSub = $s;
                break;
            }
        }
        if (!$matchedSub && $subcategoryName) {
            foreach ($subcategories as $s) {
                if (strcasecmp($s['id'], $subcategoryId) === 0 || strcasecmp($s['name'], $subcategoryName) === 0) {
                    $matchedSub = $s;
                    break;
                }
            }
        }
        $finalSubcategoryId = $matchedSub ? $matchedSub['id'] : null;

        $unitId = isset($body['unitId']) ? trim($body['unitId']) : (isset($body['unit_id']) ? trim($body['unit_id']) : '');
        $matchedUnit = null;
        foreach ($units as $u) {
            if (strcasecmp($u['id'], $unitId) === 0 || strcasecmp($u['name'], $unit) === 0) {
                $matchedUnit = $u;
                break;
            }
        }
        $finalUnitId = $matchedUnit ? $matchedUnit['id'] : 'unit-piece';

        $currencyId = isset($body['currencyId']) ? trim($body['currencyId']) : (isset($body['currency_id']) ? trim($body['currency_id']) : (isset($body['currency']) ? trim($body['currency']) : ''));
        $currencyCode = isset($body['currencyCode']) ? trim($body['currencyCode']) : '';
        $matchedCurrency = null;
        foreach ($currencies as $c) {
            if (strcasecmp($c['id'], $currencyId) === 0 || strcasecmp($c['code'], $currencyId) === 0 || strcasecmp($c['code'], $currencyCode) === 0) {
                $matchedCurrency = $c;
                break;
            }
        }
        $finalCurrencyId = $matchedCurrency ? $matchedCurrency['id'] : 'curr-pkr';

        $sku = isset($body['sku']) ? trim($body['sku']) : null;
        $batch_number = isset($body['batchNumber']) ? trim($body['batchNumber']) : (isset($body['batch_id']) ? trim($body['batch_id']) : (isset($body['batch_number']) ? trim($body['batch_number']) : null));
        $manufacturing_date = isset($body['manufacturingDate']) ? trim($body['manufacturingDate']) : (isset($body['manufacturing_date']) ? trim($body['manufacturing_date']) : null);
        $expiry_date = isset($body['expiryDate']) ? trim($body['expiryDate']) : (isset($body['expiry_date']) ? trim($body['expiry_date']) : null);
        $stock_quantity = isset($body['stockQuantity']) ? (int)$body['stockQuantity'] : (isset($body['stock_quantity']) ? (int)$body['stock_quantity'] : 100);
        $description = isset($body['description']) ? trim($body['description']) : null;
        $status = isset($body['status']) ? trim($body['status']) : 'Active';
        $sale_price = (isset($body['salePrice']) && $body['salePrice'] !== null && $body['salePrice'] !== '') ? (float)$body['salePrice'] : ((isset($body['sale_price']) && $body['sale_price'] !== null && $body['sale_price'] !== '') ? (float)$body['sale_price'] : null);

        $stmt = $conn->prepare("INSERT INTO products (
            name, name_ur, category, price, img, unit, unit_ur, is_custom,
            sku, batch_number, manufacturing_date, expiry_date, stock_quantity, description,
            brand_id, category_id, subcategory_id, unit_id, currency_id, status, sale_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $name,
            $name_ur ?: $name,
            $finalCategoryId,
            $price,
            $img,
            $unit,
            $unit_ur,
            $sku,
            $batch_number,
            $manufacturing_date,
            $expiry_date,
            $stock_quantity,
            $description,
            $finalBrandId,
            $finalCategoryId,
            $finalSubcategoryId,
            $finalUnitId,
            $finalCurrencyId,
            $status,
            $sale_price
        ]);
        
        $newId = $conn->lastInsertId();

        $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$newId]);
        $newProduct = $stmt->fetch();

        echo json_encode(resolveProductFlatFields($newProduct, $brands, $categories, $subcategories, $units, $currencies));
        break;

    case 'edit_product':
        $productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $body = getRequestBody();
        if (!$productId) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required"]);
            break;
        }

        $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$productId]);
        $existingProduct = $stmt->fetch();
        if (!$existingProduct) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
            break;
        }

        list($brands, $categories, $subcategories, $units, $currencies) = getLookupData($conn);

        $fields = [];
        $params = [];
        if (isset($body['name'])) { $fields[] = "`name` = ?"; $params[] = trim($body['name']); }
        if (isset($body['nameUr'])) { $fields[] = "`name_ur` = ?"; $params[] = trim($body['nameUr']); }
        if (isset($body['name_ur'])) { $fields[] = "`name_ur` = ?"; $params[] = trim($body['name_ur']); }
        if (isset($body['price'])) { $fields[] = "`price` = ?"; $params[] = (float)$body['price']; }
        if (isset($body['img'])) { $fields[] = "`img` = ?"; $params[] = trim($body['img']); }
        if (isset($body['unit'])) { $fields[] = "`unit` = ?"; $params[] = trim($body['unit']); }
        if (isset($body['unitUr'])) { $fields[] = "`unit_ur` = ?"; $params[] = trim($body['unitUr']); }
        if (isset($body['unit_ur'])) { $fields[] = "`unit_ur` = ?"; $params[] = trim($body['unit_ur']); }
        if (isset($body['sku'])) { $fields[] = "`sku` = ?"; $params[] = trim($body['sku']); }
        if (isset($body['batchNumber'])) { $fields[] = "`batch_number` = ?"; $params[] = trim($body['batchNumber']); }
        if (isset($body['batch_number'])) { $fields[] = "`batch_number` = ?"; $params[] = trim($body['batch_number']); }
        if (isset($body['manufacturingDate'])) { $fields[] = "`manufacturing_date` = ?"; $params[] = trim($body['manufacturingDate']); }
        if (isset($body['manufacturing_date'])) { $fields[] = "`manufacturing_date` = ?"; $params[] = trim($body['manufacturing_date']); }
        if (isset($body['expiryDate'])) { $fields[] = "`expiry_date` = ?"; $params[] = trim($body['expiryDate']); }
        if (isset($body['expiry_date'])) { $fields[] = "`expiry_date` = ?"; $params[] = trim($body['expiry_date']); }
        if (isset($body['stockQuantity'])) { $fields[] = "`stock_quantity` = ?"; $params[] = (int)$body['stockQuantity']; }
        if (isset($body['stock_quantity'])) { $fields[] = "`stock_quantity` = ?"; $params[] = (int)$body['stock_quantity']; }
        if (isset($body['description'])) { $fields[] = "`description` = ?"; $params[] = trim($body['description']); }
        if (isset($body['status'])) { $fields[] = "`status` = ?"; $params[] = trim($body['status']); }
        if (isset($body['salePrice'])) { $fields[] = "`sale_price` = ?"; $params[] = ($body['salePrice'] !== null && $body['salePrice'] !== '') ? (float)$body['salePrice'] : null; }
        if (isset($body['sale_price'])) { $fields[] = "`sale_price` = ?"; $params[] = ($body['sale_price'] !== null && $body['sale_price'] !== '') ? (float)$body['sale_price'] : null; }

        // Relationship validations & Case Normalizations with name fallback
        $categoryId = $existingProduct['category_id'];
        if (isset($body['categoryId']) || isset($body['category_id']) || isset($body['category'])) {
            $catIdInput = isset($body['categoryId']) ? trim($body['categoryId']) : (isset($body['category_id']) ? trim($body['category_id']) : '');
            $catNameInput = isset($body['category']) ? trim($body['category']) : '';
            $matchedCat = null;
            foreach ($categories as $c) {
                if (strcasecmp($c['id'], $catIdInput) === 0 || strcasecmp($c['name'], $catNameInput) === 0) {
                    $matchedCat = $c;
                    break;
                }
            }
            $categoryId = $matchedCat ? $matchedCat['id'] : 'Pantry';
            $fields[] = "`category_id` = ?";
            $params[] = $categoryId;
            $fields[] = "`category` = ?";
            $params[] = $categoryId;
        }

        if (isset($body['brandId']) || isset($body['brand_id']) || isset($body['brand'])) {
            $brandIdInput = isset($body['brandId']) ? trim($body['brandId']) : (isset($body['brand_id']) ? trim($body['brand_id']) : '');
            $brandNameInput = isset($body['brand']) ? trim($body['brand']) : '';
            $matchedBrand = null;
            foreach ($brands as $b) {
                if (strcasecmp($b['id'], $brandIdInput) === 0 || strcasecmp($b['name'], $brandNameInput) === 0) {
                    $matchedBrand = $b;
                    break;
                }
            }
            $fields[] = "`brand_id` = ?";
            $params[] = $matchedBrand ? $matchedBrand['id'] : 'brand-general';
        }

        if (isset($body['subcategoryId']) || isset($body['subcategory_id']) || isset($body['subcategory'])) {
            $subIdInput = isset($body['subcategoryId']) ? trim($body['subcategoryId']) : (isset($body['subcategory_id']) ? trim($body['subcategory_id']) : '');
            $subNameInput = isset($body['subcategory']) ? trim($body['subcategory']) : '';
            $matchedSub = null;
            foreach ($subcategories as $s) {
                if (strcasecmp($s['category_id'], $categoryId) === 0 && (strcasecmp($s['id'], $subIdInput) === 0 || strcasecmp($s['name'], $subNameInput) === 0)) {
                    $matchedSub = $s;
                    break;
                }
            }
            if (!$matchedSub && $subNameInput) {
                foreach ($subcategories as $s) {
                    if (strcasecmp($s['id'], $subIdInput) === 0 || strcasecmp($s['name'], $subNameInput) === 0) {
                        $matchedSub = $s;
                        break;
                    }
                }
            }
            $fields[] = "`subcategory_id` = ?";
            $params[] = $matchedSub ? $matchedSub['id'] : null;
        }

        if (isset($body['unitId']) || isset($body['unit_id']) || isset($body['unit'])) {
            $unitIdInput = isset($body['unitId']) ? trim($body['unitId']) : (isset($body['unit_id']) ? trim($body['unit_id']) : '');
            $unitNameInput = isset($body['unit']) ? trim($body['unit']) : '';
            $matchedUnit = null;
            foreach ($units as $u) {
                if (strcasecmp($u['id'], $unitIdInput) === 0 || strcasecmp($u['name'], $unitNameInput) === 0) {
                    $matchedUnit = $u;
                    break;
                }
            }
            $fields[] = "`unit_id` = ?";
            $params[] = $matchedUnit ? $matchedUnit['id'] : 'unit-piece';
        }

        if (isset($body['currencyId']) || isset($body['currency_id']) || isset($body['currency']) || isset($body['currencyCode'])) {
            $currIdInput = isset($body['currencyId']) ? trim($body['currencyId']) : (isset($body['currency_id']) ? trim($body['currency_id']) : (isset($body['currency']) ? trim($body['currency']) : ''));
            $currCodeInput = isset($body['currencyCode']) ? trim($body['currencyCode']) : '';
            $matchedCurrency = null;
            foreach ($currencies as $c) {
                if (strcasecmp($c['id'], $currIdInput) === 0 || strcasecmp($c['code'], $currIdInput) === 0 || strcasecmp($c['code'], $currCodeInput) === 0) {
                    $matchedCurrency = $c;
                    break;
                }
            }
            $fields[] = "`currency_id` = ?";
            $params[] = $matchedCurrency ? $matchedCurrency['id'] : 'curr-pkr';
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(["error" => "No mutable variables specified"]);
            break;
        }

        $params[] = $productId;
        $sql = "UPDATE products SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        // Fetch modified state
        $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$productId]);
        $updated = $stmt->fetch();
        
        echo json_encode(resolveProductFlatFields($updated, $brands, $categories, $subcategories, $units, $currencies));
        break;

    case 'delete_product':
        $productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$productId) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required"]);
            break;
        }
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$productId]);
        echo json_encode(["success" => true, "message" => "Product deleted from database"]);
        break;

    // --- 3. CUSTOMER CART DIRECTIVES
    case 'get_cart':
        $userId = isset($_GET['userId']) ? trim($_GET['userId']) : '';
        if (!$userId) {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required"]);
            break;
        }
        $stmt = $conn->prepare("SELECT product_id as productId, qty FROM cart_items WHERE user_id = ?");
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll();
        foreach ($items as &$i) {
            $i['productId'] = (int)$i['productId'];
            $i['qty'] = (int)$i['qty'];
        }
        echo json_encode($items);
        break;

    case 'set_cart_qty':
        $userId = isset($_GET['userId']) ? trim($_GET['userId']) : '';
        $body = getRequestBody();
        $productId = isset($body['productId']) ? (int)$body['productId'] : 0;
        $qty = isset($body['qty']) ? (int)$body['qty'] : 0;

        if (!$userId || !$productId) {
            http_response_code(400);
            echo json_encode(["error" => "Missing parameters"]);
            break;
        }

        if ($qty <= 0) {
            $stmt = $conn->prepare("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$userId, $productId]);
        } else {
            $stmt = $conn->prepare("INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE qty = ?");
            $stmt->execute([$userId, $productId, $qty, $qty]);
        }

        $stmt = $conn->prepare("SELECT product_id as productId, qty FROM cart_items WHERE user_id = ?");
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll();
        foreach ($items as &$i) {
            $i['productId'] = (int)$i['productId'];
            $i['qty'] = (int)$i['qty'];
        }
        echo json_encode($items);
        break;

    case 'sync_cart':
        $userId = isset($_GET['userId']) ? trim($_GET['userId']) : '';
        $body = getRequestBody(); // Should be array of { productId, qty }
        if (!$userId || !isset($body['items']) || !is_array($body['items'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid list sync payloads"]);
            break;
        }

        $conn->beginTransaction();
        try {
            // Delete initial cart state
            $stmt = $conn->prepare("DELETE FROM cart_items WHERE user_id = ?");
            $stmt->execute([$userId]);

            // Bulk insert new items
            $stmt = $conn->prepare("INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, ?)");
            foreach ($body['items'] as $item) {
                if (isset($item['productId']) && isset($item['qty']) && $item['qty'] > 0) {
                    $stmt->execute([$userId, (int)$item['productId'], (int)$item['qty']]);
                }
            }
            $conn->commit();
        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Bulk sync failed", "details" => $e->getMessage()]);
            break;
        }

        // Return current state
        $stmt = $conn->prepare("SELECT product_id as productId, qty FROM cart_items WHERE user_id = ?");
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll();
        foreach ($items as &$i) {
            $i['productId'] = (int)$i['productId'];
            $i['qty'] = (int)$i['qty'];
        }
        echo json_encode($items);
        break;

    case 'clear_cart':
        $userId = isset($_GET['userId']) ? trim($_GET['userId']) : '';
        if (!$userId) {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required"]);
            break;
        }
        $stmt = $conn->prepare("DELETE FROM cart_items WHERE user_id = ?");
        $stmt->execute([$userId]);
        echo json_encode([]);
        break;

    // --- 4. WISHLIST DIRECTIVES
    case 'get_favourites':
        $userId = isset($_GET['userId']) ? trim($_GET['userId']) : '';
        if (!$userId) {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required"]);
            break;
        }
        $stmt = $conn->prepare("SELECT product_id FROM favourites WHERE user_id = ?");
        $stmt->execute([$userId]);
        $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
        // Cast values to integer
        $ids = array_map('intval', $ids);
        echo json_encode($ids);
        break;

    case 'toggle_favourite':
        $userId = isset($_GET['userId']) ? trim($_GET['userId']) : '';
        $body = getRequestBody();
        $productId = isset($body['productId']) ? (int)$body['productId'] : 0;

        if (!$userId || !$productId) {
            http_response_code(400);
            echo json_encode(["error" => "Missing parameters"]);
            break;
        }

        $stmt = $conn->prepare("SELECT id FROM favourites WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$userId, $productId]);
        if ($stmt->fetch()) {
            // Delete
            $stmt = $conn->prepare("DELETE FROM favourites WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$userId, $productId]);
        } else {
            // Insert
            $stmt = $conn->prepare("INSERT INTO favourites (user_id, product_id) VALUES (?, ?)");
            $stmt->execute([$userId, $productId]);
        }

        // Return latest list
        $stmt = $conn->prepare("SELECT product_id FROM favourites WHERE user_id = ?");
        $stmt->execute([$userId]);
        $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $ids = array_map('intval', $ids);
        echo json_encode($ids);
        break;

    // --- 5. ORDERS & CHECKOUT DIRECTIVES
    case 'get_orders':
        $userId = isset($_GET['userId']) ? trim($_GET['userId']) : '';
        if (!$userId) {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required"]);
            break;
        }

        // Verify if user is admin
        $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (($user && $user['role'] === 'admin') || $userId === 'admin' || $userId === 'all') {
            $stmt = $conn->query("SELECT * FROM orders ORDER BY created_at DESC");
        } else {
            $stmt = $conn->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$userId]);
        }

        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($orders as &$order) {
            $order['id'] = is_numeric($order['id']) ? (int)$order['id'] : $order['id'];
            $order['userId'] = isset($order['user_id']) ? $order['user_id'] : $userId;
            $order['items'] = isset($order['items_json']) ? json_decode($order['items_json'], true) : [];
            if (!is_array($order['items'])) $order['items'] = [];
            unset($order['items_json']);
            $order['subtotal'] = (float)$order['subtotal'];
            $order['tax'] = (float)$order['tax'];
            $order['total'] = (float)$order['total'];
            $order['status'] = isset($order['status']) ? $order['status'] : 'Pending';
            $order['createdAt'] = isset($order['created_at']) ? $order['created_at'] : date('Y-m-d H:i:s');
            $order['paymentMethod'] = isset($order['payment_method']) ? $order['payment_method'] : 'card';
            $order['paymentStatus'] = isset($order['payment_status']) ? $order['payment_status'] : 'paid';
            $order['userEmail'] = isset($order['user_email']) ? $order['user_email'] : '';
            $order['paymentDetails'] = isset($order['payment_details']) ? json_decode($order['payment_details'], true) : [];
        }
        echo json_encode($orders);
        break;

    case 'create_order':
        $userId = isset($_GET['userId']) ? trim($_GET['userId']) : '';
        $body = getRequestBody();

        $items = isset($body['items']) ? $body['items'] : null;
        $subtotal = isset($body['subtotal']) ? (float)$body['subtotal'] : 0.00;
        $tax = isset($body['tax']) ? (float)$body['tax'] : 0.00;
        $total = isset($body['total']) ? (float)$body['total'] : 0.00;
        $currency = isset($body['currency']) ? trim($body['currency']) : 'USD';

        if (!$userId || !$items || !$total) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid order data"]);
            break;
        }

        $orderId = 'ORD-' . rand(100000, 999999);
        $itemsJson = json_encode($items);

        $conn->beginTransaction();
        try {
            // Write order
            // Add additional payment and user fields
            $userEmail = isset($body['userEmail']) ? trim($body['userEmail']) : '';
            $paymentMethod = isset($body['paymentMethod']) ? trim($body['paymentMethod']) : 'Cash on Delivery';
            $paymentStatus = isset($body['paymentStatus']) ? trim($body['paymentStatus']) : 'Pending';
            $paymentDetails = isset($body['paymentDetails']) ? json_encode($body['paymentDetails']) : '{}';

            $stmt = $conn->prepare("INSERT INTO orders (id, user_id, user_email, items_json, subtotal, tax, total, currency, status, payment_method, payment_details, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)");
            $stmt->execute([$orderId, $userId, $userEmail, $itemsJson, $subtotal, $tax, $total, $currency, $paymentMethod, $paymentDetails, $paymentStatus]);

            // Clear user cart
            $stmt = $conn->prepare("DELETE FROM cart_items WHERE user_id = ?");
            $stmt->execute([$userId]);

            // Deduct product stock quantity
            if (is_array($items)) {
                foreach ($items as $item) {
                    $pid = isset($item['id']) ? (int)$item['id'] : 0;
                    $qty = isset($item['qty']) ? (int)$item['qty'] : 1;
                    if ($pid > 0) {
                        $stmt = $conn->prepare("UPDATE products SET stock_quantity = GREATEST(0, CAST(stock_quantity AS SIGNED) - ?) WHERE id = ?");
                        $stmt->execute([$qty, $pid]);
                    }
                }
            }

            $conn->commit();
        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Checkout transaction crashed", "details" => $e->getMessage()]);
            break;
        }

        echo json_encode([
            "id" => $orderId,
            "userId" => $userId,
            "items" => $items,
            "subtotal" => $subtotal,
            "tax" => $tax,
            "total" => $total,
            "currency" => $currency,
            "status" => "Processing",
            "createdAt" => date('c')
        ]);
        break;

    case 'update_order_status':
        $orderId = isset($_GET['orderId']) ? trim($_GET['orderId']) : '';
        $body = getRequestBody();
        $status = isset($body['status']) ? trim($body['status']) : '';

        if (!$orderId || !$status) {
            http_response_code(400);
            echo json_encode(["error" => "Missing orderId or status"]);
            break;
        }

        $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$status, $orderId]);

        echo json_encode(["success" => true, "id" => $orderId, "status" => $status]);
        break;

    case 'delete_order':
        $orderId = isset($_GET['orderId']) ? trim($_GET['orderId']) : '';
        if (!$orderId) {
            http_response_code(400);
            echo json_encode(["error" => "Missing orderId"]);
            break;
        }

        $stmt = $conn->prepare("DELETE FROM orders WHERE id = ?");
        $stmt->execute([$orderId]);

        echo json_encode(["success" => true, "message" => "Order deleted successfully from database", "id" => $orderId]);
        break;

    // --- CATEGORIES DIRECTIVES
    case 'get_categories':
        $stmt = $conn->query("SELECT * FROM categories ORDER BY id ASC");
        $categories = $stmt->fetchAll();
        $result = [];
        foreach ($categories as $cat) {
            $result[] = [
                "id" => $cat['id'],
                "name" => $cat['name'],
                "nameUr" => $cat['name_ur'],
                "status" => isset($cat['status']) ? $cat['status'] : 'Active'
            ];
        }
        echo json_encode($result);
        break;

    case 'create_category':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $name = isset($body['name']) ? trim($body['name']) : '';
        $nameUr = isset($body['nameUr']) ? trim($body['nameUr']) : '';
        $status = isset($body['status']) ? trim($body['status']) : 'Active';
        if (!$name || !$nameUr) {
            http_response_code(400);
            echo json_encode(["error" => "Missing category details"]);
            break;
        }
        $id = str_replace(' ', '-', trim($name));
        $stmt = $conn->prepare("SELECT id FROM categories WHERE LOWER(id) = ? OR LOWER(name) = ?");
        $stmt->execute([strtolower($id), strtolower($name)]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "Category already exists"]);
            break;
        }
        $stmt = $conn->prepare("INSERT INTO categories (id, name, name_ur, status) VALUES (?, ?, ?, ?)");
        $stmt->execute([$id, $name, $nameUr, $status]);

        echo json_encode(["id" => $id, "name" => $name, "nameUr" => $nameUr, "status" => $status]);
        break;

    case 'edit_category':
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Category ID is required"]);
            break;
        }
        $body = getRequestBody();
        $name = isset($body['name']) ? trim($body['name']) : '';
        $nameUr = isset($body['nameUr']) ? trim($body['nameUr']) : '';
        $status = isset($body['status']) ? trim($body['status']) : 'Active';
        if (!$name || !$nameUr) {
            http_response_code(400);
            echo json_encode(["error" => "Missing category details"]);
            break;
        }
        $newId = str_replace(' ', '-', trim($name));
        $stmt = $conn->prepare("UPDATE categories SET id = ?, name = ?, name_ur = ?, status = ? WHERE id = ?");
        $stmt->execute([$newId, $name, $nameUr, $status, $id]);

        echo json_encode(["id" => $newId, "name" => $name, "nameUr" => $nameUr, "status" => $status]);
        break;

    case 'delete_category':
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Category ID is required"]);
            break;
        }
        $stmt = $conn->prepare("UPDATE products SET category = 'Pantry' WHERE category = ?");
        $stmt->execute([$id]);

        $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(["success" => true, "message" => "Category removed safely"]);
        break;

    // --- BRANDS DIRECTIVES
    case 'get_brands':
        $stmt = $conn->query("SELECT * FROM brands ORDER BY name ASC");
        $brands = $stmt->fetchAll();
        $result = [];
        foreach ($brands as $b) {
            $result[] = [
                "id" => $b['id'],
                "name" => $b['name'],
                "logo" => $b['logo'],
                "status" => $b['status']
            ];
        }
        echo json_encode($result);
        break;

    case 'create_brand':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $name = isset($body['name']) ? trim($body['name']) : '';
        $logo = isset($body['logo']) ? trim($body['logo']) : '';
        $status = isset($body['status']) ? trim($body['status']) : 'Active';
        if (!$name) {
            http_response_code(400);
            echo json_encode(["error" => "Missing brand name"]);
            break;
        }
        $id = 'brand-' . strtolower(str_replace(' ', '-', trim($name)));
        $stmt = $conn->prepare("SELECT id FROM brands WHERE LOWER(id) = ? OR LOWER(name) = ?");
        $stmt->execute([strtolower($id), strtolower($name)]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "Brand already exists"]);
            break;
        }
        $stmt = $conn->prepare("INSERT INTO brands (id, name, logo, status) VALUES (?, ?, ?, ?)");
        $stmt->execute([$id, $name, $logo, $status]);
        echo json_encode(["id" => $id, "name" => $name, "logo" => $logo, "status" => $status]);
        break;

    case 'edit_brand':
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Brand ID is required"]);
            break;
        }
        $body = getRequestBody();
        $name = isset($body['name']) ? trim($body['name']) : '';
        $logo = isset($body['logo']) ? trim($body['logo']) : '';
        $status = isset($body['status']) ? trim($body['status']) : 'Active';
        if (!$name) {
            http_response_code(400);
            echo json_encode(["error" => "Missing brand details"]);
            break;
        }
        $newId = 'brand-' . strtolower(str_replace(' ', '-', trim($name)));
        $stmt = $conn->prepare("UPDATE brands SET id = ?, name = ?, logo = ?, status = ? WHERE id = ?");
        $stmt->execute([$newId, $name, $logo, $status, $id]);
        echo json_encode(["id" => $newId, "name" => $name, "logo" => $logo, "status" => $status]);
        break;

    case 'delete_brand':
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Brand ID is required"]);
            break;
        }
        $stmt = $conn->prepare("DELETE FROM brands WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true, "message" => "Brand removed safely"]);
        break;

    // --- SUBCATEGORIES DIRECTIVES
    case 'get_subcategories':
        $stmt = $conn->query("SELECT * FROM subcategories ORDER BY name ASC");
        $subs = $stmt->fetchAll();
        $result = [];
        foreach ($subs as $s) {
            $result[] = [
                "id" => $s['id'],
                "categoryId" => $s['category_id'],
                "name" => $s['name'],
                "nameUr" => $s['name_ur'],
                "status" => $s['status']
            ];
        }
        echo json_encode($result);
        break;

    case 'create_subcategory':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $categoryId = isset($body['categoryId']) ? trim($body['categoryId']) : '';
        $name = isset($body['name']) ? trim($body['name']) : '';
        $nameUr = isset($body['nameUr']) ? trim($body['nameUr']) : '';
        $status = isset($body['status']) ? trim($body['status']) : 'Active';
        if (!$categoryId || !$name || !$nameUr) {
            http_response_code(400);
            echo json_encode(["error" => "Missing subcategory details"]);
            break;
        }
        $id = 'sub-' . strtolower(str_replace(' ', '-', trim($name)));
        $stmt = $conn->prepare("SELECT id FROM subcategories WHERE LOWER(id) = ? OR LOWER(name) = ?");
        $stmt->execute([strtolower($id), strtolower($name)]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "Subcategory already exists"]);
            break;
        }
        $stmt = $conn->prepare("INSERT INTO subcategories (id, category_id, name, name_ur, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$id, $categoryId, $name, $nameUr, $status]);
        echo json_encode(["id" => $id, "categoryId" => $categoryId, "name" => $name, "nameUr" => $nameUr, "status" => $status]);
        break;

    case 'edit_subcategory':
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Subcategory ID is required"]);
            break;
        }
        $body = getRequestBody();
        $categoryId = isset($body['categoryId']) ? trim($body['categoryId']) : '';
        $name = isset($body['name']) ? trim($body['name']) : '';
        $nameUr = isset($body['nameUr']) ? trim($body['nameUr']) : '';
        $status = isset($body['status']) ? trim($body['status']) : 'Active';
        if (!$categoryId || !$name || !$nameUr) {
            http_response_code(400);
            echo json_encode(["error" => "Missing subcategory details"]);
            break;
        }
        $newId = 'sub-' . strtolower(str_replace(' ', '-', trim($name)));
        $stmt = $conn->prepare("UPDATE subcategories SET id = ?, category_id = ?, name = ?, name_ur = ?, status = ? WHERE id = ?");
        $stmt->execute([$newId, $categoryId, $name, $nameUr, $status, $id]);
        echo json_encode(["id" => $newId, "categoryId" => $categoryId, "name" => $name, "nameUr" => $nameUr, "status" => $status]);
        break;

    case 'delete_subcategory':
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Subcategory ID is required"]);
            break;
        }
        $stmt = $conn->prepare("DELETE FROM subcategories WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true, "message" => "Subcategory removed safely"]);
        break;

    // --- UNITS DIRECTIVES
    case 'get_units':
        $stmt = $conn->query("SELECT * FROM units ORDER BY name ASC");
        $units = $stmt->fetchAll();
        $result = [];
        foreach ($units as $u) {
            $result[] = [
                "id" => $u['id'],
                "name" => $u['name'],
                "nameUr" => $u['name_ur'],
                "status" => $u['status']
            ];
        }
        echo json_encode($result);
        break;

    case 'create_unit':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $name = isset($body['name']) ? trim($body['name']) : '';
        $nameUr = isset($body['nameUr']) ? trim($body['nameUr']) : '';
        $status = isset($body['status']) ? trim($body['status']) : 'Active';
        if (!$name || !$nameUr) {
            http_response_code(400);
            echo json_encode(["error" => "Missing unit details"]);
            break;
        }
        $id = 'unit-' . strtolower(str_replace(' ', '-', trim($name)));
        $stmt = $conn->prepare("SELECT id FROM units WHERE LOWER(id) = ? OR LOWER(name) = ?");
        $stmt->execute([strtolower($id), strtolower($name)]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "Unit already exists"]);
            break;
        }
        $stmt = $conn->prepare("INSERT INTO units (id, name, name_ur, status) VALUES (?, ?, ?, ?)");
        $stmt->execute([$id, $name, $nameUr, $status]);
        echo json_encode(["id" => $id, "name" => $name, "nameUr" => $nameUr, "status" => $status]);
        break;

    case 'edit_unit':
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Unit ID is required"]);
            break;
        }
        $body = getRequestBody();
        $name = isset($body['name']) ? trim($body['name']) : '';
        $nameUr = isset($body['nameUr']) ? trim($body['nameUr']) : '';
        $status = isset($body['status']) ? trim($body['status']) : 'Active';
        if (!$name || !$nameUr) {
            http_response_code(400);
            echo json_encode(["error" => "Missing unit details"]);
            break;
        }
        $newId = 'unit-' . strtolower(str_replace(' ', '-', trim($name)));
        $stmt = $conn->prepare("UPDATE units SET id = ?, name = ?, name_ur = ?, status = ? WHERE id = ?");
        $stmt->execute([$newId, $name, $nameUr, $status, $id]);
        echo json_encode(["id" => $newId, "name" => $name, "nameUr" => $nameUr, "status" => $status]);
        break;

    case 'delete_unit':
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Unit ID is required"]);
            break;
        }
        $stmt = $conn->prepare("DELETE FROM units WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true, "message" => "Unit removed safely"]);
        break;

    // --- CURRENCIES DIRECTIVES
    case 'get_currencies':
        $stmt = $conn->query("SELECT * FROM currencies ORDER BY name ASC");
        $currencies = $stmt->fetchAll();
        $result = [];
        foreach ($currencies as $c) {
            $result[] = [
                "id" => $c['id'],
                "name" => $c['name'],
                "code" => $c['code'],
                "symbol" => $c['symbol'],
                "status" => $c['status']
            ];
        }
        echo json_encode($result);
        break;

    case 'create_currency':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $name = isset($body['name']) ? trim($body['name']) : '';
        $code = isset($body['code']) ? trim($body['code']) : '';
        $symbol = isset($body['symbol']) ? trim($body['symbol']) : '';
        $status = isset($body['status']) ? trim($body['status']) : 'Active';
        if (!$name || !$code || !$symbol) {
            http_response_code(400);
            echo json_encode(["error" => "Missing currency details"]);
            break;
        }
        $id = 'curr-' . strtolower(trim($code));
        $stmt = $conn->prepare("SELECT id FROM currencies WHERE LOWER(id) = ? OR LOWER(code) = ?");
        $stmt->execute([strtolower($id), strtolower($code)]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "Currency already exists"]);
            break;
        }
        $stmt = $conn->prepare("INSERT INTO currencies (id, name, code, symbol, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$id, $name, $code, $symbol, $status]);
        echo json_encode(["id" => $id, "name" => $name, "code" => $code, "symbol" => $symbol, "status" => $status]);
        break;

    case 'edit_currency':
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Currency ID is required"]);
            break;
        }
        $body = getRequestBody();
        $name = isset($body['name']) ? trim($body['name']) : '';
        $code = isset($body['code']) ? trim($body['code']) : '';
        $symbol = isset($body['symbol']) ? trim($body['symbol']) : '';
        $status = isset($body['status']) ? trim($body['status']) : 'Active';
        if (!$name || !$code || !$symbol) {
            http_response_code(400);
            echo json_encode(["error" => "Missing currency details"]);
            break;
        }
        $newId = 'curr-' . strtolower(trim($code));
        $stmt = $conn->prepare("UPDATE currencies SET id = ?, name = ?, code = ?, symbol = ?, status = ? WHERE id = ?");
        $stmt->execute([$newId, $name, $code, $symbol, $status, $id]);
        echo json_encode(["id" => $newId, "name" => $name, "code" => $code, "symbol" => $symbol, "status" => $status]);
        break;

    case 'delete_currency':
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Currency ID is required"]);
            break;
        }
        $stmt = $conn->prepare("DELETE FROM currencies WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true, "message" => "Currency removed safely"]);
        break;

    // --- 6. ADMIN SYSTEM INSIGHTS
    case 'admin_dashboard':
        $stmt = $conn->query("SELECT total, currency, items_json FROM orders");
        $orders = $stmt->fetchAll();

        $totalSales = 0.00;
        $orderCount = count($orders);
        $salesByCategory = [];

        foreach ($orders as $o) {
            $salesAmount = (float)$o['total'];
            // Normalize currency conversion for dashboard aggregation
            if ($o['currency'] === 'PKR') {
                $salesAmount /= 280;
            }
            $totalSales += $salesAmount;

            $items = json_decode($o['items_json'], true);
            if (is_array($items)) {
                foreach ($items as $item) {
                    $cat = isset($item['category']) ? $item['category'] : 'General';
                    $itemCost = (isset($item['price']) ? (float)$item['price'] : ((float)$item['unitPrice'] ?? 0)) * (int)$item['qty'];
                    if ($o['currency'] === 'PKR') {
                        $itemCost /= 280;
                    }
                    if (!isset($salesByCategory[$cat])) {
                        $salesByCategory[$cat] = 0.00;
                    }
                    $salesByCategory[$cat] += $itemCost;
                }
            }
        }

        $stmt = $conn->query("SELECT COUNT(*) FROM products");
        $pCount = (int)$stmt->fetchColumn();

        $stmt = $conn->query("SELECT COUNT(*) FROM users WHERE role = 'user'");
        $uCount = (int)$stmt->fetchColumn();

        // Get all recent orders
        $stmt = $conn->query("SELECT * FROM orders ORDER BY created_at DESC");
        $recentOrders = $stmt->fetchAll();
        foreach ($recentOrders as &$ro) {
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
        }

        echo json_encode([
            "totalSalesUsd" => round($totalSales, 2),
            "orderCount" => $orderCount,
            "productCount" => $pCount,
            "userCount" => $uCount,
            "recentOrders" => $recentOrders,
            "salesByCategory" => $salesByCategory
        ]);
        break;

    case 'get_admin_users':
        $stmt = $conn->query("SELECT id, name, email, password, role, created_at FROM users ORDER BY created_at DESC");
        $users = $stmt->fetchAll();
        echo json_encode($users);
        break;

    case 'create_admin_user':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $name = isset($body['name']) ? trim($body['name']) : '';
        $email = isset($body['email']) ? trim($body['email']) : '';
        $password = isset($body['password']) ? trim($body['password']) : '';
        $role = isset($body['role']) ? trim($body['role']) : 'user';

        if (!$name || !$email || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields for user registration"]);
            break;
        }

        $userId = 'usr_' . uniqid();
        $stmt = $conn->prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $name, $email, $password, $role]);

        echo json_encode([
            "id" => $userId,
            "name" => $name,
            "email" => $email,
            "role" => $role
        ]);
        break;

    case 'delete_admin_user':
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Missing user ID"]);
            break;
        }

        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true, "message" => "User deleted successfully"]);
        break;

    case 'ocr':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $imageBase64 = isset($body['imageBase64']) ? $body['imageBase64'] : '';
        $mimeType = isset($body['mimeType']) ? $body['mimeType'] : 'image/jpeg';

        if (!$imageBase64) {
            http_response_code(400);
            echo json_encode(["error" => "Image payload is required"]);
            break;
        }

        // Get GEMINI_API_KEY (Checks db.php variable, environment, and multiple .env paths)
        $apiKey = '';
        if (isset($gemini_api_key) && $gemini_api_key !== '' && strpos($gemini_api_key, 'YourActualGeminiAPIKeyHere') === false) {
            $apiKey = $gemini_api_key;
        }
        if (!$apiKey || strpos($apiKey, 'YourActualGeminiAPIKeyHere') !== false) {
            $apiKey = getenv('GEMINI_API_KEY');
        }
        if ((!$apiKey || strpos($apiKey, 'YourActualGeminiAPIKeyHere') !== false) && isset($_ENV['GEMINI_API_KEY'])) {
            $apiKey = $_ENV['GEMINI_API_KEY'];
        }
        if ((!$apiKey || strpos($apiKey, 'YourActualGeminiAPIKeyHere') !== false) && isset($_SERVER['GEMINI_API_KEY'])) {
            $apiKey = $_SERVER['GEMINI_API_KEY'];
        }

        // List of possible .env file paths to scan
        $envPaths = [
            __DIR__ . '/../.env',
            __DIR__ . '/.env',
            __DIR__ . '/../../.env'
        ];
        foreach ($envPaths as $envPath) {
            if ((!$apiKey || strpos($apiKey, 'YourActualGeminiAPIKeyHere') !== false) && file_exists($envPath)) {
                $envLines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($envLines as $line) {
                    $line = trim($line);
                    if (strpos($line, '#') === 0) continue;
                    if (strpos($line, '=') !== false) {
                        list($name, $value) = explode('=', $line, 2);
                        if (trim($name) === 'GEMINI_API_KEY') {
                            $val = trim(trim($value), " \t\n\r\0\x0B\"'");
                            if (strpos($val, 'YourActualGeminiAPIKeyHere') === false) {
                                $apiKey = $val;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (!$apiKey || strpos($apiKey, 'YourActualGeminiAPIKeyHere') !== false) {
            $apiKey = '';
        }

        if (!$apiKey) {
            http_response_code(500);
            echo json_encode([
                "error" => "GEMINI_API_KEY is not configured on the PHP server",
                "message" => "Please configure \$gemini_api_key in 'backend-php-mysql/db.php', or set the GEMINI_API_KEY environment variable, or create a .env file with GEMINI_API_KEY=your_key"
            ]);
            break;
        }

        // Strip headers from data URI if present
        if (strpos($imageBase64, ',') !== false) {
            $parts = explode(',', $imageBase64, 2);
            $imageBase64 = $parts[1];
        }

        // Fetch products catalog for matching
        $stmtProducts = $conn->query("SELECT * FROM products WHERE status = 'Active'");
        $allProductsRaw = $stmtProducts->fetchAll();
        list($brands, $categories, $subcategories, $units, $currencies) = getLookupData($conn);
        $resolvedProducts = [];
        $productListLines = [];
        foreach ($allProductsRaw as $p) {
            $rp = resolveProductFlatFields($p, $brands, $categories, $subcategories, $units, $currencies);
            $resolvedProducts[] = $rp;
            $productListLines[] = "- ID: {$rp['id']}, English Name: \"{$rp['name']}\", Urdu Name: \"" . (isset($rp['nameUr']) ? $rp['nameUr'] : '') . "\", Category: \"{$rp['category']}\", Price: {$rp['price']}, Unit: \"{$rp['unit']}\", Urdu Unit: \"" . (isset($rp['unitUr']) ? $rp['unitUr'] : '') . "\"";
        }
        $productListString = implode("\n", $productListLines);

        // Prepare prompt
        $prompt = "Analyze this image (which can be a supermarket invoice receipt, printed store memo, handwritten grocery list, commercial listing, or table structure) with deep focus. Your goal is to accurately transcribe and extract EVERY single product or grocery item.

Here is our exact store catalog of AVAILABLE PRODUCTS:
{$productListString}

INSTRUCTIONS:
1. Match each item on the image/receipt directly with a store catalog item above if a corresponding product exists (e.g., 'Nestle Milk' or 'Milk' matches 'Whole Milk', 'Farm Eggs' matches 'Large Eggs', 'Cooking Oil 1L' matches 'Cooking Oil', 'Basmati Rice' matches 'White Rice').
2. Set 'productId' to the integer ID of the matched catalog product and 'matched' to true. Set 'name', 'nameUr', 'category', 'price', 'unit', and 'unitUr' to match the store catalog item.
3. If an item on the receipt is NOT in our store catalog, set 'productId' to null, 'matched' to false, and extract its scanned name, unit price, quantity, and unit.
4. Return a strict JSON array matching the schema.";

        // Build payload for Gemini v1 API
        $payload = [
            "contents" => [
                [
                    "parts" => [
                        [
                            "inlineData" => [
                                "mimeType" => $mimeType,
                                "data" => $imageBase64
                            ]
                        ],
                        [
                            "text" => $prompt
                        ]
                    ]
                ]
            ],
            "generationConfig" => [
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
                            "unitUr" => [ "type" => "STRING" ],
                            "productId" => [ "type" => "INTEGER" ],
                            "matched" => [ "type" => "BOOLEAN" ]
                        ],
                        "required" => ["name", "nameUr", "category", "price", "qty", "unit", "unitUr"]
                    ]
                ]
            ]
        ];

        // Call Gemini API via curl with multi-model fallback loop
        $modelNames = ["gemini-2.5-flash", "gemini-3.6-flash"];
        $response = false;
        $httpCode = 0;
        $curlError = "";

        foreach ($modelNames as $modelName) {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/" . $modelName . ":generateContent?key=" . $apiKey;
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'User-Agent: aistudio-build'
            ]);

            // Disable SSL verification to prevent common local/XAMPP certificate authority configuration issues
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            // Add a reasonable timeout
            curl_setopt($ch, CURLOPT_TIMEOUT, 25);

            $response = curl_exec($ch);
            $curlError = curl_error($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($response !== false && $httpCode === 200) {
                break; // Succeeded!
            } else {
                error_log("Gemini OCR failed with model $modelName, trying next fallback. HTTP code: $httpCode, error: $curlError");
            }
        }

        // Graceful Fallback if Gemini failed completely
        if ($response === false || $httpCode !== 200) {
            error_log("All Gemini API calls failed or quota exceeded. Returning empty array to prevent adding guessed products.");
            echo json_encode([]);
            break;
        }

        $resDecoded = json_decode($response, true);
        if (!$resDecoded) {
            error_log("Failed to decode JSON response from Gemini: " . $response);
            http_response_code(500);
            echo json_encode(["error" => "Invalid JSON response from Gemini", "raw" => $response]);
            break;
        }
        $text = isset($resDecoded['candidates'][0]['content']['parts'][0]['text']) 
            ? $resDecoded['candidates'][0]['content']['parts'][0]['text'] 
            : '[]';

        // Sanitize response
        if (strpos($text, "```json") !== false) {
            $parts = explode("```json", $text);
            $parts = explode("```", $parts[1]);
            $text = $parts[0];
        } elseif (strpos($text, "```") !== false) {
            $parts = explode("```", $text);
            $parts = explode("```", $parts[1]);
            $text = $parts[0];
        }
        $text = trim($text);

        // Find array bounds
        $firstBracket = strpos($text, "[");
        $lastBracket = strrpos($text, "]");
        if ($firstBracket !== false && $lastBracket !== false && $lastBracket > $firstBracket) {
            $text = substr($text, $firstBracket, $lastBracket - $firstBracket + 1);
        }

        $items = json_decode($text, true);
        if (!is_array($items)) {
            $items = [];
        }

        // Map/Format items to standard format and run fuzzy catalog matching
        $coreTokens = ["milk", "doodh", "egg", "eggs", "anda", "anday", "cheese", "paneer", "butter", "makkhan", "banana", "bananas", "kela", "apple", "apples", "seb", "orange", "kinnow", "tomato", "tomatoes", "tamatar", "potato", "potatoes", "aaloo", "onion", "onions", "piaz", "chicken", "murghi", "beef", "qeema", "meat", "fish", "machli", "salmon", "coke", "cola", "pepsi", "water", "paani", "tea", "chai", "coffee", "rice", "chawal", "pasta", "macaroni", "oil", "ghee", "sugar", "chini", "salt", "namak", "flour", "atta"];

        $formatted = [];
        $seenNames = [];
        foreach ($items as $item) {
            $name = isset($item['name']) ? $item['name'] : (isset($item['itemName']) ? $item['itemName'] : 'Scanned Product');
            $nameUr = isset($item['nameUr']) ? $item['nameUr'] : (isset($item['urdu_name']) ? $item['urdu_name'] : $name);
            $category = isset($item['category']) ? $item['category'] : 'Pantry';
            $price = isset($item['price']) ? (float)$item['price'] : 1.99;
            $qty = isset($item['qty']) ? (int)$item['qty'] : (isset($item['quantity']) ? (int)$item['quantity'] : 1);
            if ($qty < 1) $qty = 1;
            $unit = isset($item['unit']) ? $item['unit'] : 'item';
            $unitUr = isset($item['unitUr']) ? $item['unitUr'] : 'عدد';
            $productId = isset($item['productId']) ? $item['productId'] : null;
            $matched = isset($item['matched']) ? (bool)$item['matched'] : false;

            // Fuzzy Match against catalog if productId not provided or invalid
            $matchedProduct = null;
            if ($productId) {
                foreach ($resolvedProducts as $rp) {
                    if ((int)$rp['id'] === (int)$productId) {
                        $matchedProduct = $rp;
                        break;
                    }
                }
            }

            if (!$matchedProduct) {
                // Exact or Substring matching
                $scannedLower = strtolower(trim($name));
                foreach ($resolvedProducts as $rp) {
                    $rpNameLower = strtolower(trim($rp['name']));
                    $rpNameUrLower = strtolower(trim(isset($rp['nameUr']) ? $rp['nameUr'] : (isset($rp['name_ur']) ? $rp['name_ur'] : '')));
                    if ($scannedLower === $rpNameLower || ($rpNameUrLower && $scannedLower === $rpNameUrLower)) {
                        $matchedProduct = $rp;
                        break;
                    }
                    if (strlen($rpNameLower) > 2 && (strpos($scannedLower, $rpNameLower) !== false || strpos($rpNameLower, $scannedLower) !== false)) {
                        $matchedProduct = $rp;
                        break;
                    }
                }
            }

            if (!$matchedProduct) {
                // Token Intersection Match
                $words = explode(" ", strtolower(trim($name)));
                foreach ($words as $w) {
                    $wClean = trim($w, ".,/#!$%^&*();:{}=-_`~()");
                    if (strlen($wClean) > 2 && in_array($wClean, $coreTokens)) {
                        foreach ($resolvedProducts as $rp) {
                            $rpNameLower = strtolower($rp['name']);
                            if (strpos($rpNameLower, $wClean) !== false) {
                                $matchedProduct = $rp;
                                break 2;
                            }
                        }
                    }
                }
            }

            if ($matchedProduct) {
                $name = $matchedProduct['name'];
                $nameUr = isset($matchedProduct['nameUr']) ? $matchedProduct['nameUr'] : (isset($matchedProduct['name_ur']) ? $matchedProduct['name_ur'] : $nameUr);
                $category = $matchedProduct['category'];
                $price = (float)$matchedProduct['price'];
                $unit = $matchedProduct['unit'];
                $unitUr = isset($matchedProduct['unitUr']) ? $matchedProduct['unitUr'] : (isset($matchedProduct['unit_ur']) ? $matchedProduct['unit_ur'] : $unitUr);
                $productId = (int)$matchedProduct['id'];
                $matched = true;
            }

            $nameKey = strtolower(trim($name));
            if (!in_array($nameKey, $seenNames)) {
                $seenNames[] = $nameKey;
                $formatted[] = [
                    "name" => $name,
                    "nameUr" => $nameUr,
                    "category" => $category,
                    "price" => $price,
                    "qty" => $qty,
                    "unit" => $unit,
                    "unitUr" => $unitUr,
                    "productId" => $productId,
                    "matched" => $matched,
                    "action" => "add"
                ];
            }
        }

        echo json_encode($formatted);
        break;

    case 'smart_search':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $query = isset($body['query']) ? $body['query'] : '';
        if (!$query) {
            http_response_code(400);
            echo json_encode(["error" => "Query payload is required"]);
            break;
        }

        // Fetch products catalog for matching
        $stmtProducts = $conn->query("SELECT * FROM products ORDER BY id ASC");
        $allProductsRaw = $stmtProducts->fetchAll();
        list($brands, $categories, $subcategories, $units, $currencies) = getLookupData($conn);
        $resolvedProducts = [];
        foreach ($allProductsRaw as $p) {
            $resolvedProducts[] = resolveProductFlatFields($p, $brands, $categories, $subcategories, $units, $currencies);
        }

        $norm = strtolower(trim($query));
        $apiResponse = null;

        $recipeSynonyms = [
            "biryani" => ["biryani", "بریانی", "biriyani", "briyani"],
            "pulao" => ["pulao", "پلاؤ", "پلاو", "chicken pulao", "mutton pulao", "beef pulao", "yakhni pulao"],
            "karahi" => ["karahi", "کڑاہی", "chicken karahi", "mutton karahi"],
            "nihari" => ["nihari", "نہاری", "beef nihari"],
            "haleem" => ["haleem", "daleem", "حلیم"],
            "pasta" => ["pasta", "spaghetti", "lasagna", "پاستا"],
            "burger" => ["burger", "chicken burger", "beef burger", "برگر"],
            "sandwich" => ["sandwich", "club sandwich", "سینڈوچ"],
            "salad" => ["salad", "fresh salad", "سلاد"],
            "soup" => ["soup", "chicken corn soup", "سوپ"],
            "kheer" => ["kheer", "rice pudding", "کھیر"],
            "daal" => ["daal", "daal chawal", "دال"],
            "chai" => ["chai", "tea", "چائے", "chaye", "sabz chai", "green tea", "سبز چائے"],
            "tea" => ["chai", "tea", "چائے", "chaye", "sabz chai", "green tea", "سبز چائے"],
            "fried rice" => ["fried rice", "friedrice", "فرائیڈ رائس", "چاول"],
            "omelette" => ["omelette", "omlet", "آملیٹ", "anda", "anday", "انڈہ", "انڈے"],
            "pizza" => ["pizza", "پیزا"],
            "sushi" => ["sushi", "سوشی"],
            "chocolate cake" => ["chocolate cake", "cake", "کیک", "چاکلیٹ کیک"]
        ];

        $matchedRecipeKey = '';
        foreach ($recipeSynonyms as $key => $syns) {
            foreach ($syns as $syn) {
                if (strpos($norm, $syn) !== false) {
                    $matchedRecipeKey = $key;
                    break 2;
                }
            }
        }

        if ($matchedRecipeKey !== '') {
            $recipeSpecs = [
                "biryani" => [
                    "name" => "Chicken Biryani",
                    "nameUr" => "چکن بریانی",
                    "ingredients" => [
                        ["searchTerms" => ["chicken", "breast", "مرغی"], "fallbackName" => "Chicken Breast", "fallbackNameUr" => "مرغی کا گوشت", "fallbackCategory" => "Meat", "fallbackPrice" => 2237.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["rice", "chawal", "چاول"], "fallbackName" => "White Rice", "fallbackNameUr" => "چاول", "fallbackCategory" => "Pantry", "fallbackPrice" => 837.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["onion", "piaz", "پیاز"], "fallbackName" => "Onions", "fallbackNameUr" => "پیاز", "fallbackCategory" => "Vegetables", "fallbackPrice" => 333.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["tomato", "tamatar", "ٹماٹر"], "fallbackName" => "Tomatoes", "fallbackNameUr" => "ٹماٹر", "fallbackCategory" => "Vegetables", "fallbackPrice" => 697.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["potato", "aaloo", "آلو"], "fallbackName" => "Potatoes", "fallbackNameUr" => "آلو", "fallbackCategory" => "Vegetables", "fallbackPrice" => 361.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["oil", "koking", "ککنگ", "تیل"], "fallbackName" => "Cooking Oil", "fallbackNameUr" => "ککنگ آئل", "fallbackCategory" => "Pantry", "fallbackPrice" => 2517.2, "qty" => 1, "unit" => "liter", "unitUr" => "لیٹر"],
                        ["searchTerms" => ["salt", "namak", "نمک"], "fallbackName" => "Salt", "fallbackNameUr" => "نمک", "fallbackCategory" => "Pantry", "fallbackPrice" => 361.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["yogurt", "dahi", "دہی"], "fallbackName" => "Yogurt / Dahi", "fallbackNameUr" => "دہی", "fallbackCategory" => "Dairy", "fallbackPrice" => 300.0, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["masala", "spices", "مصالحہ"], "fallbackName" => "Biryani Masala", "fallbackNameUr" => "بریانی مصالحہ", "fallbackCategory" => "Pantry", "fallbackPrice" => 150.0, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"]
                    ]
                ],
                "pulao" => [
                    "name" => "Chicken Pulao",
                    "nameUr" => "چکن پلاؤ",
                    "ingredients" => [
                        ["searchTerms" => ["chicken", "breast", "مرغی"], "fallbackName" => "Chicken Breast", "fallbackNameUr" => "مرغی کا گوشت", "fallbackCategory" => "Meat", "fallbackPrice" => 2237.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["rice", "chawal", "چاول"], "fallbackName" => "White Rice", "fallbackNameUr" => "چاول", "fallbackCategory" => "Pantry", "fallbackPrice" => 837.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["onion", "piaz", "پیاز"], "fallbackName" => "Onions", "fallbackNameUr" => "پیاز", "fallbackCategory" => "Vegetables", "fallbackPrice" => 333.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["tomato", "tamatar", "ٹماٹر"], "fallbackName" => "Tomatoes", "fallbackNameUr" => "ٹماٹر", "fallbackCategory" => "Vegetables", "fallbackPrice" => 697.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["potato", "aaloo", "آلو"], "fallbackName" => "Potatoes", "fallbackNameUr" => "آلو", "fallbackCategory" => "Vegetables", "fallbackPrice" => 361.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["oil", "koking", "ککنگ", "تیل"], "fallbackName" => "Cooking Oil", "fallbackNameUr" => "ککنگ آئل", "fallbackCategory" => "Pantry", "fallbackPrice" => 2517.2, "qty" => 1, "unit" => "liter", "unitUr" => "لیٹر"],
                        ["searchTerms" => ["salt", "namak", "نمک"], "fallbackName" => "Salt", "fallbackNameUr" => "نمک", "fallbackCategory" => "Pantry", "fallbackPrice" => 361.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["pulao masala", "whole spices", "مصالحہ"], "fallbackName" => "Pulao Spices", "fallbackNameUr" => "پلاؤ مصالحہ جات", "fallbackCategory" => "Pantry", "fallbackPrice" => 180.0, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["ginger garlic", "adrak lahsan", "ادرک لہسن"], "fallbackName" => "Ginger Garlic Paste", "fallbackNameUr" => "ادرک لہسن کا پیسٹ", "fallbackCategory" => "Pantry", "fallbackPrice" => 150.0, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["yogurt", "dahi", "دہی"], "fallbackName" => "Yogurt / Dahi", "fallbackNameUr" => "دہی", "fallbackCategory" => "Dairy", "fallbackPrice" => 300.0, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"]
                    ]
                ],
                "karahi" => [
                    "name" => "Chicken Karahi",
                    "nameUr" => "چکن کڑاہی",
                    "ingredients" => [
                        ["searchTerms" => ["chicken", "breast", "مرغی"], "fallbackName" => "Chicken Breast", "fallbackNameUr" => "مرغی کا گوشت", "fallbackCategory" => "Meat", "fallbackPrice" => 2237.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["tomato", "tamatar", "ٹماٹر"], "fallbackName" => "Tomatoes", "fallbackNameUr" => "ٹماٹر", "fallbackCategory" => "Vegetables", "fallbackPrice" => 697.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["onion", "piaz", "پیاز"], "fallbackName" => "Onions", "fallbackNameUr" => "پیاز", "fallbackCategory" => "Vegetables", "fallbackPrice" => 333.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["oil", "koking", "ککنگ", "تیل"], "fallbackName" => "Cooking Oil", "fallbackNameUr" => "ککنگ آئل", "fallbackCategory" => "Pantry", "fallbackPrice" => 2517.2, "qty" => 1, "unit" => "liter", "unitUr" => "لیٹر"],
                        ["searchTerms" => ["salt", "namak", "نمک"], "fallbackName" => "Salt", "fallbackNameUr" => "نمک", "fallbackCategory" => "Pantry", "fallbackPrice" => 361.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["karahi masala", "spices", "کڑاہی مصالحہ"], "fallbackName" => "Karahi Masala", "fallbackNameUr" => "کڑاہی مصالحہ", "fallbackCategory" => "Pantry", "fallbackPrice" => 180.0, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"]
                    ]
                ],
                "nihari" => [
                    "name" => "Beef Nihari",
                    "nameUr" => "بیف نہاری",
                    "ingredients" => [
                        ["searchTerms" => ["beef", "goshat", "گوشت"], "fallbackName" => "Ground Beef", "fallbackNameUr" => "بیف گوشت", "fallbackCategory" => "Meat", "fallbackPrice" => 2800.0, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["rice", "chawal", "چاول"], "fallbackName" => "White Rice", "fallbackNameUr" => "چاول", "fallbackCategory" => "Pantry", "fallbackPrice" => 837.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["onion", "piaz", "پیاز"], "fallbackName" => "Onions", "fallbackNameUr" => "پیاز", "fallbackCategory" => "Vegetables", "fallbackPrice" => 333.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["oil", "koking", "ککنگ", "تیل"], "fallbackName" => "Cooking Oil", "fallbackNameUr" => "ککنگ آئل", "fallbackCategory" => "Pantry", "fallbackPrice" => 2517.2, "qty" => 1, "unit" => "liter", "unitUr" => "لیٹر"],
                        ["searchTerms" => ["salt", "namak", "نمک"], "fallbackName" => "Salt", "fallbackNameUr" => "نمک", "fallbackCategory" => "Pantry", "fallbackPrice" => 361.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"]
                    ]
                ],
                "pasta" => [
                    "name" => "Creamy Pasta",
                    "nameUr" => "کریمی پاستا",
                    "ingredients" => [
                        ["searchTerms" => ["pasta", "macaroni", "پاستا"], "fallbackName" => "Italian Pasta", "fallbackNameUr" => "پاستا", "fallbackCategory" => "Pantry", "fallbackPrice" => 500.0, "qty" => 1, "unit" => "box", "unitUr" => "ڈبہ"],
                        ["searchTerms" => ["milk", "doodh", "دودھ"], "fallbackName" => "Whole Milk", "fallbackNameUr" => "خالص دودھ", "fallbackCategory" => "Dairy", "fallbackPrice" => 1117.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["cheese", "paneer", "پنیر"], "fallbackName" => "Cheddar Cheese", "fallbackNameUr" => "پنیر", "fallbackCategory" => "Dairy", "fallbackPrice" => 1537.2, "qty" => 1, "unit" => "piece", "unitUr" => "عدد"],
                        ["searchTerms" => ["butter", "makkhan", "مکھن"], "fallbackName" => "Butter", "fallbackNameUr" => "مکھن", "fallbackCategory" => "Dairy", "fallbackPrice" => 1341.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["chicken", "breast", "مرغی"], "fallbackName" => "Chicken Breast", "fallbackNameUr" => "مرغی کا گوشت", "fallbackCategory" => "Meat", "fallbackPrice" => 2237.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"]
                    ]
                ],
                "chai" => [
                    "name" => "Chai/Tea",
                    "nameUr" => "چائے",
                    "ingredients" => [
                        ["searchTerms" => ["milk", "doodh", "دودھ"], "fallbackName" => "Whole Milk", "fallbackNameUr" => "خالص دودھ", "fallbackCategory" => "Dairy", "fallbackPrice" => 1117.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["green tea", "tea", "chai", "چائے", "سبز چائے"], "fallbackName" => "Green Tea", "fallbackNameUr" => "سبز چائے", "fallbackCategory" => "Beverages", "fallbackPrice" => 977.2, "qty" => 1, "unit" => "box", "unitUr" => "ڈبہ"],
                        ["searchTerms" => ["sugar", "chini", "چینی"], "fallbackName" => "Sugar", "fallbackNameUr" => "چینی", "fallbackCategory" => "Pantry", "fallbackPrice" => 697.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["ginger", "adrak", "ادرک"], "fallbackName" => "Ginger / Adrak", "fallbackNameUr" => "ادرک", "fallbackCategory" => "Vegetables", "fallbackPrice" => 150.0, "qty" => 1, "unit" => "piece", "unitUr" => "عدد"],
                        ["searchTerms" => ["cardamom", "elaichi", "الائچی"], "fallbackName" => "Cardamom / Elaichi", "fallbackNameUr" => "الائچی", "fallbackCategory" => "Pantry", "fallbackPrice" => 200.0, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"]
                    ]
                ],
                "tea" => [
                    "name" => "Chai/Tea",
                    "nameUr" => "چائے",
                    "ingredients" => [
                        ["searchTerms" => ["milk", "doodh", "دودھ"], "fallbackName" => "Whole Milk", "fallbackNameUr" => "خالص دودھ", "fallbackCategory" => "Dairy", "fallbackPrice" => 1117.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["green tea", "tea", "chai", "چائے", "سبز چائے"], "fallbackName" => "Green Tea", "fallbackNameUr" => "سبز چائے", "fallbackCategory" => "Beverages", "fallbackPrice" => 977.2, "qty" => 1, "unit" => "box", "unitUr" => "ڈبہ"],
                        ["searchTerms" => ["sugar", "chini", "چینی"], "fallbackName" => "Sugar", "fallbackNameUr" => "چینی", "fallbackCategory" => "Pantry", "fallbackPrice" => 697.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["ginger", "adrak", "ادرک"], "fallbackName" => "Ginger / Adrak", "fallbackNameUr" => "ادرک", "fallbackCategory" => "Vegetables", "fallbackPrice" => 150.0, "qty" => 1, "unit" => "piece", "unitUr" => "عدد"],
                        ["searchTerms" => ["cardamom", "elaichi", "الائچی"], "fallbackName" => "Cardamom / Elaichi", "fallbackNameUr" => "الائچی", "fallbackCategory" => "Pantry", "fallbackPrice" => 200.0, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"]
                    ]
                ],
                "fried rice" => [
                    "name" => "Egg Fried Rice",
                    "nameUr" => "انڈے فرائیڈ رائس",
                    "ingredients" => [
                        ["searchTerms" => ["egg", "anda", "انڈے", "انڈہ"], "fallbackName" => "Large Eggs", "fallbackNameUr" => "انڈے", "fallbackCategory" => "Dairy", "fallbackPrice" => 1201.2, "qty" => 1, "unit" => "dozen", "unitUr" => "درجن"],
                        ["searchTerms" => ["rice", "chawal", "چاول"], "fallbackName" => "White Rice", "fallbackNameUr" => "چاول", "fallbackCategory" => "Pantry", "fallbackPrice" => 837.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["onion", "piaz", "پیاز"], "fallbackName" => "Onions", "fallbackNameUr" => "پیاز", "fallbackCategory" => "Vegetables", "fallbackPrice" => 333.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["oil", "koking", "ککنگ", "تیل"], "fallbackName" => "Cooking Oil", "fallbackNameUr" => "ککنگ آئل", "fallbackCategory" => "Pantry", "fallbackPrice" => 2517.2, "qty" => 1, "unit" => "liter", "unitUr" => "لیٹر"],
                        ["searchTerms" => ["salt", "namak", "نمک"], "fallbackName" => "Salt", "fallbackNameUr" => "نمک", "fallbackCategory" => "Pantry", "fallbackPrice" => 361.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["soy sauce", "sauce", "سویا ساس"], "fallbackName" => "Soy Sauce", "fallbackNameUr" => "سویا ساس", "fallbackCategory" => "Pantry", "fallbackPrice" => 250.0, "qty" => 1, "unit" => "bottle", "unitUr" => "بوتل"]
                    ]
                ],
                "omelette" => [
                    "name" => "Omelette",
                    "nameUr" => "آملیٹ",
                    "ingredients" => [
                        ["searchTerms" => ["egg", "anda", "انڈے", "انڈہ"], "fallbackName" => "Large Eggs", "fallbackNameUr" => "انڈے", "fallbackCategory" => "Dairy", "fallbackPrice" => 1201.2, "qty" => 1, "unit" => "dozen", "unitUr" => "درجن"],
                        ["searchTerms" => ["onion", "piaz", "پیاز"], "fallbackName" => "Onions", "fallbackNameUr" => "پیاز", "fallbackCategory" => "Vegetables", "fallbackPrice" => 333.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["tomato", "tamatar", "ٹماٹر"], "fallbackName" => "Tomatoes", "fallbackNameUr" => "ٹماٹر", "fallbackCategory" => "Vegetables", "fallbackPrice" => 697.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["oil", "koking", "ککنگ", "تیل"], "fallbackName" => "Cooking Oil", "fallbackNameUr" => "ککنگ آئل", "fallbackCategory" => "Pantry", "fallbackPrice" => 2517.2, "qty" => 1, "unit" => "liter", "unitUr" => "لیٹر"],
                        ["searchTerms" => ["salt", "namak", "نمک"], "fallbackName" => "Salt", "fallbackNameUr" => "نمک", "fallbackCategory" => "Pantry", "fallbackPrice" => 361.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["chillies", "mirch", "ہری مرچ"], "fallbackName" => "Green Chillies", "fallbackNameUr" => "ہری مرچ", "fallbackCategory" => "Vegetables", "fallbackPrice" => 100.0, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"]
                    ]
                ],
                "pizza" => [
                    "name" => "Cheese Pizza",
                    "nameUr" => "چیز پیزا",
                    "ingredients" => [
                        ["searchTerms" => ["cheese", "paneer", "پنیر"], "fallbackName" => "Cheddar Cheese", "fallbackNameUr" => "پنیر", "fallbackCategory" => "Dairy", "fallbackPrice" => 1537.2, "qty" => 1, "unit" => "piece", "unitUr" => "عدد"],
                        ["searchTerms" => ["tomato", "tamatar", "ٹماٹر"], "fallbackName" => "Tomatoes", "fallbackNameUr" => "ٹماٹر", "fallbackCategory" => "Vegetables", "fallbackPrice" => 697.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["oil", "koking", "ککنگ", "تیل"], "fallbackName" => "Cooking Oil", "fallbackNameUr" => "ککنگ آئل", "fallbackCategory" => "Pantry", "fallbackPrice" => 2517.2, "qty" => 1, "unit" => "liter", "unitUr" => "لیٹر"],
                        ["searchTerms" => ["flour", "yeast", "آٹا", "خمیر"], "fallbackName" => "Pizza Flour / Yeast", "fallbackNameUr" => "پیزا آٹا / خمیر", "fallbackCategory" => "Pantry", "fallbackPrice" => 220.0, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["oregano", "basil", "تلسی"], "fallbackName" => "Oregano & Basil", "fallbackNameUr" => "اوریگانو اور تلسی", "fallbackCategory" => "Pantry", "fallbackPrice" => 180.0, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"]
                    ]
                ],
                "sushi" => [
                    "name" => "Sushi",
                    "nameUr" => "سوشی",
                    "ingredients" => [
                        ["searchTerms" => ["salmon", "fish", "machli", "مچھلی"], "fallbackName" => "Salmon Fillet", "fallbackNameUr" => "مچھلی کا فلیٹ", "fallbackCategory" => "Meat", "fallbackPrice" => 3637.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["rice", "chawal", "چاول"], "fallbackName" => "White Rice", "fallbackNameUr" => "چاول", "fallbackCategory" => "Pantry", "fallbackPrice" => 837.2, "qty" => 1, "unit" => "kg", "unitUr" => "کلو"],
                        ["searchTerms" => ["nori", "seaweed", "نوری"], "fallbackName" => "Nori Seaweed Sheets", "fallbackNameUr" => "نوری سی ویڈ", "fallbackCategory" => "Pantry", "fallbackPrice" => 320.0, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["wasabi", "soy", "واسابی"], "fallbackName" => "Soy Sauce & Wasabi", "fallbackNameUr" => "سویا ساس اور واسابی", "fallbackCategory" => "Pantry", "fallbackPrice" => 280.0, "qty" => 1, "unit" => "bottle", "unitUr" => "بوتل"]
                    ]
                ],
                "chocolate cake" => [
                    "name" => "Chocolate Cake",
                    "nameUr" => "چاکلیٹ کیک",
                    "ingredients" => [
                        ["searchTerms" => ["milk", "doodh", "دودھ"], "fallbackName" => "Whole Milk", "fallbackNameUr" => "خالص دودھ", "fallbackCategory" => "Dairy", "fallbackPrice" => 1117.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["egg", "anda", "انڈے", "انڈہ"], "fallbackName" => "Large Eggs", "fallbackNameUr" => "انڈے", "fallbackCategory" => "Dairy", "fallbackPrice" => 1201.2, "qty" => 1, "unit" => "dozen", "unitUr" => "درجن"],
                        ["searchTerms" => ["sugar", "chini", "چینی"], "fallbackName" => "Sugar", "fallbackNameUr" => "چینی", "fallbackCategory" => "Pantry", "fallbackPrice" => 697.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["butter", "makkhan", "مکھن"], "fallbackName" => "Butter", "fallbackNameUr" => "مکھن", "fallbackCategory" => "Dairy", "fallbackPrice" => 1341.2, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"],
                        ["searchTerms" => ["flour", "powder", "میدا"], "fallbackName" => "Baking Flour / Powder", "fallbackNameUr" => "میدا اور بیکنگ پاؤڈر", "fallbackCategory" => "Pantry", "fallbackPrice" => 220.0, "qty" => 1, "unit" => "pack", "unitUr" => "پیکٹ"]
                    ]
                ]
            ];

            $rec = $recipeSpecs[$matchedRecipeKey];
            $ingredients = [];
            foreach ($rec['ingredients'] as $spec) {
                $matchedProduct = null;
                foreach ($resolvedProducts as $p) {
                    $pNameLower = strtolower($p['name']);
                    $pNameUrLower = strtolower(isset($p['nameUr']) ? $p['nameUr'] : (isset($p['name_ur']) ? $p['name_ur'] : ''));
                    
                    $foundTerm = false;
                    foreach ($spec['searchTerms'] as $term) {
                        $termLower = strtolower($term);
                        if (strpos($pNameLower, $termLower) !== false || strpos($pNameUrLower, $termLower) !== false) {
                            $foundTerm = true;
                            break;
                        }
                    }
                    if ($foundTerm) {
                        $matchedProduct = $p;
                        break;
                    }
                }

                if ($matchedProduct) {
                    $ingredients[] = [
                        "productId" => $matchedProduct['id'],
                        "name" => $matchedProduct['name'],
                        "nameUr" => isset($matchedProduct['nameUr']) ? $matchedProduct['nameUr'] : (isset($matchedProduct['name_ur']) ? $matchedProduct['name_ur'] : $matchedProduct['name']),
                        "category" => $matchedProduct['category'],
                        "price" => (float)$matchedProduct['price'],
                        "qty" => $spec['qty'],
                        "unit" => $matchedProduct['unit'],
                        "unitUr" => isset($matchedProduct['unitUr']) ? $matchedProduct['unitUr'] : (isset($matchedProduct['unit_ur']) ? $matchedProduct['unit_ur'] : $matchedProduct['unit']),
                        "matched" => true
                    ];
                } else {
                    $ingredients[] = [
                        "productId" => null,
                        "name" => $spec['fallbackName'],
                        "nameUr" => $spec['fallbackNameUr'],
                        "category" => $spec['fallbackCategory'],
                        "price" => (float)$spec['fallbackPrice'],
                        "qty" => $spec['qty'],
                        "unit" => $spec['unit'],
                        "unitUr" => $spec['unitUr'],
                        "matched" => false
                    ];
                }
            }

            $apiResponse = [
                "type" => "recipe",
                "recipeName" => $rec['name'],
                "recipeNameUr" => $rec['nameUr'],
                "recipeIngredients" => $ingredients,
                "matchedProductIds" => []
            ];
        } else {
            $matchedProductIds = [];

            $isDairy = (strpos($norm, "dairy") !== false || strpos($norm, "doodh") !== false || strpos($norm, "cheese") !== false || strpos($norm, "butter") !== false);
            $isFruits = (strpos($norm, "fruit") !== false || strpos($norm, "phal") !== false || strpos($norm, "banana") !== false || strpos($norm, "apple") !== false || strpos($norm, "orange") !== false);
            $isVegetables = (strpos($norm, "veg") !== false || strpos($norm, "sabzi") !== false || strpos($norm, "tomato") !== false || strpos($norm, "potato") !== false || strpos($norm, "onion") !== false);
            $isBakery = (strpos($norm, "bakery") !== false || strpos($norm, "bread") !== false || strpos($norm, "bun") !== false);
            $isHealthy = (strpos($norm, "healthy") !== false || strpos($norm, "sehat") !== false || strpos($norm, "diet") !== false || strpos($norm, "organic") !== false);
            $isUnhealthy = (strpos($norm, "unhealthy") !== false || strpos($norm, "junk") !== false || strpos($norm, "snack") !== false || strpos($norm, "chips") !== false || strpos($norm, "soda") !== false || strpos($norm, "chocolate") !== false || strpos($norm, "candy") !== false);
            $isVegan = (strpos($norm, "vegan") !== false);
            $isGlutenFree = (strpos($norm, "gluten") !== false || strpos($norm, "wheat free") !== false);
            $isHighProtein = (strpos($norm, "protein") !== false || strpos($norm, "muscle") !== false || strpos($norm, "chicken") !== false || strpos($norm, "fish") !== false || strpos($norm, "egg") !== false);

            foreach ($resolvedProducts as $p) {
                $matches = false;
                $pName = strtolower($p['name']);
                $pCategory = strtolower($p['category']);
                $pBrand = isset($p['brand']) ? strtolower($p['brand']) : '';

                if ($pBrand !== '' && strpos($norm, $pBrand) !== false) $matches = true;
                if (strpos($pName, $norm) !== false || strpos($pCategory, $norm) !== false) $matches = true;

                if ($isDairy && strpos($pCategory, "dairy") !== false) $matches = true;
                if ($isFruits && strpos($pCategory, "fruit") !== false) $matches = true;
                if ($isVegetables && strpos($pCategory, "vegetable") !== false) $matches = true;
                if ($isBakery && (strpos($pCategory, "bakery") !== false || strpos($pName, "bread") !== false || strpos($pName, "bun") !== false)) $matches = true;

                if ($isHealthy) {
                    if (strpos($pCategory, "fruit") !== false || strpos($pCategory, "vegetable") !== false || strpos($pName, "salmon") !== false || strpos($pName, "water") !== false || strpos($pName, "green tea") !== false) {
                        $matches = true;
                    }
                }

                if ($isUnhealthy) {
                    if (strpos($pName, "cola") !== false || strpos($pName, "soda") !== false || strpos($pName, "chips") !== false || strpos($pName, "chocolate") !== false || strpos($pName, "candy") !== false || strpos($pName, "cookie") !== false) {
                        $matches = true;
                    }
                }

                if ($isVegan) {
                    $nonVegan = ["milk", "egg", "cheese", "butter", "chicken", "beef", "salmon", "yogurt"];
                    $isAnimal = false;
                    foreach ($nonVegan as $nv) {
                        if (strpos($pName, $nv) !== false) {
                            $isAnimal = true;
                            break;
                        }
                    }
                    if (!$isAnimal && (strpos($pCategory, "fruit") !== false || strpos($pCategory, "vegetable") !== false || strpos($pName, "rice") !== false || strpos($pName, "oil") !== false || strpos($pName, "water") !== false || strpos($pName, "sugar") !== false)) {
                        $matches = true;
                    }
                }

                if ($isGlutenFree) {
                    $wheatItems = ["bread", "flour", "pasta", "cookie", "cake", "bun"];
                    $hasGluten = false;
                    foreach ($wheatItems as $wi) {
                        if (strpos($pName, $wi) !== false) {
                            $hasGluten = true;
                            break;
                        }
                    }
                    if (!$hasGluten) {
                        $matches = true;
                    }
                }

                if ($isHighProtein) {
                    if (strpos($pName, "chicken") !== false || strpos($pName, "salmon") !== false || strpos($pName, "egg") !== false || strpos($pName, "beef") !== false || strpos($pName, "milk") !== false || strpos($pName, "cheese") !== false) {
                        $matches = true;
                    }
                }

                if ($matches && $p['status'] !== "Inactive") {
                    $matchedProductIds[] = (int)$p['id'];
                }
            }

            if (empty($matchedProductIds)) {
                foreach ($resolvedProducts as $p) {
                    if ($p['status'] !== "Inactive" && (strpos($pName, $norm) !== false || strpos(strtolower($p['nameUr']), $norm) !== false || strpos($pCategory, $norm) !== false)) {
                        $matchedProductIds[] = (int)$p['id'];
                    }
                }
            }

            $apiResponse = [
                "type" => "filter",
                "recipeName" => null,
                "recipeNameUr" => null,
                "recipeIngredients" => [],
                "matchedProductIds" => $matchedProductIds
            ];
        }

        echo json_encode($apiResponse);
        break;

    case 'voice_parse':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $text = isset($body['text']) ? $body['text'] : '';

        if (!$text) {
            http_response_code(400);
            echo json_encode(["error" => "Text payload is required"]);
            break;
        }

        // Fetch products catalog for matching
        $stmtProducts = $conn->query("SELECT * FROM products ORDER BY id ASC");
        $allProductsRaw = $stmtProducts->fetchAll();
        list($brands, $categories, $subcategories, $units, $currencies) = getLookupData($conn);
        $resolvedProducts = [];
        foreach ($allProductsRaw as $p) {
            $resolvedProducts[] = resolveProductFlatFields($p, $brands, $categories, $subcategories, $units, $currencies);
        }

        // Try getting API key
        $apiKey = '';
        if (isset($gemini_api_key) && $gemini_api_key !== '' && strpos($gemini_api_key, 'YourActualGeminiAPIKeyHere') === false) {
            $apiKey = $gemini_api_key;
        }
        if (!$apiKey || strpos($apiKey, 'YourActualGeminiAPIKeyHere') !== false) {
            $apiKey = getenv('GEMINI_API_KEY');
        }
        if ((!$apiKey || strpos($apiKey, 'YourActualGeminiAPIKeyHere') !== false) && isset($_ENV['GEMINI_API_KEY'])) {
            $apiKey = $_ENV['GEMINI_API_KEY'];
        }
        if ((!$apiKey || strpos($apiKey, 'YourActualGeminiAPIKeyHere') !== false) && isset($_SERVER['GEMINI_API_KEY'])) {
            $apiKey = $_SERVER['GEMINI_API_KEY'];
        }

        // List of possible .env file paths to scan
        $envPaths = [
            __DIR__ . '/../.env',
            __DIR__ . '/.env',
            __DIR__ . '/../../.env'
        ];
        foreach ($envPaths as $envPath) {
            if ((!$apiKey || strpos($apiKey, 'YourActualGeminiAPIKeyHere') !== false) && file_exists($envPath)) {
                $envLines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($envLines as $line) {
                    $line = trim($line);
                    if (strpos($line, '#') === 0) continue;
                    if (strpos($line, '=') !== false) {
                        list($name, $value) = explode('=', $line, 2);
                        if (trim($name) === 'GEMINI_API_KEY') {
                            $val = trim(trim($value), " \t\n\r\0\x0B\"'");
                            if (strpos($val, 'YourActualGeminiAPIKeyHere') === false) {
                                $apiKey = $val;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (!$apiKey || strpos($apiKey, 'YourActualGeminiAPIKeyHere') !== false) {
            $apiKey = '';
        }

        $formattedProducts = [];
        $isParsedSuccess = false;

        if ($apiKey) {
            $productListLines = [];
            foreach ($resolvedProducts as $p) {
                $productListLines[] = "- ID: {$p['id']}, English Name: \"{$p['name']}\", Urdu Name: \"{$p['nameUr']}\", Category: \"{$p['category']}\", Price: {$p['price']}, Unit: \"{$p['unit']}\", Urdu Unit: \"{$p['unitUr']}\"";
            }
            $productListString = implode("\n", $productListLines);

            $prompt = "Analyze this raw spoken shopping list or grocery list text transcript: \"{$text}\".\n";
            $prompt .= "You must extract EVERY single requested product/grocery item mentioned.\n\n";
            $prompt .= "Here is the exact list of AVAILABLE PRODUCTS in our store database:\n";
            $prompt .= $productListString . "\n\n";
            $prompt .= "Follow these rules for production-grade, highly precise bulk extraction:\n";
            $prompt .= "1. LANG & PHONETICS: We support English, Urdu (in Arabic script), and Roman Urdu. Map any Roman Urdu terms or synonyms to the correct matching available product (e.g., \"doodh\" or \"milk\" matches \"Whole Milk\", \"anday\" or \"eggs\" matches \"Large Eggs\", \"cheese\" matches \"Cheddar Cheese\", \"butter\" matches \"Butter\"). Be robust against slight spelling variations, capitalization, or missing adjectives.\n";
            $prompt .= "2. RECIPES & EXPANSIONS: If the user requests ANY recipe, preparation, dish, or category (such as \"biryani\", \"chai/tea\", \"omelette\", \"fried rice\", \"kheer\", \"karahi\", \"nihari\", \"pasta\", \"pizza\", \"sabziyaan\", \"vegetables\", \"fruits\", \"healthy foods\", etc.), you MUST automatically expand it. Use your deep knowledge to identify ALL required ingredients for the requested dish (including protein, carbs, produce, AND crucial spices, herbs, and essentials). Partition these ingredients cleanly:\n";
            $prompt .= "   * For ingredients present in our provided AVAILABLE PRODUCTS database (e.g. Chicken Breast, Whole Milk, White Rice, Onions, Tomatoes, Potatoes, Eggs, Sugar, Salt, Cooking Oil), map them to their correct product ID, set matched: true, and match the category, price, and unit.\n";
            $prompt .= "   * For required recipe-specific ingredients or spices NOT in the database (e.g. specific spices like Cardamom/Elaichi, Ginger/Garlic Paste, Yogurt/Dahi, Fresh Mint, Soy Sauce, Coriander, Karahi Masala, Nihari Masala, Pizza Sauce, etc.), STILL extract them as separate items in the JSON array, but set 'matched' to false, 'productId' to null, and 'category' to the best category (e.g. Pantry or Vegetables), price 1.99, and mark them as Unavailable. This ensures they are flagged as Unavailable/out of stock and NOT added to the cart, while still listed in the draft list.\n";
            $prompt .= "   * Here are exact sample expansions for your guidance:\n";
            $prompt .= "    - \"Chicken Biryani\" / \"Ingredients for Biryani\": Chicken Breast (1 KG, matched: true, productId: 13), White Rice (1 KG, matched: true, productId: 19), Onions (1 KG, matched: true, productId: 11), Tomatoes (1 KG, matched: true, productId: 9), Potatoes (1 KG, matched: true, productId: 10), Cooking Oil (1 Liter, matched: true, productId: 21), Salt (1 Pack, matched: true, productId: 23), Biryani Masala / Spices (1 Pack, matched: false, productId: null, category: Pantry), Ginger Garlic Paste (1 Pack, matched: false, productId: null, category: Pantry), Yogurt / Dahi (1 Pack, matched: false, productId: null, category: Dairy), Fresh Mint / Pudina (1 Bunch, matched: false, productId: null, category: Vegetables).\n";
            $prompt .= "    - \"Tea\" / \"Chai\" / \"Chai Recipe\": Green Tea (1 Box, matched: true, productId: 18), Whole Milk (1 Pack, matched: true, productId: 1), Sugar (1 Pack, matched: true, productId: 22), Ginger / Adrak (1 Piece, matched: false, productId: null, category: Vegetables), Cardamom / Elaichi (1 Pack, matched: false, productId: null, category: Pantry).\n";
            $prompt .= "    - \"Coffee\" / \"Coffee Recipe\" / \"Coffee Ingredients\": Whole Milk (1 Pack, matched: true, productId: 1), Sugar (1 Pack, matched: true, productId: 22), Coffee (1 Box, matched: false, productId: null, category: Beverages).\n";
            $prompt .= "    - \"Egg Fried Rice\": Large Eggs (1 Dozen, matched: true, productId: 2), White Rice (1 KG, matched: true, productId: 19), Cooking Oil (1 Liter, matched: true, productId: 21), Onions (1 KG, matched: true, productId: 11), Salt (1 Pack, matched: true, productId: 23), Soy Sauce (1 Bottle, matched: false, productId: null, category: Pantry), Garlic / Lahsan (1 Piece, matched: false, productId: null, category: Vegetables), White Pepper (1 Pack, matched: false, productId: null, category: Pantry).\n";
            $prompt .= "    - \"Omelette\": Large Eggs (1 Dozen, matched: true, productId: 2), Onions (1 KG, matched: true, productId: 11), Tomatoes (1 KG, matched: true, productId: 9), Cooking Oil (1 Liter, matched: true, productId: 21), Salt (1 Pack, matched: true, productId: 23), Green Chillies / Hari Mirch (1 Pack, matched: false, productId: null, category: Vegetables), Black Pepper / Kali Mirch (1 Pack, matched: false, productId: null, category: Pantry), Coriander / Dhaniya (1 Bunch, matched: false, productId: null, category: Vegetables).\n";
            $prompt .= "    - \"All Fruits\" / \"Fruits\" / \"Phal\": Bananas (1 Dozen), Apples (1 KG), Oranges (1 Dozen), Mangoes (1 Piece). All have matched: true and correct productIds.\n";
            $prompt .= "    - \"All Vegetables\" / \"Vegetables\" / \"Sabziyaan\": Tomatoes (1 KG), Potatoes (1 KG), Onions (1 KG), Carrots (1 KG). All have matched: true and correct productIds.\n";
            $prompt .= "    - \"Healthy Foods\" / \"Healthy Food\": Green Tea (1 Box), Bananas (1 Dozen), Apples (1 KG), Oranges (1 Dozen), Salmon Fillet (1 KG), Mineral Water (1 Bottle). All have matched: true and correct productIds.\n";
            $prompt .= "    - \"Recipe Ingredients\" / \"All Recipe Products\" / \"Recipe Products\": White Rice (1 KG), Pasta (1 Box), Cooking Oil (1 Liter), Sugar (1 Pack), Salt (1 Pack). All have matched: true and correct productIds.\n";
            $prompt .= "3. BULK CATEGORY ADDITIONS: If the user requests to \"add all fruits\", \"sare phal\", \"sari sabziyaan\", \"add all recipe products\", \"recipe ingredients\", \"healthy foods\", \"healthy food\", or similar, do not treat them as a single item; expand them into their individual constituent products listed in our database.\n";
            $prompt .= "4. MATCHING: Match each item to one of the AVAILABLE PRODUCTS in our store database if it is in the database. Return the exact 'name' and 'nameUr' of that matched product, along with its correct category, price, unit, and unitUr from the database list above. Also set 'productId' to the matched product ID, and set 'matched' to true.\n";
            $prompt .= "5. NO MATCH (UNAVAILABLE): If a spoken item is absolutely NOT available in the database list (e.g. coffee, spices, dahi, coriander), still extract it with a standard unit, logically translated name, standard category, price 1.99, and set 'matched' to false, 'productId' to null, and flag it as Unavailable.\n";
            $prompt .= "6. AVAILABILITY: If a matched product has status \"Inactive\" or stockQuantity <= 0, still extract it but set 'matched' to false and map 'productId' to its ID. This ensures it will be correctly marked as \"Unavailable\" (e.g., \"Unavailable\" / Out of Stock).\n";
            $prompt .= "7. MULTIPLE/BULK ITEMS: Do not miss any items. If the user mentions 8-10 or more items rapidly, list each one separately.\n";
            $prompt .= "8. NO MERGING: Never group or merge separate products.\n";
            $prompt .= "9. NATURAL PHRASING: Ignore vocal fillers. Extract quantities and units accurately.\n";
            $prompt .= "10. SCHEMATIZE:\n";
            $prompt .= "   - 'name': The matched product's English name (or standard English name if unmatched)\n";
            $prompt .= "   - 'nameUr': The matched product's Urdu name (or standard Urdu name if unmatched)\n";
            $prompt .= "   - 'category': The category from the database list (or standard category if unmatched)\n";
            $prompt .= "   - 'price': The unit price from the database list (or 1.99 if unmatched)\n";
            $prompt .= "   - 'qty': Accurate integer quantity requested (default to 1 if unspecified)\n";
            $prompt .= "   - 'unit': Standard English unit (e.g., piece, kg, box, dozen, pack, or liter)\n";
            $prompt .= "   - 'unitUr': Native Urdu translation of the unit\n";
            $prompt .= "   - 'productId': Integer ID of the matched product (or null if unmatched)\n";
            $prompt .= "   - 'matched': Boolean, true if available and matched, false if unavailable or out of stock\n";
            $prompt .= "Return a strict JSON array matching this schema.";

            $payload = [
                "contents" => [
                    [
                        "parts" => [
                            ["text" => $prompt]
                        ]
                    ]
                ],
                "generationConfig" => [
                    "responseMimeType" => "application/json"
                ]
            ];

            $modelNames = ["gemini-2.5-flash"];
            $response = false;
            $httpCode = 0;
            $curlError = "";

            foreach ($modelNames as $modelName) {
                $url = "https://generativelanguage.googleapis.com/v1beta/models/" . $modelName . ":generateContent?key=" . $apiKey;
                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
                curl_setopt($ch, CURLOPT_TIMEOUT, 25);

                $response = curl_exec($ch);
                $curlError = curl_error($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if ($response !== false && $httpCode === 200) {
                    break; // Succeeded!
                } else {
                    error_log("Gemini Voice Parse failed with model $modelName, trying next fallback. HTTP code: $httpCode, error: $curlError");
                }
            }

            if ($response !== false && $httpCode === 200) {
                $resDecoded = json_decode($response, true);
                $responseText = isset($resDecoded['candidates'][0]['content']['parts'][0]['text']) 
                    ? $resDecoded['candidates'][0]['content']['parts'][0]['text'] 
                    : '[]';

                if (strpos($responseText, "```json") !== false) {
                    $parts = explode("```json", $responseText);
                    $parts = explode("```", $parts[1]);
                    $responseText = $parts[0];
                } elseif (strpos($responseText, "```") !== false) {
                    $parts = explode("```", $responseText);
                    $parts = explode("```", $parts[1]);
                    $responseText = $parts[0];
                }
                $responseText = trim($responseText);

                $firstBracket = strpos($responseText, "[");
                $lastBracket = strrpos($responseText, "]");
                if ($firstBracket !== false && $lastBracket !== false && $lastBracket > $firstBracket) {
                    $responseText = substr($responseText, $firstBracket, $lastBracket - $firstBracket + 1);
                }

                $parsedItems = json_decode($responseText, true);
                if (is_array($parsedItems)) {
                    $isParsedSuccess = true;
                    foreach ($parsedItems as $item) {
                        $pName = isset($item['name']) ? $item['name'] : 'Parsed Product';
                        $pNameUr = isset($item['nameUr']) ? $item['nameUr'] : $pName;
                        $category = isset($item['category']) ? $item['category'] : 'Pantry';
                        $price = isset($item['price']) ? (float)$item['price'] : 1.99;
                        $qty = isset($item['qty']) ? (int)$item['qty'] : 1;
                        $unit = isset($item['unit']) ? $item['unit'] : 'item';
                        $unitUr = isset($item['unitUr']) ? $item['unitUr'] : 'عدد';

                        // Find matching available product to get correct productId and flat details
                        $matchedProduct = null;
                        foreach ($resolvedProducts as $p) {
                            if (strcasecmp($p['name'], $pName) === 0) {
                                $matchedProduct = $p;
                                break;
                            }
                        }
                        if ($matchedProduct) {
                            $isAvailable = isset($matchedProduct['status']) && strcasecmp($matchedProduct['status'], 'Inactive') !== 0 && strcasecmp($matchedProduct['status'], 'Unavailable') !== 0 && (!isset($matchedProduct['stockQuantity']) || (int)$matchedProduct['stockQuantity'] > 0);
                            $formattedProducts[] = [
                                "name" => $matchedProduct['name'],
                                "nameUr" => $matchedProduct['nameUr'],
                                "category" => $matchedProduct['category'],
                                "price" => (float)$matchedProduct['price'],
                                "qty" => $qty,
                                "unit" => $matchedProduct['unit'],
                                "unitUr" => $matchedProduct['unitUr'],
                                "productId" => $matchedProduct['id'],
                                "matched" => $isAvailable,
                                "action" => "add"
                            ];
                        } else {
                            $formattedProducts[] = [
                                "name" => $pName,
                                "nameUr" => $pNameUr,
                                "category" => $category,
                                "price" => $price,
                                "qty" => $qty,
                                "unit" => $unit,
                                "unitUr" => $unitUr,
                                "productId" => null,
                                "matched" => false,
                                "action" => "add"
                            ];
                        }
                    }
                }
            }
        }

        if (!$isParsedSuccess) {
            $formattedProducts = parseVoiceCommandBackendPHP($text, $resolvedProducts);
        }

        echo json_encode($formattedProducts);
        break;

    case 'upload_image':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $file = isset($body['file']) ? $body['file'] : '';

        if (!$file) {
            http_response_code(400);
            echo json_encode(["error" => "No file provided"]);
            break;
        }

        if (is_string($file) && (strpos($file, 'http://') === 0 || strpos($file, 'https://') === 0)) {
            echo json_encode(["url" => $file, "publicId" => "remote_" . time()]);
            break;
        }

        // If base64
        if (is_string($file)) {
            $base64Data = "";
            $extension = "jpg";

            if (strpos($file, 'data:') === 0) {
                if (preg_match('/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/', $file, $matches)) {
                    $extension = $matches[1];
                    $base64Data = $matches[2];
                } else {
                    $parts = explode(';base64,', $file, 2);
                    if (count($parts) === 2) {
                        $base64Data = $parts[1];
                        $typePart = explode(':', $parts[0], 2);
                        if (count($typePart) === 2) {
                            $typeSub = explode('/', $typePart[1], 2);
                            $extension = isset($typeSub[1]) ? $typeSub[1] : 'jpg';
                        }
                    }
                }
            } else {
                $base64Data = $file;
            }

            if ($extension === 'jpeg') {
                $extension = 'jpg';
            }
            if (strpos($extension, '+') !== false) {
                $parts = explode('+', $extension, 2);
                $extension = $parts[0];
            }

            if (!$base64Data) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid base64 format"]);
                break;
            }

            $decoded = base64_decode($base64Data);
            if ($decoded === false) {
                http_response_code(400);
                echo json_encode(["error" => "Base64 decode failed"]);
                break;
            }

            // Create uploads dir if it doesn't exist
            $uploadsDir = __DIR__ . '/uploads';
            if (!file_exists($uploadsDir)) {
                mkdir($uploadsDir, 0777, true);
            }

            $fileName = "img_" . uniqid() . "_" . time() . "." . $extension;
            $filePath = $uploadsDir . "/" . $fileName;

            if (file_put_contents($filePath, $decoded) === false) {
                http_response_code(500);
                echo json_encode(["error" => "Failed to write image file locally"]);
                break;
            }

            // Return URL relative to api.php or a public web path
            $fileUrl = "backend-php-mysql/uploads/" . $fileName;
            echo json_encode(["url" => $fileUrl, "publicId" => $fileName]);
            break;
        }

        http_response_code(400);
        echo json_encode(["error" => "Unsupported file format"]);
        break;

    case 'exchange-rates':
    case 'exchange_rates':
        // 1-hour caching interval
        $cacheFile = sys_get_temp_dir() . '/voxcart_rates.json';
        $now = time();
        $cacheDuration = 3600; // 1 hour

        if (file_exists($cacheFile) && ($now - filemtime($cacheFile) < $cacheDuration)) {
            $cachedData = file_get_contents($cacheFile);
            if ($cachedData) {
                echo $cachedData;
                break;
            }
        }

        // Try API 1: Open Exchange Rates
        $rates = null;
        $url1 = "https://open.er-api.com/v6/latest/USD";
        $ch = curl_init($url1);
        if ($ch) {
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $res1 = curl_exec($ch);
            $httpCode1 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode1 === 200 && $res1) {
                $data1 = json_decode($res1, true);
                if (isset($data1['rates'])) {
                    $rates = $data1['rates'];
                }
            }
        }

        // Try API 2: Fallback ExchangeRate API
        if (!$rates) {
            $url2 = "https://api.exchangerate-api.com/v4/latest/USD";
            $ch = curl_init($url2);
            if ($ch) {
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                $res2 = curl_exec($ch);
                $httpCode2 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if ($httpCode2 === 200 && $res2) {
                    $data2 = json_decode($res2, true);
                    if (isset($data2['rates'])) {
                        $rates = $data2['rates'];
                    }
                }
            }
        }

        if ($rates) {
            $ratesCache = [
                "USD" => 1,
                "PKR" => round(($rates['PKR'] ?? 280) * 100) / 100,
                "AED" => round(($rates['AED'] ?? 3.67) * 100) / 100,
                "EUR" => round(($rates['EUR'] ?? 0.92) * 100) / 100,
                "GBP" => round(($rates['GBP'] ?? 0.79) * 100) / 100,
                "SAR" => round(($rates['SAR'] ?? 3.75) * 100) / 100,
                "timestamp" => $now * 1000
            ];
            $jsonOut = json_encode($ratesCache);
            @file_put_contents($cacheFile, $jsonOut);
            echo $jsonOut;
        } else {
            // Default Fallbacks
            echo json_encode([
                "USD" => 1,
                "PKR" => 280.00,
                "AED" => 3.67,
                "EUR" => 0.92,
                "GBP" => 0.79,
                "SAR" => 3.75,
                "timestamp" => $now * 1000
            ]);
        }
        break;

    
    case 'recipe_search':
        $data = json_decode(file_get_contents("php://input"), true) ?: $_POST;
        $query = trim($data['query'] ?? '');
        if (empty($query)) {
            echo json_encode(["error" => "Missing query parameter"]);
            exit;
        }

        // Fetch products catalog for fuzzy matching
        $stmt = $pdo->query("SELECT id, name, name_ur, category_id, price, sale_price, stock_quantity, unit, status FROM products WHERE status != 'Inactive'");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $q = strtolower($query);
        $cleanTitle = ucfirst(trim(preg_replace('/(recipe|ingredients|how to make|make|cook|dish|banane ka tarika|ke ingredients)/i', '', $query))) ?: 'Special Dish';

        // Recipes dictionary
        $recipes = [
            'biryani' => [
                'key' => 'biryani',
                'nameEn' => 'Chicken Biryani',
                'nameUr' => 'چکن بریانی',
                'category' => 'Main Course',
                'prepTime' => '25 mins',
                'cookTime' => '45 mins',
                'servings' => '4-6 persons',
                'difficulty' => 'Medium',
                'calories' => '580 kcal',
                'descriptionEn' => 'A classic festive rice dish made with aromatic basmati rice, tender chicken, and fragrant spices.',
                'descriptionUr' => 'خوشبودار باسمتی چاول، مرغی اور روایتی مصالحوں کے ساتھ تیار کردہ مشہور ڈش۔',
                'ingredients' => [
                    ['name' => 'Chicken', 'nameUr' => 'مرغی کا گوشت', 'qty' => 1, 'unit' => 'kg', 'unitUr' => 'کلو'],
                    ['name' => 'Basmati Rice', 'nameUr' => 'باسمتی چاول', 'qty' => 1, 'unit' => 'kg', 'unitUr' => 'کلو'],
                    ['name' => 'Onions', 'nameUr' => 'پیاز', 'qty' => 500, 'unit' => 'g', 'unitUr' => 'گرام'],
                    ['name' => 'Tomatoes', 'nameUr' => 'ٹماٹر', 'qty' => 500, 'unit' => 'g', 'unitUr' => 'گرام'],
                    ['name' => 'Cooking Oil', 'nameUr' => 'ککنگ آئل', 'qty' => 1, 'unit' => 'liter', 'unitUr' => 'لیٹر'],
                    ['name' => 'Salt', 'nameUr' => 'نمک', 'qty' => 1, 'unit' => 'pack', 'unitUr' => 'پیکٹ']
                ],
                'instructionsEn' => [
                    'Marinate chicken with yogurt, biryani masala, and salt for 30 minutes.',
                    'Deep fry sliced onions until golden brown; drain.',
                    'Cook chicken with tomatoes until tender.',
                    'Boil basmati rice until 80% cooked, layer over chicken, and steam (dum) for 15 minutes.'
                ],
                'instructionsUr' => [
                    'مرغی کے گوشت کو دہی اور نمک کے ساتھ میرینیٹ کریں۔',
                    'پیاز کو آئل میں گولڈن فرائی کریں۔',
                    'چکن اور ٹماٹر کو پکا لیں۔',
                    'چاول ابال کر تہیں لگائیں اور 15 منٹ دم دیں۔'
                ]
            ],
            'karahi' => [
                'key' => 'karahi',
                'nameEn' => 'Chicken Karahi',
                'nameUr' => 'چکن کڑاہی',
                'category' => 'Main Course',
                'prepTime' => '15 mins',
                'cookTime' => '25 mins',
                'servings' => '3-4 persons',
                'difficulty' => 'Easy',
                'calories' => '420 kcal',
                'descriptionEn' => 'Tender chicken wok-cooked in tomatoes, ginger, and green chillies.',
                'descriptionUr' => 'ٹماٹر، ادرک اور ہری مرچوں کے ساتھ بنی کڑاہی چکن۔',
                'ingredients' => [
                    ['name' => 'Chicken', 'nameUr' => 'مرغی کا گوشت', 'qty' => 1, 'unit' => 'kg', 'unitUr' => 'کلو'],
                    ['name' => 'Tomatoes', 'nameUr' => 'ٹماٹر', 'qty' => 1, 'unit' => 'kg', 'unitUr' => 'کلو'],
                    ['name' => 'Cooking Oil', 'nameUr' => 'ککنگ آئل', 'qty' => 1, 'unit' => 'liter', 'unitUr' => 'لیٹر'],
                    ['name' => 'Salt', 'nameUr' => 'نمک', 'qty' => 1, 'unit' => 'pack', 'unitUr' => 'پیکٹ']
                ],
                'instructionsEn' => [
                    'Fry chicken with salt in oil on high heat.',
                    'Add tomatoes, cover until soft, stir until oil separates.'
                ],
                'instructionsUr' => [
                    'چکن کو نمک اور آئل میں بھونیں۔',
                    'ٹماٹر شامل کر کے گلائیں اور آئل الگ ہونے تک پکائیں۔'
                ]
            ]
        ];

        $matchedRecipe = null;
        foreach ($recipes as $key => $recipe) {
            if (strpos($q, $key) !== false) {
                $matchedRecipe = $recipe;
                break;
            }
        }

        if (!$matchedRecipe) {
            $matchedRecipe = [
                'key' => strtolower(str_replace(' ', '_', $cleanTitle)),
                'nameEn' => $cleanTitle . ' Recipe',
                'nameUr' => $cleanTitle . ' کی ترکیب',
                'category' => 'Special Dish',
                'prepTime' => '15 mins',
                'cookTime' => '25 mins',
                'servings' => '3-4 persons',
                'difficulty' => 'Medium',
                'calories' => '450 kcal',
                'descriptionEn' => "A delicious {$cleanTitle} recipe prepared with fresh store groceries.",
                'descriptionUr' => "تازہ راشن سامان کے ساتھ تیار کردہ ڈش۔",
                'ingredients' => [
                    ['name' => 'Cooking Oil', 'nameUr' => 'ککنگ آئل', 'qty' => 1, 'unit' => 'liter', 'unitUr' => 'لیٹر'],
                    ['name' => 'Onions', 'nameUr' => 'پیاز', 'qty' => 500, 'unit' => 'g', 'unitUr' => 'گرام'],
                    ['name' => 'Tomatoes', 'nameUr' => 'ٹماٹر', 'qty' => 500, 'unit' => 'g', 'unitUr' => 'گرام'],
                    ['name' => 'Salt', 'nameUr' => 'نمک', 'qty' => 1, 'unit' => 'pack', 'unitUr' => 'پیکٹ'],
                    ['name' => 'Chicken', 'nameUr' => 'مرغی کا گوشت', 'qty' => 1, 'unit' => 'kg', 'unitUr' => 'کلو']
                ],
                'instructionsEn' => [
                    "Gather all grocery items for {$cleanTitle}.",
                    "Sauté onions and vegetables in oil.",
                    "Add main ingredients and cook until done."
                ],
                'instructionsUr' => [
                    "تمام درکار راشن اکٹھا کریں۔",
                    "پیاز اور ٹماٹروں کو آئل میں بھونیں۔",
                    "چکن شامل کر کے گلا لیں اور گرم پیش کریں۔"
                ]
            ];
        }

        // Map ingredients to database products
        $processedIngredients = [];
        foreach ($matchedRecipe['ingredients'] as $ing) {
            $matchedProduct = null;
            $ingNameLower = strtolower($ing['name']);
            foreach ($products as $p) {
                $pNameLower = strtolower($p['name']);
                if (strpos($pNameLower, $ingNameLower) !== false || strpos($ingNameLower, $pNameLower) !== false) {
                    $matchedProduct = $p;
                    break;
                }
            }

            $isAvailable = $matchedProduct && ($matchedProduct['stock_quantity'] > 0);
            $processedIngredients[] = array_merge($ing, [
                'productId' => $matchedProduct ? (int)$matchedProduct['id'] : null,
                'matched' => (bool)$isAvailable,
                'price' => $matchedProduct ? (float)($matchedProduct['sale_price'] ?: $matchedProduct['price']) : 1.99,
                'currencyCode' => 'PKR'
            ]);
        }

        $matchedRecipe['ingredients'] = $processedIngredients;

        echo json_encode(['success' => true, 'recipe' => $matchedRecipe]);
        break;

    case 'chatbot':
        $body = getRequestBody();
        $message = isset($body['message']) ? trim($body['message']) : '';
        $lang = isset($body['language']) ? $body['language'] : 'en';
        $activeTab = isset($body['activeTab']) ? $body['activeTab'] : 'home';

        if (empty($message)) {
            http_response_code(400);
            echo json_encode(["error" => "Message is required"]);
            break;
        }

        // Fetch products from database in PHP
        $products = [];
        try {
            $pdo = getDBConnection();
            $stmt = $pdo->query("SELECT id, name, nameUr, category, price, stockQuantity FROM products WHERE status != 'Inactive'");
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            // Fallback empty products if DB offline
        }

        $apiKey = getenv('GEMINI_API_KEY');
        $replyText = "";

        if ($apiKey) {
            // Call Gemini API via PHP cURL
            $productSummary = "";
            foreach (array_slice($products, 0, 50) as $p) {
                $pUr = isset($p['nameUr']) ? $p['nameUr'] : '';
                $productSummary .= "- ID {$p['id']}: \"{$p['name']}\" ({$pUr}), Category: {$p['category']}, Price: {$p['price']} PKR, Stock: {$p['stockQuantity']}\n";
            }

            $prompt = "You are VoxBot, the AI assistant for VoxCart online store. Answer the user's question accurately using this website knowledge base:\n" .
                "PAGES & TABS: Home, Catalog, Voice Assistant, Saved Favourites, Orders & PDF Invoices, Checkout, Admin Panel.\n" .
                "FEATURES: Voice Shopping in English/Urdu, OCR Bill Scanner, Smart Recipe Search, Multi-currency, Offline sync.\n" .
                "POLICIES: Delivery within 24-48h (Free over $10/PKR 2,000). Hassle-free 24-hour return policy.\n" .
                "PRODUCTS IN INVENTORY:\n" . $productSummary . "\n" .
                "User Current Page: {$activeTab}\n" .
                "User Query: {$message}\n\n" .
                "FEATURE vs PRODUCT RULE:\n" .
                "1. IF THE USER ASKS A WEBSITE INSTRUCTION OR FEATURE QUESTION (e.g. 'how to see orders', 'how to track orders', 'how to add items to cart', 'how to use voice', 'checkout', 'payment methods', 'how to search/filter', 'favourites', 'refund policy', 'language/currency toggle'), YOU MUST EXPLAIN THE STEP-BY-STEP INSTRUCTIONS CLEARLY. DO NOT LIST UNRELATED PRODUCT ITEMS UNLESS THE USER EXPLICITLY ASKED FOR PRODUCT PRICES OR INVENTORY!\n" .
                "2. IF THE USER SPECIFICALLY ASKS ABOUT A PRODUCT OR ITEM PRICE (e.g., 'price of apples', 'cost of milk', 'do you have eggs'), YOU MUST IMMEDIATELY SEARCH THE INVENTORY ABOVE AND STATE ITS EXACT PRICE IN PKR, AVAILABILITY, AND CATEGORY CLEARLY.\n" .
                "3. STRICT SCOPE: Only answer VoxCart website-related questions. If out of scope (general knowledge, coding, weather), politely decline in character.";

            $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;
            $payload = [
                "contents" => [
                    [
                        "role" => "user",
                        "parts" => [["text" => $prompt]]
                    ]
                ]
            ];

            $ch = curl_init($apiUrl);
            if ($ch) {
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
                curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
                curl_setopt($ch, CURLOPT_TIMEOUT, 12);
                $geminiRaw = curl_exec($ch);
                curl_close($ch);

                if ($geminiRaw) {
                    $geminiData = json_decode($geminiRaw, true);
                    if (isset($geminiData['candidates'][0]['content']['parts'][0]['text'])) {
                        $replyText = $geminiData['candidates'][0]['content']['parts'][0]['text'];
                    }
                }
            }
        }

        // Programmatic PHP Search fallback if API key not set or cURL fails
        if (empty($replyText)) {
            $q = strtolower($message);
            $isUr = ($lang === 'ur' || preg_match('/[\x{0600}-\x{06FF}]/u', $message));

            // 1. Check out of scope
            $outOfScope = ["capital of", "weather in", "who is the president", "python", "javascript", "solve equation", "who created", "tell me a joke"];
            $isOut = false;
            foreach ($outOfScope as $o) {
                if (strpos($q, $o) !== false) {
                    $isOut = true;
                    break;
                }
            }

            if ($isOut) {
                $replyText = $isUr
                    ? "میں والکس کارٹ کا **VoxBot AI** اسسٹنٹ ہوں۔ 🤖 میں صرف والکس کارٹ ویب سائٹ، پروڈکٹس اور پالیسیوں سے متعلق سوالات کا جواب دیتا ہوں۔"
                    : "I am VoxBot, your VoxCart AI Shopping Assistant! 🤖 I only answer questions related to VoxCart products, website features, policies, and navigation. How can I assist your VoxCart shopping today?";
            } else {
                // 2. FEATURE & NAVIGATION INTENT CHECKS

                // 2a. Add to Favorites
                if (strpos($q, "favourite") !== false || strpos($q, "favorite") !== false || strpos($q, "bookmark") !== false || strpos($q, "heart") !== false || strpos($q, "save") !== false || strpos($q, "پسندیدہ") !== false || strpos($q, "فیورٹ") !== false) {
                    $replyText = $isUr
                        ? "❤️ **پسندیدہ اشیاء محفوظ کرنے کا طریقہ (Add to Favorites):**\n1. کسی بھی پروڈکٹ کارڈ کے اوپر دائیں کونے میں موجود **دل (❤️)** کے آئیکن پر کلک کریں۔\n2. وہ پروڈکٹ آپ کی پسندیدہ لسٹ میں محفوظ ہو جائے گی۔\n3. اوپر نیویگیشن بار میں **Saved Favourites** ٹیب کھول کر آپ تمام محفوظ شدہ اشیاء دیکھ سکتے ہیں اور ایک کلک میں کارٹ میں ڈال سکتے ہیں!"
                        : "❤️ **How to Add Items to Favorites & Bookmarks:**\n1. Click the **Heart Icon (❤️)** on the top right of any product card in the Catalog or Home page.\n2. The item will be instantly saved to your personal wishlist.\n3. Navigate to the **Saved Favourites** tab in the main menu anytime to view all your bookmarked groceries and add them to your cart in 1-click!";
                }
                // 2b. View Recipe & Smart Recipe Search
                else if (strpos($q, "biryani") !== false || strpos($q, "بریانی") !== false) {
                    $replyText = $isUr
                        ? "🥘 **چکن بریانی کی مکمل ریسپی اور درکار اجزاء:**\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🌾 **سیلا / باسمتی چاول (White Rice):** 1 کلو\n- 🧅 **پیاز (Onions):** 1 کلو\n- 🍅 **ٹماٹر (Tomatoes):** 1 کلو\n- 🥔 **آلو (Potatoes):** 1 کلو\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 1 لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **بریانی مصالحہ اور ادرک لہسن پیسٹ:** درکار مصالحہ جات\n- 🥛 **دہی اور تازہ پودینہ:** اضافی ذائقہ\n\n💡 **طریقہ:** **Catalog** ٹیب میں جائیں اور سرچ میں 'Biryani' لکھیں تاکہ یہ تمام اجزاء ایک کلک میں کارٹ میں شامل کر سکیں!"
                        : "🥘 **Chicken Biryani Recipe & Complete Ingredients:**\n- 🍗 **Chicken Breast:** 1 KG\n- 🌾 **White Rice:** 1 KG\n- 🧅 **Onions:** 1 KG\n- 🍅 **Tomatoes:** 1 KG\n- 🥔 **Potatoes:** 1 KG\n- 🛢️ **Cooking Oil:** 1 Liter\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Biryani Masala & Ginger Garlic Paste:** Essential Spices\n- 🥛 **Yogurt & Fresh Mint:** For Garnishing\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Biryani' to add all these required ingredients to your cart in 1-click!";
                }
                else if (strpos($q, "karahi") !== false || strpos($q, "کڑاہی") !== false) {
                    $replyText = $isUr
                        ? "🍲 **چکن کڑاہی کی مکمل ریسپی اور درکار اجزاء:**\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🍅 **ٹماٹر (Tomatoes):** 1 کلو\n- 🧅 **پیاز (Onions):** 1 کلو\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 1 لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **کڑاہی مصالحہ، ہری مرچ اور ادرک لہسن پیسٹ**\n- 🥛 **دہی (Yogurt)**\n\n💡 **طریقہ:** **Catalog** ٹیب میں جائیں اور 'Karahi' سرچ کر کے 1 کلک میں تمام اجزاء کارٹ میں شامل کریں!"
                        : "🍲 **Chicken Karahi Recipe & Complete Ingredients:**\n- 🍗 **Chicken Breast:** 1 KG\n- 🍅 **Tomatoes:** 1 KG\n- 🧅 **Onions:** 1 KG\n- 🛢️ **Cooking Oil:** 1 Liter\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Karahi Masala, Green Chillies & Ginger Garlic Paste**\n- 🥛 **Yogurt**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Karahi' to add all required ingredients to your cart in 1-click!";
                }
                else if (strpos($q, "nihari") !== false || strpos($q, "نہاری") !== false) {
                    $replyText = $isUr
                        ? "🍲 **نہاری کی مکمل ریسپی اور درکار اجزاء:**\n- 🥩 **گوشت / بیف (Beef):** 1 کلو\n- 🌾 **گندم کا آٹا (Flour):** 1 کلو\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 1 لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **نہاری مصالحہ، ہری مرچ، ادرک اور لیموں**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Nihari' سرچ کریں اور 1 کلک میں تمام اجزاء کارٹ میں ڈالیں!"
                        : "🍲 **Special Nihari Recipe & Complete Ingredients:**\n- 🥩 **Beef / Meat:** 1 KG\n- 🌾 **Wheat Flour (Atta):** 1 KG\n- 🛢️ **Cooking Oil:** 1 Liter\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Nihari Special Masala, Ginger, Green Chillies & Lemon**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Nihari' to add all required ingredients to your cart in 1-click!";
                }
                else if (strpos($q, "pasta") !== false || strpos($q, "پاستا") !== false) {
                    $replyText = $isUr
                        ? "🍝 **پاستا کی مکمل ریسپی اور درکار اجزاء:**\n- 🍝 **پاستا پیکٹ (Pasta):** 1 ڈبہ\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🥛 **خالص دودھ (Whole Milk):** 1 پیکٹ\n- 🧈 **مکھن (Butter):** 1 بلاک\n- 🧀 **چیدر / موزریلا پنیر (Cheese):** 1 پیکٹ\n- 🧄 **لہسن اور کالی مرچ**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Pasta' سرچ کر کے تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
                        : "🍝 **Creamy Chicken Pasta Recipe & Complete Ingredients:**\n- 🍝 **Pasta Pack:** 1 Box\n- 🍗 **Chicken Breast:** 1 KG\n- 🥛 **Whole Milk:** 1 Pack\n- 🧈 **Butter:** 1 Block\n- 🧀 **Cheddar Cheese:** 1 Pack\n- 🧄 **Garlic & Black Pepper Spices**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Pasta' to add all required ingredients to your cart in 1-click!";
                }
                else if (strpos($q, "pizza") !== false || strpos($q, "پیزا") !== false) {
                    $replyText = $isUr
                        ? "🍕 **پیزا کی مکمل ریسپی اور درکار اجزاء:**\n- 🍕 **پیزا ڈو / کرسٹ:** 1 عدد\n- 🧀 **موزریلا و چیدر چیز (Cheese):** 1 پیکٹ\n- 🍅 **ٹماٹر / پیزا سوس (Tomatoes):** 1 کلو\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🫑 **شملہ مرچ اور زیتون (Capsicum & Olives)**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Pizza' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
                        : "🍕 **Delicious Pizza Recipe & Complete Ingredients:**\n- 🍕 **Pizza Crust / Dough:** 1 Base\n- 🧀 **Mozzarella & Cheddar Cheese:** 1 Pack\n- 🍅 **Tomatoes / Pizza Sauce:** 1 KG\n- 🍗 **Chicken Breast:** 1 KG\n- 🫑 **Bell Peppers & Olives**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Pizza' to add all required ingredients to your cart in 1-click!";
                }
                else if (strpos($q, "cake") !== false || strpos($q, "کیک") !== false) {
                    $replyText = $isUr
                        ? "🎂 **چاکلیٹ کیک کی مکمل ریسپی اور درکار اجزاء:**\n- 🥚 **انڈے (Eggs):** 1 درجن\n- 🥛 **خالص دودھ (Whole Milk):** 1 پیکٹ\n- 🧈 **مکھن (Butter):** 1 بلاک\n- 🍬 **چینی (Sugar):** 1 پیکٹ\n- 🌾 **گندم کا آٹا (Flour):** 1 کلو\n- 🍫 **کوکو پاؤڈر اور چاکلیٹ چپس**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Cake' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
                        : "🎂 **Chocolate Cake Recipe & Complete Ingredients:**\n- 🥚 **Eggs:** 1 Dozen\n- 🥛 **Whole Milk:** 1 Pack\n- 🧈 **Butter:** 1 Block\n- 🍬 **Sugar:** 1 Pack\n- 🌾 **Wheat Flour (Atta):** 1 KG\n- 🍫 **Cocoa Powder & Chocolate Chips:** For flavor\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Cake' to add all required ingredients to your cart in 1-click!";
                }
                else if (strpos($q, "burger") !== false || strpos($q, "برگر") !== false) {
                    $replyText = $isUr
                        ? "🍔 **چکن برگر کی مکمل ریسپی اور درکار اجزاء:**\n- 🍔 **برگر بنز (Burger Buns):** 1 پیکٹ\n- 🍗 **چکن بریسٹ (Chicken Breast):** 1 کلو\n- 🧀 **چیدر چیز (Cheddar Cheese):** 1 پیکٹ\n- 🍅 **ٹماٹر (Tomatoes):** 1 کلو\n- 🧅 **پیاز (Onions):** 500 گرام\n- 🧈 **مکھن (Butter):** 1 بلاک\n- 🧴 **مایونیز اور کیچپ**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Burger' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
                        : "🍔 **Chicken Burger Recipe & Complete Ingredients:**\n- 🍔 **Burger Buns:** 1 Pack\n- 🍗 **Chicken Breast:** 1 KG\n- 🧀 **Cheddar Cheese:** 1 Pack\n- 🍅 **Tomatoes:** 1 KG\n- 🧅 **Onions:** 500g\n- 🧈 **Butter:** 1 Block\n- 🧴 **Mayonnaise & Ketchup**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Burger' to add all required ingredients to your cart in 1-click!";
                }
                else if (strpos($q, "kheer") !== false || strpos($q, "کھیر") !== false) {
                    $replyText = $isUr
                        ? "🥣 **لذیذ کھیر کی مکمل ریسپی اور درکار اجزاء:**\n- 🥛 **خالص دودھ (Whole Milk):** 1 پیکٹ\n- 🌾 **سفید چاول (White Rice):** 1 کلو\n- 🍬 **چینی (Sugar):** 1 پیکٹ\n- 🧈 **مکھن (Butter):** 1 بلاک\n- 🌰 **خشک میوہ جات اور الائچی**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Kheer' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
                        : "🥣 **Sweet Kheer Recipe & Complete Ingredients:**\n- 🥛 **Whole Milk:** 1 Pack\n- 🌾 **White Rice:** 1 KG\n- 🍬 **Sugar:** 1 Pack\n- 🧈 **Butter:** 1 Block\n- 🌰 **Dry Fruits & Cardamom:** For aroma\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Kheer' to add all required ingredients to your cart in 1-click!";
                }
                else if (strpos($q, "chai") !== false || strpos($q, "tea") !== false || strpos($q, "چائے") !== false) {
                    $replyText = $isUr
                        ? "☕ **کڑک چائے کی مکمل ریسپی اور درکار اجزاء:**\n- 🥛 **خالص دودھ (Whole Milk):** 1 پیکٹ\n- ☕ **سبز / کالی چائے پتی (Green Tea):** 1 ڈبہ\n- 🍬 **چینی (Sugar):** 1 پیکٹ\n- 🫚 **ادرک اور الائچی**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Chai' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
                        : "☕ **Special Chai/Tea Recipe & Complete Ingredients:**\n- 🥛 **Whole Milk:** 1 Pack\n- ☕ **Green Tea / Black Tea Leaf:** 1 Box\n- 🍬 **Sugar:** 1 Pack\n- 🫚 **Ginger & Cardamom (Elaichi):** For flavor\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Chai' to add all required ingredients to your cart in 1-click!";
                }
                else if (strpos($q, "fried rice") !== false || strpos($q, "فرائیڈ رائس") !== false) {
                    $replyText = $isUr
                        ? "🍚 **انڈہ فرائیڈ رائس کی مکمل ریسپی اور درکار اجزاء:**\n- 🥚 **انڈے (Eggs):** 1 درجن\n- 🌾 **چاول (White Rice):** 1 کلو\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 1 لیٹر\n- 🧅 **پیاز (Onions):** 500 گرام\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🍾 **سویا ساس، سرکہ اور لہسن**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Fried Rice' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
                        : "🍚 **Egg Fried Rice Recipe & Complete Ingredients:**\n- 🥚 **Eggs:** 1 Dozen\n- 🌾 **White Rice:** 1 KG\n- 🛢️ **Cooking Oil:** 1 Liter\n- 🧅 **Onions:** 500g\n- 🧂 **Salt:** 1 Pack\n- 🍾 **Soy Sauce, Vinegar & Garlic**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Fried Rice' to add all required ingredients to your cart in 1-click!";
                }
                else if (strpos($q, "omelette") !== false || strpos($q, "omlet") !== false || strpos($q, "آملیٹ") !== false) {
                    $replyText = $isUr
                        ? "🍳 **لذیذ آملیٹ کی مکمل ریسپی اور درکار اجزاء:**\n- 🥚 **انڈے (Eggs):** 1 درجن\n- 🧅 **پیاز (Onions):** 500 گرام\n- 🍅 **ٹماٹر (Tomatoes):** 500 گرام\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 1 لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **ہری مرچ، ہرا دھنیا اور کالی مرچ**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Omelette' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
                        : "🍳 **Egg Omelette Recipe & Complete Ingredients:**\n- 🥚 **Eggs:** 1 Dozen\n- 🧅 **Onions:** 500g\n- 🍅 **Tomatoes:** 500g\n- 🛢️ **Cooking Oil:** 1 Liter\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Green Chillies, Coriander & Black Pepper**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Omelette' to add all required ingredients to your cart in 1-click!";
                }
                else if (strpos($q, "pulao") !== false || strpos($q, "پلاؤ") !== false || strpos($q, "پلاو") !== false) {
                    $replyText = $isUr
                        ? "🥘 **لذیذ چکن پلاؤ کی مکمل ریسپی اور درکار اجزاء:**\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🌾 **چاول (White Rice):** 1 کلو\n- 🧅 **پیاز (Onions):** 1 کلو\n- 🍅 **ٹماٹر (Tomatoes):** 1 کلو\n- 🥔 **آلو (Potatoes):** 1 کلو\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 1 لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **پلاؤ مصالحہ جات اور ادرک لہسن پیسٹ**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Pulao' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
                        : "🥘 **Chicken Pulao Recipe & Complete Ingredients:**\n- 🍗 **Chicken Breast:** 1 KG\n- 🌾 **White Rice:** 1 KG\n- 🧅 **Onions:** 1 KG\n- 🍅 **Tomatoes:** 1 KG\n- 🥔 **Potatoes:** 1 KG\n- 🛢️ **Cooking Oil:** 1 Liter\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Pulao Whole Spices & Ginger Garlic Paste**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Pulao' to add all required ingredients to your cart in 1-click!";
                }
                else if (strpos($q, "recipe") !== false || strpos($q, "ingredient") !== false || strpos($q, "dish") !== false || strpos($q, "ترکیب") !== false || strpos($q, "ریسپی") !== false || strpos($q, "ڈش") !== false) {
                    $replyText = $isUr
                        ? "🍝 **ریسپی دیکھنے اور سمارٹ ریسپی سرچ کا طریقہ (View Recipe):**\n1. **Catalog** ٹیب پر جائیں۔\n2. سرچ بار میں کسی بھی ڈش کا نام درج کریں (مثلاً: *Biryani, Karahi, Nihari, Pasta, Pizza, Cake*)۔\n3. VoxCart کا سمارٹ ریسپی انجن آپ کو ڈش کی ریسپی کی تفصیلات اور درکار تمام اجزاء دکھائے گا۔\n4. **'Add All Recipe Ingredients'** بٹن پر کلک کر کے تمام اجزاء ایک ساتھ کارٹ میں شامل کریں!"
                        : "🍝 **How to View Recipes & Smart Recipe Search:**\n1. Navigate to the **Catalog** tab.\n2. Search for any dish or recipe name in the search bar (e.g., *Biryani, Karahi, Nihari, Pasta, Pizza, Cake*).\n3. VoxCart's Smart Recipe Engine brings up the full recipe breakdown and all required store ingredients.\n4. Click **'Add All Recipe Ingredients'** to put all required grocery items into your shopping cart in 1-click!";
                }
                // 2c. Voice Switch & Language Toggle
                else if (strpos($q, "voice switch") !== false || strpos($q, "language") !== false || strpos($q, "urdu") !== false || strpos($q, "english") !== false || strpos($q, "roman") !== false || strpos($q, "toggle") !== false || strpos($q, "speak") !== false || strpos($q, "mic") !== false || strpos($q, "زبان") !== false || strpos($q, "سویچ") !== false || strpos($q, "صوتی") !== false) {
                    $replyText = $isUr
                        ? "🎙️ **صوتی اور زبان کی سوئچنگ (Voice Switch & Language Toggle):**\n1. **زبان تبدیلی:** ویب سائٹ کے بالکل اوپر ہیڈر میں موجود **'Urdu / English'** بٹن پر کلک کر کے پوری ویب سائٹ کو مکمل اردو یا انگریزی میں سوئچ کریں۔\n2. **صوتی اسسٹنٹ:** **Voice Assistant** ٹیب پر جائیں یا ہیڈر کے **مائیکروفون آئیکن** پر کلک کریں۔\n3. مائیک آن کر کے انگریزی، اردو، یا رومن اردو میں صوتی آرڈر دیں (مثلاً: *'دو کلو آٹا اور ایک کلو سیب شامل کرو'*)"
                        : "🎙️ **How to Use Voice Switch & Language Toggle:**\n1. **Language Switch:** Click the **'Urdu / English'** toggle button in the top website header to instantly switch the entire app interface between English and Urdu.\n2. **Voice Assistant Switch:** Click the **Voice Assistant** tab in the main navigation or tap the **microphone icon** in the header.\n3. Turn on the mic and speak naturally in English, Urdu, or Roman Urdu (e.g., *'Add 2 kg flour and 1 kg apples'*). VoxCart will dictate and add items automatically!";
                }
                // 2d. Smart Suggestions & AI Recommendations
                else if (strpos($q, "suggestion") !== false || strpos($q, "recommend") !== false || strpos($q, "smart") !== false || strpos($q, "auto suggest") !== false || strpos($q, "تجویز") !== false || strpos($q, "پیشکش") !== false) {
                    $replyText = $isUr
                        ? "✨ **سمارٹ تجویزات اور AI خصوصیات (Smart Suggestions):**\n1. **AI ریسپی تجویزات:** جب آپ کیٹلاگ میں کسی ڈش کو تلاش کرتے ہیں، والکس کارٹ خود بخود متعلقہ اجزاء کی تجویز پیش کرتا ہے۔\n2. **صوتی سمارٹ میچنگ:** Voice Assistant آپ کے جملے سے پروڈکٹس اور مقدار خود بخود سمارٹ انداز میں الگ کر کے کارٹ میں ڈالتا ہے۔\n3. **سمارٹ فلٹرز:** ہوم اور کیٹلاگ پیج پر مقبول ترین اور باقاعدہ خریدی جانے والی اشیاء کی سمارٹ لسٹ موجود ہے!"
                        : "✨ **How Smart Suggestions & AI Features Work:**\n1. **AI Recipe Suggestions:** When searching dishes in the Catalog, VoxCart intelligently suggests all necessary cooking ingredients.\n2. **Voice Smart Extraction:** The Voice Assistant uses AI natural language parsing to automatically detect product names, quantities, and units from your speech.\n3. **Smart Product Suggestions:** Browse popular and frequently bought items on the Home & Catalog tabs tailored to your shopping preferences!";
                }
                // 2e. OCR Bill Scanner
                else if (strpos($q, "scan") !== false || strpos($q, "ocr") !== false || strpos($q, "bill") !== false || strpos($q, "receipt") !== false || strpos($q, "upload list") !== false || strpos($q, "اسکین") !== false || strpos($q, "رسید") !== false) {
                    $replyText = $isUr
                        ? "📷 **بل اور کاغذی فہرست اسکین کرنے کا طریقہ (OCR Bill Scanner):**\n1. **Voice Assistant** ٹیب پر جائیں اور نیچے **Invoice / Bill Scanner** سیکشن تک سکرول کریں۔\n2. اپنے کاغذی بل یا ہاتھ سے لکھی شاپنگ لسٹ کی تصویر اپ لوڈ کریں۔\n3. ہمارا AI OCR اسکینر تصویر میں لکھی تمام اشیاء کو پڑھ کر فوراً کارٹ میں تبدیل کر دے گا!"
                        : "📷 **How to Use OCR Bill & Receipt Scanner:**\n1. Go to the **Voice Assistant** tab and scroll down to the **Invoice / Bill Scanner** section.\n2. Upload an image or photo of a printed store receipt or handwritten grocery list.\n3. Our AI OCR vision scanner extracts listed products and lets you add them directly to your shopping cart!";
                }
                // 2f. Orders & Tracking
                else if (strpos($q, "order") !== false || strpos($q, "track") !== false || strpos($q, "status") !== false || strpos($q, "invoice") !== false || strpos($q, "history") !== false || strpos($q, "آرڈر") !== false || strpos($q, "رسید") !== false) {
                    $replyText = $isUr
                        ? "🧾 **آرڈر ٹریکنگ اور رسید دیکھنے کا طریقہ:**\n1. اوپر نیویگیشن بار میں **Orders** (یا آرڈرز) ٹیب پر کلک کریں۔\n2. وہاں آپ کو اپنے تمام موجودہ اور سابقہ آرڈرز کی لائیو ٹریکنگ (Pending ➔ Processing ➔ Delivered) نظر آئے گی۔\n3. آپ کسی بھی آرڈر کے ساتھ موجود **'PDF Invoice'** بٹن سے آفیشل بل ڈاؤن لوڈ یا پرنٹ بھی کر سکتے ہیں!"
                        : "🧾 **How to Track Your Orders & View Invoices:**\n1. Click on the **Orders** tab in the top navigation bar.\n2. You will see real-time status updates for all your orders (Pending ➔ Processing ➔ Delivered).\n3. You can also view, print, or download official PDF invoices for any order by clicking the **PDF Invoice** button!";
                }
                // 2b. Adding Items to Cart & Buying
                else if ((strpos($q, "add") !== false && (strpos($q, "cart") !== false || strpos($q, "basket") !== false)) || strpos($q, "how to buy") !== false || strpos($q, "ارٹ") !== false || strpos($q, "خرید") !== false) {
                    $replyText = $isUr
                        ? "🛒 **کارٹ میں اشیاء شامل کرنے کا طریقہ:**\n1. **Manual:** **Catalog** یا **Home** پیج پر کسی بھی پروڈکٹ کے نیچے **'Add to Cart'** (یا ➕) بٹن دبائیں۔\n2. **Voice:** **Voice Assistant** پیج یا ہیڈر مائیک پر کلک کریں اور صوتی انداز میں بولیں (مثلاً: *'دو کلو سیب کارٹ میں ڈالو'*)\n3. **Recipe 1-Click:** کیٹلاگ میں کسی ریسپی کا نام سرچ کر کے تمام اجزاء ایک ساتھ کارٹ میں شامل کریں!"
                        : "🛒 **How to Add Items to Your Cart:**\n1. **Manual:** Go to the **Catalog** tab, browse or search for any item, and click **'Add to Cart'** (or the ➕ button).\n2. **Voice Dictation:** Go to the **Voice Assistant** tab or click the microphone icon in the header, then speak naturally (e.g., *'Add 2 kg bananas and 1 carton of milk'*).\n3. **Recipe 1-Click:** Search for a dish name (e.g., *Biryani*) in the Catalog search bar to automatically add all required grocery ingredients to your cart!";
                }
                // 2c. Voice Features & OCR Scanner
                else if (strpos($q, "voice") !== false || strpos($q, "speak") !== false || strpos($q, "mic") !== false || strpos($q, "speech") !== false || strpos($q, "scan") !== false || strpos($q, "ocr") !== false || strpos($q, "bill") !== false || strpos($q, "receipt") !== false || strpos($q, "صوتی") !== false || strpos($q, "بول") !== false || strpos($q, "اسکین") !== false) {
                    $replyText = $isUr
                        ? "🎙️ **صوتی اسسٹنٹ اور بل اسکینر کا استعمال:**\n1. نیویگیشن بار کے **Voice Assistant** ٹیب یا ہیڈر کے مائیکروفون پر کلک کریں۔\n2. مائیک کا بٹن دبائیں اور اردو/انگریزی میں بولیں (مثلاً: *'مجھے تین کلو آٹا اور ایک ڈبہ مکھن چاہیے'*)۔\n3. AI آپ کی آواز سن کر اشیاء خود بخود کارٹ میں شامل کر دے گا۔\n4. **Invoice / Bill Scanner:** آپ کاغذی رسید یا ہاتھ سے لکھی لسٹ کی تصویر اپ لوڈ کر کے بھی اشیاء فوراً کارٹ میں شامل کر سکتے ہیں!"
                        : "🎙️ **How to Use Voice Features & Bill Scanner:**\n1. Click the **Voice Assistant** tab in the main navigation or tap the microphone icon in the top header.\n2. Tap the microphone button to start listening and speak naturally in English, Urdu, or Roman Urdu (e.g., *'Add 1 loaf of bread and 1 dozen eggs'*).\n3. The AI speech engine identifies the requested items and instantly updates your shopping cart.\n4. **Bill & Receipt Scanner:** You can also upload printed or handwritten shopping list images to convert them directly into cart items!";
                }
                // 2d. Checkout & Payment Methods
                else if (strpos($q, "checkout") !== false || strpos($q, "place order") !== false || strpos($q, "payment") !== false || strpos($q, "pay") !== false || strpos($q, "cod") !== false || strpos($q, "card") !== false || strpos($q, "easypaisa") !== false || strpos($q, "jazzcash") !== false || strpos($q, "چیک آؤٹ") !== false || strpos($q, "ادائیگی") !== false) {
                    $replyText = $isUr
                        ? "💳 **چیک آؤٹ اور ادائیگی کے طریقے:**\n1. اوپر دائیں طرف کارٹ آئیکن پر کلک کر کے اپنا شاپنگ کارٹ دیکھیں۔\n2. اشیاء کی تصدیق کے بعد **'Proceed to Checkout'** پر کلک کریں۔\n3. اپنا ڈیلیوری پتہ درج کریں اور ادائیگی کا طریقہ منتخب کریں (COD, Card, EasyPaisa, JazzCash, Bank Transfer)۔\n4. **'Place Order'** پر کلک کریں! آپ کو فوراً تصدیق اور PDF انوائس مل جائے گی۔"
                        : "💳 **How to Checkout & Payment Options:**\n1. Open your shopping cart by clicking the cart icon at the top right of the header.\n2. Review your selected items and click **'Proceed to Checkout'**.\n3. Enter your delivery address and choose a payment method (COD, Credit/Debit Card, EasyPaisa, JazzCash, Bank Transfer).\n4. Click **'Place Order'** to finalize! You will receive instant confirmation and a downloadable PDF invoice.";
                }
                // 2e. Searching, Filtering & Recipe Search
                else if (strpos($q, "search") !== false || strpos($q, "find") !== false || strpos($q, "filter") !== false || strpos($q, "recipe") !== false || strpos($q, "ingredient") !== false || strpos($q, "biryani") !== false || strpos($q, "cake") !== false || strpos($q, "pasta") !== false || strpos($q, "تلاش") !== false || strpos($q, "ترکیب") !== false) {
                    $replyText = $isUr
                        ? "🔍 **پروڈکٹس اور سمارٹ ریسپی سرچ:**\n1. **Catalog** ٹیب پر جائیں۔\n2. سرچ بار میں کسی بھی پروڈکٹ کا نام (سیب، آٹا، دودھ) یا ڈش کا نام (Biryani, Pasta, Cake) درج کریں۔\n3. کیٹیگری فلٹرز کا استعمال کریں۔ ریسپی سرچ کرنے سے تمام درکار اجزاء ایک ساتھ کارٹ میں شامل کیے جا سکتے ہیں!"
                        : "🔍 **How to Search, Filter & Recipe Search:**\n1. Navigate to the **Catalog** tab.\n2. Type any item name (e.g., *Milk, Apples*) or recipe dish name (e.g., *Biryani, Pasta, Cake*) into the search bar.\n3. Use category filter buttons to narrow down choices.\n4. Searching a recipe name brings up all required grocery ingredients for 1-click adding!";
                }
                // 2f. Favourites
                else if (strpos($q, "favourite") !== false || strpos($q, "favorite") !== false || strpos($q, "bookmark") !== false || strpos($q, "save") !== false || strpos($q, "پسندیدہ") !== false) {
                    $replyText = $isUr
                        ? "❤️ **پسندیدہ اشیاء محفوظ کرنا:**\nکسی بھی پروڈکٹ پر موجود دل (❤️) کا آئیکن کلک کریں۔ تمام محفوظ شدہ اشیاء دیکھنے کے لیے **Saved Favourites** ٹیب کھولیں۔"
                        : "❤️ **How to Save Items to Favourites:**\nClick the heart icon (❤️) on any product card. Access all your bookmarked groceries anytime in the **Saved Favourites** tab!";
                }
                // 2g. Delivery & Shipping
                else if (strpos($q, "deliver") !== false || strpos($q, "shipping") !== false || strpos($q, "fee") !== false || strpos($q, "charge") !== false || strpos($q, "دیلیوری") !== false || strpos($q, "ڈلیوری") !== false) {
                    $replyText = $isUr
                        ? "🚚 **ڈیلیوری کی معلومات:**\n- **وقت:** تمام آرڈرز 24-48 گھنٹوں میں ڈیلیور ہوتے ہیں۔\n- **مفت ڈیلیوری:** $10 / PKR 2,000 سے اوپر کے تمام آرڈرز پر ڈیلیوری چارجز مفت ہیں!\n- **ٹریکنگ:** آپ **Orders** کے ٹیب سے اپنے آرڈر کا لائیو اسٹیٹس چیک کر سکتے ہیں۔"
                        : "🚚 **Delivery Information:**\n- **Delivery Time:** Standard delivery arrives within 24-48 hours.\n- **Free Shipping:** All orders above $10 USD or PKR 2,000 qualify for FREE delivery!\n- **Tracking:** Real-time order progress can be tracked in the **Orders** tab.";
                }
                // 2h. Returns & Refunds
                else if (strpos($q, "refund") !== false || strpos($q, "return") !== false || strpos($q, "policy") !== false || strpos($q, "damaged") !== false || strpos($q, "واپسی") !== false || strpos($q, "ریفنڈ") !== false) {
                    $replyText = $isUr
                        ? "🔄 **ریفنڈ اور واپسی کی پالیسی:**\nاگر کسی پروڈکٹ میں کوئی خرابی ہو تو آپ 24 گھنٹوں کے اندر واپسی کی درخواست کر سکتے ہیں۔ آپ کی رقم 3-5 دنوں میں واپس کر دی جائے گی۔"
                        : "🔄 **Returns & Refund Policy:**\nWe offer a 24-hour return window for fresh produce or damaged items. Once processed, full refunds are issued to your payment method within 3-5 business days.";
                }
                // 2i. Accounts & Admin
                else if (strpos($q, "account") !== false || strpos($q, "login") !== false || strpos($q, "register") !== false || strpos($q, "admin") !== false || strpos($q, "password") !== false || strpos($q, "لاگ ان") !== false) {
                    $replyText = $isUr
                        ? "👤 **یوزر اور ایڈمن اکاؤنٹس:**\n- گاہک لاگ ان کیے بغیر یا نیا اکاؤنٹ بنا کر خریداری کر سکتے ہیں۔\n- ایڈمن کنٹرول کے لیے **Admin** ٹیب پر جائیں (لاگ ان: admin@voxcart.com / admin)"
                        : "👤 **User Accounts & Admin Console:**\n- Customers can shop as a Guest or Register an account to save delivery addresses and cart state.\n- **Admin Console:** Managers can access the Admin tab (`admin@voxcart.com` / `admin`) to update inventory, stock, and orders.";
                }
                // 2j. Currency & Language
                else if (strpos($q, "currency") !== false || strpos($q, "pkr") !== false || strpos($q, "usd") !== false || strpos($q, "language") !== false || strpos($q, "urdu") !== false || strpos($q, "کرنسی") !== false || strpos($q, "زبان") !== false) {
                    $replyText = $isUr
                        ? "🌐 **کرنسی اور زبان کا انتخاب:**\nآپ ویب سائٹ کی ہیڈر بار سے زبان (English / اردو) اور کرنسی (USD $, PKR ₨, EUR €, GBP £, SAR ﷼, AED) تبدیل کر سکتے ہیں۔"
                        : "🌐 **Currency & Language Settings:**\nUse the top header navigation to switch site languages (English / Urdu اردو) or display currencies (USD $, PKR ₨, EUR €, GBP £, SAR, AED, etc.) with live exchange rates!";
                }
                // 3. DYNAMIC PRODUCT & PRICE LOOKUP (Matches specific items when requested)
                else {
                    $ignoreWords = [
                        "what", "is", "are", "the", "a", "an", "price", "prices", "cost", "costs", "rate", "rates", "of", "how", "much", "many", "does", "do",
                        "you", "have", "sell", "show", "me", "list", "available", "tell", "about", "for", "in", "store", "voxcart", "can",
                        "buy", "give", "item", "product", "items", "products", "where", "to", "see", "view", "find", "track", "tracking",
                        "order", "orders", "my", "your", "our", "history", "cart", "basket", "checkout", "pay", "payment", "account",
                        "profile", "page", "tab", "go", "nav", "navigate", "help", "kya", "hai", "kaise", "chahiye", "کتنی", "کتنا",
                        "قیمت", "کیا", "ہے", "بتاؤ", "سے", "پر", "روپے", "کتنے"
                    ];
                    $words = array_filter(preg_split('/[^a-zA-Z0-9\x{0600}-\x{06FF}]+/u', $q), function($w) use ($ignoreWords) {
                        return mb_strlen($w) >= 3 && !in_array($w, $ignoreWords);
                    });

                    $matched = [];
                    foreach ($products as $p) {
                        $pName = strtolower($p['name']);
                        $pNameUr = strtolower(isset($p['nameUr']) ? $p['nameUr'] : '');
                        
                        if ($pName && strpos($q, $pName) !== false) {
                            $matched[] = $p;
                            continue;
                        }
                        if ($pNameUr && strpos($q, $pNameUr) !== false) {
                            $matched[] = $p;
                            continue;
                        }

                        if (count($words) === 0) continue;

                        foreach ($words as $w) {
                            if (strpos($pName, $w) !== false || ($pNameUr && strpos($pNameUr, $w) !== false)) {
                                $matched[] = $p;
                                break;
                            }
                        }
                    }

                    if (!empty($matched)) {
                        $itemsList = "";
                        foreach (array_slice($matched, 0, 5) as $m) {
                            $stockStr = ($m['stockQuantity'] > 0) ? "In Stock ({$m['stockQuantity']} available)" : "Out of Stock";
                            $mUr = isset($m['nameUr']) && $m['nameUr'] ? " ({$m['nameUr']})" : "";
                            $itemsList .= "• **{$m['name']}**{$mUr}: **{$m['price']} PKR** — *Category: {$m['category']}* | Status: {$stockStr}\n";
                        }
                        $replyText = $isUr
                            ? "🏷️ **والکس کارٹ پر آپ کے تلاش کردہ پروڈکٹس کی معلومات:**\n\n{$itemsList}\nآپ **Catalog** ٹیب میں جا کر انہیں براؤز اور خرید سکتے ہیں!"
                            : "🏷️ **Here are the matching product(s) and their prices on VoxCart:**\n\n{$itemsList}\nYou can browse and purchase these anytime in the **Catalog** tab!";
                    } else {
                        $replyText = $isUr
                            ? "آپ کے سوال (\"{$message}\") کے متعلق VoxCart پر معلومات:\nوالکس کارٹ ایک صوتی اور جدید آن لائن گروسری اسٹور ہے۔ آپ **Catalog** سے کسی بھی پروڈکٹ کو براؤز اور سرچ کر سکتے ہیں، **Voice Assistant** سے صوتی آرڈر دے سکتے ہیں، یا **Orders** ٹیب میں اپنا آرڈر ٹریک کر سکتے ہیں۔"
                            : "Regarding your question (\"{$message}\"):\nVoxCart is a bilingual, voice-activated online grocery platform. You can search any specific products or ingredients in the **Catalog** tab, use hands-free speech dictation in the **Voice Assistant** tab, or view delivery progress under **Orders**!";
                    }
                }
            }
        }

        echo json_encode(["reply" => $replyText]);
        break;

    default:
        http_response_code(400);
        echo json_encode(["error" => "Specified API action [ $action ] is invalid"]);
        break;
}
?>
