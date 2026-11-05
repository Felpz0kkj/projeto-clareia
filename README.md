# Clareia — protótipo de baixa fidelidade / A3

Plataforma web de flashcards com a identidade Clareia — Método de estudo. Este protótipo demonstra a navegação; não é a aplicação final com autenticação e inteligência artificial.

## Executar

Abra `dist/index.html` no navegador. Não há instalação nem dependências externas. Se o navegador restringir armazenamento em arquivos locais, use um servidor estático:

```bash
python3 -m http.server 8000 --directory dist
```

Acesse `http://localhost:8000`. O arquivo `dist/mobile.html` mostra a mesma aplicação dentro de uma moldura com largura aproximada de 390 px.

## Testar o fluxo principal

1. Entre com um nome e um e-mail fictícios ou escolha “Explorar como visitante”.
2. Na tela inicial de chat, clique em “Exemplo de Usabilidade” ou cole texto/anexe um arquivo.
3. Clique em “Criar flashcards”. Dê nome ao conjunto e selecione 5 ou 10 cartões.
4. Escolha o tema da demonstração. Ele determina os exemplos; o documento não é interpretado.
5. Clique em “Gerar demonstração”. Confira, edite, adicione ou exclua cartões.
6. Clique em “Salvar e estudar”. Leia a pergunta antes de revelar a resposta.
7. Marque “Preciso revisar” ou “Lembrei”. As marcações representam autoavaliação.
8. Confira o resumo, retome os cartões marcados e encontre o conjunto em “Meus estudos”.

O “Mapa de telas”, na barra superior, permite navegar pelo protótipo e ativar anotações de usabilidade. A tela de resultado é acessada depois de concluir uma sessão para não inventar resultados.

## Funciona neste protótipo

- Navegação entre acesso, início, configuração, processamento, prévia, revisão, resultado, biblioteca e progresso.
- Validação de entrada vazia, tipo de arquivo, tamanho de até 10 MB e arquivo vazio.
- Leitura local de TXT, limitada a 40 mil caracteres. PDF é somente um anexo representativo.
- Carregamento de 5 ou 10 cartões de exemplo de Usabilidade, IA ou Redes.
- Edição, adição, exclusão com desfazer e renomeação de conjuntos.
- Autoavaliação por cartão, repetição dos itens difíceis e histórico de sessões concluídas.
- Busca e filtros na biblioteca; distinção entre exemplos e conjuntos próprios.
- Pomodoro com foco/pausa, iniciar/pausar/reiniciar e tempos configuráveis.
- Persistência dos conjuntos e histórico em `localStorage`; nome da sessão em `sessionStorage`.
- Layout Mobile First com media queries em 600, 1000 e 1400 px.
- Rótulos, foco visível, navegação por teclado, diálogos e mensagens de validação.

## Simulações e limites

- **Login:** não autentica; não há senha nem conta real. O e-mail fictício não é armazenado.
- **IA:** não existe integração ou chamada a um serviço. O tema selecionado carrega exemplos fixos. O texto, PDF e instruções não alteram automaticamente as perguntas.
- **PDF:** não há extração, OCR, envio ou armazenamento dos bytes do documento. Apenas nome e tamanho são usados para a demonstração visual.
- **Dados:** ficam no navegador, sem sincronização, controle de acesso ou banco de dados. Use materiais fictícios para testar.
- **Progresso:** mede prática e autoavaliação, não nota, aprendizagem comprovada ou acurácia.
- **Revisão espaçada:** não foi implementado algoritmo de agendamento. Retomar os itens difíceis ocorre na mesma sessão por escolha do usuário.
- **Responsividade:** a moldura mobile usa a largura real de um iframe para acionar as media queries. Não substitui testes em dispositivos reais.

## Arquivos e organização

- `dist/index.html`: estrutura inicial, metadados, contêiner principal e diálogo.
- `dist/styles.css`: paleta de cores da logo Clareia (lilás, azul suave e creme), enquadramento da logo, componentes e adaptações responsivas.
- `dist/app.js`: dados de exemplo, estado da aplicação, renderização de telas, eventos, armazenamento e temporizador.
- `dist/mobile.html`: moldura para inspecionar a aplicação em largura de celular.
- `docs/GUIA_A3.md`: relação com o edital, justificativas de interface, roteiro de validação e registro inicial de IA.

Não há framework, biblioteca, fonte externa ou compilação. A logo em PNG transparente está em `dist/assets/clareia-logo.png` e é enquadrada por CSS. As ilustrações e ícones são formas simples de CSS e SVG inline. A separação em três tecnologias facilita explicar e modificar cada responsabilidade.

## Como estudar o código

No JavaScript, comece por `topics` (exemplos), `render()` (tela atual), `actions` (ações dos botões), os eventos `submit` (formulários) e `persist()` (salvamento). `beginReview()`, `rate()` e `finishReview()` controlam a revisão. O temporizador usa `Date.now()` para calcular o tempo restante.

## Cuidados para a entrega

Este material apoia a etapa de prototipação do Entregável 1. O documento da equipe, a investigação com usuário real, a apresentação e a validação não estão automaticamente realizados. A equipe deve compreender o código, adaptá-lo às evidências coletadas e desenvolver a solução funcional para o Entregável 2.

O histórico técnico de publicação deste protótipo não representa evolução acadêmica da equipe. Não simule commits passados. Registre as próximas mudanças conforme forem feitas e documente o uso de IA.

## Entregáveis atualizados

- `docs/EXPLICACAO_DO_CODIGO.md`: guia didático de HTML, CSS, JavaScript e principais funções, com trechos reais para explicar na apresentação.
- `dist/clareia-prototipo-a3.zip`: pacote atualizado do código e documentação.
- `scripts/gerar_entregaveis.py`: gera o pacote e um HTML único com a logo incorporada. Execute `python scripts/gerar_entregaveis.py --saida ../entrega`.

O pacote mantém os arquivos separados para facilitar o estudo; o HTML único funciona sozinho. As chaves antigas de armazenamento foram preservadas para não perder os estudos salvos no mesmo navegador e endereço.

## Versão didática — 05/11/2026

O código de `dist/app.js` e `dist/styles.css` foi reorganizado com indentação e comentários em português. Estude pelos arquivos separados: HTML para a estrutura, CSS para a aparência e JavaScript para dados, ações e eventos. O arquivo `docs/EXPLICACAO_DO_CODIGO.md` orienta a leitura e explica os trechos principais. A execução no navegador continua sem instalação ou dependências externas.
