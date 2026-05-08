import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getSession } from "../lib/session";
import { requireUser } from "../lib/auth-helpers";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1).max(80),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const { email, password, name } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, role: true },
    });

    const session = await getSession(req, res);
    session.userId = user.id;
    await session.save();

    res.json({ user });
  } catch {
    res.status(500).json({ error: "Unexpected error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const session = await getSession(req, res);
    session.userId = user.id;
    await session.save();

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch {
    res.status(500).json({ error: "Unexpected error" });
  }
});

router.post("/logout", async (req, res) => {
  const session = await getSession(req, res);
  session.destroy();
  res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  try {
    const session = await getSession(req, res);
    const user = await requireUser(session);
    res.json({ user });
  } catch {
    res.status(500).json({ error: "Unexpected error" });
  }
});

export default router;
