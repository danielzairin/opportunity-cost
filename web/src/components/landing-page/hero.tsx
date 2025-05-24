"use client";

import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import { Container } from "@/components/ui/container";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVideoPlay = () => {
    if (playCount === 0 && videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(true);
    setPlayCount(playCount + 1);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  return (
    <section className="pt-40 pb-20 border-b relative overflow-hidden">
      {/* Layer 1: Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-oc-primary/10"></div>

      {/* Layer 2: Lines */}
      <div className="absolute inset-0">
        <div className="absolute opacity-10 inset-0 bg-[linear-gradient(0deg,transparent_49.5%,#ea580c_49.5%,#ea580c_50.5%,transparent_50.5%)] bg-[length:100%_100px]"></div>
        <div className="absolute opacity-10 inset-0 bg-[linear-gradient(90deg,transparent_49.5%,#ea580c_49.5%,#ea580c_50.5%,transparent_50.5%)] bg-[length:100px_100%]"></div>
      </div>

      {/* Layer 3: Gradient overlay from white to transparent (upper left to bottom right) */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white/50 to-transparent"></div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="text-center max-w-lg mx-auto lg:text-left">
            <h1 className="text-4xl text-foreground font-bold mb-4">
              See the True Cost of Everything in Bitcoin
            </h1>
            <p className="font-light text-lg text-muted-foreground mb-6">
              Convert prices to Bitcoin as you browse the web.
              <br /> Opportunity Cost automatically displays fiat prices in BTC
              or sats, helping you think in a Bitcoin standard.
            </p>
            <div className="flex flex-col gap-2 justify-center lg:justify-start items-center lg:items-start">
              <Button
                asChild
                variant="default"
                size="lg"
                className="font-medium text-md"
              >
                <a href="#chrome">
                  Add to Chrome <ArrowRightIcon className="s-4" />
                </a>
              </Button>
              <p className="text-gray-400 text-xs">Firefox coming soon!</p>
              {/* <a
                href="#firefox"
                className="inline-block px-6 py-3 font-semibold rounded-lg border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-orange-100 transition text-center"
              >
                Add to Firefox
              </a> */}
            </div>
          </div>

          <div className={cn("w-full", !isPlaying && "cursor-pointer")}>
            <video
              ref={videoRef}
              controls
              className="w-full rounded-md shadow-lg"
              preload="metadata"
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
            >
              <source src="/demo.mp4#t=16" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </Container>
    </section>
  );
}
