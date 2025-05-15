/**
 * Opportunity Cost Extension
 *
 * This background script handles:
 * 1. Toolbar icon click event
 * 2. Bitcoin price fetching and storage
 * 3. Communication with content scripts
 * 4. User preferences management
 */

import { PriceDatabase } from "./storage.js";
import type { UserPreferences } from "./storage.js";

// Constants
const API_BASE = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin";
const DEFAULT_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
const CACHE_DURATION = 5 * 60 * 1000; // 5 minute cache duration for aggressive caching
const INITIAL_BACKOFF = 2000; // Initial backoff duration in ms (2 seconds)
const MAX_BACKOFF = 5 * 60 * 1000; // Maximum backoff duration (5 minutes)
const MAX_RETRIES = 5; // Maximum number of retry attempts

// Extension state
let priceRefreshInterval: number | null = null;
let userPreferences: UserPreferences | null = null;
let backoffTime = INITIAL_BACKOFF;
let retryCount = 0;

// Load user preferences
async function loadUserPreferences(): Promise<UserPreferences> {
  try {
    // First try to get preferences from database
    const prefs = await PriceDatabase.getPreferences();

    // Ensure we have valid preferences
    if (!prefs || typeof prefs !== "object") {
      throw new Error("Invalid preferences data received from storage");
    }

    // Set global preferences
    userPreferences = prefs;
    console.log("Loaded user preferences:", userPreferences);

    // Apply preferences to extension behavior
    applyUserPreferences();

    return userPreferences;
  } catch (error) {
    console.error("Error loading user preferences:", error);

    // Use defaults as fallback
    userPreferences = {
      id: "user-preferences",
      defaultCurrency: "usd",
      displayMode: "dual-display",
      denomination: "btc", // Default to BTC instead of sats
      autoRefresh: true,
      trackStats: true,
      lastUpdated: Date.now(),
    };

    // Try to save these defaults
    try {
      await PriceDatabase.savePreferences(userPreferences);
    } catch (saveError) {
      console.error("Failed to save default preferences:", saveError);
      // Continue anyway - we'll use the in-memory defaults
    }

    // Apply even if we're using defaults
    applyUserPreferences();

    return userPreferences;
  }
}

// Apply user preferences to extension behavior
function applyUserPreferences(): void {
  // Set up auto-refresh based on preferences
  if (priceRefreshInterval) {
    self.clearInterval(priceRefreshInterval);
    priceRefreshInterval = null;
  }

  if (userPreferences?.autoRefresh) {
    priceRefreshInterval = self.setInterval(
      fetchAndStoreBitcoinPrice,
      DEFAULT_REFRESH_INTERVAL
    );
  }
}

// Get API endpoint based on user's preferred currency
function getApiEndpoint(): string {
  const currency = userPreferences?.defaultCurrency || "usd";
  return `${API_BASE}&vs_currencies=${currency}`;
}

// Fetch and store Bitcoin price with exponential backoff
async function fetchAndStoreBitcoinPrice(): Promise<number | null> {
  if (!userPreferences) {
    await loadUserPreferences();
  }

  try {
    const currency = userPreferences?.defaultCurrency || "usd";
    const apiEndpoint = getApiEndpoint();

    // Fetch current price from API
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      // Check if we hit rate limits (HTTP 429) or server errors (5xx)
      if (response.status === 429 || response.status >= 500) {
        if (retryCount < MAX_RETRIES) {
          console.warn(
            `API request failed with status ${response.status}. Retrying in ${
              backoffTime / 1000
            } seconds...`
          );
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
          console.error(
            `Maximum retries (${MAX_RETRIES}) reached. Using cached data if available.`
          );
          // Reset backoff for next time
          backoffTime = INITIAL_BACKOFF;
          retryCount = 0;
          return null;
        }
      } else {
        console.warn(
          `Failed to fetch BTC price from API: ${response.status} ${response.statusText}`
        );
        return null;
      }
    }

    // Reset backoff parameters on successful request
    backoffTime = INITIAL_BACKOFF;
    retryCount = 0;

    const data = await response.json();
    const btcPrice = data?.bitcoin?.[currency];

    if (!btcPrice) {
      console.warn("Invalid BTC price data received from API");
      return null;
    }

    // Store price in database
    await PriceDatabase.saveBitcoinPrice(currency, btcPrice);
    console.log(`Updated BTC price (${currency}): ${btcPrice}`);

    return btcPrice;
  } catch (error) {
    console.error("Error fetching or storing BTC price:", error);

    // Handle network errors with backoff as well
    if (retryCount < MAX_RETRIES) {
      console.warn(
        `Network error. Retrying in ${backoffTime / 1000} seconds...`
      );
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
      console.error(
        `Maximum retries (${MAX_RETRIES}) reached after network errors.`
      );
      // Reset backoff for next time
      backoffTime = INITIAL_BACKOFF;
      retryCount = 0;
      return null;
    }
  }
}

