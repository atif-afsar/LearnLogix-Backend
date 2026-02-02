import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import contactRoutes from "./routes/contact.routes.js";
import courseRoutes from "./routes/course.route.js";
import adminRoutes from "./routes/admin.routes.js";
import teamRoutes from "./routes/team.route.js";
import connectDB from "./db/connectDB.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables first
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

connectDB();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "https://learnlogix.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "LearnLogix Backend API is running!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/team", teamRoutes);
app.get("/test", (req, res) => {
  res.json({ message: "Server is alive!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

export default app;
   