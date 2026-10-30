import { createHash } from 'node:crypto';
import { copyFileSync, cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const source = path.join(root, 'src');
export const publicRoot = path.join(root, 'public');
export const output = path.join(root, 'dist');
const read = name => readFileSync(path.join(source, name), 'utf8').replace(/\r\n/g, '\n');
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  }).sort();
}
function once(text, pattern, replacement, label) {
  if (!pattern.test(text)) throw new Error(`Missing ${label} insertion point.`);
  return text.replace(pattern, () => replacement);
}
function fingerprint(html, name, extra = []) {
  const hash = createHash('sha256').update(readFileSync(path.join(source, name)));
  for (const file of extra) hash.update(readFileSync(path.join(source, file)));
  if (name === 'portfolio.js') {
    for (const file of walk(path.join(publicRoot, 'projects'))) {
      if (!['.html', '.css', '.js', '.mjs', '.json'].includes(path.extname(file))) continue;
      hash.update(path.relative(publicRoot, file).split(path.sep).join('/')).update(readFileSync(file));
    }
  }
  return html.replaceAll(`"./${name}"`, `"./${name}?v=${hash.digest('hex').slice(0, 10)}"`);
}
export function build() {
  let fragment = read('homepage.fragment.html');
  const nav = read('navigation.html');
  const hero = read('hero.html').replaceAll('{{NAVIGATION}}', '');
  fragment = once(fragment, /<section class="cs-hero".*?<\/section>/s, hero + '\n' + read('solutions.html'), 'hero');
  fragment = fragment.replace('<div id="cs-motion">', '<div id="cs-motion">\n' + nav + '\n' + read('context-menu.html'));
  const logo = nav.match(/<img[^>]*>/)?.[0];
  if (!logo) throw new Error('Navigation logo missing.');
  const story = read('erp-story.html').replaceAll('{{STORY_LOGO}}', logo);
  fragment = once(fragment, /<section class="cs-section" id="cs-services".*?(?=<section class="cs-section cs-demo-split")/s, read('showcase.html') + '\n' + story + '\n', 'showcase');
  fragment = fragment.replaceAll('href="#cs-erp"', 'href="#cs-erp-story"');
  const portfolio = ['portfolio.html', 'delivery.html', 'buyer-guide.html', 'vision.html'].map(read).join('\n');
  fragment = once(fragment, /<section class="cs-section cs-demo-split".*?<\/section>/s, portfolio, 'portfolio');
  const contact = read('contact.html').replaceAll('{{PROJECT_BRIEF}}', read('project-brief.html'));
  fragment = once(fragment, /<section class="cs-reviews".*?<\/footer>/s, contact, 'contact');
  fragment = fragment.replaceAll('currentIndustry=key;const d=industries[key];', "currentIndustry=key;if(!root.querySelector('[data-industry-label]')){if(persist)save();return;}const d=industries[key];");
  fragment = fragment.replaceAll('icons();setTimeout(playIntro,350);', 'icons();');
  fragment = fragment.replaceAll('content.innerHTML=html;icons();', "content.innerHTML=html;icons();if(mode==='demo'){const industrySelect=content.querySelector('select');if(industrySelect)industrySelect.value=currentIndustry.charAt(0).toUpperCase()+currentIndustry.slice(1);}");
  fragment = fragment.replaceAll('const saved=window.openai', "root.addEventListener('cs:industry-change', e => setIndustry(e.detail, false));\n  const saved=window.openai");
  fragment = fragment.replaceAll("panel.scrollIntoView({behavior:'instant',block:'center'});", '');
  const logoData = readFileSync(path.join(publicRoot, 'assets/canveliqsoft-mark.svg')).toString('base64');
  const loading = read('loading-screen.html').replace('{{LOADER_LOGO}}', 'data:image/svg+xml;base64,' + logoData);
  let html = read('index.template.html').replace('{{CONTENT}}', () => loading + '\n' + fragment);
  // Match the preview build: all base/override CSS must be known before first paint.
  // Keep the cascade order; merely moving the external links would let the old
  // inline styles override the finished design.
  const headEnd = html.indexOf('</head>');
  let head = html.slice(0, headEnd);
  let body = html.slice(headEnd + '</head>'.length);
  const stylePattern = /<style\b[^>]*>[\s\S]*?<\/style>|<link\b[^>]*\brel="stylesheet"[^>]*>/g;
  const styles = [...body.matchAll(stylePattern)].map(match => match[0]);
  body = body.replace(stylePattern, '');
  head = head.replace('<script src="./assets/lucide.min.js">', () => styles.join('\n') + '\n<script src="./assets/lucide.min.js">');
  html = head + '</head>' + body;
  const dependencies = {
    'delivery.js': ['delivery-data.mjs'],
    'solutions.js': ['solutions-data.mjs', 'product-detail.mjs'],
    'project-brief.js': ['project-brief-data.mjs', 'collection-data.mjs', 'product-page-data.mjs'],
    'showcase.js': ['showcase-state.mjs'],
    'portfolio.js': ['portfolio-projects.mjs', 'portfolio-stories.mjs'],
  };
  const assets = ['commerce-design.css', 'project-brief.css', 'project-brief.js', 'buyer-guide.css', 'buyer-guide.js', 'delivery.css', 'delivery.js', 'solutions.css', 'solutions.js', 'hero.css', 'showcase.css', 'showcase-premium.css', 'industry-explorer.css', 'industry-explorer.js', 'erp-story.css', 'portfolio.css', 'vision.css', 'navigation.css', 'contact.css', 'context-menu.css', 'hero.js', 'showcase.js', 'erp-story.js', 'portfolio.js', 'vision.js', 'navigation.js', 'contact.js', 'context-menu.js'];
  for (const asset of assets) html = fingerprint(html, asset, dependencies[asset]);
  let collectionNav = nav.replaceAll(' aria-current="page"', '').replaceAll('href="#cs-', 'href="./index.html#cs-');
  collectionNav = collectionNav.replaceAll('href="./collection.html"', 'href="./collection.html" aria-current="page"');
  collectionNav = collectionNav.replaceAll('data-cc-search', 'data-collection-search').replaceAll(' aria-haspopup="dialog" aria-controls="cc-dialog"', '').replaceAll('aria-label="Search solutions"', 'aria-label="Search collection"');
  let collection = read('collection.page.html').replaceAll('{{COLLECTION_NAVIGATION}}', collectionNav);
  for (const asset of ['collection.css', 'navigation.css', 'collection.js']) {
    collection = fingerprint(collection, asset, asset === 'collection.js' ? ['collection-data.mjs', 'collection-visuals.mjs'] : []);
  }
  let product = read('product.page.html').replaceAll('{{PRODUCT_NAVIGATION}}', collectionNav);
  for (const asset of ['product-page.css', 'navigation.css', 'product-page.js']) {
    product = fingerprint(product, asset, asset === 'product-page.js' ? ['product-page-data.mjs','product-page-view.mjs','product-page-visuals.mjs','collection-data.mjs'] : []);
  }
  const briefNav=collectionNav.replace(/<button[^>]*data-collection-search[\s\S]*?<\/button>/, '<a class="cs-nav-search" href="./collection.html?search=1" aria-label="Search collection"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span>Search</span></a>');
  let brief=read('custom-brief.page.html').replace('{{BRIEF_NAVIGATION}}',briefNav);
  for(const asset of ['custom-brief.css','navigation.css','custom-brief.js'])brief=fingerprint(brief,asset,asset==='custom-brief.js'?['custom-brief-data.mjs']:[]);
  // Only this package's generated dist may be replaced. Never follow a symlink.
  if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== 'dist') throw new Error('Invalid build output.');
  if (existsSync(output) && lstatSync(output).isSymbolicLink()) throw new Error('Refusing to replace a symlinked dist folder.');
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });
  cpSync(publicRoot, output, { recursive: true });
  for (const file of readdirSync(source)) {
    if (['.css', '.js', '.mjs'].includes(path.extname(file))) copyFileSync(path.join(source, file), path.join(output, file));
  }
  writeFileSync(path.join(output, 'index.html'), html);
  writeFileSync(path.join(output, 'collection.html'), collection);
  writeFileSync(path.join(output, 'product.html'), product);
  writeFileSync(path.join(output, 'custom-brief.html'), brief);
  console.log('Built homepage, Collection, product and custom brief pages with all assets and embedded projects.');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();
