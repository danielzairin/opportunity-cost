# Opportunity Cost Firefox Extension

A Firefox browser extension that converts fiat currency prices to Bitcoin as you browse the web.

## Features

- Automatically converts USD prices to Bitcoin (BTC) or satoshis
- Works on most websites with special handling for Amazon, Zillow, and other sites
- Option to display prices in dual-mode (showing both Bitcoin and fiat)
- Tracks conversion statistics locally
- Privacy-focused with no data sent to external servers

## Development Setup

1. Open Firefox and navigate to about:debugging
2. Click 'This Firefox' 
3. Click 'Load Temporary Add-on...' and select the manifest.json file
4. The extension should now be installed for testing

## Files Overview

- manifest.json - Extension configuration (Manifest V2 for Firefox)
- background.js - Background script for price fetching and management
- content.js - Content script for scanning and converting prices
- storage.js - Database functionality using IndexedDB
- options.html/js - User preferences interface
- browser-polyfill.js - Mozilla's WebExtension polyfill for API compatibility
- icons/ - Extension icons and branding

## Firefox-specific Notes

This extension uses Manifest V2 since Firefox has not fully implemented Manifest V3.
The browser-polyfill.js file provides compatibility between Chrome and Firefox extension APIs.

