import http from 'node:http';
import { readFile } from 'node:fs/promises';
const upstream = new URL(process.env.JITSI_ORIGIN || 'http://localhost:8088');
const port = Number(process.env.PORT || 4173);
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = /^\/static\/quiet\/(app\.js|jitsi\.js|style\.css)$/.exec(url.pathname)?.[1]
    || (/^\/[a-z0-9_-]*$/i.test(url.pathname) ? 'index.html' : null);
  if (file) {
    const body = await readFile(new URL('../public/' + file, import.meta.url));
    res.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html', 'Cache-Control': 'no-store' });
    return res.end(body);
  }
  const proxy = http.request(new URL(req.url, upstream), { method: req.method, headers: { ...req.headers, host: upstream.host } }, response => { res.writeHead(response.statusCode, response.headers); response.pipe(res); });
  proxy.on('error', () => { res.writeHead(502); res.end('Jitsi backend unavailable'); }); req.pipe(proxy);
});
server.on('upgrade', (req, socket, head) => {
  const proxy = http.request(new URL(req.url, upstream), { headers: { ...req.headers, host: upstream.host } });
  proxy.on('upgrade', (response, target, incoming) => {
    socket.write('HTTP/1.1 101 Switching Protocols\r\n' + Object.entries(response.headers).map(([k,v]) => `${k}: ${v}`).join('\r\n') + '\r\n\r\n');
    if (head.length) target.write(head); if (incoming.length) socket.write(incoming); socket.pipe(target).pipe(socket);
    socket.on('error', () => target.destroy()); target.on('error', () => socket.destroy());
  });
  proxy.on('error', () => socket.destroy()); proxy.end();
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://localhost:${port}`));
