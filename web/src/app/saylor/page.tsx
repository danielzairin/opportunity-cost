import type { Metadata } from "next";
import { Header } from "@/components/landing-page/header";
import { Footer } from "@/components/landing-page/footer";
import { SaylorHero } from "@/components/saylor-page/saylor-hero";
import { SaylorPrediction } from "@/components/saylor-page/saylor-prediction";
import { SaylorFeatures } from "@/components/saylor-page/saylor-features";
import { SaylorVideo } from "@/components/saylor-page/saylor-video";
import { SaylorCTA } from "@/components/saylor-page/saylor-cta";

export const metadata: Metadata = {
  title: "Saylor Mode - Opportunity Cost Extension",
  description:
    "What if Bitcoin hits $21 million? Michael Saylor's 21-year prediction becomes your reality check. See prices in Saylor Mode with the Opportunity Cost extension.",
  keywords: [
    "Saylor Mode",
    "Michael Saylor",
    "Bitcoin $21 million",
    "BTC Prague",
    "Bitcoin prediction",
    "Opportunity Cost",
    "Browser Extension",
    "21 years",
  ],
  openGraph: {
    title: "Saylor Mode - What if Bitcoin hits $21 Million?",
    description:
      "Michael Saylor's 21-year prediction becomes your reality check. See what prices would be if Bitcoin reaches $21 million.",
    images: [
      {
        url: "/images/enhanced_saylor.png",
        width: 1200,
        height: 630,
        alt: "Saylor Mode - Michael Saylor's Bitcoin Prediction",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saylor Mode - What if Bitcoin hits $21 Million?",
    description:
      "Michael Saylor's 21-year prediction becomes your reality check.",
    images: ["/images/enhanced_saylor.png"],
  },
};

export default function SaylorPage() {
  return (
    <div data-opp-cost-disabled="true">
      <Header />
      <SaylorHero />
      <SaylorPrediction />
      <SaylorFeatures />
      <SaylorVideo />
      <SaylorCTA />
      <Footer />
    </div>
  );
}
