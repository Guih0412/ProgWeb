import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { PaginationBar } from '../components/Pagination';
import { Cidade, Continente, Pagination, Pais, WeatherData } from '../types';

const emptyForm = {
  nome: '',
  populacao: 0,
  latitude: 0,
  longitude: 0,
  paisId: 0,
};

export function CitiesPage() {
  const [items, setItems] = useState<Cidade[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [continentes, setContinentes] = useState<Continente[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [filterPais, setFilterPais] = useState('');
  const [filterContinente, setFilterContinente] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [weather, setWeather] = useState<{ cidade: Cidade; weather: WeatherData } | null>(null);

  const loadFilters = async () => {
    const [c, p] = await Promise.all([
      api.getContinentes({ page: '1', limit: '100' }),
      api.getPaises({ page: '1', limit: '100' }),
    ]);
    setContinentes(c.data);
    setPaises(p.data);
  };

  const load = useCallback(async (page = 1) => {
    const result = await api.getCidades({
      page: String(page),
      limit: '10',
      ...(search ? { search } : {}),
      ...(filterPais ? { paisId: filterPais } : {}),
      ...(filterContinente ? { continenteId: filterContinente } : {}),
    });
    setItems(result.data);
    setPagination(result.pagination);
  }, [search, filterPais, filterContinente]);

  useEffect(() => { loadFilters(); }, []);
  useEffect(() => { load(1); }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updateCidade(editingId, form);
      } else {
        await api.createCidade(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      load(pagination.page);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (item: Cidade) => {
    setForm({
      nome: item.nome,
      populacao: item.populacao,
      latitude: item.latitude,
      longitude: item.longitude,
      paisId: item.paisId,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta cidade?')) return;
    try {
      await api.deleteCidade(id);
      load(pagination.page);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const loadWeather = async (id: number) => {
    try {
      const data = await api.getCidadeWeather(id);
      setWeather(data);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const filteredPaises = filterContinente
    ? paises.filter((p) => p.continenteId === Number(filterContinente))
    : paises;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Cidades</h1>
        </div>
        <button type="button" className="btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
          + Nova cidade
        </button>
      </header>

      <div className="toolbar">
        <input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={filterContinente} onChange={(e) => { setFilterContinente(e.target.value); setFilterPais(''); }}>
          <option value="">Todos os continentes</option>
          {continentes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <select value={filterPais} onChange={(e) => setFilterPais(e.target.value)}>
          <option value="">Todos os países</option>
          {filteredPaises.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
        <button type="button" className="btn-secondary" onClick={() => load(1)}>Filtrar</button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Editar cidade' : 'Nova cidade'}</h2>
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
              Latitude *
              <input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })} required />
            </label>
            <label>
              Longitude *
              <input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })} required />
            </label>
            <label>
              País *
              <select value={form.paisId || ''} onChange={(e) => setForm({ ...form, paisId: Number(e.target.value) })} required>
                <option value="">Selecione...</option>
                {paises.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
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

      {weather && (
        <div className="external-panel weather-panel">
          <div className="external-header">
            <h2>Clima — {weather.cidade.nome}</h2>
            <button type="button" className="btn-ghost" onClick={() => setWeather(null)}>Fechar</button>
          </div>
          {weather.weather.mock && (
            <p className="hint">{weather.weather.message}</p>
          )}
          <div className="weather-grid">
            <div className="weather-temp">
              {Math.round(weather.weather.temperatura)}°C
              <small>{weather.weather.descricao}</small>
            </div>
            <div>
              <p><strong>Sensação:</strong> {Math.round(weather.weather.sensacao)}°C</p>
              <p><strong>Umidade:</strong> {weather.weather.umidade}%</p>
              <p><strong>Pressão:</strong> {weather.weather.pressao} hPa</p>
              <p><strong>Vento:</strong> {weather.weather.vento} m/s</p>
              <p><strong>Coordenadas:</strong> {weather.cidade.latitude}, {weather.cidade.longitude}</p>
              <a
                className="map-link"
                href={`https://www.openstreetmap.org/?mlat=${weather.cidade.latitude}&mlon=${weather.cidade.longitude}#map=10/${weather.cidade.latitude}/${weather.cidade.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                Ver no mapa (OpenStreetMap)
              </a>
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
              <th>Lat / Long</th>
              <th>País</th>
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
                <td>{item.latitude}, {item.longitude}</td>
                <td>{item.pais?.nome}</td>
                <td>{item.pais?.continente?.nome}</td>
                <td className="actions">
                  <button type="button" onClick={() => loadWeather(item.id)}>Clima</button>
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
