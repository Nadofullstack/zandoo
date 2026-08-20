import { Plus, ChevronDown, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import FormNouvelleCategorie from './FormNouvelleCategorie';
import type { Categorie, StatutProduit } from '../../../types/admin';

/* ── Types ────────────────────────────────────────────── */
interface EtatForm {
  nom: string; reference: string; description: string;
  categorieId: string; statut: StatutProduit;
}
interface EtatErreurs {
  nom?: string; reference?: string; description?: string;
  categorieId?: string;
}


function champCls(err?: string) {
  return [
    'w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-primary',
    'placeholder:text-gray-400 transition-all outline-none focus:ring-2',
    err ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
        : 'border-[#c4c6cd] focus:border-accent focus:ring-accent/20',
  ].join(' ');
}

function ErrChamp({ msg, id }: { msg?: string; id: string }) {
  if (!msg) return null;
  return (
    <p id={id} role="alert" className="flex items-center gap-1 text-xs text-red-600 mt-1">
      <AlertCircle size={11} aria-hidden /> {msg}
    </p>
  );
}

/* ── Props ────────────────────────────────────────────── */
interface Props {
  form: EtatForm;
  erreurs: EtatErreurs;
  categories: Categorie[];
  chargCat: boolean;
  ajoutCat: boolean;
  chargCreatCat: boolean;
  errCreatCat?: string;
  /** true = mode modification, la référence est affichée en lecture seule */
  modeModif?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onStatutChange: (s: StatutProduit) => void;
  onToggleAjoutCat: () => void;
  onCreerCategorie: (nom: string) => void;
  onAnnulerAjoutCat: () => void;
}

export default function OngletInformations({
  form, erreurs, categories,
  chargCat, ajoutCat, chargCreatCat, errCreatCat,
  modeModif = false,
  onChange,
  onToggleAjoutCat, onCreerCategorie, onAnnulerAjoutCat,
}: Props) {
  return (
    <div className="space-y-4">

      {/* Nom */}
      <div>
        <label htmlFor="prod-nom" className="label-admin">
          <Tag size={11} className="inline mr-1" aria-hidden /> Nom du produit *
        </label>
        <input id="prod-nom" name="nom" type="text"
          value={form.nom} onChange={onChange} placeholder="Ex : Chaussures en cuir verni"
          maxLength={255} aria-invalid={!!erreurs.nom} aria-describedby="prod-nom-err"
          className={champCls(erreurs.nom)} />
        <ErrChamp msg={erreurs.nom} id="prod-nom-err" />
      </div>

      {/* Référence — lecture seule en modification, masqué en création (générée par le backend) */}
      {modeModif ? (
        <div>
          <label htmlFor="prod-ref" className="label-admin">Référence (SKU)</label>
          <div className="flex items-center gap-2">
            <input
              id="prod-ref" name="reference" type="text"
              value={form.reference} readOnly
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-[#c4c6cd] rounded-xl text-sm text-[#74777d] font-mono cursor-not-allowed"
            />
            <span className="text-xs text-[#74777d] whitespace-nowrap">Non modifiable</span>
          </div>
        </div>
      ) : (
        <div>
          <label className="label-admin">Référence (SKU)</label>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-dashed border-[#c4c6cd] rounded-xl">
            <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" aria-hidden />
            <span className="text-xs text-[#74777d]">
              Générée automatiquement à la création au format <span className="font-mono font-semibold">AAAA-MM-JJ-NNNN</span>
            </span>
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label htmlFor="prod-desc" className="label-admin">Description *</label>
        <textarea id="prod-desc" name="description"
          value={form.description} onChange={onChange}
          placeholder="Décrivez le produit en détail…" rows={4} maxLength={10000}
          aria-invalid={!!erreurs.description} aria-describedby="prod-desc-err"
          className={champCls(erreurs.description) + ' resize-none'} />
        <div className="flex justify-between">
          <ErrChamp msg={erreurs.description} id="prod-desc-err" />
          <span className="text-xs text-gray-400 ml-auto">{form.description.length}/10 000</span>
        </div>
      </div>

      {/* Catégorie */}
      <div>
        <label htmlFor="prod-cat" className="label-admin">Catégorie *</label>
        <div className="relative">
          <select id="prod-cat" name="categorieId" value={form.categorieId}
            onChange={onChange} disabled={chargCat}
            aria-invalid={!!erreurs.categorieId} aria-describedby="prod-cat-err"
            className={champCls(erreurs.categorieId) + ' appearance-none pr-8'}>
            <option value="">{chargCat ? 'Chargement…' : '— Sélectionner —'}</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.nom}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <ErrChamp msg={erreurs.categorieId} id="prod-cat-err" />
        <button type="button" onClick={onToggleAjoutCat}
          className="mt-1.5 flex items-center gap-1 text-xs text-accent hover:underline font-medium">
          <Plus size={12} aria-hidden /> Créer une nouvelle catégorie
        </button>
        {ajoutCat && (
          <FormNouvelleCategorie
            onCreer={onCreerCategorie} onAnnuler={onAnnulerAjoutCat}
            chargement={chargCreatCat} erreur={errCreatCat}
          />
        )}
      </div>

  
    </div>
  );
}
