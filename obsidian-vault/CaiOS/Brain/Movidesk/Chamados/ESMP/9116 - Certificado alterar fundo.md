---
ticket_id: 9116
cliente: "ESMP"
assunto: "Certificado alterar fundo"
categoria: "Problema"
responsavel: "Luiz Firmo"
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "esmp"
---

# Ticket 9116: Certificado alterar fundo

**Cliente:** ESMP
**Categoria:** Problema
**Responsável:** Luiz Firmo
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9116)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 13/05/2025 08:36

Ao ajustar a imagem referida do chamado pai 9113, identifiquei problemas relacionados ao ajuste e geração da imagem.
Oficial / HML, portal ESMP - 2943
Oficial tive que realizar 3x o ajuste de dimensão da imagem para dar certo. Mas não gera a visualização, igual imagem 3 abaixo.
HML, consegui ajustar na 5ª tentativa.
https://www.hml.lector.live/esmp/registers/certificates/edit/20992
Imagem 1
Imagem 2
Mas não gera visualização e não apresenta erro no console.
Imagem 3
Imagem que o cliente repassou em anexo.
📎 Anexos: certificacao_layout (1).png

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 14/05/2025 09:51

Análise

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 16/05/2025 08:04

Correções wkhtmltopdf ambiente local, versão no ubuntu tem dependência descontinuada.
Correções de geração de certificado.
Testar geração com verso também.
📎 Anexos: certificacao_layout.png

---

### Ação #4 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 29/05/2025 09:09

Corrige problemas com imagens grandes, exemplo a imagem do cliente ou imagens 4k. Deixarei em anexo duas imagens grandes para testes.
Por limitações do nosso plugin que recorta as imagens, tive que redimensionar a imagem para um tamanho menor antes de começar a recortar, então é comum que uma imagem 4k por exemplo perca um pouco de qualidade, pois agora altura/largura máxima será de 1280px para evitar travamentos.
Pode levar alguns segundos para apresentar a imagem para recorte, pois tem o processo de redimensionar imagem que depende da cpu do usuário.
📎 Anexos: pexels-eberhardgross-691668.jpg, certificacao_layout.png

---

### Ação #5 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 29/05/2025 14:26

Testes
Atenciosamente,
Thiago Clemente

---

### Ação #6 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 30/05/2025 11:47

Realizado teste, certificando sendo gerado conforme o esperado
Atenciosamente,
Thiago Clemente

---

### Ação #7 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 30/05/2025 16:37

Após testes de edição, criação e remoção, onde necessário o fundo do certificado ficou de acordo com o esperado.
Atenciosamente,
Thiago Clemente

---

### Ação #8 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 05/06/2025 13:51

Teste no oficial, e ok
Atenciosamente,
Thiago Clemente

---

### Ação #9 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 05/06/2025 17:03

teste no oficial OK.
