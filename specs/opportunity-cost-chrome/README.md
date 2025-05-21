# Opportunity Cost Chrome Extension

A Chrome browser extension that converts fiat currency prices to Bitcoin as you browse the web.

## Features

- Automatically converts USD prices to Bitcoin (BTC) or satoshis
- Works on most websites with special handling for Amazon, Zillow, and other sites
- Option to display prices in dual-mode (showing both Bitcoin and fiat)
- Tracks conversion statistics locally
- Privacy-focused with no data sent to external servers

## Development Setup

1. Open Chrome and navigate to chrome://extensions/
2. Enable 'Developer mode' (toggle in top-right)
3. Click 'Load unpacked' and select this directory
4. The extension should now be installed for testing

## Files Overview

- manifest.json - Extension configuration (Manifest V3)
- background.js - Background script for price fetching and management
- content.js - Content script for scanning and converting prices
- storage.js - Database functionality using IndexedDB
- options.html/js - User preferences interface
- icons/ - Extension icons and branding

