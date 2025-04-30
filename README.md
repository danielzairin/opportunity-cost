# Price-in-Sats Browser Extension

## Overview
Price-in-Sats is a browser extension for Chrome and Firefox that scans webpages for fiat currency prices (currently USD) and automatically converts them to their Bitcoin satoshi equivalent. It also provides a direct link to the Opportunity Cost app when clicking the extension icon.

## Features
- Automatically converts USD prices to satoshis on any webpage
- Dual-display mode showing both satoshis and original fiat prices
- Works with different price formats ($19.99, $1,299.99, etc.)
- Handles dynamically loaded content through MutationObserver
- Provides direct access to Opportunity Cost app via toolbar icon
- Tracks conversion statistics and Bitcoin price history
- Graceful fallback if Bitcoin price API is unavailable

## Installation

### Chrome
1. Download the `chrome-extension.zip` file
2. Extract the contents to a folder
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top-right corner
5. Click "Load unpacked" and select the extracted directory
6. The extension will immediately be active and ready to use

### Firefox
1. Download the `firefox-extension.zip` file
2. Extract the contents to a folder
3. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on" and select any file in the extracted directory
5. The extension will be loaded for the current session

## Testing
After installing the extension, visit the included `test-page.html` to see it in action. All prices on the page should be converted from USD to satoshis.

## How It Works
1. The extension fetches the current Bitcoin price from CoinGecko's API
2. It scans all text nodes in the DOM for USD price patterns
3. When a price is found, it calculates the satoshi equivalent and replaces the text
4. A MutationObserver monitors for dynamically added content, ensuring prices are converted as new content loads

## Key Features Implemented
- Dual-display mode showing both satoshis and original prices (default setting)
- Improved price detection algorithm, handling complex pricing structures
- Support for both Chrome and Firefox browsers
- User preferences stored in browser storage
- Bitcoin price history tracking
- Statistics for visited sites and conversion counts

## Future Enhancements
- Support for additional currencies (EUR, GBP, JPY)
- Enhanced price pattern detection for more formats
- Performance optimizations for large pages
- Browser extension store publication

## About Opportunity Cost
Opportunity Cost is an application that helps track your Bitcoin stack and understand the long-term value of satoshi accumulation. The extension provides a convenient way to access this tool while browsing the web.

## License
This project is licensed under the MIT License - see the LICENSE file for details.