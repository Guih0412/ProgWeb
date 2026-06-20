export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Continente {
  id: number;
  nome: string;
  descricao: string;
  _count?: { paises: number };
}

export interface Pais {
  id: number;
  nome: string;
  populacao: number;
  idiomaOficial: string;
  moeda: string;
  continenteId: number;
  continente?: Continente;
  _count?: { cidades: number };
}

export interface Cidade {
  id: number;
  nome: string;
  populacao: number;
  latitude: number;
  longitude: number;
  paisId: number;
  pais?: Pais & { continente?: Continente };
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ExternalCountry {
  nome: string;
  nomeOficial: string;
  capital: string | null;
  populacao: number;
  regiao: string;
  subregiao: string | null;
  bandeira: string;
  bandeiraSvg: string;
  moedas: Array<{ code: string; name: string; symbol: string }>;
  idiomas: string[];
  coordenadas: number[] | null;
  fusosHorarios: string[];
}

export interface WeatherData {
  mock?: boolean;
  message?: string;
  cidade?: string;
  temperatura: number;
  sensacao: number;
  umidade: number;
  pressao: number;
  descricao: string;
  icone: string;
  vento: number;
  pais?: string;
}
