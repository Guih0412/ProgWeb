import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { PaginationBar } from '../components/Pagination';
import { Continente, Pagination } from '../types';

const emptyForm = { nome: '', descricao: '' };

export function ContinentsPage() {
  const [items, setItems] = useState<Continente[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async (page = 1) => {
    const result = await api.getContinentes({
      page: String(page),
      limit: '10',
      ...(search ? { search } : {}),
    });
    setItems(result.data);
    setPagination(result.pagination);
  }, [search]);

  useEffect(() => { load(1); }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updateContinente(editingId, form);
      } else {
        await api.createContinente(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      load(pagination.page);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (item: Continente) => {
    setForm({ nome: item.nome, descricao: item.descricao });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este continente?')) return;
    try {
      await api.deleteContinente(id);
      load(pagination.page);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Continentes</h1>
        </div>
        <button type="button" className="btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
          + Novo continente
        </button>
      </header>

      <div className="toolbar">
        <input
          placeholder="Buscar por nome ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn-secondary" onClick={() => load(1)}>Filtrar</button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Editar continente' : 'Novo continente'}</h2>
          <div className="form-grid">
            <label>
              Nome *
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </label>
            <label className="full-width">
              Descrição *
              <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required rows={3} />
            </label>
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Salvar</button>
          </div>
        </form>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Países</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nome}</td>
                <td>{item.descricao}</td>
                <td>{item._count?.paises ?? 0}</td>
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
