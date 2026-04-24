import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { config } from "./config/env";
import { AuthPayload } from "./middleware/auth";

let io: SocketIOServer;

export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.clientUrl,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication Middleware for Sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user as AuthPayload;
    console.log(`🔌 User connected: ${user.email} (${socket.id})`);

    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${user.email}`);
    });

    // ─── MARKET SQUARE EVENTS ───────────────────────────────
    socket.on("join-square", (squareId: string) => {
      socket.join(`square:${squareId}`);
      console.log(`🏠 User ${user.email} joined square room: ${squareId}`);
    });

    socket.on("leave-square", (squareId: string) => {
      socket.leave(`square:${squareId}`);
      console.log(`🏠 User ${user.email} left square room: ${squareId}`);
    });

    socket.on("send-square-message", (data: { squareId: string, message: any }) => {
      io.to(`square:${data.squareId}`).emit("new-square-message", data.message);
    });

    socket.on("update-square-stage", (data: { squareId: string, participant: any }) => {
      io.to(`square:${data.squareId}`).emit("stage-updated", data.participant);
    });

    socket.on("raise-square-hand", (data: { squareId: string, userId: string, status: boolean }) => {
      io.to(`square:${data.squareId}`).emit("hand-raised", data);
    });

    socket.on("audio-stream", (data: { squareId: string, audioData: string, userId: string }) => {
      // Broadcast to everyone else in the room
      socket.to(`square:${data.squareId}`).emit("audio-stream", data);
    });

    socket.on("end-square", (squareId: string) => {
      io.to(`square:${squareId}`).emit("square-ended");
      // Optional: force all sockets to leave the room
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

