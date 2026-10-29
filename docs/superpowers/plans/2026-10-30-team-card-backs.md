# Team Card Backs Implementation Plan

> **For agentic workers:** Implement natively in the existing static preview, with the approved image as the design spec.

**Goal:** Replace the four old quote backs with the approved navy, cyan and lavender concept.

**Architecture:** Keep the existing suspended card layout and independent click-to-flip controls. Use live HTML for wording and new transparent image assets for the four illustrations. Keep each face responsive within the existing card dimensions.

**Tech Stack:** HTML, CSS, JavaScript modules, existing Python preview builder.

**Spec:** User-approved concept image `exec-5b466ea3-60d8-43bc-a070-534bc815e88b.png` in the thread's generated_images folder.

## Constraints and review focus
- Preserve all portrait fronts, names and roles; no automatic rotation.
- Back names must match the person on the front, including the full Tanjinul Ahsan Tazim name.
- Use the four approved English statements and replace the earlier Bengali quote content on the backs.
- Each decorative illustration is hidden from assistive technology; visible wording remains real text.
- Check clipping and page overflow at desktop, compact laptop, tablet and phone sizes.
- Announce the correct person's newly visible back after a keyboard or pointer flip.

## Implementation
- [x] Save four artwork files to `preview/assets/vision/` and document prompts in `docs/team-card-back-art.json`.
- [x] Update `preview/vision.html` with the approved per-person content, artwork and click hint.
- [x] Update `preview/vision.css` with navy satin surfaces, thin gradient borders, typography and responsive artwork sizing. Remove unused quote styling.
- [x] Update `preview/vision.js` live announcements for the new backs; preserve independent click states.
- [x] Run the preview builder and JS syntax check, verify all four flips, keyboard activation, no automatic turning, image loading, browser errors and responsive layout.
- [x] Save a screenshot of all four completed backs as the review artifact.

## Verification — 2026-10-30
- `node --check preview/vision.js` and `python tmp/build-hero-preview.py` completed successfully.
- Browser verified at 1920 × 960, 1151 × 720, 768 × 1024, 390 × 844 and 320 × 740. Each back has zero content overflow; the page has zero horizontal overflow at these widths.
- All four illustration images loaded. Each card turns independently, remains on its selected side, and returns to the portrait when activated again. Enter/Space activation, End navigation and mobile selection controls verified.
- Screen-reader status identifies the correct person, role and message. No browser errors observed in the preview tab.
- Screenshots: `tmp/team-card-backs-desktop.jpg` and `tmp/team-card-backs-mobile.jpg`.
