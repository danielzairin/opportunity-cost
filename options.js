/**
 * Price-in-Sats Chrome Extension
 * 
 * Options page script to manage user preferences and display statistics
 * from the database.
 */

import { PriceDatabase, ChromeStorage } from './storage.js';

// Initialize the options page
document.addEventListener('DOMContentLoaded', async () => {
  // Load settings and populate form
  await loadSettings();
  
  // Load and display statistics
  await loadPriceHistory();
  await loadVisitedSites();
  
  // Set up event listeners
  setupEventListeners();
});

// Load saved settings from storage
async function loadSettings() {
  try {
    const preferences = await PriceDatabase.getPreferences();
    
    // Set form values from preferences
    document.getElementById('default-currency').value = preferences.defaultCurrency || 'usd';
    document.getElementById('display-mode').value = preferences.displayMode || 'dual-display';
    document.getElementById('auto-refresh').checked = preferences.autoRefresh !== false; // Default to true
    document.getElementById('track-stats').checked = preferences.trackStats !== false; // Default to true
    
  } catch (error) {
    console.error('Error loading settings:', error);
    // Use defaults if settings couldn't be loaded
  }
}

// Save settings to storage
async function saveSettings(event) {
  event.preventDefault();
  
  try {
    const preferences = {
      defaultCurrency: document.getElementById('default-currency').value,
      displayMode: document.getElementById('display-mode').value,
      autoRefresh: document.getElementById('auto-refresh').checked,
      trackStats: document.getElementById('track-stats').checked
    };
    
    await PriceDatabase.savePreferences(preferences);
    
    // Show saved message
    const saveMessage = document.getElementById('save-message');
    saveMessage.style.display = 'inline';
    setTimeout(() => {
      saveMessage.style.display = 'none';
    }, 3000);
    
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('There was an error saving your settings. Please try again.');
  }
}

// Load price history data from database
async function loadPriceHistory() {
  try {
    // Get the last week of price history
    const endTime = Date.now();
    const startTime = endTime - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    const priceHistory = await PriceDatabase.getPriceHistory('usd', startTime, endTime);
    
    const chartContainer = document.getElementById('price-history-chart');
    
    if (priceHistory.length === 0) {
      chartContainer.innerHTML = '<div class="empty-state">No price history data available yet. The extension will collect data as you browse.</div>';
      return;
    }
    
    // Format data for display
    let tableHtml = '<table>';
    tableHtml += '<tr><th>Date</th><th>Time</th><th>BTC Price (USD)</th></tr>';
    
    // Sort by timestamp in descending order (newest first)
    priceHistory.sort((a, b) => b.timestamp - a.timestamp);
    
    // Show up to 10 most recent entries
    const recentEntries = priceHistory.slice(0, 10);
    
    recentEntries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      tableHtml += `<tr>
        <td>${dateStr}</td>
        <td>${timeStr}</td>
        <td>$${entry.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      </tr>`;
    });
    
    tableHtml += '</table>';
    chartContainer.innerHTML = tableHtml;
    
    // In a future version, we could add an actual chart visualization
    // using a library like Chart.js
    
  } catch (error) {
    console.error('Error loading price history:', error);
    const chartContainer = document.getElementById('price-history-chart');
    chartContainer.innerHTML = '<div class="empty-state">Error loading price history data.</div>';
  }
}

// Load visited sites data from database
async function loadVisitedSites() {
  try {
    const visitedSites = await PriceDatabase.getVisitedSites();
    const tableBody = document.querySelector('#sites-table tbody');
    
    if (visitedSites.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="3" class="empty-state">No visited sites data available yet. The extension will collect data as you browse pages with prices.</td></tr>';
      return;
    }
    
    // Sort by timestamp in descending order (newest first)
    visitedSites.sort((a, b) => b.timestamp - a.timestamp);
    
    // Clear existing table rows
    tableBody.innerHTML = '';
    
    // Add sites to the table
    visitedSites.forEach(site => {
      const row = document.createElement('tr');
      
      // Parse URL for better display
      const url = new URL(site.url);
      const displayUrl = url.hostname + (url.pathname !== '/' ? url.pathname : '');
      
      // Format date
      const date = new Date(site.timestamp);
      const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      
      row.innerHTML = `
        <td>${displayUrl}</td>
        <td>${dateStr}</td>
        <td>${site.conversionCount}</td>
      `;
      
      tableBody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error loading visited sites:', error);
    const tableBody = document.querySelector('#sites-table tbody');
    tableBody.innerHTML = '<tr><td colspan="3" class="empty-state">Error loading visited sites data.</td></tr>';
  }
}

// Clear all stored data
async function clearAllData() {
  if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
    try {
      // Clear all data from IndexedDB
      await PriceDatabase.db.clear('priceHistory');
      await PriceDatabase.db.clear('visitedSites');
      
      // Reset preferences to defaults but keep the ID
      await PriceDatabase.savePreferences({
        id: 'user-preferences',
        defaultCurrency: 'usd',
        displayMode: 'dual-display',
        autoRefresh: true,
        trackStats: true,
        lastUpdated: Date.now()
      });
      
      // Reload the page to refresh data
      window.location.reload();
      
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('There was an error clearing the data. Please try again.');
    }
  }
}

// Set up event listeners for the page
function setupEventListeners() {
  // Save settings form
  document.getElementById('settings-form').addEventListener('submit', saveSettings);
  
  // Clear data button
  document.getElementById('clear-data').addEventListener('click', clearAllData);
}