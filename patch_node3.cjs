const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `        return { name, nameUr, category, price, qty, unit, unitUr };
      });`;

const replacement = `        return { name, nameUr, category, price, qty, unit, unitUr };
      });

      // Deduplicate to ensure items are added exactly once
      const seenNames = new Set();
      const finalProducts = formattedProducts.filter(item => {
        const key = item.name.toLowerCase().trim();
        if (seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      });`;

const target2 = `      console.log(\`Successfully scanned OCR image. Compiled \${formattedProducts.length} items.\`);
      return res.json(formattedProducts);`;

const replacement2 = `      console.log(\`Successfully scanned OCR image. Compiled \${finalProducts.length} items.\`);
      return res.json(finalProducts);`;

if (code.includes(target) && code.includes(target2)) {
    code = code.replace(target, replacement);
    code = code.replace(target2, replacement2);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server.ts successfully");
} else {
    console.log("Target not found");
}
