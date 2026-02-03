// middleware/upload.js
import multer from "multer";

// Use memory storage instead of disk storage
// Files will be stored in memory as buffers and uploaded directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Only allow specific image file types
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (file.mimetype && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, JPG, PNG, WebP) are allowed"), false);
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
