"use client";
import Image from "next/image";

export function About() {
  return (
    <section id="about" className="py-20">
      <div className="w-[90%] max-w-[1200px] mx-auto px-5">
        <h2 className="text-3xl font-bold text-center mb-10">
          About Opportunity Cost
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-xl font-bold mb-4">Why We Built This</h3>
            <p className="mb-4 text-gray-600">
              Opportunity Cost was created to help people better understand the
              value of their money in terms of Bitcoin. In an era of inflation
              and monetary uncertainty, Bitcoin provides a different perspective
              on value.
            </p>
            <p className="mb-4 text-gray-600">
              Our mission is to help everyone think in terms of Bitcoin&apos;s
              sound money principles, making the transition to a Bitcoin
              standard more intuitive for everyday purchases.
            </p>
            <p className="mb-0 text-gray-600">
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
              className="mx-auto mb-5"
            />
            <p className="text-gray-600">
              Powered by{" "}
              <a
                href="https://tftc.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline"
              >
                Truth For The Commoner (TFTC)
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
