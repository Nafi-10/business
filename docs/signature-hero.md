# Industry-aware homepage hero

The active homepage hero is a responsive CSS dashboard with an illustrative SVG factory scene. It presents sample operations data and does not initialize WebGL.

## Controls and data

- The five industry buttons preview retail, manufacturing, healthcare, education and hospitality workflows. Hover and keyboard focus preview an industry; clicking also passes the selection to the demo dialog.
- The Software, UI/UX, ERP and AI buttons update the displayed module name and description.
- Sample headings, metrics, workflow steps, resource labels and status summaries are defined in `src/hero-data.mjs`. They are illustrative, not live customer data.
- The animated spotlight and CTA effects are handled by `src/hero.js` and `src/hero.css`.

## Source files

- `src/hero.html` — hero markup and controls
- `src/hero.css` and `src/site-redesign.css` — responsive layout and visual treatment
- `src/hero.js` — industry/module interactions and motion preferences
- `src/hero-data.mjs` — sample dashboard content and tested motion helpers

`src/hero-cube.js` contains a separate WebGL cube renderer prototype. The current homepage does not import or instantiate it; the displayed hero remains CSS/SVG and does not request WebGL assets.

Run `npm run check` and `npm test` to validate the project.
