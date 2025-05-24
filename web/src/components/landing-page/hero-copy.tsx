"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";

export function Hero() {
  // Slideshow logic
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = [
    "/images/zillow-btc-prices.png",
    "/images/nike-btc-prices-new.png",
    "/images/apple-btc-prices.png",
    "/images/hats-btc-prices.png",
  ];
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    slideInterval.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, [slides.length]);

  const plusSlide = (n: number) => {
    setSlideIndex((prev) => (prev + n + slides.length) % slides.length);
  };

  return (
    <section className="pt-40 pb-20 bg-gradient-to-br from-white to-gray-100">
      <div className="w-[90%] max-w-[1200px] mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            See the True Cost of Everything in Bitcoin
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Convert prices to Bitcoin as you browse the web. Opportunity Cost
            automatically displays fiat prices in BTC or sats, helping you think
            in a Bitcoin standard.
          </p>
          <div className="flex gap-4 flex-col sm:flex-row">
            <Button
              asChild
              variant="default"
              size="lg"
              className="font-medium text-md"
            >
              <a href="#chrome">Add to Chrome</a>
            </Button>
            {/* <a
              href="#firefox"
              className="inline-block px-6 py-3 font-semibold rounded-lg border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-orange-100 transition text-center"
            >
              Add to Firefox
            </a> */}
          </div>
        </div>
        <div className="relative shadow-lg rounded-lg flex justify-center items-center max-h-[500px] min-h-[250px] bg-gray-50 overflow-hidden">
          <div className="max-w-4xl mx-auto my-8">
            <video controls className="w-full rounded-xl shadow-lg">
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {/* <div className="w-full h-full flex items-center justify-center">
            <Image
              src={slides[slideIndex]}
              alt="Opportunity Cost Extension Screenshot"
              width={500}
              height={300}
              className="object-contain max-h-[500px] w-full h-auto rounded-lg"
            />
          </div>
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 px-4 py-2 text-white font-bold text-lg bg-black/20 hover:bg-black/80 rounded-r transition z-10"
            onClick={() => plusSlide(-1)}
            aria-label="Previous Slide"
          >
            &#10094;
          </button>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 px-4 py-2 text-white font-bold text-lg bg-black/20 hover:bg-black/80 rounded-l transition z-10"
            onClick={() => plusSlide(1)}
            aria-label="Next Slide"
          >
            &#10095;
          </button> */}
        </div>
      </div>
    </section>
  );
}
