import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import type { Categorie, AttributCategorie } from '../../../types/admin';
import Button from '../../ui/Button';
import { inputClass } from '../../ui/FormField';

interface Props {
  categorieInitiale?: Categorie | null;
  parentForce?: Categorie | null;      // Quand on crée une sous-catégorie
  categories: Categorie[];              // Pour le select parent
  onSoumettre: (donnees: Partial<Omit<Categorie, '_id' | 'createdAt' | 'updatedAt' | 'sousCategories'>>) => void;
  chargement?: boolean;
  onAnnuler: () => void;
}

const ATTRIBUT_VIDE: Omit<AttributCategorie, '_id'> = { nom: '', type: 'texte', valeurs: [], requis: false };

export default function FormulaireCategorie({
  categorieInitiale, parentForce, categories, onSoumettre, chargement = false, onAnnuler,
}: Props) {
  const [form, setForm] = useState({
    nom:         categorieInitiale?.nom         ?? '',
    description: categorieInitiale?.description ?? '',
    parent:      parentForce?._id ?? categorieInitiale?.parent ?? '',
    image:       categorieInitiale?.image        ?? '',
    active:      categorieInitiale?.active       ?? true,
    ordre:       categorieInitiale?.ordre        ?? 0,
    attributs:   categorieInitiale?.attributs    ?? [] as AttributCategorie[],
  });

  const [nouvelAttr, setNouvelAttr] = useState<Omit<AttributCategorie, '_id'>>({ ...ATTRIBUT_VIDE });
  const [valeursAttr, setValeursAttr] = useState('');

  const changer = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const ajouterAttribut = () => {
    if (!nouvelAttr.nom.trim()) return;
    const attr: AttributCategorie = {
      ...nouvelAttr,
      nom: nouvelAttr.nom.trim(),
      valeurs: nouvelAttr.type === 'liste'
        ? valeursAttr.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };
    setForm((prev) => ({ ...prev, attributs: [...prev.attributs, attr] }));
    setNouvelAttr({ ...ATTRIBUT_VIDE });
    setValeursAttr('');
  };

  const supprimerAttribut = (i: number) => {
    setForm((prev) => ({ ...prev, attributs: prev.attributs.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSoumettre({ ...form, parent: form.parent || null });
  };

  /* Seules les catégories racine peuvent être parent (évite l'arborescence trop profonde) */
  const options_parent = categories.filter((c) => !c.parent);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Nom + Parent */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label-admin">Nom *</label>
          <input name="nom" value={form.nom} onChange={changer} required maxLength={100}
            placeholder="Ex: Électronique" className={inputClass(false)} />
        </div>
        <div>
          <label className="label-admin">Catégorie parente</label>
          <select name="parent" value={form.parent} onChange={changer} className={inputClass(false)}
            disabled={!!parentForce}>
            <option value="">Aucune (catégorie racine)</option>
            {options_parent
              .filter((c) => c._id !== categorieInitiale?._id)
              .map((c) => (
                <option key={c._id} value={c._id}>{c.nom}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label-admin">Description</label>
        <textarea name="description" value={form.description} onChange={changer} rows={2}
          maxLength={500} placeholder="Description courte…"
          className={`${inputClass(false)} resize-none`} />
      </div>

      {/* Image + Ordre + Actif */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="label-admin">URL de l'image</label>
          <input name="image" value={form.image} onChange={changer}
            placeholder="https://…" className={inputClass(false)} />
        </div>
        <div>
          <label className="label-admin">Ordre d'affichage</label>
          <input name="ordre" type="number" value={form.ordre} onChange={changer}
            min={0} className={inputClass(false)} />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <input type="checkbox" name="active" checked={form.active} onChange={changer}
          className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent" />
        <span className="text-sm text-primary font-medium">Catégorie active</span>
      </label>

      {/* ── Attributs ── */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Attributs spécifiques</p>

        {/* Ajouter un attribut */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <input value={nouvelAttr.nom} onChange={(e) => setNouvelAttr((a) => ({ ...a, nom: e.target.value }))}
              placeholder="Nom (ex: Taille)" className={inputClass(false)} />
            <select value={nouvelAttr.type}
              onChange={(e) => setNouvelAttr((a) => ({ ...a, type: e.target.value as AttributCategorie['type'] }))}
              className={inputClass(false)}>
              <option value="texte">Texte</option>
              <option value="liste">Liste</option>
              <option value="nombre">Nombre</option>
              <option value="booleen">Booléen</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={nouvelAttr.requis}
                onChange={(e) => setNouvelAttr((a) => ({ ...a, requis: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent" />
              <span className="text-sm text-primary">Requis</span>
            </label>
          </div>

          {nouvelAttr.type === 'liste' && (
            <input value={valeursAttr} onChange={(e) => setValeursAttr(e.target.value)}
              placeholder="Valeurs séparées par virgule (S, M, L, XL)"
              className={inputClass(false)} />
          )}

          <button type="button" onClick={ajouterAttribut} disabled={!nouvelAttr.nom.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
            <Plus size={14} /> Ajouter l'attribut
          </button>
        </div>

        {/* Liste des attributs */}
        {form.attributs.length > 0 && (
          <div className="space-y-2">
            {form.attributs.map((attr, i) => (
              <div key={i} className="flex items-center justify-between bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm">
                <div>
                  <span className="font-semibold text-primary">{attr.nom}</span>
                  <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded text-[#74777d]">{attr.type}</span>
                  {attr.requis && <span className="ml-1 text-xs text-red-500">requis</span>}
                  {attr.valeurs?.length ? (
                    <span className="ml-2 text-[#74777d]">[{attr.valeurs.join(', ')}]</span>
                  ) : null}
                </div>
                <button type="button" onClick={() => supprimerAttribut(i)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onAnnuler}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#74777d] hover:bg-gray-100 transition-colors">
          Annuler
        </button>
        <Button type="submit" isLoading={chargement} loadingText="Enregistrement…" className="!w-auto px-6">
          {categorieInitiale ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
