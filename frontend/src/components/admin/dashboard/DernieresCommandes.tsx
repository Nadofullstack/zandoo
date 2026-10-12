import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Inbox } from 'lucide-react';
import { getCommandes } from '../../../services/admin/adminCommandeService';
import { Carte, EtatErreur, EtatVide, Squelette } from './ui';
import { useChargement } from './useChargement';
import { STATUTS_COMMANDE, formatDateCourte, formatFCFA } from './theme';

const NB_COMMANDES = 6;

const chargerCommandes = async () => (await getCommandes({ limite: NB_COMMANDES })).data.commandes;

const DernieresCommandes: React.FC<{ version: number }> = ({ version }) => {
  const navigate = useNavigate();
  const { donnees, chargement, erreur, recharger } = useChargement(chargerCommandes, String(version));

  const lienTout = (
    <Link
      to="/admin/commandes"
      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary transition-colors shrink-0"
    >
      Tout voir <ArrowUpRight className="w-3.5 h-3.5" />
    </Link>
  );

  return (
    <Carte
      titre="Dernières commandes"
      sousTitre="Commandes les plus récentes, tous statuts"
      action={lienTout}
      rechargement={chargement && !!donnees}
      className="h-full"
    >
      {erreur && !donnees ? (
        <EtatErreur onReessayer={recharger} className="h-64" />
      ) : !donnees ? (
        <div className="space-y-2">
          {Array.from({ length: NB_COMMANDES }).map((_, i) => <Squelette key={i} className="h-11" />)}
        </div>
      ) : donnees.length === 0 ? (
        <EtatVide icone={<Inbox className="w-6 h-6" />} titre="Aucune commande pour le moment" className="h-64" />
      ) : (
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-2.5 font-semibold">Commande</th>
                <th className="px-3 py-2.5 font-semibold">Client</th>
                <th className="px-3 py-2.5 font-semibold">Statut</th>
                <th className="px-5 py-2.5 font-semibold text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {donnees.map((c) => {
                const statut = STATUTS_COMMANDE[c.statut];
                return (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/admin/commandes/${c._id}`)}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        to={`/admin/commandes/${c._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-xs font-semibold text-primary hover:text-accent"
                      >
                        {c.numero}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateCourte(c.createdAt)}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-slate-700 truncate max-w-[180px]">{c.acheteur?.fullName ?? '—'}</p>
                      <p className="text-xs text-slate-400">
                        {c.lignes.length} article{c.lignes.length > 1 ? 's' : ''}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${statut?.badge ?? 'bg-slate-50 text-slate-600 ring-slate-500/20'}`}>
                        {statut?.libelle ?? c.statut}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-primary tabular-nums whitespace-nowrap">
                      {formatFCFA(c.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Carte>
  );
};

export default DernieresCommandes;
