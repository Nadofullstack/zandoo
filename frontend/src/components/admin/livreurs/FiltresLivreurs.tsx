import type { StatutLivreur } from '../../../types/admin';
import type { OptionBoutique } from '../../../hooks/admin/useGestionLivreurs';
import ChampRecherche from '../modal/ChampRecherche';

interface Props {
  recherche: string;
  statut: StatutLivreur | '';
  vendeurId: string;
  boutiques: OptionBoutique[];
  onRechercheChange: (v: string) => void;
  onStatutChange: (v: StatutLivreur | '') => void;
  onVendeurChange: (v: string) => void;
}

const OPTIONS_STATUT: { valeur: StatutLivreur | ''; libelle: string }[] = [
  { valeur: '',           libelle: 'Tous les statuts' },
  { valeur: 'en_attente', libelle: 'En attente'       },
  { valeur: 'actif',      libelle: 'Actifs'           },
  { valeur: 'suspendu',   libelle: 'Suspendus'        },
];

const selectCls =
  'px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary ' +
  'outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shrink-0';

export default function FiltresLivreurs({
  recherche,
  statut,
  vendeurId,
  boutiques,
  onRechercheChange,
  onStatutChange,
  onVendeurChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <ChampRecherche
        valeur={recherche}
        onChange={onRechercheChange}
        placeholder="Rechercher par nom, email, téléphone, ville…"
      />

      {/* Filtre par boutique */}
      <select
        value={vendeurId}
        onChange={(e) => onVendeurChange(e.target.value)}
        className={selectCls}
        aria-label="Filtrer par boutique"
      >
        <option value="">Toutes les boutiques</option>
        {boutiques.map((b) => (
          <option key={b._id} value={b._id}>{b.nomEntreprise}</option>
        ))}
      </select>

      {/* Filtre par statut */}
      <select
        value={statut}
        onChange={(e) => onStatutChange(e.target.value as StatutLivreur | '')}
        className={selectCls}
        aria-label="Filtrer par statut"
      >
        {OPTIONS_STATUT.map((o) => (
          <option key={o.valeur} value={o.valeur}>{o.libelle}</option>
        ))}
      </select>
    </div>
  );
}
