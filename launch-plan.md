Here’s the full `@todo.md` in plain markdown:

```markdown
# Opportunity Cost - Launch Plan ToDo

## 🎯 Goal

Ship MVP of Opportunity Cost Chrome + Firefox extension by **Monday (4 days)**. Targeting functionality parity and polish across both platforms.

---

## ✅ Core Features (MVP Required)

### 1. **Hook up production domain: opportunitycost.app**

- **Details**: Forward root domain to project landing page or Chrome store.
- **Time Estimate**: 1 hour
- **Owner**: You

### 2. **Firefox Extension Compatibility**

- **Details**: Adjust `manifest.json`, replace `chrome.*` APIs with `browser.*` (or use `webextension-polyfill`). Test + publish.
- **Time Estimate**: 6–8 hours
- **Notes**: Very similar architecture. Some APIs differ (e.g., `storage.sync`, `runtime.sendMessage`), but your existing code is mostly compatible. Need manifest v3 adjustments if using service workers.
- **Owner**: You

### 3. **Toggle: Disable Extension Globally**

- **Details**: User preference in `options.html` + flag in content script.
- **Time Estimate**: 2 hours
- **Owner**: You

### 4. **Temporarily Disable Extension on Specific Page**

- **Details**: Context menu or page action to exclude domain temporarily or permanently.
- **Time Estimate**: 4 hours
- **Owner**: You

### 5. **Disallow Sats Injection on Specific Pages**

- **Details**: Maintain a denylist (Amazon Checkout, banking sites, etc). Prevent content script injection.
- **Time Estimate**: 2 hours

### 6. **Clean up codebase for open source**

- **Details**: Remove unused files, secrets, developer notes. Add README, MIT License, contribution guidelines.
- **Time Estimate**: 3 hours

---

## 💡 Nice-to-Have (Optional This Sprint)

### 7. **Track prices over time (per-item history)**

- **Details**: Store URL + price snapshots in IndexedDB. Display chart or price history.
- **Time Estimate**: 8–12 hours (scoping + v0 table view)
- **Notes**: Partially supported in `options-page.tsx`. Could extend existing `PriceDatabase` logic.

### 8. **Landing Page**

- **Details**: Simple static site for opportunitycost.app: branding, link to stores, FAQs, screenshots.
- **Time Estimate**: 3–5 hours
- **Tools**: Vite + Tailwind or Astro

---

## 🧠 Suggestions / Potential Improvements

- Add analytics for installs/usage (Privacy-preserving)
- Add onboarding popup on install
- Add “track this item” button in UI overlay
- Add backup/export/import settings to file
- Support localization (later phase)

---

## 📅 Phased Timeline

### **Day 1 (Today)**

- ✅ Domain hookup
- 🔄 Firefox conversion begins
- 🧹 Code cleanup

### **Day 2**

- 🧪 Firefox testing
- ⚙️ Disable toggle + per-page disable work

### **Day 3**

- 🚫 Denylist system
- 🔁 Cross-browser parity polish

### **Day 4 (Monday Launch)**

- 🏁 Final QA
- 🛒 Chrome Web Store + Firefox AMO submissions
- 🚀 Go live with tweet/newsletter/etc.

---

## 🔐 Security & Privacy

- No background tracking.
- All data stored client-side.
- Ensure open source version redacts any internal tokens/API keys (if any).

---

## 🧾 Deliverables

- ✅ Chrome & Firefox published
- ✅ Clean GitHub repo
- ✅ Landing page linked from domain
- ✅ Announcement copy

---

Let’s ship it. 🧡
```
