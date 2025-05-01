/**
 * Opportunity Cost Firefox Extension
 * 
 * This background script handles:
 * 1. Toolbar icon click event
 * 2. Bitcoin price fetching and storage
 * 3. Communication with content scripts
 * 4. User preferences management
 */

// Constants
const API_BASE = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin";
const DEFAULT_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
const CACHE_DURATION = 5 * 60 * 1000; // 5 minute cache duration for aggressive caching
const INITIAL_BACKOFF = 2000; // Initial backoff duration in ms (2 seconds)
const MAX_BACKOFF = 5 * 60 * 1000; // Maximum backoff duration (5 minutes)
const MAX_RETRIES = 5; // Maximum number of retry attempts

// Extension state
let priceRefreshInterval = null;
let userPreferences = null;
let backoffTime = INITIAL_BACKOFF;
let retryCount = 0;

// Handle toolbar icon click - either open options or Bitcoin Brief by TFTC
browser.browserAction.onClicked.addListener(() => {
  // Right-click opens options, normal click opens Bitcoin Brief
  browser.tabs.create({ 
    url: "https://tftc.io/bitcoin-brief?utm_source=opportunity_cost_ext" 
  });
});

// Add context menu option to open settings
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "open-options",
    title: "Options & Statistics",
    contexts: ["browser_action"]
  });
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-options") {
    browser.runtime.openOptionsPage();
  }
});

// Simple database operations for Firefox
const PriceDatabase = {
  // Save price to storage
  saveBitcoinPrice: async (currency, price) => {
    const timestamp = Date.now();
    const key = `btc_price_${currency.toLowerCase()}`;
    
    const priceData = {
      currency: currency.toLowerCase(),
      price: price,
      timestamp: timestamp,
      date: new Date(timestamp).toISOString()
    };
    
    await browser.storage.local.set({ [key]: priceData });
    
    // Also store in history
    const history = await browser.storage.local.get('price_history') || { price_history: [] };
    history.price_history = history.price_history || [];
    history.price_history.push(priceData);
    
    // Limit history to last 100 entries
    if (history.price_history.length > 100) {
      history.price_history = history.price_history.slice(-100);
    }
    
    await browser.storage.local.set(history);
    return priceData;
  },
  
  // Get latest price
  getLatestBitcoinPrice: async (currency) => {
    const key = `btc_price_${currency.toLowerCase()}`;
    const result = await browser.storage.local.get(key);
    return result[key] || null;
  },
  
  // Get price history
  getPriceHistory: async (currency) => {
    const result = await browser.storage.local.get('price_history');
    const history = result.price_history || [];
    return history.filter(item => item.currency === currency.toLowerCase());
  },
  
  // Save visited site
  saveVisitedSite: async (url, conversionCount) => {
    const timestamp = Date.now();
    const sites = await browser.storage.local.get('visited_sites') || { visited_sites: {} };
    sites.visited_sites = sites.visited_sites || {};
    
    // Update or add site data
    sites.visited_sites[url] = {
      url: url,
      timestamp: timestamp,
      conversionCount: (sites.visited_sites[url]?.conversionCount || 0) + conversionCount,
      date: new Date(timestamp).toISOString()
    };
    
    await browser.storage.local.set(sites);
    return sites.visited_sites[url];
  },
  
  // Get visited sites
  getVisitedSites: async () => {
    const result = await browser.storage.local.get('visited_sites');
    const sites = result.visited_sites || {};
    return Object.values(sites);
  },
  
  // Save preferences
  savePreferences: async (preferences) => {
    await browser.storage.local.set({ 'user_preferences': preferences });
    return preferences;
  },
  
  // Get preferences
  getPreferences: async () => {
    const result = await browser.storage.local.get('user_preferences');
    return result.user_preferences || {
      defaultCurrency: 'usd',
      displayMode: 'dual-display',
      autoRefresh: true,
      trackStats: true
    };
  }
};

// Load user preferences
async function loadUserPreferences() {
  try {
    userPreferences = await PriceDatabase.getPreferences();
    console.log('Loaded user preferences:', userPreferences);
    
    // Apply preferences
    applyUserPreferences();
    
    return userPreferences;
  } catch (error) {
    console.error('Error loading user preferences:', error);
    
    // Use defaults
    userPreferences = {
      defaultCurrency: 'usd',
      displayMode: 'dual-display', // Changed default from 'sats-only' to 'dual-display'
      autoRefresh: true,
      trackStats: true
    };
    
    return userPreferences;
  }
}

// Apply user preferences to extension behavior
function applyUserPreferences() {
  // Set up auto-refresh based on preferences
  if (priceRefreshInterval) {
    clearInterval(priceRefreshInterval);
    priceRefreshInterval = null;
  }
  
  if (userPreferences.autoRefresh) {
    priceRefreshInterval = setInterval(fetchAndStoreBitcoinPrice, DEFAULT_REFRESH_INTERVAL);
  }
}

// Get API endpoint based on user's preferred currency
function getApiEndpoint() {
  const currency = userPreferences?.defaultCurrency || 'usd';
  return `${API_BASE}&vs_currencies=${currency}`;
}

