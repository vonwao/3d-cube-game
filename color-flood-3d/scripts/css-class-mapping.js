#!/usr/bin/env node

/**
 * CSS Class Mapping Helper
 * 
 * This script helps identify all CSS class names that need to be updated
 * when migrating from global CSS to CSS Modules.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to convert kebab-case to camelCase
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Extract class names from CSS file
function extractClassNames(cssContent) {
  const classRegex = /\.([a-zA-Z0-9_-]+)(?:\s*{|:)/g;
  const classes = new Set();
  let match;
  
  while ((match = classRegex.exec(cssContent)) !== null) {
    classes.add(match[1]);
  }
  
  return Array.from(classes);
}

// Generate mapping object
function generateMapping(classNames) {
  const mapping = {};
  classNames.forEach(className => {
    mapping[className] = toCamelCase(className);
  });
  return mapping;
}

// Main function
function processCSS(cssFilePath) {
  const cssContent = fs.readFileSync(cssFilePath, 'utf8');
  const classNames = extractClassNames(cssContent);
  const mapping = generateMapping(classNames);
  
  console.log(`\n=== CSS Class Mapping for ${path.basename(cssFilePath)} ===\n`);
  console.log('Old Class Name -> New Module Class Name');
  console.log('----------------------------------------');
  
  Object.entries(mapping).forEach(([oldName, newName]) => {
    console.log(`${oldName} -> styles.${newName}`);
  });
  
  console.log(`\nTotal classes: ${classNames.length}`);
  
  // Generate example replacements
  console.log('\n=== Example Replacements ===\n');
  console.log('// Single class');
  console.log(`className="color-flood-game" -> className={styles.colorFloodGame}`);
  console.log('\n// Multiple classes');
  console.log(`className="control-button active" -> className={\`\${styles.controlButton} \${styles.active}\`}`);
  console.log('\n// Conditional classes');
  console.log(`className={\`star \${filled ? 'filled' : 'empty'}\`} -> className={\`\${styles.star} \${filled ? styles.filled : styles.empty}\`}`);
}

// Process both CSS files
const colorFloodCSS = path.join(__dirname, '../src/games/color-flood/ColorFloodGame.css');
const colorCompetitionCSS = path.join(__dirname, '../src/games/color-competition/ColorCompetitionGame.css');

if (fs.existsSync(colorFloodCSS)) {
  processCSS(colorFloodCSS);
}

if (fs.existsSync(colorCompetitionCSS)) {
  processCSS(colorCompetitionCSS);
}