---
ticket_id: 9056
cliente: "Aché"
assunto: "Integração ACHÉ"
categoria: "Problema"
responsavel: "Luiz Firmo"
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "aché"
---

# Ticket 9056: Integração ACHÉ

**Cliente:** Aché
**Categoria:** Problema
**Responsável:** Luiz Firmo
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9056)

---

## Histórico de Ações

### Ação #9 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 24/04/2025 14:41

Conforme contato com Ricardo, o mesmo me posicionou que os usuários que que estavam faltando na plataformo foram integrados, entretanto, identificou outro problema.
Este novo problema seria com relação a visualização de conteúdos:
Print enviado via whatsapp
Identifiquei que essa usuária possui 2 cadastros na plataforma e pelo imagem disponibilizada me parece estar logada com o usuário inativo.
Realizei o acesso através do usuário ativo que consta na plataforma e está correta a apresentação:

---

### Ação #10 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 24/04/2025 14:42

Ricardo está verificando com a equipe interna do Aché e irá nos retornar para seguirmos nas análises.

---

### Ação #11 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 24/04/2025 16:01

Mariana Akemi
📎 Anexos: imagem (7).png

---

### Ação #12 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 24/04/2025 16:15

caso de duplicidade

---

### Ação #13 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 24/04/2025 16:43

id objeto da Mariana Akemi -
fe4396a7-d547-404b-86ba-e2a31f83a49a
id objeto da
Isabella Vicente de Brito -
953907ff-3c0d-49d4-9e8c-4f09094ff79a

---

### Ação #14 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 24/04/2025 16:50

Sempre informar quando houver problema para esses e-mails
morgabriel@ache.com.br
ricardo.antonio@ache.com.br

---

### Ação #15 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 25/04/2025 14:19

Problema na Integração com o Sistema APDATA:
1 - Timeout do lado do Aché:
Foi identificado um problema de timeout durante a integração proveniente do sistema APDATA. Esse ponto foi discutido em reunião realizada no dia 24/04.
Ação: O time do Aché realizará uma otimização no sistema para resolver o problema.
Usuários cadastrados diretamente pelo AD (Microsoft Entra ID):
Alguns usuários estão realizando login via Microsoft, mas, como não foram integrados através do APDATA, são criados como usuários sem os dados cadastrais completos. Isso resulta em problemas para visualizar conteúdos devido à ausência de permissões adequadas.
Ação: A Schutz implementará um aviso automático para notificar a equipe do Aché em casos de timeout, permitindo uma resposta mais ágil.
2 - Duplicação de Usuários:
Foram identificados casos de duplicação de usuários. Solicitamos as informações de ID Objeto para acompanhar os casos de duas usuárias:
Mariana Akemi: fe4396a7-d547-404b-86ba-e2a31f83a49a
Isabella Vicente de Brito: 953907ff-3c0d-49d4-9e8c-4f09094ff79a
Ação: Solicitamos ao time do Aché que ambas realizem um novo login para monitorar o comportamento do sistema. Estamos aguardando retorno.
3 - Problemas de Visualização de Conteúdos:
Os casos de usuários que relataram dificuldades para visualizar conteúdos foram analisados. Identificamos que esses problemas estavam relacionados diretamente à falha na integração, ou seja, os usuários não haviam sido integrados corretamente.

---

### Ação #16 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 30/04/2025 13:58

Ricardo me acionou no fim da manhã via whatsapp devido um problema na vinculação de hierarqui do usuário: JOSE CARLOS SANT ANNA JUNIOR
O mesmo está com o cadastro duplicado, 1 realizqado via APDATA e outro via AD (Microsoft Entra ID).
Necessário averiguar qual falha ocorreu com a integração via APDATA, pois a vinculação ocorreu de forma equivocada.

---

### Ação #17 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 30/04/2025 18:04

