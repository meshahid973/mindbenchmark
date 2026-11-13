import { readFileSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";

const dist = new URL("../dist/", import.meta.url);
const html = readFileSync(new URL("index.html", dist), "utf8");
const entry = html.match(/<script\b[^>]*\bsrc="(\/assets\/[^"]+\.js)"/)?.[1];

if (!entry) {
  throw new Error("Could not find the initial JavaScript bundle.");
}

function gzipKiB(file) {
  return gzipSync(readFileSync(file)).byteLength / 1024;
}

const entryKiB = gzipKiB(new URL(entry.slice(1), dist));
const stylesKiB = readdirSync(new URL("assets/", dist))
  .filter((file) => file.endsWith(".css"))
  .reduce((total, file) => total + gzipKiB(new URL(`assets/${file}`, dist)), 0);

console.log(`Initial JS: ${entryKiB.toFixed(1)} KiB gzip (limit: 110 KiB)`);
console.log(`All CSS: ${stylesKiB.toFixed(1)} KiB gzip (limit: 12 KiB)`);

if (entryKiB > 110 || stylesKiB > 12) {
  throw new Error("Build exceeds the frontend performance budget.");
}
