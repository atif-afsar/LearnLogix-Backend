import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import courseRoutes from "./routes/course.route.js";
import adminRoutes from "./routes/admin.routes.js";
import teamRoutes from "./routes/team.route.js";
import { upload } from "./middleware/upload.js";
import connectDB from "./db/connectDB.js";
import { configureCloudinary } from "./utils/cloudinary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables first
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Cloudinary configuration after env vars are loaded
try {
  configureCloudinary();
} catch (error) {
  console.error('⚠️  Cloudinary configuration warning:', error.message);
  console.log('   Cloudinary will be configured when first used (if env vars are set)');
}

const app = express();

connectDB();

// Simple CORS configuration - allow all origins for local testing
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Static file serving for uploads removed - images are now stored in Cloudinary

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "LearnLogix Backend API is running!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Quick test endpoint
app.get("/api/ping", (req, res) => {
  res.json({ 
    message: "pong", 
    timestamp: new Date().toISOString() 
  });
});

// Debug endpoint to check CORS
app.get("/api/cors-test", (req, res) => {
  res.json({ 
    message: "CORS is working", 
    origin: req.headers.origin,
    timestamp: new Date().toISOString() 
  });
});

app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/team", teamRoutes);

app.get("/test", (req, res) => {
  res.json({ message: "Server is alive!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error occurred:", err.stack);
  
  // Handle multer errors specifically
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: "File too large. Maximum size is 8MB." });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: "Unexpected file field. Expected 'image'." });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  
  // Handle other errors
  if (err.message === "Only image files are allowed") {
    return res.status(400).json({ message: "Only image files are allowed" });
  }
  
  res.status(500).json({ message: "Something went wrong!" });
});

export default app;