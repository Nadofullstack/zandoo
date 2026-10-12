import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CircleCheck, Clock, MessageSquareWarning, PackageX, Store, Truck } from 'lucide-react';
import { getStatistiquesCommandes } from '../../../services/admin/adminCommandeService';
import { getStatistiquesVendeurs } from '../../../services/admin/adminVendeurService';
import { getStatistiquesLivreurs } from '../../../services/admin/adminLivreurService';
import { getStatistiquesReclamations } from '../../../services/admin/adminReclamationService';
import { getStatistiquesProduits } from '../../../services/admin/adminProduitService';
import { Carte, Squelette } from './ui';
import { useChargement } from './useChargement';
import { formatNombre } from './theme';

interface Action {
  libelle: string;
  detail: string;
  valeur: number | null; // null = statistique indisponible
  lien: string;
  icone: React.ReactNode;
  critique?: boolean;
}

/** Valeur d'une promesse réglée, ou null si elle a échoué */
const valeur = <T,>(r: PromiseSettledResult<T>): T | null => (r.status === 'fulfilled' ? r.value : null);

const chargerActions = async (): Promise<Action[]> => {
  const [commandes, vendeurs, livreurs, reclamations, produits] = await Promise.allSettled([
    getStatistiquesCommandes(),
    getStatistiquesVendeurs(),
    getStatistiquesLivreurs(),
    getStatistiquesReclamations(),
    getStatistiquesProduits(),
  ]);

  const c = valeur(commandes)?.data.statistiques;
  const v = valeur(vendeurs)?.data.statistiques;
  const l = valeur(livreurs)?.data.statistiques;
  const r = valeur(reclamations)?.data.statistiques;
  const p = valeur(produits)?.data.statistiques;

  return [
    {
      libelle: 'Commandes en attente',
      detail: 'Paiement ou validation à confirmer',
      valeur: c?.enAttente ?? null,
      lien: '/admin/commandes',
      icone: <Clock className="w-4 h-4" />,
    },
    {
      libelle: 'Réclamations ouvertes',
      detail: r && r.urgents > 0 ? `dont ${r.urgents} urgente${r.urgents > 1 ? 's' : ''}` : 'Tickets en attente de prise en charge',
      valeur: r ? r.ouverts + r.enCours : null,
      lien: '/admin/reclamations',
      icone: <MessageSquareWarning className="w-4 h-4" />,
      critique: !!r && r.urgents > 0,
    },
    {
      libelle: 'Vendeurs à valider',
      detail: 'Demandes d\'ouverture de boutique',
      valeur: v?.enAttente ?? null,
      lien: '/admin/vendeurs',
      icone: <Store className="w-4 h-4" />,
    },
    {
      libelle: 'Livreurs à valider',
      detail: 'Comptes en attente d\'activation',
      valeur: l?.enAttente ?? null,
      lien: '/admin/livreurs',
      icone: <Truck className="w-4 h-4" />,
    },
    {
      libelle: 'Produits en rupture',
      detail: p ? `${formatNombre(p.faible)} en stock faible` : 'Stock épuisé',
      valeur: p?.enRupture ?? null,
      lien: '/admin/produits',
      icone: <PackageX className="w-4 h-4" />,
    },
  ];
};

const ActionsRequises: React.FC<{ version: number }> = ({ version }) => {
  const { donnees, chargement } = useChargement(chargerActions, String(version));
  const totalEnAttente = donnees?.reduce((s, a) => s + (a.valeur ?? 0), 0) ?? 0;

  const compteur = donnees && (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${
        totalEnAttente > 0 ? 'bg-accent/10 text-accent' : 'bg-emerald-50 text-emerald-700'
      }`}
    >
      {totalEnAttente > 0 ? formatNombre(totalEnAttente) : 'À jour'}
    </span>
  );

  return (
    <Carte titre="À traiter" sousTitre="Éléments nécessitant une action" action={compteur} rechargement={chargement && !!donnees} className="h-full">
      {!donnees ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Squelette key={i} className="h-14" />)}
        </div>
      ) : (
        <ul className="-mx-2 space-y-0.5">
          {donnees.map((a) => {
            const actif = (a.valeur ?? 0) > 0;
            return (
              <li key={a.libelle}>
                <Link
                  to={a.lien}
                  className="group flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span
                    className={`p-2 rounded-lg shrink-0 transition-colors ${
                      a.critique ? 'bg-red-50 text-red-600' : actif ? 'bg-accent/10 text-accent' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {actif || a.valeur === null ? a.icone : <CircleCheck className="w-4 h-4" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-primary truncate">{a.libelle}</span>
                    <span className={`block text-xs truncate ${a.critique ? 'text-red-600' : 'text-slate-400'}`}>{a.detail}</span>
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${actif ? 'text-primary' : 'text-slate-300'}`}>
                    {a.valeur === null ? '—' : formatNombre(a.valeur)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Carte>
  );
};

export default ActionsRequises;
