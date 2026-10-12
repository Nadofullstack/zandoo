import { Link } from 'react-router-dom';
import { ChevronRight, Store } from 'lucide-react';
import type { CommandeResume } from '../../../types/acheteur';
import BadgeStatutCommande from './BadgeStatutCommande';
import VignetteProduit from './VignetteProduit';
import { STATUTS, formatDate, formatPrix, nombreArticles } from './configCommandes';

const LIGNES_VISIBLES = 2;

/** Carte d'une commande (une commande = une boutique) dans la liste « Mes commandes ». */
export default function CarteCommande({ commande }: { commande: CommandeResume }) {
  const lienDetail = `/mes-commandes/${commande._id}`;
  const lignesCachees = commande.lignes.length - LIGNES_VISIBLES;
  const nbArticles = nombreArticles(commande.lignes);

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all overflow-hidden">
      {/* En-tête : boutique, date, numéro, statut */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-gray-50/70 border-b border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
            {commande.vendeur?.logo
              ? <img src={commande.vendeur.logo} alt="" className="w-full h-full object-cover" />
              : <Store size={16} className="text-gray-400" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#011023] truncate">{commande.vendeur?.nomEntreprise ?? 'Boutique'}</p>
            <p className="text-xs text-gray-500">
              {formatDate(commande.createdAt)} · <span className="font-mono">{commande.numero}</span>
            </p>
          </div>
        </div>
        <BadgeStatutCommande statut={commande.statut} />
      </header>

      {/* Contenu : articles + total */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <ul className="flex-1 min-w-0 space-y-3">
          {commande.lignes.slice(0, LIGNES_VISIBLES).map((ligne) => (
            <li key={ligne._id} className="flex items-center gap-3">
              <VignetteProduit ligne={ligne} taille="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{ligne.nomProduit}</p>
                <p className="text-xs text-gray-500">
                  {ligne.quantite} × {formatPrix(ligne.prixUnitaire, commande.devise)}
                  {ligne.variante && <span className="ml-1.5 text-gray-400">· {ligne.variante}</span>}
                </p>
              </div>
            </li>
          ))}
          {lignesCachees > 0 && (
            <li className="text-xs text-gray-500 pl-[60px]">
              + {lignesCachees} autre{lignesCachees > 1 ? 's' : ''} article{lignesCachees > 1 ? 's' : ''}
            </li>
          )}
        </ul>

        <div className="sm:text-right sm:pl-6 sm:border-l border-gray-100 shrink-0">
          <p className="text-xs text-gray-500">{nbArticles} article{nbArticles > 1 ? 's' : ''}</p>
          <p className="text-lg font-black text-[#011023] tabular-nums">{formatPrix(commande.total, commande.devise)}</p>
        </div>
      </div>

      {/* Pied : message d'état + action */}
      <footer className="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 truncate">{STATUTS[commande.statut].description}</p>
        <Link
          to={lienDetail}
          className="inline-flex items-center gap-1 shrink-0 text-sm font-semibold text-[#FC7701] hover:text-[#e06900] transition-colors"
        >
          {['en_attente', 'payee', 'en_preparation', 'expediee'].includes(commande.statut) ? 'Suivre la commande' : 'Voir le détail'}
          <ChevronRight size={16} />
        </Link>
      </footer>
    </article>
  );
}
