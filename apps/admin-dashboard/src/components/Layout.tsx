import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';

const nav = [
  { to: '/', label: 'Overview' },
  { to: '/users', label: 'Users' },
  { to: '/agents', label: 'Agents' },
  { to: '/listings', label: 'Listings' },
];

export function Layout() {
  const logout = useAdminStore((s) => s.logout);
  const user = useAdminStore((s) => s.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: 240,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 32, paddingLeft: 8 }}>
          Rentify
        </h2>
        <nav style={{ flex: 1 }}>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'block',
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 4,
                fontWeight: isActive ? 600 : 400,
                background: isActive ? '#e8f5e9' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text)',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', paddingLeft: 8, marginBottom: 8 }}>
            {user?.email}
          </p>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
