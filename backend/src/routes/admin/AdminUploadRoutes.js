import { Router } from 'express';
import { protect, requireRole } from '../../middlewars/authentification.js';
import { uploadPhotos as uploadPhotosCtrl, uploadVideo as uploadVideoCtrl } from '../../controllers/admin/AdminUploadControleur.js';
import { uploadPhotos as multerPhotos, uploadVideo as multerVideo } from '../../config/upload.js';

const routeur = Router();

routeur.use(protect, requireRole('admin'));

/**
 * POST /api/admin/upload/photos
 * Champ multipart : "photos" (tableau, max 10)
 */
routeur.post(
  '/photos',
  (req, res, next) => {
    multerPhotos.array('photos', 10)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  uploadPhotosCtrl
);

/**
 * POST /api/admin/upload/video
 * Champ multipart : "video" (fichier unique)
 */
routeur.post(
  '/video',
  (req, res, next) => {
    multerVideo.single('video')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  uploadVideoCtrl
);

export default routeur;
