import { useState, useEffect, useCallback } from 'react';
import { X, Package, RefreshCw, ImagePlus, DollarSign, Layers, Pencil } from 'lucide-react';
import Button from '../../ui/Button';
import Alert from '../../ui/Alert';
import OngletInformations from './OngletInformations';
import OngletMedias from './OngletMedias';
import OngletPrix from './OngletPrix';
import OngletVariantes from './OngletVariantes';
import { getProduitParId, modifierProduit } from '../../../services/admin/adminProduitService';
import { creerCategorie, getCategoriesPlates } from '../../../services/admin/adminCategorieService';
import { uploadPhotos, uploadVideo } from '../../../services/admin/adminUploadService';
import type { Categorie, StatutProduit, VarianteProduit } from '../../../types/admin';

/* ── Types ────────────────────────────────────────────────────────────────── */
interface Props {
  produitId: string | null;
  onFermer: () => void;
  onSucces: () => void;
}

type Onglet = 'infos' | 'medias' | 'prix' | 'variantes';
const ORDRE: Onglet[] = ['infos', 'medias', 'prix', 'variantes'];

interface EtatForm {
  nom: string; reference: string; description: string;
  categorieId: string;
  prix: string; prixPromotionnel: string; quantiteDisponible: string;
  statut: StatutProduit; variantes: VarianteProduit[];
}
interface EtatErreurs {
  nom?: string; reference?: string; description?: string;
  categorieId?: string;
  prix?: string; prixPromotionnel?: string; quantiteDisponible?: string;
  photos?: string; global?: string;
}

const INIT: EtatForm = {
  nom: '', reference: '', description: '', categorieId: '',
  prix: '', prixPromotionnel: '', quantiteDisponible: '',
  statut: 'en_stock', variantes: [],
};

const ONGLETS: { id: Onglet; libelle: string; icone: React.ElementType }[] = [
  { id: 'infos',     libelle: 'Informations', icone: Package    },
  { id: 'medias',    libelle: 'Médias',        icone: ImagePlus  },
  { id: 'prix',      libelle: 'Prix & Stock',  icone: DollarSign },
  { id: 'variantes', libelle: 'Variantes',     icone: Layers     },
];

