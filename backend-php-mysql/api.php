<?php
// VoxCart Unified REST API Entry Point
// Routing action calls directly to query actions

require_once 'db.php';

// Automatically load .env file variables if available
function loadDotEnvPHP() {
    $envPaths = [__DIR__ . '/../.env', __DIR__ . '/.env'];
    foreach ($envPaths as $envPath) {
        if (file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || strpos($line, '#') === 0) continue;
                if (strpos($line, '=') !== false) {
                    list($key, $val) = explode('=', $line, 2);
                    $key = trim($key);
                    $val = trim($val, " \t\n\r\0\x0B\"'");
                    if (!empty($key)) {
                        putenv("{$key}={$val}");
                        $_ENV[$key] = $val;
                        $_SERVER[$key] = $val;
                    }
                }
            }
            break;
        }
    }
}
loadDotEnvPHP();

// Retrieve absolute request parameters
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Helper to extract JSON request body payload
function getRequestBody() {
    $json = file_get_contents('php://input');
    return json_decode($json, true);
}

function sendVerificationEmailPHP($to, $subject, $code) {
    $host = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
    $port = (int)(getenv('SMTP_PORT') ?: 587);
    $rawUser = getenv('SMTP_USER') ?: getenv('GMAIL_USER') ?: 'muskanmehmood2611@gmail.com';
    $rawPass = getenv('SMTP_PASS') ?: getenv('GMAIL_PASS') ?: 'rucwgjfcukdabttz';
    $user = rtrim(trim($rawUser), ')');
    $pass = str_replace(' ', '', $rawPass);

    $subject = "Your VoxCart Verification Code: {$code}";

    $mailBody = "
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='UTF-8'>
      <title>VoxCart Security Verification Code</title>
    </head>
    <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; line-height: 1.5;'>
      <div style='max-width: 480px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);'>
        <div style='text-align: center; margin-bottom: 24px;'>
          <h1 style='color: #6d28d9; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.5px;'>VoxCart Online Store</h1>
          <p style='color: #64748b; font-size: 13px; margin-top: 4px;'>Account Security Verification</p>
        </div>
        <p style='color: #334155; font-size: 14px; margin-bottom: 16px;'>Hello,</p>
        <p style='color: #334155; font-size: 14px; margin-bottom: 20px;'>Use the following 6-digit security verification code to complete your request on VoxCart:</p>
        <div style='font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #6d28d9; background: #f1f5f9; padding: 18px 24px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1;'>
          {$code}
        </div>
        <p style='font-size: 13px; color: #64748b; margin-top: 20px;'>This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;' />
        <p style='font-size: 12px; color: #94a3b8; text-align: center; margin: 0;'>If you did not request this code, no action is required.<br />&copy; VoxCart Security Team</p>
      </div>
    </body>
    </html>";

    $plainTextBody = "Your VoxCart security verification code is: {$code}\n\n" .
                     "Please enter this 6-digit code on the VoxCart website to verify your account.\n" .
                     "This verification code is valid for 10 minutes.\n\n" .
                     "If you did not request this verification code, please ignore this email.\n\n" .
                     "VoxCart Security Team";

    if (!$user || !$pass) {
        // Fallback to mail() delivery or log confirmation
        $headers = "From: VoxCart Security <security@voxcart.com>\r\n" .
                   "Reply-To: support@voxcart.com\r\n" .
                   "Content-Type: text/html; charset=UTF-8\r\n" .
                   "X-Mailer: PHP/" . phpversion();
        @mail($to, $subject, $mailBody, $headers);
        error_log("[SMTP SYSTEM] Verification email dispatched to {$to} via PHP mail system.");
        return ["success" => true];
    }

    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);

    $socketHost = ($port == 465) ? "ssl://{$host}" : "tcp://{$host}";
    $socket = @stream_socket_client("{$socketHost}:{$port}", $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $context);

    if (!$socket) {
        return [
            "success" => false,
            "error" => "Could not connect to SMTP server at {$host}:{$port} ({$errstr}). Please check host, port, and outbound firewall."
        ];
    }

    $read = function($s) {
        $r = "";
        while ($l = fgets($s, 512)) {
            $r .= $l;
            if (substr($l, 3, 1) === " ") break;
        }
        return $r;
    };
    $write = function($s, $cmd) { fputs($s, $cmd . "\r\n"); };

    $greeting = $read($socket);
    if (substr($greeting, 0, 3) !== "220") {
        fclose($socket);
        return ["success" => false, "error" => "SMTP Server error on connect: " . trim($greeting)];
    }

    $write($socket, "EHLO " . gethostname());
    $read($socket);

    if ($port == 587) {
        $write($socket, "STARTTLS");
        $st = $read($socket);
        if (strpos($st, '220') !== false) {
            $cryptoType = STREAM_CRYPTO_METHOD_TLS_CLIENT;
            if (defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')) {
                $cryptoType |= STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT;
            }
            if (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT')) {
                $cryptoType |= STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;
            }
            $cryptoRes = @stream_socket_enable_crypto($socket, true, $cryptoType);
            if (!$cryptoRes) {
                fclose($socket);
                return ["success" => false, "error" => "TLS negotiation failed with SMTP server."];
            }
            $write($socket, "EHLO " . gethostname());
            $read($socket);
        }
    }

    $write($socket, "AUTH LOGIN");
    $authReq = $read($socket);
    if (substr($authReq, 0, 3) !== "334") {
        fclose($socket);
        return ["success" => false, "error" => "SMTP AUTH LOGIN rejected: " . trim($authReq)];
    }

    $write($socket, base64_encode($user));
    $uResp = $read($socket);
    if (substr($uResp, 0, 3) !== "334") {
        fclose($socket);
        return ["success" => false, "error" => "SMTP Username rejected for {$user}: " . trim($uResp)];
    }

    $write($socket, base64_encode($pass));
    $authResp = $read($socket);
    if (substr($authResp, 0, 3) !== "235") {
        fclose($socket);
        return ["success" => false, "error" => "SMTP Authentication failed for {$user}. Please verify your SMTP App Password: " . trim($authResp)];
    }

    $write($socket, "MAIL FROM: <{$user}>");
    $mfResp = $read($socket);
    if (substr($mfResp, 0, 3) !== "250") {
        fclose($socket);
        return ["success" => false, "error" => "SMTP MAIL FROM rejected: " . trim($mfResp)];
    }

    $write($socket, "RCPT TO: <{$to}>");
    $rcptResp = $read($socket);
    if (substr($rcptResp, 0, 3) !== "250") {
        fclose($socket);
        return ["success" => false, "error" => "SMTP RCPT TO rejected for {$to}: " . trim($rcptResp)];
    }

    $write($socket, "DATA");
    $dataReq = $read($socket);
    if (substr($dataReq, 0, 3) !== "354") {
        fclose($socket);
        return ["success" => false, "error" => "SMTP DATA command failed: " . trim($dataReq)];
    }

    $boundary = "----=_NextPart_" . md5(time() . rand());
    $msgId = "<voxcart-" . md5(time() . rand()) . "@gmail.com>";

    $headers = "From: \"VoxCart Security\" <{$user}>\r\n";
    $headers .= "Reply-To: \"VoxCart Security\" <{$user}>\r\n";
    $headers .= "To: <{$to}>\r\n";
    $headers .= "Subject: {$subject}\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
    $headers .= "Auto-Submitted: auto-generated\r\n";
    $headers .= "X-Auto-Response-Suppress: OOF, AutoReply, All\r\n";
    $headers .= "X-Priority: 1 (Highest)\r\n";
    $headers .= "X-MSMail-Priority: High\r\n";
    $headers .= "Importance: High\r\n";
    $headers .= "Message-ID: {$msgId}\r\n\r\n";

    $multipartPayload = "--{$boundary}\r\n" .
                        "Content-Type: text/plain; charset=UTF-8\r\n" .
                        "Content-Transfer-Encoding: 8bit\r\n\r\n" .
                        $plainTextBody . "\r\n\r\n" .
                        "--{$boundary}\r\n" .
                        "Content-Type: text/html; charset=UTF-8\r\n" .
                        "Content-Transfer-Encoding: 8bit\r\n\r\n" .
                        $mailBody . "\r\n\r\n" .
                        "--{$boundary}--";

    $write($socket, $headers . $multipartPayload . "\r\n.");
    $dResp = $read($socket);
    $write($socket, "QUIT");
    fclose($socket);

    if (substr($dResp, 0, 3) === "250") {
        return ["success" => true];
    } else {
        return ["success" => false, "error" => "SMTP server rejected message body: " . trim($dResp)];
    }
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
            ["id" => 11, "qty" => 250, "unit" => "g", "unitUr" => "گرام", "matched" => true], // Onions
            ["id" => 9,  "qty" => 250, "unit" => "g", "unitUr" => "گرام", "matched" => true], // Tomatoes
            ["id" => 10, "qty" => 250, "unit" => "g", "unitUr" => "گرام", "matched" => true], // Potatoes
            ["id" => 21, "qty" => 250, "unit" => "ml", "unitUr" => "ملی لیٹر", "matched" => true], // Cooking oil
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

