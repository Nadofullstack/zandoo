import api from '../api';

/**
 * Upload de photos produit vers Cloudinary via le backend.
 * Retourne la liste des URLs publiques.
 */
export async function uploadPhotos(fichiers: File[]): Promise<string[]> {
  const formData = new FormData();
  fichiers.forEach((f) => formData.append('photos', f));

  const { data } = await api.post('/admin/upload/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data.urls as string[];
}

/**
 * Upload d'une vidéo produit vers Cloudinary via le backend.
 * Retourne l'URL publique.
 */
export async function uploadVideo(fichier: File): Promise<string> {
  const formData = new FormData();
  formData.append('video', fichier);

  const { data } = await api.post('/admin/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data.url as string;
}
