# Changelog — All Changes Merged to lyra/main

This document describes all commits that were merged into `lyra/main` (`galitsachinese/LYRA-NDIS-PORTAL`), covering everything that was built on top of the original `origin/main` (kennethasas/ndis-portal).

---

## 📦 Feature Branches (Originally from `origin`)

### 1. Available Services UI
**Commit:** `0e020b8` — Implement available services UI

Implemented the initial UI for displaying available NDIS services to participants, including service listing layout and basic structure.

### 2. Services UI & Category Filter
**Commit:** `4c52bec` — Implement services UI and category filter

Added the services page UI with filtering capabilities. Participants can browse services organized by category.

### 3. Category Filter Design
**Commit:** `50acf9d` — Implement category filter design

Designed and implemented the category dropdown/filter component used on the services page to narrow down results by service category.

### 4. Book Service UI
**Commit:** `3dfbb1a` — Implement book service UI

Created the booking flow UI for participants to book an NDIS service, including service selection and booking form.

### 5. Bookings UI
**Commit:** `825ead2` — Implement bookings UI

Built the My Bookings page where participants can view and manage their existing bookings.

### 6. Support Workers UI
**Commit:** `a132c19` — Implement support workers UI

Initial implementation of support workers management page for coordinators.

### 7. New-main Branch Merge
**Commit:** `21e9796` — Update code from new-main branch, preserve connection settings

Merged changes from the `new-main` development branch while preserving the database connection settings in `appsettings.json`.

### 8. Support Workers UI Update
**Commit:** `8631b94` — update the ui and also support workers

Refined the support workers UI and added additional styling/functionality improvements.

### 9. Add New Service
**Commit:** `11e4451` — Implement Add New Service

Implemented the "Add New Service" feature for coordinators to create new service offerings in the system.

### 10. Playwright Test Scripts
**Commit:** `34c073f` — Updated Test Scripts

Updated Playwright end-to-end test scripts for automated testing.

### 11–15. Conflict Resolutions (5 commits)
**Commits:** `27298e7` · `04b330d` · `5fe4c68` · `526be7a` · `72c5db8` — Resolve conflicts with latest main

Five rounds of merge conflict resolutions to integrate the feature branches with the evolving main branch.

### 16. Book Service UI Design Update
**Commit:** `e29b350` — Update book service UI design

Redesigned the book service page with improved layout and user experience for the booking flow.

### 17. Bookings UI Design Update
**Commit:** `1f607b6` — Update bookings UI design

Redesigned the My Bookings page with better table layout, status indicators, and visual polish.

### 18. Service Recommendations & App Settings
**Commit:** `ac7ab86` — Update NDIS Portal with service recommendations, UI improvements, and appsettings cleanup

Major update including:
- AI-powered service recommendation feature
- Various UI improvements across the portal
- Cleanup of `appsettings.json` and `appsettings.Development.json`

### 19. Support Workers Page
**Commit:** `aaf849a` — Create supportworkers

Created the dedicated support workers page component for coordinators to manage support worker assignments.

### 20. Auth Test Update
**Commit:** `1126b9c` — Update auth.spec.ts

Updated Playwright authentication test scripts with new test scenarios.

### 21. PDF Terms → Modal Popup
**Commit:** `0db5f12` — feat: replace PDF terms link with modal popup

Replaced the external PDF terms link with an inline modal popup for a better user experience during signup.

---

## 🔀 Revert Branch — Feature Integration (7 Merge Commits)

### 22. LYRA-7-8: Available Services + Category Filter
**Commit:** `65adb9b` — Merge `origin/LYRA-7-8-View-Available-Services-Category-Filter` into Revert
- **Conflict resolved:** `services-list.page.html`

### 23. LYRA-13: Add New Service
**Commit:** `7c6e3df` — Merge `origin/LYRA-13-add-new-service-ui` into Revert

### 24. LYRA-16: Book Service
**Commit:** `77c2b25` — Merge `origin/LYRA-16-book-service-ui` into Revert

### 25. LYRA-17: Bookings
**Commit:** `2826d6d` — Merge `origin/LYRA-17-bookings-ui` into Revert

### 26. LYRA-19: Support Workers
**Commit:** `a51e790` — Merge `origin/LYRA-19-support-workers-ui` into Revert
- **Conflicts resolved:** `manage-services.page.html`, `index.html`, `category-dropdown.component.html/ts`, `styles.css`

