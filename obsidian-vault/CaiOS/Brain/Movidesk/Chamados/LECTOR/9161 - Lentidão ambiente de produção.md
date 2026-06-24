---
ticket_id: 9161
cliente: "LECTOR"
assunto: "Lentidão ambiente de produção"
categoria: "Problema"
responsavel: "Luiz Firmo"
servico: "Suporte"
tags:
  - chamados_movidesk
  - "lector"
---

# Ticket 9161: Lentidão ambiente de produção

**Cliente:** LECTOR
**Categoria:** Problema
**Responsável:** Luiz Firmo
**Serviço:** Suporte
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9161)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 15/05/2025 10:36

Ambiente de produção estava lento
Constatado alto uso de RDS
Quantidade de requests quadruplicou em um curto espaço de tempo
Segundo Tiago, há um evento do ESMP

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 30/09/2025 15:55

Dois readers perto de 100% de CPU. Iniciei mais um reader

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 30/09/2025 15:56

Idem ação #2
Aumentado número de instâncias no Beanstalk de 2 para 4.

---

### Ação #4 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 01/10/2025 15:56



---

### Ação #5 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 02/03/2026 15:17

encerrado.
