const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /purple-50/g, to: 'gray-50' },
  { from: /purple-100/g, to: 'gray-100' },
  { from: /purple-200/g, to: 'gray-200' },
  { from: /purple-300/g, to: 'gray-300' },
  { from: /purple-400/g, to: 'primary-400' },
  { from: /purple-500/g, to: 'primary-600' },
  { from: /purple-600/g, to: 'primary-700' },
  { from: /purple-700/g, to: 'primary-800' },
  { from: /purple-800/g, to: 'primary-900' },
  { from: /purple-900/g, to: 'gray-900' },
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

console.log(`\nPurple theme fix complete!`);
console.log(`Files modified: ${modifiedCount}`);
