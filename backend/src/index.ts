import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import authRoutes from "./routes/auth";
import restaurantRoutes from "./routes/restaurants";
import cartRoutes from "./routes/carts";
import orderRoutes from "./routes/orders";
import { setSocketIO } from "./lib/socket-registry";

const ALLOWED_ORIGINS = new Set(["http://localhost:3000", "http://127.0.0.1:3000"]);

const PORT = 4000;

const app = express();
app.disable("etag");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const httpServer = http.createServer(app);

const io = new IOServer(httpServer, {
  path: "/socket.io/",
  cors: {
    origin: [...ALLOWED_ORIGINS],
    credentials: true,
  },
});

setSocketIO(io);

io.on("connection", (socket) => {
  socket.on("join_cart", (cartId: unknown) => {
    if (
      typeof cartId === "string" &&
      /^[a-z0-9]+$/i.test(cartId) &&
      cartId.length <= 64
    ) {
      socket.join(`cart:${cartId}`);
    }
  });
  socket.on("leave_cart", (cartId: unknown) => {
    if (typeof cartId === "string" && /^[a-z0-9]+$/i.test(cartId)) {
      socket.leave(`cart:${cartId}`);
    }
  });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`API + Socket.IO on http://127.0.0.1:${PORT}`);
});
