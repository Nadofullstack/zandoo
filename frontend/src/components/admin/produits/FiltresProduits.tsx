import type { StatutProduit, Categorie, Vendeur } from '../../../types/admin';
import ChampRecherche from '../modal/ChampRecherche';

interface Props {
  recherche: string;
  statut: StatutProduit | '';
  categorieId: string;
  vendeurId: string;
  categories: Categorie[];
  vendeurs: Vendeur[];
  onRechercheChange: (v: string) => void;
  onStatutChange: (v: StatutProduit | '') => void;
  onCategorieChange: (v: string) => void;
  onVendeurChange: (v: string) => void;
}

const OPTIONS_STATUT: { valeur: StatutProduit | ''; libelle: string }[] = [
  { valeur: '',           libelle: 'Tous les statuts' },
  { valeur: 'en_stock',   libelle: 'En stock'         },
  { valeur: 'faible',     libelle: 'Faible'           },
  { valeur: 'en_rupture', libelle: 'En rupture'       },
];

const selectCls = 'px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shrink-0';

export default function FiltresProduits({
  recherche, statut, categorieId, vendeurId,
  categories, vendeurs,
  onRechercheChange, onStatutChange, onCategorieChange, onVendeurChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <ChampRecherche
        valeur={recherche}
        onChange={onRechercheChange}
        placeholder="Rechercher par nom, référence…"
      />

      {/* Filtre statut */}
      <select
        value={statut}
        onChange={(e) => onStatutChange(e.target.value as StatutProduit | '')}
        className={selectCls}
      >
        {OPTIONS_STATUT.map((o) => (
          <option key={o.valeur} value={o.valeur}>{o.libelle}</option>
        ))}
      </select>

      {/* Filtre catégorie */}
      <select
        value={categorieId}
        onChange={(e) => onCategorieChange(e.target.value)}
        className={selectCls}
      >
        <option value="">Toutes les catégories</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>{c.nom}</option>
        ))}
      </select>

      {/* Filtre vendeur */}
      <select
        value={vendeurId}
        onChange={(e) => onVendeurChange(e.target.value)}
        className={selectCls}
      >
        <option value="">Tous les vendeurs</option>
        {vendeurs.map((v) => (
          <option key={v._id} value={v._id}>{v.nomEntreprise}</option>
        ))}
      </select>
    </div>
  );
}
