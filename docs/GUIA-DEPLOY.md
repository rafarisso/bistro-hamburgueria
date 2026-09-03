# Publicação do painel

## Onde as coisas moram

O repositório do Git é esta pasta `app`, e não a pasta que a contém. O projeto da Netlify está ancorado aqui, em `app/.netlify/state.json`. Existe um único `netlify.toml`, também aqui.

Isso já foi diferente. Havia um `netlify.toml` na pasta de cima, fora do controle de versão, com caminhos próprios. Publicar de uma pasta ou da outra produzia configurações distintas. A pasta de cima foi limpa de propósito: rodar a Netlify de lá agora falha dizendo que não há projeto vinculado, em vez de publicar a coisa errada em silêncio.

## Publicar

```
npm run deploy
```

Um comando só, sempre em produção. Ele executa nesta ordem:

1. `check:print`, que protege as regras da comanda térmica.
2. `check:menu`, que protege cardápio, preços, fotos e versão de cache.
3. `build`, que gera `dist`.
4. `check:release`, o portão descrito abaixo.
5. `netlify deploy --prod`, com pasta e funções explícitas.
6. `verify:prod`, que confere o que ficou realmente no ar.

Se qualquer etapa falhar, a publicação não acontece.

## O portão antes de publicar

`scripts/check-release.mjs` recusa a publicação quando:

- o branch não é `main`;
- existem alterações sem commit, porque a produção precisa ser idêntica ao repositório;
- existem commits que não foram enviados ao GitHub, ou o GitHub tem commits que você não possui;
- o aplicativo mudou mas a versão do cache em `public/sw.js` continua a mesma, o que deixaria os celulares presos na versão anterior.

## A conferência depois de publicar

`scripts/verify-deploy.mjs` baixa a produção e confirma que:

- o endereço serve exatamente o pacote que acabou de ser construído, com repetição por alguns segundos enquanto a rede propaga;
- a versão do cache publicada é a esperada;
- o aplicativo no ar contém a impressão direta pelo RawBT e o alinhamento da coluna de preços;
- o painel responde e a api de pedidos continua exigindo autenticação.

Esse é o passo que faltava. Em 3 de setembro de 2026 a correção da impressão foi construída e enviada, mas saiu como preview: a produção seguiu servindo a versão anterior por horas, com o cliente reclamando de um problema que já estava corrigido no repositório. `verify:prod` torna esse silêncio impossível.

## Testar sem tocar na produção

```
npm run deploy:preview
```

Gera um endereço temporário com o mesmo backend e o mesmo banco de pedidos. Serve para validar impressão no celular antes de publicar. Não exige repositório limpo, justamente porque existe para testar trabalho em andamento.

## Conferir a produção a qualquer momento

```
npm run verify:prod
```

Não publica nada. Compara o que está construído aqui com o que está no ar.

## Ligar a publicação automática

Hoje todo deploy é manual. O projeto da Netlify não está conectado ao repositório do GitHub, e foi por isso que um `git push` não colocou nada no ar. Para conectar:

1. Abra `app.netlify.com/projects/bistrohamburgueria`.
2. Vá em `Project configuration`, `Build & deploy`, `Continuous deployment`.
3. Em `Build settings`, escolha `Link repository` e selecione `rafarisso/bistro-hamburgueria`.
4. Defina `Base directory` vazio, `Build command` como `npm run build` e `Publish directory` como `dist`.
5. Confirme que o branch de produção é `main`.

Depois disso o push publica sozinho. Mesmo assim vale rodar `npm run verify:prod` após a publicação automática terminar.
