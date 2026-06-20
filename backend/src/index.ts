import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import continentRoutes from './routes/continents';
import countryRoutes from './routes/countries';
import cityRoutes from './routes/cities';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/continentes', continentRoutes);
app.use('/api/paises', countryRoutes);
app.use('/api/cidades', cityRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
