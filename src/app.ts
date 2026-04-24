import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

// Route imports
import authRoutes from "./modules/auth/auth.routes";
import adminRoutes from "./modules/admin/admin.routes";
import homeRoutes from "./modules/home/home.routes";
import usersRoutes from "./modules/users/users.routes";
import searchRoutes from "./modules/search/search.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import postRoutes from "./modules/post/post.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import messageRoutes from "./modules/message/message.routes";
import squareRoutes from "./modules/post/square.routes";

const app = express();

// ─── GLOBAL MIDDLEWARE ────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for mobile/testing
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── HEALTH CHECK ─────────────────────────────────────────
import { prisma } from "./config/database";

app.get("/api/health", async (_req, res) => {
  try {
    // A lightweight query to keep the Neon database awake
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      db: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/api", (_req, res) => {
  res.json({
    success: true,
    message: "🚀 Terra Mobile API is running",
    version: "1.0.0",
    docs: "Please use specific endpoints like /api/health, /api/auth, etc.",
  });
});

// ─── API ROUTES ───────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/squares", squareRoutes);

// ─── 404 HANDLER ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── ERROR HANDLER ────────────────────────────────────────
app.use(errorHandler);

export default app;
