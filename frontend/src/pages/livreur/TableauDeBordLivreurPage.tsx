import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, CheckCircle2, Star, MapPin, ArrowRight, Package, RefreshCw, AlertCircle } from 'lucide-react';
import DispositionLivreur from '../../components/livreur/layout/DispositionLivreur';
import { lireSession } from '../../services/auth/authService';
import {
  getTableauDeBord,
  type StatistiquesLivreur,
  type CommandeLivreur,
} from '../../services/livreur/livreurDashboardService';

function formatPrix(prix: number) {
  return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

/* ── Carte stat ─────────────────────────────────────────────────────────────── */
function CarteStat({
  titre, valeur, icone: Icone, variante, sous,
}: {
  titre: string;
  valeur: number;
  icone: typeof Truck;
  variante: 'accent' | 'success' | 'primary';
  sous?: string;
}) {
  const styles = {
    accent:  'bg-accent text-white',
    success: 'bg-green-500 text-white',
    primary: 'bg-primary text-white',
  };

  return (
    <div className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-xl ${styles[variante]}`}>
        <Icone size={22} />
      </div>
      <div>
        <p className="text-2xl font-black text-primary">{valeur}</p>
        <p className="text-sm font-semibold text-[#74777d]">{titre}</p>
        {sous && <p className="text-xs text-gray-400 mt-0.5">{sous}</p>}
      </div>
    </div>
  );
}

/* ── Ligne livraison ────────────────────────────────────────────────────────── */
function LigneLivraison({ commande }: { commande: CommandeLivreur }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-gray-100 hover:border-accent/30 hover:shadow-sm transition-all">
      <div className="p-2.5 bg-accent/10 rounded-xl flex-shrink-0">
        <Package size={18} className="text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-sm text-primary">{commande.numero}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            En cours
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#74777d]">
          <MapPin size={11} />
          <span className="truncate">
            {commande.adresseLivraison.ville}
            {commande.adresseLivraison.rue ? ` — ${commande.adresseLivraison.rue}` : ''}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(commande.updatedAt)}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-sm text-primary">{formatPrix(commande.total)}</p>
        <p className="text-xs text-gray-400">{commande.lignes.length} article{commande.lignes.length > 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function TableauDeBordLivreurPage() {
  const session = lireSession();
  const [stats, setStats]         = useState<StatistiquesLivreur | null>(null);
  const [livraisons, setLivraisons] = useState<CommandeLivreur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]         = useState<string | null>(null);

  const charger = async () => {
    setChargement(true);
    setErreur(null);
    try {
      const rep = await getTableauDeBord();
      setStats(rep.data.statistiques);
      setLivraisons(rep.data.livraisonsAujourdhui);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const heure = new Date().getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <DispositionLivreur>

      {/* En-tête */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[#74777d] text-sm mb-1">{salutation},</p>
          <h1 className="text-2xl font-black text-primary">{session?.fullName ?? 'Livreur'} 👋</h1>
          <p className="text-sm text-[#74777d] mt-1">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={charger}
          disabled={chargement}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-[#74777d] hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={chargement ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Erreur */}
      {erreur && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} /> {erreur}
        </div>
      )}

      {/* Statistiques */}
      {chargement ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <CarteStat titre="En cours"           valeur={stats?.enCours ?? 0}          icone={Truck}        variante="accent"  sous="Livraisons actives"  />
          <CarteStat titre="Livrées aujourd'hui" valeur={stats?.livreesAujourdhui ?? 0} icone={CheckCircle2} variante="success" sous="Cette journée"        />
          <CarteStat titre="Total livrées"       valeur={stats?.livrees ?? 0}           icone={Star}         variante="primary" sous="Depuis le début"      />
        </div>
      )}

      {/* Livraisons récentes */}
      <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-primary text-base">Livraisons en cours</h2>
            <p className="text-xs text-[#74777d]">5 les plus récentes</p>
          </div>
          <Link
            to="/livreur/mes-livraisons"
            className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
          >
            Voir tout <ArrowRight size={13} />
          </Link>
        </div>

        <div className="p-4">
          {chargement ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}
            </div>
          ) : livraisons.length > 0 ? (
            <div className="space-y-3">
              {livraisons.map((l) => <LigneLivraison key={l._id} commande={l} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Truck size={24} className="text-gray-300" />
              </div>
              <p className="font-semibold text-primary">Aucune livraison en cours</p>
              <p className="text-sm text-[#74777d]">Vos nouvelles livraisons apparaîtront ici.</p>
            </div>
          )}
        </div>
      </div>

    </DispositionLivreur>
  );
}
