/**
 * Price-in-Sats Firefox Extension
 * 
 * Options page script to manage user preferences and display statistics
 * from the database.
 */

import { PriceDatabase } from './storage.js';

// DOM elements
const currencySelector = document.getElementById('currency');
const displayModeSelector = document.getElementById('display-mode');
const autoRefreshToggle = document.getElementById('auto-refresh');
const trackStatsToggle = document.getElementById('track-stats');
const saveButton = document.getElementById('save-settings');
const priceHistoryElement = document.getElementById('price-history');
const visitedSitesElement = document.getElementById('visited-sites');
const clearDataButton = document.getElementById('clear-data');

// Load saved settings from storage
async function loadSettings() {
  try {
    const prefs = await PriceDatabase.getPreferences();
    
    // Set form values from storage
    if (prefs) {
      currencySelector.value = prefs.defaultCurrency || 'usd';
      displayModeSelector.value = prefs.displayMode || 'dual-display';
      autoRefreshToggle.checked = prefs.autoRefresh !== false;
      trackStatsToggle.checked = prefs.trackStats !== false;
    }
    
    console.log('Settings loaded from storage:', prefs);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Save settings to storage
async function saveSettings(event) {
  event.preventDefault();
  
  try {
    const preferences = {
      defaultCurrency: currencySelector.value,
      displayMode: displayModeSelector.value,
      autoRefresh: autoRefreshToggle.checked,
      trackStats: trackStatsToggle.checked
    };
    
    await PriceDatabase.savePreferences(preferences);
    console.log('Settings saved:', preferences);
    
    // Notify the background script that preferences have been updated
    await browser.runtime.sendMessage({ action: 'preferencesUpdated' });
    
    // Show success message
    const saveMsg = document.getElementById('save-success');
    saveMsg.textContent = 'Settings saved!';
    saveMsg.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(() => {
      saveMsg.style.display = 'none';
    }, 3000);
    
  } catch (error) {
    console.error('Error saving settings:', error);
    
    // Show error message
    const errorMsg = document.getElementById('save-error');
    errorMsg.textContent = 'Error saving settings: ' + error.message;
    errorMsg.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
      errorMsg.style.display = 'none';
    }, 5000);
  }
}

// Load Bitcoin price history
async function loadPriceHistory() {
  try {
    // Get the last 7 days of price history
    const endTime = Date.now();
    const startTime = endTime - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    const prefs = await PriceDatabase.getPreferences();
    const currency = prefs?.defaultCurrency || 'usd';
    
    const history = await PriceDatabase.getPriceHistory(currency, startTime, endTime);
    console.log('Price history loaded:', history);
    
    // Clear existing content
    priceHistoryElement.innerHTML = '';
    
    if (history && history.length > 0) {
      // Create a table
      const table = document.createElement('table');
      table.className = 'data-table';
      
      // Add header row
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `
        <th>Date</th>
        <th>Currency</th>
        <th>Price</th>
      `;
      table.appendChild(headerRow);
      
      // Add data rows
      history.forEach(record => {
        const row = document.createElement('tr');
        const date = new Date(record.timestamp);
        row.innerHTML = `
          <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
          <td>${record.currency.toUpperCase()}</td>
          <td>${record.price.toLocaleString()}</td>
        `;
        table.appendChild(row);
      });
      
      priceHistoryElement.appendChild(table);
    } else {
      priceHistoryElement.innerHTML = '<p>No price history available.</p>';
    }
  } catch (error) {
    console.error('Error loading price history:', error);
    priceHistoryElement.innerHTML = '<p>Error loading price history.</p>';
  }
}

// Load visited sites statistics
async function loadVisitedSites() {
  try {
    const sites = await PriceDatabase.getVisitedSites();
    console.log('Visited sites loaded:', sites);
    
    // Clear existing content
    visitedSitesElement.innerHTML = '';
    
    if (sites && sites.length > 0) {
      // Create a table
      const table = document.createElement('table');
      table.className = 'data-table';
      
      // Add header row
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `
        <th>Website</th>
        <th>Date</th>
        <th>Conversions</th>
      `;
      table.appendChild(headerRow);
      
      // Sort by most recent first
      const sortedSites = [...sites].sort((a, b) => b.timestamp - a.timestamp);
      
      // Add data rows
      sortedSites.slice(0, 20).forEach(site => { // Show only the last 20 sites
        const row = document.createElement('tr');
        const date = new Date(site.timestamp);
        const urlObj = new URL(site.url);
        const hostname = urlObj.hostname;
        
        row.innerHTML = `
          <td>${hostname}</td>
          <td>${date.toLocaleDateString()}</td>
          <td>${site.conversionCount}</td>
        `;
        table.appendChild(row);
      });
      
      visitedSitesElement.appendChild(table);
      
      // Add summary statistics
      const totalConversions = sites.reduce((sum, site) => sum + site.conversionCount, 0);
      const totalSites = new Set(sites.map(site => new URL(site.url).hostname)).size;
      
      const stats = document.createElement('div');
      stats.className = 'stats-summary';
      stats.innerHTML = `
        <p><strong>Total Sites Visited:</strong> ${totalSites}</p>
        <p><strong>Total Price Conversions:</strong> ${totalConversions.toLocaleString()}</p>
      `;
      
      visitedSitesElement.appendChild(stats);
      
    } else {
      visitedSitesElement.innerHTML = '<p>No site visits recorded yet.</p>';
    }
  } catch (error) {
    console.error('Error loading visited sites:', error);
    visitedSitesElement.innerHTML = '<p>Error loading site statistics.</p>';
  }
}

// Clear all stored data
async function clearAllData() {
  try {
    if (confirm('Are you sure you want to clear all stored data? This will remove all price history and site statistics.')) {
      await PriceDatabase.db.clear('priceHistory');
      await PriceDatabase.db.clear('visitedSites');
      
      // Don't clear preferences
      console.log('All data cleared');
      
      // Reload the data displays
      loadPriceHistory();
      loadVisitedSites();
      
      // Show success message
      const clearMsg = document.getElementById('clear-success');
      clearMsg.textContent = 'All data cleared successfully!';
      clearMsg.style.display = 'block';
      
      // Hide message after 3 seconds
      setTimeout(() => {
        clearMsg.style.display = 'none';
      }, 3000);
    }
  } catch (error) {
    console.error('Error clearing data:', error);
    
    // Show error message
    const errorMsg = document.getElementById('clear-error');
    errorMsg.textContent = 'Error clearing data: ' + error.message;
    errorMsg.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
      errorMsg.style.display = 'none';
    }, 5000);
  }
}

// Set up event listeners
function setupEventListeners() {
  if (saveButton) {
    saveButton.addEventListener('click', saveSettings);
  }
  
  if (clearDataButton) {
    clearDataButton.addEventListener('click', clearAllData);
  }
}

// Initialize the options page
document.addEventListener('DOMContentLoaded', async () => {
  // Load settings and data
  await loadSettings();
  await loadPriceHistory();
  await loadVisitedSites();
  
  // Set up event listeners
  setupEventListeners();
});