# Como o código do protótipo funciona

Este guia acompanha a versão didática de 05/11/2026 do protótipo Clareia — Método de estudo. A interface apresenta a identificação “protótipo de baixa fidelidade”. O nome anterior só é mantido nas chaves internas de armazenamento para preservar os estudos existentes. A intenção é ajudar a equipe a explicar a estrutura e as decisões em uma apresentação, não substituir a leitura do código. Para localizar trechos, procure os nomes de funções e constantes citados: números de linha mudam quando o código é atualizado.

## Visão geral

A aplicação é uma página web feita com HTML, CSS e JavaScript sem framework ou biblioteca externa. O HTML cria a moldura mínima do documento; o CSS define aparência e adaptação a larguras diferentes; o JavaScript contém os dados de exemplo, controla qual tela aparece, trata ações e formulários e salva parte dos dados no próprio navegador.

O fluxo principal é: acesso demonstrativo → entrada de material ou exemplo → configuração → espera curta de geração simulada → conferência e edição → revisão dos cartões → resultado → biblioteca e progresso. A aplicação troca as telas sem navegar para outra página: o elemento `#app` recebe o HTML da tela atual. `screen` indica qual é essa tela, e `render()` reconstrói a interface quando necessário.

É útil separar três ideias ao explicar o protótipo:

- **Interface navegável:** botões, formulários, diálogos, revisão, filtros, edição e temporizador respondem no navegador.
- **Dados de demonstração:** os cartões vêm de exemplos previamente escritos em `topics`; o texto e o PDF enviados não são transformados em novas perguntas automaticamente.
- **Persistência local:** conjuntos e sessões concluídas ficam no armazenamento do navegador, sem conta, servidor ou sincronização.

## 1. HTML: a moldura da aplicação

Em `dist/index.html`, `<!doctype html>` identifica um documento HTML moderno e `<html lang="pt-BR">` informa o idioma principal. No `<head>`, `charset` define UTF-8, `viewport` permite que a página acompanhe a largura do dispositivo, `description` resume o protótipo e `theme-color` sugere uma cor para a interface do navegador. O `<title>` fornece o título da aba.

O arquivo liga os recursos externos ao HTML-fonte:

```html
<link rel="stylesheet" href="styles.css">
<script src="app.js" defer></script>
```

`defer` faz o navegador carregar o JavaScript sem interromper a leitura do HTML e executá-lo depois que o documento tiver sido interpretado. Assim, o código pode localizar `#app`, `#dialog` e `#toast` quando inicializa. Na cópia standalone de entrega, CSS, JavaScript e a imagem da marca são incorporados ao próprio HTML; a finalidade do código permanece a mesma, embora ele passe a estar concentrado em um arquivo.

Dentro do `<body>`, há um link de salto para o conteúdo principal, a barra que identifica o protótipo, o contêiner dinâmico e dois elementos reutilizados pelo JavaScript:

```html
<div id="app"></div>
<dialog id="dialog" aria-labelledby="dialog-title"></dialog>
<div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
```

`#app` começa vazio e recebe a tela produzida por `render()`. O elemento nativo `<dialog>` é usado para janelas modais — por exemplo, confirmar uma exclusão ou editar um cartão. `#toast` mostra mensagens breves e pode incluir uma ação “Desfazer”. `role="status"` e `aria-live="polite"` comunicam mudanças de status a tecnologias assistivas sem interromper abruptamente a leitura.

O `dist/mobile.html` é uma página auxiliar. Ela abre `index.html` dentro de um `<iframe>` com moldura de cerca de 390 pixels para facilitar a inspeção em largura de celular. Não é uma segunda versão funcional: o conteúdo interno é a mesma aplicação responsiva, usando os mesmos arquivos e armazenamento do navegador.

## 2. CSS: aparência, componentes e telas menores

O `styles.css` começa com variáveis em `:root`, como `--bg`, `--paper`, `--ink`, `--line` e `--radius`. Variáveis centralizam cores e medidas comuns. Se `--ink` mudar, por exemplo, os componentes que usam essa variável acompanham a mudança sem precisar repetir a cor em cada regra.

