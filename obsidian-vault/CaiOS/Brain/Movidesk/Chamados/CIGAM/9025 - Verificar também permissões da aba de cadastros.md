---
ticket_id: 9025
cliente: "CIGAM"
assunto: "Verificar também permissões da aba de cadastros"
categoria: "Problema"
responsavel: "Thiago Clemente"
servico: "Desenvolvimento"
tags:
  - chamados_movidesk
  - "cigam"
---

# Ticket 9025: Verificar também permissões da aba de cadastros

**Cliente:** CIGAM
**Categoria:** Problema
**Responsável:** Thiago Clemente
**Serviço:** Desenvolvimento
**Link:** [Ver no Movidesk](https://lectortec.movidesk.com/Ticket/Edit/9025)

---

## Histórico de Ações

### Ação #1 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 25/04/2025 15:27

Não é possivel colocar permissões específicas a partir de regras de valor:

---

### Ação #2 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 20/05/2025 07:46

Implementado, agora exibe o "editar" na aba, podendo editar permissões igual demais abas.
OBS: Algumas abas possuem endpoints internos que validam permissões fixas tipo "É admin", então mesmo concedendo permissão em alguma aba, pode ser que o sistema ainda valide alguma ação de criar/listar/editar/remover interna, exemplo: Criar instrutor, pode ter algum local do código que valide permissão de outro local ou alguma permissão fixa, então é algo bem extenso de se analisar.
No caso de receber erro em alguma ação dentro dessas abas, me informe, porém a alteração interna delas pode ser bem longa e requer bastante testes depois, pois é uma "refatoração" de permissões em várias abas ao mesmo tempo.

---

### Ação #3 — 🔒 Ação Interna
**Autor:** Thiago Clemente
**Data:** 29/05/2025 09:18

Realizei o teste colocando as permissões conforme print
Salvei e não aparece para os usuários, tento perfil quanto cargo.
Teste com usuário:
xiomara5987@uorak.com
Atenciosamente,
Thiago Clemente

---

### Ação #4 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 29/05/2025 10:53

Correções, também foi corrigido botões internos de cada aba e endpoints que continham permissões fixas no servidor.
Exemplo de botões internos das abas: "Criar Regra de Valor", "Editar Regra de Valor", "Remover Regra de Valor".
Exemplo de endpoints: "Listar certificados", "Atualizar imagem do certificado", validava se o perfil atual é admin.
OBS: abas "LTI" e "Instrutores" podem não funcionar ações de Salvar ou Remover e etc... por serem módulos já com problemas, estes não são problemas de agora e devem ser corrigidos externamente, o foco dessas duas abas é apenas exibir/ocultar aba mesmo.

---

### Ação #5 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 29/05/2025 11:36

Não está liberando acesso a algumas categorias da aba cadastro para o usuario
qualidade@lectortec.com
, estou como administrador.
Print do Luiz de como deveria estar:

---

### Ação #6 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 29/05/2025 11:39

Acabou acarretando também na permissão de visualização da turma, quando adiciono consta meu usuário, mas depois para salvar dá erro e não apresenta mais.

---

### Ação #7 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 29/05/2025 13:51

Gerado traduções das permissões de cadastros e configurações

---

### Ação #8 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 30/05/2025 08:33

Descrição:
Apenas uma linha apresenta o idioma errado ainda.
Apenas esse ajuste.
Ambiente:
Windows 11, Google Chrome Versão 134.0.6998.36 (Versão oficial) 64 bits - HML
Evidências:
Como estava:
Atualmente, apenas um alvo está com o idioma errado.

---

### Ação #9 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 30/05/2025 14:30

A correção da tradução de Centros de Custos requer uma nova liberação, não afeta nenhuma funcionalidade pois é apenas um arquivo de traduções. Pendente apenas liberar.

---

### Ação #10 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 30/05/2025 14:40

Combinado com o Santos que faremos a liberação desse ajuste na proxima liberação.

---

### Ação #11 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 30/05/2025 15:55

Corrigido tradução

---

### Ação #12 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 02/06/2025 08:33

Está OK

---

### Ação #13 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 02/06/2025 11:24

Testar usuários que não fazem parte da Lector.

---

### Ação #14 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 02/06/2025 11:30

Descrição:
Não consta algumas categorias para o usuário
mika@uorak.com
Ambiente:
Windows 11, Google Chrome Versão 134.0.6998.36 (Versão oficial) 64 bits - HML
Evidências:

---

### Ação #15 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 02/06/2025 11:46

Verificado com Raposo e com Santos e foi resolvido.

---

### Ação #16 — 🔒 Ação Interna
**Autor:** Guilherme Santos
**Data:** 03/06/2025 08:13

Corrige aba cupons

---

### Ação #17 — 📧 Ação Pública
**Autor:** Mikaelle da Silva Peixer
**Data:** 05/06/2025 10:53

Descrição:
Permissões funcionando corretamente para aba cadastro.

---

### Ação #18 — 📧 Ação Pública
**Autor:** Luiz Firmo
**Data:** 05/06/2025 15:20

Verificar opções da aba de configurações pois permissões não estão sendo aplicadas:
Não apresenta informação com base na permissão concedida.
Não aplica as permissões definidas

---

### Ação #19 — 🔒 Ação Interna
**Autor:** Luiz Firmo
**Data:** 10/06/2025 10:45



---

### Ação #20 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 10/06/2025 10:48

Na aba "Temas" a permissão não tem efeito.
Nas outras abas, a tabela de permissões não apresenta a coluna "Ação"

---

### Ação #21 — 🔒 Ação Interna
**Autor:** Mikaelle da Silva Peixer
**Data:** 16/06/2025 16:31

Descrição:
Testado e funcionando corretamente as permissões.
Ambiente:
Windows 11, Google Chrome Versão 134.0.6998.36 (Versão oficial) 64 bits - HML
Evidências:

---

### Ação #22 — 🔒 Ação Interna
**Autor:** Ricardo Schutz
**Data:** 17/06/2025 17:03

Corrigido

---

### Ação #23 — 📧 Ação Pública
**Autor:** Sabrina Manzoni
**Data:** 25/06/2025 16:46

Teste ok, pode encerrar o chamado

---

### Ação #24 — 📧 Ação Pública
**Autor:** Thiago Clemente
**Data:** 26/06/2025 08:34

Bom dia !
Chamado encerrado.
Atenciosamente,
Thiago Clemente
