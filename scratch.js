import fs from 'fs';
import path from 'path';

// Task 2: Migrate app/market/page.jsx -> app/shop/page.jsx
const marketPath = 'd:\\OneDrive\\Desktop\\Krishakvipani\\krishi-bazar\\app\\market\\page.jsx';
const shopDir = 'd:\\OneDrive\\Desktop\\Krishakvipani\\krishi-bazar\\app\\shop';
const shopPath = path.join(shopDir, 'page.jsx');

if (!fs.existsSync(shopDir)) {
  fs.mkdirSync(shopDir, { recursive: true });
}

if (fs.existsSync(marketPath)) {
  const content = fs.readFileSync(marketPath, 'utf8');
  fs.writeFileSync(shopPath, content);
}
