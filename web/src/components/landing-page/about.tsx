"use client";

import { UTM_PARAMS } from "@/constants";
import Image from "next/image";
import { Container } from "../ui/container";

export function About() {
  return (
    <section id="about" className="py-20">
      <Container>
        <h2 className="text-3xl text-foreground font-bold mb-6">
          About Opportunity Cost
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-xl font-light text-foreground mb-2">
              Why We Built This
            </h3>
            <p className="mb-2 text-muted-foreground">
              Opportunity Cost was created to help people better understand the
              value of their money in terms of Bitcoin. In an era of inflation
              and monetary uncertainty, Bitcoin provides a different perspective
              on value.
            </p>
            <p className="mb-2 text-muted-foreground">
              Our mission is to help everyone think in terms of Bitcoin&apos;s
              sound money principles, making the transition to a Bitcoin
              standard more intuitive for everyday purchases.
            </p>
            <p className="text-muted-foreground">
              The extension is built with privacy and performance in mind,
              running entirely in your browser with no data collection.
            </p>
          </div>
          <div className="text-center">
            <Image
              src="/images/tftc-logo.png"
              alt="TFTC Logo"
              width={120}
              height={120}
              className="mx-auto mb-5 dark:invert transition-all duration-300"
            />
            <p className="text-muted-foreground">
              Powered by{" "}
              <a
                href={`https://tftc.io${UTM_PARAMS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline transition-colors duration-200"
              >
                Truth For The Commoner (TFTC)
              </a>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
