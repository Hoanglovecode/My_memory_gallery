const fs = require('fs');
const path = require('path');

/**
 * Saves a base64 data URL to the filesystem as a file under the /uploads directory.
 * If the input is not a base64 data URL, returns it as-is.
 * 
 * @param {string} base64Data - The input string (might be a base64 Data URL or a normal URL)
 * @param {string} prefix - Filename prefix (e.g., 'photo', 'video')
 * @returns {string} - The stored relative path (e.g. '/uploads/file.png') or the original string
 */
function saveBase64File(base64Data, prefix = 'file') {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:')) {
    return base64Data;
  }

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
    console.error("Failed to save base64 file:", err);
    return base64Data;
  }
}

module.exports = {
  saveBase64File
};
