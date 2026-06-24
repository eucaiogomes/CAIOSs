---
ticket_id: 9125
cliente: "Unimed Volta Redonda"
assunto: "Divergência entre relatório de compra e matrícula"
categoria: "Problema"
responsavel: "Thiago Clemente"
servico: "Suporte"
tags:
  - chamados_movidesk
  - "unimed_volta_redonda"
---

# Ticket 9125: Divergência entre relatório de compra e matrícula

**Cliente:** Unimed Volta Redonda
**Categoria:** Problema
**Responsável:** Thiago Clemente
**Serviço:** Suporte
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9125)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** FANNY APARECIDA MARQUES DOS SANTOS
**Data:** 13/05/2025 12:43

Boa tarde!
Verificamos que o pagamento da aluna Brenda Lima não está aparecendo no relatório de vendas. No entanto, a matrícula da cliente consta regularmente na turma do curso, conforme demonstrado nos prints anexos.
Poderiam, por gentileza, analisar o que ocorreu e nos ajudar a resolver essa inconsistência?
Muito obrigada!
📎 Anexos: Matrícula na turma.jpeg, Relatório de Vendas.jpeg

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 13/05/2025 13:35

Olá, boa tarde Fanny!
Farei uma análise sobre o caso repassado, até o fim da tarde trago algumas atualizações sobre a situação.

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 13/05/2025 13:42

Relatório de compras consta a usuária.
Matricula efetivada em 11/05/2025 12:15:09
Logs Geral:

---

### Ação #4 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 13/05/2025 13:45

Fanny,
Apenas para informação, a usuária está presente no relatório de compras:
Problema que identifiquei até o momento é a ausência da data.
Vou seguir na análise para trazer algo mais concreto para entendimento.

---

### Ação #5 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 13/05/2025 13:47

Turma configurada com Valor

---

### Ação #6 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 13/05/2025 15:50

Fanny, uma pergunta, por acaso ela efetivou o pagamento por fora da plataforma e vocês realizar a inclusão de matricula dela?

---

### Ação #7 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 13/05/2025 16:27

Precisava confirmar contigo uma questão se esses usuários também estão com esse problema:
André Cabral de Azevedo Alves
NILCIMARA CAMPOS

---

### Ação #8 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 14/05/2025 10:33

Em análise do time de desenvolvimento

---

### Ação #9 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 14/05/2025 10:41



---

### Ação #10 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 14/05/2025 11:13

Fanny encaminhou o comprovante de pagamento:
Problema está na visualização da Lector, que no relatório está trazendo informação errada.

---

### Ação #11 — 🔒 Ação Interna
**Autor:** Guilherme Raposo
**Data:** 14/05/2025 12:51

Ambas APIs da IPG por onde seria possível identificar a transação do pagamento respondem que a "loja" não tem permissão para usar estes recursos:
<SOAP-ENV:Envelope xmlns:SOAP-ENV="
http://schemas.xmlsoap.org/soap/envelope/
">
<SOAP-ENV:Header />
<SOAP-ENV:Body>
<ipgapi:IPGApiActionResponse xmlns:a1="
http://ipg-online.com/ipgapi/schemas/a1
"
xmlns:ipgapi="
http://ipg-online.com/ipgapi/schemas/ipgapi
"
xmlns:v1="
http://ipg-online.com/ipgapi/schemas/v1
">
<ipgapi:successfully>false</ipgapi:successfully>
<a1:Error Code="SGS-11111">
<a1:ErrorMessage>action is not allowed for the store</a1:ErrorMessage>
</a1:Error>
</ipgapi:IPGApiActionResponse>
</SOAP-ENV:Body>
</SOAP-ENV:Envelope>
Necessario realizar testes para compras com cartao de
DEBITO,
pois não temos nenhuma instância de uma compra assim efetuada com sucesso.

---

### Ação #12 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 15/05/2025 09:42

esqueci de apontr ontem.

---

### Ação #13 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 27/05/2025 14:01

testar compra via débito

---

### Ação #14 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 27/05/2025 16:25

Conversado com Alex, pediu pra ser retirado a opção de débito.

---

### Ação #15 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 27/06/2025 08:56

Não apresenta mais opção de débito no HML e em produção.
