# Solution Collection Implementation Plan

**Goal:** Implement the approved concept directly after the hero, without the marked logo plaque, preserving the remaining landing page.

**Architecture:** A native HTML/CSS/ES-module section with four illustrative products, nine-industry and goal matching, category filters, product/demo dialogs, and a comparison view. Integrate through the existing Python page assembler. No checkout or external submission is introduced.

**Tech stack:** Existing static HTML, CSS, JavaScript, Python assembler; Node test runner.

**Spec:** User-approved concept in this chat, amended to remove its upper logo and place after Hero rather than before My Vision. Preserve pearl/navy/lavender/cyan, four product cards and finder. Product and price information is illustrative. Existing scroll-gated showcase stays after the new section.

## Tasks
- [x] Test catalog matching for industry/category/goal intersections, empty matches and reset, and preview chat replies.
- [x] Add `preview/solutions-data.mjs` for illustrative catalog and pure filtering/demo response logic.
- [x] Add `preview/solutions.html`, `solutions.css`, `solutions.js`: responsive concept layout, filters, product details, demo interactions and comparison, keyboard-accessible native dialog with reliable focus restoration.
- [x] Integrate section, asset fingerprints and hero/navigation entry points in `tmp/build-hero-preview.py`, hero/navigation sources. Keep existing showcase ID and its scrolling logic.
- [x] Run relevant existing suites, build and browser checks at desktop/tablet/phone sizes. Check empty filter results, dialog dismissal, comparison and all four previews.
- [x] Review changes and save `tmp/solution-collection-desktop.png`, a full-section browser capture of the implementation.

## Review focus
- No results after intersecting filters: clear explanation and reset.
- Responsive cards and native dialog fit narrow screens without page overflow.
- Dialog Escape restores initiating focus; background wheel cannot change showcase state.
- Demo chat never claims real orders, bookings or AI backend responses; dynamic text safely rendered.
- Both collection and industry section map to Solutions navigation; hero CTA reaches new collection.

## Execution notes
- User explicitly approved implementation of the concept with corrections; proceed inline without a repeated design approval.
- Existing workspace is not a Git checkout; preserve existing source and use ordinary file edits.
- UI rendering is checked in browser; meaningful pure matching/demo logic gets automated coverage.
- Review found cached showcase geometry could become stale when catalog height changed. Added layout refresh notification, a ResizeObserver, and input-time measurement; two actual-controller regression tests reproduce the stale-boundary problem and pass after the fix. Six-stage progression behavior is retained.
- Review found contact navigation should focus the destination, not the originating product button. Browser reproduced the original behavior; fixed closeFocus handling verified focus on the contact toggle.
- Browser verified all four demos, product details, comparison, filters, empty results, reset, Escape/focus restoration; widths 1920, 1366, 820, 390 and 320 have no horizontal page overflow.
- Relevant regression suite: 22 passing tests (catalog, showcase state/controller, vision rotation). Build and module syntax checks passed. Browser console error log empty. Temporary viewport override reset, QA tab closed, and the user's localhost tab refreshed to the new section.