// Fetch and store Bitcoin price with exponential backoff
async function fetchAndStoreBitcoinPrice() {
  if (!userPreferences) {
    await loadUserPreferences();
  }
  
  try {
    const currency = userPreferences.defaultCurrency || 'usd';
    const apiEndpoint = getApiEndpoint();
    
    // Fetch current price from API
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      // Check if we hit rate limits (HTTP 429) or server errors (5xx)
      if (response.status === 429 || response.status >= 500) {
        if (retryCount < MAX_RETRIES) {
          console.warn(`API request failed with status ${response.status}. Retrying in ${backoffTime/1000} seconds...`);
          retryCount++;
          
          // Set up retry with exponential backoff
          return new Promise((resolve) => {
            setTimeout(async () => {
              // Double the backoff time for next potential retry (exponential backoff)
              backoffTime = Math.min(backoffTime * 2, MAX_BACKOFF);
              const result = await fetchAndStoreBitcoinPrice();
              resolve(result);
            }, backoffTime);
          });
        } else {
          console.error(`Maximum retries (${MAX_RETRIES}) reached. Using cached data if available.`);
          // Reset backoff for next time
          backoffTime = INITIAL_BACKOFF;
          retryCount = 0;
          return null;
        }
      } else {
        console.warn(`Failed to fetch BTC price from API: ${response.status} ${response.statusText}`);
        return null;
      }
    }
    
    // Reset backoff parameters on successful request
    backoffTime = INITIAL_BACKOFF;
    retryCount = 0;
    
    const data = await response.json();
    const btcPrice = data?.bitcoin?.[currency];
    
    if (!btcPrice) {
      console.warn('Invalid BTC price data received from API');
      return null;
    }
    
    // Store price in database
    await PriceDatabase.saveBitcoinPrice(currency, btcPrice);
    console.log(`Updated BTC price (${currency}): ${btcPrice}`);
    
    return btcPrice;
  } catch (error) {
    console.error('Error fetching or storing BTC price:', error);
    
    // Handle network errors with backoff as well
    if (retryCount < MAX_RETRIES) {
      console.warn(`Network error. Retrying in ${backoffTime/1000} seconds...`);
      retryCount++;
      
      return new Promise((resolve) => {
        setTimeout(async () => {
          // Double the backoff time for next potential retry
          backoffTime = Math.min(backoffTime * 2, MAX_BACKOFF);
          const result = await fetchAndStoreBitcoinPrice();
          resolve(result);
        }, backoffTime);
      });
    } else {
      console.error(`Maximum retries (${MAX_RETRIES}) reached after network errors.`);
      // Reset backoff for next time
      backoffTime = INITIAL_BACKOFF;
      retryCount = 0;
      return null;
    }
  }
}

// Get Bitcoin price (from database if available, or fetch from API)
async function getBitcoinPrice() {
  if (!userPreferences) {
    await loadUserPreferences();
  }
  
  try {
    const currency = userPreferences.defaultCurrency || 'usd';
    
    // Try to get the latest price from the database first
    const storedPrice = await PriceDatabase.getLatestBitcoinPrice(currency);
    
    // If we have a recent price (less than 5 minutes old), use it
    if (storedPrice && (Date.now() - storedPrice.timestamp < CACHE_DURATION)) {
      console.log(`Using cached BTC price (${currency}): ${storedPrice.price}`);
      return storedPrice.price;
    }
    
    // Otherwise fetch a fresh price
    return await fetchAndStoreBitcoinPrice();
  } catch (error) {
    console.error('Error getting Bitcoin price:', error);
    return null;
  }
}

// Listen for messages from content scripts and options page
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Create a promise to handle the request
  let responsePromise;
  
  if (message.action === 'getBitcoinPrice') {
    responsePromise = getBitcoinPrice().then(price => {
      return { 
        price: price,
        displayMode: userPreferences?.displayMode || 'dual-display',
        currency: userPreferences?.defaultCurrency || 'usd'
      };
    }).catch(error => {
      console.error('Error in getBitcoinPrice:', error);
      return { error: error.message };
    });
  } 
  else if (message.action === 'saveVisitedSite') {
    // Only save site data if tracking is enabled
    if (userPreferences?.trackStats !== false) {
      responsePromise = PriceDatabase.saveVisitedSite(message.url, message.conversionCount)
        .then(() => {
          return { success: true };
        })
        .catch(error => {
          console.error('Error saving visited site:', error);
          return { error: error.message };
        });
    } else {
      // Don't save if tracking is disabled
      responsePromise = Promise.resolve({ success: true, trackingDisabled: true });
    }
  }
  else if (message.action === 'preferencesUpdated') {
    // Reload preferences when options page updates them
    responsePromise = loadUserPreferences().then(() => {
      return { success: true };
    }).catch(error => {
      console.error('Error reloading preferences:', error);
      return { error: error.message };
    });
  }
  else if (message.action === 'getPreferences') {
    // Send current preferences to content script
    if (userPreferences) {
      responsePromise = Promise.resolve({ preferences: userPreferences });
    } else {
      responsePromise = loadUserPreferences().then(prefs => {
        return { preferences: prefs };
      }).catch(error => {
        console.error('Error loading preferences:', error);
        return { error: error.message };
      });
    }
  }
  else {
    // Unknown action
    responsePromise = Promise.resolve({ error: "Unknown action" });
  }
  
  // Firefox requires returning true when sending a response asynchronously
  responsePromise.then(sendResponse);
  return true;
});

// Initialize when the extension starts
async function initialize() {
  try {
    await loadUserPreferences();
    await fetchAndStoreBitcoinPrice();
    console.log('Opportunity Cost extension initialized successfully');
  } catch (error) {
    console.error('Error initializing extension:', error);
  }
}

// Start the extension
initialize();