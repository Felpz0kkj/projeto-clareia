// Adaptador para hospedagem Sites/Cloudflare. Reutiliza a mesma integração Gemini do Node.
import { AppError, generateCards, validateInput } from '../server/gemini.js';
import { assets } from '../.site-build/assets.js';

let day = '', requestsToday = 0, busy = false;
const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });

async function readBody(request) {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new AppError(415, 'Envie JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new AppError(400, 'Envie o material de estudo.');
  const chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 3 * 1024 * 1024) { await reader.cancel(); throw new AppError(413, 'Envie um PDF de até 2 MB ou texto de até 40 mil caracteres.'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new AppError(400, 'JSON inválido.'); }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      const model = env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
      if (url.pathname === '/api/status' && request.method === 'GET') return json({ configured: Boolean(env.GEMINI_API_KEY), model });
      if (url.pathname === '/api/flashcards' && request.method === 'POST') {
        if (request.headers.get('Origin') && request.headers.get('Origin') !== url.origin) throw new AppError(403, 'Origem não permitida.');
        const input = validateInput(await readBody(request));
        if (!env.GEMINI_API_KEY) throw new AppError(503, 'A chave Gemini ainda não foi configurada no servidor.');
        const today = new Date().toISOString().slice(0, 10);
        if (day !== today) { day = today; requestsToday = 0; }
        // Contador por instância, como proteção auxiliar; a cota oficial é controlada pelo Google.
        if (busy || requestsToday >= 20) throw new AppError(429, 'Limite local de geração atingido. Aguarde.');
        busy = true; requestsToday++;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 90000);
        try {
          const cards = await generateCards(input, { apiKey: env.GEMINI_API_KEY, model, signal: controller.signal });
          return json({ cards, provider: 'Gemini', model });
        } finally { clearTimeout(timeout); busy = false; }
      }
      if (!['GET', 'HEAD'].includes(request.method)) throw new AppError(405, 'Método não permitido.');
      const asset = assets[url.pathname === '/' ? '/index.html' : url.pathname];
      if (!asset) throw new AppError(404, 'Arquivo não encontrado.');
      const bytes = Uint8Array.from(atob(asset.base64), c => c.charCodeAt(0));
      return new Response(request.method === 'HEAD' ? null : bytes, { headers: { 'Content-Type': asset.type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' } });
    } catch (error) {
      return json({ error: error instanceof AppError ? error.message : error.name === 'AbortError' ? 'A geração demorou demais. Tente um material menor.' : 'Não foi possível concluir a solicitação.' }, error.status || (error.name === 'AbortError' ? 504 : 500));
    }
  }
};
