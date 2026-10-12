import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, CircleCheck, PackageSearch, RefreshCw, Search, ShoppingBag, X } from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import CarteCommande from '../../components/acheteur/commandes/CarteCommande';
import PaginationCatalogue from '../../components/acheteur/catalogue/PaginationCatalogue';
import { ONGLETS } from '../../components/acheteur/commandes/configCommandes';
import { useMesCommandes } from '../../hooks/acheteur/useMesCommandes';

/**
 * Page « Mes commandes » : historique et suivi des commandes de l'acheteur.
 * Une carte par commande ; un achat multi-boutiques produit plusieurs commandes.
 */
export default function MesCommandesPage() {
  const {
    commandes, compteurs, pagination, chargement, erreur,
    groupe, recherche, saisie, setSaisie,
    changerGroupe, changerPage, reinitialiser, recharger,
  } = useMesCommandes();

  const [params, setParams] = useSearchParams();
  const vientDeCommander = params.get('confirmee') === '1';
  const masquerConfirmation = () =>
    setParams((p) => { const s = new URLSearchParams(p); s.delete('confirmee'); return s; }, { replace: true });

  const filtreActif = !!groupe || !!recherche;
  const aucuneCommande = compteurs?.toutes === 0;

  return (
    <AcheteurLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        {/* Fil d'Ariane + titre */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Link to="/mon-compte" className="hover:text-[#FC7701]">Mon compte</Link>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-medium">Mes commandes</span>
        </nav>
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[#011023]">Mes commandes</h1>
          <p className="text-sm text-gray-500 mt-1">Suivez vos commandes en cours et retrouvez votre historique d'achats.</p>
        </header>

        {/* Confirmation après passage en caisse */}
        {vientDeCommander && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200" role="status">
            <CircleCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-emerald-900">Merci, votre commande a bien été enregistrée !</p>
              <p className="text-emerald-800/80 mt-0.5">
                Chaque boutique traite sa partie séparément : vous trouverez ci-dessous une commande par boutique.
              </p>
            </div>
            <button onClick={masquerConfirmation} className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-lg" aria-label="Masquer">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Onglets + recherche */}
        {!aucuneCommande && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <div role="tablist" className="flex gap-1 p-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
              {ONGLETS.map((o) => {
                const actif = groupe === o.valeur;
                const n = compteurs?.[o.cleCompteur];
                return (
                  <button
                    key={o.libelle}
                    role="tab"
                    aria-selected={actif}
                    onClick={() => changerGroupe(o.valeur)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                      actif ? 'bg-[#011023] text-white shadow-sm' : 'text-gray-600 hover:text-[#011023] hover:bg-gray-50'
                    }`}
                  >
                    {o.libelle}
                    {n !== undefined && (
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-md tabular-nums ${actif ? 'bg-white/15' : 'bg-gray-100 text-gray-500'}`}>
                        {n}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative md:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                placeholder="N° de commande ou produit"
                aria-label="Rechercher une commande"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FC7701] focus:ring-2 focus:ring-[#FC7701]/20"
              />
            </div>
          </div>
        )}

        {/* Contenu */}
        {erreur ? (
          <EtatMessage
            icone={<RefreshCw size={22} className="text-red-500" />}
            titre="Impossible de charger vos commandes"
            texte={erreur}
            action={<button onClick={recharger} className={BOUTON_SECONDAIRE}>Réessayer</button>}
          />
        ) : chargement && commandes.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-white border border-gray-100 animate-pulse" />)}
          </div>
        ) : aucuneCommande ? (
          <EtatMessage
            icone={<ShoppingBag size={22} className="text-[#FC7701]" />}
            titre="Vous n'avez pas encore passé de commande"
            texte="Découvrez les produits des boutiques ZANDOO et passez votre première commande."
            action={<Link to="/catalogue" className={BOUTON_PRINCIPAL}>Découvrir le catalogue</Link>}
          />
        ) : commandes.length === 0 ? (
          <EtatMessage
            icone={<PackageSearch size={22} className="text-gray-400" />}
            titre="Aucune commande ne correspond"
            texte={recherche ? `Aucun résultat pour « ${recherche} ».` : 'Aucune commande dans cette catégorie.'}
            action={filtreActif ? <button onClick={reinitialiser} className={BOUTON_SECONDAIRE}>Voir toutes mes commandes</button> : undefined}
          />
        ) : (
          <>
            <div className={`space-y-4 transition-opacity duration-200 ${chargement ? 'opacity-60' : ''}`}>
              {commandes.map((c) => <CarteCommande key={c._id} commande={c} />)}
            </div>
            {pagination && <PaginationCatalogue pagination={pagination} onChangerPage={changerPage} />}
          </>
        )}
      </div>
    </AcheteurLayout>
  );
}

const BOUTON_PRINCIPAL = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FC7701] hover:bg-[#e06900] transition-colors';
const BOUTON_SECONDAIRE = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#011023] border border-gray-200 bg-white hover:bg-gray-50 transition-colors';

function EtatMessage({ icone, titre, texte, action }: { icone: React.ReactNode; titre: string; texte: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 bg-white rounded-2xl border border-gray-100">
      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-4">{icone}</div>
      <h2 className="text-base font-bold text-[#011023]">{titre}</h2>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">{texte}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
