const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /text-accent-500/g, to: 'text-primary-700' },
  { from: /bg-accent-500/g, to: 'bg-primary-700' },
  { from: /bg-accent-600/g, to: 'bg-primary-800' },
  { from: /border-accent-500/g, to: 'border-primary-700' },
  { from: /text-accent(?!\-)/g, to: 'text-primary-700' },
  { from: /bg-accent(?!\-)/g, to: 'bg-primary-700' },
  { from: /border-accent(?!\-)/g, to: 'border-primary-700' },
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath.replace(process.cwd() + '/app/', '')}`);
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

const appDir = path.join(process.cwd(), 'app');
const files = walkDir(appDir);

let modifiedCount = 0;
files.forEach(file => {
  modifiedCount += processFile(file);
});

console.log(`\nAccent reference fix complete!`);
console.log(`Files modified: ${modifiedCount}`);
