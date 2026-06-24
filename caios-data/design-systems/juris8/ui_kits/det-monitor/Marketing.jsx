// Juris8 — marketing landing (nav + hero + DET panel + trust strip).
function Marketing({ onEnter }) {
  const { Button, Badge, Alert, Eyebrow } = window.Juris8DesignSystem_75d483;
  const I = (n, w = 17) => <i data-lucide={n} style={{ width: w, height: w }}></i>;

  const navLinks = ['Como funciona', 'Segurança', 'Receita recorrente', 'FAQ'];
  const pills = [
    { icon: 'lock', label: 'LGPD' },
    { icon: 'bell-ring', label: 'Alertas em tempo real' },
    { icon: 'repeat', label: 'Receita recorrente' },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(7,5,15,0.85)', backdropFilter: 'blur(24px) saturate(1.4)',
        borderBottom: '1px solid var(--hairline)',
      }}>
        <div className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, minHeight: 64 }}>
          <img src="../../assets/logo.png" alt="Juris 8" style={{ height: 30, width: 'auto' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="nav-mid">
            {navLinks.map((l) => (
              <span key={l} style={{ fontSize: 13, color: 'var(--ink-400)', padding: '6px 11px', borderRadius: 'var(--r-3)', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={onEnter}>Entrar</Button>
            <Button variant="primary" size="sm" iconLeft={I('arrow-right', 13)} onClick={onEnter}>Falar com um especialista</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="shell" style={{ padding: '56px var(--shell-pad) 40px' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.04fr', gap: 56, alignItems: 'center' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
            <Badge tone="brand" dot>Domicílio Eletrônico Trabalhista · monitoramento ativo</Badge>
            <h1 style={{ fontSize: 'clamp(34px,4vw,52px)', lineHeight: 1.08, letterSpacing: '-0.03em', fontWeight: 500, color: 'var(--text)' }}>
              Monitore o DET dos seus clientes. <span className="grad" style={{ fontWeight: 700 }}>Gere receita recorrente todo mês.</span>
            </h1>
            <p style={{ fontSize: 16, color: 'var(--ink-300)', lineHeight: 1.7, maxWidth: '50ch' }}>
              O DET já está ativo e gerando revelias e multas para quem não monitora. Saia na frente, monitore o DET dos seus clientes e gere receita mensal recorrente.
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-300)', lineHeight: 1.6, borderLeft: '2px solid rgba(124,58,237,0.5)', padding: '2px 0 2px 14px' }}>
              O advogado que chega primeiro não apaga incêndio. <b style={{ color: 'var(--text)', fontWeight: 500 }}>Ele evita que o incêndio comece.</b>
            </p>
            <Button variant="primary" size="lg" onClick={onEnter} style={{ alignSelf: 'flex-start' }}>
              Quero vender o monitoramento DET
            </Button>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 14, borderTop: '1px solid var(--hairline)' }}>
              {pills.map((p) => (
                <span key={p.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', padding: '6px 11px', borderRadius: 'var(--r-2)', border: '1px solid var(--hairline-strong)', background: 'var(--surface-2)' }}>
                  {I(p.icon, 12)}{p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — DET panel */}
          <div style={{ position: 'relative' }}>
            <div style={{
              background: 'var(--surface-1)', border: '1px solid var(--hairline-strong)', borderRadius: 'var(--r-5)',
              overflow: 'hidden', boxShadow: '0 34px 80px -40px rgba(0,0,0,0.85), 0 0 0 1px rgba(124,58,237,0.05)',
            }}>
              {/* window bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', borderBottom: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
                <span style={{ display: 'flex', gap: 5 }}>
                  <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'block' }}></i>
                  <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#FEBC2E', display: 'block' }}></i>
                  <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'block' }}></i>
                </span>
                <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-200)' }}>Painel DET</span>
                <Badge tone="ok" dot style={{ marginLeft: 'auto' }}>monitorando 14 CNPJs</Badge>
              </div>
              {/* body */}
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Eyebrow>Novos alertas — hoje</Eyebrow>
                    <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 6 }}>Carteira de clientes</h2>
                  </div>
                  <Badge tone="brand">Hoje</Badge>
                </div>
                <Alert tone="urgent" icon={I('triangle-alert')} title="Construtech Ltda · 12.345.678/0001-90" description="Notificação de fiscalização · Prazo: 10 dias úteis" time="08:14" tag="Urgente" action="Analisar" />
                <Alert tone="warning" icon={I('bell')} title="Mercado Nobre SA · 98.765.432/0001-11" description="Solicitação de documentos" time="07:52" tag="Atenção" action="Analisar" />
                <Alert tone="ok" icon={I('check')} title="Logística Ágil ME · 55.123.456/0001-33" description="Comunicado informativo" time="ontem" tag="Resolvido" />
              </div>
            </div>
            <div style={{ position: 'absolute', top: -22, right: 6, display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '8px 12px', borderRadius: 'var(--r-3)', color: '#FFD9DF', background: 'rgba(40,12,20,0.82)', border: '1px solid rgba(251,113,133,0.45)', backdropFilter: 'blur(10px)' }}>
              {I('triangle-alert', 13)} Nova comunicação · agora
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div style={{ padding: '16px 0', background: 'var(--surface-1)', borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', padding: '0 24px' }}>
          {['Monitoramento diário do DET', 'Carteira multi-CNPJ', 'Alertas antes da urgência', 'Histórico e status', 'Produto recorrente', 'LGPD'].map((t, i) => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: i % 3 === 0 ? 'var(--juris-300)' : 'var(--muted)', padding: '7px 14px', borderRadius: 'var(--r-2)', border: `1px solid ${i % 3 === 0 ? 'rgba(124,58,237,0.25)' : 'var(--hairline-strong)'}`, background: i % 3 === 0 ? 'var(--fill-brand-weak)' : 'var(--surface-2)' }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

window.Marketing = Marketing;
