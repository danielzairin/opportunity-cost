import React, { useState } from "react";

export function OptionsPage() {
  // State for form fields
  const [defaultCurrency, setDefaultCurrency] = useState("usd");
  const [displayMode, setDisplayMode] = useState("dual-display");
  const [denomination, setDenomination] = useState("btc");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [trackStats, setTrackStats] = useState(true);
  const [saveMessage, setSaveMessage] = useState(false);

  // Dummy data for sites table
  const sites = [
    { website: "amazon.com", lastVisit: "2024-06-01", conversions: 12 },
    { website: "ebay.com", lastVisit: "2024-06-02", conversions: 5 },
  ];

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 2000);
  };

  // Handle clear data
  const handleClearData = () => {
    // Clear logic here
    alert("All data cleared!");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-800 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <img
            src="icons/tftc/tftc-logo.png"
            alt="TFTC Logo"
            className="h-10 mr-4"
          />
          <h1 className="text-3xl font-bold text-orange-500 border-b-2 border-orange-500 pb-2 m-0">
            Opportunity Cost Options
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 mb-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <form id="settings-form" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="default-currency" className="block mb-2 font-bold">
              Default Currency:
            </label>
            <select
              id="default-currency"
              name="defaultCurrency"
              className="w-full p-2 rounded border border-gray-300"
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
            >
              <option value="usd">US Dollar (USD)</option>
              <option value="eur" disabled>
                Euro (EUR) - Coming Soon
              </option>
              <option value="gbp" disabled>
                British Pound (GBP) - Coming Soon
              </option>
              <option value="jpy" disabled>
                Japanese Yen (JPY) - Coming Soon
              </option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="display-mode" className="block mb-2 font-bold">
              Display Mode:
            </label>
            <select
              id="display-mode"
              name="displayMode"
              className="w-full p-2 rounded border border-gray-300"
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value)}
            >
              <option value="dual-display">Dual Display (Sats | Fiat)</option>
              <option value="sats-only">Satoshis Only</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="denomination" className="block mb-2 font-bold">
              Bitcoin Denomination:
            </label>
            <select
              id="denomination"
              name="denomination"
              className="w-full p-2 rounded border border-gray-300"
              value={denomination}
              onChange={(e) => setDenomination(e.target.value)}
            >
              <option value="sats">Satoshis (sats)</option>
              <option value="btc">Bitcoin (BTC)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="inline-flex items-center font-bold">
              <input
                type="checkbox"
                id="auto-refresh"
                name="autoRefresh"
                className="mr-2"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh prices every 15 minutes
            </label>
          </div>

          <div className="mb-4">
            <label className="inline-flex items-center font-bold">
              <input
                type="checkbox"
                id="track-stats"
                name="trackStats"
                className="mr-2"
                checked={trackStats}
                onChange={(e) => setTrackStats(e.target.checked)}
              />
              Track conversion statistics
            </label>
          </div>

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded mt-2"
          >
            Save Settings
          </button>
          {saveMessage && (
            <span className="text-green-600 font-bold ml-4">
              Settings saved!
            </span>
          )}
        </form>
      </div>

      <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 mt-8 text-center">
        <h3 className="text-lg font-semibold mb-2">
          Stay Updated with Bitcoin News
        </h3>
        <p className="mb-4">
          Subscribe to the Bitcoin Brief newsletter from TFTC to get the latest
          Bitcoin updates, market analysis, and insights delivered to your
          inbox.
        </p>
        <a
          href="https://tftc.io/bitcoin-brief"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded inline-block"
        >
          Subscribe to Bitcoin Brief
        </a>
      </div>

      <div className="bg-white rounded-lg p-6 my-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Price History</h2>
        <div className="w-full h-72 flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-300">
          <span className="text-gray-400">Loading price history data...</span>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 mb-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Visited Sites Statistics</h2>
        <div className="overflow-x-auto">
          <p className="mb-2">
            Sites where Opportunity Cost has converted prices:
          </p>
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr>
                <th className="bg-gray-100 px-4 py-2 border-b">Website</th>
                <th className="bg-gray-100 px-4 py-2 border-b">Last Visit</th>
                <th className="bg-gray-100 px-4 py-2 border-b">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {sites.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-8">
                    No data available.
                  </td>
                </tr>
              ) : (
                sites.map((site, idx) => (
                  <tr
                    key={site.website}
                    className={idx % 2 === 0 ? "bg-gray-50" : ""}
                  >
                    <td className="px-4 py-2 border-b">{site.website}</td>
                    <td className="px-4 py-2 border-b">{site.lastVisit}</td>
                    <td className="px-4 py-2 border-b">{site.conversions}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button
          onClick={handleClearData}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Clear All Data
        </button>
      </div>

      <div className="mt-10 text-center text-gray-500 text-sm">
        <p>
          Opportunity Cost Extension &copy; 2025 | Powered by{" "}
          <a
            href="https://tftc.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:underline"
          >
            Truth For The Commoner (TFTC)
          </a>
        </p>
      </div>
    </div>
  );
}
