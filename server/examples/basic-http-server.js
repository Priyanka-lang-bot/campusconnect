// A minimal HTTP server using ONLY Node's built-in `http` module — no Express.
// It exists to show what Express does for us: routing, JSON parsing, status
// codes and headers all have to be handled by hand here.
//
// Run it with:  npm run demo:http   (from the repo root)
// Then visit:   http://localhost:4000/          (HTML page)
//               http://localhost:4000/api/time  (JSON)
//               POST http://localhost:4000/api/echo  with a JSON body
//
// It is deliberately separate from the real Express API in src/.
const http = require('http');
const { URL } = require('url');

const PORT = Number(process.env.DEMO_PORT) || 4000;

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e5) reject(new Error('Body too large'));
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  console.log(`${req.method} ${pathname}`);

  if (req.method === 'GET' && pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<h1>Hello from Node\'s http module</h1><p>Try <a href="/api/time">/api/time</a>.</p>');
  }

  if (req.method === 'GET' && pathname === '/api/time') {
    return sendJson(res, 200, { now: new Date().toISOString(), uptimeSeconds: Math.round(process.uptime()) });
  }

  if (req.method === 'POST' && pathname === '/api/echo') {
    try {
      const body = JSON.parse((await readBody(req)) || '{}');
      return sendJson(res, 200, { youSent: body });
    } catch {
      return sendJson(res, 400, { error: 'Body must be valid JSON.' });
    }
  }

  return sendJson(res, 404, { error: `Cannot ${req.method} ${pathname}` });
});

server.listen(PORT, () => {
  console.log(`Basic http server listening on http://localhost:${PORT}`);
});
