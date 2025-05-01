/**
 * Background Script Wrapper
 * This script ensures that storage.js is loaded before background.js
 * to avoid the module import errors.
 */

// First, import the storage.js script
importScripts('storage.js');

// Then import the background script
importScripts('background.js');