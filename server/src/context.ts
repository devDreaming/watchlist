import { IncomingMessage } from "http";
import { prisma } from "./prisma";
import { verifyToken } from "./auth";

export interface Context {
  prisma: typeof prisma;
  userId: string | null;
}

export function createContext(req: IncomingMessage): Context {
  const auth = req.headers["authorization"] ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  return { prisma, userId: payload?.userId ?? null };
}
