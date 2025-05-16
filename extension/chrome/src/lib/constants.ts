export const API_BASE = "https://www.opportunitycost.app/api/bitcoin-price";

export const DEFAULT_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minute cache duration for aggressive caching
export const INITIAL_BACKOFF = 2000; // Initial backoff duration in ms (2 seconds)
export const MAX_BACKOFF = 5 * 60 * 1000; // Maximum backoff duration (5 minutes)
export const MAX_RETRIES = 5; // Maximum number of retry attempts

export const SUPPORTED_CURRENCIES = [
  { name: "US Dollar", value: "usd", symbol: "$" },
  { name: "Euro", value: "eur", symbol: "€" },
  { name: "British Pound", value: "gbp", symbol: "£" },
  { name: "Japanese Yen", value: "jpy", symbol: "¥" },
  { name: "Chinese Yuan", value: "cny", symbol: "¥" },
  { name: "Indian Rupee", value: "inr", symbol: "₹" },
  { name: "Canadian Dollar", value: "cad", symbol: "$" },
  { name: "Australian Dollar", value: "aud", symbol: "$" },
  { name: "Swiss Franc", value: "chf", symbol: "₣" },
  { name: "Singapore Dollar", value: "sgd", symbol: "$" },
];

export const DEFAULT_CURRENCY = "usd";
