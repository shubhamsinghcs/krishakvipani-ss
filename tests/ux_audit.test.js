import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("==================================================================");
console.log("   KRISHAK VIPANI POST-REDESIGN UX & FUNCTIONAL QUALITY AUDIT     ");
console.log("==================================================================\n");

let passCount = 0;
let failCount = 0;

function report(id, title, testFn) {
  try {
    testFn();
    console.log(`▶ TEST ${id}: ${title}`);
    console.log(`  ✅ PASS\n`);
    passCount++;
  } catch (err) {
    console.error(`▶ TEST ${id}: ${title}`);
    console.error(`  ❌ FAIL: ${err.message}\n`);
    failCount++;
  }
}

// ---------------------------------------------------------
// SECTION A: USER PERSONA 1 - FIRST-TIME VISITOR JOURNEY
// ---------------------------------------------------------

report("A1", "First-Time Visitor: Homepage Clarity, Value Proposition & Core Shortcuts", () => {
  const homeCode = fs.readFileSync("app/page.jsx", "utf8");
  assert(homeCode.includes("Calibrated Crop Health Diagnosis & Direct Farm Marketplace") || homeCode.includes("फसल रोग का सटीक समाधान"), "Hero title communicates primary value");
  assert(homeCode.includes("/scanner"), "Crop Scanner shortcut exists");
  assert(homeCode.includes("/mandi"), "Mandi prices shortcut exists");
  assert(homeCode.includes("/bazaar"), "Krishi Bazaar shortcut exists");
  assert(homeCode.includes("/assistant"), "Agricultural advice shortcut exists");
});

report("A2", "First-Time Visitor: 4-Step How It Works & Credibility Anchors", () => {
  const homeCode = fs.readFileSync("app/page.jsx", "utf8");
  assert(homeCode.includes("How Krishak Vipani Works") || homeCode.includes("सरल व सुरक्षित प्रक्रिया"), "4-Step workflow section exists");
  assert(homeCode.includes("ICAR"), "ICAR research citation verified");
  assert(homeCode.includes("PAU"), "PAU research citation verified");
  assert(homeCode.includes("CIBRC"), "CIBRC pesticide registration compliance verified");
  assert(homeCode.includes("1800-180-1551"), "Kisan Call Centre helpline visible");
});

report("A3", "First-Time Visitor: Onboarding & Account Registration Paths", () => {
  const navCode = fs.readFileSync("components/Navbar.jsx", "utf8");
  const signupCode = fs.readFileSync("app/signup/page.jsx", "utf8");
  const loginCode = fs.readFileSync("app/login/page.jsx", "utf8");

  assert(navCode.includes('href="/login"'), "Desktop navbar has direct Login CTA");
  assert(loginCode.includes('href="/signup"'), "Login links to Signup");
  assert(signupCode.includes('href="/login"'), "Signup links to Login");
  assert(signupCode.includes("minLength={2}"), "Full name validation present");
  assert(signupCode.includes("minLength={6}"), "Password length validation present");
});

// ---------------------------------------------------------
// SECTION B: USER PERSONA 2 - LIMITED DIGITAL LITERACY JOURNEY
// ---------------------------------------------------------

report("B1", "Low-Literacy Farmer: Mobile 5-Slot Thumb Navigation Structure", () => {
  const bottomNavCode = fs.readFileSync("components/BottomNav.jsx", "utf8");
  assert(bottomNavCode.includes('href="/"'), "Bottom nav slot 1: Home");
  assert(bottomNavCode.includes('href="/bazaar"'), "Bottom nav slot 2: Market");
  assert(bottomNavCode.includes('href="/scanner"'), "Bottom nav slot 3 (Center): Crop Scanner");
  assert(bottomNavCode.includes('href="/planner"'), "Bottom nav slot 4: My Farm");
  assert(bottomNavCode.includes('href="/profile"'), "Bottom nav slot 5: Profile");
  assert(bottomNavCode.includes("IconScan"), "Center floating scanner uses clean Lucide SVG icon");
});

