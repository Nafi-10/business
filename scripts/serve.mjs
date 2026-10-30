import { createServer } from 'node:http';
import { createReadStream, existsSync, realpathSync, statSync, watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, output, source, publicRoot } from './build.mjs';
import { createBriefHandler } from './brief-api.mjs';

const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.avif':'image/avif', '.gif':'image/gif', '.ico':'image/x-icon', '.woff':'font/woff', '.woff2':'font/woff2', '.ttf':'font/ttf', '.mp4':'video/mp4', '.webm':'video/webm', '.mp3':'audio/mpeg', '.pdf':'application/pdf', '.wasm':'application/wasm', '.glb':'model/gltf-binary' };
export function createStaticServer(directory = output, options = {}) {
  const base = realpathSync(directory);
  const inside = file => file.startsWith(base + path.sep);
  const briefDirectory = path.resolve(options.briefDirectory || process.env.BRIEF_DATA_DIR || path.join(path.dirname(output),'data/project-briefs'));
  if(briefDirectory===base||inside(briefDirectory))throw new Error('Brief storage must be outside the public web directory.');
  const handleBrief=createBriefHandler({directory:briefDirectory});
  return createServer(async (request, response) => {
    if(await handleBrief(request,response))return;
    const fail = (status, message) => { response.writeHead(status, { 'Content-Type':'text/plain; charset=utf-8' }); response.end(message); };
    if (!['GET', 'HEAD'].includes(request.method)) { response.setHeader('Allow', 'GET, HEAD'); return fail(405, 'Method not allowed'); }
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch { return fail(400, 'Invalid URL'); }
    if (pathname.includes('\0') || pathname.split(/[\\/]/).some(part => part.startsWith('.'))) return fail(403, 'Forbidden');
    let file = path.resolve(base, '.' + pathname);
    if (file !== base && !inside(file)) return fail(403, 'Forbidden');
    try {
      if (statSync(file).isDirectory()) {
        if (!pathname.endsWith('/')) { response.writeHead(301, { Location: pathname + '/' }); return response.end(); }
        file = path.join(file, 'index.html');
      }
      file = realpathSync(file);
      if (!inside(file)) return fail(403, 'Forbidden');
      const info = statSync(file);
      if (!info.isFile()) return fail(404, 'Not found');
      let start = 0, end = info.size - 1, status = 200;
      const headers = { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-cache', 'Accept-Ranges':'bytes', 'X-Content-Type-Options':'nosniff' };
      if (request.headers.range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
        if (!match || (!match[1] && !match[2])) { response.setHeader('Content-Range', `bytes */${info.size}`); return fail(416, 'Invalid byte range'); }
        if (match[1]) { start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), end) : end; }
        else start = Math.max(0, info.size - Number(match[2]));
        if (!Number.isSafeInteger(start) || start > end || start >= info.size) { response.setHeader('Content-Range', `bytes */${info.size}`); return fail(416, 'Range not satisfiable'); }
        status = 206;
        headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
      }
      headers['Content-Length'] = info.size ? end - start + 1 : 0;
      response.writeHead(status, headers);
      if (request.method === 'HEAD' || !info.size) return response.end();
      const stream = createReadStream(file, { start, end });
      stream.on('error', () => response.destroy());
      response.on('close', () => stream.destroy());
      stream.pipe(response);
    } catch { fail(404, 'Not found'); }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), portIndex = args.indexOf('--port');
  const port = portIndex >= 0 ? Number(args[portIndex + 1]) : 3001;
  if (!Number.isInteger(port) || port < 0 || port > 65535) { console.error('Use --port with a number from 0 to 65535.'); process.exit(1); }
  const development = args.includes('--watch');
  if (development || !existsSync(path.join(output, 'index.html'))) build();
  const server = createStaticServer();
  server.on('error', error => { console.error(`${error.message}\nTry --port 3002 if the port is occupied.`); process.exitCode = 1; });
  const watchers = [];
  let timer;
  server.listen(port, '127.0.0.1', () => {
    console.log(`CanveliqSoft: http://localhost:${server.address().port}/`);
    if (development) {
      console.log('Watching src/ and public/. Refresh your browser after a rebuild.');
      for (const directory of [source, publicRoot]) watchers.push(watch(directory, { recursive:true }, () => {
        clearTimeout(timer);
        timer = setTimeout(() => { try { build(); } catch (error) { console.error(error.message); } }, 200);
      }));
    }
  });
  process.on('SIGINT', () => { clearTimeout(timer); watchers.forEach(watcher => watcher.close()); server.close(); });
}
