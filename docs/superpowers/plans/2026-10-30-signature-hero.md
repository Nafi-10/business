# Signature Product Cube Implementation Plan

> Execute inline using executing-plans; the user's detailed hero specification is the design authority. Existing authorization is to implement website improvements without further approval gates.

**Goal:** Make the hero demonstrate connected Software, UI/UX, ERP and AI through an assembling, interactive product cube.

**Architecture:** Retain the existing page and Three.js library. A small shared data module supplies industry previews and bounded motion calculations; the DOM controller handles accessible controls and lifecycle; a separately imported renderer handles desktop WebGL. CSS supplies a light 3D fallback for mobile, reduced motion and unavailable WebGL. Both builders keep source/portable output synchronized.

**Tech stack:** Existing HTML/CSS/ES modules, local Three.js, Node tests and Playwright. No new dependency or remote asset.

**Spec:** User's 30 October request: one assembly on load; module hover/drag labels; interactive industry list; cyan/violet rim light, reflection, depth and float; three small sample UI cards; layered background, grid, grain and cursor light; italic gradient intelligence; sequenced reveal; frosted/shrinking navigation; magnetic/shimmer CTA and demo play icon; readable service chips; scroll-linked cube movement; mobile/reduced-motion adaptations.

## Decisions and constraints

- Use existing Three.js on desktop rather than a video: module hit-testing needs real geometry. Mobile and reduced motion use CSS geometry with manual rotation and the same controls.
- Use factual service chips and clearly labelled illustrative data, not invented client counts or outcomes.
- Industry hover/focus/click updates local hero previews; a committed click also updates the existing demo industry's context. It must not trigger the next section's scroll sequence or steal touch scrolling.
- Pause freezes ambient animation; manual controls remain usable. Pause, reduced-motion changes, hidden tabs, offscreen canvas and context loss must be handled.
- Keep the existing loader capped at its current duration. Do not block content on WebGL initialization. Keep all other section behavior and links intact.
- Workspace has no Git repository; use local source snapshots, not a worktree or commits. Main authoring files are `preview`, mirrored to the portable project's `src`.

## Tasks

- [x] 1. Data/motion contract. Add `preview/hero-data.mjs`: `modules`, `industryPreviews`, `previewFor(id)`, `motionPolicy({reduced,compact,saveData})`, `assemblyPose(index,progress)`, `scrollPose(progress)`. Tests assert all five industry previews change all three cards; four modules are reachable; invalid IDs fall back; endpoints assemble exactly; non-finite/overscroll inputs stay bounded; mobile/reduced/save-data disable ambient/WebGL. Run tests RED then GREEN.
- [x] 2. Replace `hero.html`/`hero.css` layout and add DOM coordination in `hero.js`. Add native industry and module buttons, accessible live labels, sample cards and a usable CSS fallback; reveal after loader, pointer-only magnetic/spotlight behavior, no mobile scroll trapping. Update navigation CSS for frosted glass and smaller scrolled size. Browser checks will validate hover, focus, click, touch scroll, reduced motion, menu and CTAs.
- [x] 3. Add `hero-cube.js` desktop renderer. Eight rounded glass modules, bright rim lighting and environment, one assembly, module raycasting/highlight, drag and keyboard rotation, floor reflection and restrained float. Respect pause/offscreen/reduced-motion and recover to fallback on WebGL failure. Wire renderer through lifecycle methods `setIndustry`, `setModule`, `setPaused`, `setScroll`, `rotate`, `destroy`.
- [x] 4. Fingerprint dependencies in both builders, sync, build and inspect desktop/laptop/tablet/mobile. Run full project checks and focused browser regressions, including no WebGL request on mobile/reduced motion, drag, module selection, industry previews, actual context loss, pause, scroll-linked transform and no horizontal overflow. Document the result and run a fresh independent review; fix material findings.

## Review focus

- Loader end or delayed renderer must not leave hidden copy or a blank cube.
- Touch drags and industry buttons must preserve normal page scrolling and the next showcase's pin sequence.
- Reduced-motion changes and offscreen/hidden transitions must stop animation loops, including after renderer failure.
- Raycast/hover changes must have keyboard and touch equivalents with readable text and accurate ARIA state.
- Resize, browser back and fast scroll must not clip CTAs or leave the fixed nav overlapping content.

## Progress

Plan created. Existing hero uses recurring explode/reassemble motion and no semantic module selection. This will become one arrival assembly plus a connected product preview.


Completed 30 October 2026. Task 1: four behavioral tests observed RED then GREEN. Tasks 2–3: DOM/renderer implemented and browser verified. Task 4: both builds pass; syntax checks pass; 61/61 project tests pass; preview/portable sources and four generated pages match. Sandbox loopback initially blocked six server tests (EACCES); approved rerun passed all 61.

Browser command: `node tmp/check-signature-hero.cjs` passed industry/demo context, module/keyboard/drag, pause, scroll pose, actual WebGL context loss, responsive widths, native vertical touch scroll, reduced motion, mobile no-WebGL requests, mobile menu, Explore CTA and no-JavaScript fallback. Screenshots are in `tmp/hero-signature-*.png`.

Final review: fresh read-only reviewer found no material issues. Its additional draw-call instrumentation confirmed pause/offscreen/reduced-motion stop rendering; native touch swipe scrolled from 320 to 515. Unchanged backend and sections were outside its audit; existing project regression tests cover them. Physical-device/Safari testing remains outside the performed browser verification and is documented. No deferred code findings.

Workspace has no Git repository, so branch/commit/task-done tooling is inapplicable; source snapshots and this ledger preserve the local record. No destructive cleanup, external publication or additional ZIP was requested.
