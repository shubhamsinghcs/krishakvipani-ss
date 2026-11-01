"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";
import { useSmartLocation } from "@/lib/hooks/useSmartLocation";
import ActionEngine from "@/components/ActionEngine";
import {
  IconScan,
  IconStore,
  IconTrendingUp,
  IconSprout,
  IconTractor,
  IconCloud,
  IconSun,
  IconMapPin,
  IconShieldCheck,
  IconPhone,
  IconMic,
  IconCheckCircle,
  IconChevronDown,
  IconArrowRight,
  IconHelpCircle,
  IconBookOpen,
} from "@/components/ui/Icons";

export default function HomePage() {
  const router = useRouter();
  const { lang, t } = useLang();
  const { district, loading: locLoading } = useSmartLocation();

  const [weather, setWeather] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const userName = "Kisan";

  // Native Web Speech Recognition for Voice Search
  const startVoiceSearch = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      router.push("/assistant");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "hi" ? "hi-IN" : lang === "pa" ? "pa-IN" : "en-IN";
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          router.push(`/assistant?q=${encodeURIComponent(transcript)}`);
        }
      };

      recognition.start();
    } catch {
      router.push("/assistant");
    }
  };

  useEffect(() => {
    if (locLoading) return;
    const ac = new AbortController();

    const loadWeather = async () => {
      try {
        const wRes = await fetch(`/api/weather?city=${district}`, { signal: ac.signal });
        const wJson = await wRes.json();
        setWeather(wJson);
      } catch (e) {
        if (!ac.signal.aborted) setWeather(null);
      } finally {
        if (!ac.signal.aborted) setLoadingWeather(false);
      }
    };

    const loadPrices = async () => {
      try {
        const pRes = await fetch(
          `/api/prices?crop=Wheat&district=${encodeURIComponent(district)}`,
          { signal: ac.signal }
        );
        const pJson = await pRes.json();
        if (pJson.success && Array.isArray(pJson.data)) {
          setPrices(pJson.data.slice(0, 3));
        }
      } catch (e) {
        if (!ac.signal.aborted) setPrices([]);
      } finally {
        if (!ac.signal.aborted) setLoadingPrices(false);
      }
    };

    loadWeather();
    loadPrices();

    return () => ac.abort();
  }, [district, locLoading]);

  const dateText = useMemo(() => {
    try {
      return new Date().toLocaleDateString(
        lang === "en" ? "en-IN" : `${lang}-IN`,
        { weekday: "short", day: "numeric", month: "short", year: "numeric" }
      );
    } catch {
      return new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }, [lang]);

  const aiInsight = useMemo(() => {
    if (loadingWeather) return t.dashboard?.aiInsightAnalyzing || "Analyzing local farm conditions...";
    if (!weather) return t.dashboard?.aiInsightStable || "Optimal conditions across the district today.";

    const temp = weather.temp || 0;
    const rain = weather.rain_mm || 0;
    const humidity = weather.humidity || 0;

    if (temp > 38)
      return lang === "hi"
        ? "तापमान 38°C से अधिक है। वाष्पीकरण से बचने हेतु शाम को ही हल्की सिंचाई करें।"
        : lang === "pa"
        ? "ਤਾਪਮਾਨ 38°C ਤੋਂ ਵੱਧ ਹੈ। ਵਾਸ਼ਪੀਕਰਨ ਤੋਂ ਬਚਣ ਲਈ ਸ਼ਾਮ ਵੇਲੇ ਸਿੰਚਾਈ ਕਰੋ।"
        : "High temperature alert (>38°C). Irrigate during late evening to prevent excessive evaporation.";

    if (rain > 50 || weather.rainLikely)
      return lang === "hi"
        ? "बारिश की संभावना है। खेत में जल निकासी खोलें और रासायनिक छिड़काव टालें।"
        : lang === "pa"
        ? "ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਖੇਤਾਂ ਵਿੱਚੋਂ ਪਾਣੀ ਦੇ ਨਿਕਾਸ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ ਅਤੇ ਸਪਰੇਅ ਟਾਲੋ।"
        : "Rainfall expected. Open field drainage channels and postpone chemical foliar sprays.";

    if (humidity > 78)
      return lang === "hi"
        ? "उच्च आर्द्रता (ह्यूमिडिटी)। फफूंद जनित रोगों का जोखिम बढ़ सकता है, पत्तियों का निरीक्षण करें।"
        : lang === "pa"
        ? "ਵੱਧ ਨਮੀ ਕਾਰਨ ਉੱਲੀ ਰੋਗਾਂ ਦਾ ਖਤਰਾ ਵੱਧ ਸਕਦਾ ਹੈ, ਫ਼ਸਲਾਂ ਦੀ ਨਿਗਰਾਨੀ ਰੱਖੋ।"
        : "High atmospheric humidity detected. Elevated fungal risk; scout leaf surfaces regularly.";

    return lang === "hi"
      ? "मौसम फसल विकास के लिए अनुकूल है। नियमित सिंचाई व निराई-गुड़ाई जारी रखें।"
      : lang === "pa"
      ? "ਮੌਸਮ ਫ਼ਸਲ ਲਈ ਅਨੁਕੂਲ ਹੈ। ਨਿਯਮਤ ਸੰਭਾਲ ਜਾਰੀ ਰੱਖੋ।"
      : "Weather is favorable for crop canopy development. Maintain scheduled agronomic tasks.";
  }, [weather, loadingWeather, t, lang]);

  const farmPlan = useMemo(() => {
    if (loadingWeather) return [t.common?.loading || "Loading..."];
    if (!weather)
      return [
        lang === "hi" ? "फसल पत्तियों की सेहत जांचें" : "Scout crop health",
        lang === "hi" ? "स्थानीय मंडी भाव और MSP देखें" : "Compare live mandi prices",
        lang === "hi" ? "शेड्यूल के अनुसार सिंचाई करें" : "Plan targeted field irrigation",
      ];
    if (weather.temp > 35)
      return [
        lang === "hi" ? "सुबह जल्दी या शाम को सिंचाई करें" : "Irrigate early morning or evening",
        lang === "hi" ? "दोपहर की तेज धूप में काम से बचें" : "Avoid peak afternoon field exposure",
        lang === "hi" ? "मिट्टी में नमी की जांच करें" : "Check root-zone soil moisture",
      ];
    if (weather.rainLikely)
      return [
        lang === "hi" ? "खेत के पानी निकासी नाले साफ रखें" : "Clear field drainage channels",
        lang === "hi" ? "कृषि यंत्रों को सुरक्षित स्थान पर रखें" : "Secure farm equipment under shelter",
        lang === "hi" ? "कीटनाशक व खाद का छिड़काव रोकें" : "Hold chemical and fertilizer sprays",
      ];
    return [
      lang === "hi" ? "खरपतवार नियंत्रण और निराई करें" : "Field weeding and canopy inspection",
      lang === "hi" ? "अनुशंसित जैविक खाद का प्रयोग करें" : "Apply certified organic nutrients",
      lang === "hi" ? "कीट व रोगों के शुरुआती लक्षण जांचें" : "Monitor early pest and blight symptoms",
    ];
  }, [weather, loadingWeather, t, lang]);

  const faqs = [
    {
      q:
        lang === "hi"
          ? "क्रॉप स्कैनर रोग की पहचान कैसे करता है?"
          : lang === "pa"
          ? "ਕ੍ਰੌਪ ਸਕੈਨਰ ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ ਕਿਵੇਂ ਕਰਦਾ ਹੈ?"
          : "How does the Crop Scanner diagnose plant diseases?",
      a:
        lang === "hi"
          ? "आप 1 से 3 स्पष्ट तस्वीरें (पत्ती, पूरा पौधा, निचली सतह) अपलोड करते हैं। हमारा सिस्टम ICAR और PAU के कृषि शोध मॉडल से लक्षणों का मिलान कर कैलिब्रेटेड रिपोर्ट देता है। यदि लक्षण स्पष्ट न हों, तो यह गलत दवा नहीं बताता बल्कि KVK विशेषज्ञ से संपर्क करने का सुझाव देता है।"
          : lang === "pa"
          ? "ਤੁਸੀਂ 1 ਤੋਂ 3 ਸਪੱਸ਼ਟ ਫ਼ੋਟੋਆਂ ਅੱਪਲੋਡ ਕਰਦੇ ਹੋ। ਸਾਡਾ ਸਿਸਟਮ ICAR ਅਤੇ PAU ਦੇ ਮਾਡਲਾਂ ਨਾਲ ਰੋਗਾਂ ਦੇ ਲੱਛਣ ਮਿਲਾ ਕੇ ਸਹੀ ਰਿਪੋਰਟ ਦਿੰਦਾ ਹੈ।"
          : "You upload 1 to 3 clear photos (leaf symptom, whole plant, and underside). Our AI engine cross-references validated ICAR & PAU agronomic repositories to provide calibrated identification. It never invents diagnoses for ambiguous photos.",
    },
    {
      q:
        lang === "hi"
          ? "क्या दी गई कीटनाशक मात्रा सरकार द्वारा प्रमाणित है?"
          : lang === "pa"
          ? "ਕੀ ਦੱਸੀ ਗਈ ਕੀਟਨਾਸ਼ਕ ਮਾਤਰਾ ਪ੍ਰਮਾਣਿਤ ਹੈ?"
          : "Are the chemical dosage recommendations officially certified?",
      a:
        lang === "hi"
          ? "हाँ, सभी रासायनिक व जैविक उपचार केंद्रीय कीटनाशक बोर्ड (CIBRC) और पंजाब कृषि विश्वविद्यालय (PAU) के आधिकारिक पैकेज ऑफ प्रैक्टिसेज के अनुसार ही प्रस्तुत किए जाते हैं, जिसमें प्रतीक्षा अवधि (PHI) भी शामिल है।"
          : lang === "pa"
          ? "ਹਾਂ, ਸਾਰੀਆਂ ਦਵਾਈਆਂ ਦੀ ਮਾਤਰਾ CIBRC ਅਤੇ PAU ਦੀਆਂ ਪ੍ਰਮਾਣਿਤ ਸਿਫ਼ਾਰਸ਼ਾਂ ਅਨੁਸਾਰ ਹੀ ਹੁੰਦੀ ਹੈ।"
          : "Yes, every chemical dosage, organic remedy, and Pre-Harvest Interval (PHI) strictly follows CIBRC registrations and PAU Package of Practices.",
    },
    {
      q:
        lang === "hi"
          ? "मंडी भाव कहाँ से प्राप्त होते हैं?"
          : lang === "pa"
          ? "ਮੰਡੀ ਦੇ ਭਾਅ ਕਿੱਥੋਂ ਮਿਲਦੇ ਹਨ?"
          : "Where are the Mandi prices sourced from?",
      a:
        lang === "hi"
          ? "भाव भारत सरकार के एगमार्कनेट (Agmarknet) पोर्टल व एपीएमसी मंडियों से प्राप्त होते हैं और केंद्र सरकार के न्यूनतम समर्थन मूल्य (MSP) के साथ तुलना करके दिखाए जाते हैं।"
          : lang === "pa"
          ? "ਸਾਰੇ ਰੇਟ ਸਰਕਾਰੀ Agmarknet ਪੋਰਟਲ ਅਤੇ ਮੰਡੀਆਂ ਤੋਂ ਲਏ ਜਾਂਦੇ ਹਨ ਅਤੇ MSP ਨਾਲ ਤੁਲਨਾ ਕਰਕੇ ਦਰਸਾਏ ਜਾਂਦੇ ਹਨ।"
          : "Market prices are fetched directly from official Agmarknet and APMC feeds and compared against statutory Government MSP benchmarks.",
    },
    {
      q:
        lang === "hi"
          ? "क्या मैं कृषि बाज़ार में बिना बिचौलिए के अपनी फसल बेच सकता हूँ?"
          : lang === "pa"
          ? "ਕੀ ਮੈਂ ਬਿਨਾਂ ਵਿਚੋਲੇ ਦੇ ਫ਼ਸਲ ਵੇਚ ਸਕਦਾ ਹਾਂ?"
          : "Can I sell farm produce directly without commission agents?",
      a:
        lang === "hi"
          ? "हाँ, कृषि बाज़ार किसानों को सीधे प्रमाणित खरीदारों और व्यापारियों से जोड़ता है। इसमें कोई कमीशन या मध्यस्थ शुल्क नहीं लिया जाता।"
          : lang === "pa"
          ? "ਹਾਂ, ਕ੍ਰਿਸ਼ੀ ਬਾਜ਼ਾਰ ਕਿਸਾਨਾਂ ਨੂੰ ਸਿੱਧੇ ਖਰੀਦਦਾਰਾਂ ਨਾਲ ਜੋੜਦਾ ਹੈ ਬਿਨਾਂ ਕਿਸੇ ਕਮਿਸ਼ਨ ਦੇ।"
          : "Yes, Krishi Bazaar allows farmers to list produce directly with zero platform deductions or broker margins.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-8 min-h-screen">
      {/* 1. TOP GREETING & SMART ENVIRONMENT STATUS */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              {lang === "hi" ? "सक्रिय कृषि सत्र 2026" : "Active Crop Season 2026"}
            </span>
            <span className="text-xs text-gray-500 font-medium">{dateText}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight mt-1">
            {t.dashboard?.greeting || t.dashboard?.hello || "Welcome"}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            {lang === "hi"
              ? "आपकी डिजिटल कृषि मंडी, फसल डॉक्टर और पारदर्शी व्यापार केंद्र"
              : lang === "pa"
              ? "ਤੁਹਾਡੀ ਡਿਜੀਟਲ ਮੰਡੀ ਅਤੇ ਫ਼ਸਲ ਡਾਕਟਰ ਕੇਂਦਰ"
              : "Your unified digital farming hub for crop diagnosis, mandi rates, and direct trade"}
          </p>
        </div>

        {/* Hands-Free Voice Search Button */}
        <button
          type="button"
          onClick={startVoiceSearch}
          className={`inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-xs ${
            isListening
              ? "bg-red-600 text-white animate-pulse"
              : "bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50 active:scale-95"
          }`}
          aria-label="Speak in your language"
        >
          {isListening ? (
            <IconMic className="w-4 h-4 text-white animate-spin" />
          ) : (
            <IconMic className="w-4 h-4 text-emerald-700" />
          )}
          <span>
            {isListening
              ? lang === "hi"
                ? "सुन रहे हैं..."
                : "Listening..."
              : lang === "hi"
              ? "बोलकर खोजें (Voice Search)"
              : "Speak / Voice Search"}
          </span>
        </button>
      </section>

      {/* 2. REAL-TIME ENVIRONMENT METRIC PILLS */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-gray-200 shadow-2xs px-3 py-1.5 text-xs font-bold text-gray-800">
          <IconMapPin className="w-4 h-4 text-emerald-700" />
          <span>{locLoading ? (t.common?.loading || "Locating...") : district}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-gray-200 shadow-2xs px-3 py-1.5 text-xs font-bold text-gray-800">
          {weather?.rainLikely ? (
            <IconCloud className="w-4 h-4 text-blue-600" />
          ) : (
            <IconSun className="w-4 h-4 text-amber-500" />
          )}
          <span>
            {loadingWeather ? "..." : weather ? `${weather.temp}°C · ${weather.condition || "Clear"}` : "Weather Connected"}
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs px-3 py-1.5 text-xs font-bold text-emerald-900">
          <IconShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>ICAR & PAU Verified Datasets</span>
        </div>
      </div>

      {/* 3. HERO SECTION: ELEVATED CROP DOCTOR & MARKET INTEL */}
      <section className="rounded-3xl border border-emerald-700 bg-gradient-to-br from-emerald-800 via-emerald-900 to-green-950 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-bold text-emerald-200 border border-white/20">
            <IconShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>{lang === "hi" ? "वैज्ञानिक 6-स्तरीय फसल निदान" : "Scientific 6-Tier Crop Diagnosis"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            {lang === "hi"
              ? "फसल रोग का सटीक समाधान व सीधी कृषि मंडी"
              : lang === "pa"
              ? "ਫ਼ਸਲਾਂ ਦੇ ਰੋਗਾਂ ਦਾ ਸਹੀ ਇਲਾਜ ਅਤੇ ਸਿੱਧੀ ਮੰਡੀ"
              : "Calibrated Crop Health Diagnosis & Direct Farm Marketplace"}
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-xl">
            {lang === "hi"
              ? "1 से 3 पत्तियों की तस्वीर लेकर तुरंत CIBRC प्रमाणित सही दवा, प्रतीक्षा अवधि (PHI) व जैविक उपचार जानें। बिचौलियों के बिना सीधे उचित मंडी भाव पर फसल बेचें।"
              : lang === "pa"
              ? "1 ਤੋਂ 3 ਤਸਵੀਰਾਂ ਨਾਲ ਪ੍ਰਮਾਣਿਤ ਇਲਾਜ ਜਾਣੋ ਅਤੇ ਬਿਨਾਂ ਵਿਚੋਲਿਆਂ ਦੇ ਸਹੀ ਭਾਅ 'ਤੇ ਫ਼ਸਲ ਵੇਚੋ।"
              : "Capture 1 to 3 leaf photographs for calibrated condition detection, certified dosages, and direct trade with statutory MSP benchmarks."}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/scanner"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs sm:text-sm font-black text-emerald-950 shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <IconScan className="w-4 h-4 stroke-[2.5]" />
              <span>{lang === "hi" ? "कैमरा खोलें व जांचें" : "Open Camera & Scan Crop"}</span>
            </Link>

            <Link
              href="/mandi"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 border border-emerald-400/40 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xs active:scale-95 transition-all"
            >
              <IconTrendingUp className="w-4 h-4" />
              <span>{lang === "hi" ? "लाइव मंडी भाव (MSP)" : "Check Live Mandi & MSP"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FOUR CORE SHORTCUT TILES */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/scanner"
          className="p-4 bg-white border border-gray-200 rounded-2xl shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all active:scale-98 group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <IconScan className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-950 block">{t.nav?.scanner || "Crop Scanner"}</span>
            <span className="text-[11px] text-gray-500 leading-tight block mt-0.5">
              {lang === "hi" ? "1-3 फोटो से रोग जांच" : "Multi-view AI diagnosis"}
            </span>
          </div>
        </Link>

        <Link
          href="/mandi"
          className="p-4 bg-white border border-gray-200 rounded-2xl shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all active:scale-98 group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <IconTrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-950 block">{t.nav?.mandi || "Mandi Prices"}</span>
            <span className="text-[11px] text-gray-500 leading-tight block mt-0.5">
              {lang === "hi" ? "MSP तुलना व लाइव भाव" : "Live rates & MSP comparison"}
            </span>
          </div>
        </Link>

        <Link
          href="/bazaar"
          className="p-4 bg-white border border-gray-200 rounded-2xl shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all active:scale-98 group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <IconStore className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-950 block">
              {lang === "hi" ? "कृषि बाज़ार" : "Krishi Bazaar"}
            </span>
            <span className="text-[11px] text-gray-500 leading-tight block mt-0.5">
              {lang === "hi" ? "फसल बिक्री, बीज व ट्रैक्टर" : "Direct produce & equipment"}
            </span>
          </div>
        </Link>

        <Link
          href="/assistant"
          className="p-4 bg-white border border-gray-200 rounded-2xl shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all active:scale-98 group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <IconBookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-950 block">{t.nav?.assistantNav || "AI Advisory"}</span>
            <span className="text-[11px] text-gray-500 leading-tight block mt-0.5">
              {lang === "hi" ? "24/7 स्थानीय कृषि सलाह" : "24/7 vernacular assistance"}
            </span>
          </div>
        </Link>
      </section>

      {/* 5. TODAY'S AGRONOMIC INSIGHT & SMART FARMING HUB */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-gray-950">
              {lang === "hi" ? "आज की मौसम आधारित कृषि सलाह" : "Today's Agronomic Advisory"}
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            {district}
          </span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
          {aiInsight}
        </p>
      </section>

      {/* 6. LIVE DATA PREVIEW: MANDI PRICES & TODAY'S TASKS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mandi Rates Preview */}
        <div className="bg-white border border-gray-200 shadow-xs rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IconTrendingUp className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-gray-950">
                {t.dashboard?.mandiTitle || "Live Mandi Rates"}
              </h3>
            </div>
            <Link
              href="/mandi"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{lang === "hi" ? "सभी मंडियां देखें" : "View All Mandis"}</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {loadingPrices ? (
              <div className="space-y-2">
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ) : prices.length > 0 ? (
              prices.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 hover:bg-emerald-50/30 transition-colors"
                >
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">{item.market}</span>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {item.commodity || "Wheat"} · {item.variety || "Local"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-700 text-sm">₹{item.modalPrice}</span>
                    <span className="text-[10px] text-gray-500 block">/ Quintal</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-xl text-center">
                {t.dashboard?.noPrices || "No live mandi data reported for today."}
              </p>
            )}
          </div>
        </div>

        {/* Farm Action Plan */}
        <div className="bg-white border border-gray-200 shadow-xs rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IconSprout className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-gray-950">
                {t.dashboard?.todaysPlan || "Today's Field Tasks"}
              </h3>
            </div>
            <Link
              href="/planner"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{lang === "hi" ? "स्मार्ट प्लानर" : "Crop Planner"}</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {farmPlan.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0">
                  {idx + 1}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-800">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. LIVE ACTION ENGINE ALERTS */}
      <ActionEngine />

      {/* 8. HOW KRISHAK VIPANI WORKS (4-STEP WORKFLOW) */}
      <section className="bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            {lang === "hi" ? "सरल व सुरक्षित प्रक्रिया" : "How Krishak Vipani Works"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            {lang === "hi"
              ? "फसल सुरक्षा से लेकर मंडी में बिक्री तक 4 चरण"
              : "From Crop Protection to Mandi Trade in 4 Steps"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              num: "1",
              title: lang === "hi" ? "1-3 फोटो अपलोड करें" : "Capture 1-3 Photos",
              desc:
                lang === "hi"
                  ? "पत्ती के लक्षण, पूरे पौधे व पत्ती के निचले हिस्से की तस्वीर लें।"
                  : "Photograph disease spot, whole canopy, and leaf underside.",
              icon: IconScan,
            },
            {
              num: "2",
              title: lang === "hi" ? "सत्यापित रोग निदान" : "Verified Condition Match",
              desc:
                lang === "hi"
                  ? "ICAR व PAU शोध मानकों से मिलान कर कैलिब्रेटेड डायग्नोसिस।"
                  : "Cross-checked with ICAR & PAU agronomic disease repositories.",
              icon: IconShieldCheck,
            },
            {
              num: "3",
              title: lang === "hi" ? "CIBRC प्रमाणित उपचार" : "CIBRC Certified Dosage",
              desc:
                lang === "hi"
                  ? "सटीक रासायनिक व जैविक दवा, मात्रा व प्रतीक्षा अवधि (PHI)।"
                  : "Approved chemical dosage, spray volume, and safety interval.",
              icon: IconBookOpen,
            },
            {
              num: "4",
              title: lang === "hi" ? "सीधी मंडी बिक्री" : "Direct Mandi & Bazaar Trade",
              desc:
                lang === "hi"
                  ? "न्यूनतम समर्थन मूल्य (MSP) जांचें व बिना बिचौलिए के फसल बेचें।"
                  : "Compare MSP statutory rates and list produce commission-free.",
              icon: IconStore,
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black">
                  <step.icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-xl font-black text-gray-300">0{step.num}</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-950">{step.title}</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. AGRICULTURAL CORE SERVICES HIGHLIGHT */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {lang === "hi" ? "कृषि सेवाएं" : "Agricultural Services"}
            </span>
            <h2 className="text-2xl font-black text-gray-950 tracking-tight">
              {lang === "hi" ? "किसान के लिए सम्पूर्ण समाधान" : "Comprehensive Solutions for Every Farmer"}
            </h2>
          </div>
          <Link
            href="/services"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
          >
            <span>{lang === "hi" ? "सभी सेवाएं देखें" : "View All Services"}</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <IconScan className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h4 className="text-base font-bold text-gray-950">
              {lang === "hi" ? "वैज्ञानिक फसल डॉक्टर" : "Scientific Crop Doctor"}
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {lang === "hi"
                ? "अस्पष्ट या घटिया फोटो पर गलत अनुमान नहीं लगाया जाता। अनिश्चित स्थिति में KVK कृषि वैज्ञानिक को रेफर करने की सुविधा।"
                : "Strict rejection of out-of-distribution images. Farmers are never given uncalibrated guesses for poor photographs."}
            </p>
            <Link
              href="/scanner"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
            >
              <span>{lang === "hi" ? "जांच शुरू करें" : "Start Diagnosis"}</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
              <IconTrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h4 className="text-base font-bold text-gray-950">
              {lang === "hi" ? "मंडी भाव व सरकारी MSP" : "Mandi Rates & Govt MSP"}
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {lang === "hi"
                ? "2,400+ मंडियों से न्यूनतम, अधिकतम व मॉडल भाव। न्यूनतम समर्थन मूल्य (MSP 2024-25) से तुलना कर सही निर्णय लें।"
                : "Direct Agmarknet feeds displaying modal rates alongside statutory Kharif & Rabi MSP benchmarks."}
            </p>
            <Link
              href="/mandi"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
            >
              <span>{lang === "hi" ? "मंडी तालिका देखें" : "View Mandi Table"}</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <IconTractor className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h4 className="text-base font-bold text-gray-950">
              {lang === "hi" ? "कृषि बाज़ार व उपकरण किराया" : "Krishi Bazaar & Rentals"}
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {lang === "hi"
                ? "प्रमाणित बीज, जैविक उर्वरक और ड्रोन स्प्रे व कंबाइन हार्वेस्टर किराया सीधे आसपास के किसानों से लें।"
                : "Certified farm inputs, direct crop listings, and local tractor and drone spraying services."}
            </p>
            <Link
              href="/bazaar"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
            >
              <span>{lang === "hi" ? "बाज़ार में प्रवेश करें" : "Explore Bazaar"}</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. TRUST & SCIENTIFIC RIGOR BENCHMARK */}
      <section className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            {lang === "hi" ? "विश्वसनीयता व प्रमाणिकता" : "Trust & Reliability"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {lang === "hi"
              ? "कृषि वैज्ञानिकों और शोध संस्थानों द्वारा समर्थित"
              : "Built on Validated Research & Rigorous Agricultural Standards"}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
            {lang === "hi"
              ? "हम बिना जांचे-परखे एआई भ्रम (hallucinations) पर भरोसा नहीं करते। हर अनुशंसा भारतीय कृषि अनुसंधान परिषद (ICAR) और राज्य कृषि विश्वविद्यालयों के शोध पर आधारित है।"
              : "Diagnostic and dosage data is strictly grounded in verified ICAR and State Agricultural University standards."}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-2xl font-black text-emerald-300">100%</span>
            <h5 className="text-xs font-bold text-white">CIBRC Dosage Integrity</h5>
            <p className="text-[11px] text-emerald-200">No unregistered chemicals</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-2xl font-black text-emerald-300">3-View</span>
            <h5 className="text-xs font-bold text-white">Multi-Angle Consensus</h5>
            <p className="text-[11px] text-emerald-200">High diagnostic accuracy</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-2xl font-black text-emerald-300">0%</span>
            <h5 className="text-xs font-bold text-white">Broker Deductions</h5>
            <p className="text-[11px] text-emerald-200">Direct buyer payment</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-2xl font-black text-emerald-300">1800</span>
            <h5 className="text-xs font-bold text-white">KVK Helpline Support</h5>
            <p className="text-[11px] text-emerald-200">Free Kisan assistance</p>
          </div>
        </div>
      </section>

      {/* 11. AUTHENTIC FARMER TESTIMONIALS */}
      <section className="space-y-4">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            {lang === "hi" ? "किसान अनुभव" : "Farmer Experiences"}
          </span>
          <h2 className="text-2xl font-black text-gray-950 tracking-tight">
            {lang === "hi" ? "खेतों से वास्तविक सफलता गाथाएं" : "Real Impact from the Field"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500 text-xs">★★★★★</div>
            <p className="text-xs text-gray-700 leading-relaxed italic">
              &quot;गेहूं में पीला रतुआ (Yellow Rust) के शुरुआती लक्षण पत्ती स्कैन करते ही पता चल गए। समय पर प्रोपिकोनाज़ोल का छिड़काव करने से मेरी 12 एकड़ फसल बच गई।&quot;
            </p>
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-950 block">हरप्रीत सिंह</span>
              <span className="text-[11px] text-gray-500">पटियाला, पंजाब (गेहूं उत्पादक)</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500 text-xs">★★★★★</div>
            <p className="text-xs text-gray-700 leading-relaxed italic">
              &quot;मंडी भाव में MSP तुलना देखकर मैंने सोयाबीन स्थानीय आढ़ती की बजाय सीधे कृषि बाज़ार में बेची। मुझे प्रति क्विंटल ₹180 अधिक प्राप्त हुए।&quot;
            </p>
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-950 block">राजेश पाटीदार</span>
              <span className="text-[11px] text-gray-500">इंदौर, मध्य प्रदेश (सोयाबीन व चना)</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500 text-xs">★★★★★</div>
            <p className="text-xs text-gray-700 leading-relaxed italic">
              &quot;टमाटर में अगेती झुलसा का सही जैविक उपचार मिला। &apos;बोलकर सुनें&apos; फीचर से मेरे पिताजी बिना चश्मा लगाए फोन पर उपचार सुन लेते हैं।&quot;
            </p>
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-950 block">सुरेश जाधव</span>
              <span className="text-[11px] text-gray-500">नासिक, महाराष्ट्र (सब्जी उत्पादक)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            {lang === "hi" ? "अक्सर पूछे जाने वाले सवाल" : "Frequently Asked Questions"}
          </span>
          <h2 className="text-2xl font-black text-gray-950 tracking-tight">
            {lang === "hi" ? "आपके सवालों के स्पष्ट उत्तर" : "Clear Answers to Common Questions"}
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3.5">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left text-sm font-bold text-gray-900 py-1 hover:text-emerald-800 transition-colors"
                aria-expanded={openFaq === idx}
              >
                <span>{faq.q}</span>
                <IconChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    openFaq === idx ? "rotate-180 text-emerald-700" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2 pl-1 animate-fadeIn">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 13. KISAN CALL CENTRE HELPLINE BANNER */}
      <section className="rounded-2xl border border-emerald-300 bg-emerald-50/90 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold text-emerald-900 flex items-center justify-center sm:justify-start gap-1.5">
            <IconPhone className="w-4 h-4 text-emerald-700" />
            {lang === "hi" ? "निशुल्क किसान हेल्पलाइन 24×7" : "Toll-Free Kisan Call Centre 24x7"}
          </span>
          <h3 className="text-lg font-black text-emerald-950">
            {lang === "hi" ? "कृषि विशेषज्ञ से सीधे फोन पर बात करें" : "Talk Directly with an Agricultural Officer"}
          </h3>
          <p className="text-xs text-emerald-800">
            {lang === "hi"
              ? "टोल-फ्री नंबर 1800-180-1551 पर कॉल करें या अपने नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।"
              : "Dial 1800-180-1551 (Toll-Free) or reach your local Krishi Vigyan Kendra."}
          </p>
        </div>

        <a
          href="tel:18001801551"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-xs transition-all shrink-0"
        >
          <IconPhone className="w-4 h-4" />
          <span>1800-180-1551</span>
        </a>
      </section>
    </div>
  );
}
