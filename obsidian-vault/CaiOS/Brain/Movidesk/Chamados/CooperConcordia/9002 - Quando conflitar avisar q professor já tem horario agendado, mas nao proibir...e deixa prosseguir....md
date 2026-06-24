---
ticket_id: 9002
cliente: "CooperConcordia"
assunto: "Quando conflitar avisar q professor já tem horario agendado, mas nao proibir...e deixa prosseguir..."
categoria: "Solicitação de serviço"
responsavel: "Guilherme Raposo "
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "cooperconcordia"
---

# Ticket 9002: Quando conflitar avisar q professor já tem horario agendado, mas nao proibir...e deixa prosseguir...

**Cliente:** CooperConcordia
**Categoria:** Solicitação de serviço
**Responsável:** Guilherme Raposo 
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9002)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 24/04/2025 08:46

Santos implementou para apresentar a mensagem, entretanto, pode ser selecionado mesmo com conflito.

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 24/04/2025 09:08

Adicionado modal (pop-up) com a mensagem que possui conflitos de horários, e o botão de confirmação / cancelar

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 25/04/2025 15:38

Descrição:
Ao trocar o instrutor, ele apresenta o botão de confirmar, e confirmo.
Quando entro novamente no agendamento e salvo, dá erro.
O erro ocorre apenas quando salvo após ter adicionado um instrutor.
Ambiente:
Windows 11, Google Chrome Versão 134.0.6998.36 (Versão oficial) 64 bits
Evidências:

---

### Ação #4 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 29/04/2025 11:23

Este conteúdo nessa turma está quebrado, pode ser que seja bug antigo de testes antes de outras liberações, necessário testar com novos agendamentos ou algum que não dê o mesmo erro ao salvar

---

### Ação #5 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 30/04/2025 17:44

Testado e funcionando corretamente.

---

### Ação #6 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 08/05/2025 13:38

realizei um reteste e não está acusando conflito.

---

### Ação #7 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 15/05/2025 11:05

Testado em produção, e não está acusando conflito.
Quando reagendo uma aula com o mesmo instrutor para o mesmo horário, ele prossegue sem nenhum aviso.

---

### Ação #8 — 🔒 Ação Interna
**Autor:** Guilherme Raposo
**Data:** 18/07/2025 10:32

O que foi implementado:
Correcao na pesquisa de agendamentos do instrutor
Quais areas afetadas:
cadastro dos diarios de classe
Plano de testes:
Conferir que ao tentar salvar agendamento com conflito para instrutor o modal é apresentado

---

### Ação #9 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 21/07/2025 17:27

Teste realizado devido a liberação HML
URL acessada:
https://www.hml.lector.live/universolector/classRecordBook
Usuário utilizado no teste:
qualidade@lectortec.com.br
Teste Realizado:
Realizado um reagendamento para o mesmo horário de outra aula. ❌ Não apresenta modal
Realizado um reagendamento para o mesmo dia de outra aula, porém em outro horário. ✅
Realizado um reagendamento para o mesmo dia de outra aula, porém meia hora apenas do horário. ❌ Salvou sem aviso mesmo sendo dentro do horário que já possui.
Resultado Observado:
Ele só apresenta o problema quando o horário do reagendamento é exatamente igual ao que já existe.
Resultado Esperado:
Deve apresentar o modal em qualquer situação que peça o reagendamento dentro do horário que já existe.
Evidências:
Realizado um reagendamento para o mesmo horário de outra aula. ❌ Não apresenta modal

---

### Ação #10 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 24/07/2025 10:15

Teste realizado devido a liberação HML e aprovado!
URL acessada:
https://www.hml.lector.live/universolector/classRecordBook/diary
Usuário utilizado no teste:
qualidade@lectortec.com.br
Teste Realizado:
Realizado teste reagendando e criando aula para:
- o mesmo horário já existente
- dentro do horário existente por meia hora
- fora do horário já existente
Evidências:
Mesmo horário
Meia hora dentro do horário:
Fora do horário:

---

### Ação #11 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 29/07/2025 16:13

Modal sendo apresentado corretamente, achei um problema mas foi aberto a 9580 pra isso.
