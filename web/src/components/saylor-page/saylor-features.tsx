"use client";

import { Container } from "@/components/ui/container";
import {
  ArrowRightIcon,
  CoffeeIcon,
  LaptopIcon,
  CarIcon,
  HomeIcon,
} from "lucide-react";

const priceExamples = [
  {
    icon: CoffeeIcon,
    item: "Coffee",
    normalPrice: "$5",
    saylorPrice: "$105",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: LaptopIcon,
    item: "Laptop",
    normalPrice: "$1,000",
    saylorPrice: "$21,000",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: CarIcon,
    item: "Car",
    normalPrice: "$30,000",
    saylorPrice: "$630,000",
    color: "from-green-500 to-green-600",
  },
  {
    icon: HomeIcon,
    item: "House",
    normalPrice: "$500,000",
    saylorPrice: "$10.5M",
    color: "from-purple-500 to-purple-600",
  },
];

export function SaylorFeatures() {
  return (
    <section id="features" className="py-20 border-t border-border">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What is <span className="text-oc-primary">Saylor Mode</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Saylor Mode shows you what prices would look like if Bitcoin reaches
            Saylor's $21 million target. Every price is multiplied by the growth
            factor, giving you a glimpse into tomorrow's purchasing power.
          </p>
        </div>

        {/* Calculation explanation */}
        <div className="bg-card rounded-2xl p-8 border border-border mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            The Simple Math
          </h3>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 text-center">
            <div className="bg-background rounded-xl p-6 border border-border">
              <div className="text-lg text-muted-foreground mb-2">
                Current Bitcoin Price
              </div>
              <div className="text-3xl font-bold text-foreground">
                ~$100,000
              </div>
            </div>

            <ArrowRightIcon className="w-8 h-8 text-oc-primary" />

            <div className="bg-oc-primary/10 dark:bg-oc-primary/20 rounded-xl p-6 border border-oc-primary/20">
              <div className="text-lg text-muted-foreground mb-2">
                Saylor's Target
              </div>
              <div className="text-3xl font-bold text-oc-primary">
                $21,000,000
              </div>
            </div>

            <ArrowRightIcon className="w-8 h-8 text-oc-primary" />

            <div className="bg-background rounded-xl p-6 border border-border">
              <div className="text-lg text-muted-foreground mb-2">
                Growth Factor
              </div>
              <div className="text-3xl font-bold text-foreground">210x</div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-lg text-muted-foreground">
              Every dollar today ={" "}
              <span className="font-bold text-oc-primary">$210</span> in Saylor
              Mode
            </p>
          </div>
        </div>

        {/* Price examples grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {priceExamples.map((example, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${example.color} flex items-center justify-center mb-4`}
              >
                <example.icon className="w-6 h-6 text-white" />
              </div>

              <h4 className="text-lg font-bold text-foreground mb-4">
                {example.item}
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today:</span>
                  <span className="font-bold text-foreground">
                    {example.normalPrice}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Saylor Mode:
                  </span>
                  <span className="font-bold text-oc-primary">
                    {example.saylorPrice}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground text-center">
                  {Math.round(
                    parseInt(example.saylorPrice.replace(/[\$,M]/g, "")) /
                      parseInt(example.normalPrice.replace("$", ""))
                  )}
                  x more expensive
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-oc-primary/10 dark:bg-oc-primary/20 rounded-2xl p-8 border border-oc-primary/20">
          <h3 className="text-2xl font-bold text-center mb-8">
            How Saylor Mode Works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-oc-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h4 className="font-bold text-foreground mb-2">
                Install Extension
              </h4>
              <p className="text-muted-foreground">
                Add the Opportunity Cost extension to Chrome or Firefox
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-oc-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h4 className="font-bold text-foreground mb-2">
                Enable Saylor Mode
              </h4>
              <p className="text-muted-foreground">
                Toggle Saylor Mode in the extension settings
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-oc-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h4 className="font-bold text-foreground mb-2">See the Future</h4>
              <p className="text-muted-foreground">
                Watch prices transform as you browse the web
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
