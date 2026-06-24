---
ticket_id: 9098
cliente: "LECTOR"
assunto: "Filtro de busca por e-mail-cadastro requer dupla confirmação para funcionar corretamente"
categoria: "Problema"
responsavel: "Luiz Firmo"
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "lector"
---

# Ticket 9098: Filtro de busca por e-mail-cadastro requer dupla confirmação para funcionar corretamente

**Cliente:** LECTOR
**Categoria:** Problema
**Responsável:** Luiz Firmo
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9098)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 08/05/2025 11:09

Descrição:
Ao procurar pela primeira vez na aba de e-mail um usuário pelo e-mail, apresenta todos os usuários e só depois de dar enter novamente que filtra o usuário. Depois ele não acontece mais, apenas se limpa o cache ou sai do cliente e volta.
Teste realizado no HML.
Problema acontece apenas no ESMP. Tentei reproduzir em outras plataformas mas sem sucesso.
Ambiente:
Windows 11, Google Chrome Versão 134.0.6998.36 (Versão oficial) 64 bits
Evidências:

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 22/05/2025 14:05

Não requer dupla confirmação, ocorre pois quando há o 1º clique ainda não carregou a tabela.
