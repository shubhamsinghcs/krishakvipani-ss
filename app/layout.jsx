import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { SidebarProvider } from "@/lib/SidebarContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import BottomNav from "@/components/BottomNav";
import { defaultLanguage } from "@/lib/i18n";

export const metadata = {
  title: "KrishakVipani | किसान का डिजिटल बाज़ार",
  description: "किसानों के लिए मंडी भाव, मौसम, फसल स्कैनर और सरकारी योजनाएं एक ही जगह।",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "KrishakVipani",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#15803d",
};

export default function RootLayout({ children }) {
  return (
    <html lang={defaultLanguage}>
      <body
        className="overflow-x-hidden bg-brand-background text-brand-textMid antialiased min-h-screen"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <LanguageProvider>
          <SidebarProvider>
            <div className="fixed top-0 left-0 right-0 z-40">
              <Navbar />
            </div>
            <div className="flex pt-16">
              <Sidebar />
              <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col pb-20 lg:pb-6 lg:ml-64">
                <div className="w-full">
                  <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 py-4 md:py-6 gap-4 md:gap-6 overflow-x-hidden">
                    <div className="flex-1">{children}</div>
                  </div>
                </div>
                <Footer />
              </main>
              <BottomNav />
            </div>
          </SidebarProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
