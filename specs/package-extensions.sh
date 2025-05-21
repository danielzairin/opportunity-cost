#!/bin/bash

# Function to display status messages
echo_status() {
  echo -e "\n\033[1;34m$1\033[0m"
}

# Package Chrome extension
echo_status "Packaging Chrome extension..."
zip -r opportunity-cost-chrome.zip manifest.json background.js content.js storage.js options.html options.js icons/

# Package Firefox extension
echo_status "Packaging Firefox extension..."
cd firefox-extension
zip -r ../opportunity-cost-firefox.zip manifest.json background.js content.js storage.js options.html options.js browser-polyfill.js icons/
cd ..

echo_status "Extension packaging complete!"
echo "Chrome extension: opportunity-cost-chrome.zip"
echo "Firefox extension: opportunity-cost-firefox.zip"
