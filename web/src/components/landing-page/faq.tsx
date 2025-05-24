"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "../ui/container";

const faqItems = [
  {
    question: "Is the extension free to use?",
    answer: "Yes, Opportunity Cost is completely free and open source.",
  },
  {
    question: "How does it get the Bitcoin price?",
    answer:
      "The extension fetches the current Bitcoin price from our own cache server which we source from CoinGecko.",
  },
  {
    question: "Does it collect my browsing data?",
    answer:
      "No. Opportunity Cost runs entirely in your browser and doesn't send your browsing data to any remote servers. Your privacy is respected.",
  },
  {
    question: "Which currencies are supported?",
    answer:
      "We support 10 currencies: US Dollar, Euro, British Pound, Japanese Yen, Chinese Yuan, Indian Rupee, Canadian Dollar, Australian Dollar, Swiss Franc, and Singapore Dollar.",
  },
  {
    question: "Will it slow down my browsing?",
    answer:
      "No, the extension is designed to be lightweight and only runs when currency values are detected on a page.",
  },
  {
    question: "How do I customize the extension?",
    answer:
      "Click on the extension icon in your browser toolbar, then click the three dots in the upper right corner to customize settings like display mode and denomination preference.",
  },
  {
    question: "Where can I submit feedback or report issues?",
    answer: (
      <>
        You can submit feedback, report bugs, or request features on our{" "}
        <a
          href="https://opportunitycost.userjot.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-oc-primary hover:text-oc-primary/80 underline"
        >
          feedback page
        </a>{" "}
        or{" "}
        <a
          href="https://github.com/TFTC-Holdings-Inc/opportunity-cost"
          target="_blank"
          rel="noopener noreferrer"
          className="text-oc-primary hover:text-oc-primary/80 underline"
        >
          GitHub repository
        </a>
        . We welcome all contributions and suggestions from the community.
      </>
    ),
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-muted/30 py-20">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl text-foreground font-bold mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-semibold text-foreground">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-lg">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}
