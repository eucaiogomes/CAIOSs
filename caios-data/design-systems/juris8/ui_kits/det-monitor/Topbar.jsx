// Juris8 app — top bar with breadcrumb + live status + search.
function Topbar({ crumb }) {
  const { Badge } = window.Juris8DesignSystem_75d483;
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 24px', minHeight: 60, flexShrink: 0,
      borderBottom: '1px solid var(--hairline)', background: 'rgba(13,11,28,0.6)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--dim)' }}>Juris8</span>
        <i data-lucide="chevron-right" style={{ width: 13, height: 13, color: 'var(--dim)' }}></i>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-200)' }}>{crumb}</span>
      </div>

      <div style={{
        marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 12px', borderRadius: 'var(--r-3)', minWidth: 240,
        background: 'var(--surface-2)', border: '1px solid var(--hairline-strong)',
        color: 'var(--dim)', fontSize: 12,
      }}>
        <i data-lucide="search" style={{ width: 13, height: 13 }}></i>
        <span>Buscar empresa ou CNPJ…</span>
      </div>

      <Badge tone="ok" dot>14 CNPJs ao vivo</Badge>

      <button style={{
        width: 36, height: 36, borderRadius: 'var(--r-3)', flexShrink: 0, cursor: 'pointer',
        background: 'var(--surface-2)', border: '1px solid var(--hairline-strong)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
        position: 'relative',
      }}>
        <i data-lucide="bell" style={{ width: 16, height: 16 }}></i>
        <span style={{ position: 'absolute', top: 8, right: 9, width: 6, height: 6, borderRadius: '50%', background: 'var(--bad)' }}></span>
      </button>
    </header>
  );
}

window.Topbar = Topbar;
