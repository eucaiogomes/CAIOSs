---
ticket_id: 9024
cliente: "CIGAM"
assunto: "Verificar sobre a permissão de agrupamento de usuários"
categoria: "Problema"
responsavel: "Luiz Firmo"
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "cigam"
---

# Ticket 9024: Verificar sobre a permissão de agrupamento de usuários

**Cliente:** CIGAM
**Categoria:** Problema
**Responsável:** Luiz Firmo
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9024)

---

## Histórico de Ações

### Ação #1 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 25/04/2025 15:24

Usuários Gestores apenas deve visualizar os usuários

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 06/05/2025 08:21

Não respeita apenas o "Visualizar" concede permissão para editar / remover / criar

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 19/05/2025 07:56

corrigido
Aplicar permissão do grupo ao editar o perfil, após isto, a permissão deve ser respeitada dentro da aba Usuários, exibindo somente botões com ações que possui permissão, exemplo botão de "Editar", botão de "Criar", botão de "Remover"

---

### Ação #4 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 26/05/2025 17:28

Teste
Atenciosamente,
Thiago Clemente

---

### Ação #5 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 26/05/2025 17:54

Teste
Atenciosamente,
Thiago Clemente

---

### Ação #6 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 27/05/2025 09:37

Não esta flegado a opção criar, ao alterar o perfil para Gestor esta aparecendo o botão de criar conforme print
Ao flegar a opção editar o sistema salva a ação. E ao acessar o perfil Gestor a ação editar não esta liberada. Conforme print.
Atenciosamente,
Thiago Clemente

---

### Ação #7 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 27/05/2025 09:46

Criar: Corrigido
Editar: Corrigido

---

### Ação #8 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 28/05/2025 15:33

Realizado teste, as funcionalidades estão de acordo com o esperado. Verificar apenas a lentidão
Após acrescentar um ação, a tela fica desta maneira. Leva algum tempo para sair da tela.
Atenciosamente,
Thiago Clemente

---

### Ação #9 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 30/05/2025 17:17

Testado e funcionando corretamente.

---

### Ação #10 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 05/06/2025 10:22

Descrição:
Testado e as funções correspondem conforme a permissão corretamente.

---

### Ação #11 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 05/06/2025 15:10

Verificar pois o "Editar" o grupo / cargo libera editar usuários e isso não deve acontecer pois o gestor poderá trocar informações.

---

### Ação #12 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 16/06/2025 16:51

Descrição:
Não consigo ver as permissões de gestor que eu coloquei, aparentemente ele está ocultando várias permissões.
Consegui excluir em um momento, e depois não apareceu mais a permissão de criar.
Não apresenta spinner.
Ambiente:
Windows 11, Google Chrome Versão 134.0.6998.36 (Versão oficial) 64 bits - HML
Evidências:

---

### Ação #13 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 17/06/2025 17:00

Corrigido

---

### Ação #14 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 17/06/2025 18:04

Verificação de bug. Não há permissão específica para visualizar usuários sem editar.

---

### Ação #15 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 20/06/2025 09:34

Criação de permissões específicas para a aba Cadastros > Usuários

---

### Ação #16 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 23/06/2025 14:58

Permissões visíveis conforme o esperado.
Atenciosamente,
Thiago Clemente

---

### Ação #17 — 🔒 Ação Interna
**Autor:** Sabrina Manzoni
**Data:** 25/06/2025 16:45

Teste falhou, verificar juntamente chamado 9127

---

### Ação #18 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 31/07/2025 11:08

.

---

### Ação #19 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 05/08/2025 11:40

Falta detalhar que parte falhou. Parece funcionar corretamente.

---

### Ação #20 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 05/08/2025 14:32

Essa tarefa trata especificamente sobre a aba de cadastros, então realizando o teste comum usuário tendo perfil "Gestor"
Usuário sem nenhuma permissão concedida na aba de Cadastros - OK
Cadastros Usuários:
Permissão e "Acessar" Cadastros>Usuários - OK

---

### Ação #21 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 05/08/2025 14:47

Ação anterior bugou no momento em que fui postar e não computou as informações corretas.
Cadastros usuários, opção de "Excluir" não tem a opção e ainda deixa realizar a edição do usuário:
Quando aplicado o "Criar" tanto para
Grupo,
quanto para
Cargo
, habilita o menu de usuários:

