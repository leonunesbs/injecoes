import { PrismaClient } from '@prisma/client/edge';

declare global {
  // Extensão de globalThis para incluir a propriedade `prisma`
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  global.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
