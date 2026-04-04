const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /theme\('colors\.primary\./g, to: "theme('colors.accent." },
  { from: /theme\('colors\.alpha\.primary\./g, to: "theme('colors.alpha.accent." },
  { from: /text-primary-/g, to: 'text-accent-' },
  { from: /bg-primary-/g, to: 'bg-accent-' },
  { from: /border-primary-/g, to: 'border-accent-' },
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
    } else if (filePath.match(/\.(tsx?|jsx?|scss|css)$/)) {
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

console.log(`\nRevert to accent complete!`);
console.log(`Files modified: ${modifiedCount}`);
