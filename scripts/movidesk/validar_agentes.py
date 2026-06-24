# -*- coding: utf-8 -*-
import requests
from pathlib import Path

BASE = 'https://api.movidesk.com/public/v1/tickets'
ROOT = Path(__file__).resolve().parents[2]
COOKIE_FILE = ROOT / 'caios-data' / 'movidesk-obsidian' / '.cookie'

# Carregar token e cookie de fontes conhecidas (não commitar tokens)
pipeline = Path(r'C:\Users\lecto\Downloads\apontamentos lector\pipeline_movidesk.py')
text = pipeline.read_text(encoding='utf-8')
import re
m = re.search(r"TOKEN\s*=\s*'([^']+)'", text)
if not m:
    raise SystemExit('Token não encontrado')
TOKEN = m.group(1)
cookie = COOKIE_FILE.read_text(encoding='utf-8').strip() if COOKIE_FILE.exists() else ''

headers = {'Accept':'application/json'}
if cookie:
    headers['cookie'] = cookie

ids_schutz = [10915,10920,3932,5366,6793,8168,8171,8270,8314,10217,11888,11939]
ids_raposo = [11776,11813,11263,10577,11026,11905,11933,11932,11880,11938]

print('Validação de tickets conhecidos:')
for tid in ids_schutz + ids_raposo:
    r = requests.get(BASE, headers=headers, params={'token': TOKEN, 'id': tid, '$select': 'id,subject,status,owner,createdBy'}, timeout=30)
    data = r.json()
    owner = data.get('owner') or {}
    created = data.get('createdBy') or {}
    print(f"{tid} | {(data.get('subject') or '')[:50]} | owner={owner.get('id')}/{owner.get('businessName')} | created={created.get('id')}/{created.get('businessName')}")
