import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { createStaticServer } from '../scripts/serve.mjs';

let server, base;
before(async () => {
  server = createStaticServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
});

test('both assembled pages and current team artwork are served', async () => {
  const home = await fetch(base + '/');
  assert.equal(home.status, 200);
  assert.match(home.headers.get('content-type'), /^text\/html/);
  assert.match(await home.text(), /The Minds Behind/);
  const collection = await fetch(base + '/collection.html');
  assert.equal(collection.status, 200);
  assert.match(await collection.text(), /id="cl-filter-panel"/);
  for (const name of ['orbits', 'connections', 'structure', 'ribbon']) {
    const image = await fetch(`${base}/assets/vision/vision-${name}.png`);
    assert.equal(image.status, 200);
    assert.equal(image.headers.get('content-type'), 'image/png');
    assert.ok((await image.arrayBuffer()).byteLength > 0);
  }
});
test('JavaScript modules, query fingerprints and HEAD responses work', async () => {
  const module = await fetch(base + '/vision.js?v=example');
  assert.equal(module.status, 200);
  assert.match(module.headers.get('content-type'), /^text\/javascript/);
  const head = await fetch(base + '/collection-data.mjs', { method:'HEAD' });
  assert.equal(head.status, 200);
  assert.ok(Number(head.headers.get('content-length')) > 0);
  assert.equal(await head.text(), '');
});
test('range responses return the requested bytes and reject invalid ranges', async () => {
  const expected = readFileSync(new URL('../dist/vision.js', import.meta.url)).subarray(0, 16);
  const part = await fetch(base + '/vision.js', { headers:{ Range:'bytes=0-15' } });
  assert.equal(part.status, 206);
  assert.deepEqual(Buffer.from(await part.arrayBuffer()), expected);
  const invalid = await fetch(base + '/vision.js', { headers:{ Range:'bytes=99999999-' } });
  assert.equal(invalid.status, 416);
});
test('missing files, traversal, malformed URLs and writes are rejected', async () => {
  assert.equal((await fetch(base + '/missing.html')).status, 404);
  assert.equal((await fetch(base + '/%2e%2e%5cpackage.json')).status, 403);
  assert.equal((await fetch(base + '/.git/config')).status, 403);
  assert.equal((await fetch(base + '/%ZZ')).status, 400);
  assert.equal((await fetch(base + '/', { method:'POST' })).status, 405);
});
