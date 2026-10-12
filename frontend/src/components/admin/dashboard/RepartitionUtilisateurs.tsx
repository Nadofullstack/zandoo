import React from 'react';
import { Users } from 'lucide-react';
import type { ComparaisonUtilisateurs } from '../../../services/admin/dashboardService';
import { BadgeVariation, Carte, EtatErreur, EtatVide, Squelette } from './ui';
import { COULEURS_ROLES, formatNombre } from './theme';

interface Props {
  donnees: ComparaisonUtilisateurs | null;
  chargement: boolean;
  erreur: boolean;
  onReessayer: () => void;
}

const ROLES = [
  { cle: 'acheteurs', libelle: 'Acheteurs', couleur: COULEURS_ROLES.acheteurs },
  { cle: 'vendeurs',  libelle: 'Vendeurs',  couleur: COULEURS_ROLES.vendeurs },
  { cle: 'livreurs',  libelle: 'Livreurs',  couleur: COULEURS_ROLES.livreurs },
] as const;

/**
 * Répartition des nouveaux inscrits par rôle, avec part du total
 * et variation vs période précédente (barres horizontales).
 */
const RepartitionUtilisateurs: React.FC<Props> = ({ donnees, chargement, erreur, onReessayer }) => {
  const total = donnees?.actuelle.total ?? 0;

  return (
    <Carte
      titre="Répartition par rôle"
      sousTitre="Nouveaux inscrits et évolution"
      rechargement={chargement && !!donnees}
      className="h-full"
    >
      {erreur && !donnees ? (
        <EtatErreur onReessayer={onReessayer} className="h-72" />
      ) : !donnees ? (
        <Squelette className="h-72" />
      ) : total === 0 ? (
        <EtatVide icone={<Users className="w-6 h-6" />} titre="Aucune inscription sur cette période" className="h-72" />
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary tabular-nums">{formatNombre(total)}</span>
            <span className="text-sm text-slate-500">nouveaux comptes</span>
          </div>

          {/* Barre empilée */}
          <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            {ROLES.map((r) => (
              <div
                key={r.cle}
                className="h-full transition-[width] duration-500 ease-out"
                style={{ width: `${(donnees.actuelle[r.cle] / total) * 100}%`, backgroundColor: r.couleur }}
              />
            ))}
          </div>

          <ul className="mt-6 space-y-5">
            {ROLES.map((r) => {
              const n = donnees.actuelle[r.cle];
              const part = Math.round((n / total) * 100);
              return (
                <li key={r.cle}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="w-1 h-4 rounded-full" style={{ backgroundColor: r.couleur }} />
                      {r.libelle}
                    </span>
                    <span className="flex items-center gap-2">
                      <BadgeVariation valeur={donnees.variations[r.cle]} />
                      <span className="w-10 text-right font-semibold text-primary tabular-nums">{formatNombre(n)}</span>
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-500 ease-out"
                        style={{ width: `${part}%`, backgroundColor: r.couleur }}
                      />
                    </div>
                    <span className="w-9 text-right text-xs text-slate-400 tabular-nums">{part} %</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Carte>
  );
};

export default RepartitionUtilisateurs;
