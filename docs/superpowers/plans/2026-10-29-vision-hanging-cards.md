# My vision — hanging cards

Reference: `D:/Personal Project/CanveliqSoft/About Team.mp4`; sampled frames in `tmp/vision-reference-frames/`.

The user requests the reference's suspended ID cards, gentle swaying and staggered face/back flips in My vision. Preserve the dark CanveliqSoft theme, founder photo and identity, exact three Bengali quotes, and three-second rotation. Implement inline with executing-plans.

## Implementation
1. Replace vision markup with a curved suspension wire, founder badge and three thought badges. Reuse existing portrait and transparent wordmark. Keep a single accessible flip button per card and separate quote controls.
2. Replace vision CSS with dimensional badge surfaces, clips, cords, subtle pendulum motion and Y-axis flips. Four cards on desktop, a horizontal snap gallery on small screens. Reduced motion stops swinging/flipping animations.
3. Adapt existing vision controller: auto-select one thought every three seconds, manual card/page/arrow actions pause autoplay, founder card flips independently, pause when offscreen/document hidden. Move the mobile gallery only following explicit user navigation, never a timer tick.
4. Rebuild generated homepage. Run existing rotation and regression tests plus syntax checks. Verify desktop/tablet/mobile in browser, both card faces, controls, quote timing and no horizontal page overflow; independent review.

## Decisions
- Adapt the reference's four team profiles to one founder plus three personal thoughts; only one supplied identity exists. Keep all supplied content verbatim.
- Preserve actual text and controls in HTML rather than flattening the reference into an image/video.
- This folder is not a Git repository; worktree/commit steps do not apply. This file is the durable progress ledger.

## Progress
- Reference decoded and inspected. Source and existing three-second rotation tests inspected.
- Rebuilt four suspended badges with curved wire, cords, metal clips, independent pendulum motion and dimensional Y flips. Founder photo/logo and all three Bengali quotes retained.
- Added responsive horizontal gallery below 1151px. Manual selections center the selected card in the rail; automatic changes do not trigger scrolling. Existing rotation utility retained.
- Browser verification: founder flips independently; thought cards toggle both ways; previous wraps to third; next returns to first; selection pauses autoplay; correct face accessibility state; mobile navigation preserves the selected quote. Autoplay changes observed in browser; precise three-second cadence and wrap covered by existing clock-driven tests.
- Independent review identified sway continuing after Pause. Confirmed all four computed animation states were running, then added a shared pause state and verified all four are paused. No other concrete review findings.
- Responsive QA exposed 14px quote overflow at the previous 1051px breakpoint and 7px at phone width. Raised swipe breakpoint and increased mobile badge height; verified all faces have matching clientHeight and scrollHeight at 1151x720 and 390x844. Checked 768x1024 and 320x740 with no page-wide overflow. Compact desktop section fits in 714px.
- Build and JS syntax checks pass. All 39 regression tests pass. Browser reports no console errors. Preview saved at tmp/vision-hanging-desktop.jpg and tmp/vision-hanging-mobile.jpg.
