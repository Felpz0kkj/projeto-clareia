# Como a geração real funciona

Atualização de 17/11/2026. A linguagem principal continua JavaScript, com HTML e CSS na interface.

## O caminho do material

```text
Navegador (app.js) → POST /api/flashcards → nosso servidor → Gemini
Gemini → JSON com perguntas e respostas → validação → prévia editável
```

A chave fica no `.env` local ou no ambiente secreto da hospedagem. O `.gitignore` impede incluir `.env` no Git. Somente os arquivos públicos são servidos ao navegador.

## Navegador: dist/app.js

O evento `submit` de `config-form` é `async`: permite usar `await` para esperar a resposta sem travar a página. `fetch('/api/flashcards', ...)` envia JSON com `text`, `instructions`, `count` e, se houver, `pdf` em base64.

`AbortController` interrompe a solicitação ao cancelar. `generationTicket` identifica a tentativa: se a tela mudou, uma resposta atrasada é ignorada. Cancelar depois do envio não garante devolver a cota já consumida.

Para PDF, `FileReader.readAsDataURL()` lê os bytes. O trecho depois da vírgula é base64, uma representação textual de bytes, não criptografia. O documento vai ao Gemini sem extrator local. Para TXT, `file.text()` lê o texto. O código valida o tamanho e não gera cartões enquanto o arquivo ainda está sendo lido.

Os cartões recebidos ganham IDs com `uid()` e entram em `working`. A edição e as funções `saveWorking()`, `beginReview()`, `rate()` e `finishReview()` continuam responsáveis por salvamento e revisão. A chave não participa desses objetos.

## Servidor: server/index.js

`createApp()` usa `node:http`, incluído no Node. `GET /api/status` informa se a chave existe, sem retorná-la. `POST /api/flashcards` recebe o material. `GET /` entrega a interface de `dist`.

`readBody()` lê o corpo em blocos e limita o tamanho antes de interpretar JSON. `validateInput()` confere quantidade, texto e assinatura inicial do PDF; extensão sozinha não valida um arquivo.

`busy` evita solicitações simultâneas. O contador limita tentativas por dia no processo; reiniciar o processo o zera. O limite oficial da conta é controlado pelo Google. Um temporizador interrompe a geração depois de 90 segundos. Não há repetição automática de requisições.

`try`, `catch` e `finally` separam sucesso, falha e limpeza. O `finally` libera a geração e remove o temporizador, mesmo após erro. Erros devolvem orientações sem detalhes secretos do provedor.

## Integração: server/gemini.js

`AppError` acrescenta um código HTTP à mensagem de erro. `generateCards()` faz a chamada ao Google. O prompt pede perguntas em português baseadas no material, tratando texto/PDF como fontes de estudo. Isso orienta o modelo, mas não garante respostas corretas.

A Interactions API recebe `store: false`, sem histórico de conversa. `response_format` solicita JSON com a lista `cards` e os campos `q` e `a`. `validateCards()` ainda confere quantidade, campos vazios, tamanho e perguntas repetidas antes de retornar o resultado.

Erro 429 indica cota ou limite de requisições. Também tratamos chave inválida, falta de acesso, resposta incompleta e indisponibilidade. Falhas aparecem na tela, sem substituir silenciosamente a IA por cartões prontos.

## Hospedagem: worker/index.js

O adaptador usa `fetch(request, env)` da hospedagem. `env` fornece a chave secreta. O build incorpora uma lista explícita de arquivos públicos; `.env` não entra nessa lista. O contador do Worker é por instância, não um limite global de usuários. Não há banco de dados ou autenticação própria nesta etapa.

## Testes e apresentação

`npm test` usa respostas fictícias da API para verificar o fluxo sem consumir cota. Os testes cobrem entradas inválidas, texto/PDF, falhas do provedor, limite local, origem das requisições, edição, revisão, persistência e cancelamento. Separadamente, o README registra as duas chamadas reais bem-sucedidas de texto e PDF.

Uma explicação oral: “O navegador coleta o material e chama nosso servidor. O servidor guarda a chave e pede cartões ao Gemini. A IA devolve JSON; validamos o conteúdo e mostramos uma prévia para o estudante conferir. Revisão e salvamento continuam no navegador.”

## Gratuidade

Use uma chave de projeto no nível gratuito **sem faturamento vinculado**. O modelo escolhido tem cotas; o aplicativo não ativa cobrança nem consegue verificar sozinho o faturamento da conta. Não usamos ferramentas adicionais de busca, banco de dados pago ou troca automática de provedor.

No nível gratuito, os materiais podem ser usados pelo Google para melhorar produtos. A tela informa o envio antes da geração. Use conteúdo que você pode compartilhar; nunca inclua a chave no HTML ou no GitHub.
