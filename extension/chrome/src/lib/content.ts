/**
 * Opportunity Cost Extension
 *
 * This content script scans the DOM for fiat currency prices and
 * converts them to their Bitcoin satoshi equivalent.
 * It works with the background script for price data and storage.
 */

import type { UserPreferences } from "./storage";

interface CurrencyRegexes {
  [key: string]: RegExp;
}

async function main() {
  try {
    // Constants
    const SATS_IN_BTC = 100_000_000;

    // Statistics for tracking conversions
    let conversionCount = 0;

    // User preferences (will be populated from database)
    let userPreferences: UserPreferences = {
      id: "user-preferences",
      defaultCurrency: undefined, // Will be set after fetching from background
      displayMode: "dual-display", // Changed default from 'bitcoin-only' to 'dual-display'
      denomination: "btc", // Default to bitcoin (BTC) instead of satoshis
      autoRefresh: true,
      trackStats: true,
    };

    // Supported currencies (will be populated from background)
    let supportedCurrencies: Array<{ value: string; symbol: string }> = [];

    // Regular expressions for currency patterns (will be built after fetching supportedCurrencies)
    let currencyRegexes: CurrencyRegexes = {};

    // Get all supported currency symbols
    let currencySymbols: string[] = [];

    // Create regex that matches any supported currency symbol
    let currencyRegex: RegExp = new RegExp("");

    // Listen for preference update messages from background
    chrome.runtime.onMessage.addListener((message) => {
      try {
        if (message && message.action === "preferencesUpdated") {
          console.log("Preferences updated, reloading content script...");
          // Reload the page to apply new preferences
          window.location.reload();
          return true;
        }
      } catch (error) {
        console.error("Error processing message in content script:", error);
      }
      return false;
    });

    /**
     * Converts a currency string value to a number
     * Handles formats like $1,000.00, $3.92K, $1.12M, $50.24T
     */
    function convertCurrencyValue(str: string): number {
      const multipliers: Record<string, number> = {
        k: 1e3,
        m: 1e6,
        b: 1e9,
        t: 1e12,
      };

      // Remove currency symbol and clean the string
      const cleaned = str
        .trim()
        .toLowerCase()
        .replace(currencyRegex, "")
        .replace(/,/g, "");

      const match = cleaned.match(/^([\d.]+)([kmbt])?$/);

      if (!match) return NaN;

      const [, numStr, suffix] = match;
      const num = parseFloat(numStr);

      if (!suffix) return num;
      return multipliers[suffix] ? num * multipliers[suffix] : num;
    }

    // Format bitcoin value based on user's denomination preference
    const formatBitcoinValue = (satoshis: number): string => {
      if (userPreferences.denomination === "btc") {
        // Convert satoshis to bitcoin (1 BTC = 100,000,000 sats)
        const btcValue = satoshis / SATS_IN_BTC;
        // Format BTC with appropriate decimals (8 max)
        if (btcValue < 0.000001) {
          return `${btcValue.toFixed(8)} BTC`;
        } else if (btcValue < 0.0001) {
          return `${btcValue.toFixed(6)} BTC`;
        } else if (btcValue < 0.01) {
          return `${btcValue.toFixed(5)} BTC`;
        } else {
          return `${btcValue.toFixed(4)} BTC`;
        }
      } else {
        // Default to satoshis
        return `${satoshis.toLocaleString()} sats`;
      }
    };

    // Get Bitcoin prices, supported currencies, and user preferences from background script
    async function getAllBitcoinPricesAndPreferences(): Promise<{
      prices: Record<string, number>;
      preferences: UserPreferences;
      supportedCurrencies: Array<{ value: string; symbol: string }>;
    }> {
      return new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(
            { action: "getAllBitcoinPrices" },
            (response: {
              error?: string;
              prices?: Record<string, number>;
              displayMode?: string;
              currency?: string;
              denomination?: string;
              supportedCurrencies?: Array<{ value: string; symbol: string }>;
            }) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Runtime error getting Bitcoin prices:",
                  chrome.runtime.lastError
                );
                reject(
                  new Error(
                    chrome.runtime.lastError.message || "Extension disconnected"
                  )
                );
                return;
              }
              if (response?.error) {
                console.error("Error getting Bitcoin prices:", response.error);
                reject(new Error(response.error));
              } else {
                // Update user preferences if they're included in the response
                if (response?.displayMode) {
                  userPreferences.displayMode = response.displayMode as
                    | "bitcoin-only"
                    | "dual-display";
                  console.log("Display mode set to:", response.displayMode);
                }
                if (response?.currency) {
                  userPreferences.defaultCurrency = response.currency;
                  console.log("Currency set to:", response.currency);
                }
                if (response?.denomination) {
                  userPreferences.denomination = response.denomination as
                    | "btc"
                    | "sats";
                  console.log("Denomination set to:", response.denomination);
                }
                if (response?.supportedCurrencies) {
                  supportedCurrencies = response.supportedCurrencies;
                  console.log("supportedCurrencies", supportedCurrencies);
                }
                resolve({
                  prices: response?.prices || {},
                  preferences: userPreferences,
                  supportedCurrencies: supportedCurrencies,
                });
              }
            }
          );
        } catch (error) {
          console.error(
            "Exception in getAllBitcoinPricesAndPreferences:",
            error
          );
          reject(error);
        }
      });
    }

    // Make sure we have the latest preferences before doing anything else
    async function ensurePreferencesLoaded(): Promise<UserPreferences> {
      return new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage(
            { action: "getPreferences" },
            (response: { error?: string; preferences?: UserPreferences }) => {
              // Check for runtime errors (like disconnected extension)
              if (chrome.runtime.lastError) {
                console.error(
                  "Runtime error getting preferences:",
                  chrome.runtime.lastError
                );
                // Use default preferences
                resolve(userPreferences);
                return;
              }

              if (response?.error) {
                console.error("Error getting preferences:", response.error);
                resolve(userPreferences); // Use defaults
              } else if (response?.preferences) {
                // Update our local preferences object with what's in storage
                userPreferences = response.preferences;
                console.log("User preferences loaded:", userPreferences);
                resolve(userPreferences);
              } else {
                console.warn(
                  "No preferences received from background, using defaults"
                );
                resolve(userPreferences); // Use defaults
              }
            }
          );
        } catch (error) {
          console.error("Exception in ensurePreferencesLoaded:", error);
          resolve(userPreferences); // Fall back to defaults
        }
      });
    }

    // Log this page visit to database once conversions are done
    function logPageVisit(): void {
      // Only log if we actually did conversions and tracking is enabled
      if (conversionCount > 0 && userPreferences.trackStats) {
        const url = window.location.href;
        chrome.runtime.sendMessage({
          action: "saveVisitedSite",
          url: url,
          conversionCount: conversionCount,
        });
      }
    }

    // Make sure preferences are loaded before anything else
    await ensurePreferencesLoaded();

    // Get all BTC prices, supported currencies, and user preferences
    const { prices: btcPrices, supportedCurrencies: loadedCurrencies } =
      await getAllBitcoinPricesAndPreferences();

    supportedCurrencies = loadedCurrencies;

    function escapeRegex(s: string): string {
      return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    currencyRegexes = supportedCurrencies.reduce((acc, currency) => {
      const escapedSymbol = escapeRegex(currency.symbol);
      acc[currency.value] = new RegExp(
        `${escapedSymbol}\\s?[\\d,.]+(?:[kmbtKMBT])?`,
        "gi"
      );
      return acc;
    }, {} as CurrencyRegexes);
    currencySymbols = supportedCurrencies.map((c) => c.symbol);
    currencyRegex = new RegExp(
      `[${currencySymbols.map((s) => `\\${s}`).join("")}]`,
      "g"
    );

    if (
      !btcPrices ||
      Object.keys(btcPrices).length === 0 ||
      !supportedCurrencies ||
      supportedCurrencies.length === 0
    ) {
      console.warn(
        "Opportunity Cost: Failed to get BTC prices or supported currencies. Prices will not be converted."
      );
      return;
    }

    // Function to walk through the DOM and process text nodes
    const walkDOM = (node: Node): void => {
      // Skip script and style elements - we don't need to process their text content
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = (node as Element).tagName.toLowerCase();
        if (["script", "style", "noscript"].includes(tagName)) {
          return;
        }
      }

      // Process text nodes - this is what contains the prices
      if (node.nodeType === Node.TEXT_NODE) {
        replacePrice(node as Text);
      }
      // Recursively process child nodes
      else if (node.nodeType === Node.ELEMENT_NODE) {
        // Process children
        for (let i = 0; i < node.childNodes.length; i++) {
          walkDOM(node.childNodes[i]);
        }
      }
    };

    // Helper to apply bitcoin-only label styles
    function applyBitcoinOnlyLabelStyles(label: HTMLElement) {
      label.style.backgroundColor = "rgba(240, 138, 93, 0.2)";
      label.style.padding = "0 4px";
      label.style.borderRadius = "4px";
    }

    // Function to replace fiat prices with satoshi values in a text node (only default currency)
    const replacePrice = (textNode: Text): void => {
      let content = textNode.textContent || "";
      let modified = false;

      // Text nodes that should be ignored (containing specific patterns)
      const shouldIgnoreNode = (): boolean => {
        if (content.includes(" sats") || content.includes(" BTC")) {
          return true;
        }
        if (content.trim().length < 2) {
          return true;
        }
        if (content.includes("List:") || content.includes("Save ")) {
          return true;
        }
        return false;
      };
      if (shouldIgnoreNode()) {
        return;
      }

      // Only process the default currency
      const defaultCurrency = userPreferences.defaultCurrency;
      if (!defaultCurrency) return;
      const currency = supportedCurrencies.find(
        (c) => c.value === defaultCurrency
      );
      if (!currency) return;
      const regex = currencyRegexes[currency.value];
      if (!regex) return;

      // If in bitcoin-only mode, replace matched text with a styled span
      if (userPreferences.displayMode === "bitcoin-only") {
        let match;
        let lastIndex = 0;
        const parent = textNode.parentNode;
        if (!parent) return;
        const frag = document.createDocumentFragment();
        regex.lastIndex = 0; // reset regex state
        while ((match = regex.exec(content)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            frag.appendChild(
              document.createTextNode(content.slice(lastIndex, match.index))
            );
          }
          // Parse the fiat value
          const fiatValue = convertCurrencyValue(match[0]);
          const btcPrice = btcPrices[currency.value];
          if (!btcPrice) {
            frag.appendChild(document.createTextNode(match[0]));
            lastIndex = regex.lastIndex;
            continue;
          }
          const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);
          conversionCount++;
          modified = true;
          // Create styled span
          const span = document.createElement("span");
          span.className = "oc-btc-price";
          span.textContent = formatBitcoinValue(satsValue);
          applyBitcoinOnlyLabelStyles(span);
          frag.appendChild(span);
          lastIndex = regex.lastIndex;
        }
        // Add any remaining text after the last match
        if (lastIndex < content.length) {
          frag.appendChild(document.createTextNode(content.slice(lastIndex)));
        }
        if (modified) {
          parent.replaceChild(frag, textNode);
        }
        return;
      }

      // Otherwise, do the original replacement (dual-display)
      content = content.replace(regex, (match: string) => {
        // Avoid double conversion in the same node
        if (content.includes(" sats") || content.includes(" BTC")) {
          return match;
        }
        // Parse the fiat value
        const fiatValue = convertCurrencyValue(match);
        const btcPrice = btcPrices[currency.value];
        if (!btcPrice) return match;
        const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);
        conversionCount++;
        modified = true;
        if (userPreferences.displayMode === "dual-display") {
          return `${match} | ${formatBitcoinValue(satsValue)}`;
        } else {
          return formatBitcoinValue(satsValue);
        }
      });

      if (modified) {
        textNode.textContent = content;
      }
    };

    function processAmazonPrices() {
      document
        .querySelectorAll<HTMLSpanElement>('.a-price span[aria-hidden="true"]')
        .forEach((vis) => {
          // Ensure the element doesn't contain any currency symbols
          if (!vis || !vis.textContent || vis.children.length === 0) return;

          // Skip if already processed
          if (vis.querySelector(".oc-btc-price")) return;

          const parent = vis.closest(".a-price");
          if (!parent) return;
          const currency = supportedCurrencies.find(
            (c) => c.value === userPreferences.defaultCurrency
          );
          if (!currency) return;
          const btcPrice = btcPrices[currency.value];
          if (!btcPrice) return;

          const fiatValue = convertCurrencyValue(vis.textContent);

          const sats = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);
          const btcDisplay = formatBitcoinValue(sats);
          const displayMode = userPreferences.displayMode;
          const formatted =
            displayMode === "dual-display" ? ` | ${btcDisplay}` : btcDisplay;
          const screenReaderSpan = vis.querySelector(".a-offscreen");
          if (screenReaderSpan) {
            screenReaderSpan.textContent += formatted;
          }
          const label = document.createElement("span");
          label.className = "oc-btc-price";
          label.textContent = formatted;
          if (userPreferences.displayMode === "bitcoin-only") {
            applyBitcoinOnlyLabelStyles(label);
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

    // Only process prices and set up observers after data is loaded and valid
    processAmazonPrices();
    walkDOM(document.body);
    logPageVisit();

    // Set up a MutationObserver to handle dynamically added content
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      let newConversions = 0;
      const processChanges = (): void => {
        processAmazonPrices();
        mutations.forEach((mutation: MutationRecord) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node: Node) => walkDOM(node));
          }
        });

        // If new conversions happened during the mutation, log the visit again
        if (conversionCount > newConversions) {
          logPageVisit();
          newConversions = conversionCount;
        }
      };

      // Track current conversion count
      newConversions = conversionCount;
      processChanges();
    });

    // Start observing mutations to the DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Add an event listener for when the page is about to be unloaded
    window.addEventListener("beforeunload", () => {
      // Final log before page unloads
      logPageVisit();
    });
  } catch (error) {
    alert(error);
    console.error("Opportunity Cost: An error occurred:", error);
    // Graceful fallback - leave prices untouched
  }
}

main();
