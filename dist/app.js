'use strict';

/* Clareia / A3 — JavaScript sem dependências.
 * Login e geração de cartões são demonstrações. Nenhuma chamada de IA é feita.
 * O armazenamento local contém conjuntos e autoavaliações, nunca senhas.
 */
// As chaves antigas preservam os estudos já salvos no protótipo.
const STORAGE_KEY = 'revisa-wireframe-v1';
// Atalho para buscar elementos; receber `root` permite limitar a busca a um trecho da página.
const $ = (selector, root = document) => root.querySelector(selector);
// Escapa os cinco caracteres que poderiam formar HTML ou uma aspa em atributos.
// Para cada caractere encontrado, o objeto abaixo fornece sua entidade segura equivalente.
const escapeHTML = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
// Cada chave guarda o desenho SVG usado pela função `icon` mais abaixo.
const icons = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  cards:
    '<rect x="6" y="5" width="14" height="16" rx="2"/><path d="M3 17V3h13"/>',
  book: '<path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3zM12 6v15"/>',
  chart: '<path d="M4 3v17h17M8 15v-4M13 15V7M18 15V4"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  file: '<path d="M14 2H5v20h14V7zM14 2v6h5M8 12h8M8 16h6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  edit: '<path d="m14 4 6 6M4 20l5-1L21 7l-5-5L4 14z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  reset: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7"/><circle cx="12" cy="12" r="3"/>',
  logout: '<path d="M9 3H3v18h6M8 12h13m-5-5 5 5-5 5"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="m7 4 13 8-13 8z"/>',
};
function icon(name) {
  // Mantém os SVG decorativos ocultos para leitores de tela.
  return `<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24">${icons[name] || icons.cards}</svg></span>`;
}
function button(label, action, extra = '', primary = false) {
  // `data-action` conecta este botão ao objeto `actions`, sem um listener por botão.
  return `<button class="btn${primary ? ' primary' : ''}" data-action="${action}" ${extra}>${label}</button>`;
}
const logoURL = 'assets/clareia-logo.png';
const brand = `<div class="brand"><span class="brand-image"><img src="${logoURL}" alt="Clareia — Método de estudo" width="1015" height="566"></span></div>`;
const compactBrand = `<div class="brand brand-compact"><span class="brand-image"><img src="${logoURL}" alt="" width="1015" height="566"></span><span class="brand-name">Clareia</span></div>`;
const note = (text) => `<div class="note">${icon('info')}<p>${text}</p></div>`;
const annotation = (text) => `<div class="annotation">UX / ${text}</div>`;

// Catálogo fixo usado pela demonstração; a escolha do tema carrega estes pares de pergunta e resposta.
const topics = {
  usabilidade: {
    label: 'Usabilidade e UX',
    title: 'Usabilidade — revisão da aula',
    source: 'Aula de Usabilidade (exemplo)',
    cards: [
      [
        'Qual é a diferença entre eficácia e eficiência?',
        'Eficácia é atingir o objetivo. Eficiência considera os recursos e o esforço necessários para alcançá-lo.',
      ],
      [
        'O que significa visibilidade do estado do sistema?',
        'A interface deve informar o que está acontecendo, com retorno adequado e em tempo oportuno.',
      ],
      [
        'Como a prevenção de erros pode aparecer em um formulário?',
        'Com rótulos claros, orientações de preenchimento e validação que ajude o usuário a evitar entradas incorretas.',
      ],
      [
        'Qual é a diferença entre wireframe e protótipo?',
        'O wireframe organiza conteúdo e estrutura. O protótipo representa a experiência proposta e pode demonstrar suas interações.',
      ],
      [
        'Por que reconhecimento costuma exigir menos esforço que memorização?',
        'Opções e informações visíveis ajudam o usuário a identificar o caminho sem precisar lembrar comandos ou etapas.',
      ],
      [
        'O que é uma avaliação heurística?',
        'É uma inspeção em que avaliadores analisam uma interface a partir de princípios de usabilidade.',
      ],
      [
        'O que um teste de usabilidade com usuários observa?',
        'Como pessoas realizam tarefas na interface, incluindo dificuldades, erros, tempo e necessidade de ajuda.',
      ],
      [
        'Para que serve a hierarquia tipográfica?',
        'Para organizar a informação visualmente e facilitar a identificação de títulos, conteúdos e ações.',
      ],
      [
        'O que caracteriza a estratégia Mobile First?',
        'Começar a concepção e a implementação pelas telas menores e ampliar o layout progressivamente.',
      ],
      [
        'Qual é o objetivo de um teste A/B?',
        'Comparar duas versões com uma métrica e um procedimento definidos para avaliar qual tem melhor resultado no contexto do teste.',
      ],
    ],
  },
  ia: {
    label: 'Inteligência Artificial',
    title: 'IA — conceitos fundamentais',
    source: 'Anotações de IA (exemplo)',
    cards: [
      [
        'O que é aprendizado supervisionado?',
        'É o aprendizado a partir de exemplos com entradas e respostas conhecidas, usados para treinar um modelo.',
      ],
      [
        'Qual é a diferença entre classificação e regressão?',
        'Classificação prevê categorias. Regressão estima valores numéricos.',
      ],
      [
        'O que é um conjunto de teste?',
        'É uma parcela de dados separada do treinamento, usada para avaliar a generalização do modelo.',
      ],
      [
        'O que significa sobreajuste?',
        'É quando o modelo se ajusta demais aos exemplos de treinamento e apresenta desempenho pior em novos dados.',
      ],
      [
        'O que caracteriza o aprendizado não supervisionado?',
        'O modelo busca estruturas ou padrões nos dados sem receber rótulos de resposta para cada exemplo.',
      ],
      [
        'Para que serve uma matriz de confusão?',
        'Para comparar classes previstas e reais, mostrando acertos e tipos de erro de um classificador.',
      ],
      [
        'O que é um atributo em um conjunto de dados?',
        'É uma característica que representa uma observação, como idade, temperatura ou quantidade de acessos.',
      ],
      [
        'Por que avaliar apenas a acurácia pode ser insuficiente?',
        'Porque uma distribuição desigual de classes pode produzir acurácia alta mesmo quando a classe relevante é mal identificada.',
      ],
      [
        'O que são hiperparâmetros?',
        'São configurações do processo de aprendizagem definidas fora do ajuste direto dos parâmetros do modelo.',
      ],
      [
        'Por que uma resposta de IA generativa precisa ser conferida?',
        'Porque ela pode conter informações incorretas ou sem suporte no material utilizado.',
      ],
    ],
  },
  redes: {
    label: 'Redes de computadores',
    title: 'Redes — fundamentos',
    source: 'Resumo de Redes (exemplo)',
    cards: [
      [
        'Qual é a função de um roteador?',
        'Encaminhar pacotes entre redes, usando informações de roteamento.',
      ],
      [
        'Qual é a função do DNS?',
        'Associar nomes a informações como endereços IP, permitindo localizar serviços por nomes.',
      ],
      [
        'Para que serve o DHCP?',
        'Para fornecer configurações de rede automaticamente aos dispositivos, como endereço IP, gateway e DNS.',
      ],
      [
        'O que é o gateway padrão?',
        'É o próximo salto usado para destinos que não possuem uma rota mais específica aplicável.',
      ],
      [
        'Qual é a diferença entre TCP e UDP?',
        'TCP oferece uma conexão com entrega ordenada e mecanismos de confiabilidade. UDP envia datagramas sem essas garantias de transporte.',
      ],
      [
        'Qual é a função de uma máscara de sub-rede?',
        'Indicar quais bits do endereço IPv4 identificam a rede e quais identificam o host.',
      ],
      [
        'Qual é a função básica de um switch Ethernet?',
        'Encaminhar quadros dentro de uma rede local, normalmente com base em endereços MAC.',
      ],
      [
        'O que é uma VLAN?',
        'Uma segmentação lógica de uma rede de camada 2, que permite separar domínios de broadcast.',
      ],
      [
        'O que é latência de rede?',
        'O tempo necessário para uma informação percorrer um caminho; medições de ida e volta incluem os dois sentidos.',
      ],
      [
        'O que é failover?',
        'É a mudança para um recurso alternativo quando o recurso principal falha, conforme as regras de detecção e recuperação configuradas.',
      ],
    ],
  },
};