As cores ficam centralizadas nas variáveis CSS abaixo. Por exemplo, `background: var(--dark)` faz os botões principais usarem o lilás da marca; alterar essa variável atualiza todos os componentes que a utilizam.

| Variável | Cor | Uso |
| --- | --- | --- |
| `--bg` | `#fcf5f4` | Fundo rosado claro |
| `--paper` | `#fffdfd` | Superfícies de cartões e campos |
| `--ink` | `#342f49` | Texto principal |
| `--dark` | `#625aa7` | Botões, progresso e números de destaque |
| `--accent-soft` | `#e8e2fb` | Barra superior e seleção |
| `--blue-soft` | `#e9efff` | Ícones de conjuntos e informações |
| `--cream` | `#fff8df` | Avisos, com texto em `--note-ink` |
| `--focus` | `#7563b5` | Contorno do foco de teclado |

A regra `* { box-sizing: border-box }` simplifica o cálculo de largura: bordas e espaçamento interno ficam incluídos no tamanho definido. Regras gerais ajustam tipografia, botões, campos, títulos, parágrafos e foco. O seletor `:focus-visible` coloca um contorno perceptível em controles alcançados por teclado. Os campos e botões têm altura mínima para facilitar o toque, e `textarea` pode ser redimensionado verticalmente.

Depois das regras globais, o arquivo estiliza conjuntos de componentes e telas, como `.prototype-bar`, `.layout`, `.sidebar`, `.mobile-header`, `.panel`, `.note`, `.deck`, `.study-card`, `.stats-grid`, `.toast` e `dialog`. As classes são aplicadas aos fragmentos HTML que as funções do JavaScript montam. Por exemplo, `study()` retorna elementos com `study-grid` e `study-card`; o CSS controla o arranjo e a apresentação desses elementos.

A base é pensada primeiro para uma tela estreita. Em larguras menores, o menu lateral some e pode ser aberto pelo cabeçalho; os conteúdos usam uma coluna e os controles podem quebrar linha. O botão do cabeçalho abre a navegação mobile; ele não faz a barra lateral desktop aparecer. As media queries ampliam o layout progressivamente:

- `@media (min-width: 600px)` aumenta espaçamentos e permite grades com mais colunas.
- `@media (min-width: 1000px)` mostra a barra lateral e organiza configuração e revisão em colunas.
- `@media (min-width: 1400px)` amplia alguns espaços em telas grandes.
- `@media (max-width: 380px)` reduz espaços e tipografia de componentes para celulares estreitos.

A paleta de cores acompanha a logo Clareia: lilás nas ações principais, azul suave em destaques, creme nos avisos e um fundo rosado claro. O texto usa tons escuros para manter a leitura. Os contornos simples e as ilustrações geométricas preservam a estrutura do protótipo de baixa fidelidade; aplicar cores não acrescenta serviços reais de login ou IA. A marca foi atualizada para Clareia. `.brand-image` cria uma janela com `overflow: hidden`; a imagem original é ampliada e centralizada para retirar visualmente o excesso de margem. A versão PNG transparente enviada pelo usuário permanece intacta; o contêiner também usa `background: transparent`, evitando um retângulo creme atrás da marca. Na versão compacta, esse enquadramento mostra o símbolo, enquanto `.brand-name` apresenta o nome ao lado. O HTML único usa uma URL `data:image/png;base64,...`, que guarda os bytes da logo dentro do próprio documento e dispensa uma pasta de imagens.

Há também tratamento de acessibilidade no código: rótulos associados aos campos, textos alternativos ou `aria-label` em controles cuja finalidade poderia não estar clara pelo ícone, estado de menu com `aria-expanded`, filtros com `aria-pressed`, progresso com `role="progressbar"`, e foco no conteúdo principal após mudar de tela. Isso é uma base útil, mas não substitui avaliação com usuários e tecnologias assistivas.

