const fs = require('fs');
const files = [
  'src/routes/dashboard/login.tsx',
  'src/routes/dashboard/create-organizer.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Backgrounds
  content = content.replace(/bg-\[\#0a0a0a\]/g, 'bg-white dark:bg-[#0a0a0a]');
  content = content.replace(/bg-\[\#111\]/g, 'bg-gray-50 dark:bg-[#111]');
  content = content.replace(/bg-white\/5(?!0)/g, 'bg-gray-100 dark:bg-white/5');
  content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-gray-50 dark:bg-white/[0.03]');
  content = content.replace(/bg-\[\#ffffff05\]/g, 'bg-gray-50 dark:bg-[#ffffff05]');
  content = content.replace(/bg-white\/10/g, 'bg-gray-200 dark:bg-white/10');
  
  // Hover Backgrounds
  content = content.replace(/hover:bg-white\/10/g, 'hover:bg-gray-200 dark:hover:bg-white/10');

  // Borders
  content = content.replace(/border-white\/10/g, 'border-gray-200 dark:border-white/10');
  content = content.replace(/border-white\/20/g, 'border-gray-300 dark:border-white/20');

  // Text Colors
  // Do a generic text-white replacement for the main text, but need to be careful with gradients/buttons where text is always white.
  // Actually, we can just replace text-white with text-gray-900 dark:text-white EXCEPT when it's inside a primary button where it should stay white.
  // Let's replace specific text-white/XX opacity variations first.
  content = content.replace(/text-white\/80/g, 'text-gray-700 dark:text-white/80');
  content = content.replace(/text-white\/70/g, 'text-gray-600 dark:text-white/70');
  content = content.replace(/text-white\/60/g, 'text-gray-600 dark:text-white/60');
  content = content.replace(/text-white\/50/g, 'text-gray-500 dark:text-white/50');
  content = content.replace(/text-white\/40/g, 'text-gray-500 dark:text-white/40');
  content = content.replace(/text-white\/30/g, 'text-gray-400 dark:text-white/30');
  content = content.replace(/placeholder-white\/30/g, 'placeholder-gray-400 dark:placeholder-white/30');
  
  // Replace text-white that is NOT part of another string.
  // We want to skip text-white if it's already preceded by dark: or if it's part of a button that requires white text.
  // For safety, I'll use a regex that matches `text-white` not preceded by `dark:` or `text-`.
  // Better yet, just find instances of `text-white` and change them to `text-gray-900 dark:text-white`.
  // Wait, buttons with bg-primary should stay text-white. 
  // Let's do it manually for text-white, it's safer.
  content = content.replace(/(?<!dark:|-)text-white(?![\/\w])/g, 'text-gray-900 dark:text-white');
  
  // Revert buttons that have text-gray-900 dark:text-white but use bg-primary to just text-white
  content = content.replace(/bg-primary text-gray-900 dark:text-white/g, 'bg-primary text-white');

  // Gradients
  content = content.replace(/from-\[\#0a0a0a\]/g, 'from-white dark:from-[#0a0a0a]');
  content = content.replace(/via-\[\#0a0a0a\]/g, 'via-white dark:via-[#0a0a0a]');
  
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Theme styles updated.');
