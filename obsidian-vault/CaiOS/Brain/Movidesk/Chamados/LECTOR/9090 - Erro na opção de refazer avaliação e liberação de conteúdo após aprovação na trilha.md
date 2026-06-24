---
ticket_id: 9090
cliente: "LECTOR"
assunto: "Erro na opção de refazer avaliação e liberação de conteúdo após aprovação na trilha"
categoria: "Problema"
responsavel: "Guilherme Raposo "
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "lector"
---

# Ticket 9090: Erro na opção de refazer avaliação e liberação de conteúdo após aprovação na trilha

**Cliente:** LECTOR
**Categoria:** Problema
**Responsável:** Guilherme Raposo 
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9090)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 07/05/2025 15:49

Descrição:
O sistema apresenta inconsistências na exibição da opção de refazer avaliações e na liberação do conteúdo na parte 2 da trilha. OFICIAL (trilhas e treinamentos)
Não funciona o botão "Liberar inscrição". Aparece o pop-up dizendo que foi liberado a tentativa, porém não libera para o aluno e quando volto como administradora, ainda aparece o botão como se não tivesse sido selecionado. Não sei se esse comportamente é correto, pois não tem limite de liberação.
Passo a passo para reproduzir:
Realizar teste sendo reprovado em uma trilha com mais de uma etapa e verificar se a segunda etapa é liberada mesmo reprovando no teste após todas as tentativas. (Nos testes que eu realizei estava bloqueado corretamente os próximos conteúdos no HML apenas)
Realizar teste sendo aprovado em uma trilha com mais de uma etapa e verificar se a segunda etapa é liberada no teste após ser aprovado.
Durante os testes, sair da página e tentar acessar novamente a avaliação, percebendo que as questões assinaladas não está gravado.
Ambiente:
Windows 11, Google Chrome Versão 134.0.6998.36 (Versão oficial) 64 bits
Evidências:
Os conteúdos da Etapa 2 foram liberados (em produção) mesmo sendo reprovada na prova anterior.
Em produção:
HML: (bloqueoou corretamente os próximos conteúdos)
Botão de LIBERAR INSCRIÇÃO nao libera tentativa no oficial

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Caio Gomes
**Data:** 29/12/2025 15:54

O botão de Liberar Inscrição fica em gerenciar > matriculados e concluídos >  selecione o usuario, no canto direito passe o mouse vai aparecer um botão "relatorio" .
Esse botão libera mais uma tentativa para o usuário realizar uma avaliação novamente.
Havia usado todas as minhas tentativas:
Clique em liberar inscrição:
aparece a mensagem de sucesso:
Liberou corretamente a tentativa:

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Caio Gomes
**Data:** 29/12/2025 15:58

Aqui temos dois problemas um sobre o botão não funcionar - testado ok
Etapa 2 não está bloqueando conteúdos  - testado ok
