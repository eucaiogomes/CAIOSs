// Juris8 app — DET monitoring dashboard: metrics + unified alert inbox.
const { useState: useDashState } = React;

function Dashboard() {
  const { Stat, Alert, Eyebrow, Badge } = window.Juris8DesignSystem_75d483;
  const [resolved, setResolved] = useDashState({});

  const I = (n) => <i data-lucide={n} style={{ width: 17, height: 17 }}></i>;

  const alerts = [
    { id: 'a1', tone: 'urgent', icon: 'triangle-alert', title: 'Construtech Ltda · CNPJ 12.345.678/0001-90', description: 'Notificação de fiscalização · Prazo de resposta: 10 dias úteis', time: '08:14', tag: 'Urgente', action: 'Analisar' },
    { id: 'a2', tone: 'warning', icon: 'bell', title: 'Mercado Nobre SA · CNPJ 98.765.432/0001-11', description: 'Solicitação de documentos · Seguro-desemprego contestado', time: '07:52', tag: 'Atenção', action: 'Analisar' },
    { id: 'a3', tone: 'ok', icon: 'check', title: 'Logística Ágil ME · CNPJ 55.123.456/0001-33', description: 'Comunicado informativo · Nenhuma ação necessária', time: 'ontem', tag: 'Resolvido' },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 22 }}>
        <div>
          <Eyebrow>Painel DET</Eyebrow>
          <h1 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text)', marginTop: 10 }}>Carteira de clientes</h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink-400)', marginTop: 4 }}>Acompanhe todas as comunicações trabalhistas em um só lugar.</p>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--juris-200)', background: 'var(--fill-brand)', border: '1px solid var(--border-brand)', borderRadius: 'var(--r-3)', padding: '6px 11px' }}>Hoje · 09:41</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 26 }}>
        <Stat value="14" label="CNPJs monitorados" />
        <Stat value="2" label="Alertas urgentes" tone="bad" />
        <Stat value="1" label="Atenção" tone="warn" />
        <Stat value="11" label="Sem alertas · 30d" tone="ok" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>Novos alertas — hoje</span>
        <span style={{ flex: 1, height: 1, background: 'var(--hairline)' }}></span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {alerts.map((a) => {
          const isResolved = resolved[a.id];
          return (
            <Alert
              key={a.id}
              tone={isResolved ? 'ok' : a.tone}
              icon={I(isResolved ? 'check' : a.icon)}
              title={a.title}
              description={a.description}
              time={a.time}
              tag={isResolved ? 'Resolvido' : a.tag}
              action={a.action && !isResolved ? a.action : undefined}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--hairline)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>
        <span>11 CNPJs sem alertas nos últimos 30 dias</span>
        <a href="#" style={{ color: 'var(--juris-300)', textDecoration: 'none' }}>Ver todos →</a>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
