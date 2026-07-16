import type { RoleUtilisateur } from '../../../types/admin';
import ChampRecherche from '../modal/ChampRecherche';

interface Props {
  recherche: string;
  role: RoleUtilisateur | '';
  actif: 'true' | 'false' | '';
  dateDebut: string;
  dateFin: string;
  onRechercheChange: (v: string) => void;
  onRoleChange: (v: RoleUtilisateur | '') => void;
  onActifChange: (v: 'true' | 'false' | '') => void;
  onDateDebutChange: (v: string) => void;
  onDateFinChange: (v: string) => void;
}

const OPTIONS_ROLE: { valeur: RoleUtilisateur | ''; libelle: string }[] = [
  { valeur: '',         libelle: 'Tous les rôles' },
  { valeur: 'acheteur', libelle: 'Acheteurs'      },
  { valeur: 'vendeur',  libelle: 'Vendeurs'        },
  { valeur: 'livreur',  libelle: 'Livreurs'        },
  { valeur: 'admin',    libelle: 'Admins'          },
];

const OPTIONS_STATUT: { valeur: 'true' | 'false' | ''; libelle: string }[] = [
  { valeur: '',      libelle: 'Tous les statuts' },
  { valeur: 'true',  libelle: 'Actifs'           },
  { valeur: 'false', libelle: 'Suspendus'        },
];

const selectCls = 'px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shrink-0';
const inputCls  = 'px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all';

export default function FiltresUtilisateurs({
  recherche, role, actif, dateDebut, dateFin,
  onRechercheChange, onRoleChange, onActifChange, onDateDebutChange, onDateFinChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Ligne 1 : recherche + rôle + statut */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <ChampRecherche
          valeur={recherche}
          onChange={onRechercheChange}
          placeholder="Rechercher par nom, email, téléphone…"
        />
        <select value={role} onChange={(e) => onRoleChange(e.target.value as RoleUtilisateur | '')} className={selectCls}>
          {OPTIONS_ROLE.map((o) => <option key={o.valeur} value={o.valeur}>{o.libelle}</option>)}
        </select>
        <select value={actif} onChange={(e) => onActifChange(e.target.value as 'true' | 'false' | '')} className={selectCls}>
          {OPTIONS_STATUT.map((o) => <option key={o.valeur} value={o.valeur}>{o.libelle}</option>)}
        </select>
      </div>

      {/* Ligne 2 : dates d'inscription */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-[#74777d]">
        <span className="font-medium shrink-0">Inscription :</span>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={dateDebut} onChange={(e) => onDateDebutChange(e.target.value)}
            className={inputCls} aria-label="Date début" />
          <span className="text-gray-400">→</span>
          <input type="date" value={dateFin} onChange={(e) => onDateFinChange(e.target.value)}
            className={inputCls} aria-label="Date fin"
            min={dateDebut || undefined} />
          {(dateDebut || dateFin) && (
            <button onClick={() => { onDateDebutChange(''); onDateFinChange(''); }}
              className="text-xs text-accent hover:underline">
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
