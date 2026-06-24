---
ticket_id: 9058
cliente: "LECTOR"
assunto: "Problema para continuar compra ESMP"
categoria: "Sugestão / Melhoria"
responsavel: "Luiz Firmo"
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "lector"
---

# Ticket 9058: Problema para continuar compra ESMP

**Cliente:** LECTOR
**Categoria:** Sugestão / Melhoria
**Responsável:** Luiz Firmo
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9058)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 30/04/2025 14:02

Modelqagem da continuação de compra
cancelar
incluir novo cupom

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 08/05/2025 11:22

Descrição:
Cupom novo sendo aplicado corretamente mais de uma vez.
Botão de continuar compra não funciona.
Ambiente:
Windows 11, Google Chrome Versão 134.0.6998.36 (Versão oficial) 64 bits
Evidências:

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 12/05/2025 10:54

Descrição:
Ao efetuar uma compra no portal externo utilizando um cupom, o sistema abre a tela de pagamento. Após fechar a tela de pagamento sem finalizar a compra, o usuário deveria ser capaz de retornar à seção "Minhas compras" e visualizar a compra pendente com a opção de prosseguir com o pagamento ou cancelar o pedido. O sistema não deveria apresentar a mensagem de "Aguardando a confirmação do..." indefinidamente.
- No oficial apresenta o botão de "efetuar pagamento" do lado do "Aguardando a confirmação do..."
- No HML só apresenta o "Aguardando a confirmação do..."
Ambiente:
Windows 11, Google Chrome Versão 134.0.6998.36 (Versão oficial) 64 bits
HML - Sicredi:
Oficial:

---

### Ação #4 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 13/05/2025 10:06

Não consigo clicar em continuar compra.
O botão apresentou erro em outro treinamento.
E no portal ext não apresenta continuar.

---

### Ação #5 — 🔒 Ação Interna
**Autor:** Guilherme Raposo
**Data:** 13/05/2025 10:10

Portal com uso do Banco do Brasil:
Situação 1:
Ao clicar em comprar/efetuar pagamento, mostra o modal para aplicar cupom. Se fechar o modal ou sair da tela de compra, ao retornar deve mostrar o mesmo botão. Ao clicar, deve mostrar o modal de aplicar cupom novamente.
Situação 2: Ao
clicar em efetuar compra no modal de aplicar cupom, gera o boleto e mostra o modal do boleto. Se fechar o modal ou sair da tela de compra, ao retornar mostra o botão de continuar compra. Ao clicar em continuar compra, não exibe mais o modal do cupom, indo direto para o boleto.
Portal com uso do Sicredi:

---

### Ação #6 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 13/05/2025 13:31

Realizado os testes em produção e no HML.
Descrição:
No oficial:
Botão de continuar compra resulta em erro ao baixar boleto, pois estava puxando a compra de outro usuário.
Apresenta botão de aguardando confirmação de pagamento, e não consigo voltar ao modal.
HML:
Extensão interferindo na primeira impressão do boleto.
Ambiente:
Windows 11, Google Chrome Versão 134.0.6998.36 (Versão oficial) 64 bits
Evidências:

---

### Ação #7 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 13/05/2025 15:56

Botão não está funcionando para o teste, conforme chamado 9130.
Teste no HML.
Teste com aprovação do gestor não consegui concluir.
Teste sem aprovação do gestor apresenta corretamente o botão de pagamento e após isso, continuar a compra levando para o boleto.
Teste sem aprovação do gestor em turma mas com aprovação de cupom não apresenta nenhum botão.
- Teste sem aprovação do gestor apresenta corretamente o botão de pagamento e após isso, continuar a compra levando para o boleto.
---
- Teste sem aprovação do gestor em turma mas com aprovação de cupom não apresenta nenhum botão.

---

### Ação #8 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 14/05/2025 12:01

Problema para continuar compra

---

### Ação #9 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 15/05/2025 15:48

Conseguimos continuar compras sem problemas, testes de compras realizados por Miakelle e Thiago.

---

### Ação #10 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 16/05/2025 08:01

correções

---

### Ação #11 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 22/05/2025 12:00

Ajustado, já está OK.
