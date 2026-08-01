const fs = require("fs");
const path = require("path");

const phpPath = path.join(__dirname, "backend-php-mysql", "api.php");
let phpCode = fs.readFileSync(phpPath, "utf8");

if (!phpCode.includes("case 'recipe_search':")) {
  const recipePhpCode = `
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
`;

  phpCode = phpCode.replace("case 'chatbot':", recipePhpCode + "\n    case 'chatbot':");
  fs.writeFileSync(phpPath, phpCode, "utf8");
  console.log("Successfully patched backend-php-mysql/api.php with case 'recipe_search'!");
}
