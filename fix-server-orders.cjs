const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    const userOrders = db.orders.filter(o => 
      o.userId === userId || 
      (user && user.email && o.userEmail && String(o.userEmail).toLowerCase() === String(user.email).toLowerCase()) ||
      (!o.userId || o.userId === "guest" || o.userId.startsWith("guest") || !userId || userId === "null" || userId === "undefined" || userId.startsWith("guest"))
    );`;

const replacement = `    const userOrders = db.orders.filter(o => 
      o.userId === userId || 
      (user && user.email && o.userEmail && String(o.userEmail).toLowerCase() === String(user.email).toLowerCase())
    );`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed userOrders filter");
} else {
    // Try without strict whitespace
    console.log("Could not find exact string for userOrders");
}
