import Link from "next/link";

export const metadata = {
  title: "ऑफ़लाइन | KrishakVipani",
  description: "आप वर्तमान में ऑफ़लाइन हैं।",
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-4xl" aria-hidden>
        📡
      </p>
      <h1 className="mt-4 text-xl font-bold text-brand-textDark">ऑफ़लाइन हैं</h1>
      <p className="mt-2 text-sm text-brand-textMid">इंटरनेट जुड़ने पर पेज रीफ़्रेश करें या होम पर जाएं।</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-green-600 px-6 py-2 text-sm font-semibold text-white transition active:scale-95"
      >
        होम
      </Link>
    </div>
  );
}
