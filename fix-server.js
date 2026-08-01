const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    if (userOrders.length === 0 && db.orders.length > 0) {
      return res.json(db.orders);
    }`;

code = code.replace(target, `    // Removed bug that returns all orders to users with no orders`);
fs.writeFileSync('server.ts', code);
