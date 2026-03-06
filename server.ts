import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { startSimulator } from "./src/lib/simulator";

const port = parseInt(process.env.PORT ?? "3000", 10);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socketio",
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on("vehicle:subscribe", ({ vehicleId }: { vehicleId: string }) => {
      socket.join(`vehicle:${vehicleId}`);
    });

    socket.on("vehicle:unsubscribe", ({ vehicleId }: { vehicleId: string }) => {
      socket.leave(`vehicle:${vehicleId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  // Start position simulator – emits vehicle:update every 2s
  startSimulator(io);

  httpServer.listen(port, () => {
    console.log(`> GeoInsight ready on http://localhost:${port} (${dev ? "dev" : "production"})`);
  });
});
