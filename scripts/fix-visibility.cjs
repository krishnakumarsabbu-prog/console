const fs = require('fs');
const path = require('path');

const fixes = [
  {
    pattern: /className="(.*?)bg-white(.*?)text-white(.*?)"/g,
    replacement: (match, before, middle, after) => {
      return `className="${before}bg-white${middle}text-gray-900${after}"`;
    },
    description: 'Fix white text on white background'
  },
  {
    pattern: /className="(.*?)text-transparent(.*?)"/g,
    replacement: (match, before, after) => {
      return `className="${before}text-gray-700${after}"`;
    },
    description: 'Fix transparent text'
  },
  {
    pattern: /opacity-0(?!\d)/g,
    replacement: 'opacity-100',
    description: 'Fix invisible elements with opacity-0'
  },
  {
    pattern: /text-gray-50(?!\d)/g,
    replacement: 'text-gray-700',
    description: 'Fix very light text that is hard to see'
  },
  {
    pattern: /border-transparent/g,
    replacement: 'border-gray-200',
    description: 'Fix transparent borders on buttons'
  },
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const appliedFixes = [];

    fixes.forEach(({ pattern, replacement, description }) => {
      if (pattern.test(content)) {
        if (typeof replacement === 'function') {
          content = content.replace(pattern, replacement);
        } else {
          content = content.replace(pattern, replacement);
        }
        modified = true;
        appliedFixes.push(description);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      const relativePath = filePath.replace(process.cwd() + '/app/', '');
      console.log(`Updated: ${relativePath}`);
      appliedFixes.forEach(fix => console.log(`  - ${fix}`));
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

console.log(`\nVisibility fix complete!`);
console.log(`Files modified: ${modifiedCount}`);
