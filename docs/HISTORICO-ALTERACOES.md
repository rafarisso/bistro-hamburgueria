# Histórico de alterações

## 3 de setembro de 2026

### Impressão térmica

- Removida a espera artificial antes de abrir a impressão.
- Mantida a chamada de impressão dentro do mesmo toque do usuário, requisito importante nos navegadores móveis.
- Mantida apenas uma ação no pedido, identificada como `Imprimir comanda`.
- Ajustada a página para bobina de 58 mm e área útil de 48 mm.
- Ampliados número do pedido, itens e avisos operacionais na comanda.
- Incluído campo de conferência no rodapé.
- Adicionada limpeza do estado após o encerramento da impressão.
- Criada uma verificação automatizada para impedir que a espera problemática volte em alterações futuras.
- Incluída a configuração de build e funções no repositório para deploy contínuo pelo GitHub.

### Padronização textual

- Removidos travessões do código do aplicativo e das mensagens enviadas pelo servidor.
- Padronizadas as faixas de horário e tempo de entrega em linguagem direta.

## 3 de setembro de 2026, segunda atualização

### Cardápio solicitado pelo Bruno

- Cadastrado o Combo Big Tasty para 3 Pessoas por R$ 59,90.
- Cadastrado o Combo Duplo Cheddar e Chelsea por R$ 59,90.
- Cadastrado o Doritos Burger por R$ 35,90.
- Cadastrado o Combo Super 4 Família por R$ 119,90.
- Adicionadas ao cardápio as quatro artes originais recebidas pelo WhatsApp.
- Atualizado o cache do aplicativo para a versão 8, garantindo a renovação do cardápio nos celulares.

### Segunda correção da impressão térmica

- Reduzida a área da comanda de 48 mm para 42 mm, criando margem segura para o driver Bluetooth.
- A comanda passou a ser filha direta do corpo da página durante a impressão.
- Removida a limpeza pelo evento `afterprint`, que pode ocorrer cedo demais em navegadores móveis.
- Mantida uma única ação identificada como `Imprimir comanda`.
- Preservado o acionamento direto dentro do toque do usuário.

## 3 de setembro de 2026, terceira atualização

### Calibração física da impressora Bluetooth

- Confirmado que a prévia estava correta, mas a impressão física ainda cortava o lado direito.
- Limitado o documento de impressão a 40 mm para evitar o deslocamento aplicado pelo serviço de impressão do celular.
- Reduzida a área da comanda para 38 mm e alinhado o conteúdo na borda inicial da página.
- Adicionada uma reserva interna de 1 mm no lado direito.
- Compactadas a logomarca, a coluna de preços e a área de totais sem retirar informações da comanda.
- Ampliada a verificação automatizada para proteger as novas medidas de impressão.
- Atualizado o cache do aplicativo para a versão 9 para entregar a calibração aos celulares já instalados.

## 3 de setembro de 2026, quarta atualização

### Novo destaque principal

- Definido o Combo Big Tasty para 3 Pessoas como o destaque principal do aplicativo.
- Atualizadas a faixa promocional, a fotografia, a chamada, a descrição e o preço exibidos na abertura do cardápio.
- O botão do destaque agora adiciona diretamente o Combo Big Tasty ao pedido.
- Destacado o cartão do produto no cardápio.
- Atualizado o cache do aplicativo para a versão 10.

## 3 de setembro de 2026, quinta atualização

### Impressão direta pelo RawBT

- Analisada a fotografia da impressão física enviada pelo cliente.
- Identificado que o RawBT recortava a página HTML, removendo toda a faixa direita da comanda.
- Substituída no Android a impressão da página pela integração direta `rawbt:base64`.
- A comanda agora é enviada como comandos ESC POS, respeitando as 32 colunas físicas da impressora de 58 mm.
- Mantidos número do pedido, data, cliente, telefone, itens, observações, valores, endereço, pagamento e campo de conferência.
- Aplicados alinhamento, negrito e destaque do número do pedido diretamente pela impressora.
- Mantida a impressão HTML apenas como contingência para computadores.
- Atualizado o cache do aplicativo para a versão 11.

## 3 de setembro de 2026, sexta atualização

### Alinhamento da coluna de preços na comanda ESC POS

- Identificado que o texto já formatado passava uma segunda vez pela limpeza de espaços, o que desfazia o preenchimento calculado para alinhar os preços na margem direita.
- Separada a limpeza de caracteres da compactação de espaços, preservando o alinhamento montado para itens, subtotal, entrega e total.
- Ampliada a verificação automatizada para impedir o retorno da limpeza duplicada.

## 3 de setembro de 2026, sexta atualização

### Ciclo de publicação

- Identificado que a correção da impressão havia sido construída e enviada ao GitHub, mas publicada como preview. A produção seguiu servindo a versão anterior, com o cliente reclamando de um problema já resolvido no repositório.
- Removida a configuração duplicada da Netlify que existia na pasta acima do repositório, fora do controle de versão. Publicar de uma pasta ou da outra produzia configurações diferentes.
- Ancorado o vínculo do projeto da Netlify dentro do repositório. Rodar a Netlify da pasta de cima agora falha avisando que não há projeto vinculado, em vez de publicar a coisa errada.
- Criado o comando único `npm run deploy`, que verifica, constrói, publica em produção e confere o resultado.
- Criado o portão `check-release`, que recusa publicar fora de `main`, com alterações sem commit, com commits não enviados ao GitHub ou sem a renovação do cache quando o aplicativo muda.
- Criada a conferência `verify-deploy`, que baixa a produção e confirma o pacote publicado, a versão do cache, a presença da impressão RawBT, o painel no ar e a proteção da api de pedidos.
- Criado `npm run deploy:preview` para validar impressão no celular sem tocar na produção.
- Reescrito o guia de impressão, que ainda descrevia o fluxo de impressão de página abandonado no Android.
- Criado o guia de publicação, com o passo a passo para ligar a publicação automática pelo GitHub.
- Criados o README do projeto e as orientações para agentes.

## 05/09/2026: novos lanches, cupons e destaques

Incluídos Cheese Salada Duplo Bacon e Bistrô à Moda do Chef, com combos de + R$ 18. Criados BISTRO10 e VOLTE10, com validação no servidor e desconto na comanda. Destaque muda a cada carregamento sem repetição consecutiva. PDF A4 com oito bilhetes e QR Code, fonte reproduzível e testes de campanha. Cache v12. Regras e decisões em CAMPANHA-CUPONS.md; entrada para agentes em AGENTS.md.

Conferido e publicado no mesmo dia. O empacotamento da função de pedidos foi validado num preview antes da produção, porque `shared/coupons.js` fica fora de `netlify/functions` e um import não resolvido derrubaria a criação de pedidos. Acrescentada verificação dos campos que o destaque sorteado precisa, já que o hero passou a renderizá-los em tempo de execução e um produto novo sem `tag` ou `serves` apareceria como `undefined` na abertura.
