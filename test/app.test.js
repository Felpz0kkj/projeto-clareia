import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { createApp } from '../server/index.js';

const cards = Array.from({ length: 5 }, (_, i) => ({ q: `Pergunta ${i + 1} sobre TCP?`, a: `Resposta ${i + 1} do material.` }));
const success = () => Response.json({ status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'text', text: JSON.stringify({ cards }) }] }] });

async function start(t, options = {}) {
  const server = createApp({ apiKey: 'chave-ficticia-apenas-para-teste', fetchImpl: async () => success(), ...options });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}
const post = (base, value, headers = {}) => fetch(base + '/api/flashcards', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(value) });
const material = { text: 'O protocolo TCP oferece entrega ordenada e retransmissão.', count: 5, instructions: 'Priorize conceitos.' };

test('texto e instruções chegam ao Gemini; resposta contém cartões validados, sem chave', async t => {
  let sent;
  const base = await start(t, { fetchImpl: async (url, options) => { sent = { url, ...options, body: JSON.parse(options.body) }; return success(); } });
  const response = await post(base, material);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).cards, cards);
  assert.match(sent.body.input[0].text, /O protocolo TCP/);
  assert.match(sent.body.input[0].text, /Priorize conceitos/);
  assert.equal(sent.body.store, false);
  assert.equal(sent.body.model, 'gemini-3.5-flash-lite');
  const status = await (await fetch(base + '/api/status')).text();
  assert.ok(!status.includes('chave-ficticia'));
});

test('PDF é enviado como documento; arquivo falso, entrada vazia e quantidade inválida são rejeitados antes da IA', async t => {
  let requests = 0, sent;
  const base = await start(t, { fetchImpl: async (_url, options) => { requests++; sent = JSON.parse(options.body); return success(); } });
  const pdf = Buffer.from('%PDF-1.7\nDocumento de teste').toString('base64');
  assert.equal((await post(base, { text: '', pdf, count: 5 })).status, 200);
  assert.equal(sent.input[1].data, pdf);
  assert.equal(sent.input[1].mime_type, 'application/pdf');
  for (const invalid of [{ text: '' }, { ...material, count: 100 }, { ...material, pdf: Buffer.from('arquivo falso').toString('base64') }, { ...material, text: 'x'.repeat(40001) }]) {
    assert.equal((await post(base, invalid)).status, 400);
  }
  assert.equal(requests, 1);
});

test('falhas da IA não viram exemplos silenciosos; cota e chave ausente aparecem como erro', async t => {
  const quotaBase = await start(t, { fetchImpl: async () => new Response('', { status: 429 }) });
  const quota = await post(quotaBase, material);
  assert.equal(quota.status, 429);
  assert.match((await quota.json()).error, /cota/);
  const missingBase = await start(t, { apiKey: '' });
  assert.equal((await post(missingBase, material)).status, 503);
  const malformedBase = await start(t, { fetchImpl: async () => Response.json({ status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'text', text: '{invalid' }] }] }) });
  assert.equal((await post(malformedBase, material)).status, 502);
  const shortBase = await start(t, { fetchImpl: async () => Response.json({ status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'text', text: '{"cards":[]}' }] }] }) });
  assert.equal((await post(shortBase, material)).status, 502);
});

test('limite local e origem protegem a cota; arquivos privados não são servidos', async t => {
  let calls = 0;
  const base = await start(t, { dailyLimit: 1, fetchImpl: async () => { calls++; return success(); } });
  assert.equal((await post(base, material, { Origin: 'https://outro-site.example' })).status, 403);
  assert.equal((await post(base, material)).status, 200);
  assert.equal((await post(base, material)).status, 429);
  assert.equal(calls, 1);
  for (const path of ['/.env', '/server/index.js', '/package.json']) assert.equal((await fetch(base + path)).status, 404);
  const html = await fetch(base);
  assert.equal(html.status, 200);
  assert.match(await html.text(), /ESTUDO COM IA/);
});

