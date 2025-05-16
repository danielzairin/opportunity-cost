import { useEffect, useState } from "react";
import {
  PriceDatabase,
  type PriceRecord,
  type SiteRecord,
} from "../lib/storage";
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "../lib/constants";

export function OptionsPage() {
  // State for form fields
  const [defaultCurrency, setDefaultCurrency] = useState(DEFAULT_CURRENCY);
  const [displayMode, setDisplayMode] = useState<
    "bitcoin-only" | "dual-display"
  >("dual-display");
  const [denomination, setDenomination] = useState<"btc" | "sats">("btc");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [trackStats, setTrackStats] = useState(true);
  const [saveMessage, setSaveMessage] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Price history state
  const [priceHistory, setPriceHistory] = useState<PriceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Visited sites state
  const [sites, setSites] = useState<SiteRecord[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [sitesError, setSitesError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      setLoadingSettings(true);
      setSettingsError(null);
      try {
        const preferences = await PriceDatabase.getPreferences();
        setDefaultCurrency(preferences.defaultCurrency || DEFAULT_CURRENCY);
        setDisplayMode(preferences.displayMode || "dual-display");
        setDenomination(preferences.denomination || "btc");
        setAutoRefresh(preferences.autoRefresh !== false); // default true
        setTrackStats(preferences.trackStats !== false); // default true
      } catch {
        setSettingsError("Error loading settings");
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  // Load price history on mount
  useEffect(() => {
    async function loadPriceHistory() {
      setLoadingHistory(true);
      setHistoryError(null);
      try {
        const endTime = Date.now();
        const startTime = endTime - 7 * 24 * 60 * 60 * 1000; // 7 days
        const history = await PriceDatabase.getPriceHistory(
          "usd",
          startTime,
          endTime
        );
        // Sort by timestamp descending, show up to 10
        history.sort(
          (a: PriceRecord, b: PriceRecord) => b.timestamp - a.timestamp
        );
        setPriceHistory(history.slice(0, 10));
      } catch {
        setHistoryError("Error loading price history");
      } finally {
        setLoadingHistory(false);
      }
    }
    loadPriceHistory();
  }, []);

  // Load visited sites on mount
  useEffect(() => {
    async function loadVisitedSites() {
      setLoadingSites(true);
      setSitesError(null);
      try {
        const visited = await PriceDatabase.getVisitedSites();
        visited.sort(
          (a: SiteRecord, b: SiteRecord) => b.timestamp - a.timestamp
        );
        setSites(visited);
      } catch {
        setSitesError("Error loading visited sites");
      } finally {
        setLoadingSites(false);
      }
    }
    loadVisitedSites();
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await PriceDatabase.savePreferences({
        defaultCurrency,
        displayMode,
        denomination,
        autoRefresh,
        trackStats,
      });
      // Notify background script that preferences have been updated
      chrome.runtime.sendMessage({ action: "preferencesUpdated" });
      setSaveMessage(true);
      setTimeout(() => setSaveMessage(false), 2000);
    } catch {
      alert("There was an error saving your settings. Please try again.");
    }
  };

  // Handle clear data
  const handleClearData = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all saved data? This action cannot be undone."
      )
    )
      return;
    try {
      await PriceDatabase.db.clear("priceHistory");
      await PriceDatabase.db.clear("visitedSites");
      await PriceDatabase.savePreferences({
        id: "user-preferences",
        defaultCurrency: "usd",
        displayMode: "dual-display",
        denomination: "btc",
        autoRefresh: true,
        trackStats: true,
        lastUpdated: Date.now(),
      });
      // Reload all data
      window.location.reload();
    } catch {
      alert("There was an error clearing the data. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-800 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <img src="icons/logo.svg" alt="TFTC Logo" className="h-10 mr-4" />
          <h1 className="text-xl font-bold text-gray-900">Opportunity Cost</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 mb-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        {loadingSettings ? (
          <div className="text-gray-400">Loading settings...</div>
        ) : settingsError ? (
          <div className="text-red-500">{settingsError}</div>
        ) : (
          <form id="settings-form" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="default-currency"
                className="block mb-2 font-bold"
              >
                Default Currency:
              </label>
              <select
                id="default-currency"
                name="defaultCurrency"
                className="w-full p-2 rounded border border-gray-300"
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.name} ({currency.value.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="denomination" className="block mb-2 font-bold">
                Bitcoin Denomination:
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Choose how Bitcoin amounts are displayed. Example: (100 sats |
                $1) or (1 BTC | $100k)
              </p>
              <select
                id="denomination"
                name="denomination"
                className="w-full p-2 rounded border border-gray-300"
                value={denomination}
                onChange={(e) =>
                  setDenomination(e.target.value as "btc" | "sats")
                }
              >
                <option value="sats">Satoshis (sats)</option>
                <option value="btc">Bitcoin (BTC)</option>
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
                onChange={(e) =>
                  setDisplayMode(
                    e.target.value as "bitcoin-only" | "dual-display"
                  )
                }
              >
                <option value="dual-display">
                  Dual Display (Fiat | {denomination === "btc" ? "BTC" : "sats"}
                  )
                </option>
                <option value="bitcoin-only">
                  {denomination === "btc" ? "Bitcoin" : "Satoshis"} Only
                </option>
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
              className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white font-bold py-2 px-4 rounded mt-2"
            >
              Save Settings
            </button>
            {saveMessage && (
              <span className="text-green-600 font-bold ml-4">
                Settings saved!
              </span>
            )}
          </form>
        )}
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
          href="https://tftc.io/bitcoin-brief?utm_source=opportunity-cost-extension"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded inline-block"
        >
          Subscribe to Bitcoin Brief
        </a>
      </div>

      <div className="bg-white rounded-lg p-6 my-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Price History</h2>
        {loadingHistory ? (
          <div className="text-gray-400">Loading price history data...</div>
        ) : historyError ? (
          <div className="text-red-500">{historyError}</div>
        ) : priceHistory.length === 0 ? (
          <div className="empty-state">
            No price history data available yet. The extension will collect data
            as you browse.
          </div>
        ) : (
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr>
                <th className="bg-gray-100 px-4 py-2 border-b">Date</th>
                <th className="bg-gray-100 px-4 py-2 border-b">Time</th>
                <th className="bg-gray-100 px-4 py-2 border-b">
                  BTC Price (USD)
                </th>
              </tr>
            </thead>
            <tbody>
              {priceHistory.map((entry, idx) => {
                const date = new Date(entry.timestamp);
                return (
                  <tr
                    key={entry.timestamp}
                    className={idx % 2 === 0 ? "bg-gray-50" : ""}
                  >
                    <td className="px-4 py-2 border-b">
                      {date.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {date.toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2 border-b">
                      $
                      {entry.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-lg p-6 mb-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Visited Sites Statistics</h2>
        <div className="overflow-x-auto">
          <p className="mb-2">
            Sites where Opportunity Cost has converted prices:
          </p>
          {loadingSites ? (
            <div className="text-gray-400">Loading visited sites...</div>
          ) : sitesError ? (
            <div className="text-red-500">{sitesError}</div>
          ) : (
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr>
                  <th className="bg-gray-100 px-4 py-2 border-b">Website</th>
                  <th className="bg-gray-100 px-4 py-2 border-b">Last Visit</th>
                  <th className="bg-gray-100 px-4 py-2 border-b">
                    Conversions
                  </th>
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
                  sites.map((site: SiteRecord, idx: number) => {
                    let displayUrl = site.url;
                    try {
                      const urlObj = new URL(site.url);
                      displayUrl =
                        urlObj.hostname +
                        (urlObj.pathname !== "/" ? urlObj.pathname : "");
                    } catch {
                      // console.error("Error parsing URL:", site.url);
                    }
                    const date = new Date(site.timestamp);
                    return (
                      <tr
                        key={site.url + site.timestamp}
                        className={idx % 2 === 0 ? "bg-gray-50" : ""}
                      >
                        <td className="px-4 py-2 border-b">{displayUrl}</td>
                        <td className="px-4 py-2 border-b">
                          {date.toLocaleDateString()}{" "}
                          {date.toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-2 border-b">
                          {site.conversionCount}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
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
