# Custom client brief

Implemented 30 October 2026 from the approved client-discovery map.

## Client experience

The third card in each Collection industry is now **Custom solutions**, with **Share your idea** as its action. It opens `custom-brief.html` with that industry selected. Selecting a service filter also carries the service into the form. Existing ERP product URLs and saved product IDs remain valid.

The form supports Software, UI/UX design, Custom ERP and Chatbot across Retail & commerce, Manufacturing, Healthcare, Education, Hospitality, Textile, Fashion Designing, Tourism and Sports. One shared schema provides all 36 combinations.

Seven steps collect:

1. Business context, problem and desired improvement.
2. Questions specific to the selected service.
3. Questions about the selected industry's workflow.
4. Essential scope, integrations and constraints.
5. Budget preferences, currency and timing.
6. Contact details and optional reference files.
7. An editable summary and acknowledgement before submission.

Answers remain when moving backwards or changing branches. Only the currently selected service and industry answers are submitted. “Not sure” is supported for technical questions. Required answers and email format are checked in both the browser and server.

Drafts stay in the current browser tab. **Save for later** explicitly saves answers on the device; **Clear saved answers** removes them after confirmation. Files are never stored in browser storage and must be reattached after reopening. Up to three PDF, PNG, JPEG or TXT files are accepted, totalling 5 MB.

## Run locally

In `exports/CanveliqSoft-Developer-Project`, use Node.js 22 or newer:

```sh
npm run dev
```

Open `http://localhost:3001/collection.html` and select **Share your idea**. A direct example is `http://localhost:3001/custom-brief.html?industry=manufacturing&service=erp`.

The Node server saves enquiries through `POST /api/project-briefs`. A reference appears only after the record has been written. Failed submissions preserve answers; a retry checks for an existing receipt before saving. A receipt can also be downloaded as a text copy. No email, WhatsApp message, quote or meeting is sent or booked automatically.

## Read and manage enquiries

The private inbox is a local command, not a publicly accessible admin page. Run these commands from the developer project:

```sh
npm run briefs
npm run briefs -- CS-20261030-EXAMPLE1
npm run briefs -- CS-20261030-EXAMPLE1 --status researching
```

Replace the example with an actual receipt reference. The first command lists enquiries. The second displays the brief and its attachment names. The third updates its research status and records the change.

Available statuses: `new`, `needs-clarification`, `researching`, `meeting-ready`, `proposal`, `closed`.

Default private storage is `exports/CanveliqSoft-Developer-Project/data/project-briefs/`. Each JSON record holds the structured answers, a readable summary, receipt, history and optional attachment content encoded as base64. This directory is outside the served `dist` folder. It is ignored by Git and excluded by both workspace ZIP-packaging helpers. Back up private enquiry records separately from distributable project files.

## Deployment

The UI can be served statically, but **submitting requires the Node endpoint** or an equivalent backend. Uploading only `dist` does not provide enquiry storage. The browser shows an error rather than a false success when the API is missing.

For a hosted deployment, run the Node server behind an HTTPS reverse proxy and use a persistent, private writable directory. Set:

- `APP_ORIGIN` to the exact public origin, for example `https://canveliqsoft.example`.
- `BRIEF_DATA_DIR` to the private storage directory, outside the public web root. Use the same setting for the inbox command.

The current local server binds to `127.0.0.1`; it is suitable behind a same-machine reverse proxy. This implementation uses one Node process and filesystem storage. Multiple server instances or ephemeral hosting need shared durable storage and distributed request controls before deployment. Configure backups and access to the private directory for the people reviewing enquiries. A hosted admin dashboard and email notifications are not part of this change.

## Source locations

- `preview/custom-brief.page.html`, `.css`, `.js`: page and interaction.
- `preview/custom-brief-data.mjs`: questions, validation and summary formatting.
- `preview/collection.js`, `.css`, `collection-data.mjs`: industry entry cards.
- Developer-project `src/`: matching portable source.
- Developer-project `scripts/brief-api.mjs`: validation, attachments, storage and retry receipts.
- Developer-project `scripts/briefs.mjs`: local research inbox.

Both build pipelines generate the same custom-brief page and version its assets. Run `npm run build`, `npm run check` and `npm test` in the developer project after editing.
