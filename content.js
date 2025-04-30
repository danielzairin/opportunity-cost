/**
 * Opportunity Cost Extension
 * 
 * This content script scans the DOM for fiat currency prices and
 * converts them to their Bitcoin satoshi equivalent.
 * It works with the background script for price data and storage.
 */

(async () => {
  try {
    // Constants
    const SATS_IN_BTC = 100_000_000;
    
    // Statistics for tracking conversions
    let conversionCount = 0;
    
    // User preferences (will be populated from database)
    let userPreferences = {
      defaultCurrency: 'usd',
      displayMode: 'dual-display', // Changed default from 'sats-only' to 'dual-display'
      autoRefresh: true,
      trackStats: true
    };
    
    // Regular expressions for currency patterns
    const currencyRegexes = {
      usd: /\$[\s\u00A0]?(\d{1,3}(?:[,]\d{3})*(?:\.\d{1,2})?)/g,
      eur: /€[\s\u00A0]?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
      gbp: /£[\s\u00A0]?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
      // Add more currencies as needed
    };
    
    // Currency formatting options
    const currencyFormatters = {
      usd: (value) => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      eur: (value) => `€${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      gbp: (value) => `£${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
    };
    
    // Get Bitcoin price and user preferences from background script
    async function getBitcoinPriceAndPreferences() {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'getBitcoinPrice' }, response => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            // Update user preferences if they're included in the response
            if (response.displayMode) {
              userPreferences.displayMode = response.displayMode;
              console.log("Display mode set to:", response.displayMode);
            }
            if (response.currency) {
              userPreferences.defaultCurrency = response.currency;
              console.log("Currency set to:", response.currency);
            }
            
            resolve(response.price);
          }
        });
      });
    }
    
    // Make sure we have the latest preferences before doing anything else
    async function ensurePreferencesLoaded() {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'getPreferences' }, response => {
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
        });
      });
    }
    
    // Log this page visit to database once conversions are done
    function logPageVisit() {
      // Only log if we actually did conversions and tracking is enabled
      if (conversionCount > 0 && userPreferences.trackStats) {
        const url = window.location.href;
        chrome.runtime.sendMessage({ 
          action: 'saveVisitedSite',
          url: url,
          conversionCount: conversionCount
        });
      }
    }
    
    // Make sure preferences are loaded before anything else
    await ensurePreferencesLoaded();
    
    // Get the Bitcoin price and user preferences
    const btcPrice = await getBitcoinPriceAndPreferences();
    
    if (!btcPrice) {
      console.warn('Opportunity Cost: Failed to get BTC price. Prices will not be converted.');
      return;
    }
    
    // Function to walk through the DOM and process text nodes
    const walkDOM = (node) => {
      // Skip script and style elements - we don't need to process their text content
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        if (['script', 'style', 'noscript'].includes(tagName)) {
          return;
        }
      }
      
      // Process text nodes - this is what contains the prices
      if (node.nodeType === Node.TEXT_NODE) {
        replacePrice(node);
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
    const replacePrice = (textNode) => {
      let content = textNode.textContent;
      let modified = false;
      
      // Get the regex for the user's preferred currency
      const currencyRegex = currencyRegexes[userPreferences.defaultCurrency] || currencyRegexes.usd;
      const currencyFormatter = currencyFormatters[userPreferences.defaultCurrency] || currencyFormatters.usd;
      
      // Text nodes that should be ignored (containing specific patterns)
      const shouldIgnoreNode = () => {
        // Ignore text nodes that already have "sats" in them (our own conversions)
        if (content.includes(" sats")) {
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
      content = content.replace(currencyRegex, (match, numStr) => {
        // Check if the matched text is part of a more complex string that might contain
        // price comparison or multiple prices
        const surroundingText = content;
        
        // Skip if there are multiple dollar signs or prices in the text node
        if ((surroundingText.match(/\$/g) || []).length > 1) {
          return match; // Return the original match without modification
        }
        
        modified = true;
        
        // Parse the fiat value (handling both comma and period as decimal separators)
        let fiatValue;
        if (userPreferences.defaultCurrency === 'usd') {
          // US format: 1,234.56
          fiatValue = parseFloat(numStr.replace(/,/g, ""));
        } else {
          // European format: 1.234,56 or 1 234,56
          fiatValue = parseFloat(numStr.replace(/\./g, "").replace(/,/g, ".").replace(/\s/g, ""));
        }
        
        // Skip very large or very small values that might be identifiers or codes
        if (fiatValue > 1000000 || fiatValue < 0.01) {
          return match; // Return original without modification
        }
        
        // Calculate satoshi value
        const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);
        
        // Increment our conversion counter
        conversionCount++;
        
        // Return formatted output based on display mode
        if (userPreferences.displayMode === 'dual-display') {
          return `${satsValue.toLocaleString()} sats | ${currencyFormatter(fiatValue)}`;
        } else {
          return `${satsValue.toLocaleString()} sats`;
        }
      });
      
      // Update the text node if modifications were made
      if (modified) {
        textNode.textContent = content;
      }
    };
    
    // Start processing the document body
    walkDOM(document.body);
    
    // Log this page visit with conversion stats
    logPageVisit();
    
    // Set up a MutationObserver to handle dynamically added content
    const observer = new MutationObserver((mutations) => {
      let newConversions = 0;
      const processChanges = () => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(walkDOM);
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
      subtree: true
    });
    
    // Add an event listener for when the page is about to be unloaded
    window.addEventListener('beforeunload', () => {
      // Final log before page unloads
      logPageVisit();
    });
    
  } catch (error) {
    console.error('Opportunity Cost: An error occurred:', error);
    // Graceful fallback - leave prices untouched
  }
})();