function makeCards(topic, count = 10) {
  // Copia até `count` pares do tema e cria um ID próprio para cada cartão.
  return topics[topic].cards
    .slice(0, count)
    .map(([q, a]) => ({ id: uid(), q, a }));
}
function seedDecks() {
  // Cria os três conjuntos iniciais de exemplo para uma biblioteca ainda sem dados salvos.
  return Object.entries(topics).map(([topic, t]) => ({
    id: `example-${topic}`,
    title: t.title,
    topic,
    example: true,
    cards: makeCards(topic),
    sourceName: t.source,
    sourceText: 'Material demonstrativo preparado para testar a interface.',
    createdAt: new Date().toISOString(),
  }));
}
function loadSaved() {
  try {
    // Dados inválidos ou antigos são descartados gradualmente pela checagem de formato abaixo.
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!v || !Array.isArray(v.decks)) return null;
    v.decks = v.decks.filter(
      (d) =>
        d &&
        typeof d.id === 'string' &&
        typeof d.title === 'string' &&
        Array.isArray(d.cards) &&
        d.cards.length &&
        d.cards.every(
          (c) => c && typeof c.q === 'string' && typeof c.a === 'string',
        ),
    );
    v.sessions = Array.isArray(v.sessions)
      ? v.sessions.filter(
          (s) =>
            s &&
            typeof s.title === 'string' &&
            Number.isFinite(s.total) &&
            Number.isFinite(s.remembered),
        )
      : [];
    return v;
  } catch {
    return null;
  }
}
const saved = loadSaved();
// Dados válidos têm prioridade; caso contrário, a aplicação começa com exemplos.
let decks = saved?.decks ?? seedDecks();
let sessions = saved?.sessions ?? [];
let user = null;
try {
  user = JSON.parse(sessionStorage.getItem('revisa-demo-user'));
} catch {}
let screen = user ? 'home' : 'login';
// Estado ainda não salvo do fluxo de entrada e configuração de um novo conjunto.
let draft = { text: '', file: null, topic: 'usabilidade', title: '', count: 5 };
// `working` é a cópia em edição; `review` representa a sessão de estudo atual.
let working = null,
  review = null,
  lastResult = null,
  menuOpen = false,
  filter = 'all',
  search = '',
  annotated = false,
  generationTicket = 0;
let toastTimeout,
  undoAction = null,
  editTarget = null;
const timer = {
  mode: 'focus',
  focus: 25,
  break: 5,
  remaining: 25 * 60,
  running: false,
  endAt: 0,
  rounds: 0,
};
const screenLabels = {
  login: 'Acesso',
  home: 'Novo estudo',
  config: 'Configurar cartões',
  generating: 'Preparando cartões',
  preview: 'Conferir cartões',
  study: 'Revisão',
  results: 'Resultado',
  library: 'Meus estudos',
  progress: 'Progresso',
};
const dialog = $('#dialog');

function persist() {
  // Só conjuntos e histórico vão para localStorage; a função informa se o navegador recusou o salvamento.
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ decks, sessions }));
    return true;
  } catch {
    toast(
      'Não foi possível salvar neste navegador. Você pode continuar a demonstração.',
    );
    return false;
  }
}
function toast(message, undo = null) {
  // Exibe uma mensagem temporária e, opcionalmente, guarda uma função de reversão.
  clearTimeout(toastTimeout);
  undoAction = undo;
  const el = $('#toast');
  el.innerHTML =
    escapeHTML(message) +
    (undo ? '<button data-action="undo">Desfazer</button>' : '');
  el.hidden = false;
  toastTimeout = setTimeout(() => {
    el.hidden = true;
    undoAction = null;
  }, 6000);
}
function go(next) {
  // Invalidar o ticket cancela uma geração atrasada; também devolvemos foco ao conteúdo principal.
  generationTicket++;
  menuOpen = false;
  screen = next;
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
  requestAnimationFrame(() => $('#main')?.focus({ preventScroll: true }));
}
function setUser(name = 'Aluno demonstração') {
  // O acesso é ilustrativo: mantém somente o nome da sessão, sem autenticação ou senha.
  user = { name: String(name).trim().slice(0, 45) || 'Aluno demonstração' };
  try {
    sessionStorage.setItem('revisa-demo-user', JSON.stringify(user));
  } catch {}
  go('home');
}
function initials() {
  // Usa as primeiras letras de até duas palavras para compor o avatar.
  return escapeHTML(
    (user?.name || 'Aluno')
      .split(' ')
      .slice(0, 2)
      .map((s) => s[0])
      .join('')
      .toUpperCase(),
  );
}
function nav() {
  // `aria-current` identifica a tela atual também para tecnologias assistivas.
  return [
    ['home', 'plus', 'Novo estudo'],
    ['library', 'book', 'Meus estudos'],
    ['progress', 'chart', 'Progresso'],
  ]
    .map(
      ([s, i, t]) =>
        `<button class="nav-item${screen === s ? ' active' : ''}" data-action="navigate" data-screen="${s}" ${screen === s ? 'aria-current="page"' : ''}>${icon(i)}${t}</button>`,
    )
    .join('');
}
function shell(content) {
  // Estrutura compartilhada pelas telas internas: menus, breadcrumb e área principal.
  return `<div class="layout"><aside class="sidebar" aria-label="Menu principal">${brand}${button(`${icon('plus')} Novo estudo`, 'new', '', true)}<div class="sidebar-section">ESPAÇO DE ESTUDO</div><nav>${nav()}</nav><div class="sidebar-section">COMO FUNCIONA</div><p class="small muted" style="padding:0 12px">Seu material.<br>Perguntas para praticar.<br>Uma revisão de cada vez.</p><div class="sidebar-foot"><div class="row"><span class="avatar">${initials()}</span><div><strong class="small">${escapeHTML(user?.name || 'Aluno')}</strong><div class="tiny muted">Conta de demonstração</div></div></div><button class="nav-item" data-action="logout">${icon('logout')} Sair</button></div></aside><div class="shell"><header class="mobile-header">${compactBrand}<button class="icon-btn" data-action="menu" aria-label="${menuOpen ? 'Fechar' : 'Abrir'} menu" aria-expanded="${menuOpen}">${icon('menu')}</button></header>${menuOpen ? `<nav class="mobile-nav" aria-label="Menu principal">${nav()}<button class="nav-item" data-action="logout">${icon('logout')} Sair</button></nav>` : ''}<div class="topline"><div class="breadcrumb">Meu espaço <span aria-hidden="true">/</span> <span class="strong">${screenLabels[screen]}</span></div><div class="row"><span class="badge">DEMONSTRAÇÃO</span><span class="avatar hide-small" aria-label="Perfil de demonstração">${initials()}</span></div></div><main id="main" tabindex="-1">${content}</main></div></div>`;
}
function render() {
  // Uma tela é escolhida pelo estado `screen` e substitui o conteúdo anterior de `#app`.
  document.body.classList.toggle('annotated', annotated);
  $('#app').innerHTML =
    screen === 'login'
      ? login()
      : shell(
          (
            {
              home,
              config,
              generating,
              preview,
              study,
              results,
              library,
              progress,
            }[screen] || home
          )(),
        );
  document.title = `${screenLabels[screen]} · Clareia`;
  if (screen === 'study') updateTimer();
}

