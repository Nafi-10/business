# Commerce Design Implementation Plan

> Execute inline with executing-plans, followed by one fresh-context review. The user approved the generated four-view concept and asked for implementation.

**Goal:** Implement the approved premium collection, product details, project storytelling and three-step project brief.
**Architecture:** Preserve native HTML/CSS/module assembly and existing preview interactions. Add a focused commerce stylesheet, product detail tabs, project story data, and an independently testable brief validation/formatting module.
**Tech Stack:** HTML, CSS, ES modules, Python build script, Node native tests.
**Spec:** Approved image `C:/Users/Kazi_Jawad/.codex/generated_images/01a16030-dade-7410-9406-21f3a04ecd3d/exec-59c510be-15f4-43a3-8921-14591287887c.png` and user's "Implement the design properly". Pearl collection; midnight product detail/purchase panel; dark project storytelling; pearl contact section with a navy guided brief and folded glass illustration.

## Constraints
- Keep the original logo, all four real project viewers, search/comparison, Buyer’s Guide, Delivery, hero and six-step pinned industry scroll.
- Current products/prices remain previews. Purchase preview prepares a review and enquiry, not a fictitious completed payment.
- No enquiry backend is configured. Final brief is reviewable, downloadable and can open an email draft to the real business address. Do not show fake sent/submitted confirmations.
- Preserve brief inputs while changing steps; validate before advancing. No personal data written to local storage.
- Responsive at 320px, tablet and desktop; native keyboard operation and reduced-motion support.
- No Git checkout exists; edit in this authorized workspace and keep localhost:3001 running.

## Tasks
- [x] 1. Test brief field validation and safe handoff formatting; implement module and three-step UI with review/edit/download/email actions.
- [x] 2. Refine collection layout and implement dark product-detail tabs, accurate licence/setup information, preview purchase and service-to-brief routing.
- [x] 3. Implement three story chapters per real project, preserve all scene routes and viewers, and match the approved dark showcase.
- [x] 4. Build and run regression tests; inspect desktop/mobile interactions, validation, focus, layout and showcase behaviour; fix review findings and capture screenshots.

## Review focus
- User-entered brief content must render as text and cannot inject markup or email headers.
- Invalid/future step navigation cannot bypass required fields; back/edit preserves answers.
- Product modal modes restore focus and do not strand the pinned showcase; contact routing prefills without overwriting an existing brief.
- Case stories match selected projects and all original embedded project routes remain reachable.
- On narrow/short screens headings, buttons and form controls remain visible without horizontal overflow.

## Ledger
- Initial scope confirmed from the approved four-view concept. Reuse actual assets and native mini product interfaces; create folded-glass decoration in CSS.
- Implemented all four views. The build assembles the brief from a single source fragment and fingerprints its validation module, product details and project stories.
- Meaningful validation tests observed failing before implementation, then passing. Added a failing multiple-@ email regression from code review and fixed it.
- Final automated verification: 34 tests pass across brief validation/handoff, product search/filtering, delivery journey, pinned showcase scrolling and quote rotation; three edited controllers pass Node syntax checks.
- Fresh read-only review found two P2 issues, both fixed: malformed email local part and accordion initialization resetting project state. Initialization now only manages disclosure state; explicit chapter clicks navigate scenes.
- Browser checked at 1920×942, 1440×960, 1366×768, 820×1180, 390×844 and 320×740. Work fits both tested desktop viewport heights. No horizontal page overflow observed.
- Verified product tabs and arrow keys, purchase disclosure, quote prefill, preserving existing drafts, required-field blocking, safe text review, encoded email link, editing preservation, project scene memory, mobile preview preservation and live project viewer opening/keyboard close. No email was sent or payment made. Browser error log empty.
- Local screenshots: tmp/commerce-collection-desktop.jpg, tmp/commerce-product-desktop.jpg, tmp/commerce-work-desktop.jpg, tmp/commerce-brief-desktop.jpg.
- Remaining production integration: confirmed products/licences/prices, payments/order fulfilment and enquiry storage/notifications. The current interface explicitly identifies previews and prepares an email draft or text download.
