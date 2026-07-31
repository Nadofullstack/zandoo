import { useState, useEffect, useCallback } from 'react';
import {
  Truck, MapPin, Package, CheckCircle2,
  AlertCircle, Phone, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react';
import DispositionLivreur from '../../components/livreur/layout/DispositionLivreur';
import {
  getMesLivraisons,
  marquerLivree,
  type CommandeLivreur,
} from '../../services/livreur/livreurDashboardService';

function formatPrix(prix: number) {
  return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/* ── Carte livraison ─────────────────────────────────────────────────────────── */
function CarteLivraison({
  commande, onMarquerLivree, enCours,
}: {
  commande: CommandeLivreur;
  onMarquerLivree: (id: string) => void;
  enCours: boolean;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

      {/* En-tête */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-xl">
            <Package size={16} className="text-accent" />
          </div>
          <div>
            <p className="font-bold text-sm text-primary">{commande.numero}</p>
            <p className="text-xs text-[#74777d]">{formatDate(commande.updatedAt)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-black text-base text-primary">{formatPrix(commande.total)}</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            En livraison
          </span>
        </div>
      </div>

      {/* Corps */}
      <div className="px-5 py-4 space-y-3">

        {/* Adresse */}
        <div className="flex items-start gap-2">
          <MapPin size={15} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-primary">{commande.adresseLivraison.nomComplet}</p>
            {commande.adresseLivraison.rue && (
              <p className="text-xs text-[#74777d]">{commande.adresseLivraison.rue}</p>
            )}
            <p className="text-xs text-[#74777d]">
              {commande.adresseLivraison.ville}
              {commande.adresseLivraison.pays ? `, ${commande.adresseLivraison.pays}` : ''}
            </p>
            {commande.adresseLivraison.instructions && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1 mt-1">
                💬 {commande.adresseLivraison.instructions}
              </p>
            )}
          </div>
        </div>

        {/* Téléphone */}
        {commande.adresseLivraison.telephone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-[#74777d] flex-shrink-0" />
            <a
              href={`tel:${commande.adresseLivraison.telephone}`}
              className="text-sm font-semibold text-accent hover:underline"
            >
              {commande.adresseLivraison.telephone}
            </a>
          </div>
        )}

        {/* Articles */}
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-[#74777d] uppercase tracking-wide mb-2">Articles</p>
          <div className="space-y-1.5">
            {commande.lignes.slice(0, 3).map((l, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                  {l.photoProduit ? (
                    <img src={l.photoProduit} alt={l.nomProduit} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={10} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <span className="text-primary font-medium truncate">{l.nomProduit}</span>
                <span className="ml-auto text-[#74777d] flex-shrink-0">×{l.quantite}</span>
              </div>
            ))}
            {commande.lignes.length > 3 && (
              <p className="text-xs text-[#74777d]">+{commande.lignes.length - 3} autre(s)</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <button
          onClick={() => onMarquerLivree(commande._id)}
          disabled={enCours}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {enCours
            ? <><RefreshCw size={15} className="animate-spin" /> Traitement…</>
            : <><CheckCircle2 size={16} /> Marquer comme livrée</>
          }
        </button>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function MesLivraisonsPage() {
  const [commandes, setCommandes]     = useState<CommandeLivreur[]>([]);
  const [pagination, setPagination]   = useState({ total: 0, page: 1, totalPages: 1, limite: 20 });
  const [chargement, setChargement]   = useState(true);
  const [erreur, setErreur]           = useState<string | null>(null);
  const [actionEnCours, setAction]    = useState<string | null>(null);
  const [succes, setSucces]           = useState<string | null>(null);

  const charger = useCallback(async (page = 1) => {
    setChargement(true); setErreur(null);
    try {
      const rep = await getMesLivraisons(page);
      setCommandes(rep.data.commandes);
      setPagination(rep.data.pagination);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
    } finally { setChargement(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const handleMarquerLivree = async (id: string) => {
    setAction(id); setSucces(null);
    try {
      await marquerLivree(id);
      setSucces('Commande marquée comme livrée.');
      setCommandes((prev) => prev.filter((c) => c._id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      setTimeout(() => setSucces(null), 4000);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur.');
    } finally { setAction(null); }
  };

  return (
    <DispositionLivreur>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Mes livraisons</h1>
          <p className="text-sm text-[#74777d] mt-1">
            {pagination.total > 0
              ? `${pagination.total} livraison${pagination.total > 1 ? 's' : ''} en cours`
              : 'Aucune livraison en cours'}
          </p>
        </div>
        <button
          onClick={() => charger(pagination.page)}
          disabled={chargement}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-[#74777d] hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={chargement ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {succes && (
        <div className="mb-4 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircle2 size={16} /> {succes}
        </div>
      )}
      {erreur && (
        <div className="mb-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} /> {erreur}
        </div>
      )}

      {chargement && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-72 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      )}

      {!chargement && commandes.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {commandes.map((c) => (
              <CarteLivraison key={c._id} commande={c} onMarquerLivree={handleMarquerLivree} enCours={actionEnCours === c._id} />
            ))}
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
            <Truck size={36} className="text-gray-300" />
          </div>
          <p className="text-lg font-bold text-primary">Aucune livraison en cours</p>
          <p className="text-sm text-[#74777d] max-w-xs">Vos livraisons assignées apparaîtront ici.</p>
        </div>
      )}

    </DispositionLivreur>
  );
}