## 3. JavaScript: dados, estado e montagem das telas

### 3.1 Utilitários e dados de exemplo

No começo de `app.js`, `'use strict'` ativa o modo estrito do JavaScript, que ajuda a identificar alguns erros comuns. `STORAGE_KEY` contém o nome da chave usada para os dados persistidos. `$` é um atalho para `querySelector`, ou seja, procura o primeiro elemento que corresponde a um seletor CSS:

```js
const $ = (selector, root = document) => root.querySelector(selector);
```

Assim, `$('#app')` localiza o contêiner principal e `$('#source-text')` localiza a caixa de texto. `escapeHTML(value)` converte caracteres especiais, como `<`, `>` e aspas, em entidades HTML antes de inserir valores de usuário em fragmentos de marcação. A função é usada em nomes, títulos, perguntas, respostas e textos exibidos. Isso reduz o risco de que um conteúdo digitado seja interpretado como marcação ativa; não transforma a demonstração em um sistema de segurança completo.

`uid()` tenta gerar um identificador aleatório com `crypto.randomUUID()` e usa uma alternativa com data e número pseudoaleatório se essa API não estiver disponível. Os IDs permitem encontrar cartões e conjuntos mesmo quando a posição deles na lista muda. O objeto `icons` guarda trechos SVG; `icon(name)` seleciona um deles e cria a marcação do ícone. `button()` padroniza botões com `data-action`, atributo que será usado pelo sistema de eventos. `note()` e `annotation()` criam avisos e observações de UX. A constante `logoURL` aponta para a imagem original. `brand` monta a logo completa usada no acesso e na barra lateral; `compactBrand` monta o símbolo acompanhado de “Clareia” no cabeçalho mobile. O `alt` da imagem completa informa o nome da marca. Na versão compacta, o `alt` fica vazio porque o nome já aparece como texto ao lado.

`topics` é o catálogo local de temas demonstrativos. Cada tema tem um rótulo, um título, uma origem de exemplo e uma lista de pares pergunta/resposta. `makeCards(topic, count)` escolhe os primeiros cartões daquele tema, limita a quantidade solicitada e dá um ID a cada cartão. `seedDecks()` converte os temas em conjuntos de exemplo iniciais para a biblioteca.

Exemplo conceitual de dado: cada cartão usa as propriedades `{ id, q, a }`, em que `q` é a pergunta e `a` é a resposta de referência. Um conjunto reúne cartões e metadados como `id`, `title`, `topic`, `sourceName`, `sourceText` e `createdAt`. `example` distingue um conjunto de demonstração de um conjunto que o usuário salvou como seu.

### 3.2 Estado da aplicação

Várias variáveis no escopo principal representam o estado atual:

- `decks`: conjuntos disponíveis na biblioteca.
- `sessions`: histórico das sessões concluídas.
- `user`: nome de demonstração da sessão atual.
- `screen`: identificador da tela, como `login`, `home`, `preview` ou `study`.
- `draft`: material, tema, título, quantidade e instruções do fluxo que ainda está sendo preparado.
- `working`: cópia do conjunto que está em edição antes de salvar.
- `review`: conjunto e cartões da sessão atual, posição, resposta revelada e marcações.
- `lastResult`: resumo da sessão finalizada, usado para repetir tudo ou só os itens marcados para retomar.
- `menuOpen`, `filter`, `search` e `annotated`: estados de menu, filtros, busca e anotações de UX.
- `timer`: modo do Pomodoro, durações, segundos restantes, estado de execução e períodos concluídos.

A diferença entre `draft`, `working` e `decks` é importante ao explicar a edição. `draft` guarda escolhas antes da geração; `working` permite mexer na prévia; `decks` é a coleção salva. Ao editar um conjunto já salvo, `edit-deck` cria uma cópia com `structuredClone()`, evitando alterar imediatamente os dados da biblioteca. `saveWorking()` copia a versão de trabalho de volta para `decks` e chama a persistência.

`screenLabels` associa códigos internos a nomes apresentados no breadcrumb. `dialog` guarda uma referência ao modal do HTML.

