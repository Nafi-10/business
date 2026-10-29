# Developer Project Export Plan

**Goal:** Deliver a downloadable ZIP with a conventional editable project structure matching the user's folder reference.

**Scope:** Package the existing static website in a separate export; preserve the active preview and all current designs. Use native Node.js scripts without introducing framework dependencies.

- [x] Copy editable fragments/styles/modules to `src`, static assets and embedded projects to `public`, existing tests to `tests` and notes to `docs`.
- [x] Add working Node build/server scripts, package scripts, ignore files, CI checks and a README. Include the generated `dist`.
- [x] Verify the assembled landing and Collection pages match the active preview, run existing tests and check local HTTP serving.
- [ ] Create the ZIP, verify entry integrity and extraction into a different directory, and provide the download link.

**Review:** Portable paths, asset completeness, identical assembled pages, correct JavaScript MIME types and no missing image files. Include no dependency caches, unrelated temp files or server logs.
