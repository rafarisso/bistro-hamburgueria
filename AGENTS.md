# Continuidade do projeto

Arquivo canônico de instruções para qualquer ferramenta de IA que trabalhe neste projeto. `CLAUDE.md` aponta para cá de propósito: duas cópias das mesmas regras divergem com o tempo, e este projeto já foi trabalhado por ferramentas diferentes em dias diferentes.

Leia antes de alterar: `README.md`, este arquivo e `docs/HISTORICO-ALTERACOES.md`. Regras operacionais em `docs/GUIA-DEPLOY.md`, `docs/GUIA-IMPRESSAO-58MM.md` e `docs/CAMPANHA-CUPONS.md`.

## Estrutura

O repositório do Git é esta pasta. A pasta que a contém não é versionada. O projeto da Netlify está ancorado aqui, em `.netlify/state.json`, e existe um único `netlify.toml`, também aqui. Nunca crie configuração da Netlify na pasta de cima: já houve duplicação, e publicar de um lugar ou do outro gerava resultados diferentes.

## Publicação

Publicar é enviar para `main`. O GitHub Actions roda `npm test`, o portão de release, o deploy de produção e a conferência `verify:prod`. Não chame `netlify deploy` direto: foi assim que duas correções saíram como preview enquanto a produção seguia com a versão antiga.

`npm run deploy` continua disponível para publicar da máquina local quando o Actions estiver indisponível. Não use logo após um `git push`, para não publicar o mesmo conteúdo duas vezes.

Nenhuma correção está entregue enquanto a produção não servir o pacote construído. Confirme com `npm run verify:prod` ou pelo resultado do workflow.

Quando mudar `src/` ou `public/`, suba a versão de `CACHE` em `public/sw.js` e o número correspondente em `scripts/check-menu-update.mjs`. Sem isso os celulares continuam com a versão anterior, e o portão de release recusa a publicação.

Mudanças em `netlify/functions/` merecem um `npm run deploy:preview` antes, com `--skip-functions-cache`, conferindo que `/api/orders` responde 401 e não 500. A função importa `shared/coupons.js`, que fica fora da pasta de funções; um import que não resolve derruba a criação de pedidos inteira.

## Impressão da comanda

O Android imprime por comandos ESC POS entregues ao RawBT, não pela impressão de página. As regras estão em `docs/GUIA-IMPRESSAO-58MM.md` e são protegidas por `scripts/check-print-flow.mjs`.

Ao mexer em `buildRawBtReceipt`, respeite as 32 colunas e lembre que o texto já formatado não pode passar de novo por `rawText`, que compacta espaços e desfaz o alinhamento dos preços. Use `rawAscii` para o que já vem alinhado.

Antes de concluir que a impressão está errada, confirme que o RawBT está instalado no aparelho. Sem ele, o toque no botão não produz nenhum efeito nem mensagem.

## Cardápio, cupons e destaques

Cadastro visual em `src/state.js`; preços aceitos pelo servidor em `netlify/functions/_shared/catalog.ts`. Os dois precisam concordar, e `scripts/check-campaign.mjs` verifica isso.

O desconto é sempre recalculado no servidor a partir do catálogo. Valores enviados pelo cliente são ignorados de propósito. A regra vive em `shared/coupons.js` e é a mesma no checkout e na função de pedidos.

O destaque da abertura é sorteado em tempo de execução entre produtos de Promoções e produtos com `oldPrice`. O hero renderiza `name`, `description`, `image`, `price`, `tag` e `serves`: um produto novo sem qualquer um desses campos apareceria como `undefined` na abertura do aplicativo.

## Escrita e registro

O código e as mensagens ao cliente são em português e não usam travessões. `scripts/check-print-flow.mjs` recusa travessões nos arquivos principais.

Documente toda mudança relevante em `docs/HISTORICO-ALTERACOES.md`, seguindo o formato existente, e registre decisões de regra nos guias correspondentes. Não dependa da memória de nenhuma ferramenta: a próxima sessão pode ser de outra IA, ou da mesma sem histórico.

Toda correção nova ganha uma verificação automatizada que falha sem ela. Antes de considerar uma guarda pronta, quebre o código de propósito e confirme que ela acusa.
