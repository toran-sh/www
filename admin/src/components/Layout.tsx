import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Layout.css';

function Layout() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-content">
          <h1 className="logo">
            <span className="logo-icon">⚡</span>
            Toran Admin
          </h1>
          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Dashboard
            </NavLink>
            <NavLink to="/mappings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Mappings
            </NavLink>
            <NavLink to="/logs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Logs
            </NavLink>
            {email && (
              <div className="user-menu" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="text-sm text-gray" style={{ color: 'var(--text-tertiary)' }}>{email}</span>
                <button
                  onClick={handleLogout}
                  className="nav-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container text-center">
          <p className="text-sm text-gray mb-0">
            Powered by Cloudflare Workers • Toran Reverse Proxy
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
