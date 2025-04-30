/**
 * Opportunity Cost Firefox Extension
 * 
 * This content script scans the DOM for fiat currency prices and
 * converts them to their Bitcoin satoshi equivalent.
 * It works with the background script for price data and storage.
 */

// Detect when we're returning a promise from a message handler
// This fixes Firefox message passing
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  return true; // Will respond asynchronously
});

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
    
    // Special case regexes for prices that might be split across elements
    const specialCurrencyRegexes = {
      // For cases like "$1" with the cents "59" in a separate element
      usdDollarOnly: /^\$\s?(\d{1,3}(?:[,]\d{3})*)$/,
      usdCentsOnly: /^(\d{1,2})$/,
      // For matching clean prices like $3,150
      usdCleanPrice: /\$([\d,]+(\.\d{2})?)/
    };
    
    // Currency formatting options
    const currencyFormatters = {
      usd: (value) => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      eur: (value) => `€${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      gbp: (value) => `£${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
    };
    
    // Get Bitcoin price and user preferences from background script
    async function getBitcoinPriceAndPreferences() {
      try {
        const response = await browser.runtime.sendMessage({ action: 'getBitcoinPrice' });
        if (response.error) {
          throw new Error(response.error);
        }
          
        // Update user preferences if they're included in the response
        if (response.displayMode) {
          userPreferences.displayMode = response.displayMode;
          console.log("Display mode set to:", response.displayMode);
        }
        if (response.currency) {
          userPreferences.defaultCurrency = response.currency;
          console.log("Currency set to:", response.currency);
        }
            
        return response.price;
      } catch (error) {
        console.error("Error getting Bitcoin price:", error);
        throw error;
      }
    }
    
    // Make sure we have the latest preferences before doing anything else
    async function ensurePreferencesLoaded() {
      try {
        const response = await browser.runtime.sendMessage({ action: 'getPreferences' });
        if (response.error) {
          throw new Error(response.error);
        } 
        
        if (response.preferences) {
          // Update our local preferences object with what's in storage
          userPreferences = response.preferences;
          console.log("User preferences loaded:", userPreferences);
        }
        
        return userPreferences;
      } catch (error) {
        console.error("Error loading preferences:", error);
        return userPreferences; // Use defaults as fallback
      }
    }
    
    // Log this page visit to database once conversions are done
    function logPageVisit() {
      // Only log if we actually did conversions and tracking is enabled
      if (conversionCount > 0 && userPreferences.trackStats) {
        const url = window.location.href;
        browser.runtime.sendMessage({ 
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
    
    // Process Amazon-style split prices where dollar and cents are in separate elements
    const processAmazonPrices = () => {
      // Only run on Amazon domains
      if (!window.location.hostname.includes('amazon')) {
        return;
      }
      
      console.log('Opportunity Cost: Checking for Amazon-style prices');
      
      // Process clean whole prices (like $3,150 in product listings)
      processAmazonCleanPrices();
      
      // Process split dollar/cents prices
      processAmazonSplitPrices();
      
      // Process luxury product pages in grid displays (special case)
      processAmazonLuxuryPrices();
    };
    
    const processAmazonCleanPrices = () => {
      // Look for clean price elements like $3,150 on product pages and listings
      const cleanPriceElements = document.querySelectorAll('.a-price, span.a-offscreen, [class*="price-"][class*="whole"]');
      
      cleanPriceElements.forEach(priceElement => {
        // Skip if we've already processed this element
        if (priceElement.textContent.includes('sats') || 
            priceElement.getAttribute('data-sats-processed') === 'true') {
          return;
        }
        
        // Get text content, might be hidden
        let priceText = priceElement.textContent.trim();
        
        // Check for "a-offscreen" elements which often contain the clean price
        if (priceElement.classList.contains('a-offscreen')) {
          if (priceText.match(/^\$[\d,]+(\.\d{2})?$/)) {
            // Extract the parent element which displays the visible price
            const parentPrice = priceElement.closest('.a-price');
            if (parentPrice && !parentPrice.getAttribute('data-sats-processed')) {
              // Extract the price value
              const priceMatch = priceText.match(/\$([0-9,]+\.?\d*)/);
              if (priceMatch) {
                const fiatValue = parseFloat(priceMatch[1].replace(/,/g, ''));
                
                // Only process reasonable price values
                if (fiatValue > 0 && fiatValue < 1000000) {
                  // Calculate satoshi value
                  const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);
                  
                  // Create a new element for the price
                  const newElement = document.createElement('span');
                  newElement.className = 'a-price'; // Keep same class for styling
                  
                  // Format based on user preference
                  if (userPreferences.displayMode === 'dual-display') {
                    newElement.textContent = `${satsValue.toLocaleString()} sats | $${fiatValue.toFixed(2)}`;
                  } else {
                    newElement.textContent = `${satsValue.toLocaleString()} sats`;
                  }
                  
                  // Replace the original price element
                  parentPrice.parentNode.replaceChild(newElement, parentPrice);
                  
                  // Increment conversion counter
                  conversionCount++;
                }
              }
            }
          }
        } 
      });
    };
    
    const processAmazonSplitPrices = () => {
      // Look for price elements that match Amazon's split pattern
      // This is typically where you see price like "$1" with superscript "59"
      const priceElements = document.querySelectorAll('.a-price-whole, [class*="price-whole"]');
      
      priceElements.forEach(priceElement => {
        // Skip if we've already processed this element (has our sats conversion)
        if (priceElement.textContent.includes('sats') || 
            priceElement.getAttribute('data-sats-processed') === 'true') {
          return;
        }
        
        // Often in Amazon, the price has a dollars component and a cents component
        let dollarElement = priceElement;
        let centsElement = null;
        
        // Check if this element itself contains just a dollar amount
        const dollarMatch = priceElement.textContent.match(/^[\s\$]?(\d{1,3}(?:[,]\d{3})*)[\s]*$/);
        if (dollarMatch) {
          // Look for a sibling with cents (.a-price-fraction)
          const fractionElement = priceElement.parentNode.querySelector('.a-price-fraction');
          if (fractionElement) {
            centsElement = fractionElement;
          }
          
          // If we found a valid price pair, process it
          if (dollarElement && centsElement) {
            const dollars = parseFloat(dollarMatch[1].replace(/,/g, ''));
            const cents = parseInt(centsElement.textContent, 10) || 0;
            const fiatValue = dollars + (cents / 100);
            
            // Only process reasonable price values
            if (fiatValue > 0 && fiatValue < 1000000) {
              // Calculate satoshi value
              const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);
              
              // Find the parent price container to replace
              const priceContainer = priceElement.closest('.a-price') || priceElement.parentNode;
              
              // Create a new element to replace the price
              const newElement = document.createElement('span');
              
              // Format based on user preference
              if (userPreferences.displayMode === 'dual-display') {
                newElement.textContent = `${satsValue.toLocaleString()} sats | $${fiatValue.toFixed(2)}`;
              } else {
                newElement.textContent = `${satsValue.toLocaleString()} sats`;
              }
              
              // Mark as processed
              newElement.setAttribute('data-sats-processed', 'true');
              
              // Replace the entire price container
              priceContainer.parentNode.replaceChild(newElement, priceContainer);
              
              // Increment conversion counter
              conversionCount++;
            }
          }
        }
      });
    };
    
    const processAmazonLuxuryPrices = () => {
      // Target luxury product listings that have different price formats
      const luxuryPriceElements = document.querySelectorAll('span[id*="price"], div[id*="price"], span[id*="Price"], div[id*="Price"]');
      
      luxuryPriceElements.forEach(priceElement => {
        // Skip if already processed
        if (priceElement.textContent.includes('sats') || 
            priceElement.getAttribute('data-sats-processed') === 'true') {
          return;
        }
        
        const priceText = priceElement.textContent.trim();
        const priceMatch = priceText.match(/\$([\d,]+(\.\d{2})?)/);
        
        if (priceMatch) {
          const fiatValue = parseFloat(priceMatch[1].replace(/,/g, ''));
          
          // Only process reasonable price values
          if (fiatValue > 0 && fiatValue < 1000000) {
            // Calculate satoshi value
            const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);
            
            // Create a new element
            const newElement = document.createElement('span');
            
            // Format based on user preference
            if (userPreferences.displayMode === 'dual-display') {
              newElement.textContent = `${satsValue.toLocaleString()} sats | $${fiatValue.toFixed(2)}`;
            } else {
              newElement.textContent = `${satsValue.toLocaleString()} sats`;
            }
            
            // Mark as processed
            newElement.setAttribute('data-sats-processed', 'true');
            
            // Replace the original price element
            priceElement.parentNode.replaceChild(newElement, priceElement);
            
            // Increment conversion counter
            conversionCount++;
          }
        }
      });
      
      // Special case for luxury product grid views
      document.querySelectorAll('.s-result-item, [data-component-type="s-search-result"]').forEach(item => {
        // Skip already processed items
        if (item.getAttribute('data-sats-processed') === 'true') {
          return;
        }
        
        // Find price elements in this grid item
        const itemPrice = item.querySelector('span.a-price, .a-price, .a-color-base');
        
        if (itemPrice && !itemPrice.getAttribute('data-sats-processed')) {
          const priceText = itemPrice.textContent.trim();
          const priceMatch = priceText.match(/\$([\d,]+(\.\d{2})?)/);
          
          if (priceMatch) {
            const fiatValue = parseFloat(priceMatch[1].replace(/,/g, ''));
            
            // Only process reasonable price values
            if (fiatValue > 0 && fiatValue < 1000000) {
              // Calculate satoshi value
              const satsValue = Math.round((fiatValue / btcPrice) * SATS_IN_BTC);
              
              // Create a new element
              const newElement = document.createElement('span');
              
              // Format based on user preference
              if (userPreferences.displayMode === 'dual-display') {
                newElement.textContent = `${satsValue.toLocaleString()} sats | $${fiatValue.toFixed(2)}`;
              } else {
                newElement.textContent = `${satsValue.toLocaleString()} sats`;
              }
              
              // Mark as processed
              newElement.setAttribute('data-sats-processed', 'true');
              
              // Replace the original price element
              itemPrice.parentNode.replaceChild(newElement, itemPrice);
              
              // Mark parent as processed to avoid duplication
              item.setAttribute('data-sats-processed', 'true');
              
              // Increment conversion counter
              conversionCount++;
            }
          }
        }
      });
    };
    
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
    
    // Process Amazon-specific price formats
    if (window.location.hostname.includes('amazon')) {
      processAmazonPrices();
      
      // Also process Amazon prices after a short delay to catch any lazy-loaded content
      setTimeout(processAmazonPrices, 1500);
      
      // Process one more time after longer delay for images and other content to load
      setTimeout(processAmazonPrices, 3000);
    }
    
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
        
        // Process Amazon-specific prices if on Amazon
        if (window.location.hostname.includes('amazon')) {
          processAmazonPrices();
        }
        
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