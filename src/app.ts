
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

//Add this import
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.routes.js"

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//Register the authentication routes here
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Health check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SupportDesk API is running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

export default app;
