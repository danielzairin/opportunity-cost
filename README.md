# Price-in-Sats Chrome Extension

## Overview
Price-in-Sats is a Chrome extension that scans webpages for fiat currency prices (currently USD) and automatically converts them to their Bitcoin satoshi equivalent. It also provides a direct link to the Opportunity Cost app when clicking the extension icon.

## Features
- Automatically converts USD prices to satoshis on any webpage
- Works with different price formats ($19.99, $1,299.99, etc.)
- Handles dynamically loaded content through MutationObserver
- Provides direct access to Opportunity Cost app via toolbar icon
- Graceful fallback if Bitcoin price API is unavailable

## Installation
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension will immediately be active and ready to use

## Testing
After installing the extension, visit the included `test-page.html` to see it in action. All prices on the page should be converted from USD to satoshis.

## How It Works
1. The extension fetches the current Bitcoin price from CoinGecko's API
2. It scans all text nodes in the DOM for USD price patterns
3. When a price is found, it calculates the satoshi equivalent and replaces the text
4. A MutationObserver monitors for dynamically added content, ensuring prices are converted as new content loads

## Future Enhancements
- Support for additional currencies (EUR, GBP, JPY)
- Option to show dual-display mode (sats | USD)
- Enhanced price pattern detection for more formats
- Performance optimizations for large pages

## About Opportunity Cost
Opportunity Cost is an application that helps track your Bitcoin stack and understand the long-term value of satoshi accumulation. The extension provides a convenient way to access this tool while browsing the web.

## License
This project is licensed under the MIT License - see the LICENSE file for details.