---
ticket_id: 9147
cliente: "CIGAM"
assunto: "Verificar sobre marcação de flags"
categoria: "Problema"
responsavel: "Ricardo Schutz"
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "cigam"
---

# Ticket 9147: Verificar sobre marcação de flags

**Cliente:** CIGAM
**Categoria:** Problema
**Responsável:** Ricardo Schutz
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9147)

---

## Histórico de Ações

### Ação #1 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 14/05/2025 15:12

Cliente relatou que havia selecionado algumas flags, salvou.
Um tempo depois ao retornar para a tela de configurações, notaram que todas as flags haviam sido desmarcadas

---

### Ação #2 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 05/06/2025 11:26

Setor qualidade, favor retornar sobre essa questão exposta.

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 10/07/2025 11:29

Em anexo, vídeo relatando que ao marcar alguma opção, mesmo mostrando que foi salvo o sistema não salva a opção marcada.
Atenciosamente,
Thiago Clemente
📎 Anexos: Lector Live - Google Chrome 2025-07-10 11-23-30.mp4

---

### Ação #4 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 08/08/2025 12:27

Corrigido

---

### Ação #5 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 08/08/2025 16:05

Identificado problema devido a múltiplas instâncias de RDS.
Alterado para retornar o mesmo objeto que foi usado para salvar no database.

---

### Ação #6 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 11/08/2025 11:21

Identificado e corrigido problema que aconteceria em produção devido a instâncias separadas de reader/writer. O problema causaria a visualização incorreta das flags setadas logo após salvar.

---

### Ação #7 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 12/08/2025 11:49

Realizado o teste desmarcando várias flags e salvando, ao retornar estava correto.
Realizado também a remarcação e salvamento, está OK

---

### Ação #8 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 25/08/2025 11:58

Olá, bom dia!!
Realizamos a liberação da correção referente a tarefa:
Identificado e corrigido problema que aconteceria em produção devido a instâncias separadas de reader/writer. O problema causaria a visualização incorreta das flags setadas logo após salvar.

---

### Ação #9 — 📧 Ação Pública
**Autor:** 
**Data:** 04/09/2025 12:49

Prezado(a),
Informamos que o chamado
9147
, foi fechado automaticamente devido à inatividade, nossa ultima ação ocorreu em
25/08/2025 11:58 (UTC-03:00 Horário de Brasília (Bahia)).
Caso necessário pedimos que retorne esta mensagem para reabrir a solicitação.
