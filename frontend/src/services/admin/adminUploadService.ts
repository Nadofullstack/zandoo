const API_URL = import.meta.env.VITE_API_URL as string;

/**
 * Upload de photos produit vers Cloudinary via le backend.
 * Retourne la liste des URLs publiques.
 */
export async function uploadPhotos(fichiers: File[]): Promise<string[]> {
  const formData = new FormData();
  fichiers.forEach((f) => formData.append('photos', f));

  const res = await fetch(`${API_URL}/admin/upload/photos`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const donnees = await res.json();
  if (!res.ok) throw new Error(donnees.message || 'Erreur upload photos.');
  return donnees.data.urls as string[];
}

/**
 * Upload d'une vidéo produit vers Cloudinary via le backend.
 * Retourne l'URL publique.
 */
export async function uploadVideo(fichier: File): Promise<string> {
  const formData = new FormData();
  formData.append('video', fichier);

  const res = await fetch(`${API_URL}/admin/upload/video`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const donnees = await res.json();
  if (!res.ok) throw new Error(donnees.message || 'Erreur upload vidéo.');
  return donnees.data.url as string;
}
