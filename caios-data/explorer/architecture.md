# Módulo Explorer — Arquitetura Conceitual CaiOS

## Propósito

Aquisição, organização e preservação de conhecimento operacional através da observação direta da interação do usuário com sistemas externos.

O Explorer não é um navegador. É um mecanismo de aquisição de conhecimento.

## Princípios

1. **Simplicidade visual** — interface mínima, intencional
2. **Conhecimento primeiro** — memória organizacional, não logs
3. **Captura passiva** — usuário trabalha, sistema documenta

## Papel do Hermes

Observador cognitivo: identifica fluxos, agrupa ações, detecta padrões, nomeia processos, formula hipóteses, produz documentação progressiva.

## Componentes

- Browser/Preview — exploração do usuário
- Capture Layer — 8 camadas de observação
- Timeline — linha temporal contextual
- Hermes Insights — interpretação em tempo real
- Obsidian Sync — memória permanente
- Session Manager — ciclo de vida da investigação

## Modo Investigação

Para sistemas desconhecidos: mapas de fluxo, hipóteses, dependências, regras de negócio inferidas.

## Artefatos de sessão

Resumo, linha do tempo, fluxos, entidades, evidências, hipóteses, documentação funcional/técnica, base Obsidian.

## Estrutura Obsidian

```
CaiOS/Explorer/
├── Sessões/
├── Sistemas/
├── Fluxos/
├── Entidades/
├── Endpoints/
├── Evidências/
└── Relatórios/
```

Ver também: `capture-layers.md`, `wireframe.md`, `session-briefing.md`.