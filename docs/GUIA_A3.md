# Guia para a A3 — decisões e validação do protótipo

## Contexto

UC: Usabilidade, Desenvolvimento Web e Mobile, Anhembi Morumbi, 2026/2.

Edital de referência: https://mediacdns3.ulife.com.br/PAT/Upload/5699291/edital_A3_usabilidade_web_mobile_2026_20260927203714.pdf

Proposta: ajudar estudantes a transformar materiais da disciplina em flashcards para revisão. A hipótese de que preparar boas perguntas consome tempo precisa ser investigada com usuários reais; não é apresentada como um resultado de pesquisa da equipe.

## Escopo de baixa fidelidade

O objetivo é testar arquitetura, sequência de tarefas, compreensão de rótulos e localização de ações. A tipografia de sistema, as bordas simples e a organização das telas permitem avaliar a estrutura. A paleta lilás, azul suave e creme acompanha a logo, com tons escuros para texto e ações principais. A logo Clareia — Método de estudo identifica a proposta; ela aparece completa no acesso e na barra lateral, e como símbolo acompanhado do nome no cabeçalho mobile. A presença da marca não altera o escopo demonstrativo de baixa fidelidade.

Fluxo principal: acesso → entrada de material → configuração → processamento demonstrativo → conferência/edição → revisão → resultado → biblioteca.

Fluxos alternativos: entrada inválida, cancelar processamento, remover anexo, adicionar cartão, desfazer exclusão, buscar conjunto, biblioteca sem resultados, encerrar revisão incompleta e repetir itens difíceis.

## Relação com o edital

| Item | Evidência presente | Trabalho ainda necessário |
| --- | --- | --- |
| Investigação de problema real | Hipótese e proposta descritas | Entrevistar/observar usuário real, registrar dificuldades e processo atual |
| Fluxo, wireframes e protótipo | Telas navegáveis e mapa de telas | Ajustar às evidências da equipe e registrar decisões |
| HTML/CSS/JS e interação | Arquivos separados, formulários, manipulação de DOM e dados | A equipe explicar/modificar e evoluir a implementação |
| Mobile First e responsividade | Base mobile, media queries e visualização a 390 px | Testar no celular e com usuários |
| Usabilidade e acessibilidade | Rótulos, foco, feedback, reversão de exclusão e controles de teclado | Avaliar com usuários e tecnologias assistivas conforme contexto |
| Validação | Roteiro abaixo | Executar com pelo menos um usuário real e registrar resultados |
| Duas alterações pela validação | Nenhuma alteração de usuário alegada | Implementar e evidenciar pelo menos duas alterações da versão final decorrentes da validação |
| Git e autoria | Código preparado para versionamento | Construir histórico real da equipe e demonstrar domínio |
| Registro de IA | Registro inicial abaixo | Confirmar uso pela equipe e atualizar ferramenta, finalidade, artefatos e decisões |

O protótipo sozinho não atende a todos os itens dos dois entregáveis. O primeiro também exige PDF e apresentação; o segundo exige implementação, links, histórico e validação.

## Decisões de interface

| Decisão | Justificativa de usabilidade |
| --- | --- |
| Ações de anexar e colar visíveis | Reconhecimento: o estudante não precisa descobrir um comando de chat |
| Materiais de exemplo identificados | Permitem testar o fluxo e deixam clara a origem demonstrativa dos dados |
| Prévia editável antes da revisão | Controle do usuário e possibilidade de corrigir conteúdo |
| Nome, quantidade e tema explícitos | Reduzem ambiguidade sobre o que será criado |
| Resposta inicialmente oculta | Permite uma tentativa de recuperação antes de consultar a referência |
| “Lembrei” e “Preciso revisar” | Comunicam autoavaliação sem simular uma correção objetiva |
| Biblioteca separada da conversa | Facilita encontrar e retomar conjuntos |
| Pomodoro opcional | Evita bloquear o estudo por uma ferramenta auxiliar |
| Feedback para entrada vazia e arquivo inválido | Explica o problema e como recuperar a tarefa |
| Exclusão reversível e confirmação para conjunto | Reduz perda acidental de trabalho |
| Controles identificados e foco visível | Apoiam uso por teclado e compreensão da ação |

## Referências funcionais

