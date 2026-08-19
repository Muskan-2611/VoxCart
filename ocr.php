<?php
// ocr.php - PHP Backend Script for Image OCR Detection & Product Catalog Matching

ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

if (php_sapi_name() !== 'cli') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json; charset=utf-8');

    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit(0);
    }
}

$inputRaw = file_get_contents('php://input');
if (!$inputRaw) {
    $inputRaw = file_get_contents('php://stdin');
}
if (!$inputRaw && isset($argv[1]) && file_exists($argv[1])) {
    $inputRaw = file_get_contents($argv[1]);
}

if (!$inputRaw) {
    echo json_encode([]);
    exit(0);
}

$data = json_decode($inputRaw, true);
if (!$data || !isset($data['imageBase64'])) {
    echo json_encode([]);
    exit(0);
}

$imageBase64 = $data['imageBase64'];
$catalogList = isset($data['catalogList']) && is_array($data['catalogList']) ? $data['catalogList'] : [];

// Clean base64 header if present
if (strpos($imageBase64, ',') !== false) {
    $parts = explode(',', $imageBase64);
    $imageBase64 = end($parts);
}

$imgBytes = base64_decode($imageBase64);
if (!$imgBytes) {
    echo json_encode([]);
    exit(0);
}

$tmpImgPath = sys_get_temp_dir() . '/ocr_scan_' . uniqid() . '.png';
file_put_contents($tmpImgPath, $imgBytes);

// Run tesseract OCR on the temporary image file
$ocrText = "";
$cmd = "tesseract " . escapeshellarg($tmpImgPath) . " stdout -l eng+urd --psm 6 2>/dev/null";
$ocrText = shell_exec($cmd);

// Fallback to default PSM if PSM 6 yielded empty result
if (!$ocrText || strlen(trim($ocrText)) < 3) {
    $cmd2 = "tesseract " . escapeshellarg($tmpImgPath) . " stdout -l eng 2>/dev/null";
    $ocrText = shell_exec($cmd2);
}

@unlink($tmpImgPath);

if (!$ocrText) {
    $ocrText = "";
}

function normalizeStr($str) {
    $str = strtolower($str);
    $str = preg_replace('/[.,\/#!$%\^&\*;:{}=\-_`~()]/', '', $str);
    $str = preg_replace('/\s+/', ' ', $str);
    return trim($str);
}

function cleanNoiseWords($str) {
    $norm = normalizeStr($str);
    $noisePattern = '/\b(1x|2x|3x|4x|5x|kg|g|gram|grams|kilo|kilos|kilogram|kilograms|liter|liters|litre|litres|l|ml|milliliter|milliliters|lb|lbs|pound|pounds|pack|packs|packet|packets|box|boxes|bottle|bottles|piece|pieces|pcs|pc|dozen|dozens|pkr|rs|usd|\$|item|items)\b/i';
    $cleaned = preg_replace($noisePattern, '', $norm);
    $cleaned = preg_replace('/\b\d+(\.\d+)?(kg|g|l|ml|oz|lb)?\b/i', '', $cleaned);
    $cleaned = preg_replace('/\b\d+\b/', '', $cleaned);
    $cleaned = preg_replace('/\s+/', ' ', $cleaned);
    return trim($cleaned);
}

