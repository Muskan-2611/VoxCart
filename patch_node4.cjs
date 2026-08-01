const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      console.log(\`Bilingual Gemini 3.5 Flash OCR successfully processed! Extracted \${formattedProducts.length} items.\`);
      res.json(formattedProducts);`;

const replacement = `      const seenNames = new Set();
      const finalProducts = formattedProducts.filter(item => {
        const key = item.name.toLowerCase().trim();
        if (seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      });
      console.log(\`Bilingual Gemini 3.5 Flash OCR successfully processed! Extracted \${finalProducts.length} items.\`);
      res.json(finalProducts);`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server.ts successfully");
} else {
    console.log("Target not found");
}