test('falha temporária e modelo inexistente têm mensagens distintas e não repetem chamadas', async t => {
  let calls = 0;
  const temporary = await start(t, { fetchImpl: async () => { calls++; return new Response('', { status: 503 }); } });
  const response = await post(temporary, material);
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /falha temporária \(HTTP 503\)/);
  assert.equal(calls, 1);
  const missingModel = await start(t, { fetchImpl: async () => new Response('', { status: 404 }) });
  const modelResponse = await post(missingModel, material);
  assert.equal(modelResponse.status, 502);
  assert.match((await modelResponse.json()).error, /modelo Gemini configurado não foi encontrado/);
});

async function browser(t, fetchImpl) {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html, { url: 'http://localhost:3000', runScripts: 'outside-only', pretendToBeVisual: true });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.fetch = fetchImpl;
  w.AbortController = AbortController;
  w.structuredClone = structuredClone;
  w.scrollTo = () => {};
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; };
  w.eval(await readFile(new URL('../dist/app.js', import.meta.url), 'utf8'));
  return w;
}
function click(w, action) { const el = w.document.querySelector(`[data-action="${action}"]`); assert.ok(el, action); el.click(); }
function submit(w, id) { w.document.getElementById(id).dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); }
async function waitFor(check) {
  for (let i = 0; i < 100; i++) { if (check()) return; await new Promise(resolve => setTimeout(resolve, 10)); }
  assert.fail('A interface não chegou ao estado esperado.');
}

test('interface completa: material → IA → edição → salvar → revisão → resultado e persistência', async t => {
  const base = await start(t);
  const w = await browser(t, (url, options) => fetch(base + url, options));
  click(w, 'guest');
  const text = w.document.getElementById('source-text');
  text.value = material.text;
  submit(w, 'source-form');
  w.document.getElementById('deck-title').value = 'TCP para prova';
  submit(w, 'config-form');
  await waitFor(() => Boolean(w.document.querySelector('[data-action="save-study"]')));
  assert.equal(w.document.querySelectorAll('.preview-card').length, 5);
  assert.match(w.document.body.textContent, /Cartões gerados pelo Gemini/);
  click(w, 'edit-card');
  w.document.getElementById('card-a').value = 'Resposta editada pelo estudante.';
  submit(w, 'card-form');
  click(w, 'save-study');
  assert.ok(w.document.getElementById('timer-digits'));
  for (let i = 0; i < 5; i++) { click(w, 'reveal'); click(w, i === 0 ? 'rate-again' : 'rate-remember'); }
  assert.match(w.document.body.textContent, /Sessão concluída/);
  const saved = JSON.parse(w.localStorage.getItem('revisa-wireframe-v1'));
  assert.equal(saved.sessions.at(-1).remembered, 4);
  assert.equal(saved.sessions.at(-1).again, 1);
  assert.equal(saved.decks[0].cards[0].a, 'Resposta editada pelo estudante.');
});

test('cancelar interrompe a solicitação; erros preservam a configuração para tentar novamente', async t => {
  let aborted = false;
  const w = await browser(t, (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => { aborted = true; reject(new DOMException('Cancelado', 'AbortError')); })));
  click(w, 'guest'); click(w, 'sample'); submit(w, 'source-form'); submit(w, 'config-form');
  click(w, 'cancel-generation');
  assert.equal(aborted, true);
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.ok(w.document.getElementById('config-form'));
  w.fetch = async () => Response.json({ error: 'Cota esgotada no Gemini.' }, { status: 429 });
  submit(w, 'config-form');
  await waitFor(() => Boolean(w.document.querySelector('[role="alert"]')));
  assert.match(w.document.querySelector('[role="alert"]').textContent, /Cota esgotada/);
  assert.equal(w.document.getElementById('deck-title').value, 'Usabilidade — revisão da aula');
});
