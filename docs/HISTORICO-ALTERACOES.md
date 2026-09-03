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