// ------------------- OCR & FUZZY PRODUCT MATCHING HELPERS -------------------
function getSpellingSimilarityPHP($s1, $s2) {
    if (!$s1 || !$s2) return 0;
    $s1 = strtolower(trim($s1));
    $s2 = strtolower(trim($s2));
    if ($s1 === $s2) return 1;
    $len1 = strlen($s1);
    $len2 = strlen($s2);
    $maxLen = max($len1, $len2);
    if ($maxLen === 0) return 1;
    $dist = levenshtein(substr($s1, 0, 255), substr($s2, 0, 255));
    return max(0, 1 - ($dist / $maxLen));
}

function normalizeStringPHP($str) {
    if (!$str) return "";
    $str = mb_strtolower((string)$str, 'UTF-8');
    $str = preg_replace('/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]|]/u', ' ', $str);
    $str = preg_replace('/\s+/u', ' ', $str);
    return trim($str);
}

function stripPluralEndingsPHP($s) {
    return preg_replace('/(s|es|ies)$/i', '', $s);
}

function fuzzyMatchProductBackendPHP($pNameItem, $pNameUrItem, $productsList) {
    if (empty($productsList)) return null;

    $rawEn = normalizeStringPHP($pNameItem);
    $rawUr = normalizeStringPHP($pNameUrItem);

    if (!$rawEn && !$rawUr) return null;

    $noiseWordsRegex = '/\b(1x|2x|3x|4x|5x|kg|g|gram|grams|kilo|kilos|kilogram|kilograms|liter|liters|litre|litres|l|ml|milliliter|milliliters|lb|lbs|pound|pounds|pack|packs|packet|packets|box|boxes|bottle|bottles|piece|pieces|pcs|pc|dozen|dozens|pkr|rs|usd|\$|nestle|olpers|national|shan|shangrila|habib|lipton|tapal|meezan|dalda|rafhan|knorr|knor|mitchells|sensodyne|colgate|lux|surf|ariel|harpic|dettol|fresh|super|kernel|broiler|pure|life|iodized|organic|org|original|best|quality|premium|extra|prime|brand|select|choice|item|items)\b/iu';

    $cleanNoise = function($str) use ($noiseWordsRegex) {
        $norm = normalizeStringPHP($str);
        $norm = preg_replace($noiseWordsRegex, '', $norm);
        $norm = preg_replace('/\b\d+(\.\d+)?(kg|g|l|ml|oz|lb)?\b/iu', '', $norm);
        $norm = preg_replace('/\b\d+\b/u', '', $norm);
        $norm = preg_replace('/\s+/u', ' ', $norm);
        return trim($norm);
    };

    $cleanedEn = $cleanNoise($rawEn);
    if (!$cleanedEn) $cleanedEn = $rawEn;

    // Direct Exact Name Check
    foreach ($productsList as $p) {
        $pName = normalizeStringPHP($p['name'] ?? '');
        $pNameUr = normalizeStringPHP($p['nameUr'] ?? ($p['name_ur'] ?? ''));
        if ($pName === $rawEn || ($pNameUr && $rawUr && $pNameUr === $rawUr)) {
            return $p;
        }
        if ($pName === $cleanedEn) {
            return $p;
        }
    }

    $romanUrduMap = [
        "doodh" => "milk", "dudh" => "milk", "khalees doodh" => "milk", "dood" => "milk",
        "anday" => "eggs", "ande" => "eggs", "anda" => "eggs", "andey" => "eggs",
        "paneer" => "cheese", "paner" => "cheese", "chees" => "cheese",
        "makkhan" => "butter", "makhan" => "butter", "makkan" => "butter",
        "kelay" => "bananas", "kele" => "bananas", "kela" => "bananas",
        "saib" => "apples", "seb" => "apples", "apple" => "apples",
        "maltey" => "oranges", "malte" => "oranges", "malta" => "oranges", "kinnow" => "oranges", "kino" => "oranges",
        "aam" => "mangoes", "mango" => "mangoes",
        "tamatar" => "tomatoes", "tomato" => "tomatoes", "tamatr" => "tomatoes",
        "aaloo" => "potatoes", "aalu" => "potatoes", "aloo" => "potatoes", "alu" => "potatoes", "potato" => "potatoes",
        "pyaaz" => "onions", "piyaz" => "onions", "pyaz" => "onions", "onion" => "onions",
        "gajar" => "carrots", "gajjar" => "carrots", "carrot" => "carrots",
        "murghi" => "chicken", "murgi" => "chicken", "murghi ka gosht" => "chicken", "chicken" => "chicken",
        "qeema" => "beef", "qima" => "beef", "keema" => "beef", "beef" => "beef",
        "machli" => "fish", "machhli" => "fish", "fish" => "fish", "salmon" => "fish",
        "paani" => "water", "pani" => "water", "water" => "water",
        "chai" => "tea", "sabz chai" => "tea", "tea" => "tea",
        "chawal" => "rice", "rice" => "rice",
        "tel" => "oil", "tail" => "oil", "koking oil" => "oil", "cooking oil" => "oil", "oil" => "oil", "ghee" => "oil",
        "cheeni" => "sugar", "chini" => "sugar", "sugar" => "sugar",
        "namak" => "salt", "salt" => "salt"
    ];

    $synonymsMap = [
        "coke" => ["coca-cola", "cocacola", "cola", "soda"],
        "cola" => ["coca-cola", "cocacola", "coke"],
        "milk" => ["whole milk", "dairy milk", "pack milk", "milkpak", "olpers"],
        "egg" => ["large eggs", "eggs", "egg", "desi anday"],
        "eggs" => ["large eggs", "eggs", "egg", "desi anday"],
        "cheese" => ["cheddar cheese", "cheese slice", "paneer"],
        "butter" => ["butter block", "butter", "makkhan", "nurpur"],
        "bananas" => ["bananas", "banana"],
        "banana" => ["bananas", "banana"],
        "apples" => ["apples", "apple"],
        "apple" => ["apples", "apple"],
        "oranges" => ["oranges", "orange", "kinnow"],
        "orange" => ["oranges", "orange"],
        "mangoes" => ["mangoes", "mango"],
        "mango" => ["mangoes", "mango"],
        "tomatoes" => ["tomatoes", "tomato"],
        "tomato" => ["tomatoes", "tomato"],
        "potatoes" => ["potatoes", "potato"],
        "potato" => ["potatoes", "potato"],
        "onions" => ["onions", "onion"],
        "onion" => ["onions", "onion"],
        "carrots" => ["carrots", "carrot"],
        "carrot" => ["carrots", "carrot"],
        "chicken" => ["chicken breast", "chicken", "murgi", "broiler"],
        "beef" => ["ground beef", "beef", "mincemeat", "qeema", "keema"],
        "qeema" => ["ground beef", "beef", "mincemeat", "qeema", "keema"],
        "fish" => ["salmon fillet", "fish fillet", "salmon", "machli"],
        "salmon" => ["salmon fillet", "fish fillet", "salmon"],
        "water" => ["mineral water", "water bottle", "nestle pure life"],
        "tea" => ["green tea", "chai", "tea pack", "tapal", "lipton"],
        "chai" => ["green tea", "chai", "tea pack", "tapal", "lipton"],
        "rice" => ["white rice", "rice pack", "chawal", "basmati", "super kernel"],
        "pasta" => ["pasta", "macaroni", "spaghetti", "kolson", "bake parlor"],
        "oil" => ["cooking oil", "oil bottle", "ghee", "tel", "dalda", "meezan", "habib"],
        "sugar" => ["sugar", "cheeni"],
        "salt" => ["salt", "namak", "national salt", "iodized salt"]
    ];

    $tokens = explode(' ', $cleanedEn);
    $expandedTokens = [];
    foreach ($tokens as $tok) {
        $expandedTokens[] = $romanUrduMap[$tok] ?? $tok;
    }
    $expandedEn = implode(' ', $expandedTokens);

    $keyNounList = [
        "milk", "egg", "eggs", "cheese", "butter", "banana", "bananas", "apple", "apples",
        "orange", "oranges", "mango", "mangoes", "tomato", "tomatoes", "potato", "potatoes",
        "onion", "onions", "carrot", "carrots", "chicken", "beef", "qeema", "fish", "salmon",
        "water", "tea", "chai", "rice", "pasta", "oil", "ghee", "sugar", "salt", "masala",
        "bread", "flour", "atta", "daal", "lentil", "biscuit", "yogurt", "dahi"
    ];

    $bestProduct = null;
    $maxScore = 0;

    foreach ($productsList as $p) {
        $pName = normalizeStringPHP($p['name'] ?? '');
        $pNameUr = normalizeStringPHP($p['nameUr'] ?? ($p['name_ur'] ?? ''));
        $pNameCleaned = $cleanNoise($pName);
        if (!$pNameCleaned) $pNameCleaned = $pName;

        $score = 0;

        // Cleaned Exact Match
        if ($pNameCleaned === $cleanedEn || $pNameCleaned === $expandedEn) {
            $score = max($score, 98);
        }

        // Synonym Match
        if (isset($synonymsMap[$cleanedEn]) || isset($synonymsMap[$expandedEn])) {
            $synList = $synonymsMap[$cleanedEn] ?? ($synonymsMap[$expandedEn] ?? []);
            foreach ($synList as $syn) {
                if (strpos($pName, $syn) !== false || strpos($pNameCleaned, $syn) !== false) {
                    $score = max($score, 92);
                    break;
                }
            }
        }

        // Substring Match
        if (strlen($cleanedEn) >= 3 && strlen($pNameCleaned) >= 3) {
            if (strpos($pNameCleaned, $cleanedEn) !== false || strpos($cleanedEn, $pNameCleaned) !== false) {
                $score = max($score, 85);
            }
            if (strpos($pNameCleaned, $expandedEn) !== false || strpos($expandedEn, $pNameCleaned) !== false) {
                $score = max($score, 88);
            }
        }

        if (strlen($rawEn) >= 3 && strlen($pName) >= 3) {
            if (strpos($pName, $rawEn) !== false || strpos($rawEn, $pName) !== false) {
                $score = max($score, 80);
            }
        }

        if (mb_strlen($rawUr, 'UTF-8') >= 2 && mb_strlen($pNameUr, 'UTF-8') >= 2) {
            if (mb_strpos($pNameUr, $rawUr, 0, 'UTF-8') !== false || mb_strpos($rawUr, $pNameUr, 0, 'UTF-8') !== false) {
                $score = max($score, 85);
            }
        }

        // Token Overlap Score
        $tokensScanned = array_filter(explode(' ', $expandedEn), function($t) { return strlen($t) > 1; });
        $tokensProduct = array_filter(explode(' ', $pNameCleaned), function($t) { return strlen($t) > 1; });

        if (!empty($tokensScanned) && !empty($tokensProduct)) {
            $matches = 0;
            foreach ($tokensScanned as $st) {
                $stSingular = stripPluralEndingsPHP($st);
                foreach ($tokensProduct as $pt) {
                    $ptSingular = stripPluralEndingsPHP($pt);
                    if ($st === $pt || $stSingular === $ptSingular || (strlen($st) >= 3 && strlen($pt) >= 3 && (strpos($st, $pt) !== false || strpos($pt, $st) !== false))) {
                        $matches++;
                        break;
                    }
                }
            }
            $overlapRatio = (2 * $matches) / (count($tokensScanned) + count($tokensProduct));
            if ($overlapRatio > 0) {
                $tokenScore = (int)round(55 + $overlapRatio * 35);
                $score = max($score, $tokenScore);
            }
        }

        // Key Noun Match
        foreach ($keyNounList as $noun) {
            $nounSingular = stripPluralEndingsPHP($noun);
            $isScannedHasNoun = (strpos($expandedEn, $noun) !== false || strpos($expandedEn, $nounSingular) !== false);
            $isProductHasNoun = (strpos($pName, $noun) !== false || strpos($pName, $nounSingular) !== false || strpos($pNameCleaned, $noun) !== false);
            if ($isScannedHasNoun && $isProductHasNoun) {
                $score = max($score, 70);
            }
        }

        // Levenshtein Spelling Similarity
        $simCleaned = getSpellingSimilarityPHP($expandedEn, $pNameCleaned);
        $simRaw = getSpellingSimilarityPHP($rawEn, $pName);
        $maxSim = max($simCleaned, $simRaw);

        if ($maxSim >= 0.50) {
            $levScore = (int)round($maxSim * 80);
            $score = max($score, $levScore);
        }

        if ($score > $maxScore) {
            $maxScore = $score;
            $bestProduct = $p;
        }
    }

    if ($maxScore >= 50 && $bestProduct) {
        return $bestProduct;
    }

    return null;
}

