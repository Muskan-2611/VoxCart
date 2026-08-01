const fs = require('fs');
let code = fs.readFileSync('backend-php-mysql/api.php', 'utf8');

const target = `        if ($httpCode !== 200) {
            http_response_code($httpCode ?: 500);
            error_log("Gemini API call failed with code $httpCode: $response");
            echo json_encode([
                "error" => "Gemini API call failed",
                "details" => $response,
                "http_code" => $httpCode
            ]);
            break;
        }`;

const replacement = `        if ($httpCode !== 200) {
            http_response_code($httpCode ?: 500);
            $errorMessage = "Gemini API call failed";
            if ($httpCode === 429) {
                $errorMessage = "API Quota Exceeded. Please check your billing or use a different API key.";
            }
            error_log("Gemini API call failed with code $httpCode: $response");
            echo json_encode([
                "error" => $errorMessage,
                "details" => $response,
                "http_code" => $httpCode
            ]);
            break;
        }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('backend-php-mysql/api.php', code);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
