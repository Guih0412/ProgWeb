import { Router } from 'express';
import { z } from 'zod';
import { paginationMeta, parsePagination, prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { fetchWeather } from '../services/externalApis';

const router = Router();

const schema = z.object({
  nome: z.string().min(2),
  populacao: z.number().int().nonnegative(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  paisId: z.number().int().positive(),
});

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });
  const search = (req.query.search as string | undefined)?.trim();
  const paisId = req.query.paisId ? parseInt(req.query.paisId as string, 10) : undefined;
  const continenteId = req.query.continenteId ? parseInt(req.query.continenteId as string, 10) : undefined;

  const where: Record<string, unknown> = {};
  if (paisId) where.paisId = paisId;
  if (continenteId) where.pais = { continenteId };
  if (search) where.nome = { contains: search, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    prisma.cidade.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nome: 'asc' },
      include: { pais: { include: { continente: true } } },
    }),
    prisma.cidade.count({ where }),
  ]);

  return res.json({ data, pagination: paginationMeta(total, page, limit) });
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const cidade = await prisma.cidade.findUnique({
    where: { id },
    include: { pais: { include: { continente: true } } },
  });
  if (!cidade) return res.status(404).json({ error: 'Cidade não encontrada' });
  return res.json(cidade);
});

router.get('/:id/weather', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const cidade = await prisma.cidade.findUnique({
    where: { id },
    include: { pais: true },
  });
  if (!cidade) return res.status(404).json({ error: 'Cidade não encontrada' });

  try {
    const weather = await fetchWeather(cidade.latitude, cidade.longitude);
    return res.json({ cidade, weather });
  } catch (error) {
    return res.status(502).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
  }
  const pais = await prisma.pais.findUnique({ where: { id: parsed.data.paisId } });
  if (!pais) return res.status(400).json({ error: 'País inválido' });

  const cidade = await prisma.cidade.create({
    data: parsed.data,
    include: { pais: { include: { continente: true } } },
  });
  return res.status(201).json(cidade);
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
  }
  try {
    const cidade = await prisma.cidade.update({
      where: { id },
      data: parsed.data,
      include: { pais: { include: { continente: true } } },
    });
    return res.json(cidade);
  } catch {
    return res.status(404).json({ error: 'Cidade não encontrada' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await prisma.cidade.delete({ where: { id } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: 'Cidade não encontrada' });
  }
});

export default router;
