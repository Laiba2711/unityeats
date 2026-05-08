import type { IronSession } from "iron-session";
import { prisma } from "./prisma";
import type { SessionData } from "./session";

export async function requireUser(session: IronSession<SessionData>) {
  if (!session.userId) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  });
}
