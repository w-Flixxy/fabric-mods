/**
 * Scans /mods for .jar files and generates mods.json
 * Run this before deploying to GitHub Pages.
 */

const fs = require("fs");
const path = require("path");

const MODS_DIR = path.join(__dirname, "..", "mods");
const OUTPUT_FILE = path.join(__dirname, "..", "mods.json");

const files = fs.readdirSync(MODS_DIR);

const mods = files
  .filter(f => f.toLowerCase().endsWith(".jar"))
  .sort()
  .map(filename => ({
    name: filename,
    url: `mods/${filename}`
  }));

fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify(mods, null, 2),
  "utf8"
);

console.log(`Generated mods.json with ${mods.length} mods`);
