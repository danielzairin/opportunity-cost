/**
 * Opportunity Cost Extension
 *
 * This content script scans the DOM for fiat currency prices and
 * converts them to their Bitcoin satoshi equivalent.
 * It works with the background script for price data and storage.
 */

import type { UserPreferences } from "./storage";

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
      trackStats: true,
      highlightBitcoinValue: false, // Default to no highlighting
    };

    // Supported currencies (will be populated from background)
    let supportedCurrencies: Array<{ value: string; symbol: string }> = [];

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
    function convertCurrencyValue(
      str: string,
      currencySymbol?: string
    ): number {
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
        .replace(
          currencySymbol
            ? new RegExp(`\\${currencySymbol}`, "g")
            : currencyRegex,
          ""
        )
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

    // Get Bitcoin prices from background script
    async function getBitcoinPrices(): Promise<Record<string, number>> {
      return new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(
            { action: "getBitcoinPrices" },
            (response: { error?: string; prices?: Record<string, number> }) => {
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
                resolve(response?.prices || {});
              }
            }
          );
        } catch (error) {
          console.error("Exception in getBitcoinPrices:", error);
          reject(error);
        }
      });
    }

    // Get supported currencies from background script
    async function getSupportedCurrencies(): Promise<
      Array<{ value: string; symbol: string }>
    > {
      return new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(
            { action: "getSupportedCurrencies" },
            (response: {
              error?: string;
              supportedCurrencies?: Array<{ value: string; symbol: string }>;
            }) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Runtime error getting supported currencies:",
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
                console.error(
                  "Error getting supported currencies:",
                  response.error
                );
                reject(new Error(response.error));
              } else {
                resolve(response?.supportedCurrencies || []);
              }
            }
          );
        } catch (error) {
          console.error("Exception in getSupportedCurrencies:", error);
          reject(error);
        }
      });
    }

    // Make sure we have the latest preferences before doing anything else
    async function getUserPreferences(): Promise<UserPreferences> {
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
          console.error("Exception in getUserPreferences:", error);
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

    // Initialize data by loading preferences, currencies, and prices
    async function initializeData(): Promise<{
      preferences: UserPreferences;
      currencies: Array<{ value: string; symbol: string }>;
      prices: Record<string, number>;
    }> {
      try {
        // First load user preferences
        const preferences = await getUserPreferences();

        // Then load supported currencies
        const currencies = await getSupportedCurrencies();

        // Finally load Bitcoin prices
        const prices = await getBitcoinPrices();

        return { preferences, currencies, prices };
      } catch (error) {
        console.error("Error initializing data:", error);
        // Return defaults for any data we couldn't load
        return {
          preferences: userPreferences,
          currencies: [],
          prices: {},
        };
      }
    }

    // Initialize all data before proceeding
    const { currencies, prices: btcPrices } = await initializeData();

    // Set up supportedCurrencies from loaded data
    supportedCurrencies = currencies;

    function escapeRegex(s: string): string {
      return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

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
    function applyBitcoinLabelStyles(label: HTMLElement) {
      // Only apply highlighting if the user has enabled that option
      if (userPreferences.highlightBitcoinValue) {
        label.style.backgroundColor = "rgba(240, 138, 93, 0.2)";
        label.style.padding = "0 4px";
        label.style.borderRadius = "4px";
      }
    }

    // Function to replace fiat prices with satoshi values in a text node (only default currency)
    const replacePrice = (textNode: Text): void => {
      const content = textNode.textContent || "";
      const parent = textNode.parentNode as HTMLElement | null;
      if (!parent || parent.dataset.ocProcessed === "true") return;

      const defaultCurrency = userPreferences.defaultCurrency;
      const currency = supportedCurrencies.find(
        (c) => c.value === defaultCurrency
      );
      if (!currency || !currency.symbol) return;

      const currencySymbol = currency.symbol;
      const regex = new RegExp(
        `${escapeRegex(currencySymbol)}\\s?[\\d,.]+(?:[kmbtKMBT])?`,
        "gi"
      );
      regex.lastIndex = 0;

      let match;
      let lastIndex = 0;
      let modified = false;
      const frag = document.createDocumentFragment();

      while ((match = regex.exec(content)) !== null) {
        const matchStart = match.index;

        // Add text before the match
        if (matchStart > lastIndex) {
          frag.appendChild(
            document.createTextNode(content.slice(lastIndex, matchStart))
          );
        }

        const fiatValue = convertCurrencyValue(match[0], currencySymbol);
        const btcPrice = btcPrices[currency.value];
        if (!btcPrice) {
          frag.appendChild(document.createTextNode(match[0]));
          lastIndex = regex.lastIndex;
          continue;
        }

        const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);
        const bitcoinValueSpan = document.createElement("span");
        bitcoinValueSpan.className = "oc-btc-price";
        bitcoinValueSpan.textContent = formatBitcoinValue(satsValue);
        applyBitcoinLabelStyles(bitcoinValueSpan);

        if (userPreferences.displayMode === "bitcoin-only") {
          // Just insert BTC equivalent (no fiat text)
          frag.appendChild(bitcoinValueSpan);
        } else {
          // Dual display: keep fiat + BTC
          frag.appendChild(document.createTextNode(match[0]));
          frag.appendChild(document.createTextNode(" | "));
          frag.appendChild(bitcoinValueSpan);
        }

        lastIndex = regex.lastIndex;
        modified = true;
      }

      if (lastIndex < content.length) {
        frag.appendChild(document.createTextNode(content.slice(lastIndex)));
      }

      if (modified) {
        parent.replaceChild(frag, textNode);
        parent.dataset.ocProcessed = "true"; // ✅ prevent double-processing
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

          // Only process the default currency
          const currency = supportedCurrencies.find(
            (c) => c.value === userPreferences.defaultCurrency
          );
          if (!currency) return;

          // Check if the price starts with the user's default currency symbol
          if (!vis.textContent.trim().startsWith(currency.symbol)) return;

          const btcPrice = btcPrices[currency.value];
          if (!btcPrice) return;

          const fiatValue = convertCurrencyValue(
            vis.textContent,
            currency.symbol
          );

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

          if (userPreferences.displayMode === "dual-display") {
            // For dual display, create inner span just for the BTC value
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
            // For bitcoin-only mode, the entire label is just the BTC value
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
