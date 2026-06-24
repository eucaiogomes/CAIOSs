---
ticket_id: 9054
cliente: "CooperConcordia"
assunto: "Evento Híbrido - Problema ao usar com várias turmas"
categoria: "Problema"
responsavel: "Guilherme Raposo "
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "cooperconcordia"
---

# Ticket 9054: Evento Híbrido - Problema ao usar com várias turmas

**Cliente:** CooperConcordia
**Categoria:** Problema
**Responsável:** Guilherme Raposo 
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9054)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 30/04/2025 08:07

O curso está criando um evento (webconferencia) só, então toda turma acessa a mesma web. Necessário corrigir a estrutura para ser 1 evento por turma, e não por curso.
Isto impede o funcionamento completo junto ao diário de classes.
OBS: Isto apenas com web LECTOR, o cliente que utiliza é o ESMP, porém com evento de plataforma externa.

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 02/05/2025 10:44

Testes:
1 - Adicionar conteúdo do treinamento do tipo Aula Presencial com evento híbrido (testar com plataforma LECTOR e alguma externa)
2 - Adicionar 2 ou mais turmas neste treinamento
3 - Cada turma irá criar um evento único para si, este evento é visível pro admin na aba
Webconferências > Agendamentos
- Como identificar que o evento está correto? A lista de participantes e os agendamentos ao editar pelo calendário de webconferencias deve exibir somente da turma (alunos, instrutores e agendamentos)
4 - Acessar a aula presencial online (webconferencia) pelas 2 turmas em seus agendamentos corretos.
5 - Testar toda a funcionalidade de evento híbrido por completo.
Testes extras:
1 - Testar aula presencial sem evento híbrido
2 - Testar eventos híbridos existentes antes da liberação, para ver se não quebrou, ambos continuam tendo um evento só para todas as turmas, mas deve ser possível continuar acessando, atualmente só o ESMP utiliza com plataforma externa, então não deve apresentar problemas
3 - Testar diário de classe com evento híbrido
4 - Testar quando há treinamento com evento híbrido em uma trilha
5 - Uma linha acabou sendo alterada da tarefa do ticket
https://lectortec.movidesk.com/Ticket/Edit/9015
, recomendo testar para ver se continua igual

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 02/05/2025 17:19

1 - Adicionar conteúdo do treinamento do tipo Aula Presencial com evento híbrido (testar com plataforma LECTOR e alguma externa) -
OK
2 - Adicionar 2 ou mais turmas neste treinamento
-
OK

---

### Ação #4 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 08/05/2025 13:37

em testes com cliente identificamos alguns inconsistencias. Testar novamente a condição de evento hibrido / diário de classe

---

### Ação #5 — 🔒 Ação Interna
**Autor:** Guilherme Raposo
**Data:** 03/07/2025 08:47

O comentario anterior indica que estao faltando testes e nao aponta quais sao as inconsistencias.

---

### Ação #6 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 18/07/2025 08:58

Está OK, pode desconsiderar essa tarefa.
