# CanveliqSoft

Complete editable website project, exported 30 October 2026. This package contains the latest landing page, Collection page, individual detail pages for all 45 products, four embedded projects and the finished front/back team cards.

The homepage now opens with the approved CanveliqSoft logo animation and “Beta Version 1.00”. It reveals the page after 1.8 seconds independently of asset loading, uses a 280 ms reveal with reduced motion, and skips the intro for direct section links and history restoration. Its source is `src/loading-screen.html`; the build embeds the logo so the intro needs no additional image request. With JavaScript disabled, the homepage appears directly.

## Start here

1. Extract the whole ZIP to a normal folder.
2. Open that folder in VS Code or a terminal.
3. Use Node.js 22 or newer with npm.
4. Run:

   ```sh
   npm run dev
   ```

5. Open **http://localhost:3001/**. The collection is at **http://localhost:3001/collection.html**. For the Maison Velour Commerce UI Kit, open **http://localhost:3001/product.html?id=retail-design**.
6. Stop the server with Ctrl+C.

There are no npm package dependencies. `npm install` is optional; all website libraries and assets are included. The source remains HTML, CSS and JavaScript, with a small native Node build pipeline.

If port 3001 is already being used:

```sh
npm run dev -- --port 3002
```

Open http://localhost:3002/ instead. The server listens on your computer only. Development mode rebuilds when files in `src` or `public` change; refresh your browser to see the updated result.

## Folder structure

```text
CanveliqSoft/
├── .github/workflows/check.yml  Automated build/syntax/test checks
├── deliverables/               Desktop and mobile design screenshots
├── dist/                       Built website, ready for a static web host
│   ├── index.html
│   ├── collection.html
│   ├── product.html
│   ├── assets/
│   └── projects/
├── docs/                       Design notes, artwork prompts and plans
├── public/
│   ├── assets/                 Logos, portraits, illustrations, fonts, libraries
│   └── projects/               Four embedded project experiences
├── scripts/
│   ├── build.mjs               Assembles all three pages and copies all assets
│   ├── serve.mjs               Local development/preview server
│   ├── check.mjs               JavaScript syntax checks
│   └── test.mjs                Cross-platform test runner
├── src/                        Editable section HTML, CSS, JS and data modules
├── tests/                      Behaviour, filtering, scrolling and server tests
├── .editorconfig
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── SHA256SUMS.txt               Checksums of the delivered files
```

`node_modules`, temporary logs, caches and generated test-report folders are not needed for this project. `dist` is included in the download but ignored by Git because it can be regenerated.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Build, serve locally and watch edits |
| `npm run build` | Rebuild the complete `dist` folder |
| `npm run preview` | Serve the existing build |
| `npm start` | Serve the existing build, building first if needed |
| `npm run check` | Check source, script and test JavaScript syntax |
| `npm test` | Rebuild and run the automated tests |

All build paths are relative to this project, so it can be extracted anywhere. No Python installation is required for this export. Build replaces only this package's generated `dist` folder; keep edits in `src` and `public`.

## Where to edit

| Website area | Files in `src/` |
| --- | --- |
| Main page shell and shared base markup | `index.template.html`, `homepage.fragment.html` |
| Navigation | `navigation.html`, `navigation.css`, `navigation.js` |
| Hero and cube | `hero.html`, `hero.css`, `hero.js` |
| Product/solution collection | `solutions.*`, `solutions-data.mjs`, `product-detail.mjs` |
| Pinned industry showcase | `showcase.*`, `showcase-premium.css`, `showcase-state.mjs` |
| Extra industries | `industry-explorer.css`, `industry-explorer.js` |
| Separate Collection page | `collection.page.html`, `collection.css`, `collection.js`, `collection-data.mjs`, `collection-visuals.mjs` |
| Individual product pages | `product.page.html`, `product-page.css`, `product-page.js`, `product-page-data.mjs`, `product-page-view.mjs`, `product-page-visuals.mjs` |
| ERP story | `erp-story.*` |
| Project showcase | `portfolio.*`, `portfolio-projects.mjs`, `portfolio-stories.mjs` |
| Delivery and support | `delivery.*`, `delivery-data.mjs` |
| Buyer guidance | `buyer-guide.*` |
| The Minds Behind the Canvas | `vision.html`, `vision.css`, `vision.js` |
| Project brief | `project-brief.*`, `project-brief-data.mjs` |
| Contact and footer | `contact.*` |

The current team section uses independent manual flips. Its new illustrations and portraits are in `public/assets/vision/`. Older unused `vision-state.mjs` and `vision-rotation.mjs` files are retained as source history; the live team section does not load them.

## Hosting

Run `npm run build` and upload the **contents of `dist/`** to a static web host. Keep the `assets` and `projects` folders beside `index.html`. Do not upload `src` as the website root. A local HTTP server or static host is required; opening the HTML with `file://` prevents JavaScript modules and some embedded project features from working.

## Current functionality

The site includes the interactive design, industry filters, product demos, comparisons, project experiences, delivery/support guidance, team cards and a multi-step project brief. Catalogue products and prices are illustrative. Live payments, order management, accounts and enquiry storage still need backend integration. A brief can be reviewed, downloaded or opened in an email draft; the website does not send it automatically.

The latest product detail update provides one readable ten-block template for software, UI/UX kits, custom ERP and AI/chatbots across all nine industries. It includes an interactive fit check, saved products, related solutions, a sticky next-step bar and a prefilled project brief with tab-local draft restoration. The Commerce UI Kit uses the original Maison Velour project screenshots and credits Kazi Jawad. Software and chatbot interactions use sample data and scripted demonstrations.

The loading fix places homepage styles in the document head, preserving their cascade order so the older layout does not flash during a slow load. The hero keeps its lightweight cube fallback visible until the first 3D frame has rendered.

Some embedded project integrations and outgoing links use external services. The bundled server is for local development and preview, not production payment or account hosting.

## Verification

Run `npm run check` and `npm test`. The original preview and this export are compared during packaging; `dist/index.html`, `dist/collection.html` and `dist/product.html` preserve the same assembled page content. The ZIP is checked for integrity and rebuilt after extraction. `SHA256SUMS.txt` records the export's delivered files and can be used to check archive contents before editing.