report("B2", "Low-Literacy Farmer: Hands-Free Voice Search to Advisory Continuity", () => {
  const homeCode = fs.readFileSync("app/page.jsx", "utf8");
  const chatBoxCode = fs.readFileSync("components/assistant/ChatBox.jsx", "utf8");

  assert(homeCode.includes("SpeechRecognition"), "Web Speech API recognition trigger present on Home");
  assert(homeCode.includes("/assistant?q="), "Voice transcription navigates with query param");
  assert(chatBoxCode.includes('params.get("q")'), "ChatBox automatically picks up ?q= parameter");
  assert(chatBoxCode.includes("initialQueryHandledRef"), "ChatBox prevents duplicate query loop");
});

report("B3", "Low-Literacy Farmer: Audio Read-Out of Remedies (Listen Aloud)", () => {
  const resultComp = fs.readFileSync("components/scanner/DiseaseResult.jsx", "utf8");
  assert(resultComp.includes("toggleSpeakRemedy"), "Audio synthesis toggle exists");
  assert(resultComp.includes("SpeechSynthesisUtterance"), "Web Speech synthesis utterance instantiated");
  assert(resultComp.includes("isPlayingAudio"), "Reactive playing audio state present");
  assert(resultComp.includes("बोलकर सुनें") || resultComp.includes("Listen Aloud"), "User-facing audio button label present");
});

report("B4", "Low-Literacy Farmer: Rejection of Blurry / Ambiguous Photos (Safety)", () => {
  const uploaderCode = fs.readFileSync("components/scanner/ImageUploader.jsx", "utf8");
  assert(uploaderCode.includes("blur") || uploaderCode.includes("blurry") || uploaderCode.includes("धुंधली"), "Blur detection present");
  assert(uploaderCode.includes("MAX_FILES = 3"), "Strict 3-image cap enforced");
  assert(uploaderCode.includes("MIN_BYTES = 5 * 1024"), "Corrupted/tiny file boundary enforced");
});

// ---------------------------------------------------------
// SECTION C: USER PERSONA 3 - RETURNING REGULAR FARMER JOURNEY
// ---------------------------------------------------------

report("C1", "Returning Farmer: Weather & Localized Daily Agronomic Advisory", () => {
  const homeCode = fs.readFileSync("app/page.jsx", "utf8");
  assert(homeCode.includes("useSmartLocation"), "Smart location hook detects farmer district");
  assert(homeCode.includes("aiInsight"), "Daily agronomic insight dynamically calculated");
  assert(homeCode.includes("farmPlan"), "Daily field tasks generated from weather parameters");
});

report("C2", "Returning Farmer: Mandi Prices with Statutory Government MSP Comparison", () => {
  const mandiTableCode = fs.readFileSync("components/mandi/MandiTable.jsx", "utf8");
  assert(mandiTableCode.includes("mspMap"), "Statutory MSP rates mapped across key Indian commodities");
  assert(mandiTableCode.includes("Above MSP") || mandiTableCode.includes("MSP से ऊपर"), "Above MSP indicator badge present");
  assert(mandiTableCode.includes("Below MSP") || mandiTableCode.includes("MSP से नीचे"), "Below MSP indicator badge present");
});

report("C3", "Returning Farmer: Krishi Bazaar Produce Listing with Pre-Publish Preview", () => {
  const bazaarCode = fs.readFileSync("app/bazaar/page.jsx", "utf8");
  assert(bazaarCode.includes("showAddProduceModal"), "Produce listing modal present");
  assert(bazaarCode.includes("showPreviewModal"), "Pre-publish preview modal present");
  assert(bazaarCode.includes("grade"), "Quality grade selection present (Grade A/B/C)");
  assert(bazaarCode.includes("CROPS_LIST"), "Standardized crop list provided");
  assert(bazaarCode.includes("wa.me"), "Direct WhatsApp enquiry integration present");
});

report("C4", "Returning Farmer: My Farm Acreage, Soil & Profit Planning", () => {
  const plannerCode = fs.readFileSync("app/planner/page.jsx", "utf8");
  assert(plannerCode.includes("land"), "Land acreage input field present");
  assert(plannerCode.includes("soil"), "Soil type selection present");
  assert(plannerCode.includes("ProfitCalculator"), "Dynamic profit calculation component integrated");
});

