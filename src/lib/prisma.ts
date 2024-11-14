import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

declare global {
  // Extensão de globalThis para incluir a propriedade `prisma`
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  global.prisma ||
  new PrismaClient({
    log: ['query'],
  }).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