### 3.3 Renderização e estrutura compartilhada

`render()` é o ponto central da atualização visual. Ele ativa ou desativa a classe de anotações, escolhe a função correspondente à tela atual, coloca o HTML retornado em `#app`, atualiza o título da aba e, quando a tela é estudo, atualiza os números do temporizador.

As funções `login()`, `home()`, `config()`, `generating()`, `preview()`, `study()`, `results()`, `library()` e `progress()` retornam fragmentos HTML como strings. Isso é uma estratégia simples para um protótipo pequeno: em vez de manter cada elemento na tela e alterar vários trechos manualmente, a aplicação monta de novo a tela inteira sempre que o estado relevante muda.

`shell(content)` fornece a estrutura comum das telas depois do acesso: menu lateral ou menu móvel, breadcrumb, identificação de demonstração e área principal. `nav()` cria os botões principais de navegação e marca a tela ativa. `deckCard(d, compact)` desenha um conjunto para a página inicial ou biblioteca e calcula quantas sessões já aparecem associadas àquele ID.

`login()` mostra campos para nome e e-mail de exemplo, mas não cria conta. `home()` contém a área de texto, seletor de arquivo, botões de exemplo e os conjuntos recentes. `sourceAside()` resume o material na configuração e explica a limitação da análise. `config()` recebe título, quantidade (cinco ou dez cartões), tema e instruções. `generating()` é uma tela temporária com indicação de que está carregando exemplos. `preview()` oferece edição, remoção, inclusão e salvamento dos cartões. `study()` apresenta uma pergunta de cada vez; `results()` resume marcações; `library()` busca e filtra conjuntos; `progress()` agrega os números das sessões.

`filteredDecks()` aplica o filtro escolhido e procura o termo no título, sem diferenciar maiúsculas de minúsculas no locale `pt-BR`. `libraryGrid()` mostra os resultados ou uma mensagem vazia. `openDialog(title, content)` preenche o diálogo e chama `showModal()`. `showMap()` abre o mapa das telas e a opção de mostrar anotações de usabilidade. `fillSample(topic)` preenche o rascunho com um material escrito no próprio código para permitir experimentar o fluxo.

### 3.4 Navegação e transição entre telas

`go(next)` muda `screen`, fecha o menu móvel, chama `render()`, rola para o topo e move o foco para `#main`. Também aumenta `generationTicket`, que serve para invalidar uma geração simulada que tenha sido cancelada antes de terminar.

`setUser(name)` cria um objeto simples com um nome limitado a 45 caracteres, tenta gravá-lo na sessão do navegador e segue para a página inicial. `initials()` transforma as primeiras letras do nome em iniciais para o avatar. `logout` pausa o temporizador, apaga a identificação de demonstração da sessão e volta ao acesso.

`new` reinicia o rascunho para começar outro estudo. Se há alterações abertas na prévia, pede confirmação antes de descartá-las. `confirm-new` efetiva essa reinicialização. `map-go` permite demonstrar telas individuais no mapa, preparando exemplos quando necessário; se não houver resultado real, impede a exibição de números inventados e inicia uma revisão para que o resultado venha de uma sessão concluída.

### 3.5 Eventos: como cliques e formulários chegam ao código

Os botões gerados usam `data-action="..."`. Em vez de registrar uma função separada em cada botão, o código usa **delegação de eventos**: um listener no documento recebe o clique e procura o elemento mais próximo que tenha `data-action`.

```js
document.addEventListener('click', event => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const fn = actions[el.dataset.action];
  if (fn) { event.preventDefault(); fn(el); }
});
```

O objeto `actions` mapeia nomes de ações para funções. Por exemplo, `navigate` chama `go()` com a tela indicada em `data-screen`; `sample` chama `fillSample()`; `reveal` revela a resposta; `rate-again` e `rate-remember` registram a autoavaliação. Delegar o evento é útil porque `render()` substitui o conteúdo de `#app`; os novos botões continuam funcionando sem que cada um precise ganhar um listener individual.