function login() {
  return `<main class="login-layout" id="main" tabindex="-1"><section class="login-intro">${brand}<span class="eyebrow">DO MATERIAL À REVISÃO</span><h2>Menos tempo organizando.<br>Mais tempo estudando.</h2><p class="muted">Transforme o conteúdo da sua matéria em cartões para praticar, no seu ritmo.</p><div class="wire-illustration" aria-hidden="true"><div class="wire-card back"></div><div class="wire-card front"><span class="badge">PERGUNTA / RESPOSTA</span><div class="placeholder-line"></div><div class="placeholder-line"></div><div class="placeholder-line"></div></div></div><div class="login-steps"><div><span>01</span>Envie um material</div><div><span>02</span>Confira seus cartões</div><div><span>03</span>Comece a revisão</div></div></section><section class="login-form">${brand}<span class="eyebrow">SEU ESPAÇO DE ESTUDO</span><h1>Vamos começar?</h1><p class="intro">Acesse a demonstração para explorar o fluxo de estudo.</p><form id="login-form"><div class="field"><label for="login-name">Como podemos chamar você?</label><input id="login-name" name="name" maxlength="45" placeholder="Seu primeiro nome" autocomplete="off"></div><div class="field"><label for="login-email">E-mail de exemplo</label><input id="login-email" name="email" type="email" value="aluno@exemplo.com" required aria-describedby="login-hint" autocomplete="off"><div id="login-hint" class="field-hint">Use um e-mail fictício. Ele não será armazenado.</div></div><button class="btn primary full" type="submit">Entrar na demonstração ${icon('arrow')}</button></form><p class="form-footer">${button('Explorar como visitante', 'guest')}</p>${note('Acesso simulado, sem senha e sem cadastro real. A geração de flashcards também é demonstrativa; não há conexão com IA.')}${annotation('Login representado por uma entrada simplificada. Na versão funcional, prever autenticação, cadastro e recuperação de acesso.')}<div class="login-footer">PROJETO A3 · HTML / CSS / JAVASCRIPT</div></section></main>`;
}

function deckCard(d, compact = false) {
  const studied = sessions.filter((s) => s.deckId === d.id).length;
  return `<article class="deck"><div class="deck-head"><span class="deck-icon">${icon('cards')}</span><span class="badge">${d.example ? 'Exemplo' : 'Meu conjunto'}</span></div><h3>${escapeHTML(d.title)}</h3><p>${d.cards.length} cartões · ${escapeHTML(topics[d.topic]?.label || 'Personalizado')}</p><div class="deck-bottom"><span>${studied ? `${studied} ${studied === 1 ? 'sessão' : 'sessões'}` : 'Ainda não revisado'}</span><button data-action="open-deck" data-id="${escapeHTML(d.id)}">Estudar <span aria-hidden="true">↗</span></button></div>${compact ? '' : `<div class="actions">${button('Editar', 'edit-deck', `data-id="${escapeHTML(d.id)}"`)}<button class="icon-btn" data-action="delete-deck" data-id="${escapeHTML(d.id)}" aria-label="Excluir conjunto ${escapeHTML(d.title)}">${icon('trash')}</button></div>`}</article>`;
}
function home() {
  return `<section class="home-hero"><div class="headline"><span class="eyebrow">UM NOVO PONTO DE PARTIDA</span><h1>O que vamos estudar hoje?</h1><p>Traga o conteúdo da sua matéria. Organize sua próxima revisão.</p></div><form id="source-form"><div class="composer"><label for="source-text" class="skip-link">Material de estudo ou instrução</label><textarea id="source-text" name="source" maxlength="40000" placeholder="Cole suas anotações ou escreva o que deseja revisar...">${escapeHTML(draft.text)}</textarea>${draft.file ? `<div class="file-chip">${icon('file')}<div><strong>${escapeHTML(draft.file.name)}</strong><div class="tiny muted">${Math.max(1, Math.round(draft.file.size / 1024))} KB · anexado para demonstração</div></div><button class="icon-btn" data-action="remove-file" type="button" aria-label="Remover anexo">${icon('close')}</button></div>` : ''}<div class="composer-footer"><div class="row"><button class="btn ghost" data-action="attach" type="button">${icon('upload')} Anexar material</button><input id="file-input" type="file" accept=".pdf,.txt,application/pdf,text/plain" hidden></div><button class="btn primary" type="submit">Criar flashcards ${icon('arrow')}</button></div></div><div id="source-error" class="error" role="alert"></div><p class="composer-hint">PDF ou TXT · até 10 MB · geração de exemplo, sem IA</p></form><div class="quick-prompts" aria-label="Carregar material de exemplo"><button data-action="sample" data-topic="usabilidade">+ Exemplo de Usabilidade</button><button data-action="sample" data-topic="ia">+ Exemplo de IA</button><button data-action="sample" data-topic="redes">+ Exemplo de Redes</button></div>${annotation('Ações visíveis reduzem a necessidade de saber escrever prompts. O anexo pode ser removido antes de continuar.')}</section><section class="recent-section"><div class="section-head"><h2>Seus conjuntos</h2><button class="btn ghost" data-action="navigate" data-screen="library">Ver todos <span aria-hidden="true">↗</span></button></div>${
    decks.length
      ? `<div class="decks-grid">${decks
          .slice(0, 3)
          .map((d) => deckCard(d, true))
          .join('')}</div>`
      : `<div class="empty"><h2>Seu primeiro conjunto começa aqui</h2><p>Envie um material ou use um dos exemplos acima.</p></div>`
  }<p class="footer-note">Os conjuntos e as revisões ficam salvos apenas neste navegador.</p></section>`;
}

