import { useEffect, useState } from "react";
import { PriceDatabase, type PriceRecord } from "../lib/storage";
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "../lib/constants";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent } from "./ui/tooltip";

// Theme types for more flexibility
type ThemeMode = "system" | "light" | "dark";

export function OptionsPage() {
  // State for form fields
  const [defaultCurrency, setDefaultCurrency] = useState(DEFAULT_CURRENCY);
  const [displayMode, setDisplayMode] = useState<"bitcoin-only" | "dual-display">("dual-display");
  const [denomination, setDenomination] = useState<"btc" | "sats" | "dynamic">("btc");
  const [highlightBitcoinValue, sethighlightBitcoinValue] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [darkMode, setDarkMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Price history state
  const [priceHistory, setPriceHistory] = useState<PriceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Function to detect system theme preference
  const getSystemThemePreference = (): boolean => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  // Function to apply theme based on preference
  const applyTheme = (mode: ThemeMode, systemIsDark?: boolean) => {
    const isDark =
      mode === "dark" ||
      (mode === "system" && (systemIsDark !== undefined ? systemIsDark : getSystemThemePreference()));

    setDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (themeMode === "system") {
        applyTheme("system", e.matches);
      }
    };

    // Modern browsers
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [themeMode]);

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
        sethighlightBitcoinValue(preferences.highlightBitcoinValue === true); // default false

        // Load theme preference
        const savedTheme = preferences.themeMode || "system";
        setThemeMode(savedTheme as ThemeMode);

        // Apply theme based on preference
        applyTheme(savedTheme as ThemeMode);
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
        const history = await PriceDatabase.getPriceHistory("usd", startTime, endTime);
        // Sort by timestamp descending, show up to 10
        history.sort((a: PriceRecord, b: PriceRecord) => b.timestamp - a.timestamp);
        setPriceHistory(history.slice(0, 10));
      } catch {
        setHistoryError("Error loading price history");
      } finally {
        setLoadingHistory(false);
      }
    }
    loadPriceHistory();
  }, []);

  // Handle theme change
  const handleThemeChange = (newTheme: ThemeMode) => {
    setThemeMode(newTheme);
    applyTheme(newTheme);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await PriceDatabase.savePreferences({
        defaultCurrency,
        displayMode,
        denomination,
        highlightBitcoinValue,
        darkMode,
        themeMode,
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
    if (!window.confirm("Are you sure you want to clear all saved data? This action cannot be undone.")) return;
    try {
      await PriceDatabase.db.clear("priceHistory");
      await PriceDatabase.savePreferences({
        id: "user-preferences",
        defaultCurrency: "usd",
        displayMode: "dual-display",
        denomination: "btc",
        themeMode,
        lastUpdated: Date.now(),
      });
      // Reload all data
      window.location.reload();
    } catch {
      alert("There was an error clearing the data. Please try again.");
    }
  };

  return (
    <div
      className={`mx-auto max-w-3xl p-6 text-gray-800 dark:text-gray-200 ${darkMode ? "dark bg-gray-900" : "bg-gray-50"} min-h-screen`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <img src="icons/logo.svg" alt="TFTC Logo" className="mr-4 h-10" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Opportunity Cost</h1>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">Settings</h2>
        {loadingSettings ? (
          <div className="text-gray-400 dark:text-gray-500">Loading settings...</div>
        ) : settingsError ? (
          <div className="text-red-500">{settingsError}</div>
        ) : (
          <form id="settings-form" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="default-currency" className="mb-2 block font-bold dark:text-gray-300">
                Default Currency:
              </label>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                The currency that will be converted to Bitcoin.
              </p>
              <select
                id="default-currency"
                name="defaultCurrency"
                className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
              <label htmlFor="denomination" className="mb-2 block font-bold dark:text-gray-300">
                Bitcoin Denomination:
              </label>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                Choose how to display Bitcoin values (sats or BTC).
              </p>
              <select
                id="denomination"
                name="denomination"
                className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={denomination}
                onChange={(e) => setDenomination(e.target.value as "btc" | "sats" | "dynamic")}
              >
                <option value="sats">Satoshis (sats)</option>
                <option value="btc">Bitcoin (BTC)</option>
                <option value="dynamic">Dynamic BTC/Sats</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="display-mode" className="mb-2 block font-bold dark:text-gray-300">
                Display Mode:
              </label>
              <select
                id="display-mode"
                name="displayMode"
                className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value as "bitcoin-only" | "dual-display")}
              >
                <option value="dual-display">Dual Display (Fiat | {denomination === "btc" ? "BTC" : "sats"})</option>
                <option value="bitcoin-only">{denomination === "btc" ? "Bitcoin" : "Satoshis"} Only</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="theme-mode" className="mb-2 block font-bold dark:text-gray-300">
                Theme:
              </label>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                Choose between light, dark, or system theme.
              </p>
              <select
                id="theme-mode"
                name="themeMode"
                className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={themeMode}
                onChange={(e) => handleThemeChange(e.target.value as ThemeMode)}
              >
                <option value="system">System Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="inline-flex items-center font-bold dark:text-gray-300">
                <input
                  type="checkbox"
                  id="highlight-bitcoin-value"
                  name="highlightBitcoinValue"
                  className="mr-2"
                  checked={highlightBitcoinValue}
                  onChange={(e) => sethighlightBitcoinValue(e.target.checked)}
                />
                Highlight Bitcoin values
              </label>
              <p className="mb-2 ml-5 text-sm text-gray-600 dark:text-gray-400">
                Adds a colored background to Bitcoin values.
              </p>
            </div>

            <Button type="submit" variant="default">
              Save Settings
            </Button>
            {saveMessage && <span className="ml-4 font-bold text-green-600 dark:text-green-400">Settings saved!</span>}
          </form>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-100 p-6 text-center dark:border-gray-600 dark:bg-gray-700">
        <h3 className="mb-2 text-lg font-semibold dark:text-white">Stay Updated with Bitcoin News</h3>
        <p className="mb-4 dark:text-gray-300">
          Subscribe to the Bitcoin Brief newsletter from TFTC to get the latest Bitcoin updates, market analysis, and
          insights delivered to your inbox.
        </p>
        <Button variant="default" asChild>
          <a
            href="https://tftc.io/bitcoin-brief?utm_source=opportunity-cost-extension"
            target="_blank"
            rel="noopener noreferrer"
          >
            Subscribe to Bitcoin Brief
          </a>
        </Button>
      </div>

      <div className="my-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="mb-4 text-xl font-semibold dark:text-white">Bitcoin Price History</h2>
          {priceHistory.length > 0 && (
            <Button size="sm" variant="outline" onClick={handleClearData}>
              Clear Price History
            </Button>
          )}
        </div>
        {loadingHistory ? (
          <div className="text-gray-400 dark:text-gray-500">Loading price history data...</div>
        ) : historyError ? (
          <div className="text-red-500">{historyError}</div>
        ) : priceHistory.length === 0 ? (
          <div className="empty-state dark:text-gray-400">No price history data available yet.</div>
        ) : (
          <table className="min-w-full border border-gray-200 dark:border-gray-600">
            <thead>
              <tr>
                <th className="border-b bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="border-b bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  Time
                </th>
                <th className="border-b bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
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
                    className={idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "dark:bg-gray-800"}
                  >
                    <td className="border-b px-4 py-2 dark:border-gray-600 dark:text-gray-300">
                      {date.toLocaleDateString()}
                    </td>
                    <td className="border-b px-4 py-2 dark:border-gray-600 dark:text-gray-300">
                      {date.toLocaleTimeString()}
                    </td>
                    <td className="border-b px-4 py-2 dark:border-gray-600 dark:text-gray-300">
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

      <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          &copy; 2025 Opportunity Cost &middot; Powered by{" "}
          <a
            href="https://tftc.io?utm_source=opportunity-cost-extension"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:underline dark:text-gray-300"
          >
            TFTC
          </a>
        </p>
        <p>
          <a
            href="https://www.opportunitycost.app/privacy-policy?utm_source=opportunity-cost-extension"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Privacy
          </a>{" "}
          &middot;{" "}
          <a
            href="https://opportunitycost.userjot.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Feedback
          </a>
        </p>
      </div>

      {/* Add tooltip for dynamic option */}
      <Tooltip delayDuration={700}>
        <TooltipContent>Dynamic mode switches between BTC and sats based on the value.</TooltipContent>
      </Tooltip>
    </div>
  );
}
