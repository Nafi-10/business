# CanveliqSoft

Complete editable website project, updated 1 November 2026. This package contains the landing page, Collection page, industry guide pages, individual detail pages for all 45 products, four embedded projects, front/back team cards and the industry-aware custom-project brief.

The homepage now opens with the approved CanveliqSoft logo animation and “Beta Version 1.00”. It reveals the page after 1.8 seconds independently of asset loading, uses a 280 ms reveal with reduced motion, and skips the intro for direct section links and history restoration. Its source is `src/loading-screen.html`; the build embeds the logo so the intro needs no additional image request. With JavaScript disabled, the homepage appears directly.

The industry-aware homepage hero pairs Software, UI/UX, ERP and AI controls with illustrative operational dashboards. Industry buttons update the sample workflow and demo context. The hero uses responsive CSS and SVG artwork; it does not initialize WebGL. See `docs/signature-hero.md` for its active controls and source files.

## Start here

1. Extract the whole ZIP to a normal folder.
2. Open that folder in VS Code or a terminal.
3. Use Node.js 22 or newer with npm.
4. Run:

   ```sh
   npm run dev
   ```

5. Open **http://localhost:3001/**. The collection is at **http://localhost:3001/collection.html**. Open an industry guide at **http://localhost:3001/industry.html?industry=retail**. For the Maison Velour Commerce UI Kit, open **http://localhost:3001/product.html?id=retail-design**.
6. Stop the server with Ctrl+C.

There are no npm package dependencies. `npm install` is optional; all website libraries and assets are included. The source remains HTML, CSS and JavaScript, with a small native Node build pipeline.

This project keeps a single local development port: **3001**. If the port is already in use, stop the conflicting process before starting the site again. The server listens on your computer only. Development mode rebuilds when files in `src` or `public` change; refresh your browser to see the updated result.

## Folder structure

```text
CanveliqSoft/
├── .github/workflows/check.yml  Automated build/syntax/test checks
├── deliverables/               Desktop and mobile design screenshots
├── dist/                       Built frontend (brief submission needs the server)
│   ├── index.html
│   ├── collection.html
│   ├── industry.html
│   ├── product.html
│   ├── custom-brief.html
│   ├── assets/
│   └── projects/
├── docs/                       Design notes, artwork prompts and plans
├── public/
│   ├── assets/                 Logos, portraits, illustrations, fonts, libraries
│   └── projects/               Four embedded project experiences
├── scripts/
│   ├── build.mjs               Assembles all pages and copies all assets
│   ├── brief-api.mjs           Private custom-project submission endpoint
│   ├── briefs.mjs              Local research inbox
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
| `npm run briefs` | List privately saved custom-project enquiries |

All build paths are relative to this project, so it can be extracted anywhere. No Python installation is required for this export. Build replaces only this package's generated `dist` folder; keep edits in `src` and `public`.

## Where to edit

| Website area | Files in `src/` |
| --- | --- |
| Main page shell and shared base markup | `index.template.html`, `homepage.fragment.html` |
| Navigation | `navigation.html`, `navigation.css`, `navigation.js` |
| Hero and industry previews | `hero.html`, `hero.css`, `hero.js`, `hero-data.mjs` |
| Product/solution collection | `solutions.*`, `solutions-data.mjs`, `product-detail.mjs` |
| Pinned industry showcase | `showcase.*`, `showcase-premium.css`, `showcase-state.mjs` |
| Extra industries | `industry-explorer.css`, `industry-explorer.js` |
| Separate Collection page | `collection.page.html`, `collection.css`, `collection.js`, `collection-data.mjs`, `collection-visuals.mjs` |
| Industry guide pages | `industry.page.html`, `industry-page.css`, `industry-page.js`, `industry-page-data.mjs` |
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

Run `npm run build` to generate **`dist/`**. Keep the `assets` and `projects` folders beside `index.html`. The industry guide uses the `industry` query parameter; supported IDs include retail, manufacturing, healthcare, education, hospitality, textile, fashion, tourism and sports. Do not upload `src` as the website root. Static hosting supports the frontend; custom-project submissions additionally require the Node server and persistent private storage. See [Custom client brief](docs/custom-client-brief.md) for deployment and inbox instructions. Opening HTML with `file://` prevents JavaScript modules and some embedded project features from working.

## Current functionality

The site includes the interactive design, industry filters, product demos, comparisons, project experiences, delivery/support guidance and team cards. The third card in each industry opens a seven-step custom-project brief for four services across nine industries. Submitted custom briefs are stored privately by the included Node server, with a receipt shown only after saving. Use `npm run briefs` to review enquiries locally. The homepage's shorter brief remains an email-draft option. Neither flow sends email automatically. Catalogue products and prices remain illustrative; live payments, order management and customer accounts still need backend integration.

The latest product detail update provides one readable ten-block template for software, UI/UX kits, custom ERP and AI/chatbots across all nine industries. It includes an interactive fit check, saved products, related solutions, a sticky next-step bar and a prefilled project brief with tab-local draft restoration. The Commerce UI Kit uses the original Maison Velour project screenshots and credits Kazi Jawad. Software and chatbot interactions use sample data and scripted demonstrations.

Homepage styles are placed in the document head in their original cascade order to avoid a layout flash during slow loads.

Some embedded project integrations and outgoing links use external services. The bundled server is for local development and preview, not production payment or account hosting.

## Verification

Run `npm run check` and `npm test`. The original preview and this export are compared during packaging; `dist/index.html`, `dist/collection.html` and `dist/product.html` preserve the same assembled page content. The ZIP is checked for integrity and rebuilt after extraction. `SHA256SUMS.txt` records the export's delivered files and can be used to check archive contents before editing.
