---
ticket_id: 9022
cliente: "CIGAM"
assunto: "ocultar usuários Lector"
categoria: "Solicitação de serviço"
responsavel: "Luiz Firmo"
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "cigam"
---

# Ticket 9022: ocultar usuários Lector

**Cliente:** CIGAM
**Categoria:** Solicitação de serviço
**Responsável:** Luiz Firmo
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9022)

---

## Histórico de Ações

### Ação #1 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 25/04/2025 15:15

Verificar a possibilidade de ocultar os administradores  do portal principal, entretando, mantendo as permissões.

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 19/05/2025 07:55

Análise

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 19/05/2025 08:09

- Flag Admin por portal

---

### Ação #4 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 20/05/2025 07:45

No /admin2, habilitar flag "Ocultar usuários Lector".
USUÁRIO LECTOR: Quando na base de dados o usuário tem "user_role" de Admin, Dev, Suporte, não foi considerado por emails nem nada, e sim por roles, se quiser ocultar é só solicitar que usuários X recebam alguma role que o identifique como Lector.
- Quando a flag está habilitada, ocultará do relatório da aba "Cadastros > Usuários", por enquanto somente neste relatório.
- Para usuários Lector, os usuários continuam exibindo, pois podemos ter a possibilidade de editar nossos usuários nestes portais.
- Para usuários comuns, os usuários Lector não listam no relatório.

---

### Ação #5 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 26/05/2025 15:56

Mesmo com a flag ainda busca os usuários Lector
Atenciosamente,
Thiago Clemente

---

### Ação #6 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 26/05/2025 17:12

Qual usuário logado foi utilizado no teste? Quais usuários estão listando e não deveriam apresentar?

---

### Ação #7 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 26/05/2025 17:31

Ocorre um Delay ao habilitar a flag. No mesmo momento que isso ocorreu ele não ocultou os usuários. após alguns minutos o sistema funcionou conforme o esperado.
Atenciosamente,
Thiago Clemente

---

### Ação #8 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 30/05/2025 17:36

O mesmo delay observado no teste anterior também ocorreu neste. No entanto, os usuários em questão foram ocultados corretamente. O teste foi executado conforme o esperado.
Atenciosamente,
Thiago Clemente

---

### Ação #9 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 05/06/2025 09:35

Bom dia,
Liberação realizada, agora usuários Lector não serão mais mostrados no portal:

---

### Ação #10 — 📧 Ação Pública
**Autor:** Sabrina Manzoni
**Data:** 23/06/2025 16:42

Olá pessoal, reabrindo este chamado pois a equipe lector está aparecendo no portal \cigamfalavinha:

---

### Ação #11 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 25/06/2025 15:03

Ainda está apresentando na aba de gerenciar os usuarios Lector

---

### Ação #12 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 26/06/2025 08:18

Desenvolvimento.

---

### Ação #13 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 06/08/2025 12:36

Desenvolvimento

---

### Ação #14 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 07/08/2025 17:24

Implementado.
Testar:
- Todas as abas do gerenciamento de matrículas
- Todas as abas do gerenciamento de trilhas
- Minha equipe
- Cadastros > Usuários
- Cadastros > Grupos > Editar grupo > aba Usuários > (+)
- Todos os relatórios (verificar se realmente os usuários Lector não aparecem e não são contabilizados nas somatórias/contagens)

---

### Ação #15 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 12/08/2025 10:18

Teste realizado devido a liberação HML
URL acessada:
https://www.hml.lector.live/cigamcorporativa/courses
Usuário utilizado no teste: Ocultar usuários Lector
usuarioslector@uorak.com
Teste Realizado:
Logado com um usuário teste com perfil de administrador, e verificado nas abas e ainda estão sendo apresentados os perfis da Lector.
- Todas as abas do gerenciamento de matrículas ❌
- Todas as abas do gerenciamento de trilhas ❌
- Minha equipe
- Cadastros > Usuários ✅
- Cadastros > Grupos > Editar grupo > aba Usuários > (+) ✅
- Todos os relatórios (verificar se realmente os usuários Lector não aparecem e não são contabilizados nas somatórias/contagens) ❌
Evidências:
- Todas as abas do gerenciamento de matrículas
- Todas as abas do gerenciamento de trilhas
- Cadastros > Usuários
- Todos os relatórios (verificar se realmente os usuários Lector não aparecem e não são contabilizados nas somatórias/contagens)

---

### Ação #16 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 12/08/2025 15:38

Corrigido:
- Treinamento > Gerenciar > Matriculados/Concluídos
- Trilha > Gerenciar > Não matriculados
- Relatórios > Treinamentos > Matrículas
Na aba Cadastros > Usuários e na nova tela de adicionar usuários no grupo, os usuários que estão aparecendo e que tem e-mail @lectortec.com.br só aparecem porque não estão configurados com ROLE da Lector.

---

### Ação #17 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 13/08/2025 19:09

Usuário:
usuarioslector@uorak.com
812.155.300-80
Logado com um usuário teste com perfil de administrador, e verificado nas abas e ainda estão sendo apresentados os perfis da Lector.
- Todas as abas do gerenciamento de matrículas ✅
- Conforme conversamos, nem todos os usuários com e-mail @lectortec.com.br sairiam da lista, na nossa webconferencia foi testado adicionando o cargo de suporte para o teste, então seria por cargo essa permissão?
- Todas as abas do gerenciamento de trilhas ✅
- Minha equipe ✅
- Cadastros > Usuários ✅
- Cadastros > Grupos > Editar grupo > aba Usuários > (+)  ✅
- Todos os relatórios (verificar se realmente os usuários Lector não aparecem e não são contabilizados nas somatórias/contagens) ❌
Ainda aparece os usuários aonde tem lupa de busca nos relatórios
Onde não possui a lupa de busca de usuários, mas tem "autor" ainda aparece no relatório os usuários da lector

---

### Ação #18 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 20/08/2025 10:07

Corrigido.
- Filtro de usuários
- Relatório de eventos

---

### Ação #19 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 20/08/2025 18:09

Reteste:
Matriculas OK
Não foi possivel gerar o relatório:

---

### Ação #20 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 21/08/2025 10:01

retestando relatórios de eventos
Está muito lento para gerar, mas o teste foi reprovado apresentou o meu registro para o Usuário:
usuarioslector@uorak.com
812.155.300-80

---

### Ação #21 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 25/08/2025 09:42

Testado e aprovado

---

### Ação #22 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 25/08/2025 09:47

Olá, bom dia!
Realizando o reteste após a liberação da ultima semana, foram implementadas as medidas de ocultar os usuários Lector das demais abas e relatórios.
- Cadastros>Usuários
- Gerenciar de Turmas (Treinamentos/Trilhas)
- Aba Relatórios
O relatório que ainda poderá ser apresentado o "Autor" com algum usuário da Lector é o de Eventos, pois o relatório não se refere a usuário e sim a gravações ou webconferencias realizadas dentro da plataforma. Caso oculto esse autor poderia haver desencontro de informações a serem disponibilizadas.

---

### Ação #23 — 📧 Ação Pública
**Autor:** Cristiano Pereira
**Data:** 28/08/2025 14:32

Boa tarde!
Realizado validação nos três locais indicados, que haviam sido identificados na abertura do chamado.
- Cadastros>Usuários
- Gerenciar de Turmas (Treinamentos/Trilhas)

---

### Ação #24 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 29/08/2025 14:06

Olá Cristiano!
Obrigado pela devolutiva, estou encerrando o chamado.
