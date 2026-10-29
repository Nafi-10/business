# Maison Velour project atelier

User-approved scope: create the featured Maison Velour section after the ERP story, with an exceptional, premium, interactive presentation using the supplied real project.

Design: an ivory gallery surrounded by CanveliqSoft navy, violet and cyan. A large floating browser, small responsive phone, contextual annotations, and a four-stop chapter rail. Visitors can drag the stage, use arrow buttons, or choose a chapter. No new scroll trapping or autoplay. The supplied screenshots preserve Maison Velour's cocoa/ivory identity.

Chapters: Storefront, 3D Boutique, Gifting, Collection. Each updates the display, narrative, craft notes, and entry point. Enter experience opens a full-screen native dialog containing the actual bundled website. Desktop/mobile controls change the embedded viewport. Escape closes the outer experience after any nested project dialog closes; close restores focus and unloads the iframe.

Implementation: preview/portfolio.html, portfolio.css, portfolio.js; copy only the archive's dist/ to preview/projects/maison-velour and selected social-kit images to preview/assets/maison-velour. tmp/build-hero-preview.py replaces the redundant ERP demo block and guards its legacy dashboard updater while retaining industry selection for booking.

Verification: inspect desktop, tablet and mobile; check all four chapters, dragging without vertical scroll interception, direct routes, iframe mobile mode, real boutique interaction, dismissal/focus, quote action, no browser errors and local asset integrity. Existing hero/showcase/ERP story remain intact.

Ruling: this is a bounded extension of the existing homepage approved by “do it.” Implement inline without another approval checkpoint. Browser checks cover the reversible visual change; no duplicate implementation-mirroring unit tests.

Completed verification, 22 October 2026:
- Desktop drag, chapter buttons, arrow keys/Home/End and the Work navigation link checked in the browser.
- Responsive layouts checked at 320, 390 and 768 pixels; no horizontal overflow.
- Actual storefront, 3D boutique, gifting and collection routes render in the viewer. Desktop/mobile modes checked; boutique movement controls work.
- Fixed Storefront/Boutique same-document navigation by assigning each iframe entry a stable chapter query; verified both directions.
- Search Escape now dismisses the inner panel first. Forward Tab from the embedded site's final link reaches Desktop preview; backward Tab from its first link reaches Collection. Close restores focus and unloads the iframe.
- Quote button opens the existing enquiry form; no submission performed.
- Module syntax checks passed, all four existing showcase state tests passed, and all 72 bundled project files match the supplied archive.
- Browser warning/error log empty on final verification. Screenshot: tmp/maison-atelier-final.png.
- Build now versions CSS/JS entry URLs by content hash so a refreshed preview loads the current changes.