function sourceAside() {
  return `<aside class="source-aside panel"><span class="eyebrow">MATERIAL ENVIADO</span><div class="source-placeholder">${icon('file')}</div><h3>${escapeHTML(draft.file?.name || 'Texto colado')}</h3><span class="badge">${draft.file ? 'Arquivo anexado' : 'Texto'}</span>${draft.text ? `<div class="source-snippet">${escapeHTML(draft.text.slice(0, 550))}${draft.text.length > 550 ? '…' : ''}</div>` : ''}<p class="small muted" style="margin:15px 0 0">O material é exibido para testar o envio. Seu conteúdo não será analisado por IA nesta versão.</p></aside>`;
}
function config() {
  return `<div class="page-head"><span class="eyebrow">01 / PREPARAR</span><h1>Uma revisão do seu jeito.</h1><p>Escolha o tamanho do conjunto e o tema usado nesta demonstração.</p></div><div class="config-grid"><section class="panel"><form id="config-form" class="form-grid"><div><label for="deck-title">Nome do conjunto</label><input id="deck-title" name="title" maxlength="100" value="${escapeHTML(draft.title || topics[draft.topic].title)}" required placeholder="Ex.: Usabilidade — Aula 03"></div><div><label>Quantidade de cartões</label><div class="option-grid"><label class="radio-card"><input type="radio" name="count" value="5" ${draft.count === 5 ? 'checked' : ''}>5 cartões <span class="muted tiny">Revisão curta</span></label><label class="radio-card"><input type="radio" name="count" value="10" ${draft.count === 10 ? 'checked' : ''}>10 cartões</label></div></div><div><label for="demo-topic">Tema dos cartões de exemplo</label><select id="demo-topic" name="topic">${Object.entries(
    topics,
  )
    .map(
      ([key, t]) =>
        `<option value="${key}" ${key === draft.topic ? 'selected' : ''}>${t.label}</option>`,
    )
    .join(
      '',
    )}</select><p class="field-hint">Na aplicação final, as perguntas serão criadas a partir do material enviado.</p></div><div><label for="deck-instructions">Instruções para a revisão <span class="muted">(opcional)</span></label><textarea id="deck-instructions" name="instructions" maxlength="600" placeholder="Ex.: priorizar conceitos que podem cair na prova.">${escapeHTML(draft.instructions || '')}</textarea><p class="field-hint">Serão salvas como observação. Não alteram os cartões demonstrativos.</p></div>${note('Nesta versão, serão carregados cartões prontos do tema escolhido. PDF, texto e instruções não são enviados a uma IA.')}<div class="form-actions">${button(`${icon('back')} Voltar`, 'back-home', 'type="button"')}<button class="btn primary" type="submit">Gerar demonstração ${icon('arrow')}</button></div></form>${annotation('Opções curtas e rótulos explícitos dão controle sobre o tamanho da revisão. A origem simulada dos cartões fica visível antes da geração.')}</section>${sourceAside()}</div>`;
}
function generating() {
  return `<section class="panel generating" aria-live="polite"><span class="eyebrow">01 / PREPARAR</span><h1>Preparando seus cartões…</h1><p class="muted">Carregando ${draft.count} exemplos de ${escapeHTML(topics[draft.topic].label)}.</p><div class="loading-bar" aria-hidden="true"><span></span></div><p class="small muted">Geração simulada. Nenhum arquivo está sendo enviado.</p>${button('Cancelar e voltar', 'cancel-generation')}</section>`;
}
function preview() {
  if (!working) return home();
  return `<div class="page-head"><span class="eyebrow">02 / CONFERIR</span><div class="title-edit"><h1>${escapeHTML(working.title)}</h1><button class="btn ghost" data-action="rename" aria-label="Renomear conjunto">${icon('edit')}</button></div><p style="margin-top:12px">Confira as perguntas e as respostas. Ajuste o que fizer sentido para você.</p></div>${note('Cartões demonstrativos de ' + escapeHTML(topics[working.topic]?.label || 'estudo') + '. O material anexado não foi analisado. Você pode editar ou criar seus próprios cartões.')}<div class="preview-toolbar"><strong>${working.cards.length} cartões neste conjunto</strong>${button(`${icon('plus')} Novo cartão`, 'add-card')}</div><section class="card-list" aria-label="Cartões gerados">${working.cards.map((c, i) => `<article class="preview-card"><span class="card-number">${String(i + 1).padStart(2, '0')}</span><div class="card-content"><p class="q">${escapeHTML(c.q)}</p><p class="a">${escapeHTML(c.a)}</p></div><div class="card-tools"><button class="btn ghost" data-action="edit-card" data-id="${escapeHTML(c.id)}" aria-label="Editar cartão ${i + 1}">${icon('edit')} Editar</button><button class="btn ghost" data-action="delete-card" data-id="${escapeHTML(c.id)}" aria-label="Excluir cartão ${i + 1}">${icon('trash')}</button></div></article>`).join('')}</section>${annotation('Conferência antes do estudo oferece controle sobre possíveis erros de conteúdo. Excluir possui opção de desfazer.')}<footer class="preview-footer"><p>Alterações pendentes até salvar.</p><div class="row">${button('Salvar conjunto', 'save-only')}${button(`Salvar e estudar ${icon('arrow')}`, 'save-study', '', true)}</div></footer>`;
}
function timerPanel() {
  return `<section class="panel" aria-label="Temporizador Pomodoro"><div class="timer-head"><h2>${icon('clock')} Pomodoro</h2><button class="btn ghost" data-action="timer-settings" aria-label="Ajustar tempos do Pomodoro">Ajustar</button></div><div class="timer-mode"><button data-action="timer-mode" data-mode="focus" class="${timer.mode === 'focus' ? 'active' : ''}" aria-pressed="${timer.mode === 'focus'}">Foco</button><button data-action="timer-mode" data-mode="break" class="${timer.mode === 'break' ? 'active' : ''}" aria-pressed="${timer.mode === 'break'}">Pausa</button></div><div class="timer-digits" id="timer-digits" role="timer" aria-label="Tempo restante">${formatTime(timer.remaining)}</div><p class="timer-label" id="timer-label">${timer.running ? 'Tempo em andamento' : 'Você define o seu ritmo'}</p><div class="timer-controls"><button class="btn primary" id="timer-toggle" data-action="timer-toggle">${timer.running ? 'Pausar' : 'Iniciar'}</button><button class="icon-btn" data-action="timer-reset" aria-label="Reiniciar temporizador">${icon('reset')}</button></div><p class="timer-summary" id="timer-summary">${timer.rounds} ${timer.rounds === 1 ? 'período concluído' : 'períodos concluídos'} · uso opcional</p></section>`;
}
function study() {
  if (!review) return home();
  const card = review.cards[review.index];
  const remembered = review.ratings.filter((r) => r === 'remember').length;
  const again = review.ratings.filter((r) => r === 'again').length;
  return `<div class="page-head"><span class="eyebrow">03 / PRATICAR</span><div class="row spread wrap"><h1>${escapeHTML(review.deck.title)}</h1>${button('Encerrar sessão', 'end-review')}</div><p>Leia a pergunta e tente responder antes de revelar o verso.</p></div><div class="study-grid"><section class="study-column"><div class="progress-label"><span>Cartão <strong>${review.index + 1}</strong> de ${review.cards.length}</span><span>${review.ratings.filter(Boolean).length} revisados</span></div><div class="progress-track" role="progressbar" aria-label="Progresso da revisão" aria-valuemin="0" aria-valuemax="${review.cards.length}" aria-valuenow="${review.ratings.filter(Boolean).length}"><div class="progress-fill" style="width:${(review.ratings.filter(Boolean).length / review.cards.length) * 100}%"></div></div><article class="study-card"><span class="card-type">${review.revealed ? 'FRENTE + VERSO' : 'FRENTE / PERGUNTA'}</span><h2 class="question">${escapeHTML(card.q)}</h2>${review.revealed ? `<div class="answer"><span class="answer-label">RESPOSTA DE REFERÊNCIA</span>${escapeHTML(card.a)}</div>` : `${button(`${icon('eye')} Mostrar resposta`, 'reveal')}`}</article><div class="study-controls">${review.revealed ? `${button(`${icon('reset')} Preciso revisar`, 'rate-again')}${button(`${icon('check')} Lembrei`, 'rate-remember', '', true)}` : `<button class="btn" disabled>Preciso revisar</button><button class="btn primary" disabled>Lembrei</button>`}</div><p class="study-help">Autoavaliação: compare sua resposta com a referência.<br><span class="hide-small"><kbd class="keyboard-key">Espaço</kbd> revelar · <kbd class="keyboard-key">1</kbd> revisar · <kbd class="keyboard-key">2</kbd> lembrei</span></p><div class="row spread">${button(`${icon('back')} Anterior`, 'previous', review.index === 0 ? 'disabled' : '')}${button('Ver material', 'view-source')}</div>${annotation('A resposta começa oculta para estimular a tentativa de recuperação. Os resultados registram percepção do estudante, não correção por IA.')}</section><aside class="study-aside">${timerPanel()}<section class="panel"><span class="eyebrow">NESTA SESSÃO</span><div class="mini-stats"><div class="row"><span>Lembrei</span><strong>${remembered}</strong></div><div class="row"><span>Preciso revisar</span><strong>${again}</strong></div></div></section></aside></div>`;
}
function results() {
  if (!lastResult) return home();
  const { total, remembered, again, title, cards } = lastResult;
  return `<section class="results"><div class="results-intro"><div class="complete-mark">${icon('check')}</div><span class="eyebrow">04 / RETOMAR</span><h1>Sessão concluída.</h1><p class="muted">${escapeHTML(title)}<br>Um passo de cada vez, no seu ritmo.</p></div><div class="stats-grid"><div class="stat"><strong>${total}</strong><span>Cartões revisados</span></div><div class="stat"><strong>${remembered}</strong><span>Marquei “lembrei”</span></div><div class="stat"><strong>${again}</strong><span>Preciso revisar</span></div></div>${note('Estes números são sua autoavaliação. Não representam nota, acurácia ou comprovação de domínio do conteúdo.')}<section class="panel" style="margin-top:24px"><div class="section-head"><h2>${again ? 'Vale retomar estes pontos' : 'Todos os cartões foram marcados como lembrados'}</h2></div>${again ? cards.map((c) => `<div class="review-item">${icon('reset')}<p>${escapeHTML(c.q)}</p></div>`).join('') : '<p class="small muted" style="margin-bottom:0">Você pode repetir a sessão ou voltar ao conjunto em outro momento.</p>'}</section><div class="results-actions">${again ? button(`Revisar ${again} novamente`, 'retry-again', '', true) : button('Repetir sessão', 'retry-all', '', true)}${button('Meus estudos', 'navigate', 'data-screen="library"')}</div></section>`;
}
function filteredDecks() {
  return decks.filter(
    (d) =>
      (filter === 'all' || (filter === 'mine' ? !d.example : d.example)) &&
      d.title
        .toLocaleLowerCase('pt-BR')
        .includes(search.toLocaleLowerCase('pt-BR')),
  );
}
function libraryGrid() {
  const ds = filteredDecks();
  return ds.length
    ? `<div class="decks-grid">${ds.map((d) => deckCard(d)).join('')}</div>`
    : `<div class="empty">${icon('book')}<h2>${search ? 'Nenhum conjunto encontrado' : 'Nenhum conjunto por aqui'}</h2><p>${search ? 'Tente outro nome ou remova os filtros.' : 'Crie um conjunto a partir do seu material ou explore os exemplos.'}</p>${button('Criar novo estudo', 'new', '', true)}</div>`;
}
function library() {
  return `<div class="page-head"><span class="eyebrow">SUA BIBLIOTECA</span><div class="row spread wrap"><h1>Meus estudos.</h1>${button(`${icon('plus')} Novo estudo`, 'new', '', true)}</div><p>Seus conjuntos, prontos para a próxima revisão.</p></div><div class="searchbar"><div class="searchfield">${icon('search')}<label for="deck-search" class="skip-link">Buscar conjuntos por nome</label><input id="deck-search" placeholder="Buscar conjuntos por nome" type="search" value="${escapeHTML(search)}"></div></div><div class="filter-row" aria-label="Filtrar conjuntos">${[
    ['all', 'Todos'],
    ['mine', 'Meus conjuntos'],
    ['examples', 'Exemplos'],
  ]
    .map(
      ([f, l]) =>
        `<button class="filter ${filter === f ? 'active' : ''}" data-action="filter" data-filter="${f}" aria-pressed="${filter === f}">${l}</button>`,
    )
    .join(
      '',
    )}</div><div id="library-grid">${libraryGrid()}</div><p class="footer-note">Armazenamento local: os dados não são sincronizados entre dispositivos.</p>${annotation('Busca e filtros ajudam a localizar o conjunto sem depender da conversa que o originou.')}`;
}
function progress() {
  const total = sessions.reduce((a, s) => a + s.total, 0);
  const remembered = sessions.reduce((a, s) => a + s.remembered, 0);
  return `<section class="progress-overview"><div class="page-head"><span class="eyebrow">SEU PERCURSO</span><h1>Um pouco a cada sessão.</h1><p>Acompanhe o que você revisou neste navegador.</p></div><div class="stats-grid"><div class="stat"><strong>${sessions.length}</strong><span>Sessões concluídas</span></div><div class="stat"><strong>${total}</strong><span>Revisões de cartões</span></div><div class="stat"><strong>${remembered}</strong><span>Marcações “lembrei”</span></div></div>${note('Um mesmo cartão pode ser contado em sessões diferentes. Os dados registram prática e autoavaliação; não medem aprendizagem.')}<div class="section-head" style="margin-top:30px"><h2>Histórico de sessões</h2></div>${
    sessions.length
      ? `<section class="panel">${sessions
          .slice()
          .reverse()
          .slice(0, 20)
          .map(
            (s) =>
              `<div class="session-row"><div><p class="strong">${escapeHTML(s.title)}</p><p class="muted">${new Date(s.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p></div><span>${s.remembered} lembrei / ${s.total} revisados</span></div>`,
          )
          .join('')}</section>`
      : `<div class="empty">${icon('chart')}<h2>Sua primeira revisão ainda vem aí</h2><p>Ao concluir uma sessão, o resumo aparece aqui.</p>${button('Escolher um conjunto', 'navigate', 'data-screen="library"', true)}</div>`
  }</section>`;
}

