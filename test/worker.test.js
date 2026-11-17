import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';

test('Worker serve a interface e os arquivos públicos sem expor a configuração', async () => {
  const env = { GEMINI_API_KEY: 'segredo-ficticio-de-teste' };
  const html = await worker.fetch(new Request('https://clareia.example/'), env);
  assert.equal(html.status, 200);
  assert.match(await html.text(), /ESTUDO COM IA/);
  const script = await worker.fetch(new Request('https://clareia.example/app.js'), env);
  assert.ok(!(await script.text()).includes(env.GEMINI_API_KEY));
  assert.equal((await worker.fetch(new Request('https://clareia.example/.env'), env)).status, 404);
  const status = await worker.fetch(new Request('https://clareia.example/api/status'), env);
  assert.equal((await status.json()).configured, true);
});

test('Worker chama o mesmo Gemini, valida origem e informa ausência de chave', async () => {
  const request = origin => new Request('https://clareia.example/api/flashcards', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ text: 'Texto de estudo.', count: 5 })
  });
  assert.equal((await worker.fetch(request('https://outro.example'), {})).status, 403);
  assert.equal((await worker.fetch(request('https://clareia.example'), {})).status, 503);
  const originalFetch = globalThis.fetch;
  let sent;
  globalThis.fetch = async (_url, options) => {
    sent = JSON.parse(options.body);
    return Response.json({ status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'text', text: JSON.stringify({ cards: Array.from({ length: 5 }, (_, i) => ({ q: `Questão ${i}?`, a: 'Resposta.' })) }) }] }] });
  };
  try {
    const response = await worker.fetch(request('https://clareia.example'), { GEMINI_API_KEY: 'chave-ficticia' });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).cards.length, 5);
    assert.match(sent.input[0].text, /Texto de estudo/);
  } finally { globalThis.fetch = originalFetch; }
});
