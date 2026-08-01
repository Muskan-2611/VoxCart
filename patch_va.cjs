const fs = require('fs');
let code = fs.readFileSync('src/components/VoiceAssistant.jsx', 'utf8');

const target = `    } catch (err) {
      console.error("AI Bill scan err:", err);
      const msg = isUr ? "رسید پروسیس کرنے میں ناکامی" : "Failed to process receipt.";
      setScannerError(msg);
      onNotify(msg, "error");
      addLog(isUr ? "رسید اسکین کرنے میں دشواری پیش آئی۔" : "Could not scan the receipt.");
    } finally {`;

const replacement = `    } catch (err) {
      console.error("AI Bill scan err:", err);
      // Clean up the error message
      let errorMsg = err.message || (isUr ? "رسید پروسیس کرنے میں ناکامی" : "Failed to process receipt.");
      if (errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = "API Quota Exceeded. Please configure a valid API key in Settings or try again later.";
      } else if (errorMsg.length > 100) {
        errorMsg = isUr ? "رسید پروسیس کرنے میں ناکامی" : "Failed to process receipt.";
      }
      setScannerError(errorMsg);
      onNotify(errorMsg, "error");
      addLog(errorMsg);
    } finally {`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/VoiceAssistant.jsx', code);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
