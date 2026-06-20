import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">🌍</span>
          <div>
            <strong>Geo World Manager</strong>
          </div>
        </div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/continentes">Continentes</NavLink>
          <NavLink to="/paises">Países</NavLink>
          <NavLink to="/cidades">Cidades</NavLink>
        </nav>
        <div className="sidebar-footer">
          <p>{user?.name}</p>
          <button type="button" className="btn-ghost" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
