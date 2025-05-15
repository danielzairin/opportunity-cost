/**
 * Opportunity Cost Extension
 *
 * This content script scans the DOM for fiat currency prices and
 * converts them to their Bitcoin satoshi equivalent.
 * It works with the background script for price data and storage.
 */

import type { UserPreferences } from "../storage";

interface CurrencyRegexes {
  [key: string]: RegExp;
}

(async () => {
  try {
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

    // Constants
    const SATS_IN_BTC = 100_000_000;

    // Statistics for tracking conversions
    let conversionCount = 0;

    // User preferences (will be populated from database)
    let userPreferences: UserPreferences = {
      id: "default",
      defaultCurrency: "usd",
      displayMode: "dual-display", // Changed default from 'sats-only' to 'dual-display'
      denomination: "btc", // Default to bitcoin (BTC) instead of satoshis
      autoRefresh: true,
      trackStats: true,
    };

    // Regular expressions for currency patterns
    const currencyRegexes: CurrencyRegexes = {
      // usd: /\$[\s\u00A0]?(\d{1,3}(?:[,]\d{3})*(?:\.\d{1,2})?)/g,
      // eur: /€[\s\u00A0]?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
      // gbp: /£[\s\u00A0]?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
      usd: /\$[\w,.]+/g,
      // Add more currencies as needed
    };

    // Regular expressions for abbreviated currency formats (k, m, b, t) - case insensitive
    // const abbreviatedCurrencyRegexes: CurrencyRegexes = {
    //   usd: /\$[\s\u00A0]?(\d{1,3}(?:[,]\d{3})*(?:\.\d{1,2})?)[\s\u00A0]?([KMBTkmbt])\b/gi,
    //   eur: /€[\s\u00A0]?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)[\s\u00A0]?([KMBTkmbt])\b/gi,
    //   gbp: /£[\s\u00A0]?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)[\s\u00A0]?([KMBTkmbt])\b/gi,
    // };

    // Special case regexes for prices that might be split across elements
    // const specialCurrencyRegexes: CurrencyRegexes = {
    //   // For cases like "$1" with the cents "59" in a separate element
    //   usdDollarOnly: /^\$\s?(\d{1,3}(?:[,]\d{3})*)$/,
    //   usdCentsOnly: /^(\d{1,2})$/,
    // };

    // Currency formatting options
    // const currencyFormatters: CurrencyFormatters = {
    //   usd: (value: number) =>
    //     `$${value.toLocaleString(undefined, {
    //       minimumFractionDigits: 2,
    //       maximumFractionDigits: 2,
    //     })}`,
    //   eur: (value: number) =>
    //     `€${value.toLocaleString(undefined, {
    //       minimumFractionDigits: 2,
    //       maximumFractionDigits: 2,
    //     })}`,
    //   gbp: (value: number) =>
    //     `£${value.toLocaleString(undefined, {
    //       minimumFractionDigits: 2,
    //       maximumFractionDigits: 2,
    //     })}`,
    // };

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
        chrome.runtime.sendMessage(
          { action: "getBitcoinPrice" },
          (response: {
            error?: string;
            price?: number;
            displayMode?: string;
            currency?: string;
          }) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              // Update user preferences if they're included in the response
              if (response.displayMode) {
                userPreferences.displayMode = response.displayMode as
                  | "bitcoin-only"
                  | "dual-display";
                console.log("Display mode set to:", response.displayMode);
              }
              if (response.currency) {
                userPreferences.defaultCurrency = response.currency;
                console.log("Currency set to:", response.currency);
              }

              resolve(response.price || 0);
            }
          }
        );
      });
    }

    // Make sure we have the latest preferences before doing anything else
    async function ensurePreferencesLoaded(): Promise<UserPreferences> {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action: "getPreferences" },
          (response: { error?: string; preferences?: UserPreferences }) => {
            if (response.error) {
              reject(new Error(response.error));
            } else if (response.preferences) {
              // Update our local preferences object with what's in storage
              userPreferences = response.preferences;
              console.log("User preferences loaded:", userPreferences);
              resolve(userPreferences);
            } else {
              resolve(userPreferences); // Use defaults
            }
          }
        );
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

    // // Process Amazon-style split prices where dollar and cents are in separate elements
    // const processAmazonPrices = (): void => {
    //   // Only run on Amazon domains
    //   if (!window.location.hostname.includes("amazon")) {
    //     return;
    //   }

    //   console.log("Opportunity Cost: Checking for Amazon-style prices");

    //   // Process clean whole prices (like $3,150 in product listings)
    //   processAmazonCleanPrices();

    //   // Process split dollar/cents prices
    //   processAmazonSplitPrices();

    //   // Process luxury product pages in grid displays (special case)
    //   processAmazonLuxuryPrices();
    // };

    // // Process Zillow-style real estate prices
    // const processZillowPrices = (): void => {
    //   // Only run on Zillow domains
    //   if (!window.location.hostname.includes("zillow")) {
    //     return;
    //   }

    //   console.log("Opportunity Cost: Checking for Zillow-style prices");

    //   // Process main property listing prices
    //   const propertyPrices = document.querySelectorAll(
    //     '[data-test="property-card-price"], .list-card-price, .ds-price, span[data-testid="price"], h3:first-of-type'
    //   );

    //   propertyPrices.forEach((priceElement: Element) => {
    //     // Skip if we've already processed this element
    //     if (
    //       priceElement.textContent?.includes("sats") ||
    //       priceElement.getAttribute("data-sats-processed") === "true"
    //     ) {
    //       return;
    //     }

    //     const priceText = priceElement.textContent?.trim() || "";
    //     // Zillow often has prices like $2,195,000
    //     const priceMatch = priceText.match(/\$([\d,]+)/);

    //     if (priceMatch) {
    //       const fiatValue = convertDollarValue(priceMatch[0]);

    //       // Only process reasonable real estate price values
    //       if (fiatValue > 0) {
    //         // Calculate satoshi value
    //         const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);

    //         // Create a new element
    //         const newElement = document.createElement("span");

    //         // Format based on user preference
    //         if (userPreferences.displayMode === "dual-display") {
    //           newElement.textContent = `${formatBitcoinValue(
    //             satsValue
    //           )} | $${fiatValue.toLocaleString()}`;
    //           // Add styling to match Zillow's design
    //           if (
    //             priceElement instanceof HTMLElement &&
    //             "style" in priceElement
    //           ) {
    //             newElement.style.cssText = priceElement.style.cssText;
    //           }
    //           newElement.className = priceElement.className;
    //         } else {
    //           newElement.textContent = formatBitcoinValue(satsValue);
    //           if (
    //             priceElement instanceof HTMLElement &&
    //             "style" in priceElement
    //           ) {
    //             newElement.style.cssText = priceElement.style.cssText;
    //           }
    //           newElement.className = priceElement.className;
    //         }

    //         // Mark as processed
    //         newElement.setAttribute("data-sats-processed", "true");

    //         // Replace the original price element
    //         if (priceElement.parentNode) {
    //           priceElement.parentNode.replaceChild(newElement, priceElement);

    //           // Increment conversion counter
    //           conversionCount++;
    //         }
    //       }
    //     }
    //   });

    //   // Process home price headings (on property detail pages)
    //   const priceHeadings = document.querySelectorAll(
    //     'h1 span, h2, .hdp__sc-1tsvzbc-1, [data-testid="home-details-price"]'
    //   );

    //   priceHeadings.forEach((heading: Element) => {
    //     // Skip if already processed
    //     if (
    //       heading.textContent?.includes("sats") ||
    //       heading.getAttribute("data-sats-processed") === "true"
    //     ) {
    //       return;
    //     }

    //     const headingText = heading.textContent || "";
    //     const priceMatch = headingText.match(/\$([\d,]+)/);

    //     if (priceMatch) {
    //       const fiatValue = convertDollarValue(priceMatch[0]);

    //       if (fiatValue > 0) {
    //         // Calculate satoshi value
    //         const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);

    //         // Create a new element - we'll use the same tag to preserve styling
    //         const tagName = heading.tagName.toLowerCase();
    //         const newElement = document.createElement(tagName);

    //         // Format based on user preference
    //         if (userPreferences.displayMode === "dual-display") {
    //           newElement.textContent = `${formatBitcoinValue(
    //             satsValue
    //           )} | $${fiatValue.toLocaleString()}`;
    //         } else {
    //           newElement.textContent = formatBitcoinValue(satsValue);
    //         }

    //         // Copy over styling and classes
    //         if (heading instanceof HTMLElement && "style" in heading) {
    //           newElement.style.cssText = heading.style.cssText;
    //         }
    //         newElement.className = heading.className;

    //         // Mark as processed
    //         newElement.setAttribute("data-sats-processed", "true");

    //         // Replace the heading
    //         if (heading.parentNode) {
    //           heading.parentNode.replaceChild(newElement, heading);

    //           // Increment conversion counter
    //           conversionCount++;
    //         }
    //       }
    //     }
    //   });
    // };

    // // Process prices on Google Finance pages
    // const processGoogleFinancePrices = (): void => {
    //   // Only run on Google Finance domains
    //   if (
    //     !window.location.hostname.includes("google.com") ||
    //     !window.location.pathname.includes("/finance")
    //   ) {
    //     return;
    //   }

    //   console.log("Opportunity Cost: Checking for Google Finance prices");

    //   // Process main stock price - the large current price displayed at the top of the page
    //   const mainPriceSelector =
    //     "div[jsname] > div > div:first-child > div:first-child > div > div > div > div > span";
    //   const mainPriceElements = document.querySelectorAll(mainPriceSelector);

    //   // Process "After Hours" prices
    //   // const afterHoursPriceSelector =
    //   //   'div[jsname] > div > div > span:contains("After Hours")';
    //   // const afterHoursElements = document.querySelectorAll(
    //   //   'div[role="heading"]:contains("After Hours")'
    //   // );

    //   // Process both main price and after hours prices
    //   const processStockPrice = (priceElement: Element): void => {
    //     // Skip if we've already processed this element
    //     if (
    //       priceElement.textContent?.includes("sats") ||
    //       priceElement.textContent?.includes("BTC") ||
    //       priceElement.getAttribute("data-sats-processed") === "true"
    //     ) {
    //       return;
    //     }

    //     const priceText = priceElement.textContent?.trim() || "";
    //     // Stock price format $123.45
    //     const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);

    //     if (priceMatch) {
    //       const fiatValue = convertDollarValue(priceMatch[0]);

    //       // Only process reasonable stock price values
    //       if (fiatValue > 0 && fiatValue < 100000) {
    //         // Reasonable stock price range
    //         // Calculate satoshi value
    //         const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);

    //         // Create a new element that matches the original
    //         const newElement = document.createElement(
    //           priceElement.tagName || "span"
    //         );

    //         // Format based on user preference
    //         if (userPreferences.displayMode === "dual-display") {
    //           newElement.textContent = `${formatBitcoinValue(
    //             satsValue
    //           )} | $${fiatValue.toFixed(2)}`;
    //         } else {
    //           newElement.textContent = formatBitcoinValue(satsValue);
    //         }

    //         // Copy over styling and classes to maintain the look and feel
    //         if (
    //           priceElement instanceof HTMLElement &&
    //           "style" in priceElement
    //         ) {
    //           newElement.style.cssText = priceElement.style.cssText;
    //         }
    //         newElement.className = priceElement.className;

    //         // Mark as processed
    //         newElement.setAttribute("data-sats-processed", "true");

    //         try {
    //           // Replace the original price element
    //           if (priceElement.parentNode) {
    //             priceElement.parentNode.replaceChild(newElement, priceElement);

    //             // Increment conversion counter
    //             conversionCount++;
    //           }
    //         } catch (e) {
    //           console.error("Error replacing Google Finance price element:", e);
    //         }
    //       }
    //     }
    //   };

    //   // Process the main price elements
    //   mainPriceElements.forEach(processStockPrice);

    //   // Process pre/after hours and other price elements
    //   document.querySelectorAll("span, div").forEach((el: Element) => {
    //     const text = el.textContent?.trim() || "";
    //     if (
    //       text.startsWith("$") &&
    //       /^\$[\d,]+\.\d+$/.test(text) &&
    //       !el.getAttribute("data-sats-processed")
    //     ) {
    //       processStockPrice(el);
    //     }
    //   });

    //   // Target specific "After Hours" structure
    //   document
    //     .querySelectorAll('div[role="heading"] + div span')
    //     .forEach((el: Element) => {
    //       if (
    //         el.textContent &&
    //         /\$[\d,]+\.\d+/.test(el.textContent) &&
    //         !el.getAttribute("data-sats-processed")
    //       ) {
    //         processStockPrice(el);
    //       }
    //     });

    //   // Handle stock price in the header section
    //   document
    //     .querySelectorAll('c-wiz div[role="heading"] + div span')
    //     .forEach((el: Element) => {
    //       if (
    //         el.textContent &&
    //         /\$[\d,]+\.\d+/.test(el.textContent) &&
    //         !el.getAttribute("data-sats-processed")
    //       ) {
    //         processStockPrice(el);
    //       }
    //     });
    // };

    // const processAmazonCleanPrices = (): void => {
    //   // Look for clean price elements like $3,150 on product pages and listings
    //   const cleanPriceElements = document.querySelectorAll(
    //     '.a-price, span.a-offscreen, [class*="price-"][class*="whole"]'
    //   );

    //   cleanPriceElements.forEach((priceElement: Element) => {
    //     // Skip if we've already processed this element
    //     if (
    //       priceElement.textContent?.includes("sats") ||
    //       priceElement.getAttribute("data-sats-processed") === "true"
    //     ) {
    //       return;
    //     }

    //     // Get text content, might be hidden
    //     const priceText = priceElement.textContent?.trim() || "";

    //     // Check for "a-offscreen" elements which often contain the clean price
    //     if (priceElement.classList.contains("a-offscreen")) {
    //       if (priceText.match(/^\$[\d,]+(\.\d{2})?$/)) {
    //         // Extract the parent element which displays the visible price
    //         const parentPrice = priceElement.closest(".a-price");
    //         if (
    //           parentPrice &&
    //           !parentPrice.getAttribute("data-sats-processed")
    //         ) {
    //           // Extract the price value
    //           const priceMatch = priceText.match(/\$([0-9,]+\.?\d*)/);
    //           if (priceMatch) {
    //             const fiatValue = convertDollarValue(priceMatch[0]);

    //             // Only process reasonable price values
    //             if (fiatValue > 0 && fiatValue < 1000000) {
    //               // Calculate satoshi value
    //               const satsValue = Math.round(
    //                 (fiatValue / btcPrice) * SATS_IN_BTC
    //               );

    //               // Create a new element for the price
    //               const newElement = document.createElement("span");
    //               newElement.className = "a-price"; // Keep same class for styling

    //               // Format based on user preference
    //               if (userPreferences.displayMode === "dual-display") {
    //                 newElement.textContent = `${formatBitcoinValue(
    //                   satsValue
    //                 )} | $${fiatValue.toFixed(2)}`;
    //               } else {
    //                 newElement.textContent = formatBitcoinValue(satsValue);
    //               }

    //               // Replace the original price element
    //               if (parentPrice.parentNode) {
    //                 parentPrice.parentNode.replaceChild(
    //                   newElement,
    //                   parentPrice
    //                 );

    //                 // Increment conversion counter
    //                 conversionCount++;
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   });
    // };

    // const processAmazonSplitPrices = (): void => {
    //   // Look for price elements that match Amazon's split pattern
    //   // This is typically where you see price like "$1" with superscript "59"
    //   const priceElements = document.querySelectorAll(
    //     '.a-price-whole, [class*="price-whole"]'
    //   );

    //   priceElements.forEach((priceElement: Element) => {
    //     // Skip if we've already processed this element (has our sats conversion)
    //     if (
    //       priceElement.textContent?.includes("sats") ||
    //       priceElement.getAttribute("data-sats-processed") === "true"
    //     ) {
    //       return;
    //     }

    //     // Often in Amazon, the price has a dollars component and a cents component
    //     const dollarElement = priceElement;
    //     let centsElement: Element | null = null;

    //     // Check if this element itself contains just a dollar amount
    //     const dollarMatch = priceElement.textContent?.match(
    //       /^[\s\\$]?(\d{1,3}(?:[,]\d{3})*)[\s]*$/
    //     );
    //     if (dollarMatch) {
    //       // Look for a sibling with cents (.a-price-fraction)
    //       const fractionElement = priceElement.parentNode
    //         ? (priceElement.parentNode as Element).querySelector(
    //             ".a-price-fraction"
    //           )
    //         : null;
    //       if (fractionElement) {
    //         centsElement = fractionElement;
    //       }

    //       // If we found a valid price pair, process it
    //       if (dollarElement && centsElement) {
    //         const dollars = parseFloat(dollarMatch[1].replace(/,/g, ""));
    //         const cents = parseInt(centsElement.textContent || "0", 10) || 0;
    //         const fiatValue = dollars + cents / 100;

    //         // Only process reasonable price values
    //         if (fiatValue > 0 && fiatValue < 1000000) {
    //           // Calculate satoshi value
    //           const satsValue = Math.round(
    //             (fiatValue / btcPrice) * SATS_IN_BTC
    //           );

    //           // Find the parent price container to replace
    //           const priceContainer =
    //             priceElement.closest(".a-price") || priceElement.parentNode;

    //           // Create a new element to replace the price
    //           const newElement = document.createElement("span");

    //           // Format based on user preference
    //           if (userPreferences.displayMode === "dual-display") {
    //             newElement.textContent = `${formatBitcoinValue(
    //               satsValue
    //             )} | $${fiatValue.toFixed(2)}`;
    //           } else {
    //             newElement.textContent = formatBitcoinValue(satsValue);
    //           }

    //           // Mark as processed
    //           newElement.setAttribute("data-sats-processed", "true");

    //           // Replace the entire price container
    //           if (priceContainer && priceContainer.parentNode) {
    //             priceContainer.parentNode.replaceChild(
    //               newElement,
    //               priceContainer
    //             );

    //             // Increment conversion counter
    //             conversionCount++;
    //           }
    //         }
    //       }
    //     }
    //   });
    // };

    // const processAmazonLuxuryPrices = (): void => {
    //   // Target luxury product listings that have different price formats
    //   const luxuryPriceElements = document.querySelectorAll(
    //     'span[id*="price"], div[id*="price"], span[id*="Price"], div[id*="Price"]'
    //   );

    //   luxuryPriceElements.forEach((priceElement: Element) => {
    //     // Skip if already processed
    //     if (
    //       priceElement.textContent?.includes("sats") ||
    //       priceElement.getAttribute("data-sats-processed") === "true"
    //     ) {
    //       return;
    //     }

    //     const priceText = priceElement.textContent?.trim() || "";
    //     const priceMatch = priceText.match(/\$([\d,]+(\.\d{2})?)/);

    //     if (priceMatch) {
    //       const fiatValue = convertDollarValue(priceMatch[0]);

    //       // Only process reasonable price values
    //       if (fiatValue > 0 && fiatValue < 1000000) {
    //         // Calculate satoshi value
    //         const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);

    //         // Create a new element
    //         const newElement = document.createElement("span");

    //         // Format based on user preference
    //         if (userPreferences.displayMode === "dual-display") {
    //           newElement.textContent = `${formatBitcoinValue(
    //             satsValue
    //           )} | $${fiatValue.toFixed(2)}`;
    //         } else {
    //           newElement.textContent = formatBitcoinValue(satsValue);
    //         }

    //         // Mark as processed
    //         newElement.setAttribute("data-sats-processed", "true");

    //         // Replace the original price element
    //         if (priceElement.parentNode) {
    //           priceElement.parentNode.replaceChild(newElement, priceElement);

    //           // Increment conversion counter
    //           conversionCount++;
    //         }
    //       }
    //     }
    //   });

    //   // Special case for luxury product grid views
    //   document
    //     .querySelectorAll(
    //       '.s-result-item, [data-component-type="s-search-result"]'
    //     )
    //     .forEach((item: Element) => {
    //       // Skip already processed items
    //       if (item.getAttribute("data-sats-processed") === "true") {
    //         return;
    //       }

    //       // Find price elements in this grid item
    //       const itemPrice = item.querySelector(
    //         "span.a-price, .a-price, .a-color-base"
    //       );

    //       if (itemPrice && !itemPrice.getAttribute("data-sats-processed")) {
    //         const priceText = itemPrice.textContent?.trim() || "";
    //         const priceMatch = priceText.match(/\$([\d,]+(\.\d{2})?)/);

    //         if (priceMatch) {
    //           const fiatValue = convertDollarValue(priceMatch[0]);

    //           // Only process reasonable price values
    //           if (fiatValue > 0 && fiatValue < 1000000) {
    //             // Calculate satoshi value
    //             const satsValue = Math.round(
    //               (fiatValue / btcPrice) * SATS_IN_BTC
    //             );

    //             // Create a new element
    //             const newElement = document.createElement("span");

    //             // Format based on user preference
    //             if (userPreferences.displayMode === "dual-display") {
    //               newElement.textContent = `${formatBitcoinValue(
    //                 satsValue
    //               )} | $${fiatValue.toFixed(2)}`;
    //             } else {
    //               newElement.textContent = formatBitcoinValue(satsValue);
    //             }

    //             // Mark as processed
    //             newElement.setAttribute("data-sats-processed", "true");

    //             // Replace the original price element
    //             if (itemPrice.parentNode) {
    //               itemPrice.parentNode.replaceChild(newElement, itemPrice);

    //               // Mark parent as processed to avoid duplication
    //               item.setAttribute("data-sats-processed", "true");

    //               // Increment conversion counter
    //               conversionCount++;
    //             }
    //           }
    //         }
    //       }
    //     });
    // };

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
      // const currencyFormatter =
      //   currencyFormatters[
      //     userPreferences.defaultCurrency as keyof typeof currencyFormatters
      //   ] || currencyFormatters.usd;

      // // Process abbreviated currency formats (k, m, b, t)
      // const abbreviatedRegex =
      //   abbreviatedCurrencyRegexes[
      //     userPreferences.defaultCurrency as keyof typeof abbreviatedCurrencyRegexes
      //   ] || abbreviatedCurrencyRegexes.usd;
      // const currencySymbol =
      //   userPreferences.defaultCurrency === "usd"
      //     ? "$"
      //     : userPreferences.defaultCurrency === "eur"
      //     ? "€"
      //     : "£";

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
          return `${formatBitcoinValue(satsValue)} | ${match}`;
        } else {
          return formatBitcoinValue(satsValue);
        }
      });

      // Process abbreviated currency values (k, m, b, t)
      // if (!modified) {
      //   // Process each abbreviation format
      //   const abbrMatch = content.match(abbreviatedRegex);
      //   if (abbrMatch) {
      //     const match = abbrMatch[0];
      //     const groups = abbreviatedRegex.exec(content);

      //     if (groups && groups.length >= 3) {
      //       const value = groups[1];
      //       const abbr = groups[2];

      //       // Parse the abbreviated value
      //       const fiatValue = convertDollarValue(`$${value}${abbr}`);

      //       // Only process reasonable values
      //       if (fiatValue > 0) {
      //         // Calculate satoshi value
      //         const satsValue = Math.round(
      //           (fiatValue / btcPrice) * SATS_IN_BTC
      //         );

      //         // Format replacement based on user preference
      //         let replacement: string;
      //         if (userPreferences.displayMode === "dual-display") {
      //           let formattedFiatValue: string;

      //           if (fiatValue >= 1000000000) {
      //             formattedFiatValue = `${(fiatValue / 1000000000).toFixed(
      //               2
      //             )}B`;
      //           } else if (fiatValue >= 1000000) {
      //             formattedFiatValue = `${(fiatValue / 1000000).toFixed(2)}M`;
      //           } else if (fiatValue >= 1000) {
      //             formattedFiatValue = `${(fiatValue / 1000).toFixed(2)}K`;
      //           } else {
      //             formattedFiatValue = fiatValue.toFixed(2);
      //           }

      //           replacement = `${formatBitcoinValue(
      //             satsValue
      //           )} | ${currencySymbol}${formattedFiatValue}`;
      //         } else {
      //           replacement = formatBitcoinValue(satsValue);
      //         }

      //         // Replace the matched text with our conversion
      //         content = content.replace(match, replacement);
      //         modified = true;

      //         // Increment conversion counter
      //         conversionCount++;
      //       }
      //     }
      //   }
      // }

      // Update the text node if modifications were made
      if (modified) {
        textNode.textContent = content;
      }
    };

    // Start processing the document body
    walkDOM(document.body);

    // // Process Amazon-specific price formats
    // if (window.location.hostname.includes("amazon")) {
    //   processAmazonPrices();

    //   // Also process Amazon prices after a short delay to catch any lazy-loaded content
    //   setTimeout(processAmazonPrices, 1500);
    //   setTimeout(processAmazonPrices, 3000);
    // }

    // // Process Zillow-specific price formats
    // if (window.location.hostname.includes("zillow")) {
    //   processZillowPrices();

    //   // Real estate sites often load content dynamically as you scroll
    //   setTimeout(processZillowPrices, 1500);
    //   setTimeout(processZillowPrices, 3000);
    // }

    // // Process Google Finance price formats
    // if (
    //   window.location.hostname.includes("google.com") &&
    //   window.location.pathname.includes("/finance")
    // ) {
    //   processGoogleFinancePrices();

    //   // Finance apps update prices frequently - check more often
    //   setTimeout(processGoogleFinancePrices, 1000);
    //   setTimeout(processGoogleFinancePrices, 2000);
    //   setInterval(processGoogleFinancePrices, 5000); // Continuous monitoring for live prices
    // }

    // Log this page visit with conversion stats
    logPageVisit();

    // Set up a MutationObserver to handle dynamically added content
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      let newConversions = 0;
      const processChanges = (): void => {
        mutations.forEach((mutation: MutationRecord) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node: Node) => walkDOM(node));
          }
        });

        // // Process Amazon-specific prices if on Amazon
        // if (window.location.hostname.includes("amazon")) {
        //   processAmazonPrices();
        // }

        // // Process Zillow-specific prices if on Zillow
        // if (window.location.hostname.includes("zillow")) {
        //   processZillowPrices();
        // }

        // // Process Google Finance prices if on Google Finance
        // if (
        //   window.location.hostname.includes("google.com") &&
        //   window.location.pathname.includes("/finance")
        // ) {
        //   processGoogleFinancePrices();
        // }

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
    alert(JSON.stringify(error));
    console.error("Opportunity Cost: An error occurred:", error);
    // Graceful fallback - leave prices untouched
  }
})();
