// upload.js
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ✅ Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Storage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads_dev',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

// ✅ Route upload (router, bukan app)
router.post('/', upload.single('gambar'), (req, res) => {
  res.json({
    url: req.file.path,
    public_id: req.file.filename,
  });
});

export default router;
