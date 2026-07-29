import { useRef } from 'react';
import { Upload, ImagePlus, Video, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface PhotoPreview { fichier: File; preview: string; }

interface Props {
  photosPreview: PhotoPreview[];
  photosUrls: string[];
  videoPreview: string | null;
  videoUrl: string | null;
  erreurPhotos?: string;
  onSelectionPhotos: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSupprimerPhoto: (index: number) => void;
  onSelectionVideo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSupprimerVideo: () => void;
}

export default function OngletMedias({
  photosPreview, photosUrls, videoPreview, videoUrl, erreurPhotos,
  onSelectionPhotos, onSupprimerPhoto, onSelectionVideo, onSupprimerVideo,
}: Props) {
  const inputPhotos = useRef<HTMLInputElement>(null);
  const inputVideo  = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-5">

      {/* ── Photos ─────────────────────────────────────── */}
      <div>
        <label className="label-admin">
          <ImagePlus size={11} className="inline mr-1" aria-hidden />
          Photos ({photosPreview.length}/10)
        </label>

        {/* Grille de prévisualisations */}
        {photosPreview.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {photosPreview.map(({ preview }, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img src={preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                {photosUrls[i] && (
                  <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-0.5" title="Uploadée">
                    <CheckCircle2 size={10} />
                  </div>
                )}
                <button type="button" onClick={() => onSupprimerPhoto(i)}
                  aria-label={`Supprimer la photo ${i + 1}`}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5
                             opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Zone de dépôt */}
        {photosPreview.length < 10 && (
          <>
            <input ref={inputPhotos} type="file" multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={onSelectionPhotos} className="hidden" aria-label="Sélectionner des photos" />
            <button type="button" onClick={() => inputPhotos.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2
                         border-dashed border-gray-300 rounded-xl text-gray-400
                         hover:border-accent hover:text-accent transition-colors bg-gray-50">
              <Upload size={24} aria-hidden />
              <span className="text-sm font-medium">Cliquez pour ajouter des photos</span>
              <span className="text-xs">JPEG, PNG, WebP — max 5 Mo par fichier</span>
            </button>
          </>
        )}

        {erreurPhotos && (
          <p role="alert" className="flex items-center gap-1 text-xs text-red-600 mt-1">
            <AlertCircle size={11} aria-hidden /> {erreurPhotos}
          </p>
        )}
      </div>

      {/* ── Vidéo ──────────────────────────────────────── */}
      <div>
        <label className="label-admin">
          <Video size={11} className="inline mr-1" aria-hidden /> Vidéo produit (optionnel)
        </label>

        {videoPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
            <video src={videoPreview} controls className="w-full max-h-48 object-contain" />
            {videoUrl && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                <CheckCircle2 size={11} /> Uploadée
              </div>
            )}
            <button type="button" onClick={onSupprimerVideo} aria-label="Supprimer la vidéo"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <input ref={inputVideo} type="file" accept="video/mp4,video/webm,video/ogg"
              onChange={onSelectionVideo} className="hidden" aria-label="Sélectionner une vidéo" />
            <button type="button" onClick={() => inputVideo.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2
                         border-dashed border-gray-300 rounded-xl text-gray-400
                         hover:border-accent hover:text-accent transition-colors bg-gray-50">
              <Video size={24} aria-hidden />
              <span className="text-sm font-medium">Cliquez pour ajouter une vidéo</span>
              <span className="text-xs">MP4, WebM, OGG — max 50 Mo</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
