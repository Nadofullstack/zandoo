/**
 * POST /api/admin/upload/photos
 * Upload jusqu'à 10 photos produit vers Cloudinary.
 * Renvoie les URLs publiques Cloudinary.
 */
export const uploadPhotos = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu.' });
    }

    // multer-storage-cloudinary expose l'URL dans file.path
    const urls = req.files.map((f) => f.path);

    return res.status(200).json({
      success: true,
      message: `${urls.length} photo(s) uploadée(s) avec succès.`,
      data: { urls },
    });
  } catch (err) {
    console.error('Erreur uploadPhotos:', err);
    return res.status(500).json({ success: false, message: "Erreur lors de l'upload." });
  }
};

/**
 * POST /api/admin/upload/video
 * Upload d'une vidéo produit vers Cloudinary (max 50 Mo).
 */
export const uploadVideo = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucune vidéo reçue.' });
    }

    // multer-storage-cloudinary expose l'URL dans file.path
    const url = req.file.path;

    return res.status(200).json({
      success: true,
      message: 'Vidéo uploadée avec succès.',
      data: { url },
    });
  } catch (err) {
    console.error('Erreur uploadVideo:', err);
    return res.status(500).json({ success: false, message: "Erreur lors de l'upload." });
  }
};
