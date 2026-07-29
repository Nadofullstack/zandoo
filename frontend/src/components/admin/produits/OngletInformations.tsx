import { Wand2, Plus, ChevronDown, Tag, BarChart2, CheckCircle2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import FormNouvelleCategorie from './FormNouvelleCategorie';
import type { Categorie, Vendeur, StatutProduit } from '../../../types/admin';

/* ── Types ────────────────────────────────────────────── */
interface EtatForm {
  nom: string; reference: string; description: string;
  categorieId: string; vendeurId: string; statut: StatutProduit;
}
interface EtatErreurs {
  nom?: string; reference?: string; description?: string;
  categorieId?: string; vendeurId?: string;
}

const STATUTS: { valeur: StatutProduit; libelle: string; couleur: string }[] = [
  { valeur: 'approuve',   libelle: 'Approuvé',   couleur: 'bg-green-100 text-green-700'   },
  { valeur: 'en_attente', libelle: 'En attente', couleur: 'bg-yellow-100 text-yellow-700'  },
  { valeur: 'brouillon',  libelle: 'Brouillon',  couleur: 'bg-gray-100 text-gray-600'     },
  { valeur: 'rejete',     libelle: 'Rejeté',     couleur: 'bg-red-100 text-red-700'       },
];

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
  vendeurs: Vendeur[];
  chargCat: boolean;
  chargVend: boolean;
  ajoutCat: boolean;
  chargCreatCat: boolean;
  errCreatCat?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onGenererRef: () => void;
  onStatutChange: (s: StatutProduit) => void;
  onToggleAjoutCat: () => void;
  onCreerCategorie: (nom: string) => void;
  onAnnulerAjoutCat: () => void;
}

export default function OngletInformations({
  form, erreurs, categories, vendeurs,
  chargCat, chargVend, ajoutCat, chargCreatCat, errCreatCat,
  onChange, onGenererRef, onStatutChange,
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

      {/* Référence */}
      <div>
        <label htmlFor="prod-ref" className="label-admin">Référence (SKU) *</label>
        <div className="flex gap-2">
          <input id="prod-ref" name="reference" type="text"
            value={form.reference} onChange={onChange}
            placeholder="Ex : REF-CHAUSSURES-001" maxLength={50}
            aria-invalid={!!erreurs.reference} aria-describedby="prod-ref-err"
            className={champCls(erreurs.reference) + ' flex-1'} />
          <button type="button" onClick={onGenererRef} title="Générer automatiquement"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#c4c6cd]
                       bg-white text-xs font-semibold text-primary hover:border-accent
                       hover:text-accent transition-colors whitespace-nowrap">
            <Wand2 size={13} aria-hidden /> Générer
          </button>
        </div>
        <ErrChamp msg={erreurs.reference} id="prod-ref-err" />
      </div>

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

      {/* Vendeur */}
      <div>
        <label htmlFor="prod-vend" className="label-admin">Vendeur *</label>
        <div className="relative">
          <select id="prod-vend" name="vendeurId" value={form.vendeurId}
            onChange={onChange} disabled={chargVend}
            aria-invalid={!!erreurs.vendeurId} aria-describedby="prod-vend-err"
            className={champCls(erreurs.vendeurId) + ' appearance-none pr-8'}>
            <option value="">{chargVend ? 'Chargement…' : '— Sélectionner —'}</option>
            {vendeurs.map((v) => <option key={v._id} value={v._id}>{v.nomEntreprise}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <ErrChamp msg={erreurs.vendeurId} id="prod-vend-err" />
      </div>

      {/* Statut */}
      <div>
        <label className="label-admin">
          <BarChart2 size={11} className="inline mr-1" aria-hidden /> Statut
        </label>
        <div className="flex flex-wrap gap-2">
          {STATUTS.map(({ valeur, libelle, couleur }) => (
            <button key={valeur} type="button" onClick={() => onStatutChange(valeur)}
              className={[
                'px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all',
                form.statut === valeur ? `${couleur} border-current`
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300',
              ].join(' ')}>
              {form.statut === valeur && <CheckCircle2 size={11} className="inline mr-1" aria-hidden />}
              {libelle}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
