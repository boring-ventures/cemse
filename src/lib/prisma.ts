import { PrismaClient } from &ldquo;@prisma/client&rdquo;;

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [&ldquo;query&rdquo;],
  });

if (process.env.NODE_ENV !== &ldquo;production&rdquo;) globalForPrisma.prisma = prisma;

export default prisma;
