# Opportunity Cost Extension - Launch Plan

## Overview

This document outlines the development roadmap to launch the Opportunity Cost extension by next Monday (4 days from now). Tasks are organized by priority and estimated completion time.

## Phase 1 - Core Functionality & Firefox Version (Day 1-2)

### Firefox Extension [1.5 days]

- [ ] Port Chrome extension to Firefox
  - [ ] Update manifest.json for Firefox compatibility (Firefox uses manifest v2) [2 hours]
  - [ ] Test permissions and API differences between Chrome and Firefox [2 hours]
  - [ ] Fix styling/layout issues specific to Firefox [3 hours]
  - [ ] Package and test on Firefox [3 hours]
  - [ ] Prepare for Firefox Add-ons submission [2 hours]

### Extension Controls [0.5 days]

- [ ] Implement global extension toggle [2 hours]

  - [ ] Add on/off switch in popup UI
  - [ ] Store state in user preferences
  - [ ] Add background service logic to check enabled state

- [ ] Implement per-page disable functionality [2 hours]
  - [ ] Create UI for temporarily disabling on current site
  - [ ] Store list of temporarily disabled sites
  - [ ] Add logic to check disabled status before conversions

## Phase 2 - Enhanced Features (Day 2-3)

### Site Exclusion Management [0.5 days]

- [ ] Implement domain exclusion list [4 hours]
  - [ ] Create UI in options page for managing excluded sites
  - [ ] Build storage mechanism for exclusion list
  - [ ] Add logic to check against exclusion list before conversions

### Price Tracking [1 day]

- [ ] Enhance price history functionality [8 hours]
  - [ ] Improve existing price history storage
  - [ ] Create visualization for price trends in options page
  - [ ] Add ability to export price history data

## Phase 3 - Finalization & Deployment (Day 3-4)

### Domain Setup [0.5 days]

- [ ] Set up opportunitycost.app domain [4 hours]
  - [ ] Purchase domain if not already owned
  - [ ] Configure DNS settings
  - [ ] Set up hosting for landing page
  - [ ] Point domain to web application

### Codebase Cleanup [0.5 days]

- [ ] Clean up repository for open source [4 hours]
  - [ ] Remove unnecessary files and old versions
  - [ ] Organize folder structure (remove .history folder)
  - [ ] Add proper documentation
  - [ ] Create comprehensive README.md

### Submission & Launch [0.5 days]

- [ ] Final testing across browsers [2 hours]
- [ ] Prepare submission packages [2 hours]
- [ ] Submit to Chrome Web Store and Firefox Add-ons [1 hour]

## Future Enhancements (Post-Launch)

### Item-Specific Price Tracking [Future]

- [ ] Implement feature to track sats price of specific items over time
  - [ ] Create UI for saving specific product pages
  - [ ] Build backend storage for item price history
  - [ ] Add visualization for item price trends
  - [ ] Implement notifications for price changes

### Additional Enhancements to Consider

- [ ] Support for additional currencies beyond USD
- [ ] Theming options (light/dark mode)
- [ ] More detailed analytics on price conversions
- [ ] Mobile companion app

## Notes & Considerations

### Chrome vs Firefox Extension Differences

- Firefox uses Manifest V2, while Chrome has moved to Manifest V3
- Firefox has different security model and permissions
- UI rendering might differ slightly between browsers
- Firefox add-on review process is typically faster than Chrome's

### Open Source Preparation

- Ensure code is well-documented
- Create contributing guidelines
- Choose appropriate open source license
- Remove any sensitive information or API keys

### Testing Requirements

- Test on multiple sites with various price formats
- Ensure performance is acceptable (no significant page load impact)
- Verify all features work properly in both Chrome and Firefox
