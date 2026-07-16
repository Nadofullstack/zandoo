import type { StatutVendeur } from '../../../types/admin';
import ChampRecherche from '../modal/ChampRecherche';

interface FiltresVendeursProps {
  recherche: string;
  statut: StatutVendeur | '';
  onRechercheChange: (valeur: string) => void;
  onStatutChange: (statut: StatutVendeur | '') => void;
}

const OPTIONS_STATUT: { valeur: StatutVendeur | ''; libelle: string }[] = [
  { valeur: '',           libelle: 'Tous les statuts' },
  { valeur: 'en_attente', libelle: 'En attente'       },
  { valeur: 'approuve',   libelle: 'Approuvés'        },
  { valeur: 'suspendu',   libelle: 'Suspendus'        },
];

/**
 * Barre de filtres : recherche textuelle + filtre par statut.
 */
export default function FiltresVendeurs({
  recherche,
  statut,
  onRechercheChange,
  onStatutChange,
}: FiltresVendeursProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <ChampRecherche
        valeur={recherche}
        onChange={onRechercheChange}
        placeholder="Rechercher par nom d'entreprise ou email…"
      />

      <select
        value={statut}
        onChange={(e) => onStatutChange(e.target.value as StatutVendeur | '')}
        aria-label="Filtrer par statut"
        className="px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shrink-0"
      >
        {OPTIONS_STATUT.map((opt) => (
          <option key={opt.valeur} value={opt.valeur}>
            {opt.libelle}
          </option>
        ))}
      </select>
    </div>
  );
}
