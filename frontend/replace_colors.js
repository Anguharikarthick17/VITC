const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'src');

const replaceInFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace cyan literals in Tailwind classes
    content = content.replace(/cyan-/g, 'amber-');

    // Replace rgb values in CSS
    // cyan-500: 6, 182, 212 -> amber-500: 245, 158, 11
    content = content.replace(/6,\s*182,\s*212/g, '245, 158, 11');
    
    // cyan-400: 34, 211, 238 -> amber-400: 251, 191, 36
    content = content.replace(/34,\s*211,\s*238/g, '251, 191, 36');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
};

const walkSync = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkSync(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.css') || fullPath.endsWith('.ts')) {
            replaceInFile(fullPath);
        }
    }
};

walkSync(dir);
console.log('Done replacement');
