"""Gera índices navegáveis do Brain CaiOS para chamados Movidesk."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from datetime import datetime
from pathlib import Path

VAULT = Path(r"C:\Users\gcaio\OneDrive\Documentos\caio")
BRAIN_ROOT = VAULT / "CaiOS" / "Brain" / "Movidesk"
CHAMADOS_DIR = BRAIN_ROOT / "Chamados"
CATALOGO_DIR = BRAIN_ROOT / "_catalogo"
BASE_URL = "https://lectortec.movidesk.com"

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)
FIELD_RE = re.compile(r"^(\w+):\s*(.*)$", re.MULTILINE)


def parse_frontmatter(text: str) -> dict[str, str]:
    match = FRONTMATTER_RE.search(text)
    if not match:
        return {}
    data: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        data[key.strip()] = value.strip().strip('"')
    return data


def ticket_link(path: Path) -> str:
    rel = path.relative_to(VAULT).with_suffix("")
    return f"[[{rel.as_posix()}|{path.stem}]]"


def write_md(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def build_catalog() -> dict:
    tickets: list[dict] = []

    if not CHAMADOS_DIR.exists():
        return {"total": 0, "clientes": 0, "categorias": 0, "servicos": 0}

    for md_file in CHAMADOS_DIR.rglob("*.md"):
        meta = parse_frontmatter(md_file.read_text(encoding="utf-8", errors="ignore"))
        ticket_id = meta.get("ticket_id") or md_file.stem.split(" - ", 1)[0]
        tickets.append(
            {
                "id": ticket_id,
                "cliente": meta.get("cliente") or md_file.parent.name,
                "assunto": meta.get("assunto") or md_file.stem,
                "categoria": meta.get("categoria") or "Sem categoria",
                "responsavel": meta.get("responsavel") or "Sem responsável",
                "servico": meta.get("servico") or "Sem serviço",
                "path": md_file,
            }
        )

    tickets.sort(key=lambda t: int(re.sub(r"\D", "", t["id"]) or "0"))

    by_cliente: dict[str, list] = defaultdict(list)
    by_categoria: dict[str, list] = defaultdict(list)
    by_servico: dict[str, list] = defaultdict(list)
    by_responsavel: dict[str, list] = defaultdict(list)

    for t in tickets:
        by_cliente[t["cliente"]].append(t)
        by_categoria[t["categoria"]].append(t)
        by_servico[t["servico"]].append(t)
        by_responsavel[t["responsavel"]].append(t)

    now = datetime.now().strftime("%d/%m/%Y %H:%M")

    write_md(
        BRAIN_ROOT / "README.md",
        f"""---
tags:
  - caios/brain
  - movidesk
  - moc
fonte: movidesk-obsidian
atualizado: "{now}"
---

# Movidesk → CaiOS Brain

Base de conhecimento dos chamados extraídos do **LectorTec Movidesk**, organizada para o Obsidian e o grafo do CaiOS.

## Números

- **Tickets:** {len(tickets)}
- **Clientes:** {len(by_cliente)}
- **Categorias:** {len(by_categoria)}
- **Serviços:** {len(by_servico)}

## Catálogos

- [[CaiOS/Brain/Movidesk/_catalogo/INDEX|Índice geral]]
- [[CaiOS/Brain/Movidesk/_catalogo/Por-Cliente|Por cliente]]
- [[CaiOS/Brain/Movidesk/_catalogo/Por-Categoria|Por categoria]]
- [[CaiOS/Brain/Movidesk/_catalogo/Por-Servico|Por serviço]]
- [[CaiOS/Brain/Movidesk/_catalogo/Por-Responsavel|Por responsável]]

## Pasta de chamados

`CaiOS/Brain/Movidesk/Chamados/`

## Tags úteis

`#chamados_movidesk` · `#caios/brain` · `#movidesk`
""",
    )

    index_lines = [
        "---",
        "tags:",
        "  - caios/brain",
        "  - movidesk",
        "  - catalogo",
        f'atualizado: "{now}"',
        "---",
        "",
        "# Índice geral — Movidesk",
        "",
        f"Total: **{len(tickets)}** tickets.",
        "",
    ]
    for t in tickets:
        index_lines.append(
            f"- #{t['id']} — {ticket_link(t['path'])} — **{t['cliente']}** — {t['categoria']}"
        )
    write_md(CATALOGO_DIR / "INDEX.md", "\n".join(index_lines) + "\n")

    def section_file(title: str, slug: str, grouped: dict[str, list]) -> None:
        lines = [
            "---",
            "tags:",
            "  - caios/brain",
            "  - movidesk",
            f"  - movidesk/{slug}",
            f'atualizado: "{now}"',
            "---",
            "",
            f"# {title}",
            "",
        ]
        for key in sorted(grouped, key=lambda s: s.lower()):
            items = grouped[key]
            lines.append(f"## {key} ({len(items)})")
            lines.append("")
            for t in sorted(items, key=lambda x: int(re.sub(r"\D", "", x["id"]) or "0")):
                lines.append(f"- #{t['id']} {ticket_link(t['path'])}")
            lines.append("")
        write_md(CATALOGO_DIR / f"Por-{slug}.md", "\n".join(lines) + "\n")

    section_file("Por cliente", "Cliente", by_cliente)
    section_file("Por categoria", "Categoria", by_categoria)
    section_file("Por serviço", "Servico", by_servico)
    section_file("Por responsável", "Responsavel", by_responsavel)

    stats = {
        "atualizado": now,
        "total_tickets": len(tickets),
        "clientes": len(by_cliente),
        "categorias": len(by_categoria),
        "servicos": len(by_servico),
        "responsaveis": len(by_responsavel),
        "ultimo_ticket_id": tickets[-1]["id"] if tickets else None,
        "base_url": BASE_URL,
        "chamados_dir": str(CHAMADOS_DIR),
    }
    CATALOGO_DIR.mkdir(parents=True, exist_ok=True)
    (CATALOGO_DIR / "estatisticas.json").write_text(
        json.dumps(stats, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    return stats


if __name__ == "__main__":
    result = build_catalog()
    print(json.dumps(result, ensure_ascii=False, indent=2))