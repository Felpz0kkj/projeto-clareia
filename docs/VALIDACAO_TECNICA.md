# Verificação técnica do protótipo

Data: 02/11/2026. Verificação executada no navegador de desenvolvimento, sem participante externo.

## Verificado

- Acesso demonstrativo abre a tela inicial.
- Enviar material vazio apresenta uma orientação e mantém a tarefa na mesma tela.
- Exemplo de Usabilidade preenche a entrada; o formulário abre a configuração.
- Configuração com cinco cartões e nome personalizado chega à prévia com cinco itens.
- Editar uma resposta atualiza seu conteúdo; o texto alterado aparece no verso durante a revisão.
- Excluir um cartão e usar “Desfazer” restaura a quantidade anterior.
- “Salvar e estudar” inicia a revisão com o conjunto salvo.
- A resposta começa oculta; marcações ficam disponíveis depois de revelá-la.
- Uma sessão com quatro marcações “Lembrei” e uma “Preciso revisar” apresenta os totais 5 / 4 / 1.
- “Revisar 1 novamente” oferece somente o item marcado, permitindo concluir uma nova sessão.
- Depois de recarregar, a busca encontra o conjunto salvo com cinco cartões e duas sessões.
- Pomodoro aceita configuração de cinco minutos, inicia e pausa.
- Layout inicial e revisão inspecionados em desktop e em iframe de aproximadamente 390 px.
- Sintaxe de JavaScript validada com `node --check`.

## Limites desta verificação

Não foram realizados testes com usuários reais, leitor de tela ou dispositivos físicos. O envio de PDF/TXT tem validações implementadas, mas não houve nesta rodada upload por interface de arquivos de vários formatos e tamanhos. Os estados de falha devem ser incluídos na próxima avaliação. O protótipo não fornece autenticação, extração de PDF ou integração com IA.

Esta verificação técnica não substitui a investigação, a validação com usuário e as alterações exigidas pelo edital.


## Atualização Clareia — 03/11/2026

Verificação técnica pelo agente, sem participante externo.

- Conferidos a logo completa no acesso e na barra lateral desktop, e o símbolo com nome no cabeçalho mobile.
- Conferida a identificação “PROTÓTIPO A3 / BAIXA FIDELIDADE” em desktop e em larguras de 390 e 320 px; no celular, o botão do mapa usa o rótulo curto “Mapa”.
- A imagem original foi preservada. O enquadramento é feito por CSS.
- A cópia em HTML único foi aberta por servidor local e executou sem arquivos externos de estilo, script ou logo.
- No HTML único, entrada vazia exibiu validação; o exemplo de Usabilidade permitiu configurar cinco cartões, abrir a prévia, salvar e começar a revisão.
- Concluída uma sessão de teste com quatro marcações “Lembrei” e uma “Preciso revisar”. O resultado exibiu os totais 5 / 4 / 1.
- O guia de explicação foi revisado contra as funções reais, incluindo as diferenças entre a fonte separada e o HTML único.

As limitações de login, IA, PDF, armazenamento local e autoavaliação permanecem as descritas acima. Esta rodada não acrescenta testes com usuários, leitor de tela ou dispositivos físicos.


## Paleta da logo — 03/11/2026

- Aplicados lilás em botões, navegação e progresso; azul suave em destaques; creme em avisos; fundo rosado claro.
- Cores centralizadas em variáveis CSS. A moldura mobile e a cor do navegador acompanham a paleta.
- Conferidos visualmente acesso, tela inicial e revisão em desktop e revisão em largura de 390 px.
- Contraste calculado para as combinações principais: texto principal/fundo 11,83:1; texto secundário/fundo 5,25:1; branco/botão principal 5,93:1; texto/aviso creme 6,59:1. A borda forte dos campos usa um tom com contraste de 3,28:1 contra a superfície clara.
- Guia de código atualizado com as variáveis e o papel de cada cor. O escopo demonstrativo permanece o mesmo.

## Logo transparente — 03/11/2026

Substituída a logo pela versão PNG com canal alfa enviada pelo usuário (1015 × 566 px). Removido o fundo creme do contêiner CSS e atualizadas as dimensões da imagem. O HTML único incorpora a mesma versão transparente.

## Versão didática — 05/11/2026

Código organizado e comentado por agente Luna e revisado pelo agente principal. A árvore sintática JavaScript foi comparada com a versão anterior desconsiderando comentários, posições e representação textual dos literais: resultado idêntico. As regras CSS foram comparadas após remover comentários e normalizar a formatação e linhas vazias: resultado idêntico. Também foi confirmada a mesma lógica do HTML único gerado. As strings de HTML das telas, eventos, dados e chaves de armazenamento foram preservadas. Esses controles verificam a equivalência da mudança de legibilidade; não constituem uma nova rodada de testes com usuários.
