import "@/index.css";

// --- Header ---
function Header() {
  return (
    <header className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <img src="icons/logo.svg" alt="TFTC Logo" className="h-8 mr-2" />
        <span className="font-bold text-lg text-orange-500">
          Opportunity Cost
        </span>
      </div>
      <a
        href="options.html"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-500 hover:underline"
      >
        Settings
      </a>
    </header>
  );
}

// --- Live Price ---
function LivePrice() {
  // TODO: Fetch and display live BTC price and last update time
  return (
    <section className="mb-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold">BTC Price:</span>
        <span className="text-lg font-mono">$XX,XXX.XX</span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
        <span>Last updated: --:--</span>
        <button className="hover:underline">Refresh</button>
      </div>
    </section>
  );
}

// --- Converter ---
function Converter() {
  // TODO: Implement fiat <-> sats/BTC converter with user preferences
  return (
    <section className="mb-4">
      <div className="flex flex-col gap-2">
        <input
          type="number"
          className="w-full p-2 border rounded"
          placeholder="Enter amount (USD)"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">=</span>
          <span className="font-mono font-bold">0 sats</span>
        </div>
        <button className="text-xs text-blue-500 hover:underline self-end">
          Switch direction
        </button>
      </div>
    </section>
  );
}

// --- Recent Conversions ---
function RecentConversions() {
  // TODO: Fetch and display recent conversions from storage
  return (
    <section className="mb-4">
      <div className="font-semibold mb-1">Recent Conversions</div>
      <ul className="text-xs text-gray-700 space-y-1">
        <li>No recent conversions.</li>
        {/* Example: <li>Amazon.com - $25 → 75,000 sats (2h ago)</li> */}
      </ul>
      <div className="flex justify-between mt-1">
        <button className="text-xs text-gray-400 hover:underline">Clear</button>
        <a
          href="options.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline"
        >
          More
        </a>
      </div>
    </section>
  );
}

// --- Quick Settings ---
function QuickSettings() {
  // TODO: Wire up to user preferences and storage
  return (
    <section className="mb-4">
      <div className="flex flex-col gap-2">
        <label className="inline-flex items-center text-xs">
          <input type="checkbox" className="mr-2" /> Auto-refresh prices
        </label>
        <label className="inline-flex items-center text-xs">
          <input type="checkbox" className="mr-2" /> Track conversion statistics
        </label>
      </div>
    </section>
  );
}

// --- Call To Action ---
function CallToAction() {
  return (
    <section className="mb-2 text-center">
      <a
        href="https://tftc.io/bitcoin-brief"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1 px-3 rounded"
      >
        Subscribe to Bitcoin Brief
      </a>
    </section>
  );
}

// --- Footer ---
function Footer() {
  return (
    <footer className="text-center text-xs text-gray-400 mt-2">
      <span>
        &copy; 2025 Opportunity Cost &middot; Powered by{" "}
        <a
          href="https://tftc.io"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-gray-500"
        >
          TFTC
        </a>
      </span>
    </footer>
  );
}

// --- Main IndexPage ---
export function IndexPage() {
  return (
    <div className="w-80 p-4 bg-gray-50 min-h-screen font-sans">
      <Header />
      <LivePrice />
      <Converter />
      <RecentConversions />
      <QuickSettings />
      <CallToAction />
      <Footer />
    </div>
  );
}