Há um problema com reaproveitamento de endereços de e-mail por parte do Aché. Já havia um usuário com e-mail
jose.junior@ache.com.br
. Na importação, por não ser possível cadastrar um novo usuário com o mesmo e-mail, a conta antiga é reaproveitada. Nesse caso específico, parece que já foi reaproveitado mais de uma vez.
Solução proposta:
Na integração, ao inativar um usuário, setar o e-mail para
"removido_{ID do colaborador}_{endereço original @ache.com.br}"
e remover o vínculo com Microsoft Entra (Azure AD).
Evitando, assim, qualquer duplicidade.

---

### Ação #18 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 07/05/2025 09:44

Ricardo entrou em contato comigo ontem pois usuários não foram integrados, solicitei uma validação ao time Lector, entretando as integrações dos ultimos dias rodaram.
Entretanto a ultima que trouxe novos usuários vindos do APDATA foi no dia 02/05.

---

### Ação #19 — 📧 Ação Pública
**Autor:** VITOR PEREIRA SILVA
**Data:** 07/05/2025 15:23

Olá, boa tarde! Espero que esteja bem (:
Ontem, o usuário CAIO RODRIGUES SANTOS, estava com problemas para acessar a UniAché, pois o perfil de Assistente Pl. dele estava inativado, assim como o de aprendiz (que de fato deveria estar). Via usuário master, eu ativei o perfil e ele prosseguiu com o acesso e treinamentos.
Hoje, para dar continuidade...ele não conseguiu acessar a plataforma, pois ela estava apresentando o seguinte erro:
​Como podemos regularizar o acesso dele?

---

### Ação #20 — 📧 Ação Pública
**Autor:** Thiago Clemente
**Data:** 07/05/2025 16:02

Boa tarde!
Vou analisar seu chamado. Te retorno por aqui.
Atenciosamente,
Thiago Clemente

---

### Ação #21 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 12/05/2025 09:02

Vitor, bom dia!
Poderia solicitar ao usuário CAIO RODRIGUES DOS SANTOS um novo login an plataforma, por gentileza?
Estamos analisando as possibilidades do erro que foi informado e precisamos recolher um novo log do sistema.

---

### Ação #22 — 📧 Ação Pública
**Autor:** VITOR PEREIRA SILVA
**Data:** 12/05/2025 09:29

Olá, bom dia! Espero que esteja bem (:
Gostaria de ajuda para compreensão de um caso que tem ocorrido com alguns perfis.
No caso da Julia Basques Masson, ela possui dois perfis o de Estagiária (que de fato deve estar inativado) e o de Analista (que estava inativado igualmente ao antigo, todavia não deveria). Para corrigir isso, eu via "perfil master" estou ativando novamente a pessoa para não impactar na realização dos conteúdos de onboarding.
Como podemos solucionar?
Abs

---

### Ação #23 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 12/05/2025 09:38

Bom dia Vitor, tudo bem?
Creio que seja o mesmo comportamento do usuário CAIO RODRIGUES DOS SANTOS, que foi colocado no chamado 9094. No caso do Caio peço que se for possivel ele realize uma novo login, estamos coletando informações para repassar um diagnostico correto.
Recomento não realizar ativações por meio do perfil Master, essa informação deve vir sempre do APDATA, qualquer alteração manual intervere na análise e condicionalmente poderá causar problemas futuros.

---

### Ação #24 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 12/05/2025 10:19

Correção problema Lock Wait Timeout na inserção de permissões
Execução manual de integração para 2439 usuários
Verificação log de erros
Exclusão de tarefas pendentes sem endereço de e-mail
Tratamento específico para situação atípica do Caio

---

### Ação #25 — 📧 Ação Pública
**Autor:** VITOR PEREIRA SILVA
**Data:** 12/05/2025 15:04

Olá, Luiz! Tudo certo.
Combinado, obrigado por sinalizar. Estou aguardando a devolutiva do Caio, e te retorno com o desfecho.
Abs

---

### Ação #26 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 12/05/2025 15:05

Ok, obrigado Vitor!
Fico no aguardo.

---

### Ação #27 — 📧 Ação Pública
**Autor:** VITOR PEREIRA SILVA
**Data:** 12/05/2025 15:06

Olá, boa tarde!
Solicitei ao Caio, assim que ele me retornar encaminho para vocês. Hoje ele está em evento externo, então demorará um pouco.
Abs

---

### Ação #28 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 12/05/2025 16:24

OK, obrigado Vitor!
Ficamos no aguardo.

---

### Ação #29 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 13/05/2025 17:05

Boa tarde Vitor,
Teve algum retorno sobre o caso do Caio?

---

### Ação #30 — 📧 Ação Pública
**Autor:** VITOR PEREIRA SILVA
**Data:** 14/05/2025 09:07

Boa tarde, Luiz!
Ele informou que permanece a primeira tela que enviei.

---

### Ação #31 — 📧 Ação Pública
**Autor:** VITOR PEREIRA SILVA
**Data:** 14/05/2025 09:09

Boa tarde, Luiz!
Ele havia informado que permanecia a primeira tela que enviei.
Realizei uma edição manual por curiosidade, e liberou para ele.

---

### Ação #32 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 14/05/2025 09:46

Olá Vitor, bom dia!
Qual alteração especificamente que foi realizada?

---

### Ação #33 — 📧 Ação Pública
**Autor:** VITOR PEREIRA SILVA
**Data:** 14/05/2025 10:54

Busquei o perfil dele em "usuários", cliquei no botão "ativar usuário", depois editei o e-mail e atribui o perfil aluno, salvei e conferi com ele.
Mas, acredito que na próxima integração isso vai cair.

---

### Ação #34 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 16/05/2025 10:32

Reunião ache, debatemos sobre problemas na integração:
- Solicitado reteste para dois usários efetuarem login
- duvidas gerais de permissão
- pendnete o caso do usuário Caio, print abaixo:

---

### Ação #35 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 16/05/2025 15:26

Reunião com Adriana, Ricardo e Vitor.
O caso do Caio parece ser algo corrompido no database de produção. As mesmas informações quando copiadas para minha base local ou para o HML funcionam normalmente.
No ambiente de produção, corrigi da seguinte maneira: criei uma nova linha na tabela de importação com exatamente as mesmas informações (Ctrl C, Ctrl V), rodei e funcionou.
Deixei a linha com problema salva no database para histórico. Marquei ela com status ERROR (tabela import_users_register, id 176289).
Sobre os outros 11 usuários que constam no database como pendentes de integração, os que vieram no dia 13/05 estão OK na plataforma (marcados como ATIVO e com cadastro completo). Os que vieram no dia 15/05 não estão OK. Alguns marcados como INATIVOS, outros sem cadastro e outros com o ID de matrícula incorreto (possivelmente porque eram estagiários e foram promovidos).
Segue lista dos que apareceram no dia 15/05 sem endereço de e-mail:
-- LEONARDO FERREIRA - 187880
-- JULIANA ELZA DE ARAUJO SILVA - 187881
-- BRUNO BARRETO DE OLIVEIRA - 187882
-- ANNELISE AZEREDO VIEIRA - 187883
-- ALINY LEIRY SILVA - 54723
Esses códigos são os IDs desses usuários no sistema APData do Aché.

---

### Ação #36 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 16/05/2025 15:45

Boa tarde pessoal,
Sobre o caso do Caio Rodrigues dos Santos, o Ricardo (Lector) encontrou um problema relacionado ao database, aonde ocorria problema. Realizado o ajuste, ativado usuário. Faremos o monitorament do mesmo.
Além disto idenficamos um problema relacionado a alguns usuários:
Segue lista dos que apareceram no dia 15/05 sem endereço de e-mail:
-- LEONARDO FERREIRA - 187880
-- JULIANA ELZA DE ARAUJO SILVA - 187881
-- BRUNO BARRETO DE OLIVEIRA - 187882
-- ANNELISE AZEREDO VIEIRA - 187883
-- ALINY LEIRY SILVA - 54723

---

### Ação #37 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 19/05/2025 11:35

Conversado com Ricardo (Aché) sobre a solicitação que realizamos em reunião, para que 2 usuário refaçam os logins.
Aguardando retorno.

---

### Ação #38 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 19/05/2025 17:54

Implementação para alterar a forma de inativação de usuários
Estava inativando por CPF. Alterado para inativar por código de matrícula.
Feita alteração manual no usuário Caio novamente.

---

### Ação #39 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 20/05/2025 08:55

Correção manual do cadastro e execução de rotina de integração somente para este usuário

---

### Ação #40 — 📧 Ação Pública
**Autor:** VITOR PEREIRA SILVA
**Data:** 21/05/2025 09:39

Olá, bom dia! Espero que estejam bem (:
Gostaria de apoio, pois estou buscando o usuário :
JOSE BARTOLOMEU FREITAS HENRIQUES ACIOLI LINS JUNIOR
E ele não aparece.
Abs

---

### Ação #41 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 21/05/2025 10:27

Olá, bom dia Vitor,
Precisamos de uma resposta mais técnica para prestar o apois necessário neste caso.
Quem é o usuário cujo OID na Azure é 6631ab5b-74b6-40c6-8218-bc5e210c4d1b?
Precisaremos de alguem responsavel do AD pra retornar esse questionamento.

---

### Ação #42 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 22/05/2025 16:08

Ricardo me acionou via whats e encaminhou que o usuário está com nome errado.
Analisar pois é um caso de reaproveitamento de e-mail, quando o Jose Bartolomeu fez login, puxa o cadastro:

---

### Ação #43 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 23/05/2025 10:36

Estão com problema nos usuários:
- JOSE BARTOLOMEU FREITAS HENRIQUES ACIOLI LINS JUNIOR
- CAIO RODRIGUES SANTOS
José Bartolomeu: é um caso anterior à correção feita sobre reaproveitamento de endereços de e-mail. Estamos aguardando retorno deles sobre quem é o usuário que está logando no AD com o OID vinculado a essa conta na Lector. Precisamos dessas informações da Azure para entender o que houve e podermos criar o vínculo manualmente. Último usuário que acessou essa conta via MS Entra (Azure AD) possui OID 6631ab5b-74b6-40c6-8218-bc5e210c4d1b
Caio Rodrigues: há 2 registros de demissão desse usuário no APData e 1 registro de admissão. A inativação de usuários no portal está sendo feita por CPF e isso causa a inativação desse usuário todos os dias. Já foi corrigido e está em testes.
Estamos aguardando deles correção de desempenho da API do APData. Muitas vezes a integração falha por timeout. Hoje, estamos contornando a situação fazendo várias tentativas em sequência em caso de falha

---

### Ação #44 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 27/05/2025 15:27

Olá, boa tarde pessoal,
Não tivemos retorno sobre o questionamento do dia 21/05/2025
Caso não seja esse OID do José Bartolomeu, peço que nos enviem o correto.
Luiz Firmo
21/05/2025 10:27
41
Olá, bom dia Vitor,
Precisamos de uma resposta mais técnica para prestar o apoio necessário neste caso.
Quem é o usuário cujo OID na Azure é 6631ab5b-74b6-40c6-8218-bc5e210c4d1b?
Precisaremos de alguem responsavel do AD pra retornar esse questionamento.

---

### Ação #45 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 28/05/2025 13:35

Encaminhando novamente a solicitação a pedido do Ricardo (Aché).

---

### Ação #46 — 📧 Ação Pública
**Autor:** Ricardo Antonio de Carvalho
**Data:** 28/05/2025 15:14
**Via E-mail de:** Ricardo Antonio de Carvalho <ricardo.antonio@ache.com.br>

Restrito
ObjectId.: 6631ab5b-74b6-40c6-8218-bc5e210c4d1b
Nome.: (FV) Jose Bartolomeu Freitas Henriques Acioli Lins Junior
Matrícula.: 187203
E-mail.: jose.acioli@ache.com.br
Login.: jlahfbjose
UPN.: jlahfbjose@ache.com.br
ObjectId.: bf9b0fd3-39fd-4a20-b2b8-275c0c721859
Nome.: (FV) Jose Carlos Sant’Anna Junior
Matrícula.: 187736

---

### Ação #47 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 28/05/2025 15:19

Obrigado Ricardo, estou direcionando para a equipe!

---

### Ação #48 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 29/05/2025 08:29

Bom dia pessoal, realizamos a conferencia com os dados encaminhados e realizamos alguns ajustes.
Precisamos agora que ambos os usuários façam o login na plataforma para verificar se o ajuste está correto.
JOSE BARTOLOMEU FREITAS HENRIQUES ACIOLI LINS JUNIOR
JOSE CARLOS SANT ANNA JUNIOR

---

### Ação #49 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 29/05/2025 10:36

Verificação e ajustes

---

### Ação #50 — 📧 Ação Pública
**Autor:** VITOR PEREIRA SILVA
**Data:** 30/05/2025 08:43

Olá, bom dia!
Um deles deu certo!!!
Acessou com os dados corretamente.

---

### Ação #51 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 30/05/2025 10:38

Olá, bom dia!
Obrigado pela devolutiva Vitor! Aguardamos a confirmação do segundo usuário se for possivel.

---

### Ação #52 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 29/06/2025 17:17

.

---

### Ação #53 — 📧 Ação Pública
**Autor:** 
**Data:** 12/09/2025 10:09

Prezado(a),
Informamos que o chamado
8843
, foi fechado automaticamente devido à inatividade, nossa ultima ação ocorreu em
30/05/2025 10:38 (UTC-03:00 Horário de Brasília (Bahia)).
Caso necessário pedimos que retorne esta mensagem para reabrir a solicitação.

---

### Ação #54 — 📧 Ação Pública
**Autor:** 
**Data:** 22/09/2025 15:09

Prezado(a),
Informamos que o chamado
8843
, foi fechado automaticamente devido à inatividade, nossa ultima ação ocorreu em
12/09/2025 10:09 (UTC-03:00 Horário de Brasília (Bahia)).
Caso necessário pedimos que retorne esta mensagem para reabrir a solicitação.

---

### Ação #55 — 📧 Ação Pública
**Autor:** 
**Data:** 02/10/2025 18:02

Prezado(a),
Informamos que o chamado
8843
, foi fechado automaticamente devido à inatividade, nossa ultima ação ocorreu em
22/09/2025 15:09 (UTC-03:00 Horário de Brasília (Bahia)).
Caso necessário pedimos que retorne esta mensagem para reabrir a solicitação.

---

### Ação #56 — 📧 Ação Pública
**Autor:** 
**Data:** 09/10/2025 18:06

Prezado(a),
Informamos que o chamado
8843
, foi fechado automaticamente devido à inatividade, nossa ultima ação ocorreu em
02/10/2025 18:02 (UTC-03:00 Horário de Brasília (Bahia)).
Caso necessário pedimos que retorne esta mensagem para reabrir a solicitação.

---

### Ação #57 — 📧 Ação Pública
**Autor:** 
**Data:** 16/10/2025 18:10

Prezado(a),
Informamos que o chamado
8843
, foi fechado automaticamente devido à inatividade, nossa ultima ação ocorreu em
09/10/2025 18:06 (UTC-03:00 Horário de Brasília (Bahia)).
Caso necessário pedimos que retorne esta mensagem para reabrir a solicitação.

---

### Ação #58 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 17/10/2025 11:06

Chamado encerrado por inatividade.
