/**
 * Price-in-Sats Chrome Extension
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
      displayMode: 'sats-only',
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
            }
            if (response.currency) {
              userPreferences.defaultCurrency = response.currency;
            }
            
            resolve(response.price);
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
    
    // Get the Bitcoin price and user preferences
    const btcPrice = await getBitcoinPriceAndPreferences();
    
    if (!btcPrice) {
      console.warn('Price-in-Sats: Failed to get BTC price. Prices will not be converted.');
      return;
    }
    
    // Function to walk through the DOM and process text nodes
    const walkDOM = (node) => {
      // Skip already processed nodes
      if (node.hasAttribute && node.hasAttribute('data-sats-processed')) {
        return;
      }
      
      // Skip certain elements that shouldn't be processed
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Get the tag name in lowercase
        const tagName = node.tagName.toLowerCase();
        
        // Skip certain types of elements entirely
        if (['script', 'style', 'noscript', 'svg', 'canvas', 'input', 'textarea', 'select', 'option'].includes(tagName)) {
          return;
        }
        
        // Skip elements with certain classes/IDs that indicate complex price structures
        const classNames = node.className ? node.className.toLowerCase() : '';
        const id = node.id ? node.id.toLowerCase() : '';
        
        if (classNames.includes('savings') || 
            classNames.includes('discount') || 
            classNames.includes('price-list') ||
            id.includes('savings') || 
            id.includes('discount')) {
          // Mark as processed to avoid revisiting
          if (node.setAttribute) {
            node.setAttribute('data-sats-processed', 'skipped');
          }
          return;
        }
      }
      
      // Process text nodes
      if (node.nodeType === Node.TEXT_NODE) {
        replacePrice(node);
      }
      // Recursively process child nodes
      else if (node.nodeType === Node.ELEMENT_NODE) {
        // Mark this element as processed
        if (node.setAttribute) {
          node.setAttribute('data-sats-processed', 'true');
        }
        
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
        
        // Check if the node is part of a complex pricing structure
        const parentElement = textNode.parentElement;
        if (!parentElement) {
          return false;
        }
        
        const parentText = parentElement.textContent;
        const grandParentElement = parentElement.parentElement;
        const grandParentText = grandParentElement ? grandParentElement.parentElement : '';
        
        // Don't process nodes that already have multiple prices or sats mentions
        if (parentText && (
            (parentText.match(/\$/g) || []).length > 2 || // More than 2 dollar signs
            parentText.includes(" sats") ||  // Already has satoshis
            (parentText.match(/sats/g) || []).length > 0 || // Already has "sats" mentioned
            parentText.includes("List:") || // List prices
            parentText.includes("Save") ||  // Save amount text
            parentText.toLowerCase().includes("coupon") // Coupon text
           )) {
          return true;
        }
        
        // Check for specific cases from the screenshots
        // Handling for creatine powder example (multiple values in a row)
        if (
          (content.match(/sats/g) || []).length > 1 ||  // Multiple "sats" occurrences
          (content.includes("|") && content.includes("sats")) || // Format like "X sats | Y sats"
          (content.includes("As low as")) // "As low as" pricing
        ) {
          return true;
        }
        
        // Check parent element attributes for hints about pricing structures
        const parentClass = parentElement.className || '';
        const parentTagName = parentElement.tagName ? parentElement.tagName.toLowerCase() : '';
        
        if (
          parentClass.toLowerCase().includes('price') ||
          parentClass.toLowerCase().includes('saving') ||
          parentClass.toLowerCase().includes('discount') ||
          parentClass.toLowerCase().includes('strike') ||
          parentClass.toLowerCase().includes('original') ||
          parentTagName === 'strike' ||
          parentTagName === 'del' ||
          parentTagName === 's'
        ) {
          return true;
        }
        
        // Look for specific patterns from the screenshots
        if (
          // Match the "58,116 sats | 58,116 sats | $55.99" pattern
          (/\d{1,3}(?:[,]\d{3})*\s+sats\s+\|/).test(parentText) ||
          // Match list price patterns
          (/list:.*sats/i).test(parentText) ||
          // Match save amount patterns
          (/save.*sats/i).test(parentText)
        ) {
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
    console.error('Price-in-Sats: An error occurred:', error);
    // Graceful fallback - leave prices untouched
  }
})();
