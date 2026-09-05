# Publicação do painel

## Onde as coisas moram

O repositório do Git é esta pasta `app`, e não a pasta que a contém. O projeto da Netlify está ancorado aqui, em `app/.netlify/state.json`. Existe um único `netlify.toml`, também aqui.

Isso já foi diferente. Havia um `netlify.toml` na pasta de cima, fora do controle de versão, com caminhos próprios. Publicar de uma pasta ou da outra produzia configurações distintas. A pasta de cima foi limpa de propósito: rodar a Netlify de lá agora falha dizendo que não há projeto vinculado, em vez de publicar a coisa errada em silêncio.

## Publicar

```
git push
```

É isso. Enviar para `main` publica. O GitHub Actions executa a mesma sequência que era feita à mão:

1. `npm ci`, com as versões exatas do `package-lock.json`.
2. `npm test`: impressão térmica, cardápio, campanha e build.
3. `check:release`, o portão descrito abaixo.
4. `netlify deploy --prod`, com pasta e funções explícitas.
5. `verify:prod`, que confere o que ficou realmente no ar.

Se qualquer etapa falhar, a publicação não acontece e o commit aparece marcado no GitHub. Acompanhe em `github.com/rafarisso/bistro-hamburgueria/actions` ou por `gh run watch`.

Alterações que não chegam ao site publicado, em `docs/`, `output/` e qualquer `.md`, não disparam deploy. Ramos que não são `main` e propostas de alteração rodam apenas as verificações, sem publicar.

### Como a automação está montada

`.github/workflows/publicar.yml` publica a `main`. `.github/workflows/verificacoes.yml` valida os demais ramos. O token fica no segredo `NETLIFY_AUTH_TOKEN` do repositório; o identificador do projeto está no próprio workflow, por não ser sigiloso. Duas publicações nunca correm juntas: a segunda espera a primeira terminar, em vez de cancelá-la.

A integração nativa da Netlify com o GitHub está intencionalmente desligada. Se for ligada, o site passa a ser publicado por dois caminhos ao mesmo tempo, e o caminho da Netlify não executa `verify:prod`.

## Publicar à mão

O caminho manual continua disponível para quando o Actions estiver fora do ar:

```
npm run deploy
```

Faz exatamente o mesmo, da sua máquina. Evite usar logo após um `git push`, porque o Actions já estará publicando o mesmo conteúdo.

## O portão antes de publicar

`scripts/check-release.mjs` recusa a publicação quando o aplicativo mudou mas a versão do cache em `public/sw.js` continua a mesma, o que deixaria os celulares presos na versão anterior.

Fora da integração contínua ele também recusa quando o branch não é `main`, quando existem alterações sem commit, ou quando o repositório local e o GitHub estão fora de sincronia. Na integração contínua essas garantias já valem por construção, porque o que se publica é o próprio repositório.

## A conferência depois de publicar

`scripts/verify-deploy.mjs` baixa a produção e confirma que:

- o endereço serve exatamente o pacote que acabou de ser construído, com repetição por alguns segundos enquanto a rede propaga;
- a versão do cache publicada é a esperada;
- o aplicativo no ar contém a impressão direta pelo RawBT e o alinhamento da coluna de preços;
- o painel responde e a api de pedidos continua exigindo autenticação.

Esse é o passo que faltava. Em 3 de setembro de 2026 a correção da impressão foi construída e enviada, mas saiu como preview: a produção seguiu servindo a versão anterior por horas, com o cliente reclamando de um problema que já estava corrigido no repositório. Em 5 de setembro a campanha de cupons repetiu o mesmo padrão, e dessa vez a conferência acusou na hora.

## Testar sem tocar na produção

```
npm run deploy:preview
```

Gera um endereço temporário com o mesmo backend e o mesmo banco de pedidos. Serve para validar impressão no celular antes de publicar. Não exige repositório limpo, justamente porque existe para testar trabalho em andamento.

Quando a mudança mexer em `netlify/functions/`, vale acrescentar `--skip-functions-cache` e conferir que `/api/orders` responde 401, e não 500. Um import que não resolve só aparece assim: a função quebra inteira e a hamburgueria para de receber pedidos.

## Conferir a produção a qualquer momento

```
npm run verify:prod
```

Não publica nada. Compara o que está construído aqui com o que está no ar.

## Trocar o token

O segredo `NETLIFY_AUTH_TOKEN` é um token pessoal da Netlify e dá acesso à conta inteira, não apenas a este site. Para substituí-lo, gere outro em `app.netlify.com/user/applications` e grave com:

```
gh secret set NETLIFY_AUTH_TOKEN -R rafarisso/bistro-hamburgueria
```
