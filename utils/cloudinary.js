import { v2 as cloudinary } from 'cloudinary';

// Track if Cloudinary has been configured
let isConfigured = false;

// Configure Cloudinary - environment variables should be loaded by server.js
// This function ensures Cloudinary is configured before use
const configureCloudinary = () => {
  // If already configured, skip
  if (isConfigured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Validate that all required environment variables are present
  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [];
    if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missing.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
    
    throw new Error(
      `Cloudinary configuration error: Missing required environment variables: ${missing.join(', ')}. ` +
      `Please set these in your deployment platform's environment variables.`
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  isConfigured = true;
  console.log('✅ Cloudinary configured successfully');
};

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} imageBuffer - Image file buffer from multer
 * @param {string} folder - Cloudinary folder path (e.g., 'courses', 'team')
 * @param {string} publicId - Optional custom public_id for the image
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadToCloudinary = async (imageBuffer, folder = 'learnlogix', publicId = null) => {
  // Ensure Cloudinary is configured before uploading
  configureCloudinary();

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
    // Ensure Cloudinary is configured
    configureCloudinary();

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

// Export configuration function for explicit initialization
export { configureCloudinary };

export default cloudinary;
