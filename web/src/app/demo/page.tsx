import { Header } from "@/components/landing-page/header";
import { Footer } from "@/components/landing-page/footer";

export default function DemoPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center bg-gray-50 min-h-screen pt-32 pb-16">
        <section className="w-[90%] max-w-[900px] mx-auto mb-16">
          <h1 className="text-4xl font-bold text-center mb-8">
            Demo: Financial Figures
          </h1>
          <p className="text-lg text-gray-700 text-center mb-10">
            This page contains a variety of financial figures in USD. Use it to
            test the Opportunity Cost extension’s ability to detect and convert
            financial data to Bitcoin satoshis. Figures appear in different
            formats, contexts, and HTML elements.
          </p>

          <Section title="Government Budgets">
            <h3>Defense Budget: $750 billion</h3>
            <h4>Education Funding: $100 billion/year</h4>
            <h5>Healthcare Spending: $3.8 trillion</h5>
            <h6>Infrastructure Investment: $1.2 trillion!</h6>
            <br />
            <h6>Bitcoin Price: $1.5M</h6>
            <h6>Bitcoin Price: $1.5m</h6>
            <h6>Bitcoin Price: $1.5k</h6>
            <h6>Bitcoin Price: $15B</h6>
          </Section>

          <Section title="Economic Indicators">
            <p className="mb-4">
              The GDP growth rate is projected at 3.5%. Inflation is currently
              at 2.1%. The unemployment rate stands at 5.5%. The national debt
              is $28 trillion. The federal reserve interest rate is 0.25%. The
              trade deficit is $678 billion. The stock market index is at 35,000
              points.
            </p>
            <p>
              More figures: $1.5 trillion stimulus, $2.3 trillion
              infrastructure, $900 billion relief package, $500 billion defense,
              $300 billion education, $200 billion healthcare, $100 billion
              renewable energy, $50 billion technology grants, $25 billion small
              business loans, $10 billion disaster relief, $5 billion
              cybersecurity, $1 billion space exploration.
            </p>
          </Section>

          <Section title="Unordered List of Financial Programs">
            <ul className="list-disc ml-8 space-y-1">
              {[
                "Social Security: $1 trillion",
                "Medicare: $800 billion",
                "Medicaid: $600 billion",
                "Veterans Affairs: $200 billion",
                "NASA: $25 billion",
                "FEMA: $15 billion",
                "CDC: $10 billion",
                "EPA: $8 billion",
                "IRS: $12 billion",
                "FBI: $9 billion",
                "CIA: $15 billion",
                "NSA: $10 billion",
                "USDA: $150 billion",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Ordered List of Tax Revenues">
            <ol className="list-decimal ml-8 space-y-1">
              {[
                "$3 trillion",
                "$2.5 trillion",
                "$2 trillion",
                "$1.5 trillion",
                "$1 trillion",
                "$500 billion",
                "$250 billion",
                "$100 billion",
                "$50 billion",
                "$10 billion",
                "Corporate Tax: $300 billion",
                "Income Tax: $1.5 trillion",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </Section>

          <Section title="Table of Government Expenditures">
            <table className="w-full text-left border mt-4 mb-8 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">Department</th>
                  <th className="border px-4 py-2">Expenditure</th>
                  <th className="border px-4 py-2">Annual Growth</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Defense", "$750 billion", "2%"],
                  ["Education", "$100 billion", "3%"],
                  ["Healthcare", "$3.8 trillion", "5%"],
                  ["Infrastructure", "$1.2 trillion", "4%"],
                  ["Energy", "$150 billion", "6%"],
                  ["Transportation", "$100 billion", "3%"],
                  ["Agriculture", "$150 billion", "2%"],
                ].map(([item, price, growth]) => (
                  <tr key={item}>
                    <td className="border px-4 py-2">{item}</td>
                    <td className="border px-4 py-2">{price}</td>
                    <td className="border px-4 py-2">{growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Miscellaneous Financial Data">
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

          <Section title="Long List of Financial Figures">
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
            Government & Economic Scenarios
          </h2>
          <p className="text-gray-700 text-center mb-6">
            These examples showcase the extension’s ability to handle large
            government budgets, economic indicators, and financial scenarios.
          </p>
          {[
            {
              heading: "National Budgets",
              items: [
                "US National Debt: $34,000,000,000,000",
                "Global GDP: $100 trillion",
                "Federal Reserve Balance Sheet: $8 trillion",
                "Defense Budget: $750 billion",
                "Education Funding: $100 billion",
                "Healthcare Spending: $3.8 trillion",
                "Infrastructure Investment: $1.2 trillion",
              ],
            },
            {
              heading: "Economic Indicators",
              items: [
                "GDP Growth Rate: 3.5%",
                "Inflation Rate: 2.1%",
                "Unemployment Rate: 5.5%",
                "Interest Rate: 0.25%",
              ],
            },
            {
              heading: "Tax Revenues",
              items: [
                "Income Tax: $1.5 trillion",
                "Corporate Tax: $300 billion",
                "Sales Tax: $500 billion",
                "Property Tax: $200 billion",
              ],
            },
            {
              heading: "Government Programs",
              items: [
                "Social Security: $1 trillion",
                "Medicare: $800 billion",
                "Medicaid: $600 billion",
                "Veterans Affairs: $200 billion",
              ],
            },
            {
              heading: "Public Investments",
              items: [
                "Renewable Energy: $150 billion",
                "Technology Grants: $50 billion",
                "Small Business Loans: $25 billion",
              ],
            },
            {
              heading: "Miscellaneous Financial Data",
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
            These figures appear in different formats and contexts to help you
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
