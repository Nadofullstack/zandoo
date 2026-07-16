import type { StatutProduit, Categorie } from '../../../types/admin';
import ChampRecherche from '../modal/ChampRecherche';

interface Props {
  recherche: string;
  statut: StatutProduit | '';
  categorieId: string;
  categories: Categorie[];
  onRechercheChange: (v: string) => void;
  onStatutChange: (v: StatutProduit | '') => void;
  onCategorieChange: (v: string) => void;
}

const OPTIONS_STATUT: { valeur: StatutProduit | ''; libelle: string }[] = [
  { valeur: '',           libelle: 'Tous les statuts'  },
  { valeur: 'en_attente', libelle: 'En attente'        },
  { valeur: 'approuve',   libelle: 'Approuvés'         },
  { valeur: 'rejete',     libelle: 'Rejetés'           },
  { valeur: 'brouillon',  libelle: 'Brouillons'        },
];

export default function FiltresProduits({
  recherche, statut, categorieId, categories,
  onRechercheChange, onStatutChange, onCategorieChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <ChampRecherche
        valeur={recherche}
        onChange={onRechercheChange}
        placeholder="Rechercher par nom, référence…"
      />

      <select
        value={statut}
        onChange={(e) => onStatutChange(e.target.value as StatutProduit | '')}
        className="px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shrink-0"
      >
        {OPTIONS_STATUT.map((o) => (
          <option key={o.valeur} value={o.valeur}>{o.libelle}</option>
        ))}
      </select>

      <select
        value={categorieId}
        onChange={(e) => onCategorieChange(e.target.value)}
        className="px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shrink-0"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>{c.nom}</option>
        ))}
      </select>
    </div>
  );
}