function matchProduct($pNameItem, $pNameUrItem, $catalogList) {
    if (empty($catalogList)) return null;

    $rawEn = normalizeStr($pNameItem);
    $rawUr = normalizeStr($pNameUrItem);

    if (empty($rawEn) && empty($rawUr)) return null;

    $cleanedEn = cleanNoiseWords($rawEn);
    if (empty($cleanedEn)) $cleanedEn = $rawEn;

    // Direct exact match
    foreach ($catalogList as $p) {
        $pName = normalizeStr($p['name'] ?? '');
        $pNameUr = normalizeStr($p['nameUr'] ?? '');
        if ($pName === $rawEn || ($pNameUr && $rawUr && $pNameUr === $rawUr) || $pName === $cleanedEn) {
            return $p;
        }
    }

    // Substring & Token Overlap Match
    $best = null;
    $maxScore = 0;

    foreach ($catalogList as $p) {
        $pName = normalizeStr($p['name'] ?? '');
        $pNameUr = normalizeStr($p['nameUr'] ?? '');
        $pCleaned = cleanNoiseWords($pName);
        if (empty($pCleaned)) $pCleaned = $pName;

        $score = 0;

        if ($pCleaned === $cleanedEn) {
            $score = 98;
        } elseif (!empty($cleanedEn) && !empty($pCleaned) && (strpos($pCleaned, $cleanedEn) !== false || strpos($cleanedEn, $pCleaned) !== false)) {
            $score = 85;
        } elseif (!empty($rawEn) && !empty($pName) && (strpos($pName, $rawEn) !== false || strpos($rawEn, $pName) !== false)) {
            $score = 80;
        } elseif (!empty($rawUr) && !empty($pNameUr) && (strpos($pNameUr, $rawUr) !== false || strpos($rawUr, $pNameUr) !== false)) {
            $score = 85;
        }

        // Token match
        $scannedTokens = array_filter(explode(' ', $cleanedEn), function($t) { return strlen($t) > 1; });
        $productTokens = array_filter(explode(' ', $pCleaned), function($t) { return strlen($t) > 1; });

        if (!empty($scannedTokens) && !empty($productTokens)) {
            $matches = 0;
            foreach ($scannedTokens as $st) {
                foreach ($productTokens as $pt) {
                    if ($st === $pt || (strlen($st) >= 3 && (strpos($pt, $st) !== false || strpos($st, $pt) !== false))) {
                        $matches++;
                        break;
                    }
                }
            }
            if ($matches > 0) {
                $tokScore = ($matches / max(count($scannedTokens), count($productTokens))) * 80;
                if ($tokScore > $score) $score = $tokScore;
            }
        }

        if ($score > $maxScore && $score >= 50) {
            $maxScore = $score;
            $best = $p;
        }
    }

    return $best;
}

$rawLines = preg_split('/\r?\n/', $ocrText);
$extractedItems = [];
$seenKeys = [];

