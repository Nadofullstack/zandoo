import type { StatutLivreurVendeur } from '../../../types/vendeur/livreur';

interface Props {
  recherche: string;
  statut: StatutLivreurVendeur | '';
  onRechercheChange: (v: string) => void;
  onStatutChange: (v: StatutLivreurVendeur | '') => void;
}

const OPTIONS_STATUT: { valeur: StatutLivreurVendeur | ''; libelle: string }[] = [
  { valeur: '',           libelle: 'Tous les statuts' },
  { valeur: 'en_attente', libelle: 'En attente'       },
  { valeur: 'actif',      libelle: 'Actifs'           },
  { valeur: 'suspendu',   libelle: 'Suspendus'        },
];

const inputCls =
  'flex-1 min-w-[200px] px-4 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary ' +
  'placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all';

const selectCls =
  'px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary ' +
  'outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shrink-0';

export default function FiltresLivreurs({
  recherche,
  statut,
  onRechercheChange,
  onStatutChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <input
        type="search"
        value={recherche}
        onChange={(e) => onRechercheChange(e.target.value)}
        placeholder="Rechercher par nom, email, téléphone, ville…"
        className={inputCls}
        aria-label="Rechercher un livreur"
      />
      <select
        value={statut}
        onChange={(e) => onStatutChange(e.target.value as StatutLivreurVendeur | '')}
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
