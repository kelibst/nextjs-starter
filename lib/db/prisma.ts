import { PrismaClient } from "@prisma/client";
import { auditMiddleware } from "./middleware/audit.middleware";

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  // Register audit middleware for query logging and performance monitoring
  client.$use(auditMiddleware());

  return client;
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// Named export for compatibility with some imports
export { prisma };

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
