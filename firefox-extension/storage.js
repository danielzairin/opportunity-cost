/**
 * Price-in-Sats Firefox Extension
 * 
 * This module handles data storage for the extension using both Firefox Storage API
 * and IndexedDB for more complex data storage needs.
 */

// ==========================================
// Firefox Storage API Implementation
// ==========================================

/**
 * Firefox Storage API wrapper for simpler, key-value data storage
 * Good for user preferences, settings, and small amounts of data
 */
const BrowserStorage = {
  // Save data to Firefox storage
  save: (key, value) => {
    return new Promise((resolve, reject) => {
      browser.storage.local.set({ [key]: value }).then(() => {
        resolve();
      }).catch((error) => {
        console.error('Storage save error:', error);
        reject(error);
      });
    });
  },
  
  // Get data from Firefox storage
  get: (key) => {
    return new Promise((resolve, reject) => {
      browser.storage.local.get([key]).then((result) => {
        resolve(result[key]);
      }).catch((error) => {
        console.error('Storage get error:', error);
        reject(error);
      });
    });
  },
  
  // Remove data from Firefox storage
  remove: (key) => {
    return new Promise((resolve, reject) => {
      browser.storage.local.remove(key).then(() => {
        resolve();
      }).catch((error) => {
        console.error('Storage remove error:', error);
        reject(error);
      });
    });
  },
  
  // Clear all data from Firefox storage
  clear: () => {
    return new Promise((resolve, reject) => {
      browser.storage.local.clear().then(() => {
        resolve();
      }).catch((error) => {
        console.error('Storage clear error:', error);
        reject(error);
      });
    });
  }
};

// ==========================================
// IndexedDB Implementation
// ==========================================

/**
 * IndexedDB wrapper for more complex data storage
 * Good for storing large amounts of data, historical prices, etc.
 */
class IndexedDBStorage {
  constructor(dbName, version) {
    this.dbName = dbName || 'PriceInSatsDB';
    this.version = version || 1;
    this.db = null;
  }
  
  // Open the database connection
  open() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }
      
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('priceHistory')) {
          const priceStore = db.createObjectStore('priceHistory', { keyPath: 'timestamp' });
          priceStore.createIndex('currency', 'currency', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('visitedSites')) {
          const sitesStore = db.createObjectStore('visitedSites', { keyPath: 'url' });
          sitesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      
      request.onerror = (event) => {
        console.error('IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  
  // Close the database connection
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
  
  // Add an item to a store
  add(storeName, item) {
    return this.open().then(db => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(item);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          console.error(`Error adding item to ${storeName}:`, event.target.error);
          reject(event.target.error);
        };
      });
    });
  }
  
  // Put (add or update) an item in a store
  put(storeName, item) {
    return this.open().then(db => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          console.error(`Error putting item to ${storeName}:`, event.target.error);
          reject(event.target.error);
        };
      });
    });
  }
  
  // Get an item from a store
  get(storeName, key) {
    return this.open().then(db => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          console.error(`Error getting item from ${storeName}:`, event.target.error);
          reject(event.target.error);
        };
      });
    });
  }
  
  // Get all items from a store
  getAll(storeName) {
    return this.open().then(db => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          console.error(`Error getting all items from ${storeName}:`, event.target.error);
          reject(event.target.error);
        };
      });
    });
  }
  
  // Delete an item from a store
  delete(storeName, key) {
    return this.open().then(db => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error(`Error deleting item from ${storeName}:`, event.target.error);
          reject(event.target.error);
        };
      });
    });
  }
  
  // Clear all items from a store
  clear(storeName) {
    return this.open().then(db => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error(`Error clearing store ${storeName}:`, event.target.error);
          reject(event.target.error);
        };
      });
    });
  }
  
  // Query items using an index
  getByIndex(storeName, indexName, value) {
    return this.open().then(db => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          console.error(`Error querying ${storeName} by ${indexName}:`, event.target.error);
          reject(event.target.error);
        };
      });
    });
  }
}

// ==========================================
// Price History-specific functions
// ==========================================

/**
 * Specialized database functions for the Price-in-Sats extension
 */
const PriceDatabase = {
  db: new IndexedDBStorage('PriceInSatsDB', 1),
  
  // Save a new Bitcoin price record
  saveBitcoinPrice: (currency, price) => {
    const priceRecord = {
      timestamp: Date.now(),
      currency: currency.toLowerCase(),
      price: price,
      date: new Date().toISOString()
    };
    
    return PriceDatabase.db.put('priceHistory', priceRecord);
  },
  
  // Get the most recent Bitcoin price for a currency
  getLatestBitcoinPrice: (currency) => {
    return PriceDatabase.db.open().then(db => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('priceHistory', 'readonly');
        const store = transaction.objectStore('priceHistory');
        const index = store.index('currency');
        const range = IDBKeyRange.only(currency.toLowerCase());
        
        // Open a cursor in reverse order to get the most recent entry
        const request = index.openCursor(range, 'prev');
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            resolve(cursor.value);
          } else {
            resolve(null); // No price found for this currency
          }
        };
        
        request.onerror = (event) => {
          console.error('Error getting latest price:', event.target.error);
          reject(event.target.error);
        };
      });
    });
  },
  
  // Get price history for a currency within a date range
  getPriceHistory: (currency, startTime, endTime) => {
    return PriceDatabase.db.open().then(db => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('priceHistory', 'readonly');
        const store = transaction.objectStore('priceHistory');
        const index = store.index('currency');
        
        const currencyValue = currency.toLowerCase();
        const range = IDBKeyRange.only(currencyValue);
        
        const results = [];
        const request = index.openCursor(range);
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const record = cursor.value;
            if ((!startTime || record.timestamp >= startTime) && 
                (!endTime || record.timestamp <= endTime)) {
              results.push(record);
            }
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        
        request.onerror = (event) => {
          console.error('Error getting price history:', event.target.error);
          reject(event.target.error);
        };
      });
    });
  },
  
  // Save a visited site record
  saveVisitedSite: (url, conversionCount) => {
    const siteRecord = {
      url: url,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      conversionCount: conversionCount || 0
    };
    
    return PriceDatabase.db.put('visitedSites', siteRecord);
  },
  
  // Get all visited sites
  getVisitedSites: () => {
    return PriceDatabase.db.getAll('visitedSites');
  },
  
  // Save user preferences
  savePreferences: (preferences) => {
    const prefsRecord = {
      id: 'user-preferences',
      ...preferences,
      lastUpdated: Date.now()
    };
    
    return PriceDatabase.db.put('userPreferences', prefsRecord);
  },
  
  // Get user preferences
  getPreferences: () => {
    return PriceDatabase.db.get('userPreferences', 'user-preferences')
      .then(prefs => prefs || { id: 'user-preferences', lastUpdated: Date.now() });
  }
};

// Export the storage objects
export { BrowserStorage, IndexedDBStorage, PriceDatabase };