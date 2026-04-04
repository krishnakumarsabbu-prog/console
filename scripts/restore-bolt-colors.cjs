const fs = require('fs');
const path = require('path');

const replacements = [
  // Revert grey color references back to proper variants
  { from: /gray-50(?!\d)/g, to: 'gray-50' }, // keep this
  { from: /text-gray-50(?!\d)/g, to: 'text-gray-400' },
  { from: /hover:text-gray-/g, to: 'hover:text-accent-' },
  { from: /group-hover:text-gray-/g, to: 'group-hover:text-accent-' },
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Skip if file contains only comments or is empty
    if (!content.trim() || content.trim().startsWith('//')) {
      return 0;
    }

    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath.replace(process.cwd() + '/', '')}`);
      return 1;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
  return 0;
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath, fileList);
    } else if (filePath.match(/\.(tsx?|jsx?)$/)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const appDir = path.join(process.cwd(), 'app/components');
const files = walkDir(appDir);

let modifiedCount = 0;
files.forEach(file => {
  modifiedCount += processFile(file);
});

console.log(`\nBolt color restoration complete!`);
console.log(`Files modified: ${modifiedCount}`);
