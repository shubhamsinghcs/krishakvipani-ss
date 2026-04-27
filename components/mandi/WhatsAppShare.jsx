"use client";

import { useLang } from "@/lib/LanguageContext";

export default function WhatsAppShare({ crop, district, data = [] }) {
  const { lang, t } = useLang();
  const handleShare = () => {
    const locale = lang === "en" ? "en-IN" : lang === "pa" ? "pa-IN" : "hi-IN";
    const today = new Date().toLocaleDateString(locale);
    const unitText = lang === "en" ? "quintal" : "ਕੁਇੰਟਲ";
    const lines = data.map((item) => `🏪 ${item.market}: ₹${item.modalPrice}/${lang === "hi" ? "क्विंटल" : unitText}`).join("\n");
    const title = t.mandi.shareTitle.replace("{crop}", crop);
    const districtLine = t.mandi.shareDistrict.replace("{district}", district);
    const dateLine = t.mandi.shareDate.replace("{date}", today);
    const message = `${title}\n${districtLine}\n${dateLine}\n\n${lines}\n\n${t.mandi.shareFooter}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="min-h-[44px] w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-95 sm:w-auto"
    >
      {t.common.whatsappShare}
    </button>
  );
}