O listener de `input` atualiza o texto do rascunho enquanto a pessoa digita e atualiza a grade da biblioteca durante a busca. O listener de `change` lida com a caixa de anotações e com a seleção de arquivo. O listener de `submit` identifica qual formulário foi enviado pelo seu `id`, impede o envio padrão do navegador, valida os campos e executa o fluxo correspondente.

A tecla Espaço revela a resposta durante o estudo e as teclas `1` e `2` registram “Preciso revisar” e “Lembrei” depois que a resposta foi revelada. O handler ignora esses atalhos quando o usuário está digitando em um campo, usando botão ou link, com um diálogo aberto ou segurando teclas modificadoras. O diálogo também tem um listener de clique para fechar quando se clica fora da caixa.

### 3.6 Entrada, arquivo e geração demonstrativa

Ao enviar `source-form`, o código verifica se há texto ou um arquivo representativo. Se não houver nenhum, exibe uma orientação no elemento `#source-error`. Se houver, encaminha para `config`.

A seleção de arquivo aceita extensões PDF e TXT, verifica tamanho de até 10 MB e rejeita arquivo vazio. Para TXT, `file.text()` lê o conteúdo localmente e o código limita o rascunho a 40 mil caracteres. Para PDF, são usados apenas o nome e o tamanho para apresentar o anexo na interface; não existe extração de texto ou OCR. O código não envia os bytes a um servidor.

Ao enviar `config-form`, os valores de título, quantidade, tema e instruções são copiados para `draft`. A aplicação troca para `generating` e agenda um `setTimeout` curto. O `ticket` comparado no callback evita que uma geração cancelada avance mais tarde. Após a espera, `makeCards()` carrega cartões fixos do tema escolhido e cria `working`; nenhum modelo de IA é chamado. O nome de arquivo, texto resumido e instruções podem ser associados ao conjunto como referência demonstrativa, mas não alteram os cartões gerados.

### 3.7 Prévia e operações sobre cartões

`editCard(id)` abre o diálogo de novo cartão ou edição. O formulário exige pergunta e resposta; ao salvar, o listener de `submit` altera o cartão existente ou inclui um novo com `uid()`. `delete-card` remove um cartão da lista e oferece desfazer por alguns segundos. O protótipo preserva pelo menos um cartão: se só houver um, a ação não o apaga.

`rename` abre o formulário de título. `saveWorking()` marca o conjunto como próprio (`example = false`), substitui o conjunto já existente com o mesmo ID ou insere um novo e chama `persist()`. A ação `save-only` salva e abre a biblioteca; `save-study` salva e começa a revisão. `edit-deck` clona um conjunto da biblioteca para a prévia; se era um exemplo, gera uma cópia com um ID novo e o nome “minha cópia”. A exclusão do conjunto pede confirmação e também oferece uma ação de desfazer.

### 3.8 Revisão, resultado e retomada

`beginReview(deck, cards)` monta o estado da sessão: cópia do conjunto, cartões a percorrer, índice inicial zero, resposta escondida e uma lista de marcações vazias. `study()` lê `review.cards[review.index]`, mostra a pergunta e o andamento e, após `reveal`, a resposta. `rate(value)` só aceita uma marcação depois que a resposta foi revelada. Ela avança para o próximo cartão ou chama `finishReview()` ao terminar.

`finishReview()` conta quantas marcações foram `remember`, separa cartões marcados como `again`, guarda um resumo em `lastResult`, acrescenta uma sessão a `sessions`, limita o histórico a 200 itens, persiste os dados e muda para `results`. `retry-again` inicia outra sessão só com os cartões difíceis daquela revisão; `retry-all` inicia de novo o conjunto inteiro.

Os indicadores da tela de resultado são autoavaliações do participante. “Lembrei” não é uma resposta corrigida pelo sistema, e “Preciso revisar” não significa que houve uma avaliação automática de conhecimento. A página de progresso soma sessões e cartões marcados em sessões; o mesmo cartão pode ser contado mais de uma vez em ocasiões diferentes.

