import { Router } from 'express';
import { z } from 'zod';
import { paginationMeta, parsePagination, prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { fetchCountryByName } from '../services/externalApis';

const router = Router();

const schema = z.object({
  nome: z.string().min(2),
  populacao: z.number().int().nonnegative(),
  idiomaOficial: z.string().min(2),
  moeda: z.string().min(2),
  continenteId: z.number().int().positive(),
});

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });
  const search = (req.query.search as string | undefined)?.trim();
  const continenteId = req.query.continenteId ? parseInt(req.query.continenteId as string, 10) : undefined;

  const where: Record<string, unknown> = {};
  if (continenteId) where.continenteId = continenteId;
  if (search) {
    where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { idiomaOficial: { contains: search, mode: 'insensitive' } },
      { moeda: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.pais.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nome: 'asc' },
      include: { continente: true, _count: { select: { cidades: true } } },
    }),
    prisma.pais.count({ where }),
  ]);

  return res.json({ data, pagination: paginationMeta(total, page, limit) });
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const pais = await prisma.pais.findUnique({
    where: { id },
    include: { continente: true, cidades: true },
  });
  if (!pais) return res.status(404).json({ error: 'País não encontrado' });
  return res.json(pais);
});

router.get('/:id/external', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const pais = await prisma.pais.findUnique({ where: { id } });
  if (!pais) return res.status(404).json({ error: 'País não encontrado' });

  try {
    const external = await fetchCountryByName(pais.nome);
    return res.json({ local: pais, external });
  } catch (error) {
    return res.status(502).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
  }
  const continente = await prisma.continente.findUnique({ where: { id: parsed.data.continenteId } });
  if (!continente) return res.status(400).json({ error: 'Continente inválido' });

  const pais = await prisma.pais.create({ data: parsed.data, include: { continente: true } });
  return res.status(201).json(pais);
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
  }
  try {
    const pais = await prisma.pais.update({
      where: { id },
      data: parsed.data,
      include: { continente: true },
    });
    return res.json(pais);
  } catch {
    return res.status(404).json({ error: 'País não encontrado' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const cidades = await prisma.cidade.count({ where: { paisId: id } });
  if (cidades > 0) {
    return res.status(409).json({ error: 'Não é possível excluir país com cidades vinculadas' });
  }
  try {
    await prisma.pais.delete({ where: { id } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: 'País não encontrado' });
  }
});

export default router;
