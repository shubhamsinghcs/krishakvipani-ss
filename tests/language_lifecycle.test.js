import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import i18n from "i18next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "..", "locales");

// Supported languages: only authentically implemented languages
const supportedLanguages = ["en", "hi", "pa"];

console.log("=== Language Lifecycle & Selector Simulation Test ===");

// Load resources
const resources = {};
for (const lang of supportedLanguages) {
  const content = fs.readFileSync(path.join(localesDir, `${lang}.json`), "utf-8");
  resources[lang] = { translation: JSON.parse(content) };
}

// Mock browser storage & cookie environment
const mockStorage = new Map();
const mockCookie = {
  raw: "",
  set(val) { this.raw = val; },
  get() { return this.raw; }
};
const mockDocument = {
  documentElement: { lang: "en" }
};

// Initialize i18next
await i18n.init({
  resources,
  fallbackLng: "en",
  supportedLngs: supportedLanguages,
  interpolation: { escapeValue: false },
});

function simulateChangeLanguage(newLang) {
  // If unsupported, fall back to "en"
  const target = supportedLanguages.includes(newLang) ? newLang : "en";
  i18n.changeLanguage(target);
  mockStorage.set("krishakvipani-lang", target);
  mockCookie.set(`krishakvipani_lang=${target}; path=/; max-age=31536000`);
  mockDocument.documentElement.lang = target;
}

// 1. Initial State (Default: en)
assert.equal(i18n.language, "en");
assert.equal(i18n.t("common.appName"), "KrishakVipani");
assert.equal(i18n.t("nav.dashboard"), "Dashboard");
console.log("  ✅ Test 1: Initial state is English");

// 2. Switch to Hindi
simulateChangeLanguage("hi");
assert.equal(i18n.language, "hi");
assert.equal(mockDocument.documentElement.lang, "hi");
assert.equal(mockStorage.get("krishakvipani-lang"), "hi");
assert.ok(mockCookie.get().includes("krishakvipani_lang=hi"));
assert.equal(i18n.t("common.appName"), "KrishakVipani");
assert.equal(i18n.t("nav.dashboard"), "डैशबोर्ड");
assert.equal(i18n.t("dashboard.greeting"), "नमस्ते, किसान भाई!");
assert.equal(i18n.t("mandi.priceMayRise"), "भाव बढ़ सकता है");
assert.equal(i18n.t("weather.hourlyAdvisory"), "घंटावार मौसम सलाह");
console.log("  ✅ Test 2: Hindi language switch and translations verified");

// 3. Switch to Punjabi
simulateChangeLanguage("pa");
assert.equal(i18n.language, "pa");
assert.equal(mockDocument.documentElement.lang, "pa");
assert.equal(mockStorage.get("krishakvipani-lang"), "pa");
assert.ok(mockCookie.get().includes("krishakvipani_lang=pa"));
assert.equal(i18n.t("nav.dashboard"), "ਡੈਸ਼ਬੋਰਡ");
assert.equal(i18n.t("dashboard.greeting"), "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਕਿਸਾਨ ਭਰਾ!");
assert.equal(i18n.t("mandi.priceMayRise"), "ਭਾਅ ਵਧ ਸਕਦਾ ਹੈ");
assert.equal(i18n.t("weather.hourlyAdvisory"), "ਘੰਟਾਵਾਰ ਮੌਸਮ ਸਲਾਹ");
console.log("  ✅ Test 3: Punjabi language switch and translations verified");

// 4. Switch back to English
simulateChangeLanguage("en");
assert.equal(i18n.language, "en");
assert.equal(mockDocument.documentElement.lang, "en");
assert.equal(mockStorage.get("krishakvipani-lang"), "en");
assert.equal(i18n.t("nav.dashboard"), "Dashboard");
assert.equal(i18n.t("dashboard.greeting"), "Hello, Farmer!");
assert.equal(i18n.t("mandi.priceMayRise"), "Price may rise");
assert.equal(i18n.t("weather.hourlyAdvisory"), "Hourly Advisory");
console.log("  ✅ Test 4: Restore English interface verified");

// 5. Simulate browser reload with persisted language
const savedLang = mockStorage.get("krishakvipani-lang");
assert.equal(savedLang, "en");
// Change to Hindi, simulate refresh:
simulateChangeLanguage("hi");
const reloadedLang = mockStorage.get("krishakvipani-lang");
assert.equal(reloadedLang, "hi");
// Client mounts and detects 'hi' from storage:
await i18n.changeLanguage(reloadedLang);
assert.equal(i18n.language, "hi");
assert.equal(i18n.t("nav.dashboard"), "डैशबोर्ड");
console.log("  ✅ Test 5: Storage persistence on reload verified");

// 6. Test unsupported or invalid language in storage/change request (graceful English fallback)
simulateChangeLanguage("bn"); // Bengali was removed
assert.equal(i18n.language, "en");
assert.equal(mockDocument.documentElement.lang, "en");
assert.equal(mockStorage.get("krishakvipani-lang"), "en");

simulateChangeLanguage("unknown_locale");
assert.equal(i18n.language, "en");
assert.equal(mockDocument.documentElement.lang, "en");
assert.equal(mockStorage.get("krishakvipani-lang"), "en");
console.log("  ✅ Test 6: Unsupported language rejection & fallback to English verified");

// 7. Test rapid language switching cycle between supported languages
const sequence = ["hi", "pa", "en", "pa", "hi", "en"];
for (const l of sequence) {
  simulateChangeLanguage(l);
  assert.equal(i18n.language, l);
  assert.ok(i18n.t("common.appName"));
}
console.log("  ✅ Test 7: Rapid multi-language switching cycle verified without errors");

console.log("=== All Lifecycle & Selector Tests Passed Successfully ===");