### 3.9 Pomodoro

O objeto `timer` guarda o modo (`focus` ou `break`), a duração de foco e pausa em minutos, o tempo restante em segundos, se está rodando, o horário final previsto e quantos períodos foram concluídos. `formatTime()` transforma segundos em `MM:SS`. `pauseTimer()` calcula o que falta até `endAt` e pausa. `updateTimer()` atualiza os elementos visíveis.

Um `setInterval()` verifica o temporizador a cada 250 milissegundos. A contagem é calculada com `Date.now()` e `endAt`, em vez de apenas diminuir um segundo a cada chamada; isso reduz o desvio caso o navegador atrase uma atualização. Ao chegar a zero, o intervalo marca o período como concluído e mostra um aviso. Os controles em `actions` iniciam, pausam, reiniciam e alternam entre foco e pausa. `timer-settings` abre um formulário com limites para as durações.

O Pomodoro é opcional e local à página. Não pausa automaticamente a revisão, não bloqueia a navegação e não implementa ciclos completos de descanso automático.

### 3.10 Persistência e nomes de armazenamento

`loadSaved()` tenta ler a chave em `localStorage`, interpretar JSON e validar a forma básica de conjuntos e sessões. Se os dados não existirem ou não puderem ser interpretados, o protótipo usa os conjuntos de demonstração iniciais. `persist()` serializa `{decks, sessions}` e tenta gravar em `localStorage`; caso o navegador bloqueie ou não tenha espaço, mostra um aviso para informar que a demonstração continua, mas que o salvamento falhou.

O nome histórico da chave continua sendo `revisa-wireframe-v1`. O nome da chave de sessão é `revisa-demo-user`. Esses nomes identificam dados já usados pelo protótipo; mantê-los permite que uma mudança de marca de Revisa para Clareia não faça o navegador ignorar os conjuntos e a identificação de demonstração já gravados. O nome interno legado não altera o nome que aparece na interface.

Conjuntos e histórico ficam em `localStorage`, que persiste entre visitas naquele navegador e perfil. O nome de demonstração fica em `sessionStorage`, normalmente limitado à sessão/aba do navegador. O e-mail preenchido na tela de acesso não é guardado. Não há senha, conta real, banco de dados, sincronização entre dispositivos ou controle de acesso. Como os dados estão no navegador local, não se deve inserir material confidencial ou informação pessoal real.

## 4. Segurança e limites para explicar corretamente

A demonstração valida entradas comuns e escapa valores inseridos em boa parte das strings HTML. Também informa falhas de armazenamento e não transmite arquivos para um backend. Ainda assim, ela não deve ser apresentada como produto seguro para dados privados: não existe autenticação, autorização de usuário, servidor, criptografia própria, política de retenção ou sincronização. O armazenamento pode ser acessado por quem usa o mesmo perfil de navegador e pode ser apagado nas configurações do navegador.

Limitações funcionais que devem ser ditas com clareza:

- **Login simulado:** o nome só identifica a experiência local. Não há cadastro, senha ou autenticação; o e-mail é fictício e não é armazenado.
- **IA simulada:** não há chamada a serviço de IA. O tema selecionado escolhe perguntas e respostas fixas que estão no código.
- **PDF não é extraído:** o protótipo apenas mostra nome e tamanho do PDF. Não lê o conteúdo, não executa OCR e não faz upload.
- **TXT é lido localmente, mas não cria cartões:** o texto pode aparecer como referência e tem limite de 40 mil caracteres; as perguntas continuam vindo do catálogo de exemplos.
- **Autoavaliação não é nota:** os totais descrevem o que a pessoa marcou; não comprovam aprendizagem ou acerto.
- **Sem algoritmo de repetição espaçada:** “retomar” repete cartões marcados por decisão explícita, sem agendamento calculado.
- **Responsividade demonstrada, não validada em campo:** a moldura de celular é um iframe; testes em aparelhos e com pessoas ainda são necessários.

