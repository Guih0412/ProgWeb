import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@geo.com' },
    update: {},
    create: {
      email: 'admin@geo.com',
      name: 'Administrador',
      password,
    },
  });

  const america = await prisma.continente.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nome: 'América do Sul',
      descricao: 'Continente localizado no hemisfério ocidental, entre o Oceano Atlântico e o Pacífico.',
    },
  });

  const europa = await prisma.continente.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nome: 'Europa',
      descricao: 'Continente que compreende a porção ocidental do continente eurasiático.',
    },
  });

  const brasil = await prisma.pais.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nome: 'Brasil',
      populacao: 214000000,
      idiomaOficial: 'Português',
      moeda: 'Real (BRL)',
      continenteId: america.id,
    },
  });

  const portugal = await prisma.pais.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nome: 'Portugal',
      populacao: 10300000,
      idiomaOficial: 'Português',
      moeda: 'Euro (EUR)',
      continenteId: europa.id,
    },
  });

  await prisma.cidade.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nome: 'São Paulo',
      populacao: 12300000,
      latitude: -23.5505,
      longitude: -46.6333,
      paisId: brasil.id,
    },
  });

  await prisma.cidade.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nome: 'Rio de Janeiro',
      populacao: 6748000,
      latitude: -22.9068,
      longitude: -43.1729,
      paisId: brasil.id,
    },
  });

  await prisma.cidade.upsert({
    where: { id: 3 },
    update: {},
    create: {
      nome: 'Lisboa',
      populacao: 547000,
      latitude: 38.7223,
      longitude: -9.1393,
      paisId: portugal.id,
    },
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
