const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    const iconPattern = /<div className="i-ph-([a-z-]+)(?:\s+([^"]+))?"\s*\/>/g;

    content = content.replace(iconPattern, (match, iconName, classes) => {
      modified = true;
      const cleanIconName = iconName.replace(/-duotone|-bold|-fill/, '');
      const sizeMatch = classes?.match(/w-(\d+)/);
      const size = sizeMatch ? parseInt(sizeMatch[1]) * 4 : 16;
      const otherClasses = classes?.replace(/w-\d+\s*h-\d+/, '').trim() || '';

      return `<PhosphorIcon name="${cleanIconName}" size={${size}} className="${otherClasses}" />`;
    });

    const spanIconPattern = /<div className="i-ph-([a-z-]+)(?:\s+([^"]+))?">\s*<\/div>/g;

    content = content.replace(spanIconPattern, (match, iconName, classes) => {
      modified = true;
      const cleanIconName = iconName.replace(/-duotone|-bold|-fill/, '');
      const sizeMatch = classes?.match(/w-(\d+)/);
      const size = sizeMatch ? parseInt(sizeMatch[1]) * 4 : 16;
      const otherClasses = classes?.replace(/w-\d+\s*h-\d+/, '').trim() || '';

      return `<PhosphorIcon name="${cleanIconName}" size={${size}} className="${otherClasses}" />`;
    });

    if (modified && !content.includes("import { PhosphorIcon }") && !content.includes("import {PhosphorIcon}")) {
      const importMatch = content.match(/^(import .+?;?\n)+/m);
      if (importMatch) {
        const lastImportEnd = importMatch[0].length;
        content = content.slice(0, lastImportEnd) +
                  "import { PhosphorIcon } from '~/components/ui/PhosphorIcon';\n" +
                  content.slice(lastImportEnd);
      }
    }

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

console.log(`\nOld icon format fix complete!`);
console.log(`Files modified: ${modifiedCount}`);
