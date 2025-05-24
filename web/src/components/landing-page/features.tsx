"use client";
import { Bitcoin, Settings, UserLock, Globe } from "lucide-react";
import { Container } from "@/components/ui/container";
import Image from "next/image";

const features = [
  {
    icon: Bitcoin,
    title: "Think in Bitcoin, Not Fiat",
    description:
      "Instantly see the true Bitcoin cost of everything. Convert prices from 10+ currencies to BTC or sats in real-time as you browse - no more mental math required.",
    colSpan: 2,
    image: "/images/features/price-conversion.png",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description:
      "From Amazon to Twitter, news sites to local stores - see Bitcoin prices on any website. One extension, infinite Bitcoin price awareness.",
    colSpan: 1,
  },
  {
    icon: UserLock,
    title: "Zero Trust Required",
    description:
      "100% local processing, zero data collection, fully open source. Your browsing habits stay private while you build Bitcoin intuition.",
    colSpan: 1,
  },
  {
    icon: Settings,
    title: "Smart Bitcoin Display",
    description:
      "Intelligently shows sats for small amounts, BTC for large ones. Or lock it to your preference - because Bitcoiners have strong opinions about units.",
    colSpan: 2,
    image: "/images/features/dynamic-display.png",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-neutral-50">
      <Container>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Key Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            See the opportunity cost of Bitcoin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-lg p-6 shadow-sm border border-neutral-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-md relative ${
                  feature.colSpan === 2 ? "md:col-span-2 lg:col-span-2" : ""
                }`}
              >
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-oc-primary/[0.01] to-transparent rounded-b-lg"></div>
                <div
                  className={`${feature.colSpan === 2 ? "flex flex-col lg:flex-row gap-6" : ""}`}
                >
                  <div className={`${feature.colSpan === 2 ? "lg:w-1/2" : ""}`}>
                    <div className="w-12 h-12 mb-6 flex items-center justify-center bg-gradient-to-b from-oc-primary/10 to-orange-100 rounded-lg relative z-10">
                      <IconComponent className="text-oc-primary size-8 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1 text-foreground relative z-10">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                      {feature.description}
                    </p>
                  </div>
                  {feature.image && (
                    <div
                      className={`${feature.colSpan === 2 ? "lg:w-1/2" : ""}`}
                    >
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={600}
                        height={600}
                        className="rounded-md aspect-square object-cover w-full max-h-56"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
