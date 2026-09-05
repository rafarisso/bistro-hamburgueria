# Cardápio e campanha de fidelização, 05/09/2026

## Produtos aprovados pelo proprietário

Fonte: prints de WhatsApp fornecidos pelo responsável pelo projeto e fotos originais baixadas em Downloads. Fotos copiadas para `public/`, sem alterações.

| Produto | ID | Individual | ID combo | Com combo |
| --- | --- | --- | --- | --- |
| Cheese Salada Duplo Bacon | 14 | R$ 34,90 | 15 | R$ 52,90 |
| Bistrô à Moda do Chef | 16 | R$ 44,90 | 17 | R$ 62,90 |

Combo opcional: batata frita e refrigerante de 200 ml por mais R$ 18,00 por unidade. Não foi informada marca do refrigerante nem peso da batata. O Chef tem quatro carnes de 90 g, bacon e cheddar. Não foi atribuído peso às carnes do Cheese Salada Duplo Bacon.

Cadastro visual em `src/state.js`; preços aceitos pelo servidor em `netlify/functions/_shared/catalog.ts`. IDs existentes foram preservados. Fotos: `Cheese_Salada_Duplo_Bacon.jpeg` e `Bistro_Moda_do_Chef.jpeg`.

## Regras de cupom

`BISTRO10` e `VOLTE10` dão 10% sobre o subtotal dos produtos, incluindo combos e produtos promocionais. A entrega não recebe desconto. Um código por pedido, sem acumulação entre códigos. Aceita letras minúsculas e espaços nas extremidades.

Por decisão de implementação, não há validade, limite por cliente, teto de desconto ou restrição à primeira compra. Pedido mínimo continua considerando o subtotal antes do desconto. As duas campanhas são identificadas pelo código armazenado no pedido; não há atribuição automática a iFood, Keeta ou 99 Food.

Regra única em `shared/coupons.js`, importada pelo checkout e pela função de pedidos. O servidor recalcula preços a partir do catálogo e rejeita cupom inválido antes de salvar. Desconto arredondado em centavos. Cliente envia apenas o código; valores de desconto enviados pelo cliente não são usados. Exemplo: combo de R$ 52,90, desconto de R$ 5,29 e entrega de R$ 8,00 resultam em R$ 55,61.

Pedido persiste `couponCode` e `discount`, além de subtotal, entrega e total. WhatsApp gerado, painel, impressão HTML e RawBT mostram o desconto. Pedidos antigos, sem esses campos, continuam compatíveis. Não há envio automático de mensagens de campanha.

## Destaques

`src/highlights.js` escolhe entre produtos de Promoções e produtos com `oldPrice`. Salva o último ID em `bistro:last-highlight:v1` no localStorage para evitar repetição imediata na próxima abertura/recarregamento. Mantém o destaque estável nas renderizações do carrinho. Sem armazenamento disponível, a escolha funciona, mas não garante evitar repetição entre acessos. Retomar uma aba já aberta mantém a oferta; novo carregamento escolhe outra.

## Material impresso

`output/pdf/bilhetes-bistro10-a4.pdf`: A4 vertical, oito bilhetes, duas colunas por quatro linhas, código BISTRO10 e QR para https://bistrohamburgueria.com.br/. VOLTE10 fica disponível para outra ação. Imprimir em tamanho real (100%), sem ajuste de página, e recortar nas linhas pontilhadas. Layout com fundo branco para economizar tinta.

Fonte reproduzível: `scripts/create-coupon-print.py`. Requer Python e reportlab. Executar `python scripts/create-coupon-print.py` na raiz `app`. PDF renderizado e inspecionado; o arquivo de prévia não precisa ser publicado. Para trocar o código no impresso, atualizar o gerador e regenerar o PDF, mantendo as regras iguais às do backend.

## Verificação e continuidade

`npm test` executa proteção da impressão, catálogo anterior, testes da campanha e build. `scripts/check-campaign.mjs` testa preços, combos, imagens, códigos inválidos, normalização, arredondamento, entrega e rotação. Cache atualizado para `bistro-v12`. Publicar pela rotina de `docs/GUIA-DEPLOY.md`; verificar produção com `npm run verify:prod`. Testes não geram pedidos reais nem enviam mensagens ao restaurante.
