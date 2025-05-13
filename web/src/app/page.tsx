import { Header } from "@/components/landing-page/header";
import type { Metadata } from "next";
import { Hero } from "@/components/landing-page/hero";
import { Features } from "@/components/landing-page/features";
import { Download } from "@/components/landing-page/download";
import { Demo } from "@/components/landing-page/demo";
import { About } from "@/components/landing-page/about";
import { FAQ } from "@/components/landing-page/faq";
import { Newsletter } from "@/components/landing-page/newsletter";
import { Footer } from "@/components/landing-page/footer";

export const metadata: Metadata = {
  title: "Opportunity Cost – See Prices in Bitcoin Instantly",
  description:
    "Opportunity Cost is a browser extension for Chrome and Firefox that instantly converts USD prices to Bitcoin (satoshis) as you browse. Dual display, privacy-first, and open source.",
  keywords: [
    "Bitcoin",
    "Satoshis",
    "Browser Extension",
    "USD to BTC",
    "Fiat Conversion",
    "Chrome Extension",
    "Firefox Add-on",
    "Opportunity Cost",
    "Crypto",
    "BTC Prices",
    "Bitcoin Standard",
  ],
  authors: [{ name: "TFTC", url: "https://tftc.io" }],
  creator: "TFTC",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Opportunity Cost – See Prices in Bitcoin Instantly",
    description:
      "Convert USD prices to Bitcoin (satoshis) as you browse. Dual display, privacy-first, and open source.",
    url: "https://opportunitycost.app/",
    siteName: "Opportunity Cost",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Opportunity Cost Extension – See Prices in Bitcoin",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opportunity Cost – See Prices in Bitcoin Instantly",
    description:
      "Convert USD prices to Bitcoin (satoshis) as you browse. Dual display, privacy-first, and open source.",
    images: [
      {
        url: "/images/og-image.png",
        alt: "Opportunity Cost Extension – See Prices in Bitcoin",
      },
    ],
    creator: "@tfcbrand",
  },
  themeColor: "#f7931a",
};

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <Download />
      <Demo />
      <About />
      <FAQ />
      <Newsletter />
      <Footer />
    </>
  );
}
