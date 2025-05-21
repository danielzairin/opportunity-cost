import React, { useEffect, useState, useRef } from "react";
import "@/index.css";
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY, APP_URL } from "../lib/constants";
import { cn } from "@/lib/utils";
import Cleave from "cleave.js/react";
import { PriceDatabase } from "../lib/storage";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Ellipsis, ExternalLink, Bitcoin, PaintbrushVertical, Link, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

// Custom event name for display mode changes
const DISPLAY_MODE_CHANGE_EVENT = "display-mode-change";

// --- Header ---
function Header() {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(APP_URL);
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
    }, 1000);
  };

  return (
    <header className="mb-2 flex items-center gap-x-0.5">
      <a href={APP_URL} target="_blank" className="mr-auto flex items-center">
        <img src="icons/logo.svg" alt="TFTC Logo" className="mr-2 h-8" />
        <span className="text-foreground text-lg font-bold">Opportunity Cost</span>
      </a>

      <TooltipProvider>
        <Tooltip delayDuration={700}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={handleCopyLink}
              className="size-8 rounded p-0 hover:bg-gray-100 focus:outline-none"
            >
              {linkCopied ? <Check className="size-4" /> : <Link className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{linkCopied ? "Link copied" : "Copy link"}</TooltipContent>
        </Tooltip>

        <Settings />
      </TooltipProvider>
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
  const [extensionEnabled, setExtensionEnabled] = useState(true);
  const [supportedCurrencies, setSupportedCurrencies] = useState<typeof SUPPORTED_CURRENCIES>(SUPPORTED_CURRENCIES);

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
        chrome.runtime.sendMessage({ action: "getAllBitcoinPrices" }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response?.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        });
      });

      if (response?.prices) {
        setPrices(response.prices);
        setSupportedCurrencies(response.supportedCurrencies || SUPPORTED_CURRENCIES);
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

    // Listen for extension enabled/disabled changes
    const handleDisplayModeChange = (event: CustomEvent) => {
      if (event.detail.enabled !== undefined) {
        setExtensionEnabled(event.detail.enabled);
      }
    };

    document.addEventListener(DISPLAY_MODE_CHANGE_EVENT, handleDisplayModeChange as EventListener);

    // Load initial enabled state
    const loadPreferences = async () => {
      try {
        const preferences = await PriceDatabase.getPreferences();
        setExtensionEnabled(preferences.enabled !== false);
      } catch (error) {
        console.error("Error loading extension enabled state:", error);
      }
    };

    loadPreferences();

    return () => {
      document.removeEventListener(DISPLAY_MODE_CHANGE_EVENT, handleDisplayModeChange as EventListener);
    };
  }, []);

  // Format currency symbol based on currency code
  const getCurrencySymbol = (currencyCode: string) => {
    const found = supportedCurrencies.find((c) => c.value === currencyCode);
    return found ? found.symbol : "$";
  };

  // Toggle extension enabled/disabled state
  const toggleExtensionEnabled = async () => {
    const newEnabledState = !extensionEnabled;
    setExtensionEnabled(newEnabledState);
    try {
      await PriceDatabase.savePreferences({ enabled: newEnabledState });
      chrome.runtime.sendMessage({ action: "preferencesUpdated" });
      // Notify other components about the enabled state change
      document.dispatchEvent(
        new CustomEvent(DISPLAY_MODE_CHANGE_EVENT, {
          detail: { enabled: newEnabledState },
        }),
      );
    } catch (error) {
      console.error("Error saving extension enabled state:", error);
    }
  };

  return (
    <section className="mb-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold">BTC Price:</span>
        {loading ? (
          <span className="font-mono text-lg text-gray-400">Loading...</span>
        ) : error ? (
          <span className="text-sm text-red-500">Error: {error}</span>
        ) : !extensionEnabled ? (
          <span className="font-mono text-lg text-gray-400">Extension Disabled</span>
        ) : (
          <span className="font-mono text-xl">
            {getCurrencySymbol(currency)}
            {prices[currency]?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        )}
      </div>
      <div
        className={cn(
          "flex items-center text-[10px] text-gray-400",
          !extensionEnabled ? "justify-end" : "justify-between",
        )}
      >
        <button
          className={cn("hover:underline", !extensionEnabled && "text-oc-primary")}
          onClick={toggleExtensionEnabled}
        >
          {extensionEnabled ? "Disable Extension" : "Enable Extension"}
        </button>
        {extensionEnabled && (
          <span>
            Last updated:{" "}
            {lastUpdated ? lastUpdated.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "--:--"}
          </span>
        )}
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
  const [localDenomination, setLocalDenomination] = useState<"sats" | "btc">("sats");
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [supportedCurrencies, setSupportedCurrencies] = useState<typeof SUPPORTED_CURRENCIES>(SUPPORTED_CURRENCIES);
  const [showTooltip, setShowTooltip] = useState(false);
  const [focusedPanel, setFocusedPanel] = useState<"fiat" | "btc" | null>(null);
  const tooltipTimeout = useRef<number | null>(null);

  // Refs for input elements
  const fiatInputRef = React.useRef<HTMLInputElement>(null);
  const btcInputRef = React.useRef<HTMLInputElement>(null);

  // Constants
  const SATS_IN_BTC = 100_000_000;

  // Tooltip event handlers
  const handleMouseEnter = () => {
    tooltipTimeout.current = window.setTimeout(() => {
      setShowTooltip(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeout.current) {
      window.clearTimeout(tooltipTimeout.current);
      tooltipTimeout.current = null;
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (tooltipTimeout.current) {
        window.clearTimeout(tooltipTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    // Focus the fiat input after the component mounts and prices are loaded
    if (!loading && prices[currency] && fiatInputRef.current) {
      // Small timeout to ensure DOM is fully rendered
      setTimeout(() => {
        fiatInputRef.current?.focus();
      }, 100);
    }
  }, [loading, prices, currency]);

  // Load initial display mode and listen for changes
  useEffect(() => {
    // Load user preferences for display mode and denomination
    const loadPreferences = async () => {
      try {
        const preferences = await PriceDatabase.getPreferences();
        // setDisplayMode(preferences.displayMode || "dual-display");
        setLocalDenomination(preferences.denomination || "sats");
        // Check if extension is disabled
        if (preferences.enabled === false) {
          setLoading(true); // Disable inputs by setting loading state
        }
      } catch (error) {
        console.error("Error loading display mode:", error);
      }
    };

    // Event handler for display mode changes from Settings component
    const handleDisplayModeChange = (event: CustomEvent) => {
      if (event.detail.denomination) {
        setLocalDenomination(event.detail.denomination);
      }

      // Handle extension enabled/disabled state changes
      if (event.detail.enabled !== undefined) {
        setLoading(!event.detail.enabled);
      }
    };

    // Add event listener
    document.addEventListener(DISPLAY_MODE_CHANGE_EVENT, handleDisplayModeChange as EventListener);

    // Load initial preferences
    loadPreferences();

    // Clean up event listener
    return () => {
      document.removeEventListener(DISPLAY_MODE_CHANGE_EVENT, handleDisplayModeChange as EventListener);
    };
  }, []);

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
          chrome.runtime.sendMessage({ action: "getAllBitcoinPrices" }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response?.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          });
        });

        if (response?.prices) {
          setPrices(response.prices);
          setSupportedCurrencies(response.supportedCurrencies || SUPPORTED_CURRENCIES);
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
    const inBtc = localDenomination === "sats" ? btcValue / SATS_IN_BTC : btcValue;

    // Calculate fiat value
    const fiatValue = inBtc * price;

    // Return as a clean number string - Cleave will handle the formatting
    return fiatValue.toFixed(2);
  };

  // Handle fiat input change
  const handleFiatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // For Cleave component, access numeric value from the raw value
    const inputElement = e.target as HTMLInputElement & { rawValue?: string };
    const value = inputElement.rawValue || inputElement.value;
    setFiatAmount(value);
    setLastEdited("fiat");
    setFocusedPanel("fiat");

    if (prices[currency]) {
      try {
        // Parse the value removing any commas
        const cleanValue = value.replace(/,/g, "");
        const numValue = parseFloat(cleanValue);
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
    // For Cleave component, access numeric value from the raw value
    const inputElement = e.target as HTMLInputElement & { rawValue?: string };
    const value = inputElement.rawValue || inputElement.value;
    setBtcAmount(value);
    setLastEdited("btc");
    setFocusedPanel("btc");

    if (prices[currency]) {
      try {
        // Parse the value removing any commas
        const cleanValue = value.replace(/,/g, "");
        const numValue = parseFloat(cleanValue);
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
          } else if (newDenomination === "btc" && localDenomination === "sats") {
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

  // Toggle input focus and last edited state
  const toggleDirectionAndFocus = () => {
    // Toggle last edited state
    const newLastEdited = lastEdited === "fiat" ? "btc" : "fiat";
    setLastEdited(newLastEdited);

    // Focus the appropriate input
    if (newLastEdited === "fiat" && fiatInputRef.current) {
      fiatInputRef.current.focus();
    } else {
      document.getElementById("btc-input")?.focus();
    }
  };

  // Format currency symbol based on currency code
  const getCurrencySymbol = (currencyCode: string) => {
    const found = supportedCurrencies.find((c) => c.value === currencyCode);
    return found ? found.symbol : "$";
  };

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
        <div className="mb-2 text-sm font-bold">Currency Converter</div>

        <div
          className={cn(
            "mb-1 cursor-text rounded-xl border border-gray-300 bg-white bg-opacity-90 px-3 py-2 transition-opacity",
            focusedPanel === "fiat" && "border-gray-500",
          )}
          onClick={(e) => {
            // Prevent focusing when clicking on select
            if (
              e.target instanceof HTMLSelectElement ||
              (e.target instanceof HTMLElement && e.target.closest("select"))
            ) {
              return;
            }
            fiatInputRef.current?.focus();
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="fiat-input" className="text-md pointer-events-none font-medium text-gray-800">
              Fiat
            </label>
            <select
              className="text-right text-xs"
              value={currency}
              onChange={handleCurrencySelect}
              onClick={(e) => e.stopPropagation()}
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
            <label htmlFor="fiat-input" className="absolute left-0 top-0 text-lg text-gray-300">
              {currencySymbol}
            </label>
            <Cleave
              id="fiat-input"
              className="w-full border-none bg-transparent pl-4 text-lg text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-0"
              placeholder={`${currency.toUpperCase()}`}
              value={fiatAmount}
              onChange={handleFiatChange}
              onFocus={() => {
                setLastEdited("fiat");
                setFocusedPanel("fiat");
              }}
              onBlur={() => {
                if (focusedPanel === "fiat") setFocusedPanel(null);
              }}
              disabled={loading || !prices[currency]}
              options={{
                numeral: true,
                numeralThousandsGroupStyle: "thousand",
                numeralDecimalScale: 2,
                numeralPositiveOnly: false,
              }}
              htmlRef={(el) => (fiatInputRef.current = el)}
            />
          </div>
        </div>

        {/* Arrow Button */}
        <div className="relative flex justify-center">
          <div className="absolute">
            <button
              onClick={toggleDirectionAndFocus}
              className={cn(
                "-mt-4 flex size-7 select-none items-center justify-center rounded-xl border-4 border-white bg-gray-100 font-bold transition-transform duration-300 ease-in-out",
                lastEdited === "btc" && "rotate-180",
              )}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              ↓
            </button>

            <div
              className={cn(
                "pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-800 px-2 py-1 text-xs text-white opacity-100 transition-all duration-200",
                showTooltip
                  ? "pointer-events-auto -translate-y-2 opacity-100"
                  : "pointer-events-none translate-y-0 opacity-0",
              )}
            >
              {lastEdited === "fiat" ? "Converting Fiat to Bitcoin" : "Converting Bitcoin to Fiat"}
            </div>
          </div>
        </div>

        {/* Bottom Panel - Bitcoin */}
        <div
          className={cn(
            "cursor-text rounded-xl border border-gray-100 bg-gray-100 px-3 py-2",
            focusedPanel === "btc" && "border-gray-500",
          )}
          onClick={(e) => {
            // Prevent focusing when clicking on select
            if (
              e.target instanceof HTMLSelectElement ||
              (e.target instanceof HTMLElement && e.target.closest("select"))
            ) {
              return;
            }
            btcInputRef.current?.focus();
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="btc-input" className="text-md pointer-events-none font-medium text-gray-800">
              Bitcoin
            </label>
            <select
              id="denomination-select"
              className="text-right text-xs"
              value={localDenomination}
              onClick={(e) => e.stopPropagation()}
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
            <Cleave
              id="btc-input"
              className="w-full border-none bg-transparent pr-10 text-lg placeholder:text-gray-300 focus:outline-none focus:ring-0"
              placeholder="0"
              value={btcAmount}
              onChange={handleBtcChange}
              onFocus={() => {
                setLastEdited("btc");
                setFocusedPanel("btc");
              }}
              onBlur={() => {
                if (focusedPanel === "btc") setFocusedPanel(null);
              }}
              disabled={loading || !prices[currency]}
              options={{
                numeral: true,
                numeralThousandsGroupStyle: "thousand",
                numeralDecimalScale: 8,
                numeralPositiveOnly: false,
              }}
              htmlRef={(el) => (btcInputRef.current = el)}
            />
            <label htmlFor="btc-input" className="pointer-events-none absolute right-0 top-0 text-lg text-gray-300">
              {bitcoinUnit}
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Settings ---
function Settings() {
  const [showSettings, setShowSettings] = useState(false);
  const [denomination, setDenomination] = useState<"sats" | "btc">("sats");
  const [displayMode, setDisplayMode] = useState<"bitcoin-only" | "dual-display">("dual-display");
  const [highlightBitcoinValue, setHighlightBitcoinValue] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [copyLinkText, setCopyLinkText] = useState("Copy Share Link");
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Load user preferences
    const loadPreferences = async () => {
      setPrefsLoading(true);
      try {
        const preferences = await PriceDatabase.getPreferences();
        setDisplayMode(preferences.displayMode || "dual-display");
        setHighlightBitcoinValue(preferences.highlightBitcoinValue || false);
        setDenomination(preferences.denomination || "sats");
      } catch (error) {
        console.error("Error loading preferences:", error);
      } finally {
        setPrefsLoading(false);
      }
    };
    loadPreferences();

    // Cleanup timeout on unmount
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Handle copy link function
  const handleCopyLink = () => {
    navigator.clipboard.writeText(APP_URL);
    setCopyLinkText("Copied!");

    // Clear any existing timeout
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    // Set new timeout
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyLinkText("Copy Share Link");
      setShowSettings(false);
      copyTimeoutRef.current = null;
    }, 1000);
  };

  // Toggle Bitcoin-only mode
  const toggleBitcoinOnlyMode = async () => {
    const newMode = displayMode === "bitcoin-only" ? "dual-display" : "bitcoin-only";
    setDisplayMode(newMode);
    try {
      await PriceDatabase.savePreferences({ displayMode: newMode });
      chrome.runtime.sendMessage({ action: "preferencesUpdated" });
      document.dispatchEvent(
        new CustomEvent(DISPLAY_MODE_CHANGE_EVENT, {
          detail: { displayMode: newMode, denomination },
        }),
      );
    } catch (error) {
      console.error("Error saving display mode preference:", error);
    }
  };

  // Toggle highlighting Bitcoin values
  const toggleHighlightBitcoinValue = async () => {
    const newHighlightValue = !highlightBitcoinValue;
    setHighlightBitcoinValue(newHighlightValue);
    try {
      await PriceDatabase.savePreferences({ highlightBitcoinValue: newHighlightValue });
      chrome.runtime.sendMessage({ action: "preferencesUpdated" });
    } catch (error) {
      console.error("Error saving highlight preference:", error);
    }
  };

  // Handle denomination change
  const handleDenominationChange = async (newDenomination: "sats" | "btc") => {
    setDenomination(newDenomination);
    try {
      await PriceDatabase.savePreferences({ denomination: newDenomination });
      chrome.runtime.sendMessage({ action: "preferencesUpdated" });
      document.dispatchEvent(
        new CustomEvent(DISPLAY_MODE_CHANGE_EVENT, {
          detail: { displayMode, denomination: newDenomination },
        }),
      );
    } catch (error) {
      console.error("Error saving denomination preference:", error);
    }
  };

  return (
    <Tooltip delayDuration={700}>
      <TooltipContent>Settings</TooltipContent>
      <DropdownMenu open={showSettings} onOpenChange={setShowSettings}>
        <DropdownMenuTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="size-8 rounded p-0 hover:bg-gray-100 focus:outline-none"
              aria-label="Settings"
            >
              <Ellipsis className="size-5" />
            </Button>
          </TooltipTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="end">
          <DropdownMenuLabel>Display</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            onSelect={(e) => e.preventDefault()}
            checked={displayMode === "bitcoin-only"}
            onCheckedChange={toggleBitcoinOnlyMode}
            disabled={prefsLoading}
          >
            <span className="flex items-center">
              <Bitcoin className={cn("mr-2 h-4 w-4", displayMode === "bitcoin-only" && "text-oc-primary")} />
              <span className="text-primary">Bitcoin Mode</span>
            </span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            onSelect={(e) => e.preventDefault()}
            checked={highlightBitcoinValue}
            onCheckedChange={toggleHighlightBitcoinValue}
            disabled={prefsLoading}
          >
            <span className="flex items-center">
              <PaintbrushVertical className={cn("mr-2 h-4 w-4", highlightBitcoinValue && "text-oc-primary")} />
              <span className="text-primary">Highlight Bitcoin</span>
            </span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Denomination</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={denomination}
            onValueChange={(value) => handleDenominationChange(value as "sats" | "btc")}
          >
            <DropdownMenuRadioItem
              onSelect={(e) => e.preventDefault()}
              value="sats"
              className="data-[state=checked]:text-oc-primary"
            >
              Sats
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              onSelect={(e) => e.preventDefault()}
              value="btc"
              className="data-[state=checked]:text-oc-primary"
            >
              BTC
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex items-center"
              onClick={handleCopyLink}
            >
              {copyLinkText}
              <Link className="ml-auto h-4 w-4" />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild className="flex items-center">
              <a href="options.html" target="_blank" rel="noopener noreferrer">
                Settings
                <ExternalLink className="h-4 w-4" />
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </Tooltip>
  );
}

// --- Recent Conversions ---
// function RecentConversions() {
//   const [sites, setSites] = useState<SiteRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchConversions = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const visited = await PriceDatabase.getVisitedSites();
//         // Sort by timestamp descending, get the most recent 5
//         visited.sort((a, b) => b.timestamp - a.timestamp);
//         setSites(visited.slice(0, 5));
//       } catch (err) {
//         setError("Failed to load recent conversions");
//         console.error("Error loading visited sites:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchConversions();
//   }, []);

//   const clearConversions = async () => {
//     try {
//       await PriceDatabase.db.clear("visitedSites");
//       setSites([]);
//     } catch (err) {
//       setError("Failed to clear conversions");
//       console.error("Error clearing sites:", err);
//     }
//   };

//   // Format time ago from timestamp
//   const timeAgo = (timestamp: number): string => {
//     const seconds = Math.floor((Date.now() - timestamp) / 1000);

//     if (seconds < 60) return `${seconds}s ago`;
//     if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
//     if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
//     return `${Math.floor(seconds / 86400)}d ago`;
//   };

//   // Format URL for display
//   const formatUrl = (url: string): string => {
//     try {
//       const urlObj = new URL(url);
//       return urlObj.hostname;
//     } catch {
//       return url;
//     }
//   };

//   return (
//     <section className="mb-4">
//       <div className="font-semibold mb-1">Recent Conversions</div>
//       {loading ? (
//         <div className="text-xs text-gray-400">Loading conversions...</div>
//       ) : error ? (
//         <div className="text-xs text-red-500">{error}</div>
//       ) : (
//         <ul className="text-xs text-gray-700 space-y-1">
//           {sites.length === 0 ? (
//             <li>No recent conversions.</li>
//           ) : (
//             sites.map((site) => (
//               <li key={site.url + site.timestamp}>
//                 {formatUrl(site.url)} - {site.conversionCount} conversions (
//                 {timeAgo(site.timestamp)})
//               </li>
//             ))
//           )}
//         </ul>
//       )}
//       <div className="flex justify-between mt-1">
//         <button
//           className="text-xs text-gray-400 hover:underline"
//           onClick={clearConversions}
//           disabled={loading || sites.length === 0}
//         >
//           Clear
//         </button>
//         <a
//           href="options.html"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-xs text-blue-500 hover:underline"
//         >
//           More
//         </a>
//       </div>
//     </section>
//   );
// }

// --- Call To Action ---
function CallToAction() {
  return (
    <section className="mb-2 text-left">
      <Button variant="primary" size="sm" asChild>
        <a
          href="https://tftc.io/bitcoin-brief?utm_source=opportunity-cost-extension"
          target="_blank"
          rel="noopener noreferrer"
        >
          Subscribe to Bitcoin Brief
        </a>
      </Button>
    </section>
  );
}

// --- Footer ---
function Footer() {
  return (
    <footer className="text-left text-[10px] text-gray-400">
      <div className="flex flex-col">
        <span>
          &copy; 2025 Opportunity Cost &middot; Powered by{" "}
          <a
            href="https://tftc.io?utm_source=opportunity-cost-extension"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-500 hover:underline"
          >
            TFTC
          </a>
        </span>
        <span>
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
        </span>
      </div>
    </footer>
  );
}

// --- Main IndexPage ---
export function IndexPage() {
  return (
    <div className="min-h-screen w-80 bg-white p-4 font-sans">
      <Header />
      <LivePrice />
      <Converter />
      {/* <Settings /> */}
      {/* <RecentConversions /> */}
      <CallToAction />
      <Footer />
    </div>
  );
}
