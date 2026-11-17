// Servidor Node.js sem framework ou dependências: arquivos estáticos + uma rota de IA.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppError, generateCards, validateInput } from './gemini.js';

const publicDirectory = fileURLToPath(new URL('../dist/', import.meta.url));
const contentTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.zip': 'application/zip' };

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}

async function readBody(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new AppError(415, 'Envie JSON.');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 3 * 1024 * 1024) throw new AppError(413, 'Material muito grande. PDF: até 2 MB; texto: até 40 mil caracteres.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AppError(400, 'JSON inválido.'); }
}

export function createApp({ apiKey = process.env.GEMINI_API_KEY, model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite', fetchImpl = fetch, dailyLimit = 20 } = {}) {
  // Limite global conservador para a apresentação. Reiniciar o servidor zera o contador.
  let day = '', requestsToday = 0, busy = false;
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname === '/api/status' && req.method === 'GET') {
        return json(res, 200, { configured: Boolean(apiKey), model, dailyLimit });
      }
      if (url.pathname === '/api/flashcards' && req.method === 'POST') {
        // O navegador só pode chamar a API pela mesma origem do servidor.
        if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) throw new AppError(403, 'Origem não permitida.');
        const input = validateInput(await readBody(req));
        if (!apiKey) throw new AppError(503, 'Configure GEMINI_API_KEY no .env do servidor e reinicie o projeto.');
        const today = new Date().toISOString().slice(0, 10);
        if (today !== day) { day = today; requestsToday = 0; }
        if (busy) throw new AppError(429, 'Já há uma geração em andamento. Aguarde.');
        if (requestsToday >= dailyLimit) throw new AppError(429, 'Limite diário local de gerações atingido.');
        busy = true;
        requestsToday++;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 90000);
        const cancel = () => { if (!res.writableEnded) controller.abort(); };
        res.once('close', cancel);
        try {
          const cards = await generateCards(input, { apiKey, model, fetchImpl, signal: controller.signal });
          return json(res, 200, { cards, provider: 'Gemini', model });
        } finally {
          clearTimeout(timeout);
          res.off('close', cancel);
          busy = false;
        }
      }
      if (!['GET', 'HEAD'].includes(req.method)) throw new AppError(405, 'Método não permitido.');
      if (url.pathname.startsWith('/api/')) throw new AppError(404, 'Rota não encontrada.');
      const pathname = decodeURIComponent(url.pathname);
      const file = resolve(publicDirectory, '.' + (pathname === '/' ? '/index.html' : pathname));
      // Só dist é público; .env, código do servidor e documentos internos não são servidos.
      if (!file.startsWith(publicDirectory) || pathname.startsWith('/server/') || pathname.split(/[\\/]/).some(p => p.startsWith('.')) || !contentTypes[extname(file)]) throw new AppError(404, 'Arquivo não encontrado.');
      const bytes = await readFile(file);
      res.writeHead(200, { 'Content-Type': contentTypes[extname(file)], 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch (error) {
      if (res.destroyed) return;
      const status = error.status || (error.code === 'ENOENT' ? 404 : error.name === 'AbortError' ? 504 : 500);
      const message = error instanceof AppError ? error.message : status === 404 ? 'Arquivo não encontrado.' : status === 504 ? 'A geração demorou demais. Tente um material menor.' : 'Não foi possível concluir a solicitação.';
      json(res, status, { error: message });
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  createApp().listen(port, '127.0.0.1', () => console.log(`Clareia: http://localhost:${port}`));
}