function openDialog(title, content) {
  dialog.innerHTML = `<div class="dialog-head"><h2 id="dialog-title">${title}</h2><button class="icon-btn" data-action="close-dialog" aria-label="Fechar janela">${icon('close')}</button></div><div class="dialog-body">${content}</div>`;
  if (!dialog.open) dialog.showModal();
}
function showMap() {
  openDialog(
    'Mapa do protótipo',
    `<p class="small muted">Explore as telas do fluxo. O estudo e a prévia usam um conjunto de exemplo quando necessário.</p><div class="map-list">${[
      ['login', 'Acesso demonstrativo'],
      ['home', 'Início / chat'],
      ['config', 'Configurar geração'],
      ['preview', 'Conferir e editar cartões'],
      ['study', 'Sessão de revisão'],
      ['results', 'Resultado da sessão'],
      ['library', 'Biblioteca de estudos'],
      ['progress', 'Progresso e histórico'],
    ]
      .map(
        ([s, l], i) =>
          `<button data-action="map-go" data-screen="${s}"><span>${String(i + 1).padStart(2, '0')}</span>${l}<span class="spacer">↗</span></button>`,
      )
      .join(
        '',
      )}</div><label class="checklabel"><input id="annotations" type="checkbox" ${annotated ? 'checked' : ''}>Mostrar anotações de usabilidade nas telas</label><div class="divider"></div><p class="small muted">Protótipo navegável de baixa fidelidade, com a paleta lilás, azul suave e creme da identidade Clareia. Login, anexos e geração por IA são simulações. Temporizador, edição e autoavaliação funcionam no navegador.</p><div class="stack"><a class="btn full" href="mobile.html" target="_blank" rel="noopener">Ver em largura de celular ↗</a><a class="btn full" href="clareia-prototipo-a3.zip" download>Baixar HTML, CSS, JS e documentação</a></div>`,
  );
}
function fillSample(topic) {
  draft.topic = topic;
  draft.title = topics[topic].title;
  draft.file = null;
  draft.text =
    `Material de exemplo — ${topics[topic].label}\n\n` +
    topics[topic].cards
      .slice(0, 5)
      .map(([q, a]) => `${q}\n${a}`)
      .join('\n\n');
  render();
  $('#source-text')?.focus();
}
function ensureWorking() {
  if (!working)
    working = structuredClone(
      decks[0] || {
        id: uid(),
        title: topics.usabilidade.title,
        topic: 'usabilidade',
        example: true,
        cards: makeCards('usabilidade', 5),
        sourceName: topics.usabilidade.source,
        sourceText: 'Material demonstrativo.',
      },
    );
}
function saveWorking() {
  working.title = working.title.trim() || 'Meu conjunto';
  working.example = false;
  const i = decks.findIndex((d) => d.id === working.id);
  const copy = structuredClone(working);
  if (i >= 0) decks[i] = copy;
  else decks.unshift(copy);
  persist();
  return copy;
}
function beginReview(deck, cards = deck.cards) {
  review = {
    deck: structuredClone(deck),
    cards: structuredClone(cards),
    index: 0,
    revealed: false,
    ratings: new Array(cards.length).fill(null),
    startedAt: Date.now(),
  };
  go('study');
}
function rate(value) {
  if (!review?.revealed) return;
  review.ratings[review.index] = value;
  if (review.index < review.cards.length - 1) {
    review.index++;
    review.revealed = false;
    render();
  } else finishReview();
}
function finishReview() {
  const remembered = review.ratings.filter((r) => r === 'remember').length;
  const cards = review.cards.filter((c, i) => review.ratings[i] === 'again');
  lastResult = {
    deck: structuredClone(review.deck),
    deckId: review.deck.id,
    title: review.deck.title,
    total: review.cards.length,
    remembered,
    again: cards.length,
    cards,
    date: new Date().toISOString(),
  };
  sessions.push({
    id: uid(),
    deckId: lastResult.deckId,
    title: lastResult.title,
    total: lastResult.total,
    remembered,
    again: cards.length,
    date: lastResult.date,
  });
  if (sessions.length > 200) sessions = sessions.slice(-200);
  persist();
  go('results');
}
function editCard(id = null) {
  ensureWorking();
  const c = id ? working.cards.find((x) => x.id === id) : null;
  editTarget = id;
  openDialog(
    c ? 'Editar cartão' : 'Novo cartão',
    `<form id="card-form" class="form-grid"><div><label for="card-q">Pergunta</label><textarea id="card-q" name="q" maxlength="1000" required>${escapeHTML(c?.q || '')}</textarea></div><div><label for="card-a">Resposta de referência</label><textarea id="card-a" name="a" maxlength="3000" required>${escapeHTML(c?.a || '')}</textarea></div><p id="card-error" class="error" role="alert"></p><div class="form-actions">${button('Cancelar', 'close-dialog', 'type="button"')}<button class="btn primary" type="submit">Salvar cartão</button></div></form>`,
  );
}
function formatTime(s) {
  s = Math.max(0, Math.ceil(s));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function pauseTimer() {
  if (timer.running)
    timer.remaining = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
  timer.running = false;
}
function updateTimer() {
  if (!$('#timer-digits')) return;
  $('#timer-digits').textContent = formatTime(timer.remaining);
  $('#timer-label').textContent = timer.running
    ? timer.mode === 'focus'
      ? 'Tempo de foco em andamento'
      : 'Hora de descansar'
    : 'Você define o seu ritmo';
  $('#timer-toggle').textContent = timer.running ? 'Pausar' : 'Iniciar';
  $('#timer-summary').textContent =
    `${timer.rounds} ${timer.rounds === 1 ? 'período concluído' : 'períodos concluídos'} · uso opcional`;
}
setInterval(() => {
  if (!timer.running) return;
  timer.remaining = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
  if (timer.remaining === 0) {
    timer.running = false;
    timer.rounds++;
    toast(
      timer.mode === 'focus'
        ? 'Período de foco concluído. Você pode iniciar uma pausa.'
        : 'Pausa concluída. Continue quando quiser.',
    );
  }
  updateTimer();
}, 250);

const actions = {
  // Entra na demonstração sem exigir nome ou e-mail.
  guest: () => setUser(),
  // Abre uma das telas principais indicada pelo botão.
  navigate: (el) => go(el.dataset.screen),
  // Limpa o rascunho; se há uma prévia aberta, pede confirmação antes de descartá-la.
  new: () => {
    if (working && screen === 'preview') {
      openDialog(
        'Começar outro estudo?',
        `<p>As alterações não salvas desta prévia serão descartadas.</p><div class="form-actions">${button('Continuar editando', 'close-dialog')}${button('Começar novo', 'confirm-new', '', true)}</div>`,
      );
      return;
    }
    draft = { text: '', file: null, topic: 'usabilidade', title: '', count: 5 };
    working = null;
    go('home');
  },
  // Confirma que o rascunho anterior pode ser descartado e começa um novo.
  'confirm-new': () => {
    dialog.close();
    draft = { text: '', file: null, topic: 'usabilidade', title: '', count: 5 };
    working = null;
    go('home');
  },
  // Encerra a identificação local da demonstração e volta ao acesso.
  logout: () => {
    pauseTimer();
    user = null;
    try {
      sessionStorage.removeItem('revisa-demo-user');
    } catch {}
    go('login');
  },
  // Expande ou recolhe a navegação usada em telas estreitas.
  menu: () => {
    menuOpen = !menuOpen;
    render();
  },
  // Abre o mapa de telas e as opções de anotação.
  map: showMap,
  // Fecha o diálogo ativo.
  'close-dialog': () => dialog.close(),
  // Permite navegar pelo mapa e prepara dados de exemplo quando uma tela depende deles.
  'map-go': (el) => {
    const s = el.dataset.screen;
    dialog.close();
    if (!user && s !== 'login') user = { name: 'Aluno demonstração' };
    if (s === 'config' && !draft.text && !draft.file) {
      draft.text = 'Exemplo de material para testar o fluxo de geração.';
      draft.title = topics[draft.topic].title;
    }
    if (s === 'preview') ensureWorking();
    if (s === 'study') {
      ensureWorking();
      beginReview(working);
      return;
    }
    if (s === 'results' && !lastResult) {
      toast('Conclua uma revisão para ver seus próprios resultados.');
      ensureWorking();
      beginReview(working);
      return;
    }
    go(s);
  },
  // Preenche o formulário inicial com um material demonstrativo do tema escolhido.
  sample: (el) => fillSample(el.dataset.topic),
  // Abre o seletor nativo de arquivos escondido no formulário.
  attach: () => $('#file-input')?.click(),
  // Remove do rascunho o arquivo representativo selecionado.
  'remove-file': () => {
    draft.file = null;
    render();
  },
  // Volta da configuração para a entrada do material.
  'back-home': () => go('home'),
  // Cancela a espera da geração simulada e retorna à configuração.
  'cancel-generation': () => go('config'),
  // Abre o diálogo para cadastrar um cartão vazio.
  'add-card': () => editCard(),
  // Abre o diálogo preenchido com o cartão selecionado.
  'edit-card': (el) => editCard(el.dataset.id),
  // Exclui um cartão, mas permite desfazer; mantém ao menos um cartão no conjunto.
  'delete-card': (el) => {
    if (working.cards.length === 1) {
      toast('Mantenha pelo menos um cartão no conjunto.');
      return;
    }
    const index = working.cards.findIndex((c) => c.id === el.dataset.id);
    if (index < 0) return;
    const [removed] = working.cards.splice(index, 1);
    render();
    toast('Cartão removido.', () => {
      working.cards.splice(index, 0, removed);
      render();
    });
  },
  // Executa a reversão guardada pelo último aviso que oferece “Desfazer”.
  undo: () => {
    const fn = undoAction;
    $('#toast').hidden = true;
    undoAction = null;
    fn?.();
  },
  // Abre o formulário de renomeação da prévia.
  rename: () => {
    openDialog(
      'Nome do conjunto',
      `<form id="rename-form"><label for="rename-title">Nome</label><input id="rename-title" name="title" required maxlength="100" value="${escapeHTML(working.title)}"><div class="form-actions">${button('Cancelar', 'close-dialog', 'type="button"')}<button class="btn primary" type="submit">Salvar nome</button></div></form>`,
    );
  },
  // Salva as edições e leva à biblioteca sem iniciar revisão.
  'save-only': () => {
    saveWorking();
    go('library');
    toast('Conjunto salvo neste navegador.');
  },
  // Salva as edições e inicia uma sessão com o conjunto salvo.
  'save-study': () => {
    const deck = saveWorking();
    beginReview(deck);
    toast('Conjunto salvo. Boa revisão!');
  },
  // Começa a revisar o conjunto selecionado na biblioteca.
  'open-deck': (el) => {
    const d = decks.find((x) => x.id === el.dataset.id);
    if (d) beginReview(d);
  },
  // Copia o conjunto para edição; exemplos viram uma cópia própria com novo ID.
  'edit-deck': (el) => {
    const d = decks.find((x) => x.id === el.dataset.id);
    if (!d) return;
    working = structuredClone(d);
    if (d.example) {
      working.id = uid();
      working.example = false;
      working.title = `${d.title} — minha cópia`;
    }
    go('preview');
  },
  // Pede confirmação antes de remover um conjunto salvo.
  'delete-deck': (el) => {
    const d = decks.find((x) => x.id === el.dataset.id);
    if (!d) return;
    openDialog(
      'Excluir conjunto?',
      `<p>O conjunto <strong>${escapeHTML(d.title)}</strong> será removido deste navegador.</p><div class="form-actions">${button('Cancelar', 'close-dialog')}${button('Excluir conjunto', 'confirm-delete-deck', `data-id="${escapeHTML(d.id)}"`, true)}</div>`,
    );
  },
  // Remove o conjunto confirmado e oferece desfazer a operação.
  'confirm-delete-deck': (el) => {
    const i = decks.findIndex((x) => x.id === el.dataset.id);
    if (i < 0) return;
    const [d] = decks.splice(i, 1);
    persist();
    dialog.close();
    render();
    toast('Conjunto excluído.', () => {
      decks.splice(i, 0, d);
      persist();
      render();
    });
  },
  // Troca o filtro de conjuntos e redesenha a biblioteca.
  filter: (el) => {
    filter = el.dataset.filter;
    render();
  },
  // Mostra o verso do cartão atual.
  reveal: () => {
    if (!review) return;
    review.revealed = true;
    render();
  },
  // Registra “Preciso revisar” para o cartão atual.
  'rate-again': () => rate('again'),
  // Registra “Lembrei” para o cartão atual.
  'rate-remember': () => rate('remember'),
  // Volta um cartão sem manter a resposta aberta.
  previous: () => {
    if (review.index > 0) {
      review.index--;
      review.revealed = false;
      render();
    }
  },
  // Confirma encerramento antes do último cartão; sessão incompleta não vai ao histórico.
  'end-review': () =>
    openDialog(
      'Encerrar esta revisão?',
      `<p>O conjunto continuará salvo. Esta sessão incompleta não será adicionada ao histórico.</p><div class="form-actions">${button('Continuar estudando', 'close-dialog')}${button('Encerrar sessão', 'confirm-end', '', true)}</div>`,
    ),
  // Encerra a sessão incompleta e retorna à biblioteca.
  'confirm-end': () => {
    dialog.close();
    pauseTimer();
    go('library');
  },
  // Mostra as informações de origem guardadas com o conjunto, sem extrair PDF nem usar IA.
  'view-source': () =>
    openDialog(
      'Material da revisão',
      `<p class="small strong source-name">${escapeHTML(review.deck.sourceName || 'Cartões de exemplo')}</p><p class="small muted">${escapeHTML(review.deck.sourceText || 'Este conjunto utiliza exemplos preparados para testar a interface.')}</p>${review.deck.instructions ? `<div class="divider"></div><p class="small"><strong>Suas observações:</strong><br>${escapeHTML(review.deck.instructions)}</p>` : ''}${note('Este protótipo não extrai texto de PDFs e não gera perguntas por IA. Os cartões de exemplo podem ser editados manualmente.')}`,
    ),
  // Repete somente cartões que receberam a marcação de revisão.
  'retry-again': () => beginReview(lastResult.deck, lastResult.cards),
  // Repete todos os cartões do conjunto da sessão concluída.
  'retry-all': () => beginReview(lastResult.deck),
  // Inicia ou pausa o temporizador e atualiza o instante previsto para o fim.
  'timer-toggle': () => {
    if (timer.running) pauseTimer();
    else {
      if (timer.remaining <= 0) timer.remaining = timer[timer.mode] * 60;
      timer.endAt = Date.now() + timer.remaining * 1000;
      timer.running = true;
    }
    updateTimer();
  },
  // Reinicia o modo atual com sua duração configurada.
  'timer-reset': () => {
    timer.running = false;
    timer.remaining = timer[timer.mode] * 60;
    updateTimer();
  },
  // Muda entre foco e pausa, parando o relógio e carregando a duração correspondente.
  'timer-mode': (el) => {
    if (el.dataset.mode === timer.mode) return;
    timer.running = false;
    timer.mode = el.dataset.mode;
    timer.remaining = timer[timer.mode] * 60;
    render();
  },
  // Abre o formulário de configuração das durações de foco e pausa.
  'timer-settings': () =>
    openDialog(
      'Ajustar Pomodoro',
      `<form id="timer-form" class="form-grid"><div><label for="focus-minutes">Tempo de foco (minutos)</label><input id="focus-minutes" name="focus" type="number" min="1" max="120" value="${timer.focus}" required></div><div><label for="break-minutes">Tempo de pausa (minutos)</label><input id="break-minutes" name="break" type="number" min="1" max="60" value="${timer.break}" required></div><p class="small muted">Salvar reinicia o período atual. A pausa começa quando você escolher.</p><button class="btn primary" type="submit">Salvar tempos</button></form>`,
    ),
};

document.addEventListener('click', (event) => {
  // O clique pode vir do próprio botão ou de um ícone dentro dele; `closest` encontra o botão externo.
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const fn = actions[el.dataset.action];
  if (fn) {
    event.preventDefault();
    fn(el);
  }
});
document.addEventListener('input', (event) => {
  // Guarda o texto enquanto a pessoa digita e limpa o erro de entrada anterior.
  if (event.target.id === 'source-text') {
    draft.text = event.target.value;
    $('#source-error').textContent = '';
  }
  // Atualiza os resultados da busca sem redesenhar o restante da biblioteca.
  if (event.target.id === 'deck-search') {
    search = event.target.value;
    $('#library-grid').innerHTML = libraryGrid();
  }
});
document.addEventListener('change', async (event) => {
  // A opção do mapa controla a visibilidade das notas de UX.
  if (event.target.id === 'annotations') {
    annotated = event.target.checked;
    document.body.classList.toggle('annotated', annotated);
  }
  // O seletor de arquivo valida extensão, tamanho e conteúdo vazio antes de aceitar o anexo.
  if (event.target.id === 'file-input') {
    const file = event.target.files?.[0];
    if (!file) return;
    const error = $('#source-error');
    if (!/\.(pdf|txt)$/i.test(file.name)) {
      error.textContent = 'Formato não aceito. Escolha um arquivo PDF ou TXT.';
      event.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      error.textContent = 'O arquivo excede 10 MB. Escolha um arquivo menor.';
      event.target.value = '';
      return;
    }
    if (!file.size) {
      error.textContent = 'O arquivo está vazio. Escolha outro material.';
      event.target.value = '';
      return;
    }
    draft.file = { name: file.name, size: file.size };
    if (/\.txt$/i.test(file.name)) {
      try {
        const text = await file.text();
        draft.text = text.slice(0, 40000);
        render();
        toast('Texto carregado. A geração continua sendo demonstrativa.');
      } catch {
        draft.file = null;
        error.textContent =
          'Não foi possível ler o arquivo. Tente colar o texto.';
      }
    } else {
      render();
      toast('PDF anexado para demonstração. O conteúdo não será lido.');
    }
  }
});
document.addEventListener('submit', (event) => {
  const form = event.target;
  // Os formulários são tratados na página atual, sem navegação ou recarga do navegador.
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const data = new FormData(form);
  // Login de demonstração guarda apenas o nome e segue para a tela inicial.
  if (form.id === 'login-form') {
    setUser(data.get('name'));
  }
  // A entrada precisa ter texto ou arquivo; sem ambos, mostra orientação e mantém o foco no campo.
  if (form.id === 'source-form') {
    draft.text = String(data.get('source') || '');
    if (!draft.text.trim() && !draft.file) {
      $('#source-error').textContent =
        'Cole um texto, anexe um arquivo ou escolha um dos exemplos para continuar.';
      $('#source-text').focus();
      return;
    }
    if (!draft.title)
      draft.title = draft.file
        ? draft.file.name.replace(/\.(pdf|txt)$/i, '')
        : topics[draft.topic].title;
    go('config');
  }
  // Guarda as opções e inicia uma espera curta antes de montar cartões fixos do tema.
  if (form.id === 'config-form') {
    draft.title = String(data.get('title')).trim();
    if (!draft.title) {
      $('#deck-title').setCustomValidity('Informe um nome para o conjunto.');
      $('#deck-title').reportValidity();
      $('#deck-title').addEventListener(
        'input',
        (e) => e.target.setCustomValidity(''),
        { once: true },
      );
      return;
    }
    draft.count = Number(data.get('count'));
    draft.topic = String(data.get('topic'));
    draft.instructions = String(data.get('instructions') || '').trim();
    go('generating');
    const ticket = generationTicket;
    setTimeout(() => {
      if (ticket !== generationTicket || screen !== 'generating') return;
      working = {
        id: uid(),
        title: draft.title,
        topic: draft.topic,
        cards: makeCards(draft.topic, draft.count),
        example: false,
        sourceName: draft.file?.name || 'Texto colado',
        sourceText: draft.text.slice(0, 3000),
        instructions: draft.instructions,
        createdAt: new Date().toISOString(),
      };
      go('preview');
    }, 1100);
  }
  // Valida e salva um cartão novo ou atualiza o cartão escolhido para edição.
  if (form.id === 'card-form') {
    const q = String(data.get('q')).trim(),
      a = String(data.get('a')).trim();
    if (!q || !a) {
      $('#card-error').textContent =
        'Preencha a pergunta e a resposta com conteúdo.';
      return;
    }
    if (editTarget) {
      const c = working.cards.find((x) => x.id === editTarget);
      if (c) {
        c.q = q;
        c.a = a;
      }
    } else working.cards.push({ id: uid(), q, a });
    dialog.close();
    render();
    toast('Cartão atualizado. Salve o conjunto para manter as alterações.');
  }
  // Atualiza o título do conjunto que está sendo editado.
  if (form.id === 'rename-form') {
    const title = String(data.get('title')).trim();
    if (!title) return;
    working.title = title;
    dialog.close();
    render();
  }
  // Aplica as durações do Pomodoro e reinicia o tempo do modo atual.
  if (form.id === 'timer-form') {
    timer.focus = Number(data.get('focus'));
    timer.break = Number(data.get('break'));
    timer.running = false;
    timer.remaining = timer[timer.mode] * 60;
    dialog.close();
    updateTimer();
    toast('Tempos do Pomodoro atualizados.');
  }
});
document.addEventListener('keydown', (event) => {
  // Atalhos só funcionam na revisão e quando o foco não está em um controle ou campo de texto.
  if (
    screen !== 'study' ||
    dialog.open ||
    /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(event.target.tagName) ||
    event.repeat ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  )
    return;
  // Espaço revela; 1 e 2 registram a autoavaliação depois que o verso aparece.
  if (event.code === 'Space' && !review.revealed) {
    event.preventDefault();
    actions.reveal();
  }
  if (event.key === '1' && review.revealed) {
    event.preventDefault();
    rate('again');
  }
  if (event.key === '2' && review.revealed) {
    event.preventDefault();
    rate('remember');
  }
});
dialog.addEventListener('click', (event) => {
  // Fecha ao clicar na área externa escurecida, sem fechar ao clicar no conteúdo do diálogo.
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (
    event.clientX < r.left ||
    event.clientX > r.right ||
    event.clientY < r.top ||
    event.clientY > r.bottom
  )
    dialog.close();
});
// Primeira renderização depois que as funções e os eventos já estão preparados.
render();
