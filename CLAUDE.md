# Orientações para agentes

## Estrutura

O repositório do Git é esta pasta. A pasta que a contém não é versionada. O projeto da Netlify está ancorado aqui, em `.netlify/state.json`, e existe um único `netlify.toml`, também aqui. Nunca crie configuração da Netlify na pasta de cima: já houve duplicação, e publicar de um lugar ou do outro gerava resultados diferentes.

## Publicação

Publique somente com `npm run deploy`. Nunca chame `netlify deploy` direto: foi assim que uma correção saiu como preview enquanto a produção seguia com a versão antiga.

O comando exige repositório limpo, branch `main` e commits já enviados ao GitHub. Isso é intencional. A produção precisa ser idêntica ao que está versionado.

Depois de qualquer publicação, confirme com `npm run verify:prod`. Não considere uma correção entregue enquanto a produção não servir o pacote construído.

Quando mudar `src/` ou `public/`, suba a versão de `CACHE` em `public/sw.js` e o número correspondente em `scripts/check-menu-update.mjs`. Sem isso os celulares continuam com a versão anterior.

## Impressão da comanda

O Android imprime por comandos ESC POS entregues ao RawBT, não pela impressão de página. As regras estão em `docs/GUIA-IMPRESSAO-58MM.md` e são protegidas por `scripts/check-print-flow.mjs`.

Ao mexer em `buildRawBtReceipt`, respeite as 32 colunas e lembre que o texto já formatado não pode passar de novo por `rawText`, que compacta espaços e desfaz o alinhamento dos preços. Use `rawAscii` para o que já vem alinhado.

Antes de concluir que a impressão está errada, confirme que o RawBT está instalado no aparelho. Sem ele, o toque no botão não produz nenhum efeito nem mensagem.

## Escrita

O código e as mensagens ao cliente são em português e não usam travessões. `scripts/check-print-flow.mjs` recusa travessões nos arquivos principais.

Registre mudanças relevantes em `docs/HISTORICO-ALTERACOES.md`, seguindo o formato já existente.
