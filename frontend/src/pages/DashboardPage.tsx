import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export function DashboardPage() {
  const [stats, setStats] = useState({ continentes: 0, paises: 0, cidades: 0 });

  useEffect(() => {
    Promise.all([
      api.getContinentes({ page: '1', limit: '1' }),
      api.getPaises({ page: '1', limit: '1' }),
      api.getCidades({ page: '1', limit: '1' }),
    ]).then(([c, p, ci]) => {
      setStats({
        continentes: c.pagination.total,
        paises: p.pagination.total,
        cidades: ci.pagination.total,
      });
    });
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral do sistema geográfico</p>
        </div>
      </header>

      <div className="stats-grid">
        <Link to="/continentes" className="stat-card">
          <span>Continentes</span>
          <strong>{stats.continentes}</strong>
        </Link>
        <Link to="/paises" className="stat-card">
          <span>Países</span>
          <strong>{stats.paises}</strong>
        </Link>
        <Link to="/cidades" className="stat-card">
          <span>Cidades</span>
          <strong>{stats.cidades}</strong>
        </Link>
      </div>
    </div>
  );
}