### 27. Updated Test Scripts
**Commit:** `4d366e2` — Merge `origin/Updated-Playwright-Test-Scripts` into Revert
- **Conflicts resolved:** `appsettings.Development.json`, `appsettings.json`

### 28. Post-Merge: Duplicates & Budget Fix
**Commit:** `ee8ad3a` — fix: resolve duplicate members and budget limits after merge

Fixed duplicate family member entries and budget limit display issues that occurred after merging the feature branches.

---

## 🎨 Post-Revert UI & Feature Improvements (10 Commits)

### 29. Category & AI Button Reposition
**Commit:** `b66da8e` — fix: reposition categories left and AI button top-right in services page

Moved category filter buttons to the left side and the AI recommendation button to the top-right corner for better layout.

### 30. AI Name Change
**Commit:** `8ec7088` — Change AI name from 'Just Tell' to 'Assistant' and increase icon size

Rebranded the AI recommendation feature from "Just Tell" to "Assistant" and increased the icon size for better visibility.

### 31. StatusCardComponent
**Commit:** `383b17e` — Add StatusCardComponent for coordinator dashboard

Created a reusable `StatusCardComponent` to display summary statistics (total services, active bookings, etc.) on the coordinator dashboard.

### 32. Coordinator Dashboard + All-Bookings Update
**Commit:** `cb3fb25` — Merge LYRA-18-adahm changes: coordinator dashboard color schema, Refresh Action Separate Button, booking-queue table, all-bookings UI update

Major coordinator features:
- New color schema for the coordinator dashboard
- Refresh action as a separate button (not inline with other controls)
- Booking queue table for managing pending bookings
- All-bookings page UI update with improved table layout

### 33. Participant Pages Restoration
**Commit:** `762131f` — Fix: Restore participant pages from Revert - button-style category filters, AI recommendation button, no AI card in grid

Restored participant-facing pages after the Revert merge:
- Button-style category filters (not dropdowns)
- AI recommendation button visible on services page
- AI card removed from the grid (shown separately)

### 34. Material Icons + Category Filter Layout
**Commit:** `2ee343d` — Fix: Add Material Icons CSS and fix category filter wrapping layout

Added Material Icons CSS library and fixed layout issues where category filter buttons would wrap incorrectly on smaller screens.

### 35. Chatbot Icon — Purple Gradient
**Commit:** `d68aa54` — Fix: Update chatbot button icon to purple gradient, remove icon from AI chat messages

Changed the chatbot button icon to a purple gradient design and removed duplicate icons from AI chat message bubbles.

### 36. Chatbot Icon — PNG
**Commit:** `f99d0f6` — Fix: Update chatbot button to use PNG icon and remove chat icon from AI messages

Replaced SVG icon with a PNG icon for the chatbot button and cleaned up remaining duplicate chat icons in AI messages.

### 37. Chatbot Cleanup
**Commit:** `46c07c0` — Cleanup: Remove unused ChatIconComponent imports from chatbot components

Removed unused `ChatIconComponent` imports from chatbot-related components to keep the codebase clean.

### 38. Support Workers Restoration
**Commit:** `8f0677f` — feat: restore support workers functionality from Revert branch

Restored the coordinator support workers page that was accidentally removed by the LYRA-18-adahm merge:
- Added `SupportWorkersComponent` import and route (`/dashboard/support-workers`)
- Added "Support Workers" navigation link in sidebar with support icon
- Updated `NavItem` interface and sidebar to support the new icon type

---

## ✅ Final Sync Commit (from lyra/main)

### 39. Table Alignment Polish
**Commit:** `c184537` — Polish my bookings table alignment

Final polish pass on the My Bookings table: improved column alignment, spacing, and responsive layout across the table UI components (`booking-table.component.ts`, `table.ui.html/ts`, `table.model.ts`).

---

## 📊 Summary

| Metric | Value |
|---|---|
| **Total commits** | 39 |
| **Files changed** | 63 |
| **Lines added** | 1,323 |
| **Lines removed** | 3,482 |
| **Feature branches merged** | 7 (LYRA-7-8, LYRA-13, LYRA-16, LYRA-17, LYRA-19, LYRA-18, Playwright) |
| **Conflict resolutions** | 10+ |
| **New components** | StatusCardComponent, chatbot-button, chatbot-message, service-recommendation-modal |
| **Removed components** | terms-modal, booking-queue-table (old), status-card (old), old support-workers page |

**Status:** ✅ All changes successfully merged and pushed to `https://github.com/galitsachinese/LYRA-NDIS-PORTAL/tree/main`