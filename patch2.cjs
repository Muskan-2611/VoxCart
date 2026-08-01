const fs = require('fs');
let code = fs.readFileSync('src/utils/api.js', 'utf8');

const target = `const BACKEND_TYPE = "node";`;
const replacement = `const BACKEND_TYPE = "php";`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/utils/api.js', code);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
