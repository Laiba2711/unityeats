import { Router } from "express";
import { prisma } from "../lib/prisma";
import { getSession } from "../lib/session";
import { requireUser } from "../lib/auth-helpers";
import { broadcastCartRefresh } from "../lib/socket-registry";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2023-10-16" as any,
});

const router = Router();

// Get user's active cart
router.get("/active", async (req, res) => {
  try {
    const session = await getSession(req, res);
    const user = await requireUser(session);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { restaurantId } = req.query;

    const cartParticipant = await prisma.cartParticipant.findFirst({
      where: {
        userId: user.id,
        cart: { 
          status: "ACTIVE",
          restaurantId: restaurantId ? String(restaurantId) : undefined,
        },
      },
      include: {
        cart: {
          include: {
            _count: {
              select: { items: true }
            }
          }
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    if (!cartParticipant) {
      res.json({ itemCount: 0, token: null });
      return;
    }

    res.json({ 
      token: cartParticipant.cart.shareToken,
      itemCount: cartParticipant.cart._count.items
    });
  } catch (error) {
    console.error("Active cart error:", error);
    res.status(500).json({ error: "Unexpected error" });
  }
});

// Create a new cart
router.post("/", async (req, res) => {
  try {
    const session = await getSession(req, res);
    const user = await requireUser(session);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const bodySchema = z.object({
      restaurantId: z.string().cuid(),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid restaurantId" });
      return;
    }

    const cart = await prisma.cart.create({
      data: {
        restaurantId: parsed.data.restaurantId,
        createdById: user.id,
        participants: {
          create: { userId: user.id },
        },
      },
    });

    res.json({ cart });
  } catch (error) {
    console.error("Create cart error:", error);
    res.status(500).json({ error: "Unexpected error" });
  }
});

// Get cart by shareToken
router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const cart = await prisma.cart.findUnique({
      where: { shareToken: token },
      include: {
        restaurant: {
          include: { menuItems: true },
        },
        participants: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        items: {
          include: { menuItem: true },
        },
        order: { select: { id: true } },
      },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    res.json({ cart });
  } catch {
    res.status(500).json({ error: "Unexpected error" });
  }
});

// Join a cart
router.post("/:token/join", async (req, res) => {
  try {
    const { token } = req.params;
    const session = await getSession(req, res);
    const user = await requireUser(session);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { shareToken: token },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    await prisma.cartParticipant.upsert({
      where: {
        cartId_userId: {
          cartId: cart.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        cartId: cart.id,
        userId: user.id,
      },
    });

    broadcastCartRefresh(cart.shareToken);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Unexpected error" });
  }
});

// Lock a cart (Set location and lock items)
router.post("/:token/lock", async (req, res) => {
  try {
    const { token } = req.params;
    const session = await getSession(req, res);
    const user = await requireUser(session);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const bodySchema = z.object({
      deliveryLocation: z.string().min(5),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please provide a valid delivery location (min 5 characters)" });
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { shareToken: token },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    if (cart.createdById !== user.id) {
      res.status(403).json({ error: "Only the cart creator can lock the location" });
      return;
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        deliveryLocation: parsed.data.deliveryLocation,
        isLocked: true,
      },
    });

    broadcastCartRefresh(cart.shareToken);
    res.json({ ok: true });
  } catch (error) {
    console.error("Lock cart error:", error);
    res.status(500).json({ error: "Unexpected error" });
  }
});

// Add/Update item in cart
router.post("/:token/items", async (req, res) => {
  try {
    const { token } = req.params;
    const session = await getSession(req, res);
    const user = await requireUser(session);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const bodySchema = z.object({
      menuItemId: z.string().cuid(),
      quantity: z.number().int().min(1),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid item data" });
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { shareToken: token },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    if (cart.isLocked) {
      res.status(400).json({ error: "This cart is locked and cannot be modified" });
      return;
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_menuItemId: {
          cartId: cart.id,
          menuItemId: parsed.data.menuItemId,
        },
      },
      update: {
        quantity: parsed.data.quantity,
      },
      create: {
        cartId: cart.id,
        menuItemId: parsed.data.menuItemId,
        quantity: parsed.data.quantity,
      },
    });

    broadcastCartRefresh(cart.shareToken);
    res.json({ ok: true });
  } catch (error) {
    console.error("Cart item error:", error);
    res.status(500).json({ error: "Unexpected error" });
  }
});

// Remove item from cart
router.delete("/:token/items/:itemId", async (req, res) => {
  try {
    const { token, itemId } = req.params;
    const session = await getSession(req, res);
    const user = await requireUser(session);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { shareToken: token },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    if (cart.isLocked) {
      res.status(400).json({ error: "This cart is locked and cannot be modified" });
      return;
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.cartId !== cart.id) {
      res.status(404).json({ error: "Item not found in this cart" });
      return;
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    broadcastCartRefresh(cart.shareToken);
    res.json({ ok: true });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({ error: "Unexpected error" });
  }
});

// Checkout (COD or Stripe Simulation)
router.post("/:token/checkout", async (req, res) => {
  try {
    const { token } = req.params;
    const { paymentMethod } = req.body; // "COD" or "STRIPE"
    
    const session = await getSession(req, res);
    const user = await requireUser(session);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { shareToken: token },
      include: {
        items: { include: { menuItem: true } },
        participants: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ error: "Cart is empty or not found" });
      return;
    }

    if (cart.status !== "ACTIVE") {
      res.status(400).json({ error: "Order already processed" });
      return;
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.menuItem.priceCents * item.quantity,
      0
    );
    const totalCents = subtotal + 250; // Including service fee

    // Create the order
    const order = await prisma.order.create({
      data: {
        cartId: cart.id,
        payerId: user.id,
        totalCents,
        paymentMethod: paymentMethod === "STRIPE" ? "STRIPE" : "COD",
        status: paymentMethod === "STRIPE" ? "PENDING_STRIPE" : "CONFIRMED",
        lines: {
          create: cart.items.map((item) => ({
            menuItemId: item.menuItem.id,
            itemName: item.menuItem.name,
            priceCents: item.menuItem.priceCents,
            quantity: item.quantity,
          })),
        },
      },
    });

    // Mark cart as paid/locked if COD, or pending if Stripe
    await prisma.cart.update({
      where: { id: cart.id },
      data: { status: paymentMethod === "STRIPE" ? "LOCKED" : "PAID" },
    });

    broadcastCartRefresh(cart.shareToken);

    if (paymentMethod === "STRIPE") {
      const frontendUrl = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          ...cart.items.map((item) => ({
            price_data: {
              currency: "usd",
              product_data: {
                name: item.menuItem.name,
                description: item.menuItem.description,
                images: item.menuItem.imageUrl ? [item.menuItem.imageUrl] : [],
              },
              unit_amount: item.menuItem.priceCents,
            },
            quantity: item.quantity,
          })),
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Service Fee",
                description: "UnityEats Delivery & Platform Fee",
              },
              unit_amount: 250,
            },
            quantity: 1,
          }
        ],
        mode: "payment",
        success_url: `${frontendUrl}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/cart/${token}`,
        metadata: {
          cartId: cart.id,
          orderId: order.id,
        },
      });

      res.json({ url: session.url });
    } else {
      res.json({ ok: true, orderId: order.id });
    }
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Unexpected error" });
  }
});

export default router;
