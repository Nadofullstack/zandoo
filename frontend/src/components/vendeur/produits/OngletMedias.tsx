import { useRef } from 'react';
import {
  Upload, ImagePlus, Video, CheckCircle2, X,
  AlertCircle, Plus, Trash2,
} from 'lucide-react';

/* ── Types ───────────────────────────────────────────────────────────────── */

/** Photo couverture */
interface PhotoCouv {
  fichier: File | null;
  preview: string;
  uploadee: boolean;
}

/** Variante photo (état local) — sans nom */
interface VariantePhotoLocal {
  photos: { fichier: File | null; preview: string; uploadee: boolean }[];
}

interface Props {
  /* ── Couverture ── */
  couverture: PhotoCouv | null;
  onSelectionCouverture: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSupprimerCouverture: () => void;

  /* ── Variantes photos ── */
  variantesPhotos: VariantePhotoLocal[];
  onAjouterVariante: () => void;
  onSupprimerVariante: (iv: number) => void;
  onAjouterPhotosVariante: (iv: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onSupprimerPhotoVariante: (iv: number, ip: number) => void;

  /* ── Vidéo ── */
  videoPreview: string | null;
  videoUrl: string | null;
  onSelectionVideo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSupprimerVideo: () => void;

  erreurCouverture?: string;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function ZoneUpload({ onClick, label, sub }: { onClick: () => void; label: string; sub: string }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2
                 border-dashed border-gray-300 rounded-xl text-gray-400
                 hover:border-accent hover:text-accent transition-colors bg-gray-50">
      <Upload size={20} aria-hidden />
      <span className="text-xs font-medium">{label}</span>
      <span className="text-xs">{sub}</span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
export default function OngletMedias({
  couverture, onSelectionCouverture, onSupprimerCouverture,
  variantesPhotos, onAjouterVariante, onSupprimerVariante,
  onAjouterPhotosVariante, onSupprimerPhotoVariante,
  videoPreview, videoUrl, onSelectionVideo, onSupprimerVideo,
  erreurCouverture,
}: Props) {
  const inputCouv  = useRef<HTMLInputElement>(null);
  const inputVideo = useRef<HTMLInputElement>(null);
  const inputsVariantes = useRef<(HTMLInputElement | null)[]>([]);

  return (
    <div className="space-y-6">

      {/* 1. PHOTO DE COUVERTURE */}
      <section>
        <label className="label-admin flex items-center gap-1 mb-2">
          <ImagePlus size={12} aria-hidden /> Photo de couverture *
        </label>

        {couverture ? (
          <div className="relative group w-full max-w-xs aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img src={couverture.preview} alt="Couverture" className="w-full h-full object-cover" />
            {couverture.uploadee && (
              <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-0.5" title="Uploadée">
                <CheckCircle2 size={12} />
              </div>
            )}
            <button
              type="button"
              onClick={onSupprimerCouverture}
              aria-label="Supprimer la photo de couverture"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1
                         opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
              <X size={13} />
            </button>
          </div>
        ) : (
          <>
            <input
              ref={inputCouv}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={onSelectionCouverture}
              className="hidden"
              aria-label="Sélectionner la photo de couverture"
            />
            <ZoneUpload
              onClick={() => inputCouv.current?.click()}
              label="Cliquez pour ajouter la photo principale"
              sub="JPEG, PNG, WebP — max 5 Mo"
            />
          </>
        )}

        {erreurCouverture && (
          <p role="alert" className="flex items-center gap-1 text-xs text-red-600 mt-1">
            <AlertCircle size={11} aria-hidden /> {erreurCouverture}
          </p>
        )}
      </section>

      {/* 2. VARIANTES PHOTOS */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <label className="label-admin mb-0">
            Photos supplémentaires
            <span className="ml-1 text-xs text-[#74777d] font-normal">(variantes, angles…)</span>
          </label>
          <button
            type="button"
            onClick={onAjouterVariante}
            className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
            <Plus size={13} /> Ajouter un groupe
          </button>
        </div>

        {variantesPhotos.length === 0 && (
          <p className="text-xs text-[#74777d] bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            Aucun groupe. Ajoutez-en un si votre produit a plusieurs vues ou variantes de photos.
          </p>
        )}

        <div className="space-y-4">
          {variantesPhotos.map((variante, iv) => (
            <div key={iv} className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">

              {/* Header du groupe */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-primary">
                  Groupe {iv + 1}
                  <span className="ml-1.5 text-[#74777d] font-normal">
                    ({variante.photos.length}/10 photos)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onSupprimerVariante(iv)}
                  title="Supprimer ce groupe"
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Grille photos */}
              {variante.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {variante.photos.map((photo, ip) => (
                    <div key={ip}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
                      <img src={photo.preview} alt={`Groupe ${iv + 1} — photo ${ip + 1}`}
                        className="w-full h-full object-cover" />
                      {photo.uploadee && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-0.5">
                          <CheckCircle2 size={9} />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => onSupprimerPhotoVariante(iv, ip)}
                        aria-label="Supprimer cette photo"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5
                                   opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <X size={9} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {variante.photos.length < 10 && (
                <>
                  <input
                    ref={(el) => { inputsVariantes.current[iv] = el; }}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => onAjouterPhotosVariante(iv, e)}
                    className="hidden"
                    aria-label={`Ajouter des photos au groupe ${iv + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => inputsVariantes.current[iv]?.click()}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed
                               border-gray-300 rounded-lg text-xs text-gray-500
                               hover:border-accent hover:text-accent transition-colors bg-white">
                    <Plus size={13} aria-hidden />
                    Ajouter des photos ({variante.photos.length}/10)
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. VIDÉO */}
      <section>
        <label className="label-admin flex items-center gap-1 mb-2">
          <Video size={12} aria-hidden /> Vidéo produit (optionnel)
        </label>

        {videoPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
            <video src={videoPreview} controls className="w-full max-h-48 object-contain" />
            {videoUrl && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                <CheckCircle2 size={11} /> Uploadée
              </div>
            )}
            <button
              type="button"
              onClick={onSupprimerVideo}
              aria-label="Supprimer la vidéo"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <input
              ref={inputVideo}
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              onChange={onSelectionVideo}
              className="hidden"
              aria-label="Sélectionner une vidéo"
            />
            <ZoneUpload
              onClick={() => inputVideo.current?.click()}
              label="Cliquez pour ajouter une vidéo"
              sub="MP4, WebM, OGG — max 50 Mo"
            />
          </>
        )}
      </section>

    </div>
  );
}

export type { VariantePhotoLocal };
