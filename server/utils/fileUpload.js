const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Check if Cloudinary is configured
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary successfully configured.');
} else {
  console.log('Cloudinary credentials missing. Falling back to local storage.');
}

/**
 * Saves a base64 data URL to Cloudinary (if configured) or to the local filesystem.
 * If the input is not a base64 data URL, returns it as-is.
 * 
 * @param {string} base64Data - The input string (might be a base64 Data URL or a normal URL)
 * @param {string} prefix - Filename prefix (e.g., 'photo', 'video')
 * @returns {Promise<string>} - The stored URL or local relative path (e.g. '/uploads/file.png') or the original string
 */
async function saveBase64File(base64Data, prefix = 'file') {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:')) {
    return base64Data;
  }

  // If Cloudinary is configured, upload to Cloudinary
  if (isCloudinaryConfigured) {
    try {
      const resourceType = prefix === 'video' ? 'video' : 'image';
      console.log(`Uploading ${prefix} to Cloudinary...`);
      const result = await cloudinary.uploader.upload(base64Data, {
        folder: 'memory-gallery',
        resource_type: resourceType
      });
      console.log(`Cloudinary upload successful: ${result.secure_url}`);
      return result.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed, trying local fallback:", err.message);
      // Fallback to local file system if Cloudinary fails
    }
  }

  // Fallback / Local Storage implementation
  try {
    const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Data;
    }

    const mimeType = matches[1];
    const base64Str = matches[2];
    const buffer = Buffer.from(base64Str, 'base64');

    const extension = mimeType.split('/')[1] || 'bin';
    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
    
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    return `/uploads/${filename}`;
  } catch (err) {
    console.error("Failed to save base64 file locally:", err);
    return base64Data;
  }
}

module.exports = {
  saveBase64File
};
