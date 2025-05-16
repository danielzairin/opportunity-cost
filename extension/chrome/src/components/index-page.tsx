import React, { useEffect, useState } from "react";
import "@/index.css";
import { PriceDatabase, type SiteRecord } from "../lib/storage";
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "../lib/constants";

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
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [supportedCurrencies, setSupportedCurrencies] =
    useState<typeof SUPPORTED_CURRENCIES>(SUPPORTED_CURRENCIES);

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await new Promise<{
        prices?: Record<string, number>;
        currency?: string;
        supportedCurrencies?: typeof SUPPORTED_CURRENCIES;
        error?: string;
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action: "getAllBitcoinPrices" },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response?.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });

      if (response?.prices) {
        setPrices(response.prices);
        setSupportedCurrencies(
          response.supportedCurrencies || SUPPORTED_CURRENCIES
        );
        setCurrency(response.currency || DEFAULT_CURRENCY);
        setLastUpdated(new Date());
      } else {
        throw new Error("Invalid price data received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch price");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  // Format currency symbol based on currency code
  const getCurrencySymbol = (currencyCode: string) => {
    const found = supportedCurrencies.find((c) => c.value === currencyCode);
    return found ? found.symbol : "$";
  };

  return (
    <section className="mb-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold">BTC Price:</span>
        {loading ? (
          <span className="text-lg font-mono text-gray-400">Loading...</span>
        ) : error ? (
          <span className="text-sm text-red-500">Error: {error}</span>
        ) : (
          <span className="text-lg font-mono">
            {getCurrencySymbol(currency)}
            {prices[currency]?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
        <span>
          Last updated:{" "}
          {lastUpdated ? lastUpdated.toLocaleTimeString() : "--:--"}
        </span>
        <button
          className="hover:underline cursor-pointer"
          onClick={fetchPrices}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </section>
  );
}

// --- Converter ---
function Converter() {
  const [fiatAmount, setFiatAmount] = useState<string>("");
  const [btcAmount, setBtcAmount] = useState<string>("");
  const [lastEdited, setLastEdited] = useState<"fiat" | "btc">("fiat");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [localDenomination, setLocalDenomination] = useState<"sats" | "btc">(
    "sats"
  );
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [supportedCurrencies, setSupportedCurrencies] =
    useState<typeof SUPPORTED_CURRENCIES>(SUPPORTED_CURRENCIES);

  // Constants
  const SATS_IN_BTC = 100_000_000;

  useEffect(() => {
    // Fetch BTC prices and preferences
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await new Promise<{
          prices?: Record<string, number>;
          currency?: string;
          supportedCurrencies?: typeof SUPPORTED_CURRENCIES;
          error?: string;
        }>((resolve, reject) => {
          chrome.runtime.sendMessage(
            { action: "getAllBitcoinPrices" },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else if (response?.error) {
                reject(new Error(response.error));
              } else {
                resolve(response);
              }
            }
          );
        });

        if (response?.prices) {
          setPrices(response.prices);
          setSupportedCurrencies(
            response.supportedCurrencies || SUPPORTED_CURRENCIES
          );
          setCurrency(response.currency || DEFAULT_CURRENCY);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convert fiat to Bitcoin
  const convertFiatToBtc = (fiatValue: number): string => {
    const price = prices[currency];
    if (!price) return "";

    const inBtc = fiatValue / price;

    // Format based on local denomination (BTC or sats)
    if (localDenomination === "sats") {
      const inSats = Math.round(inBtc * SATS_IN_BTC);
      return inSats.toString();
    } else {
      // Format BTC with appropriate decimals
      if (inBtc < 0.000001) {
        return inBtc.toFixed(8);
      } else if (inBtc < 0.0001) {
        return inBtc.toFixed(6);
      } else {
        return inBtc.toFixed(5);
      }
    }
  };

  // Convert Bitcoin to fiat
  const convertBtcToFiat = (btcValue: number): string => {
    const price = prices[currency];
    if (!price) return "";

    // If value is in sats, convert to BTC first
    const inBtc =
      localDenomination === "sats" ? btcValue / SATS_IN_BTC : btcValue;

    // Calculate and format fiat value
    const fiatValue = inBtc * price;
    return fiatValue.toFixed(2);
  };

  // Handle fiat input change
  const handleFiatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFiatAmount(value);
    setLastEdited("fiat");

    if (prices[currency]) {
      try {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setBtcAmount(convertFiatToBtc(numValue));
        } else {
          setBtcAmount("");
        }
      } catch {
        setBtcAmount("");
      }
    }
  };

  // Handle BTC input change
  const handleBtcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBtcAmount(value);
    setLastEdited("btc");

    if (prices[currency]) {
      try {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setFiatAmount(convertBtcToFiat(numValue));
        } else {
          setFiatAmount("");
        }
      } catch {
        setFiatAmount("");
      }
    }
  };

  // Toggle between BTC and sats
  const toggleDenomination = () => {
    const newDenomination = localDenomination === "btc" ? "sats" : "btc";
    setLocalDenomination(newDenomination);

    // Recalculate the Bitcoin amount if we have a value
    if (btcAmount) {
      try {
        const numValue = parseFloat(btcAmount);
        if (!isNaN(numValue)) {
          if (newDenomination === "sats" && localDenomination === "btc") {
            // Convert from BTC to sats
            setBtcAmount(String(Math.round(numValue * SATS_IN_BTC)));
          } else if (
            newDenomination === "btc" &&
            localDenomination === "sats"
          ) {
            // Convert from sats to BTC
            const inBtc = numValue / SATS_IN_BTC;
            if (inBtc < 0.000001) {
              setBtcAmount(inBtc.toFixed(8));
            } else if (inBtc < 0.0001) {
              setBtcAmount(inBtc.toFixed(6));
            } else {
              setBtcAmount(inBtc.toFixed(5));
            }
          }
        }
      } catch {
        // Keep existing value on error
      }
    }
  };

  // Handle currency selection
  const handleCurrencySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = e.target.value;
    setCurrency(selectedCurrency);

    // Recalculate based on last edited field
    if (lastEdited === "fiat" && fiatAmount) {
      try {
        const numValue = parseFloat(fiatAmount);
        if (!isNaN(numValue)) {
          setBtcAmount(convertFiatToBtc(numValue));
        }
      } catch {
        // Keep existing value on error
      }
    } else if (lastEdited === "btc" && btcAmount) {
      try {
        const numValue = parseFloat(btcAmount);
        if (!isNaN(numValue)) {
          setFiatAmount(convertBtcToFiat(numValue));
        }
      } catch {
        // Keep existing value on error
      }
    }
  };

  // Format currency symbol based on currency code
  const getCurrencySymbol = (currencyCode: string) => {
    const found = supportedCurrencies.find((c) => c.value === currencyCode);
    return found ? found.symbol : "$";
  };

  const currencyCode = currency.toUpperCase();
  const currencySymbol = getCurrencySymbol(currency);
  const bitcoinUnit = localDenomination === "sats" ? "sats" : "BTC";

  // List of available denominations
  const denominations = [
    { value: "sats", label: "Satoshis (sats)" },
    { value: "btc", label: "Bitcoin (BTC)" },
  ];

  return (
    <section className="mb-4">
      <div>
        {/* Top Panel - Fiat Currency */}
        <div className="bg-white border border-gray-200 bg-opacity-90 p-3 mb-1 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-gray-800 text-md font-medium">Fiat</h2>
            <select
              className="text-xs text-right cursor-pointer"
              value={currency}
              onChange={handleCurrencySelect}
              disabled={loading}
            >
              {supportedCurrencies.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <span className="absolute left-0 top-0 text-gray-400 text-lg">
              {currencySymbol}
            </span>
            <input
              type="number"
              className="bg-transparent text-gray-800 text-lg w-full border-none focus:outline-none focus:ring-0 pl-4"
              placeholder="0"
              value={fiatAmount}
              onChange={handleFiatChange}
              disabled={loading || !prices[currency]}
            />
          </div>
        </div>

        {/* Arrow Button */}
        <div className="flex justify-center relative">
          <button className="absolute font-bold -mt-4 rounded-xl bg-gray-200 flex items-center justify-center size-7 border-4 border-white">
            ↓
          </button>
        </div>

        {/* Bottom Panel - Bitcoin */}
        <div className="bg-gray-100 p-3 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-md font-medium">Bitcoin</h2>
            <select
              className="text-xs text-right cursor-pointer"
              value={localDenomination}
              onChange={(e) => {
                setLocalDenomination(e.target.value as "sats" | "btc");
                toggleDenomination();
              }}
              disabled={loading}
            >
              {denominations.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <input
              type="number"
              className="bg-transparent text-lg w-full border-none focus:outline-none focus:ring-0 pr-10"
              placeholder="0"
              value={btcAmount}
              onChange={handleBtcChange}
              disabled={loading || !prices[currency]}
            />
            <span className="absolute right-0 top-0 text-gray-400 text-lg">
              {bitcoinUnit}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Recent Conversions ---
function RecentConversions() {
  const [sites, setSites] = useState<SiteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversions = async () => {
      setLoading(true);
      setError(null);
      try {
        const visited = await PriceDatabase.getVisitedSites();
        // Sort by timestamp descending, get the most recent 5
        visited.sort((a, b) => b.timestamp - a.timestamp);
        setSites(visited.slice(0, 5));
      } catch (err) {
        setError("Failed to load recent conversions");
        console.error("Error loading visited sites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversions();
  }, []);

  const clearConversions = async () => {
    try {
      await PriceDatabase.db.clear("visitedSites");
      setSites([]);
    } catch (err) {
      setError("Failed to clear conversions");
      console.error("Error clearing sites:", err);
    }
  };

  // Format time ago from timestamp
  const timeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Format URL for display
  const formatUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  return (
    <section className="mb-4">
      <div className="font-semibold mb-1">Recent Conversions</div>
      {loading ? (
        <div className="text-xs text-gray-400">Loading conversions...</div>
      ) : error ? (
        <div className="text-xs text-red-500">{error}</div>
      ) : (
        <ul className="text-xs text-gray-700 space-y-1">
          {sites.length === 0 ? (
            <li>No recent conversions.</li>
          ) : (
            sites.map((site) => (
              <li key={site.url + site.timestamp}>
                {formatUrl(site.url)} - {site.conversionCount} conversions (
                {timeAgo(site.timestamp)})
              </li>
            ))
          )}
        </ul>
      )}
      <div className="flex justify-between mt-1">
        <button
          className="text-xs text-gray-400 hover:underline"
          onClick={clearConversions}
          disabled={loading || sites.length === 0}
        >
          Clear
        </button>
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
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [trackStats, setTrackStats] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true);
      try {
        const preferences = await PriceDatabase.getPreferences();
        setAutoRefresh(preferences.autoRefresh !== false);
        setTrackStats(preferences.trackStats !== false);
      } catch (err) {
        console.error("Error loading preferences:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleAutoRefreshChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setAutoRefresh(checked);

    try {
      await PriceDatabase.savePreferences({
        autoRefresh: checked,
      });
      chrome.runtime.sendMessage({ action: "preferencesUpdated" });
      setSaveStatus("Saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error("Error saving auto-refresh preference:", err);
      setSaveStatus("Failed to save");
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const handleTrackStatsChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setTrackStats(checked);

    try {
      await PriceDatabase.savePreferences({
        trackStats: checked,
      });
      chrome.runtime.sendMessage({ action: "preferencesUpdated" });
      setSaveStatus("Saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error("Error saving track stats preference:", err);
      setSaveStatus("Failed to save");
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  return (
    <section className="mb-4">
      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="text-xs text-gray-400">Loading settings...</div>
        ) : (
          <>
            <label className="inline-flex items-center text-xs cursor-pointer">
              <input
                type="checkbox"
                className="mr-2"
                checked={autoRefresh}
                onChange={handleAutoRefreshChange}
                disabled={loading}
              />
              Auto-refresh prices
            </label>
            <label className="inline-flex items-center text-xs cursor-pointer">
              <input
                type="checkbox"
                className="mr-2"
                checked={trackStats}
                onChange={handleTrackStatsChange}
                disabled={loading}
              />
              Track conversion statistics
            </label>
            {saveStatus && (
              <div className="text-xs text-green-500">{saveStatus}</div>
            )}
          </>
        )}
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
    <div className="w-80 p-4 bg-white min-h-screen font-sans">
      <Header />
      <LivePrice />
      <Converter />
      {/* <RecentConversions /> */}
      <QuickSettings />
      <CallToAction />
      <Footer />
    </div>
  );
}
