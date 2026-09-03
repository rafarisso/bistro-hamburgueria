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
