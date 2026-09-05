# Bistrô Hamburgueria

Cardápio, pedidos e painel de cozinha da Bistrô Hamburgueria.
Produção em [bistrohamburgueria.com.br](https://bistrohamburgueria.com.br), painel em `/painel`.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `src/customer.js` | Cardápio, cupom e checkout do cliente |
| `src/admin.js` | Painel da cozinha e impressão da comanda |
| `src/state.js` | Cardápio visual, carrinho e formatação |
| `src/highlights.js` | Sorteio do destaque da abertura |
| `shared/coupons.js` | Regra do cupom, usada pelo checkout e pelo servidor |
| `netlify/functions/` | Pedidos, configurações, login e notificações |
| `public/sw.js` | Cache do aplicativo instalado no celular |
| `scripts/` | Verificações automatizadas e portões de publicação |
| `.github/workflows/` | Verificação dos ramos e publicação da `main` |
| `docs/` | Guias de impressão, publicação, campanha e histórico |
| `output/` | Material impresso gerado, não publicado no site |

Esta pasta é a raiz do repositório e também o ponto de partida de toda publicação. A pasta que a contém não é versionada e não deve receber configuração da Netlify.

## Publicar

`git push` na `main`. O GitHub Actions verifica, constrói, publica e confere a produção. Detalhes e o caminho manual em [docs/GUIA-DEPLOY.md](docs/GUIA-DEPLOY.md).

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o cardápio para desenvolvimento |
| `npm run dev:api` | Sobe o projeto com as funções, necessário para o painel |
| `npm test` | Roda as verificações e constrói o `dist` |
| `npm run deploy` | Publica da máquina local, para quando o Actions estiver fora |
| `npm run deploy:preview` | Publica um endereço temporário para teste |
| `npm run verify:prod` | Confere o que está no ar sem publicar nada |

## Antes de mexer

[AGENTS.md](AGENTS.md) reúne as regras do projeto e vale tanto para pessoas quanto para ferramentas de IA. A impressão da comanda tem regras próprias em [docs/GUIA-IMPRESSAO-58MM.md](docs/GUIA-IMPRESSAO-58MM.md), e as decisões de cardápio, cupom e destaque estão em [docs/CAMPANHA-CUPONS.md](docs/CAMPANHA-CUPONS.md). O que já foi decidido e por quê está em [docs/HISTORICO-ALTERACOES.md](docs/HISTORICO-ALTERACOES.md).
