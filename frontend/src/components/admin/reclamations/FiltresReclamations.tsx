import ChampRecherche from '../modal/ChampRecherche';
import type { StatutReclamation, PrioriteReclamation, CategorieReclamation } from '../../../types/admin';

interface FiltresReclamationsProps {
  recherche: string;
  statut: StatutReclamation | '';
  priorite: PrioriteReclamation | '';
  categorie: CategorieReclamation | '';
  onRechercheChange: (v: string) => void;
  onStatutChange: (v: StatutReclamation | '') => void;
  onPrioriteChange: (v: PrioriteReclamation | '') => void;
  onCategorieChange: (v: CategorieReclamation | '') => void;
}

const OPTIONS_STATUT: { valeur: StatutReclamation | ''; libelle: string }[] = [
  { valeur: '',                    libelle: 'Tous les statuts'   },
  { valeur: 'ouvert',              libelle: 'Ouvert'             },
  { valeur: 'en_cours',            libelle: 'En cours'           },
  { valeur: 'en_attente_reponse',  libelle: 'En attente'         },
  { valeur: 'resolu',              libelle: 'Résolu'             },
  { valeur: 'ferme',               libelle: 'Fermé'              },
];

const OPTIONS_PRIORITE: { valeur: PrioriteReclamation | ''; libelle: string }[] = [
  { valeur: '',        libelle: 'Toutes priorités' },
  { valeur: 'basse',   libelle: 'Basse'            },
  { valeur: 'normale', libelle: 'Normale'          },
  { valeur: 'haute',   libelle: 'Haute'            },
  { valeur: 'urgente', libelle: 'Urgente'          },
];

const OPTIONS_CATEGORIE: { valeur: CategorieReclamation | ''; libelle: string }[] = [
  { valeur: '',                      libelle: 'Toutes catégories'    },
  { valeur: 'produit_non_recu',      libelle: 'Produit non reçu'     },
  { valeur: 'produit_defectueux',    libelle: 'Produit défectueux'   },
  { valeur: 'produit_non_conforme',  libelle: 'Produit non conforme' },
  { valeur: 'remboursement',         libelle: 'Remboursement'        },
  { valeur: 'vendeur',               libelle: 'Vendeur'              },
  { valeur: 'paiement',              libelle: 'Paiement'             },
  { valeur: 'compte',                libelle: 'Compte'               },
  { valeur: 'autre',                 libelle: 'Autre'                },
];

/**
 * Barre de filtres pour la liste des réclamations.
 */
export default function FiltresReclamations({
  recherche, statut, priorite, categorie,
  onRechercheChange, onStatutChange, onPrioriteChange, onCategorieChange,
}: FiltresReclamationsProps) {

  const selectClasses = "px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <ChampRecherche
        valeur={recherche}
        onChange={onRechercheChange}
        placeholder="Rechercher par numéro ou sujet…"
      />

      <select
        value={statut}
        onChange={(e) => onStatutChange(e.target.value as StatutReclamation | '')}
        className={selectClasses}
        aria-label="Filtrer par statut"
      >
        {OPTIONS_STATUT.map((o) => <option key={o.valeur} value={o.valeur}>{o.libelle}</option>)}
      </select>

      <select
        value={priorite}
        onChange={(e) => onPrioriteChange(e.target.value as PrioriteReclamation | '')}
        className={selectClasses}
        aria-label="Filtrer par priorité"
      >
        {OPTIONS_PRIORITE.map((o) => <option key={o.valeur} value={o.valeur}>{o.libelle}</option>)}
      </select>

      <select
        value={categorie}
        onChange={(e) => onCategorieChange(e.target.value as CategorieReclamation | '')}
        className={selectClasses}
        aria-label="Filtrer par catégorie"
      >
        {OPTIONS_CATEGORIE.map((o) => <option key={o.valeur} value={o.valeur}>{o.libelle}</option>)}
      </select>
    </div>
  );
}
