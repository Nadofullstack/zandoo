import { useState, useEffect, useRef } from 'react';
import { X, Tag, ImagePlus, Trash2, RefreshCw, ImageOff } from 'lucide-react';
import Button from '../../ui/Button';
import Alert from '../../ui/Alert';
import { uploadPhotos } from '../../../services/admin/adminUploadService';
import type { Categorie } from '../../../types/admin';

interface Props {
  ouvert: boolean;
  categorieInitiale?: Categorie | null; // null = création, renseigné = modification
  onFermer: () => void;
  onSoumettre: (donnees: { nom: string; description: string; image: string | null }) => Promise<void>;
  chargement?: boolean;
}

interface EtatForm {
  nom: string;
  description: string;
}

interface EtatImage {
  fichier: File | null;
  preview: string;   // blob: ou URL Cloudinary
  uploadee: boolean;
}

export default function ModalCategorie({
  ouvert,
  categorieInitiale,
  onFermer,
  onSoumettre,
  chargement = false,
}: Props) {
  const estModification = !!categorieInitiale;

  const [form, setForm] = useState<EtatForm>({ nom: '', description: '' });
  const [image, setImage] = useState<EtatImage | null>(null);
  const [erreurs, setErreurs] = useState<{ nom?: string; global?: string }>({});
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const inputImageRef = useRef<HTMLInputElement>(null);

  /* ── Pré-remplir en modification ── */
  useEffect(() => {
    if (!ouvert) return;
    if (categorieInitiale) {
      setForm({ nom: categorieInitiale.nom, description: categorieInitiale.description ?? '' });
      if (categorieInitiale.image) {
        setImage({ fichier: null, preview: categorieInitiale.image, uploadee: true });
      } else {
        setImage(null);
      }
    } else {
      setForm({ nom: '', description: '' });
      setImage(null);
    }
    setErreurs({});
  }, [ouvert, categorieInitiale]);

  const reset = () => {
    if (image?.preview.startsWith('blob:')) URL.revokeObjectURL(image.preview);
    setForm({ nom: '', description: '' });
    setImage(null);
    setErreurs({});
  };

  const handleFermer = () => { reset(); onFermer(); };

  if (!ouvert) return null;

  /* ── Champs texte ── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErreurs((p) => ({ ...p, [name]: undefined, global: undefined }));
  };

  /* ── Sélection image ── */
  const handleSelectionImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (image?.preview.startsWith('blob:')) URL.revokeObjectURL(image.preview);
    setImage({ fichier: f, preview: URL.createObjectURL(f), uploadee: false });
    if (e.target) e.target.value = '';
  };

  const supprimerImage = () => {
    if (image?.preview.startsWith('blob:')) URL.revokeObjectURL(image.preview);
    setImage(null);
  };

  /* ── Validation ── */
  const valider = (): boolean => {
    const e: typeof erreurs = {};
    if (!form.nom.trim()) e.nom = 'Le nom est obligatoire.';
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  /* ── Soumission ── */
  const handleSoumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valider()) return;

    let urlImage: string | null = image?.uploadee ? image.preview : null;

    /* Upload si nouveau fichier */
    if (image?.fichier && !image.uploadee) {
      setUploadEnCours(true);
      try {
        const [url] = await uploadPhotos([image.fichier]);
        urlImage = url;
        setImage((prev) => prev ? { ...prev, preview: url, uploadee: true } : prev);
      } catch {
        setErreurs((p) => ({ ...p, global: "Erreur lors de l'upload de l'image." }));
        setUploadEnCours(false);
        return;
      }
      setUploadEnCours(false);
    }

    try {
      await onSoumettre({
        nom: form.nom.trim(),
        description: form.description.trim(),
        image: urlImage,
      });
      reset();
    } catch (err) {
      setErreurs((p) => ({ ...p, global: err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement.' }));
    }
  };

  const enCours = chargement || uploadEnCours;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cat-titre"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${estModification ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <Tag size={18} className={estModification ? 'text-blue-600' : 'text-accent'} />
            </div>
            <div>
              <h2 id="modal-cat-titre" className="text-base font-bold text-primary">
                {estModification ? `Modifier — ${categorieInitiale?.nom}` : 'Nouvelle catégorie'}
              </h2>
              <p className="text-xs text-[#74777d]">
                {estModification ? 'Mettez à jour les informations.' : 'Remplissez les informations de la catégorie.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleFermer}
            aria-label="Fermer"
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corps */}
        <form onSubmit={handleSoumettre} noValidate className="px-6 py-5 space-y-5">

          {erreurs.global && <Alert variant="error">{erreurs.global}</Alert>}

          {uploadEnCours && (
            <div className="flex items-center gap-2 text-xs text-accent bg-orange-50 border border-orange-200 rounded-xl p-3">
              <RefreshCw size={13} className="animate-spin" /> Upload en cours vers Cloudinary…
            </div>
          )}

          {/* Nom */}
          <div>
            <label className="block text-xs font-semibold text-[#74777d] uppercase tracking-wide mb-1.5">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Ex : Électronique"
              maxLength={100}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm text-primary placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                erreurs.nom
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-accent/30 focus:border-accent'
              }`}
            />
            {erreurs.nom && <p className="text-xs text-red-500 mt-1">{erreurs.nom}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#74777d] uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              placeholder="Description courte de la catégorie…"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/500</p>
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-[#74777d] uppercase tracking-wide mb-1.5">
              Image de la catégorie
            </label>

            {image ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 group">
                <img
                  src={image.preview}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <button
                    type="button"
                    onClick={supprimerImage}
                    className="opacity-0 group-hover:opacity-100 transition-all p-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                    title="Supprimer l'image"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputImageRef.current?.click()}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-accent hover:bg-orange-50/50 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-accent"
              >
                <ImagePlus size={32} />
                <span className="text-sm font-medium">Cliquer pour ajouter une image</span>
                <span className="text-xs">JPG, PNG, WEBP — max 5 Mo</span>
              </button>
            )}

            <input
              ref={inputImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectionImage}
            />

            {image && (
              <button
                type="button"
                onClick={() => inputImageRef.current?.click()}
                className="mt-2 text-xs text-accent font-semibold hover:underline flex items-center gap-1"
              >
                <ImageOff size={12} /> Changer l'image
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleFermer}
              disabled={enCours}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#74777d] hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <Button
              type="submit"
              isLoading={enCours}
              loadingText={uploadEnCours ? 'Upload…' : 'Enregistrement…'}
              className="!w-auto px-6 py-2.5 text-sm"
            >
              {estModification ? 'Mettre à jour' : 'Créer la catégorie'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
