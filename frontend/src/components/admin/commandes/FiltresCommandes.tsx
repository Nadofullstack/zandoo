import ChampRecherche from '../modal/ChampRecherche';
import type { StatutCommande } from '../../../types/admin';

interface FiltresCommandesProps {
  recherche: string;
  statut: StatutCommande | '';
  dateDebut: string;
  dateFin: string;
  onRechercheChange: (v: string) => void;
  onStatutChange: (v: StatutCommande | '') => void;
  onDateDebutChange: (v: string) => void;
  onDateFinChange: (v: string) => void;
}

const OPTIONS_STATUT: { valeur: StatutCommande | ''; libelle: string }[] = [
  { valeur: '',           libelle: 'Tous les statuts' },
  { valeur: 'en_attente', libelle: 'En attente'       },
  { valeur: 'payee',      libelle: 'Payée'            },
  { valeur: 'expediee',   libelle: 'Expédiée'         },
  { valeur: 'livree',     libelle: 'Livrée'           },
  { valeur: 'annulee',    libelle: 'Annulée'          },
];

/**
 * Barre de filtres pour la liste des commandes.
 */
export default function FiltresCommandes({
  recherche, statut, dateDebut, dateFin,
  onRechercheChange, onStatutChange, onDateDebutChange, onDateFinChange,
}: FiltresCommandesProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Recherche par numéro */}
      <ChampRecherche
        valeur={recherche}
        onChange={onRechercheChange}
        placeholder="Rechercher par numéro…"
      />

      {/* Filtre statut */}
      <select
        value={statut}
        onChange={(e) => onStatutChange(e.target.value as StatutCommande | '')}
        className="px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
        aria-label="Filtrer par statut"
      >
        {OPTIONS_STATUT.map((o) => (
          <option key={o.valeur} value={o.valeur}>{o.libelle}</option>
        ))}
      </select>

      {/* Date début */}
      <input
        type="date"
        value={dateDebut}
        onChange={(e) => onDateDebutChange(e.target.value)}
        className="px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
        aria-label="Date de début"
      />

      {/* Date fin */}
      <input
        type="date"
        value={dateFin}
        onChange={(e) => onDateFinChange(e.target.value)}
        className="px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
        aria-label="Date de fin"
      />
    </div>
  );
}