## 5. Roteiro oral para uma apresentação

Uma explicação curta pode seguir esta sequência:

1. “O `index.html` contém a moldura, carrega CSS e JavaScript e oferece os pontos onde a interface dinâmica aparece.”
2. “O `styles.css` define componentes e começa pelo layout estreito; media queries reorganizam a interface para telas maiores.”
3. “No `app.js`, `topics` é a fonte dos cartões fixos e `screen` representa a tela atual.”
4. “`render()` seleciona a função da tela e escreve o resultado dentro de `#app`; as funções como `home()` e `study()` montam cada etapa.”
5. “Os botões usam `data-action`, e um listener delegado no documento encaminha os cliques para o objeto `actions`.”
6. “A revisão mostra a pergunta, revela a resposta e registra a autoavaliação. `finishReview()` grava um resumo e alimenta o histórico.”
7. “Os conjuntos e o histórico ficam no armazenamento local. Login e criação automática por IA são simulados, e o PDF não é extraído.”

### Perguntas que podem aparecer

**Onde o código cria os cartões?** Em `topics` ficam as perguntas e respostas de exemplo; `makeCards()` transforma os pares selecionados em objetos com ID. A etapa de configuração escolhe o tema e a quantidade.

**O que acontece quando aperto um botão?** O código encontra o `data-action` no elemento clicado e procura uma função correspondente em `actions`. Essa função atualiza o estado e geralmente chama `render()` por meio de `go()`.

**Por que não guardar tudo no HTML?** O HTML estático oferece a estrutura inicial. O JavaScript precisa mudar telas e listas conforme as ações; por isso, a área `#app` recebe conteúdo gerado a partir do estado.

**O que fica salvo e por quanto tempo?** Conjuntos e sessões concluídas ficam no `localStorage` daquele navegador. O nome fica no `sessionStorage`. Limpar o armazenamento do navegador pode apagar os dados; eles não acompanham a pessoa para outro aparelho.

**Como o sistema sabe se a resposta está certa?** Ele não sabe. A pessoa revela a resposta de referência e escolhe uma autoavaliação. Não há correção automática nem nota.

**O material enviado influencia os cartões?** Não. TXT é lido para a demonstração e PDF aparece como anexo representativo, mas a seleção do tema carrega exemplos previamente escritos.

**O que falta para virar um produto funcional?** Entre outras coisas, autenticação real, tratamento e extração de documentos, serviço de geração e revisão de conteúdo, regras de privacidade, armazenamento de servidor e validação com usuários. Essas decisões precisam ser definidas e implementadas; não estão escondidas no protótipo.

## 6. Vocabulário breve

- **DOM:** representação da página que o JavaScript pode consultar e modificar.
- **Estado:** valores atuais da aplicação, como tela, conjunto editado e cartão selecionado.
- **Renderizar:** montar ou atualizar a interface visual a partir do estado.
- **Evento:** ocorrência como clique, digitação, alteração ou envio de formulário.
- **Delegação de eventos:** ouvir um evento em um elemento comum e identificar qual controle interno o originou.
- **Persistência local:** gravação no navegador do próprio dispositivo, sem serviço remoto.
- **Responsivo:** layout que se reorganiza conforme a largura disponível.
- **Autoavaliação:** julgamento da pessoa sobre sua lembrança, sem nota calculada pelo programa.


## 7. Como encontrar e explicar linhas específicas

No editor, use Ctrl+F e busque a expressão da coluna esquerda. O código agora usa instruções distribuídas em linhas, indentação e comentários em português. As strings que descrevem as telas permanecem juntas para preservar exatamente o HTML renderizado; nelas, procure rótulos, classes e as expressões entre `${...}`.

