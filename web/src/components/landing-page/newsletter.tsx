"use client";

import { UTM_PARAMS } from "@/constants";

export function Newsletter() {
  return (
    <section className="bg-[var(--primary)] text-white text-center py-16">
      <div className="w-[90%] max-w-[1200px] mx-auto px-5">
        <h2 className="text-3xl font-bold mb-4 text-white">Stay Updated</h2>
        <p className="max-w-2xl mx-auto mb-8 text-lg text-white">
          Sign up for the Bitcoin Brief newsletter from TFTC to get the latest
          Bitcoin news, market analysis, and Opportunity Cost updates.
        </p>
        <a
          href={`https://tftc.io/bitcoin-brief${UTM_PARAMS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 font-semibold rounded-lg bg-white text-[var(--primary)] border-2 border-white hover:bg-transparent hover:text-white transition"
        >
          Subscribe to Bitcoin Brief
        </a>
      </div>
    </section>
  );
}
