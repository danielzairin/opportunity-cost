/**
 * Price-in-Sats Chrome Extension
 * 
 * This content script scans the DOM for fiat currency prices and
 * converts them to their Bitcoin satoshi equivalent.
 */

(async () => {
  try {
    // Constants
    const SATS_IN_BTC = 100_000_000;
    const API_ENDPOINT = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
    
    // Regular expressions for currency patterns
    const currencyRegexes = {
      usd: /\$[\s\u00A0]?(\d{1,3}(?:[,]\d{3})*(?:\.\d{1,2})?)/g,
      // Add more currencies in the future if needed
    };
    
    // Fetch current BTC price
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      console.warn('Price-in-Sats: Failed to fetch BTC price. Prices will not be converted.');
      return;
    }
    
    const data = await response.json();
    const btcUsdPrice = data?.bitcoin?.usd;
    
    if (!btcUsdPrice) {
      console.warn('Price-in-Sats: Invalid BTC price data. Prices will not be converted.');
      return;
    }
    
    // Function to walk through the DOM and process text nodes
    const walkDOM = (node) => {
      // Process text nodes
      if (node.nodeType === Node.TEXT_NODE) {
        replacePrice(node);
      }
      // Recursively process child nodes (except scripts and styles)
      else if (node.nodeType === Node.ELEMENT_NODE && 
              !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)) {
        for (let i = 0; i < node.childNodes.length; i++) {
          walkDOM(node.childNodes[i]);
        }
      }
    };
    
    // Function to replace fiat prices with satoshi values in a text node
    const replacePrice = (textNode) => {
      let content = textNode.textContent;
      let modified = false;
      
      // Check for USD pattern
      content = content.replace(currencyRegexes.usd, (match, numStr) => {
        modified = true;
        const fiatValue = parseFloat(numStr.replace(/,/g, ""));
        const satsValue = Math.round((fiatValue / btcUsdPrice) * SATS_IN_BTC);
        return `${satsValue.toLocaleString()} sats`;
      });
      
      // Update the text node if modifications were made
      if (modified) {
        textNode.textContent = content;
      }
    };
    
    // Start processing the document body
    walkDOM(document.body);
    
    // Set up a MutationObserver to handle dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(walkDOM);
        }
      });
    });
    
    // Start observing mutations to the DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
  } catch (error) {
    console.error('Price-in-Sats: An error occurred:', error);
    // Graceful fallback - leave prices untouched
  }
})();