---

### Ação #22 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 05/08/2025 14:52

Obs. Todas as permissões testei individualmente, sempre adicionando e removendo a anterior.

---

### Ação #23 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 07/08/2025 17:35

.

---

### Ação #24 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 08/08/2025 11:36

Corrigido.
- Agora, quando há somente permissão de excluir, mostra somente informações mínimas do usuário e não permite editar
- Permissão para criar/editar Cargos ou Grupos não dá mais acesso à aba Cadastros > Usuários

---

### Ação #25 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 12/08/2025 14:15

Realizado os testes removendo e adicionando todas as permissões para gestor, e não houve problema.

---

### Ação #26 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 26/08/2025 09:34

- Está deixando editar a categoria mesmo sem permissão pra edição
Mesmo adicionando todas as permissões, não consigo adicionar usuários no grupo como gestor resultando em erro.

---

### Ação #27 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 26/09/2025 19:19

Corrigido

---

### Ação #28 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 29/09/2025 16:43

Mesmo só tendo permissão pra acessar, está sendo possível editar o grupo e criar. Só não consigo excluir.

---

### Ação #29 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 30/09/2025 07:56

Problema não está na implementação. Existe alguma outra permissão atribuída a esse usuário ou a algum grupo que ele pertence que está permitindo editar. Com outros usuários não foi possível reproduzir.

---

### Ação #30 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 30/09/2025 09:53

Existe uma permissão para o perfil Administrador - Todos que permite que este usuário edite os grupos.
Remover essa permissão, impede que o administrador edite. Portanto, não pode ser removida.
Encontrada outra permissão em Cadastros > Perfis > Gestor > Editar > Permissões de cadastro. Havia permissões de edição, acesso, criação e remoção sem target.
Essas permissões foram removidas diretamente no banco de dados.

---

### Ação #31 — 🔒 Ação Interna
**Autor:** Guilherme Raposo
**Data:** 30/09/2025 09:54

Removidas as permissoes, fica aqui como backup
insert into permission
(id,account_id,user_id,group_id,`action`,`type`,`start`,expires,template,parent_id,`generated`)
values
(5624862,2773,NULL,89957,'EDIT',2,NULL,NULL,0,NULL,0),
(5624861,2773,NULL,89957,'ACCESS',2,NULL,NULL,0,NULL,0),
(5624863,2773,NULL,89957,'CREATE',2,NULL,NULL,0,NULL,0)
;
insert into group_permission
(permission_id,target_group_id,grouping_level_id)
values
(5624862,NULL,NULL),
(5624861,NULL,NULL),
(5624863,NULL,NULL)
;

---

### Ação #32 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 30/09/2025 11:18

As permissões estão sendo apresentadas corretamente cada uma, porém se eu removo todas para o gestor, ela ainda aparece a aba, porém não consigo clicar nela. Se somente mudar de perfil de adm pra gestor, ele vai aparecer, ai se tu sai e tenta voltar ele não deixa

---

### Ação #33 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 30/09/2025 11:48

Acontece porque o usuário em questão possui permissões em alvos específicos e não nos gerais.
Exemplo:
Há uma permissão configurada para o perfil "
Gestor - CLIENTESS
" permitindo que quem possui esse perfil
EDITE
a unidade
CLIENTESS
Nesse caso, qual deveria ser o comportamento esperado?
A) Ocultar a aba Cadastros
B) Exibir a aba Cadastros, sub-aba Clientes, permitindo que esse perfil usufrua da permissão que lhe foi concedida

---

### Ação #34 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 30/09/2025 12:46

Verificação de detalhes junto com Mikaelle

---

### Ação #35 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 30/09/2025 13:36

Conforme conversado com Alex, será liberado ela desta forma pois não impacta a liberação. Vou abrir um chamado novo para o problema em questão que irá precisar de uma implementação. 10062

---

### Ação #36 — 🔒 Ação Interna
**Autor:** Guilherme Raposo
**Data:** 01/10/2025 08:01

Ajudando Schutz a identificar o problema
duplicado

---

### Ação #37 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 01/10/2025 16:47

Testado no oficial e não teve problemas.

---

### Ação #38 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 02/10/2025 13:40

Testado no oficial e não teve problemas.