// Get Bitcoin price (from database if available, or fetch from API)
async function getBitcoinPrice(): Promise<number | null> {
  if (!userPreferences) {
    await loadUserPreferences();
  }

  try {
    const currency = userPreferences?.defaultCurrency || "usd";

    // Try to get the latest price from the database first
    const storedPrice = await PriceDatabase.getLatestBitcoinPrice(currency);

    // If we have a recent price (less than 5 minutes old), use it
    if (storedPrice && Date.now() - storedPrice.timestamp < CACHE_DURATION) {
      console.log(`Using cached BTC price (${currency}): ${storedPrice.price}`);
      return storedPrice.price;
    }

    // Otherwise fetch a fresh price
    return await fetchAndStoreBitcoinPrice();
  } catch (error) {
    console.error("Error getting Bitcoin price:", error);
    return null;
  }
}

interface MessageRequest {
  action: string;
  url?: string;
  conversionCount?: number;
}

interface MessageResponse {
  success?: boolean;
  trackingDisabled?: boolean;
  price?: number | null;
  displayMode?: string;
  currency?: string;
  denomination?: string;
  preferences?: UserPreferences;
  error?: string;
}

// Listen for messages from content scripts and options page
chrome.runtime.onMessage.addListener(
  (
    message: MessageRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: MessageResponse) => void
  ) => {
    if (message.action === "getBitcoinPrice") {
      // Using an async function in a listener requires this promise handling pattern
      getBitcoinPrice()
        .then((price) => {
          sendResponse({
            price: price,
            displayMode: userPreferences?.displayMode || "dual-display",
            currency: userPreferences?.defaultCurrency || "usd",
            denomination: userPreferences?.denomination || "btc",
          });
        })
        .catch((error: Error) => {
          console.error("Error in getBitcoinPrice:", error);
          sendResponse({ error: error.message });
        });

      // Return true to indicate we'll respond asynchronously
      return true;
    } else if (message.action === "saveVisitedSite") {
      // Only save site data if tracking is enabled
      if (userPreferences?.trackStats !== false) {
        PriceDatabase.saveVisitedSite(
          message.url || "",
          message.conversionCount || 0
        )
          .then(() => {
            sendResponse({ success: true });
          })
          .catch((error: Error) => {
            console.error("Error saving visited site:", error);
            sendResponse({ error: error.message });
          });

        return true;
      } else {
        // Don't save if tracking is disabled
        sendResponse({ success: true, trackingDisabled: true });
        return false;
      }
    } else if (message.action === "preferencesUpdated") {
      // Reload preferences when options page updates them
      loadUserPreferences()
        .then(() => {
          // Broadcast the preference update to applicable tabs
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
              // Skip sending to tabs that won't have our content script
              if (
                tab.id &&
                tab.url &&
                !tab.url.startsWith("chrome://") &&
                !tab.url.startsWith("chrome-extension://") &&
                !tab.url.startsWith("about:") &&
                !tab.url.startsWith("edge://") &&
                !tab.url.startsWith("brave://")
              ) {
                try {
                  // Use a try-catch to handle any messaging errors
                  chrome.tabs.sendMessage(
                    tab.id,
                    { action: "preferencesUpdated" },
                    // Add an empty callback to handle the response or error
                    () => {
                      // Suppress any errors by handling them silently
                      if (chrome.runtime.lastError) {
                        // We can log it for debugging but it's expected that some tabs won't respond
                        // console.debug("Tab messaging error:", chrome.runtime.lastError.message);
                      }
                    }
                  );
                } catch (err) {
                  // Catch and suppress any other errors
                  // console.debug("Error sending message to tab:", err);
                }
              }
            });
          });
          sendResponse({ success: true });
        })
        .catch((error: Error) => {
          console.error("Error reloading preferences:", error);
          sendResponse({ error: error.message });
        });

      return true;
    } else if (message.action === "getPreferences") {
      // Send current preferences to content script
      if (userPreferences) {
        sendResponse({ preferences: userPreferences });
      } else {
        loadUserPreferences()
          .then((prefs) => {
            sendResponse({ preferences: prefs });
          })
          .catch((error: Error) => {
            console.error("Error loading preferences:", error);
            sendResponse({ error: error.message });
          });
      }

      return true;
    }

    return false;
  }
);

// Initialize when the extension starts
async function initialize(): Promise<void> {
  try {
    // Check if we're in a valid context
    if (typeof self === "undefined") {
      console.error(
        "Extension is running in an invalid context, 'self' is not defined"
      );
      return;
    }

    // First try to load user preferences
    try {
      await loadUserPreferences();
    } catch (prefError) {
      console.error("Failed to load user preferences:", prefError);
      // Set default preferences if we couldn't load them
      userPreferences = {
        id: "user-preferences",
        defaultCurrency: "usd",
        displayMode: "dual-display",
        denomination: "btc",
        autoRefresh: true,
        trackStats: true,
        lastUpdated: Date.now(),
      };
    }

    // Then try to fetch Bitcoin price
    try {
      await fetchAndStoreBitcoinPrice();
    } catch (priceError) {
      console.error("Failed to fetch initial Bitcoin price:", priceError);
      // We'll retry later via the auto-refresh mechanism
    }

    console.log("Opportunity Cost extension initialized successfully");
  } catch (error) {
    console.error("Critical error initializing extension:", error);
  }
}

// Start the extension
initialize();
