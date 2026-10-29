# Buyer Confidence Implementation Plan

> Execute inline using executing-plans. The user has delegated effective improvements and explicitly prefers action without additional approval.

**Goal:** Make the existing storefront easier to explore and understand by adding catalog search, clearer product decision information and a category-specific buyer guide.
**Architecture:** Extend the current native solution collection and shared dialog; add a self-contained buyer-guide section between Delivery and My Vision. Retain the plain HTML/CSS/ES-module assembly.
**Spec:** The user approved acting on the preceding recommendations. This plan records the concrete design: pearl buyer guide with editorial navy/lavender headings, four category buttons, native expandable questions and contextual catalogue/contact actions. No invented commercial commitments.

## Constraints
- Local-only development in D:/CanveliqSoft. No Git checkout or publishing steps apply.
- Retain the six-step scroll showcase and existing work/vision/delivery sections.
- Current catalog is illustrative; keep that explicit. Do not fabricate licences, reviews, prices, integrations, policies or live payment capability.
- Search and comparison operate on the same catalog data. Contact actions reveal the existing real contact methods without sending anything.
- Responsive at 320px through desktop; keyboard accessible, reduced-motion support, safe rendering of user search text.

## Tasks
- [x] 1. Extend catalog metadata and test useful search semantics (name, category, industry, multiple words, short AI query, empty/no match). Run tests failing, implement, rerun.
- [x] 2. Add search entry points in fixed nav and catalogue; preserve focus across search/results/details, improve details/comparison and preview labels.
- [x] 3. Add four-category buyer guide with native disclosures, direct filtered catalogue links, contact reveal and footer access. Insert before My Vision.
- [x] 4. Build, run relevant regression tests, verify browser interactions and responsive layouts, review and capture screenshots.

## Review focus
1. Search text cannot inject markup; empty/no-match states are usable.
2. Short queries like AI do not match incidental letter sequences in Retail.
3. Search -> product details -> Escape returns focus to the original search trigger.
4. Buyer-guide links correctly reset unrelated filters and do not break pinned-showcase geometry.
5. All FAQ answers remain available without a keyboard trap; mobile layout and outlines are visible.

## Progress
- Existing catalog, navigation and dialog flow inspected. All supplied products remain previews; substantive commercial details require confirmation before sale.
- Added search to fixed navigation and catalog; all four product details now disclose availability, licence, requirements and unconfirmed costs. Comparison uses the same data. ERP configuration returns to product details.
- Added a pearl buyer guide between dark Delivery and My Vision, with four categories, 16 native expandable answers, filtered catalog routes and existing contact reveal. No messages are sent by the guide.
- Verified native dialog search, safe no-result rendering for markup input, Back to search, Escape and original trigger focus. Explicit Escape handling prevents a search input consuming the first Escape solely to clear its value.
- Browser checks at 320, 390, 820, 1366 and 1920px. No observed horizontal overflow in new surfaces; phone menu closes on search; native FAQ disclosures work by keyboard. Browser error log empty. Comparison includes all four products and the new decision rows.
- All 29 regression tests passed, including six-stage showcase pinning/reverse travel and layout-change handling. Focused independent read-only code review found no actionable issue.
- Desktop proof: tmp/buyer-guide-desktop.jpg. Site remains on localhost:3001; no publishing, payment integration, account storage or invented final terms.
