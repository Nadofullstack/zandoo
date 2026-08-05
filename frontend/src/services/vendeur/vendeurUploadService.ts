import api from '../api';

export async function uploadPhotos(fichiers: File[]): Promise<string[]> {
  const formData = new FormData();
  fichiers.forEach((f) => formData.append('photos', f));

  const { data } = await api.post('/vendeur/upload/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data.urls as string[];
}

export async function uploadVideo(fichier: File): Promise<string> {
  const formData = new FormData();
  formData.append('video', fichier);

  const { data } = await api.post('/vendeur/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data.url as string;
}
