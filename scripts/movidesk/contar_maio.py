# -*- coding: utf-8 -*-
import requests
from pathlib import Path

BASE = 'https://api.movidesk.com/public/v1/tickets'
ROOT = Path(__file__).resolve().parents[2]
COOKIE_FILE = ROOT / 'caios-data' / 'movidesk-obsidian' / '.cookie'
pipeline = Path(r'C:\Users\lecto\Downloads\apontamentos lector\pipeline_movidesk.py')
text = pipeline.read_text(encoding='utf-8')
import re
vals = re.findall(r"TOKEN\s*=\s*'([^']+)'", text)
if not vals:
    raise SystemExit('Token não encontrado')
TOKEN = vals[-1]
cookie = COOKIE_FILE.read_text(encoding='utf-8').strip() if COOKIE_FILE.exists() else ''
headers = {'Accept':'application/json'}
if cookie:
    headers['cookie'] = cookie

agents = {'816032757': 'Guilherme Raposo', '1688690358': 'Ricardo Schutz'}

def tickets_por_owner(agent_id):
    tickets = []
    skip = 0
    while True:
        params = {
            'token': TOKEN,
            '$select': 'id,subject,status,createdDate,lastUpdate,lastActionDate',
            '$filter': f"owner/id eq '{agent_id}'",
            '$top': 50,
            '$skip': skip,
        }
        r = requests.get(BASE, headers=headers, params=params, timeout=120)
        r.raise_for_status()
        batch = r.json()
        if not batch:
            break
        tickets.extend(batch)
        if len(batch) < 50:
            break
        skip += 50
    return tickets

for aid, aname in agents.items():
    tickets = tickets_por_owner(aid)
    maio = []
    for t in tickets:
        created = (t.get('createdDate') or '')[:10]
        last = (t.get('lastUpdate') or t.get('lastActionDate') or '')[:10]
        data = last or created
        if '2026-05-01' <= data <= '2026-05-31':
            maio.append(t)
    status_set = sorted({(t.get('status') or '').strip() for t in maio})
    print(f"{aname}: tickets_em_maio={len(maio)} status_unicos={status_set}")
    for t in maio:
        print(f"  {t['id']} | {(t.get('subject') or '')[:60]} | {t.get('status')}")
