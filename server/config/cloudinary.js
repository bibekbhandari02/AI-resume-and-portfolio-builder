import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (lazy initialization)
let configured = false;

function ensureConfigured() {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    configured = true;
    console.log('☁️ Cloudinary configured');
  }
}

// Configure on import
ensureConfigured();

export default cloudinary;
