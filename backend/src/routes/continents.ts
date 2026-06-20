import { Router } from 'express';
import { z } from 'zod';
import { paginationMeta, parsePagination, prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const schema = z.object({
  nome: z.string().min(2),
  descricao: z.string().min(3),
});

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });
  const search = (req.query.search as string | undefined)?.trim();

  const where = search
    ? { OR: [{ nome: { contains: search, mode: 'insensitive' as const } }, { descricao: { contains: search, mode: 'insensitive' as const } }] }
    : {};

  const [data, total] = await Promise.all([
    prisma.continente.findMany({ where, skip, take: limit, orderBy: { nome: 'asc' }, include: { _count: { select: { paises: true } } } }),
    prisma.continente.count({ where }),
  ]);

  return res.json({ data, pagination: paginationMeta(total, page, limit) });
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const continente = await prisma.continente.findUnique({
    where: { id },
    include: { paises: { include: { _count: { select: { cidades: true } } } } },
  });
  if (!continente) return res.status(404).json({ error: 'Continente não encontrado' });
  return res.json(continente);
});

router.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
  }
  const continente = await prisma.continente.create({ data: parsed.data });
  return res.status(201).json(continente);
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
  }
  try {
    const continente = await prisma.continente.update({ where: { id }, data: parsed.data });
    return res.json(continente);
  } catch {
    return res.status(404).json({ error: 'Continente não encontrado' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const paises = await prisma.pais.count({ where: { continenteId: id } });
  if (paises > 0) {
    return res.status(409).json({ error: 'Não é possível excluir continente com países vinculados' });
  }
  try {
    await prisma.continente.delete({ where: { id } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: 'Continente não encontrado' });
  }
});

export default router;
