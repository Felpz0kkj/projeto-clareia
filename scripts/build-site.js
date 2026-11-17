// Incorpora somente arquivos públicos. A chave e o .env nunca entram no pacote publicado.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const assets = {};
const files = {
  'index.html': 'text/html; charset=utf-8',
  'mobile.html': 'text/html; charset=utf-8',
  'app.js': 'text/javascript; charset=utf-8',
  'styles.css': 'text/css; charset=utf-8',
  'assets/clareia-logo.png': 'image/png',
  'clareia-prototipo-a3.zip': 'application/zip'
};
for (const [name, type] of Object.entries(files)) {
  assets['/' + name] = { type, base64: (await readFile(new URL('dist/' + name, root))).toString('base64') };
}
await mkdir(new URL('.site-build/', root), { recursive: true });
await writeFile(new URL('.site-build/assets.js', root), 'export const assets = ' + JSON.stringify(assets) + ';\n');
await build({ entryPoints: [fileURLToPath(new URL('worker/index.js', root))], bundle: true, format: 'esm', platform: 'browser', target: 'es2022', outfile: fileURLToPath(new URL('dist/server/index.js', root)) });
await mkdir(new URL('dist/.openai/', root), { recursive: true });
try { await copyFile(new URL('.openai/hosting.json', root), new URL('dist/.openai/hosting.json', root)); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
console.log('Worker gerado em dist/server/index.js.');
