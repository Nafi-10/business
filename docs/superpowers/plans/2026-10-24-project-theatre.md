# Project Theatre Implementation Plan

> Execute inline using the existing local HTML/CSS/JavaScript setup. The user approved the generated Project Theatre image and explicitly requested implementation.

**Goal:** Match the approved Work section concept with real project assets and working interactions.

**Architecture:** Replace the Work section composition in portfolio.html and portfolio.css. Adapt portfolio.js to project-level drag navigation and an inline Desktop/Mobile preview while retaining the existing live-project dialog, routes, and chapter data. Rebuild index.html with the existing Python build.

**Tech Stack:** HTML, CSS, JavaScript modules; existing local screenshots and project websites. No dependencies or hosting changes.

**Spec:** Approved concept image at C:/Users/Kazi_Jawad/.codex/generated_images/01a16030-dade-7410-9406-21f3a04ecd3d/exec-d5390640-424f-43fd-9c55-4122e318525d.png and the user's approval in this conversation.

## Global Constraints
- Pearl background, serif heading, dark navy theatre, violet/cyan accents.
- Four existing real projects; use actual screenshots rather than generated placeholder identities.
- Full-width desktop preview with project info beside it, floating thumbnail tickets below.
- Mobile stacks the preview and information, with a horizontal project selector.
- Keyboard controls, reduced-motion support, image-loading fallback, and native dialog focus restoration.
- Changes scoped to Work; keep showcase scrolling, navigation, other sections and project sources intact.

## Review Focus
- Rapid switching must not display a stale project's image.
- Mobile preview must open the corresponding mobile live experience.
- Swipe must switch projects without blocking vertical page scrolling.
- Story details and live routes must reflect the selected project.
- Narrow screens, long project names, keyboard navigation and dialog close must remain usable.

### Task 1: Theatre composition and controls
- [x] Replace Work markup and styles; preserve the live dialog.
- [x] Adapt project switching, device preview, drag, story expansion and keyboard navigation.
- [x] Verify new controls are absent before implementation, then function in the real browser.

### Task 2: Responsive and integration verification
- [x] Rebuild index.html; check JS syntax and existing test suite.
- [x] Browser check all four projects, device modes, story chapters, dialog routes and close.
- [x] Check 1440px, 768px and 390px layouts, plus overflow at 320px.
- [x] Review changed source and rendered result, leave localhost ready for the user.

## Execution notes
- This workspace is not a Git checkout; edits are made in place. Local backups are retained in tmp/project-theatre-before/.
- Visual and interaction checks use the real browser; no implementation-mirroring tests for CSS/markup.
- Verification: 14 existing showcase/vision tests passed; portfolio.js syntax passed; browser console has no errors.
- Browser interactions: drag switches project, next/previous wrap, device mode persists when changing project, mobile launches homepage in mobile dialog, chapter selection switches to desktop and correct route, Escape and close restore focus.
- Review caught tab sequence skipping the panel after selecting a project. Reproduced before fix; moved selector before panel in DOM with visual CSS order preserved. Tab now focuses the selected panel.
- Selected cards are recentered horizontally after resize. No overflow at tested widths 1440, 768, 390, 320.
- Desktop evidence: tmp/project-theatre-desktop.png.
