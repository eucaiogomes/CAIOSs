---
ticket_id: 9097
cliente: "CIGAM"
assunto: "criar opção para desconsiderar progresso de conteudo"
categoria: "Sugestão / Melhoria"
responsavel: "Luiz Firmo"
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "cigam"
---

# Ticket 9097: criar opção para desconsiderar progresso de conteudo

**Cliente:** CIGAM
**Categoria:** Sugestão / Melhoria
**Responsável:** Luiz Firmo
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9097)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 07/05/2025 15:46

Criar uma opção (flag) por conteudo para que o mesmo não considere "Progresso" no treinamento.

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 09/06/2025 09:35

Hoje o unico conteudo que não possui peso e nem progresso dentro do treinamento é o "TÓPICO".

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 30/07/2025 18:03

Desenvolvimento

---

### Ação #4 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 31/07/2025 10:31

Desenvolvimento

---

### Ação #5 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 31/07/2025 12:41

Desenvolvimento

---

### Ação #6 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 31/07/2025 16:29

Implementado de forma a não cadastrar o progresso dos conteúdos que possuem a flag ativada.
Necessário testar flags que podem causar interferência, como:
- Progresso mínimo (tanto no conteúdo quanto no treinamento)
- Obrigatório
- Obrigatório para certificado
Necessário testar o funcionamento do andamento do progresso de todos os conteúdos possíveis nos treintamentos.

---

### Ação #7 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 12/08/2025 10:48

Realizado um teste simples, com 3 conteudos um para igonorar o progresso e os outros computando o progresso.
Ao acessar o conteudo que deveria ignorar o progresso, pois está com a flag marcada o mesmo considerou
https://www.hml.lector.live/cigamcorporativa/home/courses/1475049/contents
Ao retornar ao treinamento via editar, observei que a flag estava desmarcada, sempre no 1º salvamento ocorre o problema.
Outra questão que notei que editando e marcando o a flag, ao acessar novamente apresenta o erro 500 em tela

---

### Ação #8 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 12/08/2025 18:37

Corrigido.
- Flag não ficava salva no primeiro salvamento
- Atualização do conteúdo falhava ao tentar salvar o aproveitamento como nulo
- Ocorria outro bug quando um mesmo documento era incluído 2 vezes no treinamento

---

### Ação #9 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 13/08/2025 17:58

- Está flegado ao voltar no treinamento depois de salvar ✅
- Não contabilizou corretamente ativando a flag ✅

---

### Ação #10 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 26/08/2025 11:53

Testado e aprovado

---

### Ação #11 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 05/09/2025 16:05

está ok
