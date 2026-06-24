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
│   ├── pages/           # Telas do MVP
│   ├── services/        # CRUD (localStorage → SQLite)
│   ├── types/           # Tool, Project, Prompt, Experiment
│   └── lib/             # db, mock-data, utils
├── src-tauri/           # Backend Rust (shell, SQLite, filesystem)
├── caios-data/          # Notas, logs, projetos, scripts auxiliares
├── obsidian-vault/      # Vault Obsidian (Brain, Lector, Projetos, Prompts…)
└── scripts/             # PTY server, Explorer, Movidesk, Open Design
```

### Obsidian

O vault local fica em `C:/Users/gcaio/OneDrive/Documentos/caio`. Uma cópia versionada dos documentos CaiOS está em `obsidian-vault/` neste repositório.

## Próximas fases

1. **Fase 2 — Tools**: abrir web/terminal/folder via Tauri Shell
2. **Fase 3 — Projects**: terminal na pasta do projeto
3. **Fase 4 — Prompts**: copiar e abrir com ferramenta
4. **Fase 5 — Lab**: logs persistentes
5. **Fase 6 — Notes**: Markdown em `caios-data/notes`

## Licença

Uso pessoal — Caio