import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import i18n from "i18next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "..", "locales");

// Supported languages: only authentically implemented languages
const supportedLanguages = ["en", "hi", "pa"];

console.log("--- Starting i18n & Translation Verification Tests ---");

// 1. Verify exactly the supported locale files exist and are valid JSON
const filesInLocales = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));
assert.deepEqual(
  filesInLocales.sort(),
  ["en.json", "hi.json", "pa.json"].sort(),
  `Only genuine supported locale files must exist in locales directory. Found: ${filesInLocales.join(", ")}`
);

const locales = {};
const resources = {};
for (const lang of supportedLanguages) {
  const filePath = path.join(localesDir, `${lang}.json`);
  assert.ok(fs.existsSync(filePath), `Locale file missing for ${lang}`);
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(content);
  assert.ok(typeof parsed === "object" && parsed !== null, `Parsed JSON invalid for ${lang}`);
  locales[lang] = parsed;
  resources[lang] = { translation: parsed };
  console.log(`  ✅ ${lang}.json loaded and valid (${Object.keys(parsed).length} namespaces)`);
}

// 2. Verify all core namespaces exist in all supported languages
const expectedNamespaces = [
  "common", "nav", "dashboard", "actions", "reminders", "notifications",
  "calculator", "credit", "yield", "marketplace", "transport", "driver",
  "expenses", "finance", "planner", "news", "services", "shop", "diary",
  "profile", "scanner", "weather", "footer"
];

for (const ns of expectedNamespaces) {
  assert.ok(locales.en[ns], `Missing namespace '${ns}' in en.json`);
  assert.ok(locales.hi[ns], `Missing namespace '${ns}' in hi.json`);
  assert.ok(locales.pa[ns], `Missing namespace '${ns}' in pa.json`);
}
console.log(`  ✅ All ${expectedNamespaces.length} required namespaces exist in en, hi, and pa`);

// 3. Verify key consistency and complete coverage between en and other languages
const enKeysByNs = {};
for (const ns of expectedNamespaces) {
  enKeysByNs[ns] = Object.keys(locales.en[ns]);
}

for (const lang of ["hi", "pa"]) {
  for (const ns of expectedNamespaces) {
    for (const key of enKeysByNs[ns]) {
      const val = locales[lang][ns]?.[key];
      assert.ok(val !== undefined && val !== null, `Missing key '${ns}.${key}' in ${lang}.json`);
    }
  }
}
console.log("  ✅ Full key parity between en, hi, and pa verified");

// 4. Verify authentic translation completeness (not just raw English copies)
function countTranslated(enNode, targetNode) {
  let translated = 0;
  let total = 0;
  for (const k in enNode) {
    if (typeof enNode[k] === "object" && enNode[k] !== null && !Array.isArray(enNode[k])) {
      if (targetNode?.[k]) {
        const sub = countTranslated(enNode[k], targetNode[k]);
        translated += sub.translated;
        total += sub.total;
      }
    } else {
      total++;
      if (targetNode?.[k] !== undefined && targetNode[k] !== enNode[k]) {
        translated++;
      }
    }
  }
  return { translated, total };
}

const hiCoverage = countTranslated(locales.en, locales.hi);
const paCoverage = countTranslated(locales.en, locales.pa);

assert.ok(
  hiCoverage.translated / hiCoverage.total > 0.95,
  `Hindi translation coverage must exceed 95%, got ${(hiCoverage.translated / hiCoverage.total) * 100}%`
);
assert.ok(
  paCoverage.translated / paCoverage.total > 0.95,
  `Punjabi translation coverage must exceed 95%, got ${(paCoverage.translated / paCoverage.total) * 100}%`
);
console.log(`  ✅ Genuine language coverage verified: Hindi ${(hiCoverage.translated / hiCoverage.total * 100).toFixed(1)}%, Punjabi ${(paCoverage.translated / paCoverage.total * 100).toFixed(1)}%`);

// 5. Verify i18next resolution and fallback behavior
await i18n.init({
  resources,
  fallbackLng: "en",
  supportedLngs: supportedLanguages,
  interpolation: { escapeValue: false },
});

assert.equal(i18n.t("common.appName", { lng: "en" }), "KrishakVipani");
assert.equal(i18n.t("common.search", { lng: "en" }), "Search");
assert.equal(i18n.t("common.search", { lng: "hi" }), "खोजें");
assert.equal(i18n.t("common.search", { lng: "pa" }), "ਖੋਜੋ");

assert.equal(i18n.t("dashboard.greeting", { lng: "en" }), "Hello, Farmer!");
assert.equal(i18n.t("dashboard.greeting", { lng: "hi" }), "नमस्ते, किसान भाई!");
assert.equal(i18n.t("dashboard.greeting", { lng: "pa" }), "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਕਿਸਾਨ ਭਰਾ!");

// Fallback to en when unsupported language (e.g. bn, gu, fr, invalid) is requested
assert.equal(i18n.t("common.search", { lng: "bn" }), "Search");
assert.equal(i18n.t("common.search", { lng: "fr" }), "Search");
assert.equal(i18n.t("common.search", { lng: "invalid_lang" }), "Search");

// Nonexistent key returns raw key
assert.equal(i18n.t("nonexistent.key.xyz", { lng: "en" }), "nonexistent.key.xyz");

console.log("  ✅ i18next resolution, language switching, and English fallback verified");
console.log("--- All i18n tests passed successfully! ---");