/* ══════════════════════════════════════════════════════════════════════════ */
export default function ModalModificationProduit({ produitId, onFermer, onSucces }: Props) {

  /* ── État formulaire ─────────────────────────────────── */
  const [form, setForm]       = useState<EtatForm>(INIT);
  const [erreurs, setErreurs] = useState<EtatErreurs>({});
  const [onglet, setOnglet]   = useState<Onglet>('infos');
  const [chargement, setChargement]     = useState(false);
  const [chargProduit, setChargProduit] = useState(false);

  /* ── Données externes ────────────────────────────────── */
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [chargCat,   setChargCat]   = useState(false);

  /* ── Catégorie inline ────────────────────────────────── */
  const [ajoutCat,      setAjoutCat]      = useState(false);
  const [chargCreatCat, setChargCreatCat] = useState(false);
  const [errCreatCat,   setErrCreatCat]   = useState<string | undefined>();

  /* ── Médias ──────────────────────────────────────────── */
  const [photosPreview, setPhotosPreview] = useState<{ fichier: File; preview: string }[]>([]);
  const [photosUrls,    setPhotosUrls]    = useState<string[]>([]);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [videoPreview,  setVideoPreview]  = useState<string | null>(null);
  const [videoUrl,      setVideoUrl]      = useState<string | null>(null);
  const [videoFichier,  setVideoFichier]  = useState<File | null>(null);

  /* ── Chargement catégories + produit à l'ouverture ───── */
  useEffect(() => {
    if (!produitId) return;

    /* Catégories */
    setChargCat(true);
    getCategoriesPlates()
      .then((r) => setCategories(r.data.categories))
      .catch(() => {})
      .finally(() => setChargCat(false));

    /* Produit existant */
    setChargProduit(true);
    setErreurs({});
    getProduitParId(produitId)
      .then((r) => {
        const p = r.data.produit;
        setForm({
          nom:               p.nom,
          reference:         p.reference,
          description:       p.description,
          categorieId:       typeof p.categorie === 'object' ? p.categorie._id : p.categorie,
          prix:              String(p.prix),
          prixPromotionnel:  p.prixPromotionnel ? String(p.prixPromotionnel) : '',
          quantiteDisponible: String(p.quantiteDisponible),
          statut:            p.statut,
          variantes:         p.variantes ?? [],
        });
        /* Photos existantes : pas de File, juste les URLs */
        setPhotosUrls(p.photos ?? []);
        setPhotosPreview(
          (p.photos ?? []).map((url) => ({ fichier: null as unknown as File, preview: url }))
        );
        if (p.video) { setVideoUrl(p.video); setVideoPreview(p.video); }
      })
      .catch((err) => {
        setErreurs({ global: err instanceof Error ? err.message : 'Erreur de chargement.' });
      })
      .finally(() => setChargProduit(false));
  }, [produitId]);

  /* ── Reset ───────────────────────────────────────────── */
  const reset = useCallback(() => {
    setForm(INIT); setErreurs({}); setOnglet('infos');
    setAjoutCat(false); setErrCreatCat(undefined);
    /* Ne pas révoquer les URLs distantes (Cloudinary), seulement les blobs locaux */
    photosPreview.forEach((p) => { if (p.preview.startsWith('blob:')) URL.revokeObjectURL(p.preview); });
    setPhotosPreview([]); setPhotosUrls([]);
    if (videoPreview?.startsWith('blob:')) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null); setVideoUrl(null); setVideoFichier(null);
  }, [photosPreview, videoPreview]);

  const handleFermer = () => { reset(); onFermer(); };

  if (!produitId) return null;

  /* ── Handlers champs ─────────────────────────────────── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErreurs((prev) => ({ ...prev, [name as keyof EtatErreurs]: undefined, global: undefined }));
  };

  /* ── Catégorie inline ────────────────────────────────── */
  const handleCreerCategorie = async (nom: string) => {
    setChargCreatCat(true); setErrCreatCat(undefined);
    try {
      const rep = await creerCategorie({ nom });
      const nouv = rep.data.categorie;
      setCategories((prev) => [...prev, nouv]);
      setForm((prev) => ({ ...prev, categorieId: nouv._id }));
      setAjoutCat(false);
      setErreurs((prev) => ({ ...prev, categorieId: undefined }));
    } catch (err) {
      setErrCreatCat(err instanceof Error ? err.message : 'Erreur création catégorie.');
    } finally { setChargCreatCat(false); }
  };

  /* ── Photos ──────────────────────────────────────────── */
  const handleSelectionPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichiers = Array.from(e.target.files ?? []).slice(0, 10 - photosPreview.length);
    if (!fichiers.length) return;
    setPhotosPreview((prev) => [...prev, ...fichiers.map((f) => ({ fichier: f, preview: URL.createObjectURL(f) }))]);
    setErreurs((prev) => ({ ...prev, photos: undefined }));
    if (e.target) e.target.value = '';
  };

  const supprimerPhoto = (i: number) => {
    if (photosPreview[i].preview.startsWith('blob:')) URL.revokeObjectURL(photosPreview[i].preview);
    setPhotosPreview((prev) => prev.filter((_, k) => k !== i));
    setPhotosUrls((prev) => prev.filter((_, k) => k !== i));
  };

  const uploaderNouvellesPhotos = async (): Promise<string[]> => {
    /* Séparer les photos déjà uploadées (URL distante) des nouvelles (blob) */
    const existantes: string[] = [];
    const nouvellesFichiers: File[] = [];

    photosPreview.forEach((p, i) => {
      if (!p.preview.startsWith('blob:')) {
        existantes.push(photosUrls[i] ?? p.preview);
      } else {
        nouvellesFichiers.push(p.fichier);
      }
    });

    if (!nouvellesFichiers.length) return existantes;

    setUploadEnCours(true);
    try {
      const nouvellesUrls = await uploadPhotos(nouvellesFichiers);
      return [...existantes, ...nouvellesUrls];
    } finally { setUploadEnCours(false); }
  };

  /* ── Vidéo ───────────────────────────────────────────── */
  const handleSelectionVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (videoPreview?.startsWith('blob:')) URL.revokeObjectURL(videoPreview);
    setVideoFichier(f); setVideoPreview(URL.createObjectURL(f)); setVideoUrl(null);
    if (e.target) e.target.value = '';
  };

  const supprimerVideo = () => {
    if (videoPreview?.startsWith('blob:')) URL.revokeObjectURL(videoPreview);
    setVideoFichier(null); setVideoPreview(null); setVideoUrl(null);
  };

  /* ── Variantes ───────────────────────────────────────── */
  const ajouterVariante = () =>
    setForm((prev) => ({ ...prev, variantes: [...prev.variantes, { nom: '', valeurs: [] }] }));

  const modifierNomVariante = (i: number, nom: string) =>
    setForm((prev) => { const v = [...prev.variantes]; v[i] = { ...v[i], nom }; return { ...prev, variantes: v }; });

  const ajouterValeurVariante = (i: number, valeur: string) =>
    setForm((prev) => { const v = [...prev.variantes]; v[i] = { ...v[i], valeurs: [...v[i].valeurs, valeur] }; return { ...prev, variantes: v }; });

  const supprimerValeurVariante = (iV: number, iK: number) =>
    setForm((prev) => { const v = [...prev.variantes]; v[iV] = { ...v[iV], valeurs: v[iV].valeurs.filter((_, k) => k !== iK) }; return { ...prev, variantes: v }; });

  const supprimerVariante = (i: number) =>
    setForm((prev) => ({ ...prev, variantes: prev.variantes.filter((_, k) => k !== i) }));

  /* ── Validation ──────────────────────────────────────── */
  const valider = (): boolean => {
    const e: EtatErreurs = {};
    if (!form.nom.trim())         e.nom         = 'Le nom est obligatoire.';
    if (!form.reference.trim())   e.reference   = 'La référence est obligatoire.';
    if (!form.description.trim()) e.description = 'La description est obligatoire.';
    if (!form.categorieId)        e.categorieId = 'Sélectionnez une catégorie.';
    if (!form.prix || isNaN(Number(form.prix)) || Number(form.prix) < 0)
      e.prix = 'Prix invalide.';
    if (form.prixPromotionnel && (isNaN(Number(form.prixPromotionnel)) || Number(form.prixPromotionnel) >= Number(form.prix)))
      e.prixPromotionnel = 'Le prix promo doit être inférieur au prix normal.';
    if (!form.quantiteDisponible || !Number.isInteger(Number(form.quantiteDisponible)) || Number(form.quantiteDisponible) < 0)
      e.quantiteDisponible = 'Quantité invalide (entier ≥ 0).';
    setErreurs(e);
    const nbErr = Object.keys(e).length;
    if (nbErr > 0) {
      if (e.nom || e.reference || e.description || e.categorieId) setOnglet('infos');
      else if (e.photos) setOnglet('medias');
      else setOnglet('prix');
    }
    return nbErr === 0;
  };

  /* ── Soumission ──────────────────────────────────────── */
  const handleSoumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valider() || !produitId) return;
    setChargement(true);
    setErreurs((prev) => ({ ...prev, global: undefined }));
    try {
      const urlsPhotos = await uploaderNouvellesPhotos();

      let urlVideo: string | null | undefined = videoUrl;
      if (videoFichier && !videoUrl) {
        setUploadEnCours(true);
        urlVideo = await uploadVideo(videoFichier);
        setVideoUrl(urlVideo);
        setUploadEnCours(false);
      }
      if (!videoPreview) urlVideo = undefined; /* vidéo supprimée */

      await modifierProduit(produitId, {
        nom:               form.nom.trim(),
        reference:         form.reference.trim().toUpperCase(),
        description:       form.description.trim(),
        categorie:         form.categorieId,
        prix:              form.prix,
        prixPromotionnel:  form.prixPromotionnel || undefined,
        quantiteDisponible: form.quantiteDisponible,
        enStock:           Number(form.quantiteDisponible) > 0,
        photos:            urlsPhotos,
        video:             urlVideo ?? undefined,
        variantes:         form.variantes.filter((v) => v.nom.trim()),
        statut:            form.statut,
      } as never);

      onSucces(); handleFermer();
    } catch (err) {
      setErreurs((prev) => ({ ...prev, global: err instanceof Error ? err.message : 'Erreur lors de la modification.' }));
    } finally { setChargement(false); setUploadEnCours(false); }
  };

  /* ── Indicateurs d'erreur par onglet ─────────────────── */
  const aErreurOnglet = (id: Onglet) =>
    (id === 'infos'  && (erreurs.nom || erreurs.reference || erreurs.description || erreurs.categorieId)) ||
    (id === 'medias' && erreurs.photos) ||
    (id === 'prix'   && (erreurs.prix || erreurs.prixPromotionnel || erreurs.quantiteDisponible));

  /* ═══════════════════════════════════════════════════════
     RENDU
     ═══════════════════════════════════════════════════════ */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 backdrop-blur-sm px-4"
      role="dialog" aria-modal="true" aria-labelledby="modal-modif-produit-titre">
      <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Pencil size={18} className="text-blue-600" aria-hidden />
            </div>
            <div>
              <h2 id="modal-modif-produit-titre" className="text-base font-bold text-primary">
                Modifier le produit
              </h2>
              <p className="text-xs text-[#74777d]">Modifiez les informations et sauvegardez.</p>
            </div>
          </div>
          <button onClick={handleFermer} aria-label="Fermer"
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-100 flex-shrink-0 px-2">
          {ONGLETS.map(({ id, libelle, icone: Icone }) => (
            <button key={id} type="button" onClick={() => setOnglet(id)}
              className={[
                'relative flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-colors',
                onglet === id ? 'text-accent border-b-2 border-accent' : 'text-[#74777d] hover:text-primary',
              ].join(' ')}>
              <Icone size={13} aria-hidden />
              {libelle}
              {aErreurOnglet(id) && <span className="ml-1 w-2 h-2 rounded-full bg-red-500 inline-block" aria-label="Erreur" />}
            </button>
          ))}
        </div>

        {/* Corps scrollable */}
        <form onSubmit={handleSoumettre} noValidate className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {chargProduit && (
              <div className="flex items-center gap-2 text-xs text-primary bg-gray-50 border border-gray-200 rounded-xl p-3">
                <RefreshCw size={13} className="animate-spin" aria-hidden /> Chargement du produit…
              </div>
            )}

            {erreurs.global && <Alert variant="error">{erreurs.global}</Alert>}

            {uploadEnCours && (
              <div className="flex items-center gap-2 text-xs text-accent bg-orange-50 border border-orange-200 rounded-xl p-3">
                <RefreshCw size={13} className="animate-spin" aria-hidden /> Upload en cours vers Cloudinary…
              </div>
            )}

            {!chargProduit && (
              <>
                {onglet === 'infos' && (
                  <OngletInformations
                    form={form} erreurs={erreurs}
                    categories={categories}
                    chargCat={chargCat}
                    ajoutCat={ajoutCat} chargCreatCat={chargCreatCat} errCreatCat={errCreatCat}
                    onChange={handleChange}
                    onGenererRef={() => {}}
                    onStatutChange={(s) => setForm((prev) => ({ ...prev, statut: s }))}
                    onToggleAjoutCat={() => setAjoutCat((prev) => !prev)}
                    onCreerCategorie={handleCreerCategorie}
                    onAnnulerAjoutCat={() => { setAjoutCat(false); setErrCreatCat(undefined); }}
                  />
                )}
                {onglet === 'medias' && (
                  <OngletMedias
                    photosPreview={photosPreview} photosUrls={photosUrls}
                    videoPreview={videoPreview} videoUrl={videoUrl} erreurPhotos={erreurs.photos}
                    onSelectionPhotos={handleSelectionPhotos} onSupprimerPhoto={supprimerPhoto}
                    onSelectionVideo={handleSelectionVideo} onSupprimerVideo={supprimerVideo}
                  />
                )}
                {onglet === 'prix' && (
                  <OngletPrix
                    form={{ prix: form.prix, prixPromotionnel: form.prixPromotionnel, quantiteDisponible: form.quantiteDisponible }}
                    erreurs={{ prix: erreurs.prix, prixPromotionnel: erreurs.prixPromotionnel, quantiteDisponible: erreurs.quantiteDisponible }}
                    onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
                  />
                )}
                {onglet === 'variantes' && (
                  <OngletVariantes
                    variantes={form.variantes}
                    onAjouter={ajouterVariante}
                    onNomChange={modifierNomVariante}
                    onAjouterValeur={ajouterValeurVariante}
                    onSupprimerValeur={supprimerValeurVariante}
                    onSupprimer={supprimerVariante}
                  />
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-surface">
            <div className="flex gap-1">
              {ORDRE.map((id) => (
                <button key={id} type="button" onClick={() => setOnglet(id)} aria-label={`Aller à l'onglet ${id}`}
                  className={['w-2 h-2 rounded-full transition-all', onglet === id ? 'bg-accent w-4' : 'bg-gray-300'].join(' ')} />
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleFermer} disabled={chargement}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#74777d] hover:bg-gray-100 transition-colors disabled:opacity-50">
                Annuler
              </button>
              {onglet !== 'variantes' ? (
                <button type="button"
                  onClick={() => setOnglet(ORDRE[ORDRE.indexOf(onglet) + 1])}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors">
                  Suivant →
                </button>
              ) : (
                <Button type="submit" isLoading={chargement || uploadEnCours}
                  loadingText={uploadEnCours ? 'Upload…' : 'Sauvegarde…'}
                  className="!w-auto px-6 py-2.5 text-sm cursor-pointer">
                  Sauvegarder
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
