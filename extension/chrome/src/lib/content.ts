/**
 * Opportunity Cost Extension Content Script
 *
 * Scans the DOM for fiat currency prices and converts them to their Bitcoin (satoshi) equivalent.
 * Integrates with the background script for real-time price data and user preferences.
 * Handles dynamic content and tracks conversion statistics for analytics.
 */

import type { UserPreferences } from "./storage";

async function main() {
  try {
    // --- Constants ---
    const SATS_IN_BTC = 100_000_000;

    // Tracks the number of conversions performed on the page
    let conversionCount = 0;

    // User preferences, loaded from extension storage or defaults
    let userPreferences: UserPreferences = {
      id: "user-preferences",
      defaultCurrency: undefined, // Will be set after fetching from background
      displayMode: "dual-display",
      denomination: "dynamic",
      trackStats: true,
      highlightBitcoinValue: false,
      enabled: true,
    };

    // List of supported currencies, loaded from background script
    let supportedCurrencies: Array<{ value: string; symbol: string }> = [];

    // Array of all supported currency symbols
    let currencySymbols: string[] = [];

    // Regex for matching any supported currency symbol in text
    let currencyRegex: RegExp = new RegExp("");

    // Listen for updates to user preferences from the background script
    chrome.runtime.onMessage.addListener((message) => {
      try {
        if (message && message.action === "preferencesUpdated") {
          console.log("Preferences updated, reloading content script...");
          window.location.reload();
          return true;
        }
      } catch (error) {
        console.error("Error processing message in content script:", error);
      }
      return false;
    });

    function normalizeLocaleNumber(raw: string): string {
      const v = raw
        .replace(/\bEUR\b/gi, "")
        .replace(/€/g, "")
        .trim();

      // Handles European and US number formats, normalizing to a standard decimal format
      if (/\.\d{3},\d{2}$/.test(v)) {
        return v.replace(/\./g, "").replace(",", ".");
      }
      if (/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(v)) {
        return v.replace(/,/g, "");
      }
      if (!v.includes(".") && v.split(",").length === 2 && v.split(",")[1].length <= 2) {
        return v.replace(",", ".");
      }
      return v.replace(/,/g, "");
    }

    /**
     * Converts a currency string (with optional multipliers) to a numeric value.
     * Supports formats like "$1,000.00", "$3.92K", "$1.12M", "$2 trillion", etc.
     */
    function convertCurrencyValue(str: string, currencySymbol?: string, currencyCode?: string): number {
      const multipliers: Record<string, number> = {
        k: 1e3,
        thousand: 1e3,
        m: 1e6,
        million: 1e6,
        b: 1e9,
        bn: 1e9,
        billion: 1e9,
        t: 1e12,
        trillion: 1e12,
        q: 1e15,
        quadrillion: 1e15,
      };
      const cleaned = normalizeLocaleNumber(
        str
          .replace(currencySymbol ? new RegExp(escapeRegex(currencySymbol), "g") : currencyRegex, "")
          .replace(new RegExp(`\\b${currencyCode}\\b`, "gi"), ""),
      );
      const match = cleaned.match(/^([\d.]+)\s*(k|m|b|bn|t|q|thousand|million|billion|trillion|quadrillion)?$/i);
      if (!match) return NaN;
      const [, numStr, rawSuffix] = match;
      const suffix = (rawSuffix ?? "").toLowerCase();
      const multiplier = multipliers[suffix] ?? 1;
      return parseFloat(numStr) * multiplier;
    }

    // Formats a number for display, with a maximum number of decimals
    const fmt = (num: number, maxDecimals: number) =>
      num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals,
      });

    // Formats a bitcoin value (in satoshis) according to user denomination preference
    const formatBitcoinValue = (satoshis: number): string => {
      const btc = satoshis / SATS_IN_BTC;
      if (btc >= 100) return `${fmt(btc, 0)} BTC`;
      if (userPreferences.denomination === "dynamic") {
        return btc < 0.01 ? `${fmt(satoshis, 0)} sats` : `${fmt(btc, 2)} BTC`;
      }
      if (userPreferences.denomination === "btc") {
        if (btc >= 1) return `${fmt(btc, 2)} BTC`;
        if (btc >= 0.01) return `${fmt(btc, 4)} BTC`;
        if (btc >= 0.0001) return `${fmt(btc, 5)} BTC`;
        if (btc >= 0.000001) return `${fmt(btc, 6)} BTC`;
        return `${btc.toLocaleString(undefined, {
          minimumFractionDigits: 8,
          maximumFractionDigits: 8,
        })} BTC`;
      }
      return `${fmt(satoshis, 0)} sats`;
    };

    // Fetches the latest Bitcoin prices for all supported currencies from the background script
    async function getBitcoinPrices(): Promise<Record<string, number>> {
      return new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(
            { action: "getBitcoinPrices" },
            (response: { error?: string; prices?: Record<string, number> }) => {
              if (chrome.runtime.lastError) {
                console.error("Runtime error getting Bitcoin prices:", chrome.runtime.lastError);
                reject(new Error(chrome.runtime.lastError.message || "Extension disconnected"));
                return;
              }
              if (response?.error) {
                console.error("Error getting Bitcoin prices:", response.error);
                reject(new Error(response.error));
              } else {
                resolve(response?.prices || {});
              }
            },
          );
        } catch (error) {
          console.error("Exception in getBitcoinPrices:", error);
          reject(error);
        }
      });
    }

    // Fetches the list of supported currencies from the background script
    async function getSupportedCurrencies(): Promise<Array<{ value: string; symbol: string }>> {
      return new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(
            { action: "getSupportedCurrencies" },
            (response: { error?: string; supportedCurrencies?: Array<{ value: string; symbol: string }> }) => {
              if (chrome.runtime.lastError) {
                console.error("Runtime error getting supported currencies:", chrome.runtime.lastError);
                reject(new Error(chrome.runtime.lastError.message || "Extension disconnected"));
                return;
              }
              if (response?.error) {
                console.error("Error getting supported currencies:", response.error);
                reject(new Error(response.error));
              } else {
                resolve(response?.supportedCurrencies || []);
              }
            },
          );
        } catch (error) {
          console.error("Exception in getSupportedCurrencies:", error);
          reject(error);
        }
      });
    }

    // Loads user preferences from the background script, falling back to defaults if unavailable
    async function getUserPreferences(): Promise<UserPreferences> {
      return new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage(
            { action: "getPreferences" },
            (response: { error?: string; preferences?: UserPreferences }) => {
              if (chrome.runtime.lastError) {
                console.error("Runtime error getting preferences:", chrome.runtime.lastError);
                resolve(userPreferences);
                return;
              }
              if (response?.error) {
                console.error("Error getting preferences:", response.error);
                resolve(userPreferences);
              } else if (response?.preferences) {
                userPreferences = response.preferences;
                console.log("User preferences loaded:", userPreferences);
                resolve(userPreferences);
              } else {
                console.warn("No preferences received from background, using defaults");
                resolve(userPreferences);
              }
            },
          );
        } catch (error) {
          console.error("Exception in getUserPreferences:", error);
          resolve(userPreferences);
        }
      });
    }

    // Logs a page visit and the number of conversions performed, for analytics
    function logPageVisit(): void {
      if (conversionCount > 0 && userPreferences.trackStats) {
        const url = window.location.href;
        chrome.runtime.sendMessage({
          action: "saveVisitedSite",
          url: url,
          conversionCount: conversionCount,
        });
      }
    }

    // Loads all required data (preferences, currencies, prices) before processing the page
    async function initializeData(): Promise<{
      preferences: UserPreferences;
      currencies: Array<{ value: string; symbol: string }>;
      prices: Record<string, number>;
    }> {
      try {
        const preferences = await getUserPreferences();
        const currencies = await getSupportedCurrencies();
        const prices = await getBitcoinPrices();
        return { preferences, currencies, prices };
      } catch (error) {
        console.error("Error initializing data:", error);
        return {
          preferences: userPreferences,
          currencies: [],
          prices: {},
        };
      }
    }

    // --- Begin main script logic after data is loaded ---
    const { currencies, prices: btcPrices } = await initializeData();

    if (userPreferences.enabled === false) {
      console.log("Opportunity Cost: Extension is disabled globally");
      return;
    }

    supportedCurrencies = currencies;

    function escapeRegex(s: string): string {
      return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    currencySymbols = supportedCurrencies.map((c) => c.symbol);
    currencyRegex = new RegExp(`[${currencySymbols.map((s) => `\\${s}`).join("")}]`, "g");

    if (!btcPrices || Object.keys(btcPrices).length === 0 || !supportedCurrencies || supportedCurrencies.length === 0) {
      console.warn("Opportunity Cost: Failed to get BTC prices or supported currencies. Prices will not be converted.");
      return;
    }

    // Recursively walks the DOM, processing text nodes for fiat price conversion
    const walkDOM = (node: Node): void => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        if (
          [
            "script",
            "style",
            "noscript",
            "iframe",
            "svg",
            "canvas",
            "video",
            "audio",
            "picture",
            "code",
            "pre",
            "math",
            "input",
            "textarea",
          ].includes(tagName)
        ) {
          return;
        }
        if (element.isContentEditable) {
          return;
        }
      }
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.parentElement && node.parentElement.closest("[contenteditable=true], [contenteditable='']")) {
          return;
        }
        replacePrice(node as Text);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < node.childNodes.length; i++) {
          walkDOM(node.childNodes[i]);
        }
      }
    };

    // Applies highlight styles to bitcoin value labels if enabled in preferences
    function applyBitcoinLabelStyles(label: HTMLElement) {
      if (userPreferences.highlightBitcoinValue) {
        label.style.backgroundColor = "rgba(240, 138, 93, 0.2)";
        label.style.padding = "0 4px";
        label.style.borderRadius = "4px";
      }
    }

    // Replaces fiat prices in text nodes with their bitcoin equivalent, for the default currency only
    const replacePrice = (textNode: Text): void => {
      const content = textNode.textContent || "";
      const parent = textNode.parentNode as HTMLElement | null;
      if (!parent || parent.dataset.ocProcessed === "true") return;
      const defaultCurrency = userPreferences.defaultCurrency;
      const currency = supportedCurrencies.find((c) => c.value === defaultCurrency);
      if (!currency || !currency.symbol) return;
      const currencySymbol = currency.symbol;
      const iso = currency.value.toUpperCase();
      const sym = escapeRegex(currencySymbol);
      const magnitude = "(?:thousand|million|billion|trillion|quadrillion|k|m|b|t|q|bn|mn|tn)";
      const number = "\\d[\\d.,]*";
      const regex = new RegExp(
        `(?:${sym}\\s?${number}(?:\\s*${magnitude})?|${number}(?:\\s*${magnitude})?\\s?(?:${sym}|${iso}))\\b`,
        "gi",
      );
      regex.lastIndex = 0;
      let match;
      let lastIndex = 0;
      let modified = false;
      const frag = document.createDocumentFragment();

      while ((match = regex.exec(content)) !== null) {
        const matchStart = match.index;
        if (matchStart > lastIndex) {
          frag.appendChild(document.createTextNode(content.slice(lastIndex, matchStart)));
        }

        const fullMatch = match[0];
        const trailingWS = fullMatch.match(/\s+$/)?.[0] ?? "";
        const fiatText = trailingWS ? fullMatch.slice(0, -trailingWS.length) : fullMatch;
        const fiatValue = convertCurrencyValue(fullMatch, currencySymbol, currency.value);
        if (isNaN(fiatValue)) {
          frag.appendChild(document.createTextNode(fullMatch));
          lastIndex = regex.lastIndex;
          continue;
        }
        const btcPrice = btcPrices[currency.value];
        if (!btcPrice) {
          frag.appendChild(document.createTextNode(fullMatch));
          lastIndex = regex.lastIndex;
          continue;
        }

        const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);
        const bitcoinValueSpan = document.createElement("span");
        bitcoinValueSpan.className = "oc-btc-price";
        bitcoinValueSpan.textContent = formatBitcoinValue(satsValue);
        applyBitcoinLabelStyles(bitcoinValueSpan);

        if (userPreferences.displayMode === "bitcoin-only") {
          frag.appendChild(bitcoinValueSpan);
        } else {
          frag.appendChild(document.createTextNode(fiatText));
          frag.appendChild(document.createTextNode(" | "));
          frag.appendChild(bitcoinValueSpan);
        }
        if (trailingWS) {
          frag.appendChild(document.createTextNode(trailingWS));
        }

        lastIndex = regex.lastIndex;
        modified = true;
      }

      if (lastIndex < content.length) {
        frag.appendChild(document.createTextNode(content.slice(lastIndex)));
      }

      if (modified) {
        parent.replaceChild(frag, textNode);
        parent.dataset.ocProcessed = "true";
      }
    };

    /**
     * Processes Amazon price elements, appending bitcoin values next to fiat prices.
     * Handles both dual-display and bitcoin-only display modes.
     */
    function processAmazonPrices() {
      document.querySelectorAll<HTMLSpanElement>('.a-price span[aria-hidden="true"]').forEach((vis) => {
        if (!vis || !vis.textContent || vis.children.length === 0) return;
        if (vis.querySelector(".oc-btc-price")) return;
        const parent = vis.closest(".a-price");
        if (!parent) return;
        const currency = supportedCurrencies.find((c) => c.value === userPreferences.defaultCurrency);
        if (!currency) return;
        if (!vis.textContent!.includes(currency.symbol)) return;
        const btcPrice = btcPrices[currency.value];
        if (!btcPrice) return;
        const fiatValue = convertCurrencyValue(vis.textContent, currency.symbol, currency.value);
        const sats = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);
        const btcDisplay = formatBitcoinValue(sats);
        const displayMode = userPreferences.displayMode;
        const formatted = displayMode === "dual-display" ? ` | ${btcDisplay}` : btcDisplay;
        const screenReaderSpan = vis.querySelector(".a-offscreen");
        if (screenReaderSpan) {
          screenReaderSpan.textContent += formatted;
        }
        const label = document.createElement("span");
        label.className = "oc-btc-price";
        if (userPreferences.displayMode === "dual-display") {
          const parts = formatted.split("|");
          if (parts.length > 1) {
            label.textContent = parts[0] + "| ";
            const btcValueSpan = document.createElement("span");
            btcValueSpan.textContent = parts[1].trim();
            applyBitcoinLabelStyles(btcValueSpan);
            label.appendChild(btcValueSpan);
          } else {
            label.textContent = formatted;
          }
        } else {
          label.textContent = formatted;
          applyBitcoinLabelStyles(label);
        }

        vis.appendChild(label);

        if (userPreferences.displayMode === "bitcoin-only") {
          const priceSymbol = vis.querySelector(".a-price-symbol");
          const priceWhole = vis.querySelector(".a-price-whole");
          const priceFraction = vis.querySelector(".a-price-fraction");
          if (priceSymbol) priceSymbol.remove();
          if (priceWhole) priceWhole.remove();
          if (priceFraction) priceFraction.remove();
        }

        conversionCount++;
      });
    }

    /**
     * Processes WooCommerce price elements, appending bitcoin values or replacing fiat prices.
     * Handles both dual-display and bitcoin-only display modes.
     */
    function processWooCommercePrices(): void {
      document.querySelectorAll<HTMLSpanElement>(".woocommerce-Price-amount.amount").forEach((amount) => {
        if (amount.dataset.ocProcessed === "true" || amount.querySelector(".oc-btc-price")) return;

        const currency = supportedCurrencies.find((c) => c.value === userPreferences.defaultCurrency);
        if (!currency) return;

        const btcPrice = btcPrices[currency.value];
        if (!btcPrice) return;

        const fiatValue = convertCurrencyValue(amount.textContent ?? "", currency.symbol, currency.value);
        if (isNaN(fiatValue)) return;

        const sats = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);
        const btcDisplay = formatBitcoinValue(sats);
        const btcSpan = document.createElement("span");
        btcSpan.className = "oc-btc-price";
        btcSpan.textContent = btcDisplay;
        applyBitcoinLabelStyles(btcSpan);

        if (userPreferences.displayMode === "dual-display") {
          (amount.querySelector("bdi") ?? amount).append(" | ", btcSpan);
        } else {
          amount.textContent = "";
          amount.appendChild(btcSpan);
        }

        amount.dataset.ocProcessed = "true";
        conversionCount++;
      });
    }

    // --- Initial processing and observer setup ---
    processAmazonPrices();
    processWooCommercePrices();
    walkDOM(document.body);
    logPageVisit();

    // Observes DOM mutations to process dynamically added content for price conversion
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      let newConversions = 0;
      const processChanges = (): void => {
        processAmazonPrices();
        processWooCommercePrices();
        mutations.forEach((mutation: MutationRecord) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node: Node) => walkDOM(node));
          }
        });
        if (conversionCount > newConversions) {
          logPageVisit();
          newConversions = conversionCount;
        }
      };
      newConversions = conversionCount;
      processChanges();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Ensures analytics are logged before the user leaves the page
    window.addEventListener("beforeunload", () => {
      logPageVisit();
    });
  } catch (error) {
    alert(error);
    console.error("Opportunity Cost: An error occurred:", error);
  }
}

main();
