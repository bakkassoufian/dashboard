import { v2 as cloudinary } from 'cloudinary';

export function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function ensureConfig() {
  if (!isCloudinaryConfigured()) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * @param {Buffer} buffer
 * @returns {Promise<string>} secure_url
 */
export async function uploadFormationImageBuffer(buffer) {
  ensureConfig();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'odc-formations', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url)),
    );
    stream.end(buffer);
  });
}
