# O que o Explorer Deve Capturar

Objetivo: reconstruir o funcionamento de um sistema posteriormente — **entendimento**, não volume de logs.

## 8 Camadas

1. **Navegação** — URLs, rotas, modais, abas, contexto
2. **Interações** — cliques, formulários, filtros (intenção, não teclas)
3. **Comunicação** — endpoints, payloads, respostas, timing
4. **Entidades** — objetos de negócio e operações observadas
5. **Fluxos** — sequências operacionais completas
6. **Evidências** — evento → visual → request → resposta → interpretação
7. **Comportamentos inferidos** — hipóteses sobre regras e dependências
8. **Contexto para IA** — resumo estruturado reutilizável

## Não capturar

Movimento de mouse, cada tecla, dados sensíveis desnecessários, eventos repetitivos sem valor.

**Critério:** "Isso ajuda a entender o sistema?"

## Perguntas ao encerrar sessão

- O que o sistema faz?
- Quais entidades e fluxos existem?
- Como navegar e como os dados circulam?
- Quais integrações e regras de negócio?
- Como reproduzir cada processo?