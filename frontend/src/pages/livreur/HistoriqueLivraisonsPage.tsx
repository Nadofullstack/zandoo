import { useState, useEffect, useCallback } from 'react';
import {
  ClockArrowDown, MapPin, CheckCircle2, XCircle,
  AlertCircle, ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react';
import DispositionLivreur from '../../components/livreur/layout/DispositionLivreur';
import { getHistoriqueLivraisons, type CommandeLivreur } from '../../services/livreur/livreurDashboardService';

function formatPrix(prix: number) {
  return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

const FILTRES = [
  { valeur: '',        libelle: 'Toutes'   },
  { valeur: 'livree',  libelle: 'Livrées'  },
  { valeur: 'annulee', libelle: 'Annulées' },
];

export default function HistoriqueLivraisonsPage() {
  const [commandes, setCommandes]   = useState<CommandeLivreur[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limite: 20 });
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]         = useState<string | null>(null);
  const [filtre, setFiltre]         = useState('');

  const charger = useCallback(async (page = 1, statut = filtre) => {
    setChargement(true); setErreur(null);
    try {
      const rep = await getHistoriqueLivraisons(page, statut || undefined);
      setCommandes(rep.data.commandes);
      setPagination(rep.data.pagination);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
    } finally { setChargement(false); }
  }, [filtre]);

  useEffect(() => { charger(1, filtre); }, [filtre]);

  return (
    <DispositionLivreur>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Historique</h1>
          <p className="text-sm text-[#74777d] mt-1">
            {pagination.total} livraison{pagination.total > 1 ? 's' : ''} terminée{pagination.total > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => charger(1)} disabled={chargement}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-[#74777d] hover:bg-gray-50 transition-colors disabled:opacity-50">
          <RefreshCw size={15} className={chargement ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {FILTRES.map((f) => (
          <button key={f.valeur} onClick={() => setFiltre(f.valeur)}
            className={[
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              filtre === f.valeur
                ? 'bg-primary text-white cursor-pointer'
                : 'bg-surface border border-gray-200 text-[#74777d] hover:border-primary hover:text-primary cursor-pointer',
            ].join(' ')}>
            {f.libelle}
          </button>
        ))}
      </div>

      {erreur && (
        <div className="mb-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} /> {erreur}
        </div>
      )}

      {chargement && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
      )}

      {!chargement && commandes.length > 0 && (
        <>
          <div className="space-y-3">
            {commandes.map((c) => {
              const estLivree = c.statut === 'livree';
              return (
                <div key={c._id}
                  className="bg-surface rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${estLivree ? 'bg-green-100' : 'bg-red-100'}`}>
                    {estLivree
                      ? <CheckCircle2 size={17} className="text-green-600" />
                      : <XCircle      size={17} className="text-red-500"   />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-primary">{c.numero}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        estLivree ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {estLivree ? 'Livrée' : 'Annulée'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#74777d]">
                      <MapPin size={11} />
                      <span className="truncate">{c.adresseLivraison.ville}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatDate(estLivree ? (c.livreeAt ?? c.updatedAt) : (c.annuleeAt ?? c.updatedAt))}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-primary">{formatPrix(c.total)}</p>
                    <p className="text-xs text-[#74777d]">{c.lignes.length} article{c.lignes.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={() => charger(pagination.page - 1)} disabled={pagination.page <= 1}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-[#74777d] font-medium">Page {pagination.page} / {pagination.totalPages}</span>
              <button onClick={() => charger(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {!chargement && commandes.length === 0 && !erreur && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ClockArrowDown size={36} className="text-gray-300" />
          </div>
          <p className="text-lg font-bold text-primary">Aucun historique</p>
          <p className="text-sm text-[#74777d]">Vos livraisons terminées apparaîtront ici.</p>
        </div>
      )}

    </DispositionLivreur>
  );
}
