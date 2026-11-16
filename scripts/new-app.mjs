#!/usr/bin/env node
// Usage: npm run new-app -- my-app-name
// Copies the template into apps/<name> and fills in the name.
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const name = process.argv[2];

if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error("Give the app a lowercase name, for example: npm run new-app -- ride-share");
  process.exit(1);
}

const target = join(root, "apps", name);
if (existsSync(target)) {
  console.error(`apps/${name} already exists.`);
  process.exit(1);
}

cpSync(join(root, "packages", "skeleton", "template"), target, { recursive: true });

function fill(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) fill(path);
    else if (/\.(json|html|ts|tsx)$/.test(entry)) {
      writeFileSync(path, readFileSync(path, "utf8").replaceAll("__NAME__", name));
    }
  }
}
fill(target);

console.log(`Created apps/${name}.`);
console.log("Next: run `npm install` once, then `npm run dev -w apps/" + name + "`.");
console.log("Edit apps/" + name + "/src/app.config.tsx to describe your app.");
