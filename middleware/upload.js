// middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure uploads directory exists relative to project root
    const uploadsPath = path.join(__dirname, "../uploads");
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    // Use timestamp + original filename to prevent conflicts
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  // Only allow image files
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  limits: { 
    fileSize: 8 * 1024 * 1024, // 8MB limit
    files: 1 // Only one file at a time
  },
  fileFilter,
});
