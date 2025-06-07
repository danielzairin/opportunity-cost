/**
 * Opportunity Cost Extension Content Script
 *
 * Scans the DOM for fiat currency prices and converts them to their Bitcoin (satoshi) equivalent.
 * Integrates with the background script for real-time price data and user preferences.
 * Handles dynamic content and tracks conversion statistics for analytics.
 */

import browser from "webextension-polyfill";
import type { UserPreferences } from "./storage";

async function main() {
  try {
    // --- Constants ---
    const SATS_IN_BTC = 100_000_000;

    // User preferences, loaded from extension storage or defaults
    let userPreferences: UserPreferences = {
      id: "user-preferences",
      defaultCurrency: undefined, // Will be set after fetching from background
      displayMode: "dual-display",
      denomination: "dynamic",
      highlightBitcoinValue: false,
      disabledSites: [],
    };

    // List of supported currencies, loaded from background script
    let supportedCurrencies: Array<{ value: string; symbol: string }> = [];

    // Array of all supported currency symbols
    let currencySymbols: string[] = [];

    // Regex for matching any supported currency symbol in text
    let currencyRegex: RegExp = new RegExp("");

    if (document.contentType !== "text/html") {
      console.log("Opportunity Cost: Skipping non-HTML document:", document.contentType);
      return;
    }

    // Listen for updates to user preferences from the background script
    browser.runtime.onMessage.addListener((message) => {
      if (message?.action === "preferencesUpdated") {
        console.log("Preferences updated, reloading content script...");
        window.location.reload();
      }
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
      const response = await browser.runtime.sendMessage({ action: "getBitcoinPrices" });
      if (response?.error) {
        console.error("Error getting Bitcoin prices:", response.error);
        throw new Error(response.error);
      }
      return response?.prices || {};
    }

    // Fetches the list of supported currencies from the background script
    async function getSupportedCurrencies(): Promise<Array<{ value: string; symbol: string }>> {
      const response = await browser.runtime.sendMessage({ action: "getSupportedCurrencies" });
      if (response?.error) {
        console.error("Error getting supported currencies:", response.error);
        throw new Error(response.error);
      }
      return response?.supportedCurrencies || [];
    }

    // Loads user preferences from the background script, falling back to defaults if unavailable
    async function getUserPreferences(): Promise<UserPreferences> {
      try {
        const response = await browser.runtime.sendMessage({ action: "getPreferences" });
        if (response?.error) {
          console.error("Error getting preferences:", response.error);
        } else if (response?.preferences) {
          userPreferences = response.preferences;
          console.log("User preferences loaded:", userPreferences);
        } else {
          console.warn("No preferences received from background, using defaults");
        }
      } catch (error) {
        console.error("Exception in getUserPreferences:", error);
      }
      return userPreferences;
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
    const { preferences, currencies, prices: btcPrices } = await initializeData();
    userPreferences = preferences;

    if (userPreferences.disabledSites?.includes(window.location.hostname)) {
      console.log(`Opportunity Cost: Extension is disabled for ${window.location.hostname}`);
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
      const parent = textNode.parentNode;
      if (!(parent instanceof HTMLElement)) return;
      if (parent.dataset.ocProcessed === "true") return;
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

    // --- Initial processing and observer setup ---
    walkDOM(document.body);

    // Observes DOM mutations to process dynamically added content for price conversion
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((mutation: MutationRecord) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node: Node) => walkDOM(node));
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } catch (error) {
    alert(error);
    console.error("Opportunity Cost: An error occurred:", error);
  }
}

main();
