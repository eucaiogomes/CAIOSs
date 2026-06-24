---
ticket_id: 9064
cliente: "LECTOR"
assunto: "Vazamento de memoria ao adicionar usuario no grupo todos no portal -ext"
categoria: "Somente Uso da Lector"
responsavel: "Guilherme Raposo "
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "lector"
---

# Ticket 9064: Vazamento de memoria ao adicionar usuario no grupo todos no portal -ext

**Cliente:** LECTOR
**Categoria:** Somente Uso da Lector
**Responsável:** Guilherme Raposo 
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9064)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** Guilherme Raposo
**Data:** 02/05/2025 16:39

Adicionar grupo todos no usuario no portal /ext causava travamento da instancia por causa de um bug no select que trazia milhoes de resultados em portais com muitos convites de portal em aberto.
Para os testes:
Adicionar usuario no grupo todos no portal /ext
📎 Anexos: outmemory.txt

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 21/05/2025 10:25

Adicionado alguns usuários para Grupo TODOS, não ocorreu nenhum problema conforme mencionado no chamado. O que acontece é um Delay para apresentar o grupo no cadastro do usuário.
Atenciosamente,
Thiago Clemente

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 21/05/2025 10:31

Atenciosamente,
Thiago Clemente
