"use client";

import { useLang } from "@/lib/LanguageContext";

export default function WhatsAppShare({ crop, district, data = [] }) {
  const { lang, t } = useLang();
  const handleShare = () => {
    let locale = "en-IN";
    try {
      locale = lang === "en" ? "en-IN" : `${lang}-IN`;
    } catch {
      locale = "en-IN";
    }
    const today = new Date().toLocaleDateString(locale);
    const unitText = t("calculator.quintalAbbr") || "qtl";
    const lines = data.map((item) => `${item.market}: ₹${item.modalPrice}/${unitText}`).join("\n");
    const title = (t.mandi?.shareTitle || "*KrishakVipani — {crop} Mandi Prices*").replace("{crop}", crop);
    const districtLine = (t.mandi?.shareDistrict || "District: {district}").replace("{district}", district);
    const dateLine = (t.mandi?.shareDate || "{date}").replace("{date}", today);
    const message = `${title}\n${districtLine}\n${dateLine}\n\n${lines}\n\n${t.mandi?.shareFooter || "Shared from KrishakVipani app"}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="min-h-[44px] w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-95 sm:w-auto"
    >
      {t.common?.whatsappShare || "Share on WhatsApp"}
    </button>
  );
}