| Trecho real | Explicação que pode usar na apresentação |
| --- | --- |
| `value ?? ''` | Usa uma string vazia quando o valor é nulo ou indefinido. Preserva outros valores, como zero. |
| `saved?.decks ?? seedDecks()` | Tenta aproveitar os conjuntos recuperados; na ausência deles, cria os exemplos iniciais. O `?.` evita acessar uma propriedade de um valor nulo. |
| `topics[topic].cards.slice(0,count)` | Pega os primeiros cartões até a quantidade escolhida sem alterar a lista original. |
| `.map(([q,a])=>({id:uid(),q,a}))` | Percorre cada par de pergunta e resposta e devolve um objeto de cartão com um identificador. |
| `screen===s?' active':''` | Acrescenta uma classe de destaque apenas quando o botão corresponde à tela atual. |
| `JSON.stringify({decks,sessions})` | Converte o objeto em texto JSON para gravá-lo no armazenamento. `JSON.parse` faz a operação inversa. |
| `decks.findIndex(d=>d.id===working.id)` | Localiza a posição do conjunto editado pelo ID; retorna -1 se ainda não estiver salvo. |
| `structuredClone(working)` | Faz uma cópia independente do objeto e de seus dados internos. |
| `review.ratings.filter(r=>r==='remember').length` | Seleciona as marcações “lembrei” e conta quantas existem. |
| `sessions.reduce((a,s)=>a+s.total,0)` | Soma a quantidade de cartões revisados em todas as sessões, começando em zero. |
| `event.preventDefault()` | Impede a ação padrão, como recarregar a página ao enviar um formulário, para que o código cuide do fluxo. |
| `el.dataset.action` | Lê o valor do atributo HTML `data-action` do controle clicado. |
| `ticket!==generationTicket` | Detecta que uma transição invalidou a espera anterior e impede o avanço daquela geração. |
| `Math.ceil((timer.endAt-Date.now())/1000)` | Calcula quantos segundos faltam até o horário final, arredondando para cima. |
| `try { ... } catch { ... }` | Tenta uma operação que pode falhar e define como continuar se ocorrer um erro. |

### Arquivos de entrega

O ZIP reúne a versão de desenvolvimento: `dist/index.html`, `styles.css`, `app.js`, `mobile.html`, a logo e os documentos de apoio. A estrutura separada é a melhor para estudar e localizar funções.

O `index.html` entregue fora do ZIP é uma cópia autossuficiente da mesma interface. CSS e JavaScript ficam em blocos `<style>` e `<script>`, e a logo fica incorporada em base64. O script fica no fim de `body`, quando os elementos já existem; por isso, essa cópia não precisa de `defer`. O mapa dessa cópia explica como conferir a responsividade, em vez de apontar para arquivos auxiliares que não a acompanham.

O utilitário `scripts/gerar_entregaveis.py` automatiza essa preparação usando apenas a biblioteca padrão do Python. `Path` localiza arquivos, `base64` incorpora a imagem, `re.subn` adapta os links do mapa, `shutil.copy2` copia o guia e `zipfile` cria o pacote. Ele não roda dentro do navegador e não participa da navegação do protótipo.

## 8. Como estudar a versão didática (05/11/2026)

Abra o ZIP e comece por `dist/index.html`, `dist/styles.css` e `dist/app.js`. O HTML único é conveniente para executar e compartilhar; os arquivos separados são mais fáceis de estudar, pois a imagem em base64 não interrompe a leitura do JavaScript.

No JavaScript, siga esta ordem: utilitários → dados `topics` → variáveis de estado → `render()` e funções de tela → revisão e temporizador → objeto `actions` → eventos. Os comentários explicam a finalidade de cada bloco e as operações principais. Uma chamada como `go("home")` leva a outra função: use Ctrl+F para encontrar `function go` e leia seu corpo.

Em uma linha com atribuição, identifique o que recebe o valor (à esquerda de `=`) e como o valor é calculado (à direita). Em uma condição `if`, leia primeiro a pergunta lógica e depois as instruções que só executam quando ela é verdadeira. Nas funções de tela, o texto entre crases é HTML, enquanto `${...}` insere um valor calculado pelo JavaScript. As operações `map`, `filter`, `find` e `reduce` são explicadas nas seções anteriores e na tabela de trechos reais.
