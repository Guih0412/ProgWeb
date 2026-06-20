import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { PaginationBar } from '../components/Pagination';
import { Continente, ExternalCountry, Pagination, Pais } from '../types';

const emptyForm = {
  nome: '',
  populacao: 0,
  idiomaOficial: '',
  moeda: '',
  continenteId: 0,
};

export function CountriesPage() {
  const [items, setItems] = useState<Pais[]>([]);
  const [continentes, setContinentes] = useState<Continente[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [filterContinente, setFilterContinente] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [externalData, setExternalData] = useState<{ local: Pais; external: ExternalCountry } | null>(null);

  const loadContinentes = async () => {
    const result = await api.getContinentes({ page: '1', limit: '100' });
    setContinentes(result.data);
  };

  const load = useCallback(async (page = 1) => {
    const result = await api.getPaises({
      page: String(page),
      limit: '10',
      ...(search ? { search } : {}),
      ...(filterContinente ? { continenteId: filterContinente } : {}),
    });
    setItems(result.data);
    setPagination(result.pagination);
  }, [search, filterContinente]);

  useEffect(() => {
    loadContinentes();
  }, []);

  useEffect(() => { load(1); }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updatePais(editingId, form);
      } else {
        await api.createPais(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      load(pagination.page);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (item: Pais) => {
    setForm({
      nome: item.nome,
      populacao: item.populacao,
      idiomaOficial: item.idiomaOficial,
      moeda: item.moeda,
      continenteId: item.continenteId,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este país?')) return;
    try {
      await api.deletePais(id);
      load(pagination.page);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Países</h1>
        </div>
        <button type="button" className="btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
          + Novo país
        </button>
      </header>

      <div className="toolbar">
        <input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={filterContinente} onChange={(e) => setFilterContinente(e.target.value)}>
          <option value="">Todos os continentes</option>
          {continentes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <button type="button" className="btn-secondary" onClick={() => load(1)}>Filtrar</button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Editar país' : 'Novo país'}</h2>
          <div className="form-grid">
            <label>
              Nome *
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </label>
            <label>
              População *
              <input type="number" value={form.populacao} onChange={(e) => setForm({ ...form, populacao: Number(e.target.value) })} required min={0} />
            </label>
            <label>
              Idioma oficial *
              <input value={form.idiomaOficial} onChange={(e) => setForm({ ...form, idiomaOficial: e.target.value })} required />
            </label>
            <label>
              Moeda *
              <input value={form.moeda} onChange={(e) => setForm({ ...form, moeda: e.target.value })} required />
            </label>
            <label>
              Continente *
              <select value={form.continenteId || ''} onChange={(e) => setForm({ ...form, continenteId: Number(e.target.value) })} required>
                <option value="">Selecione...</option>
                {continentes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </label>
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Salvar</button>
          </div>
        </form>
      )}

      {externalData && (
        <div className="external-panel">
          <div className="external-header">
            <h2>Dados REST Countries — {externalData.local.nome}</h2>
            <button type="button" className="btn-ghost" onClick={() => setExternalData(null)}>Fechar</button>
          </div>
          <div className="external-grid">
            <img src={externalData.external.bandeira} alt={`Bandeira de ${externalData.external.nome}`} className="flag-img" />
            <div>
              <p><strong>Oficial:</strong> {externalData.external.nomeOficial}</p>
              <p><strong>Capital:</strong> {externalData.external.capital ?? '—'}</p>
              <p><strong>Região:</strong> {externalData.external.regiao} {externalData.external.subregiao && `(${externalData.external.subregiao})`}</p>
              <p><strong>População API:</strong> {externalData.external.populacao.toLocaleString('pt-BR')}</p>
              <p><strong>Idiomas:</strong> {externalData.external.idiomas.join(', ') || '—'}</p>
              <p><strong>Moedas:</strong> {externalData.external.moedas.map((m) => `${m.name} (${m.symbol})`).join(', ') || '—'}</p>
              <p><strong>Fusos:</strong> {externalData.external.fusosHorarios.slice(0, 3).join(', ')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>População</th>
              <th>Idioma</th>
              <th>Moeda</th>
              <th>Continente</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nome}</td>
                <td>{item.populacao.toLocaleString('pt-BR')}</td>
                <td>{item.idiomaOficial}</td>
                <td>{item.moeda}</td>
                <td>{item.continente?.nome}</td>
                <td className="actions">               
                  <button type="button" onClick={() => handleEdit(item)}>Editar</button>
                  <button type="button" className="danger" onClick={() => handleDelete(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationBar pagination={pagination} onPageChange={load} />
      </div>
    </div>
  );
}
