const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? 'Erro na requisição');
  }
  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: number; name: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: { id: number; name: string; email: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  getContinentes: (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return request<{ data: import('../types').Continente[]; pagination: import('../types').Pagination }>(
      `/continentes?${query}`
    );
  },

  createContinente: (data: { nome: string; descricao: string }) =>
    request<import('../types').Continente>('/continentes', { method: 'POST', body: JSON.stringify(data) }),

  updateContinente: (id: number, data: { nome: string; descricao: string }) =>
    request<import('../types').Continente>(`/continentes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteContinente: (id: number) => request<void>(`/continentes/${id}`, { method: 'DELETE' }),

  getPaises: (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return request<{ data: import('../types').Pais[]; pagination: import('../types').Pagination }>(
      `/paises?${query}`
    );
  },

  createPais: (data: Omit<import('../types').Pais, 'id' | 'continente' | '_count'>) =>
    request<import('../types').Pais>('/paises', { method: 'POST', body: JSON.stringify(data) }),

  updatePais: (id: number, data: Omit<import('../types').Pais, 'id' | 'continente' | '_count'>) =>
    request<import('../types').Pais>(`/paises/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deletePais: (id: number) => request<void>(`/paises/${id}`, { method: 'DELETE' }),

  getPaisExternal: (id: number) =>
    request<{ local: import('../types').Pais; external: import('../types').ExternalCountry }>(
      `/paises/${id}/external`
    ),

  getCidades: (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return request<{ data: import('../types').Cidade[]; pagination: import('../types').Pagination }>(
      `/cidades?${query}`
    );
  },

  createCidade: (data: Omit<import('../types').Cidade, 'id' | 'pais'>) =>
    request<import('../types').Cidade>('/cidades', { method: 'POST', body: JSON.stringify(data) }),

  updateCidade: (id: number, data: Omit<import('../types').Cidade, 'id' | 'pais'>) =>
    request<import('../types').Cidade>(`/cidades/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteCidade: (id: number) => request<void>(`/cidades/${id}`, { method: 'DELETE' }),

  getCidadeWeather: (id: number) =>
    request<{ cidade: import('../types').Cidade; weather: import('../types').WeatherData }>(
      `/cidades/${id}/weather`
    ),
};
