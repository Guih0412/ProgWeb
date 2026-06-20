interface RestCountryResponse {
  name: { common: string; official: string };
  capital?: string[];
  population: number;
  region: string;
  subregion?: string;
  flags: { png: string; svg: string; alt?: string };
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  latlng?: number[];
  timezones?: string[];
}

interface WeatherResponse {
  name: string;
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  weather: Array<{ main: string; description: string; icon: string }>;
  wind: { speed: number };
  sys: { country: string; sunrise: number; sunset: number };
}

export async function fetchCountryByName(name: string) {
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=name,capital,population,region,subregion,flags,currencies,languages,latlng,timezones`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('País não encontrado na REST Countries API');
  }
  const data = (await response.json()) as RestCountryResponse[];
  const country = data[0];
  return {
    nome: country.name.common,
    nomeOficial: country.name.official,
    capital: country.capital?.[0] ?? null,
    populacao: country.population,
    regiao: country.region,
    subregiao: country.subregion ?? null,
    bandeira: country.flags.png,
    bandeiraSvg: country.flags.svg,
    moedas: country.currencies
      ? Object.entries(country.currencies).map(([code, c]) => ({ code, ...c }))
      : [],
    idiomas: country.languages ? Object.values(country.languages) : [],
    coordenadas: country.latlng ?? null,
    fusosHorarios: country.timezones ?? [],
  };
}

export async function fetchWeather(lat: number, lon: number) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === 'sua-chave-openweathermap') {
    return {
      mock: true,
      message: '',
      temperatura: 22,
      sensacao: 21,
      umidade: 65,
      pressao: 1013,
      descricao: 'Parcialmente nublado',
      icone: '02d',
      vento: 3.5,
    };
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Não foi possível obter dados de clima');
  }
  const data = (await response.json()) as WeatherResponse;
  return {
    mock: false,
    cidade: data.name,
    temperatura: data.main.temp,
    sensacao: data.main.feels_like,
    umidade: data.main.humidity,
    pressao: data.main.pressure,
    descricao: data.weather[0]?.description ?? '',
    icone: data.weather[0]?.icon ?? '',
    vento: data.wind.speed,
    pais: data.sys.country,
  };
}

export function getFlagUrl(countryName: string) {
  return `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=flags`;
}
