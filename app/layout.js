import Header from "@/components/navbar/Header";
import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/footer/Footer";
import Script from "next/script"; // ✅ Required for loading scripts

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PiStream free movie streaming",
  description: "A World of Cinema",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google AdSense script for verification */}
        <Script
          id="adsense-verification"
          strategy="beforeInteractive"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9433286911477345"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <Header />
        <div className="mt-32">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
