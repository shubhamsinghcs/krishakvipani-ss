export function generateTransportMessage(params, lang = "en") {
  const {
    pickupLocation,
    destination,
    cropType,
    quantity,
    preferredDate,
    farmerName,
  } = params;

  const templates = {
    en: {
      greeting: "Hello, I need transport",
      crop: `${quantity} tons of ${cropType}`,
      from: `from ${pickupLocation}`,
      to: `to ${destination}`,
      date: `on ${preferredDate || "ASAP"}`,
      farmer: farmerName ? `Farmer: ${farmerName}` : "",
      request: "Please confirm availability and quote",
      app: "- From KrishakVipani App",
    },
    hi: {
      greeting: "नमस्ते, मुझे परिवहन सेवा चाहिए",
      crop: `${quantity} टन ${cropType}`,
      from: `${pickupLocation} से`,
      to: `${destination} तक`,
      date: `${preferredDate || "तुरंत"} को`,
      farmer: farmerName ? `किसान: ${farmerName}` : "",
      request: "कृपया उपलब्धता और कीमत की पुष्टि करें",
      app: "- KrishakVipani ऐप से",
    },
    pa: {
      greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਮੇਨੂੰ ਟਰਾਂਸਪੋਰਟ ਚਾਹੀਦੀ ਹੈ",
      crop: `${quantity} ਟਨ ${cropType}`,
      from: `${pickupLocation} ਤੋਂ`,
      to: `${destination} ਤੱਕ`,
      date: `${preferredDate || "ਫੌਰਨ"} ਨੂੰ`,
      farmer: farmerName ? `ਕਿਸਾਨ: ${farmerName}` : "",
      request: "ਕਿਰਪਾ ਕਰਕੇ ਉਪਲਬਧਤਾ ਅਤੇ ਕੀਮਤ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
      app: "- KrishakVipani ਐਪ ਤੋਂ",
    },
  };

  const t = templates[lang] || templates.en;

  const parts = [
    t.greeting,
    t.crop,
    t.from,
    t.to,
    t.date,
  ].filter(Boolean);

  if (t.farmer) parts.push(t.farmer);
  parts.push(t.request);
  parts.push(t.app);

  return parts.join("\n");
}

export function generateWhatsAppUrl(phone, message) {
  if (!phone || !message) return null;

  try {
    const cleanPhone = String(phone)
      .replace(/[^\d+]/g, "")
      .replace(/^\+/, "");

    if (!cleanPhone || cleanPhone.length < 10) {
      return null;
    }

    const withCountryCode = cleanPhone.startsWith("91")
      ? cleanPhone
      : `91${cleanPhone}`;
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${withCountryCode}?text=${encodedMessage}`;
  } catch (error) {
    console.error("WhatsApp URL generation error:", error);
    return null;
  }
}

export function validatePhoneNumber(phone) {
  const clean = String(phone).replace(/\D/g, "");
  return clean.length >= 10 && clean.length <= 15;
}

export function sanitizePhoneNumber(phone) {
  return String(phone)
    .replace(/[^\d+]/g, "")
    .replace(/^\+/, "");
}