- NotebookLM: relação entre materiais e atividades de estudo — https://notebooklm.google.com/
- RemNote: configuração, conferência e edição de cartões — https://www.remnote.com/
- Knowt: assistência à criação de material de estudo — https://knowt.com/
- Quizlet: sessão de flashcards — https://quizlet.com/
- Pomofocus: temporizador de foco e pausa — https://pomofocus.io/

São referências de comportamento. O protótipo não reproduz marcas, identidade visual ou código desses serviços.

## Roteiro de investigação antes do teste

Converse com um estudante do público pretendido. Registre data, contexto e autorização para o registro. Evite perguntas que sugiram que a plataforma já é a melhor solução.

1. Conte como você estudou para sua última prova.
2. Quais materiais você usou e como os organizou?
3. Em qual parte gastou mais tempo ou sentiu dificuldade?
4. Como identifica o que precisa revisar novamente?
5. Você já criou perguntas ou flashcards? Como foi?
6. Em qual dispositivo costuma estudar e em quais situações?

Separe relatos observados de hipóteses da equipe. Não invente respostas, personas ou métricas.

## Roteiro de teste do protótipo

Explique que a interface está sendo avaliada e que o participante pode pensar em voz alta. Informe que acesso e IA são simulados. Use conteúdo de exemplo. Evite orientar onde clicar durante a execução.

### Tarefa 1 — Criar

“Você vai revisar Usabilidade para uma prova. Use o exemplo disponível para preparar um conjunto de cinco cartões e dê um nome que consiga reconhecer depois.”

Observar: identifica o material de exemplo? Encontra a criação? Entende as opções e a simulação? Conclui sem ajuda?

### Tarefa 2 — Ajustar

“Uma resposta precisa de uma explicação adicional. Edite um cartão, adicione uma pergunta sua e salve o conjunto.”

Observar: encontra edição e adição? Entende quando as alterações ficam salvas? Consegue recuperar uma exclusão acidental?

### Tarefa 3 — Estudar

“Revise os cartões. Marque pelo menos um como algo que precisa retomar. Ao terminar, encontre esse cartão para praticar novamente.”

Observar: tenta responder antes de revelar? Entende as marcações? Encontra a retomada? Confunde autoavaliação com nota?

### Tarefa 4 — Retomar e usar o tempo

“Volte aos seus estudos e encontre o conjunto salvo. Comece outra sessão e configure cinco minutos de foco.”

Observar: encontra a biblioteca e a busca? Localiza o Pomodoro? Consegue iniciar, pausar e reiniciar?

Repita a tarefa principal em celular ou na moldura mobile e registre limitações do teste simulado.

## Registro a preencher pela equipe

| Participante / dispositivo | Tarefa | Concluiu? | Tempo aproximado | Erros / hesitações | Ajuda necessária | Comentário do participante |
| --- | --- | --- | --- | --- | --- | --- |
| A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |

| Evidência observada | Problema identificado | Mudança realizada | Justificativa | Como verificar novamente |
| --- | --- | --- | --- | --- |
| A preencher após teste | A preencher | A preencher | A preencher | A preencher |
| A preencher após teste | A preencher | A preencher | A preencher | A preencher |

As duas linhas não representam melhorias já realizadas. Preencha apenas depois de observar o uso e executar as mudanças.

## Registro inicial de uso de IA

- Ferramenta: ChatGPT / Codex.
- Data: 02/11/2026.
- Finalidade: apoiar a concepção e gerar uma base navegável de baixa fidelidade para avaliação pela equipe.
- Artefatos afetados: HTML, CSS, JavaScript, exemplos demonstrativos e documentação de apoio.
- Decisão proposta: usar a base como protótipo, identificar simulações e adaptar a solução a partir de investigação e testes reais.
- Validação da equipe: pendente. Os integrantes devem revisar o conteúdo, compreender a implementação e registrar decisões próprias.
- Limite: geração integral por prompt, isoladamente, não comprova aprendizagem. O edital prevê explicação e modificação de código por integrantes.

## Próxima etapa técnica

Após validar o fluxo, decidir integração real de IA e autenticação, extração de conteúdo de PDF, persistência com contas e critérios de geração/revisão. O escopo final deve ser compatível com o tempo e com o domínio técnico da equipe. Nenhum desses serviços está conectado neste protótipo.