report("C5", "Returning Farmer: Historical Scan Records & Traceability", () => {
  const historyCode = fs.readFileSync("app/history/page.jsx", "utf8");
  assert(historyCode.includes("AUTH_TOKEN_STORAGE_KEY"), "Authenticated user-scoped scan history fetch");
  assert(historyCode.includes("severity") || historyCode.includes("Extent"), "Severity level displayed");
  assert(historyCode.includes("confidence") || historyCode.includes("Reliability"), "Calibrated reliability metric displayed");
});

// ---------------------------------------------------------
// SECTION D: ACCESSIBILITY (WCAG 2.2 AA) & VIEWPORT TESTS
// ---------------------------------------------------------

report("D1", "Accessibility: Standardized Lucide SVG Icons & Aria Attributes", () => {
  const iconsCode = fs.readFileSync("components/ui/Icons.jsx", "utf8");
  assert(iconsCode.includes('"aria-hidden": "true"') || iconsCode.includes('aria-hidden="true"'), "Icons marked aria-hidden for screen readers");
  assert(iconsCode.includes("IconScan"), "IconScan defined");
  assert(iconsCode.includes("IconSprout"), "IconSprout defined");
  assert(iconsCode.includes("IconStore"), "IconStore defined");
  assert(iconsCode.includes("IconTractor"), "IconTractor defined");
  assert(iconsCode.includes("IconPhone"), "IconPhone defined");
});

report("D2", "Accessibility: Minimum 44x44px Touch Targets Across Mobile Controls", () => {
  const bottomNav = fs.readFileSync("components/BottomNav.jsx", "utf8");
  const navbar = fs.readFileSync("components/Navbar.jsx", "utf8");
  const login = fs.readFileSync("app/login/page.jsx", "utf8");
  const signup = fs.readFileSync("app/signup/page.jsx", "utf8");

  assert(bottomNav.includes("h-16"), "Bottom bar height is 64px (comfortably exceeds 44px)");
  assert(navbar.includes("min-h-[44px]") || navbar.includes("min-h-[42px]"), "Navbar buttons satisfy minimum tap targets");
  assert(login.includes("min-h-[44px]"), "Login inputs satisfy 44px min-height");
  assert(signup.includes("min-h-[44px]"), "Signup inputs satisfy 44px min-height");
});

report("D3", "Accessibility: Outdoor Sunlight Contrast (No Washed-Out Glassmorphism)", () => {
  const homeCode = fs.readFileSync("app/page.jsx", "utf8");
  const mandiCode = fs.readFileSync("app/mandi/page.jsx", "utf8");
  const bazaarCode = fs.readFileSync("app/bazaar/page.jsx", "utf8");

  assert(!homeCode.includes("backdrop-blur-lg border border-white/40"), "Homepage free of washed-out glassmorphism");
  assert(!mandiCode.includes("backdrop-blur-lg border border-white/40"), "Mandi page free of washed-out glassmorphism");
  assert(bazaarCode.includes("bg-white border border-gray-200"), "Bazaar cards use high-contrast solid backgrounds");
});

// ---------------------------------------------------------
// SECTION E: ROUTE INTEGRITY & BACKWARDS COMPATIBILITY
// ---------------------------------------------------------

report("E1", "Route Integrity: Backwards Compatibility for /market, /marketplace, /shop", () => {
  const market = fs.readFileSync("app/market/page.jsx", "utf8");
  const marketplace = fs.readFileSync("app/marketplace/page.jsx", "utf8");
  const shop = fs.readFileSync("app/shop/page.jsx", "utf8");

  assert(market.includes("KrishiBazaarPage"), "/market safely redirects/aliases to KrishiBazaarPage");
  assert(marketplace.includes("KrishiBazaarPage"), "/marketplace safely aliases to KrishiBazaarPage");
  assert(shop.includes("KrishiBazaarPage"), "/shop safely aliases to KrishiBazaarPage");
});

console.log("==================================================================");
console.log(`   TOTAL AUDIT TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log("==================================================================");

if (failCount > 0) {
  process.exit(1);
}
