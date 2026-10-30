# Loading screen integration

The user approved the animated navy, lilac and cyan logo concept and requested
“Beta Version 1.00” beneath the signature, followed by integration into the main
homepage. The existing concept is the design specification.

Use an inline, dependency-free overlay on initial homepage entry. The animation
must finish in 1.8 seconds without waiting for the full page or the 3D canvas.
CSS provides the exit even if later scripts fail. Reduced motion gets a gentle
280 ms reveal; disabled JavaScript and direct section links show the page directly.
The website's existing render-blocking style order remains intact.

The cube's shader compilation starts after the intro is gone and the page has
painted. This keeps GPU setup from delaying the 1.8-second cleanup; the existing
cube fallback remains visible until the first real WebGL frame is ready.

The separate Sites publication preserves the supplied attachment byte for byte,
including its iframe sandbox and CSP, as requested. The beta label belongs to
the integrated homepage version; it does not alter the original publication.

## Implementation and verification

- [x] Exercise the real homepage with a browser check that first fails because
  the approved loader and beta label do not exist.
- [x] Add one self-contained loader fragment and insert it through both build
  paths; synchronize the portable developer project's source.
- [x] Verify desktop, tablet and mobile rendering, the 1.8-second exit, reduced
  motion, no JavaScript, blocked application modules and direct section links.
- [x] Run the existing project checks/tests and verify localhost serves the update.
- [x] Publish the unchanged concept attachment via Sites and retain its URL.

## Verification results

- The browser regression initially failed because the homepage had no loader.
- Desktop 1440×900, tablet 768×1024, phone 390×844 and landscape 667×375:
  beta label fits; logo loads; no horizontal overflow; final visible-intro timing
  is 1805–1817 ms. The cube initializes after the reveal and renders successfully.
- Reduced motion, disabled JavaScript, blocked application modules, direct
  section links and Collection page all leave content accessible.
- JavaScript syntax checks passed. All 50 existing tests passed after restarting
  the old development watcher that had been racing the explicit rebuild.
- A fresh reviewer found no blocking issues in the loader, build integration or
  deferred GPU setup. Preview, portable source and built hero scripts match.
- The original standalone attachment was published unchanged at
  https://canveliqsoft-loading-concept.kazihouse123.chatgpt.site
  using Site `appgprj_6ae44bca99088191b495b71a6a699d15` and commit
  `6ccfdb5dbe74dad87fcff95a26a87252a319fa4b`.
- Both the supplied attachment and published index have SHA-256
  `b68053e1fa271dfbf636a71f6d3d7fceb2617dd060772e00d01e30014333c66e`.

Risks to check: a slow module must not hold the overlay open; a failed script
must not leave the content invisible; a small landscape screen must not clip
the beta label; returning via browser history must not replay an expired loader;
the loader must not run on collection or product pages.
