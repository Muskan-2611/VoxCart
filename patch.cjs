const fs = require('fs');
let code = fs.readFileSync('src/components/VoiceAssistant.jsx', 'utf8');

const target = `        // Step 2: Handle duplicate entries inside the scanned bill (grouping them)
        const groupedItems = {};
        for (const rawItem of filteredResult) {
          const nameKey = rawItem.name.toLowerCase().trim();
          if (groupedItems[nameKey]) {
            groupedItems[nameKey].qty += (typeof rawItem.qty === 'number' && rawItem.qty > 0) ? rawItem.qty : 1;
            if (rawItem.price && rawItem.price > groupedItems[nameKey].price) {
              groupedItems[nameKey].price = rawItem.price;
            }
          } else {
            groupedItems[nameKey] = {
              name: rawItem.name || "Custom Scanned Item",
              nameUr: rawItem.nameUr || rawItem.name || "سکین شدہ چیز",
              price: typeof rawItem.price === "number" ? rawItem.price : 1.99,
              qty: typeof rawItem.qty === "number" && rawItem.qty > 0 ? rawItem.qty : 1,
              category: rawItem.category || "Pantry",
              unit: rawItem.unit || "item",
              unitUr: rawItem.unitUr || "عدد"
            };
          }
        }
        const formatted = Object.values(groupedItems);`;

const replacement = `        // Step 2: Use items directly without merging duplicates to respect original receipt quantities
        const formatted = filteredResult.map(rawItem => ({
          name: rawItem.name || "Custom Scanned Item",
          nameUr: rawItem.nameUr || rawItem.name || "سکین شدہ چیز",
          price: typeof rawItem.price === "number" ? rawItem.price : 1.99,
          qty: typeof rawItem.qty === "number" && rawItem.qty > 0 ? rawItem.qty : 1,
          category: rawItem.category || "Pantry",
          unit: rawItem.unit || "item",
          unitUr: rawItem.unitUr || "عدد"
        }));`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/VoiceAssistant.jsx', code);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
