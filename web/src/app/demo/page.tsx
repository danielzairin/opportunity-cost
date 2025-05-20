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
            test the Opportunity Cost extension&apos;s ability to detect and
            convert prices to Bitcoin satoshis. Prices appear in different
            formats, contexts, and HTML elements.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">
            Headings with Prices
          </h2>
          <h3>Special Offer: $19.99</h3>
          <h4>Annual Plan: $100/year</h4>
          <h5>Monthly Subscription: $12/mo</h5>
          <h6>Flash Sale: $0.99!</h6>

          <h2 className="text-2xl font-semibold mt-10 mb-4">
            Paragraphs with Prices
          </h2>
          <p>
            Get this amazing product for just $49.99! Or subscribe for only
            $5/mo. Our premium plan is $199 per year. Limited time deal: $0.10.
            Super saver: $1,299.99. Try our service for $2.99. Upgrade for
            $1000.00. Donate $0.01 to support us!
          </p>
          <p>
            Some more prices: $3.50, $7.77, $123,456.78, $8.88, $42, $420,
            $69.69, $1000, $999, $15.95, $4.20, $6.66, $11.11, $1234, $5678,
            $9.99, $25, $50, $75, $100, $250, $500, $750, $1000, $5000, $10000,
            $25000, $50000, $100000, $250000, $500000, $1000000.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">
            Unordered List of Prices
          </h2>
          <ul className="list-disc ml-8">
            <li>Basic: $5.00</li>
            <li>Standard: $10.00</li>
            <li>Premium: $20.00</li>
            <li>Enterprise: $100.00</li>
            <li>Trial: $0.50</li>
            <li>Micro: $0.05</li>
            <li>Mini: $0.25</li>
            <li>Starter: $0.75</li>
            <li>Pro: $1.00</li>
            <li>Elite: $2.50</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4">
            Ordered List of Prices
          </h2>
          <ol className="list-decimal ml-8">
            <li>$1.00</li>
            <li>$2.00</li>
            <li>$3.00</li>
            <li>$4.00</li>
            <li>$5.00</li>
            <li>$10.00</li>
            <li>$20.00</li>
            <li>$50.00</li>
            <li>$100.00</li>
            <li>$1000.00</li>
          </ol>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Table of Prices</h2>
          <table className="w-full text-left border mt-4 mb-8">
            <thead>
              <tr>
                <th className="border px-4 py-2">Item</th>
                <th className="border px-4 py-2">Price</th>
                <th className="border px-4 py-2">Subscription</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">Widget</td>
                <td className="border px-4 py-2">$15.00</td>
                <td className="border px-4 py-2">$1/mo</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Gadget</td>
                <td className="border px-4 py-2">$99.99</td>
                <td className="border px-4 py-2">$10/mo</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Pro Plan</td>
                <td className="border px-4 py-2">$500.00</td>
                <td className="border px-4 py-2">$50/mo</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Enterprise</td>
                <td className="border px-4 py-2">$10,000.00</td>
                <td className="border px-4 py-2">$1000/mo</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Legacy</td>
                <td className="border px-4 py-2">$0.99</td>
                <td className="border px-4 py-2">$10/year</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-2xl font-semibold mt-10 mb-4">
            Miscellaneous Prices
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>$0.01</div>
            <div>$0.10</div>
            <div>$1,000,000.00</div>
            <div>$10,000,000.00</div>
            <div>$100,000,000.00</div>
            <div>$1/day</div>
            <div>$5/day</div>
            <div>$10/day</div>
            <div>$20/day</div>
            <div>$50/day</div>
            <div>$100/day</div>
            <div>$500/day</div>
            <div>$1000/day</div>
            <div>$10000/day</div>
            <div>$100000/day</div>
            <div>$1/week</div>
            <div>$5/week</div>
            <div>$10/week</div>
            <div>$20/week</div>
            <div>$50/week</div>
            <div>$100/week</div>
            <div>$500/week</div>
            <div>$1000/week</div>
            <div>$10000/week</div>
            <div>$100000/week</div>
            <div>$1/quarter</div>
            <div>$5/quarter</div>
            <div>$10/quarter</div>
            <div>$20/quarter</div>
            <div>$50/quarter</div>
            <div>$100/quarter</div>
            <div>$500/quarter</div>
            <div>$1000/quarter</div>
            <div>$10000/quarter</div>
            <div>$100000/quarter</div>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">
            Long List of Prices
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              "$1.00",
              "$2.00",
              "$3.00",
              "$4.00",
              "$5.00",
              "$6.00",
              "$7.00",
              "$8.00",
              "$9.00",
              "$10.00",
              "$11.00",
              "$12.00",
              "$13.00",
              "$14.00",
              "$15.00",
              "$16.00",
              "$17.00",
              "$18.00",
              "$19.00",
              "$20.00",
              "$21.00",
              "$22.00",
              "$23.00",
              "$24.00",
              "$25.00",
              "$26.00",
              "$27.00",
              "$28.00",
              "$29.00",
              "$30.00",
              "$31.00",
              "$32.00",
              "$33.00",
              "$34.00",
              "$35.00",
              "$36.00",
              "$37.00",
              "$38.00",
              "$39.00",
              "$40.00",
              "$41.00",
              "$42.00",
              "$43.00",
              "$44.00",
              "$45.00",
              "$46.00",
              "$47.00",
              "$48.00",
              "$49.00",
              "$50.00",
              "$51.00",
              "$52.00",
              "$53.00",
              "$54.00",
              "$55.00",
              "$56.00",
              "$57.00",
              "$58.00",
              "$59.00",
              "$60.00",
              "$61.00",
              "$62.00",
              "$63.00",
              "$64.00",
              "$65.00",
              "$66.00",
              "$67.00",
              "$68.00",
              "$69.00",
              "$70.00",
              "$71.00",
              "$72.00",
              "$73.00",
              "$74.00",
              "$75.00",
              "$76.00",
              "$77.00",
              "$78.00",
              "$79.00",
              "$80.00",
              "$81.00",
              "$82.00",
              "$83.00",
              "$84.00",
              "$85.00",
              "$86.00",
              "$87.00",
              "$88.00",
              "$89.00",
              "$90.00",
              "$91.00",
              "$92.00",
              "$93.00",
              "$94.00",
              "$95.00",
              "$96.00",
              "$97.00",
              "$98.00",
              "$99.00",
              "$100.00",
              "$101.00",
              "$102.00",
              "$103.00",
              "$104.00",
              "$105.00",
              "$106.00",
              "$107.00",
              "$108.00",
              "$109.00",
              "$110.00",
              "$111.00",
              "$112.00",
              "$113.00",
              "$114.00",
              "$115.00",
              "$116.00",
              "$117.00",
              "$118.00",
              "$119.00",
              "$120.00",
              "$121.00",
              "$122.00",
              "$123.00",
              "$124.00",
              "$125.00",
              "$126.00",
              "$127.00",
              "$128.00",
              "$129.00",
              "$130.00",
              "$131.00",
              "$132.00",
              "$133.00",
              "$134.00",
              "$135.00",
              "$136.00",
              "$137.00",
              "$138.00",
              "$139.00",
              "$140.00",
              "$141.00",
              "$142.00",
              "$143.00",
              "$144.00",
              "$145.00",
              "$146.00",
              "$147.00",
              "$148.00",
              "$149.00",
              "$150.00",
              "$175.00",
              "$200.00",
              "$225.00",
              "$250.00",
              "$275.00",
              "$300.00",
              "$325.00",
              "$350.00",
              "$375.00",
              "$400.00",
              "$425.00",
              "$450.00",
              "$475.00",
              "$500.00",
              "$525.00",
              "$550.00",
              "$575.00",
              "$600.00",
              "$625.00",
              "$650.00",
              "$675.00",
              "$700.00",
              "$725.00",
              "$750.00",
              "$775.00",
              "$800.00",
              "$825.00",
              "$850.00",
              "$875.00",
              "$900.00",
              "$925.00",
              "$950.00",
              "$975.00",
              "$1000.00",
              "$1500.00",
              "$2000.00",
              "$2500.00",
              "$3000.00",
              "$3500.00",
              "$4000.00",
              "$4500.00",
              "$5000.00",
              "$5500.00",
              "$6000.00",
              "$6500.00",
              "$7000.00",
              "$7500.00",
              "$8000.00",
              "$8500.00",
              "$9000.00",
              "$9500.00",
              "$10000.00",
              "$15000.00",
              "$20000.00",
              "$25000.00",
              "$30000.00",
              "$35000.00",
              "$40000.00",
              "$45000.00",
              "$50000.00",
              "$100000.00",
              "$250000.00",
              "$500000.00",
              "$1000000.00",
              "$1,000,000.00",
              "$10,000,000.00",
              "$100,000,000.00",
            ].map((price) => (
              <span
                key={price}
                className="inline-block bg-white rounded px-2 py-1 border text-sm mb-1"
              >
                {price}
              </span>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
