import express from "express";
import cors from "cors";
import contactRoutes from "./routes/contact.routes.js";
import courseRoutes from "./routes/course.route.js";
import adminRoutes from "./routes/admin.routes.js";
import teamRoutes from "./routes/team.route.js";
import connectDB from "./db/connectDB.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();
const app = express();

connectDB();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/team", teamRoutes);
app.get("/test", (req, res) => {
  res.json({ message: "Server is alive!" });
});

export default app;
   