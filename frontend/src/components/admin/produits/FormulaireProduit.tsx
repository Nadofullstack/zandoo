import { useState, type FormEvent } from 'react';
import { Plus, X, Image, Video } from 'lucide-react';
import type { Produit, FormulaireProduiit, Categorie, VarianteProduit } from '../../../types/admin';
import Button from '../../ui/Button';
import { inputClass } from '../../ui/FormField';

interface Props {
  produitInitial?: Produit | null;
  categories: Categorie[];
  onSoumettre: (donnees: Partial<FormulaireProduiit>) => void;
  chargement?: boolean;
}

const VIDE: FormulaireProduiit = {
  nom: '', description: '', reference: '', categorie: '', vendeur: '',
  prix: '', prixPromotionnel: '', quantiteDisponible: '', enStock: true,
  photos: [], video: '', variantes: [], attributs: [], statut: 'en_attente',
};

export default function FormulaireProduit({ produitInitial, categories, onSoumettre, chargement = false }: Props) {
  const [form, setForm] = useState<FormulaireProduiit>(() => {
    if (!produitInitial) return VIDE;
    return {
      nom:                produitInitial.nom,
      description:        produitInitial.description,
      reference:          produitInitial.reference,
      categorie:          produitInitial.categorie._id,
      vendeur:            produitInitial.vendeur._id,
      prix:               String(produitInitial.prix),
      prixPromotionnel:   produitInitial.prixPromotionnel ? String(produitInitial.prixPromotionnel) : '',
      quantiteDisponible: String(produitInitial.quantiteDisponible),
      enStock:            produitInitial.enStock,
      photos:             produitInitial.photos,
      video:              produitInitial.video ?? '',
      variantes:          produitInitial.variantes,
      attributs:          produitInitial.attributs,
      statut:             produitInitial.statut,
    };
  });

  const [nouvellePhoto, setNouvellePhoto] = useState('');
  const [nouvelleVariante, setNouvelleVariante] = useState({ nom: '', valeurs: '' });

  /* ── Handlers ── */
  const changer = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const ajouterPhoto = () => {
    const url = nouvellePhoto.trim();
    if (!url || form.photos.length >= 10) return;
    setForm((prev) => ({ ...prev, photos: [...prev.photos, url] }));
    setNouvellePhoto('');
  };

  const supprimerPhoto = (i: number) => {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, idx) => idx !== i) }));
  };

  const ajouterVariante = () => {
    if (!nouvelleVariante.nom.trim()) return;
    const v: VarianteProduit = {
      nom: nouvelleVariante.nom.trim(),
      valeurs: nouvelleVariante.valeurs.split(',').map((s) => s.trim()).filter(Boolean),
    };
    setForm((prev) => ({ ...prev, variantes: [...prev.variantes, v] }));
    setNouvelleVariante({ nom: '', valeurs: '' });
  };

  const supprimerVariante = (i: number) => {
    setForm((prev) => ({ ...prev, variantes: prev.variantes.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSoumettre(form);
  };

  /* ── Catégorie sélectionnée → attributs dynamiques ── */
  const categorieCourante = categories.find((c) => c._id === form.categorie);
  const attributsDynamiques = categorieCourante?.attributs ?? [];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {/* ── Informations de base ── */}
      <fieldset className="bg-surface border border-gray-200 rounded-xl p-5 space-y-4">
        <legend className="text-sm font-bold text-primary uppercase tracking-wider px-1">Informations de base</legend>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-admin">Nom du produit *</label>
            <input name="nom" value={form.nom} onChange={changer} required maxLength={255}
              placeholder="Ex: T-shirt coton bio" className={inputClass(false)} />
          </div>
          <div>
            <label className="label-admin">Référence (SKU) *</label>
            <input name="reference" value={form.reference} onChange={changer} required
              placeholder="Ex: TSH-001" className={inputClass(false)} />
          </div>
        </div>

        <div>
          <label className="label-admin">Description *</label>
          <textarea name="description" value={form.description} onChange={changer} required rows={4}
            maxLength={10000} placeholder="Description détaillée du produit…"
            className={`${inputClass(false)} resize-none`} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-admin">Catégorie *</label>
            <select name="categorie" value={form.categorie} onChange={changer} required className={inputClass(false)}>
              <option value="">Sélectionner une catégorie</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.parent ? `  └ ${c.nom}` : c.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-admin">Statut</label>
            <select name="statut" value={form.statut} onChange={changer} className={inputClass(false)}>
              <option value="en_attente">En attente</option>
              <option value="approuve">Approuvé</option>
              <option value="brouillon">Brouillon</option>
              <option value="rejete">Rejeté</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* ── Prix & Stock ── */}
      <fieldset className="bg-surface border border-gray-200 rounded-xl p-5 space-y-4">
        <legend className="text-sm font-bold text-primary uppercase tracking-wider px-1">Prix & Stock</legend>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label-admin">Prix (F CFA) *</label>
            <input name="prix" type="number" min="0" value={form.prix} onChange={changer} required
              placeholder="0" className={inputClass(false)} />
          </div>
          <div>
            <label className="label-admin">Prix promo (F CFA)</label>
            <input name="prixPromotionnel" type="number" min="0" value={form.prixPromotionnel} onChange={changer}
              placeholder="0" className={inputClass(false)} />
          </div>
          <div>
            <label className="label-admin">Quantité disponible *</label>
            <input name="quantiteDisponible" type="number" min="0" value={form.quantiteDisponible}
              onChange={changer} required placeholder="0" className={inputClass(false)} />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input type="checkbox" name="enStock" checked={form.enStock} onChange={changer}
            className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent" />
          <span className="text-sm text-primary font-medium">En stock</span>
        </label>
      </fieldset>

      {/* ── Médias ── */}
      <fieldset className="bg-surface border border-gray-200 rounded-xl p-5 space-y-4">
        <legend className="text-sm font-bold text-primary uppercase tracking-wider px-1">Médias</legend>

        {/* Photos */}
        <div>
          <label className="label-admin flex items-center gap-1.5">
            <Image size={13} aria-hidden="true" /> Photos (max. 10 URLs)
          </label>
          <div className="flex gap-2 mb-2">
            <input value={nouvellePhoto} onChange={(e) => setNouvellePhoto(e.target.value)}
              placeholder="https://…" className={`${inputClass(false)} flex-1`} />
            <button type="button" onClick={ajouterPhoto}
              disabled={!nouvellePhoto.trim() || form.photos.length >= 10}
              className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors shrink-0">
              <Plus size={16} />
            </button>
          </div>
          {form.photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.photos.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                  <button type="button" onClick={() => supprimerPhoto(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vidéo */}
        <div>
          <label className="label-admin flex items-center gap-1.5">
            <Video size={13} aria-hidden="true" /> Vidéo (URL YouTube/Vimeo, optionnel)
          </label>
          <input name="video" value={form.video} onChange={changer}
            placeholder="https://youtube.com/…" className={inputClass(false)} />
        </div>
      </fieldset>

      {/* ── Variantes ── */}
      <fieldset className="bg-surface border border-gray-200 rounded-xl p-5 space-y-4">
        <legend className="text-sm font-bold text-primary uppercase tracking-wider px-1">Variantes</legend>

        <div className="flex gap-2 flex-wrap">
          <input value={nouvelleVariante.nom} onChange={(e) => setNouvelleVariante((v) => ({ ...v, nom: e.target.value }))}
            placeholder="Nom (ex: Taille)" className={`${inputClass(false)} flex-1 min-w-28`} />
          <input value={nouvelleVariante.valeurs} onChange={(e) => setNouvelleVariante((v) => ({ ...v, valeurs: e.target.value }))}
            placeholder="Valeurs séparées par virgule (S, M, L)" className={`${inputClass(false)} flex-[2] min-w-40`} />
          <button type="button" onClick={ajouterVariante} disabled={!nouvelleVariante.nom.trim()}
            className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors shrink-0">
            <Plus size={16} />
          </button>
        </div>

        {form.variantes.length > 0 && (
          <div className="space-y-2">
            {form.variantes.map((v, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                <div>
                  <span className="font-semibold text-primary text-sm">{v.nom} : </span>
                  <span className="text-[#74777d] text-sm">{v.valeurs.join(', ')}</span>
                </div>
                <button type="button" onClick={() => supprimerVariante(i)}
                  className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      {/* ── Attributs dynamiques (selon catégorie) ── */}
      {attributsDynamiques.length > 0 && (
        <fieldset className="bg-surface border border-gray-200 rounded-xl p-5 space-y-4">
          <legend className="text-sm font-bold text-primary uppercase tracking-wider px-1">
            Attributs — {categorieCourante?.nom}
          </legend>
          <div className="grid sm:grid-cols-2 gap-4">
            {attributsDynamiques.map((attr) => {
              const valeurActuelle = form.attributs.find((a) => a.nom === attr.nom)?.valeur ?? '';
              const changerAttr = (val: string) => {
                setForm((prev) => {
                  const existants = prev.attributs.filter((a) => a.nom !== attr.nom);
                  return { ...prev, attributs: val ? [...existants, { nom: attr.nom, valeur: val }] : existants };
                });
              };

              return (
                <div key={attr._id ?? attr.nom}>
                  <label className="label-admin">
                    {attr.nom} {attr.requis && <span className="text-red-500">*</span>}
                  </label>
                  {attr.type === 'liste' ? (
                    <select value={valeurActuelle} onChange={(e) => changerAttr(e.target.value)}
                      className={inputClass(false)}>
                      <option value="">Sélectionner…</option>
                      {attr.valeurs?.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  ) : attr.type === 'booleen' ? (
                    <select value={valeurActuelle} onChange={(e) => changerAttr(e.target.value)}
                      className={inputClass(false)}>
                      <option value="">—</option>
                      <option value="true">Oui</option>
                      <option value="false">Non</option>
                    </select>
                  ) : (
                    <input type={attr.type === 'nombre' ? 'number' : 'text'}
                      value={valeurActuelle} onChange={(e) => changerAttr(e.target.value)}
                      className={inputClass(false)} />
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* ── Bouton ── */}
      <div className="flex justify-end">
        <Button type="submit" isLoading={chargement} loadingText="Enregistrement…"
          className="!w-auto px-8">
          {produitInitial ? 'Mettre à jour' : 'Créer le produit'}
        </Button>
      </div>

    </form>
  );
}
