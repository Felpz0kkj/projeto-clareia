# Clareia — Método de estudo

Projeto universitário em HTML, CSS e JavaScript com **geração real de flashcards pelo Gemini**, a partir de texto, TXT ou PDF. Mantém edição, revisão, autoavaliação, biblioteca, histórico e Pomodoro.

## Executar no computador

Requer Node.js 24 ou superior. A execução local não exige instalar bibliotecas.

1. Copie `.env.example` para `.env`.
2. Crie uma chave no [Google AI Studio](https://aistudio.google.com/api-keys), em um projeto **Free Tier sem faturamento vinculado**.
3. Preencha `GEMINI_API_KEY` no `.env`. Não compartilhe esse arquivo nem a chave.
4. Execute `npm start` e abra **http://localhost:3000**.

```text
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=3000
```

A chave sozinha não garante gratuidade: o projeto Google deve estar no nível gratuito. O código não ativa faturamento ou compra créditos; também não consegue confirmar sozinho o estado de faturamento da conta. Ao atingir uma cota, informa a falha, sem trocar automaticamente de provedor ou repetir chamadas.

Não abra apenas `dist/index.html` para usar a IA: o servidor é necessário para proteger a chave e receber os materiais.

## Fluxo de uso

Entre no espaço local, cole um texto ou envie um arquivo, escolha 5 ou 10 cartões e clique em **Gerar flashcards**. O material e as instruções são enviados ao Gemini. Confira e edite as respostas antes de salvar e iniciar a revisão.

Texto: até 40 mil caracteres. PDF: até 2 MB. Os exemplos da biblioteca continuam disponíveis, mas a geração usa o material enviado, não o antigo catálogo fixo.

## Organização do código

- `dist/index.html`, `styles.css` e `app.js`: interface comentada em português.
- `server/index.js`: servidor HTTP local, validação e limites.
- `server/gemini.js`: chamada da IA, esquema JSON e conferência dos cartões.
- `worker/index.js`: adaptador da mesma integração para Sites/Cloudflare.
- `scripts/build-site.js`: empacota os arquivos públicos no Worker sem incluir `.env`.
- `test/app.test.js`: testes do servidor e da interface, com um Gemini simulado.
- `docs/IA_GEMINI.md`: explicação da integração para estudar e apresentar.
- `scripts/gerar_entregaveis.py`: gera o ZIP completo e uma cópia reunida da interface. A IA continua exigindo o servidor.

## Testes e publicação

```bash
npm ci
npm test
npm run build:site
```

`npm ci` instala ferramentas de desenvolvimento. Elas não são necessárias para executar o servidor local. Os testes não fazem chamadas reais à IA e não consomem cota.

O build de hospedagem produz `dist/server/index.js`. Configure `GEMINI_API_KEY` como **segredo do servidor**, nunca no código do navegador. O manifesto de uma instalação Sites pertence àquela instalação e não é incluído neste repositório público.

## Escopo e limites

- **Espaço local:** sem cadastro, autenticação própria ou sincronização. Nome, conjuntos e histórico ficam no navegador.
- **IA real:** respostas podem conter erros. Confira os cartões no material original.
- **PDF real:** enviado na requisição ao Gemini. Seus bytes não ficam salvos na biblioteca.
- **Privacidade:** o nível gratuito do Gemini pode usar os materiais para melhorar produtos Google. Use conteúdo que você pode compartilhar.
- **Limites:** uma geração por vez e até 20 tentativas por dia no processo local, sem repetição automática. Reiniciar o processo zera o contador; no Worker ele vale por instância. Não substitui as cotas oficiais do Google.
- **Autoavaliação:** “Lembrei” e “Preciso revisar” registram percepção, não uma nota calculada pela IA.

## Verificação em 17/11/2026

Testes automáticos verificaram criação, edição, salvamento, revisão, cancelamento, erros e proteção dos arquivos privados. Duas chamadas reais ao Gemini foram bem-sucedidas: uma com texto e outra com PDF de exemplo, gerando cinco cartões em cada. Não houve testes com participantes externos.

Referências: [preços e nível gratuito](https://aistudio.google.com/docs/pricing#gemini-3.5-flash-lite), [primeira chamada](https://aistudio.google.com/docs/get-started), [PDFs](https://aistudio.google.com/docs/document-processing), [JSON estruturado](https://aistudio.google.com/docs/structured-output).
