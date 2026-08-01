const fs = require('fs');
fetch('http://localhost:3000/api/ocr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==', mimeType: 'image/png' })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
