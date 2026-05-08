import type { Server as IOServer } from "socket.io";

let io: IOServer | null = null;

export function setSocketIO(server: IOServer) {
  io = server;
}

export function getIO(): IOServer | null {
  return io;
}

export function broadcastCartRefresh(cartId: string): void {
  io?.to(`cart:${cartId}`).emit("cart:refresh", { cartId });
}
