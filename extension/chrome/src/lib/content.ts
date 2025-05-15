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
      id: "default",
      defaultCurrency: "usd",
      displayMode: "dual-display", // Changed default from 'bitcoin-only' to 'dual-display'
      denomination: "btc", // Default to bitcoin (BTC) instead of satoshis
      autoRefresh: true,
      trackStats: true,
    };

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

    // Regular expressions for currency patterns
    const currencyRegexes: CurrencyRegexes = {
      usd: /\$[\w,.]+/g,
      eur: /€[\w,.]+/g,
      gbp: /£[\w,.]+/g,
      // Add more currencies as needed
    };

    /**
     * Converts a dollar string value to a number
     * Handles formats like $1,000.00, $3.92K, $1.12M, $50.24T
     */
    function convertDollarValue(str: string): number {
      const multipliers: Record<string, number> = {
        k: 1e3,
        m: 1e6,
        b: 1e9,
        t: 1e12,
      };
      const cleaned = str
        .trim()
        .toLowerCase()
        .replace(/^\$/, "")
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

    // Get Bitcoin price and user preferences from background script
    async function getBitcoinPriceAndPreferences(): Promise<number> {
      return new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(
            { action: "getBitcoinPrice" },
            (response: {
              error?: string;
              price?: number;
              displayMode?: string;
              currency?: string;
              denomination?: string;
            }) => {
              // Check for runtime errors (like disconnected extension)
              if (chrome.runtime.lastError) {
                console.error(
                  "Runtime error getting Bitcoin price:",
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
                console.error("Error getting Bitcoin price:", response.error);
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

                resolve(response?.price || 0);
              }
            }
          );
        } catch (error) {
          console.error("Exception in getBitcoinPriceAndPreferences:", error);
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

    // Get the Bitcoin price and user preferences
    const btcPrice = await getBitcoinPriceAndPreferences();

    if (!btcPrice) {
      console.warn(
        "Opportunity Cost: Failed to get BTC price. Prices will not be converted."
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

    // Function to replace fiat prices with satoshi values in a text node
    const replacePrice = (textNode: Text): void => {
      let content = textNode.textContent || "";
      let modified = false;

      // Get the regex for the user's preferred currency
      const currencyRegex =
        currencyRegexes[
          userPreferences.defaultCurrency as keyof typeof currencyRegexes
        ] || currencyRegexes.usd;

      // Text nodes that should be ignored (containing specific patterns)
      const shouldIgnoreNode = (): boolean => {
        // Ignore text nodes that already have "sats" or "BTC" in them (our own conversions)
        if (content.includes(" sats") || content.includes(" BTC")) {
          return true;
        }

        // Ignore empty or very short text nodes
        if (content.trim().length < 2) {
          return true;
        }

        // Check for text in complex pricing structures
        if (content.includes("List:") || content.includes("Save ")) {
          return true;
        }

        return false;
      };

      // Skip processing if this node should be ignored
      if (shouldIgnoreNode()) {
        return;
      }

      // Replace currency based on the current display mode
      content = content.replace(currencyRegex, (match: string) => {
        // Check if the matched text is part of a more complex string that might contain
        // price comparison or multiple prices
        const surroundingText = content;

        // Skip if there are multiple dollar signs or prices in the text node
        if ((surroundingText.match(/\$/g) || []).length > 1) {
          return match; // Return the original match without modification
        }

        modified = true;

        // Parse the fiat value using our conversion function
        const fiatValue = convertDollarValue(match);

        // Calculate satoshi value
        const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);

        // Increment our conversion counter
        conversionCount++;

        // Return formatted output based on display mode
        if (userPreferences.displayMode === "dual-display") {
          return `${match} | ${formatBitcoinValue(satsValue)}`;
        } else {
          return formatBitcoinValue(satsValue);
        }
      });

      // Update the text node if modifications were made
      if (modified) {
        textNode.textContent = content;
      }
    };

    function processAmazonPrices() {
      document
        .querySelectorAll<HTMLSpanElement>('.a-price span[aria-hidden="true"]')
        .forEach((vis) => {
          if (vis.dataset.btcProcessed) return; // only once
          const raw = vis.textContent?.trim() ?? "";
          if (!/^\$\d{1,3}(?:,\d{3})*(?:\.\d+)?$/.test(raw)) return;
          // compute sats
          const fiat = convertDollarValue(raw);
          const sats = Math.round((fiat / btcPrice) * SATS_IN_BTC);
          const conv =
            userPreferences.displayMode === "dual-display"
              ? `${raw} | ${formatBitcoinValue(sats)}`
              : formatBitcoinValue(sats);
          if (userPreferences.displayMode === "bitcoin-only") {
            // Remove dollar sign span
            const symbolSpan = vis.querySelector(".a-price-symbol");
            if (symbolSpan) symbolSpan.remove();
            // Remove decimal point span
            const holeSpan = vis.querySelector(".a-price-hole");
            if (holeSpan) holeSpan.remove();
            // Replace whole number span with Bitcoin value
            const wholeSpan = vis.querySelector(".a-price-whole");
            if (wholeSpan) {
              wholeSpan.textContent = formatBitcoinValue(sats);
            }
            // Remove fraction span
            const fractionSpan = vis.querySelector(".a-price-fraction");
            if (fractionSpan) fractionSpan.remove();
          } else {
            // Dual display mode - append Bitcoin value
            const badge = document.createElement("span");
            badge.className = "a-price-btc";
            badge.textContent = ` | ${formatBitcoinValue(sats)}`;
            const fractionSpan = vis.querySelector(".a-price-fraction");
            if (fractionSpan) {
              fractionSpan.textContent += ` | ${formatBitcoinValue(sats)}`;
            } else {
              vis.appendChild(badge);
            }
          }
          // update the offscreen span so screen-readers get it too
          const off =
            vis.parentElement?.querySelector<HTMLSpanElement>(".a-offscreen");
          if (off) off.textContent = conv;
          vis.dataset.btcProcessed = "1";
          conversionCount++;
        });
    }

    processAmazonPrices();
    // Start processing the document body
    walkDOM(document.body);

    // Log this page visit with conversion stats
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
