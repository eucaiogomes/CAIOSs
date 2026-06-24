// Juris8 app — certificate config + CNPJ selection (interactive).
const { useState: useCertState } = React;

const INITIAL_CNPJS = [
  { id: '1', name: 'Construtech Ltda', cnpj: '12.345.678/0001-90', proc: 'ativa' },
  { id: '2', name: 'Mercado Nobre SA', cnpj: '98.765.432/0001-11', proc: 'ativa' },
  { id: '3', name: 'Logística Ágil ME', cnpj: '55.123.456/0001-33', proc: 'ativa' },
  { id: '4', name: 'Indústria Gama', cnpj: '11.222.333/0001-44', proc: 'vence' },
];

function CertConfig() {
  const { Button, Badge, Stat } = window.Juris8DesignSystem_75d483;
  // stage: 'empty' | 'ready'
  const [stage, setStage] = useCertState('empty');
  const [selected, setSelected] = useCertState({});
  const [activated, setActivated] = useCertState(false);

  const toggle = (id) => {
    setActivated(false);
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const cardBase = {
    borderRadius: 'var(--r-5)', border: '1px solid var(--hairline-strong)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.04), transparent)', padding: 18,
  };
  const cardLabel = { fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 48px' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>Configure uma vez</h1>
        <p style={{ fontSize: 13, color: 'var(--ink-400)', marginTop: 4 }}>Envie o certificado digital A1 e ative o monitoramento dos CNPJs com procuração ativa.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Certificate card */}
        <div style={cardBase}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={cardLabel}>1 · Certificado A1</span>
            {stage === 'ready' && <Badge tone="ok" dot>Ativo</Badge>}
          </div>
          {stage === 'empty' ? (
            <button onClick={() => setStage('ready')} style={{
              width: '100%', height: 150, borderRadius: 'var(--r-4)', cursor: 'pointer',
              border: '1px dashed var(--hairline-strong)', background: 'rgba(255,255,255,0.02)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              color: 'var(--ink-300)',
            }}>
              <i data-lucide="upload" style={{ width: 22, height: 22, color: 'var(--muted)' }}></i>
              <span style={{ fontSize: 12.5, color: 'var(--ink-200)' }}>Arraste seu certificado A1</span>
              <span style={{ fontSize: 10.5, color: 'var(--dim)' }}>ou clique para selecionar · .pfx / .p12</span>
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 'var(--r-4)', background: 'var(--fill-ok)', border: '1px solid var(--border-ok)' }}>
                <i data-lucide="file-lock-2" style={{ width: 16, height: 16, color: 'var(--ok)' }}></i>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--text)' }}>certificado_escritorio.pfx</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>Validade · 14/08/2027</div>
                </div>
                <i data-lucide="shield-check" style={{ width: 16, height: 16, color: 'var(--ok)' }}></i>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['Proteção', 'Criptografado'], ['Uso', 'Procurações']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 9px', borderRadius: 'var(--r-3)', border: '1px solid var(--hairline)', background: 'rgba(255,255,255,0.02)', fontSize: 10.5, color: 'var(--muted)' }}>
                    <span>{k}</span><span style={{ color: 'var(--ink-200)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sync card */}
        <div style={cardBase}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={cardLabel}>2 · Sincronização</span>
            {stage === 'ready' && <Badge tone="info">12 CNPJs</Badge>}
          </div>
          {stage === 'empty' ? (
            <div style={{ height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.55 }}>
              <i data-lucide="lock" style={{ width: 22, height: 22, color: 'var(--muted)' }}></i>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Envie o certificado para liberar</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <Stat value="12" label="Encontrados" />
                <Stat value={activated ? '12' : '8'} label="Ativos" tone="ok" />
                <Stat value={activated ? '0' : '4'} label="Disponíveis" tone="warn" />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--dim)' }}>Última busca · hoje às 09:41</span>
            </div>
          )}
        </div>
      </div>

      {/* CNPJ list */}
      {stage === 'ready' && (
        <div style={{ borderRadius: 'var(--r-5)', border: '1px solid var(--hairline-strong)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderBottom: '1px solid var(--hairline)' }}>
            <span style={cardLabel}>3 · CNPJs com procuração ativa</span>
          </div>
          {INITIAL_CNPJS.map((c) => {
            const on = selected[c.id] || activated;
            return (
              <div key={c.id} onClick={() => toggle(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: '1px solid var(--hairline)', cursor: 'pointer', fontSize: 12.5 }}>
                <span style={{
                  width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: on ? 'var(--juris-500)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${on ? 'var(--juris-500)' : 'var(--hairline-strong)'}`,
                }}>{on && <i data-lucide="check" style={{ width: 11, height: 11, color: '#fff' }}></i>}</span>
                <i data-lucide="building-2" style={{ width: 15, height: 15, color: 'var(--muted)' }}></i>
                <span style={{ flex: 1, color: 'var(--ink-100)' }}>{c.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)' }}>{c.cnpj}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: 'var(--r-2)', padding: '4px 8px', color: c.proc === 'ativa' ? 'var(--ok)' : 'var(--warn)', background: c.proc === 'ativa' ? 'var(--fill-ok)' : 'var(--fill-warn)', border: `1px solid ${c.proc === 'ativa' ? 'var(--border-ok)' : 'var(--border-warn)'}` }}>{c.proc === 'ativa' ? 'Procuração ativa' : 'Vence em 18d'}</span>
              </div>
            );
          })}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--fill-brand-weak)' }}>
            <span style={{ fontSize: 11.5, color: 'var(--juris-100)' }}>{activated ? 'Monitoramento ativo em 4 CNPJs' : `${selectedCount} CNPJ${selectedCount === 1 ? '' : 's'} selecionado${selectedCount === 1 ? '' : 's'}`}</span>
            <Button variant="primary" size="sm" disabled={selectedCount === 0 || activated} onClick={() => setActivated(true)} iconLeft={activated ? <i data-lucide="check" style={{ width: 14, height: 14 }}></i> : null}>
              {activated ? 'Monitoramento ativado' : 'Ativar monitoramento'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

window.CertConfig = CertConfig;
