import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "..", "dist");
const budgetPath = resolve(__dirname, "..", "lighthouse-budget.json");

const budget = JSON.parse(readFileSync(budgetPath, "utf-8"));
const resources = budget["resource-summary"] ?? [];
const errors = [];
const sizes = {};

function walkDir(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full);
    } else {
      const ext = entry.name.split(".").pop() ?? "";
      const sizeKB = statSync(full).size / 1024;
      sizes[ext] = (sizes[ext] ?? 0) + sizeKB;
      sizes["total"] = (sizes["total"] ?? 0) + sizeKB;
    }
  }
}

function extToResourceType(ext) {
  if (["js", "mjs", "cjs"].includes(ext)) return "script";
  if (["css"].includes(ext)) return "stylesheet";
  if (["html"].includes(ext)) return "document";
  if (["svg", "png", "jpg", "gif", "webp", "ico"].includes(ext)) return "image";
  if (["woff", "woff2", "ttf", "eot"].includes(ext)) return "font";
  return ext;
}

try {
  walkDir(distDir);
} catch {
  errors.push(`dist directory not found at ${distDir}. Run 'npm run build' first.`);
  console.error("❌ Performance budget failed:");
  for (const err of errors) console.error(`  ${err}`);
  process.exit(1);
}

const totals = {};
for (const [ext, size] of Object.entries(sizes)) {
  if (ext === "total") continue;
  const type = extToResourceType(ext);
  totals[type] = (totals[type] ?? 0) + size;
}
totals["total"] = sizes["total"] ?? 0;

for (const rule of resources) {
  const actual = totals[rule.resourceType] ?? 0;
  if (actual > rule.maxSize) {
    errors.push(
      `${rule.resourceType}: ${actual.toFixed(2)} kB exceeds budget of ${rule.maxSize} kB`
    );
  }
}

if (errors.length > 0) {
  console.error("❌ Performance budget failed:");
  for (const err of errors) console.error(`  ${err}`);
  process.exit(1);
} else {
  console.log("✅ Performance budget passed");
  for (const rule of resources) {
    const actual = totals[rule.resourceType] ?? 0;
    console.log(`  ${rule.resourceType}: ${actual.toFixed(2)} kB / ${rule.maxSize} kB`);
  }
}