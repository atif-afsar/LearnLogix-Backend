import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} imageBuffer - Image file buffer from multer
 * @param {string} folder - Cloudinary folder path (e.g., 'courses', 'team')
 * @param {string} publicId - Optional custom public_id for the image
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadToCloudinary = async (imageBuffer, folder = 'learnlogix', publicId = null) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
    };

    // Add custom public_id if provided
    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Failed to upload image to Cloudinary: ${error.message}`));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );

    uploadStream.end(imageBuffer);
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} imageUrl - Cloudinary secure_url of the image to delete
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return;
    }

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{optional_version}/{folder}/{filename}
    // The public_id is: {folder}/{filename} without extension
    const urlMatch = imageUrl.match(/\/upload\/(?:v\d+\/)?([^/]+\/.+)$/);
    
    if (urlMatch && urlMatch[1]) {
      // Remove file extension to get public_id
      const publicId = urlMatch[1].replace(/\.[^/.]+$/, '');
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw - deletion failures shouldn't break the flow
  }
};

export default cloudinary;
