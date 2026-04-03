import { prisma } from "./prisma";

export interface Context {
  prisma: typeof prisma;
}

export function createContext(): Context {
  return { prisma };
}
