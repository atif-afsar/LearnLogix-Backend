import { uploadToCloudinary } from './cloudinary.js';

/**
 * Process uploaded image file and upload to Cloudinary
 * @param {Object} file - Multer file object (from req.file)
 * @param {string} folder - Cloudinary folder name (e.g., 'courses', 'team')
 * @returns {Promise<string>} - Returns secure_url from Cloudinary
 * @throws {Error} - If upload fails
 */
export const processImageUpload = async (file, folder = 'learnlogix') => {
  if (!file) {
    return null;
  }

  // Validate file type
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
  }

  // Validate file buffer exists
  if (!file.buffer) {
    throw new Error('File buffer is missing. Ensure multer is configured with memoryStorage.');
  }

  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.buffer, folder);
    return result.secure_url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};
