// Juris8 app — left navigation sidebar.
const NAV = [
  { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
  { id: 'clientes', icon: 'users-round', label: 'Clientes' },
  { id: 'monitoramento', icon: 'radar', label: 'Monitoramento' },
  { id: 'cnpjs', icon: 'building-2', label: 'CNPJs' },
  { id: 'certificado', icon: 'file-badge-2', label: 'Certificado' },
  { id: 'comissoes', icon: 'wallet-cards', label: 'Comissões' },
  { id: 'config', icon: 'settings', label: 'Configurações' },
];

function Sidebar({ active, onNavigate }) {
  return (
    <aside style={{
      width: 232, flexShrink: 0, height: '100%',
      background: 'var(--surface-1)', borderRight: '1px solid var(--hairline)',
      display: 'flex', flexDirection: 'column', padding: '18px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 8px 18px' }}>
        <img src="../../assets/logo.png" alt="Juris 8" style={{ height: 30, width: 'auto' }} />
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((item) => {
          const on = active === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left',
              padding: '9px 11px', borderRadius: 'var(--r-3)', cursor: 'pointer',
              border: `1px solid ${on ? 'rgba(124,58,237,0.30)' : 'transparent'}`,
              background: on ? 'var(--fill-brand-strong)' : 'transparent',
              color: on ? 'var(--juris-200)' : 'var(--ink-400)',
              fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: on ? 500 : 400,
              transition: 'background 0.15s, color 0.15s',
            }}>
              <i data-lucide={item.icon} style={{ width: 16, height: 16 }}></i>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: '12px 8px 0', borderTop: '1px solid var(--hairline)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 30, height: 30, borderRadius: 'var(--r-3)', flexShrink: 0,
            background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#fff',
          }}>MS</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>Dr. Marcos Silva</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Silva Advocacia</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
