# GeoWorld

Aplicação web completa para gerenciamento de **continentes**, **países** e **cidades**, desenvolvida em TypeScript com PostgreSQL, Prisma ORM, React e integração com APIs externas.

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | Node.js, Express 5, TypeScript, JWT |
| Banco | PostgreSQL 16, Prisma ORM |
| APIs externas | [REST Countries](https://restcountries.com), [OpenWeatherMap](https://openweathermap.org/api) |

## Funcionalidades

- Login e cadastro de usuários (JWT)
- CRUD completo de continentes, países e cidades
- Relacionamentos: continente → país → cidade
- Listagem com **filtros** e **paginação**
- **REST Countries**: moedas, idiomas, fusos horários
- **OpenWeatherMap**: clima por latitude/longitude da cidade
- Link para mapa (OpenStreetMap) nas coordenadas da cidade

## Pré-requisitos

- Node.js 20+
- Docker (para PostgreSQL) ou PostgreSQL instalado localmente
- (Opcional) Chave gratuita da OpenWeatherMap

## Como executar

### 1. Subir o PostgreSQL

```bash
docker compose up -d
```

### 2. Configurar o backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
```

Edite `.env` se necessário. Para clima real, adicione sua chave em `OPENWEATHER_API_KEY`.

### 3. Iniciar backend e frontend

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm install
npm run dev
```

Acesse: **http://localhost:5173**

### Credenciais demo

- E-mail: `admin@geo.com`
- Senha: `admin123`

## Estrutura do projeto

```
geo-world-manager/
├── backend/
│   ├── prisma/schema.prisma   # Modelos e relacionamentos
│   ├── prisma/seed.ts         # Dados iniciais
│   └── src/
│       ├── routes/            # Endpoints REST
│       ├── services/          # Integrações externas
│       └── middleware/        # Autenticação JWT
├── frontend/
│   └── src/
│       ├── pages/             # Telas (Login, CRUD, Dashboard)
│       ├── api/               # Cliente HTTP
│       └── components/        # Layout, paginação
└── docker-compose.yml
```

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login |
| GET/POST/PUT/DELETE | `/api/continentes` | CRUD continentes |
| GET/POST/PUT/DELETE | `/api/paises` | CRUD países |
| GET | `/api/paises/:id/external` | Dados REST Countries |
| GET/POST/PUT/DELETE | `/api/cidades` | CRUD cidades |
| GET | `/api/cidades/:id/weather` | Clima OpenWeatherMap |

## Modelo de dados

```
Continente (id, nome, descricao)
    └── Pais (id, nome, populacao, idiomaOficial, moeda, continenteId)
            └── Cidade (id, nome, populacao, latitude, longitude, paisId)
```

## Curso

Projeto desenvolvido para **Análise e Desenvolvimento de Sistemas** — gestão geográfica com integração de APIs externas.
