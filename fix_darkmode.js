const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, callback);
    else callback(p);
  });
}

const replacements = [
  { search: /\bbg-white\b/g, replace: 'bg-white dark:bg-slate-800' },
  { search: /\btext-slate-800\b/g, replace: 'text-slate-800 dark:text-slate-100' },
  { search: /\btext-slate-700\b/g, replace: 'text-slate-700 dark:text-slate-200' },
  { search: /\btext-slate-600\b/g, replace: 'text-slate-600 dark:text-slate-300' },
  { search: /\bbg-slate-50\b/g, replace: 'bg-slate-50 dark:bg-slate-900' },
  { search: /\bborder-slate-100\b/g, replace: 'border-slate-100 dark:border-slate-700' },
  { search: /\bborder-slate-200\b/g, replace: 'border-slate-200 dark:border-slate-700' },
  { search: /\bbg-slate-100\b/g, replace: 'bg-slate-100 dark:bg-slate-800' },
  { search: /\bbg-slate-200\b/g, replace: 'bg-slate-200 dark:bg-slate-700' },
];

walk('app/src', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Avoid double replacements if script is run twice
    if (!content.includes('dark:bg-slate-800') || filePath.includes('Accueil.jsx')) {
      let newContent = content;
      replacements.forEach(r => {
        // Only replace if not already followed by dark:
        newContent = newContent.replace(r.search, (match, offset, string) => {
          const nextChars = string.substring(offset + match.length, offset + match.length + 5);
          if (nextChars.includes('dark:')) return match;
          return r.replace;
        });
      });
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated ${filePath}`);
      }
    }
  }
});
