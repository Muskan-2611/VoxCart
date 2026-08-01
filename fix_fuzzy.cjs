const fs = require("fs");
const path = require("path");

const serverPath = path.join(__dirname, "server.ts");
let code = fs.readFileSync(serverPath, "utf8");

if (!code.includes("function matchProductFuzzy(")) {
  const fuzzyCode = `
function matchProductFuzzy(nameEn: string, nameUr: string, activeProducts: any[]) {
  if (!activeProducts || activeProducts.length === 0) return null;
  const nEn = (nameEn || "").toLowerCase().trim();
  const nUr = (nameUr || "").toLowerCase().trim();

  for (const p of activeProducts) {
    const pEn = (p.name || "").toLowerCase().trim();
    const pUr = (p.nameUr || "").toLowerCase().trim();

    if ((nEn && pEn.includes(nEn)) || (nEn && nEn.includes(pEn)) || (nUr && pUr && pUr.includes(nUr))) {
      return p;
    }
  }

  const tokens = nEn.split(/\\s+/).filter(t => t.length > 2);
  for (const t of tokens) {
    for (const p of activeProducts) {
      const pEn = (p.name || "").toLowerCase().trim();
      if (pEn.includes(t)) {
        return p;
      }
    }
  }

  return null;
}
`;
  code = fuzzyCode + "\n" + code;
  fs.writeFileSync(serverPath, code, "utf8");
  console.log("Successfully added matchProductFuzzy function to server.ts!");
}
