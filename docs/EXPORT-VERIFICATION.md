# Export verification — 30 October 2026

- Both assembled pages match the active preview's HTML content (line-ending normalization only).
- `npm run check`: all source, build/server and test JavaScript syntax checks passed.
- `npm test`: 40 tests passed, 0 failed, 0 skipped.
- Tests cover filters, saved items, enquiry data, delivery journey, project briefs, scroll gating, catalogue matching and local HTTP serving.
- HTTP checks cover both pages, all four new team illustrations, module MIME types, HEAD requests, byte ranges, missing files and blocked traversal/write requests.
- Artwork, portraits, fonts, local libraries and all four embedded projects are included in `public` and the generated `dist`.

Original visual verification screenshots are included under `deliverables`.
