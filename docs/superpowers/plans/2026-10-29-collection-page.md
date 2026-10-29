# Collection Page Implementation Plan

> Execute inline using executing-plans. The user approved the generated concept and requested implementation; no further approval gate is needed.

**Goal:** Build a separate Collection page matching the approved pearl, lavender and cyan industry carousels.
**Architecture:** Static HTML/CSS/ES modules alongside the existing homepage. Shared navigation markup is compiled for both pages. A catalogue module owns filtering, carousel ordering and validated enquiry context.
**Tech stack:** Existing Python build, browser JavaScript, Node test runner; no new dependencies.
**Spec:** Approved concept image `C:/Users/Kazi_Jawad/.codex/generated_images/01a16030-dade-7410-9406-21f3a04ecd3d/exec-c5740cef-6957-4ace-b960-0eb9dfaea84e.png` and the user's Collection request.

## Constraints
- Nine full-width industry rows, five digital offerings each; prominent centre card and previous/next controls.
- Collection between Solutions and ERP on desktop and mobile navigation.
- Use existing logo, navy/pearl/lavender/cyan identity, responsive layouts and reduced-motion support.
- Clearly label all offerings as concepts. No fabricated ratings, availability, payments or orders.
- Preserve the existing homepage and six-step showcase behavior.
- Local-only project. This folder is not a Git checkout, so Git worktree/commit steps do not apply.

## Tasks
1. Catalogue and state: create `preview/collection-data.mjs` and behavior tests in `tmp/collection.test.mjs`. Verify combined search/filter/saved state, carousel wrap and valid/invalid enquiry context.
2. Page: create `preview/collection.page.html`, `collection.css`, `collection.js`, `collection-visuals.mjs`. Implement carousels, touch scrolling, search, saved items, product details dialog, empty state and quote links. Reuse the existing logo and portfolio/industry imagery where relevant.
3. Integration: update `navigation.html`, build `collection.html` from the shared header, add validated collection enquiry prefill to `project-brief.js`. Rebuild homepage and collection.
4. Verification: run Node suites and syntax checks; test navigation, arrows, search, favourites, modal keyboard close/focus, quote prefill and responsive desktop/tablet/mobile layouts in the browser. Save screenshots and perform independent review.

## Review focus
- Search with no matches must offer a clear reset.
- Carousel wraps in both directions and each row stays independent.
- Saved items gracefully tolerate unavailable or malformed local storage.
- Untrusted enquiry query values cannot populate arbitrary content or service values.
- Mobile controls remain reachable without page-wide horizontal overflow.

## Progress
- Catalogue/state complete: five behavior tests passed after the missing module was confirmed.
- Page and integration complete: nine rows, 45 concepts, responsive carousels, searchable filters, local saved favourites, native details dialog, and validated project-brief prefill.
- Browser checks: desktop arrows keep rows independent; dot selection restores focus; empty search and combined filters work; saved favourites survive reload; Escape closes dialogs and restores focus; Care UI Kit passes design/healthcare/product context into the homepage brief; mobile menu and ERP details work; phone/tablet layouts have no page-width overflow.
- Independent review found a detached dot focus target and inaccessible ERP details on smaller screens. Both fixed; reproduced dot error in browser then confirmed corrected focus. Product titles now open details at every screen size, including ERP.
- No changes to payment/order capabilities. The catalogue is explicitly illustrative.
- Final verification: build and JavaScript syntax checks passed; 39/39 Node tests passed. Browser checked at 1440x1000, 768x1024 and 390x844; final screenshot saved to tmp/collection-page-desktop.jpg. No outstanding review findings.

## Fixed filters — 2026-10-30
- Moved industry, search, solution-type, saved-only and result/reset controls to a fixed pearl/lavender sidebar in the requested left gutter. Reserved catalogue space so cards cannot overlap it.
- Below 1281px, a persistent Filters button opens the same controls in a compact, scrollable panel. Supports close, outside click, Escape, focus restoration, navbar search and Show results. Filter values survive closing/reopening and resizing.
- Filter changes reveal matching results when the visitor is farther down the page. Empty-state reset restores products without reopening or focusing an inert mobile panel.
- Browser proof: sidebar top 188px and left 22px remained unchanged while page scroll moved from 0 to 1124px and back upward. Checked desktop 1920x960 and 1440x900, tablet 768x1024 and phone 390x844 with no page overflow.
- Verified healthcare + ERP gives one matching product; empty search/reset restores 45; saved-only works and test favourite was removed; mobile toggle, navbar search, Escape, Show results and empty-state reset all work. No browser console errors. Build, syntax check and all five collection tests passed.
- Screenshot: tmp/collection-fixed-filters-desktop.jpg.
