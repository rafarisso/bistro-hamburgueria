# Bistrô Hamburgueria

Cardápio, pedidos e painel de cozinha da Bistrô Hamburgueria.
Produção em [bistrohamburgueria.com.br](https://bistrohamburgueria.com.br), painel em `/painel`.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `src/customer.js` | Cardápio e checkout do cliente |
| `src/admin.js` | Painel da cozinha e impressão da comanda |
| `src/state.js` | Cardápio visual, carrinho e formatação |
| `netlify/functions/` | Pedidos, configurações, login e notificações |
| `public/sw.js` | Cache do aplicativo instalado no celular |
| `scripts/` | Verificações automatizadas e portões de publicação |
| `docs/` | Guias de impressão, publicação e histórico |

Esta pasta é a raiz do repositório e também o ponto de partida de toda publicação. A pasta que a contém não é versionada e não deve receber configuração da Netlify.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o cardápio para desenvolvimento |
| `npm run dev:api` | Sobe o projeto com as funções, necessário para o painel |
| `npm test` | Roda as verificações e constrói o `dist` |
| `npm run deploy` | Verifica, constrói, publica em produção e confere o resultado |
| `npm run deploy:preview` | Publica um endereço temporário para teste |
| `npm run verify:prod` | Confere o que está no ar sem publicar nada |

## Antes de mexer

A impressão da comanda tem regras próprias, descritas em [docs/GUIA-IMPRESSAO-58MM.md](docs/GUIA-IMPRESSAO-58MM.md). O ciclo de publicação está em [docs/GUIA-DEPLOY.md](docs/GUIA-DEPLOY.md). As duas leituras evitam repetir problemas já resolvidos.

Campanha de setembro: [regras, cupons e material impresso](docs/CAMPANHA-CUPONS.md).