foreach ($rawLines as $line) {
    $line = trim($line);
    if (strlen($line) < 2) continue;

    $lower = strtolower($line);
    if (preg_match('/^(total|subtotal|tax|gst|vat|discount|balance|change|cash|invoice|receipt|date|amount|thank you|welcome|cashier|qty|price)\b/i', $line)) {
        continue;
    }
    if (preg_match('/^[\d\s.,\/:\-\#\(\)\|\+\*]+$/', $line)) {
        continue;
    }

    $qty = 1;
    $unit = 'item';
    $unitUr = 'عدد';
    $price = 0;

    // Strip leading index e.g. "1.", "2)", "•"
    $line = preg_replace('/^\s*(?:\d+[\.\)\-]|[\-\*•\>\✓\✔])\s*/', '', $line);

    // Strip leading quantity e.g. "1 Chicken", "2 Honey", "3 Mangoes"
    if (preg_match('/^\s*(\d{1,3})\s*(?:x|\*|@|pcs|pc|packs|pkt|doz|dozen)?\s+([a-zA-Z\x{0600}-\x{06FF}].*)/u', $line, $m)) {
        $q = intval($m[1]);
        if ($q > 0 && $q <= 100) {
            $qty = $q;
            $line = trim($m[2]);
        }
    }

    // Detect trailing price
    if (preg_match('/^(.*?)\s+((?:rs\.?|pkr\.?|\$)?\s*[\d,]+(?:\.\d+)?)$/i', $line, $pm)) {
        $candidateName = trim($pm[1]);
        $rawPrice = floatval(str_replace(',', '', preg_replace('/[^\d.]/', '', $pm[2])));
        if (strlen($candidateName) >= 2 && $rawPrice > 0) {
            $line = $candidateName;
            $price = $rawPrice;
        }
    }

    $cleanName = preg_replace('/^[\s\-\*\.\:\,\>\#\(\)\|]+|[\s\-\*\.\:\,\>\#\(\)\|]+$/u', '', $line);
    $cleanName = trim($cleanName);
    if (strlen($cleanName) < 2) continue;

    $cleanName = ucwords(strtolower($cleanName));
    $key = strtolower($cleanName);
    if (isset($seenKeys[$key])) continue;

    $matchedProd = matchProduct($cleanName, $cleanName, $catalogList);

    if ($matchedProd) {
        $pStatus = strtolower(trim($matchedProd['status'] ?? ''));
        $isInactive = ($pStatus === 'inactive' || $pStatus === 'unavailable');
        $isOutOfStock = (isset($matchedProd['stockQuantity']) && is_numeric($matchedProd['stockQuantity']) && intval($matchedProd['stockQuantity']) <= 0);
        $isAvailable = !$isInactive && !$isOutOfStock;
        $activePrice = (isset($matchedProd['salePrice']) && $matchedProd['salePrice'] > 0) ? $matchedProd['salePrice'] : ($matchedProd['price'] ?? 0);
        $extractedItems[] = [
            'name' => $matchedProd['name'],
            'nameUr' => $matchedProd['nameUr'] ?? $cleanName,
            'category' => $matchedProd['category'] ?? 'Grocery',
            'price' => $price > 0 ? $price : ($activePrice > 0 ? $activePrice : 150),
            'qty' => $qty,
            'unit' => $matchedProd['unit'] ?? $unit,
            'unitUr' => $matchedProd['unitUr'] ?? $unitUr,
            'productId' => $matchedProd['id'],
            'matched' => $isAvailable,
            'isCatalogMatch' => true,
            'isAvailable' => $isAvailable,
            'status' => $isAvailable ? 'Available' : 'Unavailable',
            'currencyCode' => $matchedProd['currencyCode'] ?? ($matchedProd['currency'] ?? 'PKR')
        ];
    } else {
        $extractedItems[] = [
            'name' => $cleanName,
            'nameUr' => $cleanName,
            'category' => 'Grocery',
            'price' => $price > 0 ? $price : 150,
            'qty' => $qty,
            'unit' => $unit,
            'unitUr' => $unitUr,
            'productId' => 'scanned_' . (count($extractedItems) + 1) . '_' . time(),
            'matched' => false,
            'isCatalogMatch' => false,
            'isAvailable' => false,
            'status' => 'Unavailable',
            'currencyCode' => 'PKR'
        ];
    }
    $seenKeys[$key] = true;
}

// Substring catalog match on extracted full text
$lowerOcr = strtolower($ocrText);
foreach ($catalogList as $p) {
    $pNameLower = strtolower(trim($p['name'] ?? ''));
    $pUrLower = strtolower(trim($p['nameUr'] ?? ''));

    $found = false;
    if (strlen($pNameLower) >= 3 && strpos($lowerOcr, $pNameLower) !== false) {
        $found = true;
    } elseif (strlen($pUrLower) >= 3 && strpos($lowerOcr, $pUrLower) !== false) {
        $found = true;
    }

    if ($found) {
        $key = $pNameLower;
        if (!isset($seenKeys[$key])) {
            $activePrice = (isset($p['salePrice']) && $p['salePrice'] > 0) ? $p['salePrice'] : ($p['price'] ?? 0);
            $extractedItems[] = [
                'name' => $p['name'],
                'nameUr' => $p['nameUr'] ?? $p['name'],
                'category' => $p['category'] ?? 'Grocery',
                'price' => $activePrice > 0 ? $activePrice : 150,
                'qty' => 1,
                'unit' => $p['unit'] ?? 'item',
                'unitUr' => $p['unitUr'] ?? 'عدد',
                'productId' => $p['id'],
                'matched' => true,
                'isCatalogMatch' => true,
                'isAvailable' => true,
                'status' => 'Available',
                'currencyCode' => $p['currencyCode'] ?? ($p['currency'] ?? 'PKR')
            ];
            $seenKeys[$key] = true;
        }
    }
}

echo json_encode($extractedItems);
