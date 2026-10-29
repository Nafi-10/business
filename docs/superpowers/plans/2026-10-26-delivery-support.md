# Delivery & Support — approved concept implementation

## Brief
Implement the approved dark navy Delivery & Support concept directly between Work and My Vision. Retain the large serif headline, lavender italic line, journey switch, four-stage selector, illuminated glass folder and three support disclosures. Default to Custom projects / Launch. Use brand navy, lavender and cyan; no extra logo.

## Tasks
1. Define two coherent journeys and a small state module. Test switching journeys, stage selection, invalid input and keyboard traversal before implementation.
2. Build scoped native HTML/CSS/JS, with responsive folder artwork, a handover dialog, support disclosures and contact routing. Build through the existing assembler, never only edit index.html.
3. Verify relevant regression tests, desktop/tablet/mobile layout, keyboard and dialog behavior; capture screenshots and obtain a focused code review.

## Constraints and integration
- This is a marketing journey, not a project tracker. No fake delivery guarantees, live order status, checkout or downloads.
- Native dialog with focus return and Escape; journey and stage controls keyboard accessible; reduced-motion support.
- Contact CTA reveals existing real contact options. Do not send messages.
- Preserve the six-stage industry showcase and all existing sections.
- Repository has no Git metadata; edit the authorized local workspace directly. No branch, worktree or commit steps apply.
- Existing approved image is the visual specification. User explicitly requests implementation without further approval.

## Progress
- Started: approved image inspected, assembly and contact integration reviewed.
- Complete: added delivery.html, delivery.css, delivery.js and delivery-data.mjs; assembler inserts the new section directly between Work and My Vision and fingerprints its assets.
- State tests: initial run failed on the missing module; all four new tests now pass. Combined active regression suite: 26 passed, including the existing six-stage showcase scrolling and vision rotation tests. JS syntax checks and preview build pass.
- Browser verification: journey switching, stage keyboard arrows/Home, dialog open/Escape/focus return, support disclosures and contact reveal/focus all verified. No console errors. Layout inspected at 1440, 820, 700, 390 and 320 pixel widths; no page horizontal overflow. Mobile dialog fits and scrolls internally.
- Focused read-only reviewer found clipped support-summary focus outlines. Fixed with inset outlines and corrected selector specificity; browser confirmed :focus-visible and -5px outline offset.
- Visual fixes: folder fits fully inside its panel; small-screen layout starts at 760px; longer mobile folder titles no longer intersect the floating badge (verified positive 9.8px clearance).
- Screenshot evidence: tmp/delivery-support-desktop.png and tmp/delivery-support-mobile.png.
- No deferred findings. No changes to payments, support commitments, existing scroll gates or contact destinations.
