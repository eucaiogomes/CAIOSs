"""Executa o extrator Movidesk com destino no Brain CaiOS (Obsidian).

Requer Python 3.11+ com requests e beautifulsoup4:
  py -3.11 -m pip install requests beautifulsoup4
"""

from __future__ import annotations

import importlib.util
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPO = ROOT / "caios-data" / "movidesk-obsidian"
COOKIE_FILE = REPO / ".cookie"
EXTRATOR = REPO / "extrator_movidesk.py"
CATALOGO_SCRIPT = Path(__file__).resolve().parent / "organizar_catalogo_brain.py"
LOG_FILE = ROOT / "caios-data" / "logs" / "movidesk-extrator.log"

VAULT = Path(r"C:\Users\gcaio\OneDrive\Documentos\caio")
BRAIN_ROOT = VAULT / "CaiOS" / "Brain" / "Movidesk"
CHAMADOS_DIR = BRAIN_ROOT / "Chamados"


def log(msg: str) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    line = f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n"
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(line)
    print(msg, flush=True)


def load_catalog_builder():
    spec = importlib.util.spec_from_file_location("catalogo", CATALOGO_SCRIPT)
    if not spec or not spec.loader:
        raise RuntimeError("Não foi possível carregar organizar_catalogo_brain.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.build_catalog


def main() -> None:
    if not COOKIE_FILE.exists():
        log(f"Cookie ausente em {COOKIE_FILE}")
        sys.exit(1)
    if not EXTRATOR.exists():
        log(f"Extrator ausente em {EXTRATOR}")
        sys.exit(1)

    cookie = COOKIE_FILE.read_text(encoding="utf-8").strip()
    CHAMADOS_DIR.mkdir(parents=True, exist_ok=True)
    BRAIN_ROOT.mkdir(parents=True, exist_ok=True)

    log("Iniciando extrator Movidesk → CaiOS Brain")
    log(f"Destino: {CHAMADOS_DIR}")

    spec = importlib.util.spec_from_file_location("extrator_movidesk", EXTRATOR)
    if not spec or not spec.loader:
        log("Falha ao carregar extrator_movidesk.py")
        sys.exit(1)

    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    mod.COOKIE_SESSAO = cookie
    mod.PASTA_OBSIDIAN = str(CHAMADOS_DIR)
    mod.TICKET_INICIAL = 9000
    mod.LIMITE_ERROS_CONSECUTIVOS = 30
    mod.PAUSA_ENTRE_TICKETS = 1.5
    mod.HEADERS_HTML["cookie"] = cookie
    mod.HEADERS_AJAX["cookie"] = cookie

    build_catalog = load_catalog_builder()
    build_catalog()
    log("Catálogo inicial gerado")

    try:
        mod.iniciar_extracao()
    finally:
        stats = build_catalog()
        log(
            "Catálogo final atualizado — "
            f"{stats.get('total_tickets', 0)} tickets, "
            f"{stats.get('clientes', 0)} clientes"
        )


if __name__ == "__main__":
    main()