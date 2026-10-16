import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

/* ─── Configuration Cloudinary ───────────────────────────────────────────── */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

export { cloudinary };

/* ─── Types MIME autorisés ────────────────────────────────────────────────── */
const TYPES_IMAGE = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const TYPES_VIDEO = ['video/mp4', 'video/webm', 'video/ogg'];

/**
 * Premier filtre sur le type déclaré par le navigateur (falsifiable) ;
 * Cloudinary revérifie le contenu réel via `allowed_formats`.
 */
function filtrerFichier(_req, file, cb) {
  const autorise = [...TYPES_IMAGE, ...TYPES_VIDEO].includes(file.mimetype);
  if (autorise) {
    cb(null, true);
  } else {
    cb(new Error('Format non supporté. Images : JPEG/PNG/WebP — Vidéo : MP4/WebM/OGG'));
  }
}

const identifiantUnique = (prefixe) => `${prefixe}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Moteur de stockage multer qui envoie le fichier en flux direct vers Cloudinary
 * (aucune écriture disque, aucun tampon complet en mémoire).
 * Contrat identique à l'ancien multer-storage-cloudinary : `file.path` = URL sécurisée.
 *
 * @param {(file) => object} options - Paramètres d'upload Cloudinary pour chaque fichier
 */
function stockageCloudinary(options) {
  return {
    _handleFile(_req, file, cb) {
      const flux = cloudinary.uploader.upload_stream(options(file), (erreur, resultat) => {
        if (erreur) return cb(erreur);
        cb(null, {
          path:     resultat.secure_url,
          filename: resultat.public_id,
          size:     resultat.bytes,
        });
      });
      file.stream.on('error', cb);
      file.stream.pipe(flux);
    },

    /* Appelé par multer si la requête échoue après l'upload (ex. : fichier suivant refusé) */
    _removeFile(_req, file, cb) {
      if (!file.filename) return cb(null);
      const resourceType = TYPES_VIDEO.includes(file.mimetype) ? 'video' : 'image';
      cloudinary.uploader.destroy(file.filename, { resource_type: resourceType })
        .then(() => cb(null))
        .catch(cb);
    },
  };
}

/* ─── Stockage Cloudinary — Photos ───────────────────────────────────────── */
const stockagePhotos = stockageCloudinary(() => ({
  folder:          'zandoo/produits/photos',
  resource_type:   'image',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation:  [{ quality: 'auto', fetch_format: 'auto' }],
  public_id:       identifiantUnique('photo'),
}));

/* ─── Stockage Cloudinary — Vidéos ───────────────────────────────────────── */
const stockageVideo = stockageCloudinary(() => ({
  folder:          'zandoo/produits/videos',
  resource_type:   'video',
  allowed_formats: ['mp4', 'webm', 'ogg'],
  public_id:       identifiantUnique('video'),
}));

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
