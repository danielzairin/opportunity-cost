/**
 * Price-in-Sats Chrome Extension
 * 
 * This background script handles the toolbar icon click event
 * and redirects users to the Opportunity Cost app.
 */

// Handle toolbar icon click
chrome.action.onClicked.addListener(() => {
  // Open Opportunity Cost in a new tab with UTM tracking
  chrome.tabs.create({ 
    url: "https://opportunitycost.app?utm_source=chrome_ext" 
  });
});
