const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      const formattedProducts = productsParsed.map((item: any) => {`;
const replacement = `      const seenNames = new Set();
      const formattedProducts = productsParsed.map((item: any) => {`;

const target2 = `        return {
          name,
          nameUr,
          category,
          price,
          qty,
          unit,
          unitUr
        };
      });

      console.log(\`Successfully scanned OCR image. Compiled \${formattedProducts.length} items.\`);
      return res.json(formattedProducts);`;

const replacement2 = `        return {
          name,
          nameUr,
          category,
          price,
          qty,
          unit,
          unitUr
        };
      }).filter((item) => {
        const key = item.name.toLowerCase().trim();
        if (seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      });

      console.log(\`Successfully scanned OCR image. Compiled \${formattedProducts.length} items.\`);
      return res.json(formattedProducts);`;

if (code.includes(target) && code.includes(target2)) {
    code = code.replace(target, replacement);
    code = code.replace(target2, replacement2);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server.ts successfully");
} else {
    console.log("Target not found");
}
