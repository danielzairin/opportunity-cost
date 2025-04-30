#!/bin/bash

# Function to display status messages
echo_status() {
  echo -e "\n\033[1;34m$1\033[0m"
}

# Package Chrome extension
echo_status "Packaging Chrome extension..."
zip -r chrome-extension.zip manifest.json background.js content.js storage.js options.html options.js icons/

# Package Firefox extension
echo_status "Packaging Firefox extension..."
cd firefox-extension
zip -r ../firefox-extension.zip manifest.json background.js content.js storage.js options.html options.js browser-polyfill.js icons/
cd ..

echo_status "Extension packaging complete!"
echo "Chrome extension: chrome-extension.zip"
echo "Firefox extension: firefox-extension.zip"