function cleanOcrArtifactsPHP($text) {
    if (!$text || !is_string($text)) return "";
    $text = preg_replace('/[|│┃]/u', ' ', $text);
    $text = preg_replace('/[~`^]/u', '', $text);
    $text = preg_replace('/_{2,}/u', ' ', $text);
    $text = preg_replace('/[ \t]+/u', ' ', $text);
    $text = preg_replace('/\r\n/u', "\n", $text);
    $text = preg_replace('/\n{3,}/u', "\n\n", $text);
    $text = preg_replace('/\b1L\b|\b1 L\b/iu', '1L', $text);
    $text = preg_replace('/\b1kg\b|\b1 kg\b/iu', '1kg', $text);
    $text = preg_replace('/\b2kg\b|\b2 kg\b/iu', '2kg', $text);
    $text = preg_replace('/\b5kg\b|\b5 kg\b/iu', '5kg', $text);
    return trim($text);
}

function parseOcrTextToItemsPHP($ocrText, $resolvedProducts = []) {
    if (!$ocrText || !is_string($ocrText)) return [];
    $cleanedText = cleanOcrArtifactsPHP($ocrText);

    $rawLines = preg_split('/\r?\n|(?<=[a-zA-Z0-9\)\x{0600}-\x{06FF}])\s*(?=\d+[\.\)\-]\s*)/u', $cleanedText);
    $rawLines = array_filter(array_map('trim', $rawLines));

    $noiseKeywordsExact = [
        "total", "subtotal", "sub-total", "tax", "gst", "vat", "discount", "balance", "change",
        "cash", "visa", "mastercard", "invoice", "receipt", "date", "amount", "tax invoice",
        "thank you", "welcome", "cashier", "bill #", "items count", "item count", "paid",
        "tel", "phone", "address", "market", "store", "supermarket", "mart", "qty total",
        "gross amt", "net amt", "total amount", "item qty price total", "item quantity price",
        "shopping list", "grocery list", "bazaar", "bazar", "order summary", "thank you for shopping"
    ];

    $extractedItems = [];

    foreach ($rawLines as $originalLine) {
        $line = trim($originalLine);
        if (strlen($line) < 2) continue;
        $lower = strtolower(preg_replace('/[^a-z0-9]/i', ' ', $line));
        $lower = trim($lower);

        if (preg_match('/^[\-\*\=\.\:\,\>\#\(\)\|\+\/_]+$/', $line)) continue;
        if (preg_match('/^(\-{3,}|={3,}|\*{3,})$/', $line)) continue;
        if (strpos($lower, 'qty') !== false && (strpos($lower, 'price') !== false || strpos($lower, 'item') !== false || strpos($lower, 'total') !== false || strpos($lower, 'desc') !== false)) continue;

        $noiseSubstrings = [
            "subtotal", "grand total", "net amount", "gross amount", "total amount", "net payable",
            "total payable", "amount due", "balance due", "cash received", "cash paid", "change due",
            "change returned", "tax invoice", "sales tax", "gst", "vat", "cashier", "pos slip",
            "thank you", "welcome", "customer copy", "invoice no", "receipt no", "bill #", "tel:", "phone:",
            "address:", "pvt ltd", "cash & carry", "supermarket", "super market", "superstore", "mart"
        ];

        $hasNoise = false;
        foreach ($noiseSubstrings as $ns) {
            if (strpos($lower, $ns) !== false) {
                $hasNoise = true;
                break;
            }
        }
        if ($hasNoise) continue;
        if (preg_match('/^(total|subtotal|sub-total|net total|grand total|amount payable|net payable|payable|cash|change|balance|paid)\b/i', $line)) continue;
        if (in_array($lower, $noiseKeywordsExact)) continue;
        if (preg_match('/^[\d\s.,\/:\-\#\(\)\|\+]+$/', $line)) continue;

        $qty = 1;
        $unit = "item";
        $unitUr = "عدد";
        $price = 0;

        $line = preg_replace('/^\s*(?:\d+[\.\)\-]|[\-\*•\>\✓\✔\xbb])\s*/u', '', $line);
        $line = trim($line);

        if (preg_match('/^\s*(\d{1,3})\s*(?:x|\*|@|pcs|pc|packs|pkt|doz|dozen)?\s+([a-zA-Z\x{0600}-\x{06FF}].*)/iu', $line, $leadingMatch)) {
            $q = (int)$leadingMatch[1];
            if ($q > 0 && $q <= 100) {
                $qty = $q;
                $line = trim($leadingMatch[2]);
            }
        }

        if (preg_match('/^(.*?)(?:[\-–—@=]|rs\.?|pkr\.?|\$)*\s*([\d,]+(?:\.\d+)?)\s*(?:x|\*|@|pcs|pack|pkts)?\s*(\d+)?\s*(?:=|\s)\s*(?:rs\.?|pkr\.?|\$)?\s*([\d,]+(?:\.\d+)?)?$/i', $line, $formulaMatch) && strlen(trim($formulaMatch[1])) >= 2) {
            $candidateName = trim(preg_replace('/[\-–—@=]+$/u', '', $formulaMatch[1]));
            $p1 = (float)str_replace(',', '', $formulaMatch[2]);
            $p2 = !empty($formulaMatch[3]) ? (int)$formulaMatch[3] : null;
            $p3 = !empty($formulaMatch[4]) ? (float)str_replace(',', '', $formulaMatch[4]) : null;

            if (strlen($candidateName) >= 2) {
                $line = $candidateName;
                if ($p2 && $p2 > 0 && $p2 <= 100) $qty = $p2;
                if ($p3 && $p3 > 0) $price = $p1 > 0 ? $p1 : round($p3 / $qty);
                else if ($p1 > 0) $price = $p1;
            }
        } else if (preg_match('/^(.*?)\s+((?:(?:x|@|=|rs\.?|pkr\.?|\$)?\s*[\d,]+(?:\.\d+)?\s*)+)$/i', $line, $trailingBlock)) {
            $candidateName = trim($trailingBlock[1]);
            $rawNumsStr = preg_replace('/x|@|=|rs\.?|pkr\.?|\$/i', ' ', $trailingBlock[2]);
            $rawNums = array_filter(array_map(function($s) { return (float)str_replace(',', '', trim($s)); }, preg_split('/\s+/', trim($rawNumsStr))));

            if (strlen($candidateName) >= 2 && !empty($rawNums)) {
                $line = $candidateName;
                $numsArr = array_values($rawNums);
                if (count($numsArr) === 3) {
                    if ($numsArr[0] > 0 && $numsArr[0] <= 50 && floor($numsArr[0]) == $numsArr[0]) {
                        $qty = (int)$numsArr[0];
                        $price = $numsArr[1];
                    } else {
                        $price = $numsArr[1] > 0 ? $numsArr[1] : $numsArr[0];
                    }
                } else if (count($numsArr) === 2) {
                    if ($numsArr[0] > 0 && $numsArr[0] <= 20 && floor($numsArr[0]) == $numsArr[0] && $numsArr[1] > $numsArr[0] * 5) {
                        $qty = (int)$numsArr[0];
                        $price = round($numsArr[1] / $numsArr[0]);
                    } else {
                        $price = $numsArr[1] > 0 ? $numsArr[1] : $numsArr[0];
                    }
                } else if (count($numsArr) === 1) {
                    $price = $numsArr[0];
                }
            }
        }

        if (preg_match('/\b(1\s*kg|2\s*kg|5\s*kg|kg|1\s*l|1\.5\s*l|liter|liters|l|pack|packs|dozen|doz|pcs|pc|g|500g|400g|bottle|bottles)\b/i', $line, $unitMatch)) {
            $u = strtolower($unitMatch[1]);
            if (strpos($u, 'kg') !== false) { $unit = "kg"; $unitUr = "کلو"; }
            else if (strpos($u, 'l') !== false || strpos($u, 'liter') !== false) { $unit = "liter"; $unitUr = "لیٹر"; }
            else if (strpos($u, 'pack') !== false) { $unit = "pack"; $unitUr = "پیکٹ"; }
            else if (strpos($u, 'doz') !== false) { $unit = "dozen"; $unitUr = "درجن"; }
            else if (strpos($u, 'pcs') !== false || strpos($u, 'pc') !== false) { $unit = "pcs"; $unitUr = "عدد"; }
            else if (strpos($u, 'bottle') !== false) { $unit = "bottle"; $unitUr = "بوتل"; }
            else if (strpos($u, 'g') !== false) { $unit = "g"; $unitUr = "گرام"; }
        }

        $cleanName = trim(preg_replace('/^[\s\-\*\.\:\,\>\#\(\)\|]+|[\s\-\*\.\:\,\>\#\(\)\|]+$/u', '', $line));
        if (empty($cleanName) || strlen($cleanName) < 2) continue;

        $words = preg_split('/\s+/', $cleanName);
        $cleanName = implode(' ', array_map(function($w) { return ucfirst(strtolower($w)); }, $words));

        $matched = fuzzyMatchProductBackendPHP($cleanName, $cleanName, $resolvedProducts);

        if ($matched) {
            $pStatus = strtolower(trim((string)($matched['status'] ?? '')));
            $isInactive = ($pStatus === 'inactive' || $pStatus === 'unavailable');
            $isOutOfStock = (isset($matched['stock_quantity']) && (int)$matched['stock_quantity'] <= 0) || (isset($matched['stockQuantity']) && (int)$matched['stockQuantity'] <= 0);
            $isAvailable = !$isInactive && !$isOutOfStock;

            $salePrice = isset($matched['sale_price']) && (float)$matched['sale_price'] > 0 
                ? (float)$matched['sale_price'] 
                : (isset($matched['salePrice']) && (float)$matched['salePrice'] > 0 ? (float)$matched['salePrice'] : (float)$matched['price']);
            $finalPrice = $price > 0 ? $price : ($salePrice > 0 ? $salePrice : (float)$matched['price']);

            $extractedItems[] = [
                "name" => $matched['name'],
                "nameUr" => $matched['nameUr'] ?? ($matched['name_ur'] ?? $matched['name']),
                "category" => $matched['category'] ?? "Grocery",
                "price" => $finalPrice,
                "qty" => $qty,
                "unit" => $matched['unit'] ?? $unit,
                "unitUr" => $matched['unitUr'] ?? ($matched['unit_ur'] ?? $unitUr),
                "productId" => (int)$matched['id'],
                "matched" => $isAvailable,
                "isCatalogMatch" => true,
                "isAvailable" => $isAvailable,
                "status" => $isAvailable ? "Available" : "Unavailable",
                "currencyCode" => $matched['currencyCode'] ?? "PKR"
            ];
        } else {
            $extractedItems[] = [
                "name" => $cleanName,
                "nameUr" => $cleanName,
                "category" => "Grocery",
                "price" => $price > 0 ? $price : 150,
                "qty" => $qty,
                "unit" => $unit,
                "unitUr" => $unitUr,
                "productId" => "scanned_" . (count($extractedItems) + 1) . "_" . time(),
                "matched" => false,
                "isCatalogMatch" => false,
                "isAvailable" => false,
                "status" => "Unavailable",
                "currencyCode" => "PKR"
            ];
        }
    }

    // Full-text catalog keyword matching fallback
    $lowerOcr = strtolower($cleanedText);
    $existingNames = [];
    foreach ($extractedItems as $it) {
        $existingNames[strtolower(trim($it['name']))] = true;
    }

    foreach ($resolvedProducts as $p) {
        $pNameLower = strtolower(trim($p['name'] ?? ''));
        $pNameUrLower = strtolower(trim($p['nameUr'] ?? ($p['name_ur'] ?? '')));
        if (($pNameLower && strlen($pNameLower) >= 3 && strpos($lowerOcr, $pNameLower) !== false) ||
            ($pNameUrLower && strlen($pNameUrLower) >= 3 && strpos($lowerOcr, $pNameUrLower) !== false)) {
            if (!isset($existingNames[$pNameLower])) {
                $pStatus = strtolower(trim((string)($p['status'] ?? '')));
                $isInactive = ($pStatus === 'inactive' || $pStatus === 'unavailable');
                $isOutOfStock = (isset($p['stock_quantity']) && (int)$p['stock_quantity'] <= 0) || (isset($p['stockQuantity']) && (int)$p['stockQuantity'] <= 0);
                $isAvailable = !$isInactive && !$isOutOfStock;

                $salePrice = isset($p['sale_price']) && (float)$p['sale_price'] > 0 
                    ? (float)$p['sale_price'] 
                    : (isset($p['salePrice']) && (float)$p['salePrice'] > 0 ? (float)$p['salePrice'] : (float)($p['price'] ?? 150));
                
                $extractedItems[] = [
                    "name" => $p['name'],
                    "nameUr" => $p['nameUr'] ?? ($p['name_ur'] ?? $p['name']),
                    "category" => $p['category'] ?? "Grocery",
                    "price" => $salePrice > 0 ? $salePrice : 150,
                    "qty" => 1,
                    "unit" => $p['unit'] ?? "item",
                    "unitUr" => $p['unitUr'] ?? ($p['unit_ur'] ?? "عدد"),
                    "productId" => (int)$p['id'],
                    "matched" => $isAvailable,
                    "isCatalogMatch" => true,
                    "isAvailable" => $isAvailable,
                    "status" => $isAvailable ? "Available" : "Unavailable",
                    "currencyCode" => $p['currencyCode'] ?? "PKR"
                ];
                $existingNames[$pNameLower] = true;
            }
        }
    }

    return $extractedItems;
}

