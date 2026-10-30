# Readable Product Detail Pages Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement these tasks in this session.

**Goal:** Deliver the approved readable ten-block product pages for all Collection products, with functional demos, saving and brief handoff.
**Architecture:** A standalone `product.html?id=...` uses one data model and one renderer. Collection and homepage product entry points navigate to it; existing demo dialogs remain available. The current static preview and Node developer export both build the page.
**Tech Stack:** Existing HTML, CSS, browser ES modules, native Node tests and Python preview assembler; no new runtime dependencies.
**Spec:** Approved V2 images and prompts in `docs/product-detail-concepts-readable-2026-10-30/` plus the user's ten-block specification.

## Global Constraints
- Ten blocks in the approved order, concise summaries and native expandable details, legible responsive type, navy/lavender/cyan palette.
- All 45 products use the same fields: audience, problems, outcomes, included, notIncluded, story, timeline, pricing, licence, support, requirements, related.
- Maison Velour uses actual project imagery and credits Kazi Jawad; no claim that Figma files, commercial asset licences or connected checkout already exist.
- Concepts, sample data, illustrative pricing and timeline disclosures remain explicit. No payment or backend submission is introduced.
- Existing industry scroll experience and unrelated homepage sections stay intact.

## Review Focus
- Invalid/deep-linked product IDs must show a useful recovery state, not a crash or unsafe content.
- Save state must match Collection, including denied storage and multiple tabs.
- Fit results must survive into the right service/industry brief without overwriting an existing draft.
- Demos must stay bounded, scripted and honest; no fabricated order access or medical advice.
- Sticky navigation and CTA must not cover content or prevent keyboard/mobile use.

### Task 1: Product model and meaningful tests
- [x] Add `tmp/product-pages.test.mjs`; run red against missing product model.
- [x] Create `preview/product-page-data.mjs` exporting `getProductDetail`, `productDetailUrl`, `normalizeFit`, `productInquiry`, `productBriefUrl`, `sampleReply` and ordered `detailSections`.
- [x] Validate every catalogue record, industry-related links, aliases, invalid IDs, fit input boundaries, Maison provenance and chat fallback.

### Task 2: Shared accessible page and interactions
- [x] Create `product.page.html`, `product-page.css`, `product-page-view.mjs`, `product-page-visuals.mjs`, and `product-page.js` in `preview/`.
- [x] Render all ten blocks and related links, accordion summaries, image previews, module map, software simulation and bilingual scripted chat.
- [x] Wire native fit dialog, Save state, progress rail, nav, language switch, brief and WhatsApp URLs. Test behavior and rendered block order.

### Task 3: Entry points, brief handoff and builds
- [x] Link Collection cards and homepage product actions to canonical product URLs; preserve existing preview demos and search.
- [x] Update project brief prefill to safely consume allowed fit parameters.
- [x] Add product-page assembly/fingerprints to `tmp/build-hero-preview.py` and developer `scripts/build.mjs`; sync changed source into export.
- [x] Run model/regression tests, JS syntax checks, and both builds.

### Task 4: Browser verification and review
- [x] Verify desktop, tablet and mobile layouts; all four variants; Collection links, Save, fit handoff, demos, related links, invalid IDs and keyboard dialog dismissal.
- [x] Inspect console and asset/network failures; capture evidence screenshots.
- [x] Review implementation against approved design and report material limitations.

## Execution ledger
- Approved design and direct implementation request authorize continued implementation without a further approval round.
- Workspace is a static project without Git; use existing workspace and preserve source/export structure.
- Pre-flight: renderer and controller consume the model's product object; brief handler consumes the same normalized fit; both builders must publish the same files. No conflicting interfaces.
- Completed: shared product page, all 45 Collection links, four category variations, original Maison imagery, interactive demos, fit handoff and responsive layouts.
- Fresh final verification: 50/50 developer package tests pass; JavaScript syntax checks and both builds pass. All 14 changed source files match the developer export.
- Review corrections: cross-tab and storage-denied Save behavior; industry-aware ERP/chatbot routing; tab draft preservation, optional context merge and Back-history reconciliation.
- Browser evidence: normal handoff and browser Back preserve the merged draft; sample stock reaches zero/reset and OrderDesk stages/reset; English/Bangla scripted conversation; no horizontal overflow at tested widths; invalid-ID recovery; native Escape focus restoration. No emails/messages or payments sent.
- Screenshots and handoff notes: `docs/product-detail-implementation-2026-10-30/`.
