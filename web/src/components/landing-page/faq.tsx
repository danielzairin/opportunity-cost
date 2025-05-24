"use client";

import { Container } from "../ui/container";

export function FAQ() {
  return (
    <section id="faq" className="bg-neutral-50 py-20">
      <Container>
        <h2 className="text-3xl text-foreground font-bold mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-[var(--primary)] text-lg font-bold mb-2">
              Is the extension free to use?
            </h3>
            <p className="text-muted-foreground mb-0">
              Yes, Opportunity Cost is completely free and open source.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-[var(--primary)] text-lg font-bold mb-2">
              How does it get the Bitcoin price?
            </h3>
            <p className="text-muted-foreground mb-0">
              The extension fetches the current Bitcoin price from reputable
              cryptocurrency APIs and caches it to minimize API calls.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-[var(--primary)] text-lg font-bold mb-2">
              Does it collect my browsing data?
            </h3>
            <p className="text-muted-foreground mb-0">
              No. Opportunity Cost runs entirely in your browser and
              doesn&apos;t send your browsing data to any remote servers. Your
              privacy is respected.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-[var(--primary)] text-lg font-bold mb-2">
              Which currencies are supported?
            </h3>
            <p className="text-muted-foreground mb-0">
              Currently, we support USD, with EUR and GBP coming soon. More
              currencies will be added in future updates.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-[var(--primary)] text-lg font-bold mb-2">
              Will it slow down my browsing?
            </h3>
            <p className="text-muted-foreground mb-0">
              No, the extension is designed to be lightweight and only runs when
              currency values are detected on a page.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-[var(--primary)] text-lg font-bold mb-2">
              How do I customize the extension?
            </h3>
            <p className="text-muted-foreground mb-0">
              Click on the extension icon in your browser toolbar and select
              &quot;Options&quot; to customize settings like display mode and
              denomination preference.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
