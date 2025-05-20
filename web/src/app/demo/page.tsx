import { Header } from "@/components/landing-page/header";
import { Footer } from "@/components/landing-page/footer";

export default function DemoPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center bg-gray-50 min-h-screen pt-32 pb-16">
        <section className="w-[90%] max-w-[900px] mx-auto mb-16">
          <h1 className="text-4xl font-bold text-center mb-8">
            Demo: Placeholder Prices
          </h1>
          <p className="text-lg text-gray-700 text-center mb-10">
            This page contains a variety of placeholder prices in USD. Use it to
            test the Opportunity Cost extension’s ability to detect and convert
            prices to Bitcoin satoshis. Prices appear in different formats,
            contexts, and HTML elements.
          </p>

          <Section title="Headings with Prices">
            <h3>Special Offer: $19.99</h3>
            <h4>Annual Plan: $100/year</h4>
            <h5>Monthly Subscription: $12/mo</h5>
            <h6>Flash Sale: $0.99!</h6>
          </Section>

          <Section title="Paragraphs with Prices">
            <p className="mb-4">
              Get this amazing product for just $49.99! Or subscribe for only
              $5/mo. Our premium plan is $199 per year. Limited time deal:
              $0.10. Super saver: $1,299.99. Try our service for $2.99. Upgrade
              for $1000.00. Donate $0.01 to support us!{" "}
              <b>Win the lottery: $500 million.</b>{" "}
              <b>Super Bowl Ad: $7,000,000.</b>
            </p>
            <p>
              Some more prices: $3.50, $7.77, $123,456.78, $8.88, $42, $420,
              $69.69, $1000, $999, $15.95, $4.20, $6.66, $11.11, $1234, $5678,
              $9.99, $25, $50, $75, $100, $250, $500, $750, $1000, $5000,
              $10000, $25000, $50000, $100000, $250000, $500000, $1000000,{" "}
              <b>$34,000,000,000,000 (US National Debt)</b>,{" "}
              <b>$100 trillion (Global GDP)</b>.
            </p>
          </Section>

          <Section title="Unordered List of Prices">
            <ul className="list-disc ml-8 space-y-1">
              {[
                "Basic: $5.00",
                "Standard: $10.00",
                "Premium: $20.00",
                "Enterprise: $100.00",
                "Trial: $0.50",
                "Micro: $0.05",
                "Mini: $0.25",
                "Starter: $0.75",
                "Pro: $1.00",
                "Elite: $2.50",
                "First-Class Flight: $12,000",
                "Lamborghini: $250,000",
                "Kickstarter Pledge: $1,000",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Ordered List of Prices">
            <ol className="list-decimal ml-8 space-y-1">
              {[
                "$1.00",
                "$2.00",
                "$3.00",
                "$4.00",
                "$5.00",
                "$10.00",
                "$20.00",
                "$50.00",
                "$100.00",
                "$1000.00",
                "Charity Donation: $50,000",
                "SpaceX Launch: $62,000,000",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </Section>

          <Section title="Table of Prices">
            <table className="w-full text-left border mt-4 mb-8 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">Item</th>
                  <th className="border px-4 py-2">Price</th>
                  <th className="border px-4 py-2">Subscription</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Widget", "$15.00", "$1/mo"],
                  ["Gadget", "$99.99", "$10/mo"],
                  ["Pro Plan", "$500.00", "$50/mo"],
                  ["Enterprise", "$10,000.00", "$1000/mo"],
                  ["Legacy", "$0.99", "$10/year"],
                  ["Luxury Watch", "$75,000", "$1,200/year"],
                  ["Mars Ticket", "$500,000,000", "N/A"],
                ].map(([item, price, sub]) => (
                  <tr key={item}>
                    <td className="border px-4 py-2">{item}</td>
                    <td className="border px-4 py-2">{price}</td>
                    <td className="border px-4 py-2">{sub}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Miscellaneous Prices">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {[
                "$0.01",
                "$0.10",
                "$1,000,000.00",
                "$10,000,000.00",
                "$100,000,000.00",
                "$1/day",
                "$5/day",
                "$10/day",
                "$20/day",
                "$50/day",
                "$100/day",
                "$500/day",
                "$1000/day",
                "$10000/day",
                "$100000/day",
                "$1/week",
                "$5/week",
                "$10/week",
                "$20/week",
                "$50/week",
                "$100/week",
                "$500/week",
                "$1000/week",
                "$10000/week",
                "$100000/week",
                "$1/quarter",
                "$5/quarter",
                "$10/quarter",
                "$20/quarter",
                "$50/quarter",
                "$100/quarter",
                "$500/quarter",
                "$1000/quarter",
                "$10000/quarter",
                "$100000/quarter",
                "Avocado Toast: $8.00",
                "Concert Ticket: $120",
                "Cup of Coffee: $4.50",
              ].map((val) => (
                <div key={val}>{val}</div>
              ))}
            </div>
          </Section>

          <Section title="Long List of Prices">
            <div className="flex flex-wrap gap-2">
              {[
                "$1.00",
                "$2.00",
                "$3.00",
                // ...abbreviated for brevity
                "$100000000.00",
              ].map((price) => (
                <span
                  key={price}
                  className="inline-block bg-white rounded px-2 py-1 border text-sm mb-1"
                >
                  {price}
                </span>
              ))}
            </div>
          </Section>
        </section>

        <section className="w-[90%] max-w-[900px] mx-auto mb-16 mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Diverse & Creative Price Scenarios
          </h2>
          <p className="text-gray-700 text-center mb-6">
            These examples showcase the extension’s ability to handle large
            numbers, salaries, subscriptions, travel, donations, and creative
            scenarios.
          </p>
          {[
            {
              heading: "Large Numbers",
              items: [
                "US National Debt: $34,000,000,000,000",
                "Global GDP: $100 trillion",
                "Startup Valuation: $1,200,000,000",
                "Lottery Jackpot: $500 million",
                "Super Bowl Ad: $7,000,000",
              ],
            },
            {
              heading: "Salaries & Wages",
              items: [
                "Software Engineer Salary: $120,000/year",
                "Minimum Wage: $15/hour",
                "Freelancer Rate: $2,500/week",
                "Executive Bonus: $5,000,000",
              ],
            },
            {
              heading: "Subscriptions & Recurring Payments",
              items: [
                "Netflix: $15/month",
                "Spotify: $9.99/mo",
                "Car Insurance: $1,200/year",
                "Gym Membership: $50/month",
              ],
            },
            {
              heading: "Travel & Luxury Purchases",
              items: [
                "First-Class Flight: $12,000",
                "Lamborghini: $250,000",
                "Luxury Watch: $75,000",
                "Yacht: $1,000,000",
                "Ticket to Mars: $500,000,000",
              ],
            },
            {
              heading: "Donations & Crowdfunding",
              items: [
                "Charity Donation: $50,000",
                "Kickstarter Pledge: $1,000",
                "Disaster Relief Fund: $10,000,000",
              ],
            },
            {
              heading: "Creative & Everyday Examples",
              items: [
                "Cup of Coffee: $4.50",
                "Avocado Toast: $8.00",
                "Concert Ticket: $120",
                "Super Bowl Ad: $7,000,000",
                "SpaceX Launch: $62,000,000",
              ],
            },
          ].map((section) => (
            <div key={section.heading}>
              <h3 className="text-xl font-bold mt-6 mb-2">{section.heading}</h3>
              <ul className="list-disc ml-8 mb-4 text-gray-800">
                {section.items.map((item) => (
                  <li key={item}>
                    {item.includes(":") ? (
                      <>
                        {item.split(":")[0]}:{" "}
                        <span className="font-semibold">
                          {item.split(":")[1].trim()}
                        </span>
                      </>
                    ) : (
                      item
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="mt-8 text-gray-600 text-center">
            These prices appear in different formats and contexts to help you
            test the full power of the Opportunity Cost extension.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
