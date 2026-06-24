---
ticket_id: 9033
cliente: "LECTOR"
assunto: "Delay no processamento de arquivos - Chatbot"
categoria: "Problema"
responsavel: "Guilherme Raposo "
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "lector"
---

# Ticket 9033: Delay no processamento de arquivos - Chatbot

**Cliente:** LECTOR
**Categoria:** Problema
**Responsável:** Guilherme Raposo 
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9033)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 28/04/2025 10:51

Descrição:
O chatbot processa corretamente os arquivos enviados e os utiliza para responder as perguntas dos usuários.
No entanto, há um delay no processamento. Imediatamente após o envio do arquivo, algumas perguntas relacionadas retornem erro (
"A informação solicitada não está disponível nos dados recuperados"
).
Depois de algum tempo, o chatbot passa a utilizar corretamente as informações dos arquivos enviados.
Passo a passo para reproduzir:
Enviar um arquivo para análise pelo chatbot.
Realizar perguntas imediatamente após o envio, relacionadas ao conteúdo do arquivo.
Observar que, em alguns casos, o chatbot retorna erro por não ter recuperado os dados a tempo.
Após um tempo, refazer a mesma pergunta e perceber que o chatbot responde corretamente.
Resultado esperado:
O chatbot deve processar arquivos rapidamente e permitir que as informações sejam usadas logo após o upload, principalmente pelo funcionamento da aba Analisar documentos.
Resultado atual:
Há um delay no processamento dos arquivos, resultando em respostas incorretas ou erro temporário.
Ambiente:
Sistema operacional:
Windows 11
Navegador:
Google Chrome Versão 134.0.6998.36 (Versão oficial) 64 bits
Evidências:
1/2/3

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 22/07/2025 17:57

Comportamento de delay é o certo. Está mais rápido agora, só nao foi documentado.
