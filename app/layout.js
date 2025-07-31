import Header from "@/components/navbar/Header";
import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/footer/Footer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PiStream free movie streaming",
  description: "A World of Cinema",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ✅ Google AdSense global script */}
        <Script
          id="adsense-script"
          strategy="beforeInteractive"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9433286911477345"
          crossOrigin="anonymous"
        />

        <Header />
        <div className="mt-32">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