switch ($action) {
    case 'health':
        echo json_encode(["status" => "ok", "platform" => "PHP " . phpversion(), "time" => date('Y-m-d H:i:s')]);
        break;

    // --- 1. USER AUTH DIRECTIVES
    case 'send_verification_code':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $email = isset($body['email']) ? trim($body['email']) : '';
        if (!$email) {
            http_response_code(400);
            echo json_encode(["error" => "Email address is required."]);
            break;
        }
        $cleanEmail = strtolower($email);

        // Generate 6-digit random verification code
        $code = (string)rand(100000, 999999);
        $expiresAt = (time() + 600) * 1000; // 10 minutes validity in ms

        $subject = "VoxCart - Security Verification Code";
        $emailResult = sendVerificationEmailPHP($cleanEmail, $subject, $code);

        if (!$emailResult["success"]) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to deliver verification code to " . $cleanEmail . ". " . ($emailResult["error"] ?? "Please check SMTP configuration.")]);
            break;
        }

        // Store code only if mail sent successfully
        $delStmt = $conn->prepare("DELETE FROM verifications WHERE LOWER(email) = ?");
        $delStmt->execute([$cleanEmail]);
        $insStmt = $conn->prepare("INSERT INTO verifications (email, code, expires_at, attempts) VALUES (?, ?, ?, 0)");
        $insStmt->execute([$cleanEmail, $code, $expiresAt]);

        echo json_encode([
            "success" => true,
            "message" => "A unique 6-digit verification code has been sent to " . $cleanEmail . ". Please check your email inbox.",
            "email" => $cleanEmail
        ]);
        break;

    case 'verify_code':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $email = isset($body['email']) ? trim($body['email']) : '';
        $code = isset($body['code']) ? trim($body['code']) : '';
        if (!$email || !$code) {
            http_response_code(400);
            echo json_encode(["error" => "Email and verification code are required."]);
            break;
        }
        $cleanEmail = strtolower($email);

        $stmt = $conn->prepare("SELECT * FROM verifications WHERE LOWER(email) = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$cleanEmail]);
        $ver = $stmt->fetch();

        if (!$ver) {
            http_response_code(400);
            echo json_encode(["error" => "No verification code requested or session expired. Please request a new code."]);
            break;
        }

        $nowMs = time() * 1000;
        if ($nowMs > (float)$ver['expires_at']) {
            $delStmt = $conn->prepare("DELETE FROM verifications WHERE LOWER(email) = ?");
            $delStmt->execute([$cleanEmail]);
            http_response_code(400);
            echo json_encode(["error" => "Verification code has expired. Please request a new code."]);
            break;
        }

        if ((int)$ver['attempts'] >= 5) {
            $delStmt = $conn->prepare("DELETE FROM verifications WHERE LOWER(email) = ?");
            $delStmt->execute([$cleanEmail]);
            http_response_code(400);
            echo json_encode(["error" => "Too many failed attempts. Please request a new verification code."]);
            break;
        }

        if ($ver['code'] !== $code) {
            $updStmt = $conn->prepare("UPDATE verifications SET attempts = attempts + 1 WHERE id = ?");
            $updStmt->execute([$ver['id']]);
            http_response_code(400);
            echo json_encode(["error" => "Incorrect verification code. Please check and try again."]);
            break;
        }

        // Verified! Clean up
        $delStmt = $conn->prepare("DELETE FROM verifications WHERE LOWER(email) = ?");
        $delStmt->execute([$cleanEmail]);

        echo json_encode([
            "success" => true,
            "verified" => true,
            "message" => "Email address verified successfully!"
        ]);
        break;

    case 'login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $email = isset($body['email']) ? trim($body['email']) : '';
        $password = isset($body['password']) ? $body['password'] : '';
        $verificationCode = isset($body['verificationCode']) ? trim($body['verificationCode']) : (isset($body['code']) ? trim($body['code']) : '');

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "Email and password are required"]);
            break;
        }

        $stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE LOWER(email) = ?");
        $stmt->execute([strtolower($email)]);
        $user = $stmt->fetch();

        if (!$user) {
            // If user doesn't exist yet but valid verification code is provided, auto-create user
            if ($verificationCode) {
                $stmtVer = $conn->prepare("SELECT * FROM verifications WHERE LOWER(email) = ? ORDER BY id DESC LIMIT 1");
                $stmtVer->execute([strtolower($email)]);
                $ver = $stmtVer->fetch();
                $nowMs = time() * 1000;
                if ($ver && $ver['code'] === $verificationCode && $nowMs <= (float)$ver['expires_at']) {
                    $userId = "usr_" . substr(md5(uniqid(mt_rand(), true)), 0, 8);
                    $userName = explode('@', $email)[0];
                    $insUser = $conn->prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'customer')");
                    $insUser->execute([$userId, $userName, strtolower($email), $password ? $password : 'Default123!']);
                    $user = [
                        "id" => $userId,
                        "name" => $userName,
                        "email" => strtolower($email),
                        "role" => "customer"
                    ];
                    $delStmt = $conn->prepare("DELETE FROM verifications WHERE LOWER(email) = ?");
                    $delStmt->execute([strtolower($email)]);
                } else {
                    http_response_code(401);
                    echo json_encode(["error" => "Invalid verification code or user account not found."]);
                    break;
                }
            } else {
                http_response_code(401);
                echo json_encode(["error" => "Invalid email or password."]);
                break;
            }
        } else {
            if ($password && $user['password'] !== $password && $user['password'] !== hash('sha256', $password)) {
                http_response_code(401);
                echo json_encode(["error" => "Invalid email or password"]);
                break;
            }

            if ($verificationCode) {
                $stmtVer = $conn->prepare("SELECT * FROM verifications WHERE LOWER(email) = ? ORDER BY id DESC LIMIT 1");
                $stmtVer->execute([strtolower($email)]);
                $ver = $stmtVer->fetch();
                if (!$ver) {
                    http_response_code(400);
                    echo json_encode(["error" => "Verification code expired or not requested. Please request a new code."]);
                    break;
                }
                $nowMs = time() * 1000;
                if ($nowMs > (float)$ver['expires_at']) {
                    $delStmt = $conn->prepare("DELETE FROM verifications WHERE LOWER(email) = ?");
                    $delStmt->execute([strtolower($email)]);
                    http_response_code(400);
                    echo json_encode(["error" => "Verification code has expired. Please request a new code."]);
                    break;
                }
                if ($ver['code'] !== $verificationCode) {
                    $updStmt = $conn->prepare("UPDATE verifications SET attempts = attempts + 1 WHERE id = ?");
                    $updStmt->execute([$ver['id']]);
                    http_response_code(400);
                    echo json_encode(["error" => "Incorrect verification code. Please enter the valid code."]);
                    break;
                }
                $delStmt = $conn->prepare("DELETE FROM verifications WHERE LOWER(email) = ?");
                $delStmt->execute([strtolower($email)]);
            }
        }

        // Return user context safely
        echo json_encode([
            "id" => $user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "role" => $user['role']
        ]);
        break;

    case 'submit_feedback':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $body = getRequestBody();
        $userId = isset($body['userId']) ? trim($body['userId']) : 'guest';
        $userName = isset($body['userName']) ? trim($body['userName']) : 'Anonymous User';
        $userEmail = isset($body['userEmail']) ? trim($body['userEmail']) : 'guest@voxcart.com';
        $type = isset($body['type']) ? trim($body['type']) : 'feedback';
        $subject = isset($body['subject']) ? trim($body['subject']) : '';
        $message = isset($body['message']) ? trim($body['message']) : '';
        $rating = isset($body['rating']) ? (int)$body['rating'] : 5;

        if (!$subject || !$message) {
            http_response_code(400);
            echo json_encode(["error" => "Subject and message content are required."]);
            break;
        }

        $id = "fb_" . substr(md5(uniqid(mt_rand(), true)), 0, 10);
        $createdAt = date('Y-m-d H:i:s');

        $stmt = $conn->prepare("INSERT INTO feedback (id, user_id, user_name, user_email, type, subject, message, rating, status, admin_response, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NULL, ?)");
        $stmt->execute([$id, $userId, $userName, $userEmail, $type, $subject, $message, $rating, $createdAt]);

        $newFeedback = [
            "id" => $id,
            "userId" => $userId,
            "userName" => $userName,
            "userEmail" => $userEmail,
            "type" => $type,
            "subject" => $subject,
            "message" => $message,
            "rating" => $rating,
            "status" => "Pending",
            "adminResponse" => null,
            "createdAt" => $createdAt,
            "repliedAt" => null
        ];

        echo json_encode([
            "success" => true,
            "feedback" => $newFeedback,
            "message" => "Your submission has been received successfully! Thank you for your feedback."
        ]);
        break;

    case 'get_feedback':
        $userId = isset($_GET['userId']) ? trim($_GET['userId']) : null;
        $email = isset($_GET['email']) ? trim($_GET['email']) : null;

        if ($userId && $userId !== 'usr_admin') {
            $stmt = $conn->prepare("SELECT * FROM feedback WHERE user_id = ? OR LOWER(user_email) = ? ORDER BY created_at DESC");
            $stmt->execute([$userId, strtolower($email ? $email : '')]);
        } else {
            $stmt = $conn->prepare("SELECT * FROM feedback ORDER BY created_at DESC");
            $stmt->execute();
        }

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $result = [];
        foreach ($rows as $r) {
            $result[] = [
                "id" => $r['id'],
                "userId" => $r['user_id'],
                "userName" => $r['user_name'],
                "userEmail" => $r['user_email'],
                "type" => $r['type'],
                "subject" => $r['subject'],
                "message" => $r['message'],
                "rating" => (int)$r['rating'],
                "status" => $r['status'],
                "adminResponse" => $r['admin_response'],
                "createdAt" => $r['created_at'],
                "repliedAt" => $r['replied_at']
            ];
        }
        echo json_encode($result);
        break;

    case 'reply_feedback':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        $body = getRequestBody();
        $adminResponse = isset($body['adminResponse']) ? trim($body['adminResponse']) : '';

        if (!$id || !$adminResponse) {
            http_response_code(400);
            echo json_encode(["error" => "ID and response message are required."]);
            break;
        }

        $repliedAt = date('Y-m-d H:i:s');
        $stmt = $conn->prepare("UPDATE feedback SET status = 'Replied', admin_response = ?, replied_at = ? WHERE id = ?");
        $stmt->execute([$adminResponse, $repliedAt, $id]);

        $fetchStmt = $conn->prepare("SELECT * FROM feedback WHERE id = ?");
        $fetchStmt->execute([$id]);
        $r = $fetchStmt->fetch();

        echo json_encode([
            "success" => true,
            "feedback" => $r ? [
                "id" => $r['id'],
                "userId" => $r['user_id'],
                "userName" => $r['user_name'],
                "userEmail" => $r['user_email'],
                "type" => $r['type'],
                "subject" => $r['subject'],
                "message" => $r['message'],
                "rating" => (int)$r['rating'],
                "status" => $r['status'],
                "adminResponse" => $r['admin_response'],
                "createdAt" => $r['created_at'],
                "repliedAt" => $r['replied_at']
            ] : null,
            "message" => "Response submitted and sent to user successfully!"
        ]);
        break;

    case 'delete_feedback':
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Feedback ID is required."]);
            break;
        }
        $stmt = $conn->prepare("DELETE FROM feedback WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true, "message" => "Feedback entry deleted successfully."]);
        break;

    case 'reset_password':
        $body = getRequestBody();
        $email = isset($body['email']) ? trim($body['email']) : '';
        $newPassword = isset($body['newPassword']) ? $body['newPassword'] : '';
        if (!$email || !$newPassword) {
            http_response_code(400);
            echo json_encode(["error" => "Email and new password are required"]);
            break;
        }
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE LOWER(email) = ?");
        $stmt->execute([$newPassword, strtolower($email)]);
        echo json_encode(["success" => true, "message" => "Password reset successfully"]);
        break;

    case 'update_password':
        $body = getRequestBody();
        $userId = isset($body['userId']) ? trim($body['userId']) : '';
        $currentPassword = isset($body['currentPassword']) ? $body['currentPassword'] : '';
        $newPassword = isset($body['newPassword']) ? $body['newPassword'] : '';
        if (!$userId || !$currentPassword || !$newPassword) {
            http_response_code(400);
            echo json_encode(["error" => "All parameters required"]);
            break;
        }
        $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $usr = $stmt->fetch();
        if (!$usr || ($usr['password'] !== $currentPassword && $usr['password'] !== hash('sha256', $currentPassword))) {
            http_response_code(400);
            echo json_encode(["error" => "Current password is incorrect"]);
            break;
        }
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->execute([$newPassword, $userId]);
        echo json_encode(["success" => true, "message" => "Password updated successfully"]);
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

            $stmt = $conn->prepare("INSERT INTO orders (id, user_id, user_email, items_json, subtotal, tax, total, currency, status, payment_method, payment_details, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Processing', ?, ?, ?)");
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

        if ($status === 'Pending') {
            http_response_code(400);
            echo json_encode(["error" => "Status 'Pending' cannot be selected for status updates."]);
            break;
        }

        if ($status === 'Cancelled') {
            $stmt = $conn->prepare("DELETE FROM orders WHERE id = ?");
            $stmt->execute([$orderId]);
            echo json_encode(["success" => true, "message" => "Order cancelled and deleted automatically"]);
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
                        ["searchTerms" => ["onion", "piaz", "پیاز"], "fallbackName" => "Onions", "fallbackNameUr" => "پیاز", "fallbackCategory" => "Vegetables", "fallbackPrice" => 333.2, "qty" => 250, "unit" => "g", "unitUr" => "گرام"],
                        ["searchTerms" => ["tomato", "tamatar", "ٹماٹر"], "fallbackName" => "Tomatoes", "fallbackNameUr" => "ٹماٹر", "fallbackCategory" => "Vegetables", "fallbackPrice" => 697.2, "qty" => 250, "unit" => "g", "unitUr" => "گرام"],
                        ["searchTerms" => ["potato", "aaloo", "آلو"], "fallbackName" => "Potatoes", "fallbackNameUr" => "آلو", "fallbackCategory" => "Vegetables", "fallbackPrice" => 361.2, "qty" => 250, "unit" => "g", "unitUr" => "گرام"],
                        ["searchTerms" => ["oil", "koking", "ککنگ", "تیل"], "fallbackName" => "Cooking Oil", "fallbackNameUr" => "ککنگ آئل", "fallbackCategory" => "Pantry", "fallbackPrice" => 2517.2, "qty" => 250, "unit" => "ml", "unitUr" => "ملی لیٹر"],
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

    case 'ocr':
    case 'process_ocr':
    case 'process-ocr':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not permitted"]);
            break;
        }

        $body = getRequestBody();
        $rawImageInput = $body['imageBase64'] ?? ($body['file'] ?? ($body['image'] ?? ($body['base64'] ?? ($body['data'] ?? ($_POST['imageBase64'] ?? ($_POST['file'] ?? ($_POST['image'] ?? '')))))));
        $mimeType = $body['mimeType'] ?? ($body['mime'] ?? ($body['type'] ?? ($_POST['mimeType'] ?? 'image/jpeg')));
        $clientOcrText = $body['ocrText'] ?? ($body['text'] ?? ($_POST['ocrText'] ?? ''));

        // Check if an image was uploaded via multipart/form-data
        if (empty($rawImageInput) && !empty($_FILES)) {
            $uploadedFile = $_FILES['image'] ?? ($_FILES['file'] ?? null);
            if ($uploadedFile && isset($uploadedFile['tmp_name']) && is_uploaded_file($uploadedFile['tmp_name'])) {
                $fileBytes = file_get_contents($uploadedFile['tmp_name']);
                if ($fileBytes !== false) {
                    $rawImageInput = base64_encode($fileBytes);
                    if (!empty($uploadedFile['type'])) {
                        $mimeType = $uploadedFile['type'];
                    }
                }
            }
        }

        // Fetch products catalog from MySQL database or fallback db_store.json
        $resolvedProducts = [];
        if ($conn) {
            try {
                $stmtProducts = $conn->query("SELECT * FROM products ORDER BY id ASC");
                $allProductsRaw = $stmtProducts->fetchAll();
                list($brands, $categories, $subcategories, $units, $currencies) = getLookupData($conn);
                foreach ($allProductsRaw as $p) {
                    $resolvedProducts[] = resolveProductFlatFields($p, $brands, $categories, $subcategories, $units, $currencies);
                }
            } catch (Exception $dbEx) {
                $resolvedProducts = [];
            }
        }

        if (empty($resolvedProducts)) {
            $jsonDbPath = __DIR__ . '/../db_store.json';
            if (file_exists($jsonDbPath)) {
                $jsonContent = @file_get_contents($jsonDbPath);
                $jsonData = json_decode($jsonContent, true);
                if (isset($jsonData['products']) && is_array($jsonData['products'])) {
                    $resolvedProducts = $jsonData['products'];
                }
            }
        }

        // Clean base64 string and extract MIME type if provided as data URL
        $base64Data = $rawImageInput;
        if (is_string($rawImageInput) && strpos($rawImageInput, 'data:') === 0) {
            if (preg_match('/^data:([^;]+);base64,(.+)$/s', $rawImageInput, $matches)) {
                $mimeType = $matches[1];
                $base64Data = $matches[2];
            } else {
                $parts = explode(';base64,', $rawImageInput, 2);
                if (count($parts) === 2) {
                    $base64Data = $parts[1];
                    $typePart = explode(':', $parts[0], 2);
                    if (count($typePart) === 2) {
                        $mimeType = $typePart[1];
                    }
                }
            }
        }

        $base64Data = trim(preg_replace('/\s+/', '', (string)$base64Data));
        if (empty($mimeType) || strpos($mimeType, '/') === false) {
            $mimeType = 'image/jpeg';
        }

        // Retrieve Gemini API Key
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

        $envPaths = [
            __DIR__ . '/../.env',
            __DIR__ . '/.env',
            __DIR__ . '/../../.env'
        ];
        foreach ($envPaths as $envPath) {
            if ((!$apiKey || strpos($apiKey, 'YourActualGeminiAPIKeyHere') !== false) && file_exists($envPath)) {
                $envLines = @file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                if (is_array($envLines)) {
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
        }

        $productsParsed = [];
        $extractedJsonText = '';

        if ($apiKey && !empty($base64Data)) {
            $productListLines = [];
            foreach ($resolvedProducts as $p) {
                $pId = $p['id'];
                $pName = addslashes($p['name']);
                $pNameUr = addslashes($p['nameUr'] ?? ($p['name_ur'] ?? ''));
                $pCategory = addslashes($p['category']);
                $pPrice = $p['price'];
                $pUnit = addslashes($p['unit']);
                $pUnitUr = addslashes($p['unitUr'] ?? ($p['unit_ur'] ?? 'عدد'));
                $productListLines[] = "- ID: {$pId}, English Name: \"{$pName}\", Urdu Name: \"{$pNameUr}\", Category: \"{$pCategory}\", Price: {$pPrice}, Unit: \"{$pUnit}\", Urdu Unit: \"{$pUnitUr}\"";
            }
            $productListString = implode("\n", $productListLines);

            $promptText = "You are a high-precision OCR and document analysis engine specialized in reading physical paper receipts, supermarket bills, wholesale invoices, POS cash register printouts, handwritten grocery lists, and shopping invoices in English, Urdu, and bilingual formats.\n\n";
            $promptText .= "Read this image from top to bottom thoroughly. Detect and extract every single purchased product, food item, grocery, beverage, household supply, or line item visible in the image.\n\n";
            $promptText .= "STORE PRODUCT CATALOG (FOR REFERENCE AND MATCHING ID WHEN APPLICABLE):\n";
            $promptText .= $productListString . "\n\n";
            $promptText .= "EXTRACTION INSTRUCTIONS:\n";
            $promptText .= "1. Extract ALL purchased products/items.\n";
            $promptText .= "2. For each detected item provide:\n";
            $promptText .= "   - \"name\": Clean English title of the item (e.g., \"Fresh Milk 1L\", \"Super Basmati Rice 5kg\", \"Eggs 1 Dozen\", \"Cooking Oil 1L\", \"Potatoes 2kg\", \"Tomatoes 1kg\", \"Onions 1kg\", \"Sugar 5kg\", \"Tapal Danedar Tea 430g\").\n";
            $promptText .= "   - \"nameUr\": Urdu script title for the item (e.g., \"تازہ دودھ\", \"سپر باسپتی چاول\", \"انڈے\", \"کوکنگ آئل\", \"آلو\", \"ٹماٹر\", \"پیاز\", \"چینی\", \"چائے\").\n";
            $promptText .= "   - \"category\": Category name (e.g. \"Dairy\", \"Grains\", \"Vegetables\", \"Grocery\", \"Beverages\", \"Snacks\").\n";
            $promptText .= "   - \"price\": Item unit price or line price as a numeric value without currency symbols (e.g. 280, 450, 150).\n";
            $promptText .= "   - \"qty\": Quantity purchased as a positive integer (default to 1 if not specified).\n";
            $promptText .= "   - \"unit\": Measurement unit in English (e.g. \"kg\", \"liter\", \"pack\", \"pcs\", \"dozen\", \"bottle\", \"g\", \"item\").\n";
            $promptText .= "   - \"unitUr\": Measurement unit in Urdu (e.g. \"کلو\", \"لیٹر\", \"پیکٹ\", \"عدد\", \"درجن\", \"بوتل\", \"گرام\").\n";
            $promptText .= "   - \"productId\": If the item matches an item in the STORE PRODUCT CATALOG, provide its exact store ID. Otherwise null.\n";
            $promptText .= "3. EXCLUDE store metadata (store name, branch address, phone number, cashier name, invoice number, date/timestamp).\n";
            $promptText .= "4. EXCLUDE summary/subtotal lines (subtotal, GST/sales tax, cash paid, change due, grand total, balance).\n";
            $promptText .= "5. Output format must strictly be a valid JSON object:\n";
            $promptText .= "{\n";
            $promptText .= "  \"items\": [\n";
            $promptText .= "    {\n";
            $promptText .= "      \"name\": \"Olpers Milk 1L\",\n";
            $promptText .= "      \"nameUr\": \"اولپرز دودھ 1 لیٹر\",\n";
            $promptText .= "      \"category\": \"Dairy\",\n";
            $promptText .= "      \"price\": 280,\n";
            $promptText .= "      \"qty\": 2,\n";
            $promptText .= "      \"unit\": \"liter\",\n";
            $promptText .= "      \"unitUr\": \"لیٹر\",\n";
            $promptText .= "      \"productId\": 1\n";
            $promptText .= "    }\n";
            $promptText .= "  ]\n";
            $promptText .= "}";

            $geminiPayload = [
                "contents" => [
                    [
                        "parts" => [
                            [
                                "inline_data" => [
                                    "mime_type" => $mimeType,
                                    "data" => $base64Data
                                ]
                            ],
                            [
                                "text" => $promptText
                            ]
                        ]
                    ]
                ],
                "generationConfig" => [
                    "responseMimeType" => "application/json"
                ]
            ];

            $modelNames = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];

            foreach ($modelNames as $modelName) {
                $url = "https://generativelanguage.googleapis.com/v1beta/models/" . $modelName . ":generateContent?key=" . $apiKey;
                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($geminiPayload));
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'User-Agent: aistudio-build']);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
                curl_setopt($ch, CURLOPT_TIMEOUT, 30);

                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if ($response !== false && $httpCode === 200) {
                    $resDecoded = json_decode($response, true);
                    $extractedJsonText = $resDecoded['candidates'][0]['content']['parts'][0]['text'] ?? '';
                    if (!empty($extractedJsonText) && strlen(trim($extractedJsonText)) > 2) {
                        break; // Successfully got JSON from Gemini
                    }
                }
            }
        }

        // Parse extracted JSON string from Gemini
        if (!empty($extractedJsonText)) {
            $cleanText = $extractedJsonText;
            if (strpos($cleanText, "```json") !== false) {
                $parts = explode("```json", $cleanText);
                $parts = explode("```", $parts[1]);
                $cleanText = $parts[0];
            } elseif (strpos($cleanText, "```") !== false) {
                $parts = explode("```", $cleanText);
                $parts = explode("```", $parts[1]);
                $cleanText = $parts[0];
            }
            $cleanText = trim($cleanText);

            $rawParsed = json_decode($cleanText, true);
            if (!is_array($rawParsed)) {
                $firstBracket = strpos($cleanText, "[");
                $lastBracket = strrpos($cleanText, "]");
                if ($firstBracket !== false && $lastBracket !== false && $lastBracket > $firstBracket) {
                    $rawParsed = json_decode(substr($cleanText, $firstBracket, $lastBracket - $firstBracket + 1), true);
                } else {
                    $firstObj = strpos($cleanText, "{");
                    $lastObj = strrpos($cleanText, "}");
                    if ($firstObj !== false && $lastObj !== false && $lastObj > $firstObj) {
                        $rawParsed = json_decode(substr($cleanText, $firstObj, $lastObj - $firstObj + 1), true);
                    }
                }
            }

            if (is_array($rawParsed)) {
                if (isset($rawParsed['items']) && is_array($rawParsed['items'])) {
                    $productsParsed = $rawParsed['items'];
                } elseif (isset($rawParsed['products']) && is_array($rawParsed['products'])) {
                    $productsParsed = $rawParsed['products'];
                } elseif (isset($rawParsed['data']) && is_array($rawParsed['data'])) {
                    $productsParsed = $rawParsed['data'];
                } elseif (isset($rawParsed[0])) {
                    $productsParsed = $rawParsed;
                } else {
                    foreach ($rawParsed as $val) {
                        if (is_array($val) && count($val) > 0) {
                            $productsParsed = $val;
                            break;
                        }
                    }
                    if (empty($productsParsed) && (isset($rawParsed['name']) || isset($rawParsed['itemName']))) {
                        $productsParsed = [$rawParsed];
                    }
                }
            }
        }

        // If Gemini was unavailable/empty, execute local server Tesseract OCR on image buffer
        if (empty($productsParsed) && !empty($base64Data)) {
            $imgBytes = base64_decode($base64Data);
            if ($imgBytes !== false) {
                $tmpImgPath = sys_get_temp_dir() . '/ocr_php_' . uniqid() . '.png';
                file_put_contents($tmpImgPath, $imgBytes);
                
                $ocrText = @shell_exec("tesseract " . escapeshellarg($tmpImgPath) . " stdout -l eng+urd --psm 6 2>/dev/null");
                if (!$ocrText || strlen(trim($ocrText)) < 3) {
                    $ocrText = @shell_exec("tesseract " . escapeshellarg($tmpImgPath) . " stdout -l eng 2>/dev/null");
                }
                @unlink($tmpImgPath);

                if (!empty($ocrText) && strlen(trim($ocrText)) > 2) {
                    $parsedFromTesseract = parseOcrTextToItemsPHP($ocrText, $resolvedProducts);
                    if (!empty($parsedFromTesseract)) {
                        $productsParsed = $parsedFromTesseract;
                    }
                }
            }
        }

        // If Gemini was unavailable/empty and client sent OCR text, parse the text
        if (empty($productsParsed) && !empty($clientOcrText)) {
            $parsedFromText = parseOcrTextToItemsPHP($clientOcrText, $resolvedProducts);
            if (!empty($parsedFromText)) {
                $productsParsed = $parsedFromText;
            }
        }

        // Noise line filters
        $summaryNoiseExact = [
            'total', 'subtotal', 'tax', 'gst', 'vat', 'discount', 'balance', 'change',
            'cash', 'visa', 'mastercard', 'invoice', 'receipt', 'date', 'amount',
            'cashier', 'billing', 'tel', 'phone', 'address', 'store', 'market',
            'welcome', 'thank you', 'payment', 'card', 'customer', 'shoppe',
            'bazaar', 'item count', 'items count', 'qty total', 'quantity total',
            'discount total', 'grand total', 'net total', 'round off', 'gross amt',
            'net amt', 'total amount'
        ];

        $formattedProducts = [];

        if (!empty($productsParsed)) {
            foreach ($productsParsed as $idx => $item) {
                if (!is_array($item)) continue;

                $rawName = $item['name'] ?? ($item['itemName'] ?? ($item['productName'] ?? ($item['item'] ?? "Scanned Item " . ($idx + 1))));
                $cleanedName = trim(preg_replace('/^[\s\d\-•*.)\]:]+/', '', (string)$rawName));
                if (empty($cleanedName)) $cleanedName = (string)$rawName;

                $lowerName = strtolower(trim(preg_replace('/[:#\-*.]/u', '', $cleanedName)));
                if (strlen($lowerName) < 2 || in_array($lowerName, $summaryNoiseExact) || preg_match('/^\d+$/', $lowerName)) {
                    continue; // Skip noise line
                }

                $name = $cleanedName;
                $nameUr = $item['nameUr'] ?? ($item['name_ur'] ?? ($item['urdu_name'] ?? ($item['urduName'] ?? $name)));
                $category = $item['category'] ?? ($item['cat'] ?? "Grocery");

                $price = 0;
                if (isset($item['price']) && is_numeric($item['price'])) {
                    $parsedPrice = (float)$item['price'];
                    if ($parsedPrice > 0) $price = $parsedPrice;
                }

                $qty = 1;
                if (isset($item['qty']) && is_numeric($item['qty'])) {
                    $parsedQty = (int)$item['qty'];
                    if ($parsedQty > 0) $qty = $parsedQty;
                }

                $unit = $item['unit'] ?? "item";
                $unitUr = $item['unitUr'] ?? ($item['unit_ur'] ?? "عدد");

                // Product Database Matching against MySQL
                $matched = null;
                $itemProductId = $item['productId'] ?? ($item['id'] ?? null);
                if ($itemProductId && (is_numeric($itemProductId) || preg_match('/^\d+$/', (string)$itemProductId))) {
                    foreach ($resolvedProducts as $p) {
                        if ((string)$p['id'] === (string)$itemProductId) {
                            $matched = $p;
                            break;
                        }
                    }
                }

                if (!$matched) {
                    $matched = fuzzyMatchProductBackendPHP($name, $nameUr, $resolvedProducts);
                }

                if (!$matched) {
                    $lowerClean = strtolower(trim($name));
                    foreach ($resolvedProducts as $p) {
                        $pNameLower = strtolower(trim($p['name'] ?? ''));
                        $pNameUrLower = strtolower(trim($p['nameUr'] ?? ($p['name_ur'] ?? '')));
                        if ($pNameLower === $lowerClean || ($pNameUrLower && $pNameUrLower === $lowerClean)) {
                            $matched = $p;
                            break;
                        }
                    }
                }

                if ($matched) {
                    $pStatus = strtolower(trim((string)($matched['status'] ?? '')));
                    $isInactive = ($pStatus === 'inactive' || $pStatus === 'unavailable');
                    $isAvailable = !$isInactive;

                    $salePrice = isset($matched['sale_price']) && (float)$matched['sale_price'] > 0 
                        ? (float)$matched['sale_price'] 
                        : (isset($matched['salePrice']) && (float)$matched['salePrice'] > 0 ? (float)$matched['salePrice'] : (float)$matched['price']);
                    
                    $finalPrice = $price > 0 ? $price : ($salePrice > 0 ? $salePrice : (float)$matched['price']);

                    $formattedProducts[] = [
                        "name" => $matched['name'],
                        "nameUr" => $matched['nameUr'] ?? ($matched['name_ur'] ?? $matched['name']),
                        "category" => $matched['category'] ?? $category,
                        "price" => $finalPrice,
                        "qty" => $qty,
                        "unit" => $matched['unit'] ?? $unit,
                        "unitUr" => $matched['unitUr'] ?? ($matched['unit_ur'] ?? $unitUr),
                        "productId" => (int)$matched['id'],
                        "matched" => true,
                        "isAvailable" => $isAvailable,
                        "status" => $isAvailable ? "Available" : "Unavailable",
                        "currencyCode" => $matched['currencyCode'] ?? "PKR"
                    ];
                } else {
                    $formattedProducts[] = [
                        "name" => $name,
                        "nameUr" => $nameUr,
                        "category" => $category ?: "Grocery",
                        "price" => $price > 0 ? $price : 150,
                        "qty" => $qty,
                        "unit" => $unit,
                        "unitUr" => $unitUr,
                        "productId" => "scanned_" . ($idx + 1) . "_" . time(),
                        "matched" => false,
                        "isAvailable" => false,
                        "status" => "Unavailable",
                        "currencyCode" => "PKR"
                    ];
                }
            }
        }

        // Deduplicate final scanned items by lowercase name
        $seen = [];
        $finalProducts = [];
        foreach ($formattedProducts as $prod) {
            $key = strtolower(trim($prod['name']));
            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $finalProducts[] = $prod;
            }
        }

        echo json_encode($finalProducts);
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
            $prompt .= "    - \"Chicken Biryani\" / \"Ingredients for Biryani\": Chicken Breast (1 KG, matched: true, productId: 13), White Rice (1 KG, matched: true, productId: 19), Onions (250 Grams, matched: true, productId: 11), Tomatoes (250 Grams, matched: true, productId: 9), Potatoes (250 Grams, matched: true, productId: 10), Cooking Oil (250 ML, matched: true, productId: 21), Salt (1 Pack, matched: true, productId: 23), Biryani Masala / Spices (1 Pack, matched: false, productId: null, category: Pantry), Ginger Garlic Paste (1 Pack, matched: false, productId: null, category: Pantry), Yogurt / Dahi (1 Pack, matched: false, productId: null, category: Dairy), Fresh Mint / Pudina (1 Bunch, matched: false, productId: null, category: Vegetables).\n";
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

            $modelNames = ["gemini-3.6-flash", "gemini-flash-latest"];
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

            $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" . $apiKey;
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
                        ? "🥘 **چکن بریانی کی مکمل ریسپی اور درکار اجزاء:**\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🌾 **سیلا / باسمتی چاول (White Rice):** 1 کلو\n- 🧅 **پیاز (Onions):** 250 گرام\n- 🍅 **ٹماٹر (Tomatoes):** 250 گرام\n- 🥔 **آلو (Potatoes):** 250 گرام\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 250 ملی لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **بریانی مصالحہ اور ادرک لہسن پیسٹ:** درکار مصالحہ جات\n- 🥛 **دہی اور تازہ پودینہ:** اضافی ذائقہ\n\n💡 **طریقہ:** **Catalog** ٹیب میں جائیں اور سرچ میں 'Biryani' لکھیں تاکہ یہ تمام اجزاء ایک کلک میں کارٹ میں شامل کر سکیں!"
                        : "🥘 **Chicken Biryani Recipe & Complete Ingredients:**\n- 🍗 **Chicken Breast:** 1 KG\n- 🌾 **White Rice:** 1 KG\n- 🧅 **Onions:** 250 Grams\n- 🍅 **Tomatoes:** 250 Grams\n- 🥔 **Potatoes:** 250 Grams\n- 🛢️ **Cooking Oil:** 250 ML\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Biryani Masala & Ginger Garlic Paste:** Essential Spices\n- 🥛 **Yogurt & Fresh Mint:** For Garnishing\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Biryani' to add all these required ingredients to your cart in 1-click!";
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
