"use client";

export default function ServicesPage() {
  const cards = [
    { title: "🚜 ट्रैक्टर किराय पर", desc: "खेत की जुताई के लिए ट्रैक्टर बुक करें।", icon: "🚜", contact: "+91 9876543210" },
    { title: "❄️ कोल्ड स्टोरेज", desc: "सब्जी और आलू सुरक्षित रखें।", icon: "❄️", contact: "+91 8765432109" },
    { title: "👨‍💼 मंडी एजेंट", desc: "फसल बेचने में मदद के लिए संपर्क करें।", icon: "🤝", contact: "मंडी ऑफिस" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">📍 नजदीकी सेवाएं</h1>
        <p className="mt-1 text-sm text-brand-textMid">किराये के वाहन और एजेंट खोजें।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {cards.map((c, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 hover:scale-[1.02] transition-all flex flex-col items-center text-center">
               <div className="text-4xl mb-3">{c.icon}</div>
               <h3 className="font-bold text-gray-800">{c.title}</h3>
               <p className="text-sm text-gray-500 mt-1 flex-1">{c.desc}</p>
               <a href={`tel:${c.contact.replace(/ /g,'')}`} className="mt-4 w-full min-h-[44px] bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center active:scale-95 transition-all shadow">
                  संपर्क करें
               </a>
            </div>
         ))}
      </div>
    </div>
  );
}
