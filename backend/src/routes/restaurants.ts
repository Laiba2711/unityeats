import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { getSession } from "../lib/session";
import { requireUser } from "../lib/auth-helpers";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { menuItems: true } },
      },
    });

    const payload = restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
      description: r.description,
      address: r.address,
      imageUrl: r.imageUrl,
      rating: r.rating,
      menuItemCount: r._count.menuItems,
    }));

    res.json({ restaurants: payload });
  } catch (error: any) {
    res.status(500).json({ error: "Unexpected error", details: error?.message || String(error) });
  }
});

// Search restaurants and dishes
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      res.json({ restaurants: [], dishes: [] });
      return;
    }

    const query = q.toLowerCase();

    const restaurants = await prisma.restaurant.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { cuisine: { contains: query } },
        ],
      },
    });

    const dishes = await prisma.menuItem.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      include: {
        restaurant: true,
      },
    });

    res.json({ restaurants, dishes });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Failed to perform search" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuItems: { orderBy: { name: "asc" } },
      },
    });

    if (!restaurant) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const { menuItems: items, ...rest } = restaurant;
    const menuItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      priceCents: item.priceCents,
      imageUrl: item.imageUrl,
    }));

    res.json({ restaurant: { ...rest, menuItems } });
  } catch {
    res.status(500).json({ error: "Unexpected error" });
  }
});


router.post("/", async (req, res) => {
  try {
    const session = await getSession(req, res);
    const user = await requireUser(session);
    
    if (!user || user.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const bodySchema = z.object({
      name: z.string().min(1),
      cuisine: z.string().min(1),
      description: z.string().min(1),
      address: z.string().min(1),
      rating: z.number().min(0).max(5).default(4.5),
      menuItems: z.array(z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        priceCents: z.number().int().min(0),
      })).optional(),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: parsed.data.name,
        cuisine: parsed.data.cuisine,
        description: parsed.data.description,
        address: parsed.data.address,
        rating: parsed.data.rating,
        menuItems: parsed.data.menuItems ? {
          create: parsed.data.menuItems,
        } : undefined,
      },
    });

    res.json({ restaurant });
  } catch (error) {
    console.error("Create restaurant error:", error);
    res.status(500).json({ error: "Unexpected error" });
  }
});

export default router;
