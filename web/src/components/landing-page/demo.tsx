"use client";

import { Container } from "@/components/ui/container";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const carouselItems = [
  {
    src: "/images/zillow-btc-prices.png",
    alt: "Zillow with Bitcoin prices",
  },
  {
    src: "/images/nike-btc-prices-new.png",
    alt: "Nike with Bitcoin prices",
  },
  {
    src: "/images/apple-btc-prices.png",
    alt: "Apple with Bitcoin prices",
  },
  {
    src: "/images/hats-btc-prices.png",
    alt: "Hats with Bitcoin prices",
  },
];

export function Demo() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section id="demo" className="bg-white">
      <Container>
        <div className="bg-neutral-100 rounded-3xl p-8 md:p-12">
          <div className="text-left max-w-lg mb-8">
            <h2 className="text-3xl text-foreground font-bold mb-4">
              See It in Action
            </h2>
            <h3 className="text-xl text-muted-foreground font-light">
              See Bitcoin values on shopping sites, real estate listings,
              financial platforms, and more
            </h3>
            {/* <Button
              variant="primaryOutline"
              size="lg"
              className="font-medium border-2 hover:bg-oc-primary hover:text-white text-md"
              asChild
            >
              <a href="#download">Get Started Now</a>
            </Button> */}
          </div>

          <div className="max-w-3xl space-y-6 mx-auto">
            <Carousel
              className="w-full"
              opts={{ loop: true, duration: 15 }}
              setApi={setApi}
            >
              <CarouselContent>
                {carouselItems.map((item, index) => (
                  <CarouselItem key={index}>
                    <div className="w-full h-full bg-white rounded-lg">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        width={800}
                        height={400}
                        className="w-full bg-white h-[300px] md:h-[500px] object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

            <div className="flex justify-center gap-1">
              {carouselItems.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-2 rounded-full cursor-pointer transition-all duration-200",
                    current === index
                      ? "w-6 bg-oc-primary"
                      : "w-3 bg-neutral-300 hover:bg-neutral-400"
                  )}
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
