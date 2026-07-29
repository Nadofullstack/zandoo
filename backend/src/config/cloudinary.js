import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

/* ─── Configuration Cloudinary ───────────────────────────────────────────── */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/* ─── Types MIME autorisés ────────────────────────────────────────────────── */
const TYPES_IMAGE = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const TYPES_VIDEO = ['video/mp4', 'video/webm', 'video/ogg'];

/* ─── Filtre de type ──────────────────────────────────────────────────────── */
function filtrerFichier(_req, file, cb) {
  const autorise = [...TYPES_IMAGE, ...TYPES_VIDEO].includes(file.mimetype);
  if (autorise) {
    cb(null, true);
  } else {
    cb(new Error('Format non supporté. Images : JPEG/PNG/WebP — Vidéo : MP4/WebM/OGG'));
  }
}

/* ─── Stockage Cloudinary — Photos ───────────────────────────────────────── */
const stockagePhotos = new CloudinaryStorage({
  cloudinary,
  params: (_req, file) => ({
    folder:        'zandoo/produits/photos',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    public_id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  }),
});

/* ─── Stockage Cloudinary — Vidéos ───────────────────────────────────────── */
const stockageVideo = new CloudinaryStorage({
  cloudinary,
  params: (_req, _file) => ({
    folder:        'zandoo/produits/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'ogg'],
    public_id: `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  }),
});

/* ─── Instance multer photos (max 10 × 5 Mo) ─────────────────────────────── */
export const uploadPhotos = multer({
  storage:    stockagePhotos,
  fileFilter: filtrerFichier,
  limits:     { fileSize: 5 * 1024 * 1024, files: 10 },
});

/* ─── Instance multer vidéo (max 1 × 50 Mo) ──────────────────────────────── */
export const uploadVideo = multer({
  storage:    stockageVideo,
  fileFilter: filtrerFichier,
  limits:     { fileSize: 50 * 1024 * 1024, files: 1 },
});
