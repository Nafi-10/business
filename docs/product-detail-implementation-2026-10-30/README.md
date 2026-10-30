# Readable product detail pages

Implemented the approved V2 design as a shared, responsive, ten-block page for all 45 Collection products.

## Local previews

- Software: http://localhost:3001/product.html?id=retail-software
- Original Maison Velour Commerce UI Kit: http://localhost:3001/product.html?id=retail-design
- Custom ERP: http://localhost:3001/product.html?id=retail-erp
- AI & chatbot: http://localhost:3001/product.html?id=retail-ai

## Source and builds

`preview/product-page-data.mjs` holds the common product fields and category/industry content. `product-page-view.mjs` renders the ten sections. `product-page-visuals.mjs` supplies original project imagery and illustrative interfaces. `product-page.js` handles interactions and `product-page.css` handles layout.

The existing preview assembler and developer package builder now emit `product.html`. The developer package in `exports/CanveliqSoft-Developer-Project` contains the same source and tests.

## Verified behavior

- Collection title, primary Click for Detail and secondary Details links open the matching page.
- Generic homepage ERP/chatbot links preserve the chosen industry.
- All ten sections render in order for every category. Related products stay in the same industry.
- Save controls stay in sync between Collection and detail tabs, and retain visit-only choices when storage is unavailable.
- Fit answers pre-fill the correct service, industry and goal. Native dialog Escape restores focus.
- A previous brief survives product exploration and browser Back. New product context is added only through the visible merge button. Clear draft removes the local draft.
- Stock simulation reaches zero without negative values, then resets. OrderDesk progresses through stages and resets.
- The chatbot is a bounded, local English/Bangla scripted sample; it does not access live orders or send enquiries.
- Maison Velour uses actual storefront, mobile, collection and gifting images, with Kazi Jawad's credit.
- Desktop, tablet and narrow mobile checks (320, 390 and 768px plus desktop) showed no horizontal overflow. Sticky CTA, dialog, sample conversation and disclosures remain usable.
- Invalid product IDs have a Collection recovery link. No console errors were observed in the tested product pages.
- Final verification: 50/50 regression tests pass; JavaScript syntax checks and both builds pass. All 14 changed source files match the developer export.

## Scope

Prices and delivery ranges are illustrative. Payment processing, account provisioning, live AI connections and server-side enquiry submission are not part of this change. The existing brief is reviewed locally, then can be opened in an email draft or downloaded. Nothing is sent automatically. Licence, Figma source handover and third-party asset rights require agreed scope.

The browser screenshot `commerce-ui-kit-desktop.jpg` shows the implemented page.
