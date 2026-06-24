---
ticket_id: 9137
cliente: "LECTOR"
assunto: "Bug ao converter arquivo MP4 em documentos"
categoria: "Problema"
responsavel: "Guilherme Raposo "
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "lector"
---

# Ticket 9137: Bug ao converter arquivo MP4 em documentos

**Cliente:** LECTOR
**Categoria:** Problema
**Responsável:** Guilherme Raposo 
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9137)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 14/05/2025 10:15

Descrição:
Testei o upload com um arquivo MP4 grande e demora muito pra realizar a conversão, não tendo nenhuma atualização.
Em alguns momentos na hora do envio do arquivo, não é atualizado a barra de progressão.
Testado também com um arquivo pequeno de MP4 e acontece o mesmo.
Se eu fecho a aba ele continua baixando, mas se eu saio da pasta e volto, foi cancelado o envio e o arquivo não aparece na pasta.
Notei que em um certo momento ele acabou dando um bug visual e apresentava os arquivos tanto em categoria, quanto na pasta dos documentos.
Ambiente:
Windows 11, Google Chrome Versão 134.0.6998.36 (Versão oficial) 64 bits - Em produção
Evidências:
---

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 14/05/2025 10:17

O último arquivo ficou apresentando pra mim que ainda estava convertendo (apresentando o spinner e o pop-up), mas para o Luiz já estava constando na pasta como se estivesse pronto.

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Caio Gomes
**Data:** 30/12/2025 14:32

Realizei o teste conforme passado pela mikaelle na ação anterior:
Testei o upload com um arquivo MP4 grande e demorou um pouco
Em alguns momentos na hora do envio do arquivo, não é atualizado a barra de progressão.
Testado também com um arquivo pequeno de MP4 e acontece o mesmo.
Se eu fecho a aba ele continua baixando, mas se eu saio da pasta e volto, foi cancelado o envio e o arquivo não aparece na pasta.
Não exibiu durante os teste o bug visual e nem apresentou  os arquivos duplicados

---

### Ação #4 — 🔒 Ação Interna
**Autor:** Caio Gomes
**Data:** 30/12/2025 14:34

O unico problema que peguei durantes os testes foi:
Demorar bastante para realizar o upload, e a barra de progresso do pop up não atualiza o progresso apenas a do card do documento:
