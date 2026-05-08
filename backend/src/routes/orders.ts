import { Router } from "express";
import { prisma } from "../lib/prisma";
import { getSession } from "../lib/session";
import { requireUser } from "../lib/auth-helpers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2023-10-16" as any,
});

const router = Router();

// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const session = await getSession(req, res);
    const user = await requireUser(session);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        lines: true,
        payer: { select: { name: true, email: true } },
        cart: {
          include: {
            restaurant: true,
            participants: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Security check: Only the payer or a participant can see the order
    const isParticipant = order.cart.participants.some(p => p.userId === user.id);
    if (order.payerId !== user.id && !isParticipant && user.role !== "ADMIN") {
       res.status(403).json({ error: "Forbidden" });
       return;
    }

    // If Stripe order is pending, check session status if sessionId provided in query
    const sessionId = req.query.session_id as string;
    if (order.status === "PENDING_STRIPE" && sessionId) {
      try {
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
        if (checkoutSession.payment_status === "paid") {
          await prisma.order.update({
            where: { id: order.id },
            data: { 
              status: "CONFIRMED",
              stripePaymentId: checkoutSession.payment_intent as string
            }
          });
          order.status = "CONFIRMED";
        }
      } catch (err) {
        console.error("Stripe verification failed:", err);
      }
    }

    res.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Unexpected error" });
  }
});

export default router;
