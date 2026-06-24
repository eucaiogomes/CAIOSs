# CaiOS

**Caio + OS** — sistema operacional pessoal para ferramentas de IA.

> CaiOS não é um agente. CaiOS é o lugar onde você organiza e acessa todos os seus agentes, ferramentas, projetos, prompts e testes.

## MVP

### Fase 1 — Casca
- Layout com sidebar fixa e tema dark (laranja + azul profundo)
- Dashboard, Tools, Projects, Prompts, Lab, Notes, Terminal, Settings
- CRUD local via localStorage (camada pronta para SQLite/Tauri)
- Dados mock iniciais (Claude Code, Codex, Grok, Hermes, Obsidian, projetos)

### Fase 3 — Projects (implementada)
- **Projeto ativo** persistente no topbar (seletor global)
- **Detalhe completo**: editar, excluir, stats, links úteis, logs
- **Terminal na pasta** do projeto (quick actions: npm run dev, git status...)
- **Vincular prompts** e **criar notas** direto do projeto
- **Seletor de pasta** via Tauri dialog ao criar/editar projeto

### Fase 2 — Abrir ferramentas (implementada)
- **Terminal real** via PTY (`portable-pty`) quando rodando com Tauri
- **Web externa** via `tauri-plugin-opener` (Grok, Hermes)
- **Web interna** via iframe (`/tool/web`) ou janela Tauri dedicada
- **Pastas/apps** via `open_path` (Obsidian vault, executáveis)
- **Logs** de cada abertura de ferramenta em Settings

## Stack

| Camada | Tecnologia |
|--------|------------|
| Desktop | Tauri 2 + React + TypeScript |
| UI | Tailwind CSS v4 + componentes estilo shadcn |
| Storage (MVP) | localStorage |
| Storage (futuro) | SQLite + arquivos Markdown |
| Terminal | xterm.js |

## Rodar (só frontend)

```bash
cd caios
npm install
npm run dev
```

Abre em `http://localhost:1420`

## Rodar (desktop Tauri)

Requer [Rust](https://rustup.rs/) instalado:

```bash
# Instalar Rust (Windows)
winget install Rustlang.Rustup

# Depois
cd caios
npm install
npm run tauri dev
```

## Estrutura

```
caios/
├── src/                 # React frontend
│   ├── app/             # Layout, rotas
│   ├── components/      # Sidebar, cards, terminal, UI
│   ├── pages/           # Telas (Dashboard, Tools, Projects, Prompts, Lab, Notes, Terminal, Settings + extras)
│   ├── services/        # CRUD (localStorage → SQLite)
│   ├── types/           # Tool, Project, Prompt, Experiment...
│   └── lib/             # db, mock-data, utils, tauri-bridge
├── src-tauri/           # Backend Rust (shell, SQLite, filesystem, PTY, opener, dialog)
├── caios-data/          # Notas, logs, projetos, scripts auxiliares
├── obsidian-vault/      # Vault Obsidian (Brain, Lector, Projetos, Prompts…)
└── scripts/             # PTY server, Explorer, Movidesk, Open Design
```

### Obsidian

O vault local fica em `C:/Users/gcaio/OneDrive/Documentos/caio`. Uma cópia versionada dos documentos CaiOS está em `obsidian-vault/` neste repositório.

## Próximas fases

- **Fase 4 — Prompts**: copiar, editar e abrir com ferramenta recomendada
- **Fase 5 — Lab**: persistir experimentos + histórico completo
- **Fase 6 — Notes**: Markdown editing + arquivos reais em `caios-data/notes`
- **Expansão**: Integração mais profunda com Hermes, Explorer, Live Call e Open Design

**Status atual**: Fases 1, 2 e 3 implementadas + muitas extensões (Hermes, Brain, Mission Control, Lector etc).

## Licença

Uso pessoal — Caio