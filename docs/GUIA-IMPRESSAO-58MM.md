# Impressão térmica da Bistrô

## Como a comanda sai hoje

O painel escolhe o caminho conforme o aparelho.

**No Android**, que é a operação real da cozinha, o painel não manda a página para impressão. Ele monta a comanda em comandos ESC POS e entrega direto ao RawBT pelo endereço `rawbt:base64,`. Quem decide a quebra de linha é a própria impressora, dentro das 32 colunas físicas da bobina de 58 mm.

**No computador**, o painel continua abrindo a impressão comum do navegador com a folha ajustada para 58 mm. É contingência, não a operação diária.

## Por que a comanda saía cortada

Enquanto o Android também usava a impressão de página, o RawBT recebia um documento HTML e o ajustava por conta própria, recortando toda a faixa direita. O corte atingia até o rodapé do próprio RawBT, o que provou que o problema não estava na largura definida pelo painel. Reduzir a área da comanda de 48 mm para 42 mm, depois para 38 mm, não resolveu e não tinha como resolver. A solução foi parar de mandar página e passar a mandar comandos.

## Regras da comanda ESC POS

Estão implementadas em `src/admin.js` e protegidas por `scripts/check-print-flow.mjs`.

- Largura fixa de 32 colunas. Nenhuma linha pode ultrapassar.
- Texto em ASCII puro. Os acentos são removidos porque a impressora térmica não os representa de forma confiável.
- Nome longo de produto quebra em várias linhas e o preço desce para a linha seguinte, encostado na direita.
- Preços alinhados à margem direita por preenchimento calculado. O texto já formatado não pode passar de novo pela compactação de espaços, senão o alinhamento se desfaz.
- Número do pedido e nome da casa em corpo dobrado, aplicado pela impressora e não por fonte.

## Configuração no celular da cozinha

1. Pareie a impressora com o celular pelo Bluetooth.
2. Instale o RawBT e faça a impressão de teste dentro do próprio aplicativo.
3. Defina papel de 58 mm no RawBT.
4. Abra `bistrohamburgueria.com.br/painel` no Chrome, entre com o PIN e toque em `Imprimir comanda`.

## Diagnóstico rápido

**Nada acontece ao tocar no botão.** O caso mais comum é o RawBT não estar instalado. O navegador falha em silêncio ao abrir um endereço `rawbt:` sem aplicativo correspondente, sem exibir erro algum. Confirme a instalação antes de qualquer outra hipótese.

**O RawBT abre, mas não sai papel.** O problema está entre o RawBT e o equipamento. Faça a impressão de teste dentro do RawBT e confira Bluetooth e bateria da impressora.

**A comanda sai com a versão antiga do cardápio ou do layout.** O celular está com a versão anterior em cache. Abra o painel com internet para o aplicativo se renovar. Se estiver instalado na tela inicial, feche e abra de novo.

**A comanda sai cortada de novo.** Isso indica que o aparelho voltou a usar a impressão de página. Rode `npm run verify:prod` para confirmar que a produção realmente contém a integração RawBT.
