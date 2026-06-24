---
ticket_id: 9003
cliente: "CooperConcordia"
assunto: "Quando professor vai dar presencao abre modal ... pq- pq nao fazer como é como é com administrador.."
categoria: "Solicitação de serviço"
responsavel: ""
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "cooperconcordia"
---

# Ticket 9003: Quando professor vai dar presencao abre modal ... pq- pq nao fazer como é como é com administrador..

**Cliente:** CooperConcordia
**Categoria:** Solicitação de serviço
**Responsável:** 
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9003)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 24/04/2025 08:48

Verificar como é o funcionamento na plataforma

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 08/05/2025 13:35

Eles gostariam de uma tela que fosse desta forma, como para o instrutor.
Deveria mostrar para o ADM

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 17/07/2025 16:37

Segundo Luiz: a tela que o administrador vê deve ser igual a essa tela que o instrutor vê.

---

### Ação #4 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 22/07/2025 10:54

Teste realizado devido a liberação HML
Tem relação com a 8878
URL acessada:
https://www.hml.lector.live/cooperconcordia/classRecordBook
Usuário utilizado no teste: qualidade@lectortec.com.br
Teste Realizado:
Como administrador, verificar se é apresentado o modal de presença e filtro de turmas para esse perfil também, assim como já é para instrutor.
Resultado Observado:
Apresenta modal corretamente para adm
Filtro funciona corretamente
Não sincroniza as presenças e faltas com a aba de lista de presença no diário de classe
Apresentam turmas que não possuem agendamento no diário de classe, está correto?
Resultado Esperado:
Apresentar modal para presença para adm
Evidências:
Prints:

---

### Ação #5 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 23/07/2025 10:46

Corrigido junto com a 8878
Necessário verificar qual deveria ser o comportamento referente quais turmas deveriam aparecer. Segundo o que está implementado, traz todas as turmas em que o usuário é instrutor.

---

### Ação #6 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 24/07/2025 14:53

Teste realizado devido a liberação HML
Tem relação com a 8878
URL acessada:
https://www.hml.lector.live/cooperconcordia/classRecordBook
Usuário utilizado no teste: qualidade@lectortec.com.br
Teste Realizado:
Como administrador, verificar se é apresentado o modal de presença e filtro de turmas para esse perfil também, assim como já é para instrutor.
Resultado Observado:
Apresenta modal corretamente para adm
Filtro funciona corretamente
Sincroniza as presenças e faltas com a aba de lista de presença no diário de classe corretamente.
Evidências:
Prints:

---

### Ação #7 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 29/07/2025 09:12

Teste realizado devido a liberação em produção e aprovado.
Tem relação com a 8878
URL acessada:
https://www.hml.lector.live/cooperconcordia/classRecordBook
Usuário utilizado no teste: qualidade@lectortec.com.br
Teste Realizado:
Como administrador, verificar se é apresentado o modal de presença e filtro de turmas para esse perfil também, assim como já é para instrutor.
Resultado Observado:
Apresenta modal corretamente para adm
Filtro funciona corretamente
Sincroniza as presenças e faltas com a aba de lista de presença no diário de classe corretamente.
Quando a aula já passou ou ainda não chegou, pelo diário de classe apresenta o modal corretamente e não deixa entrar.
Evidências:
Prints:
