import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MessagesSquare, Store } from 'lucide-react';
import { useConversations } from '../../hooks/messagerie/useConversations';
import { useFilConversation } from '../../hooks/messagerie/useFilConversation';
import { useTempsReel } from '../../context/TempsReelContext';
import type { ProduitMessage, RoleConversation } from '../../types/messagerie';
import ListeConversations from './ListeConversations';
import FilMessages from './FilMessages';
import ZoneSaisie from './ZoneSaisie';
import Avatar from './Avatar';
import CarteProduitMessage from './CarteProduitMessage';
import { SUGGESTIONS_ACHETEUR } from './messagerieUtils';

interface Props {
  role: RoleConversation;
  /** Racine des URL de conversation (/messages ou /vendeur/messages) */
  basePath: string;
  conversationId?: string;
  /** Classes de hauteur du conteneur (dépend de la mise en page hôte) */
  hauteur?: string;
}

/**
 * Messagerie complète en deux panneaux (liste + fil), partagée entre l'espace
 * acheteur et l'espace vendeur. Sur mobile, un seul panneau à la fois.
 */
export default function VueMessagerie({ role, basePath, conversationId, hauteur = 'h-[calc(100vh-10rem)]' }: Props) {
  const liste = useConversations(role);
  const fil = useFilConversation(conversationId);
  const { connecte } = useTempsReel();
  const [params, setParams] = useSearchParams();

  /* La conversation ouverte (même sans message) doit figurer dans la liste */
  const { integrer } = liste;
  useEffect(() => {
    if (fil.conversation && fil.conversation.monRole === role) integrer(fil.conversation);
  }, [fil.conversation, role, integrer]);

  /* Produit joint : arrivée depuis « Discuter » (?produit=<id>) */
  const idProduitJoint = params.get('produit');
  const produitJoint: ProduitMessage | null =
    idProduitJoint && fil.conversation?.produit?._id === idProduitJoint ? fil.conversation.produit : null;
  const retirerProduit = () => setParams((p) => { const s = new URLSearchParams(p); s.delete('produit'); return s; }, { replace: true });

  const envoyer = async (texte: string, produit?: ProduitMessage) => {
    await fil.envoyer(texte, produit);
    if (produit) retirerProduit();
  };

  const interlocuteur = fil.conversation?.interlocuteur;
  const premiereFois = !fil.chargement && fil.messages.length === 0;

  return (
    <div className={`${hauteur} min-h-[480px] bg-white rounded-2xl border border-gray-100 overflow-hidden flex`}>
      {/* ── Liste ────────────────────────────────────────────────────────── */}
      <aside className={`${conversationId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 shrink-0 flex-col border-r border-gray-100`}>
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-black text-[#011023]">Messages</h2>
          <span className={`flex items-center gap-1.5 text-[11px] ${connecte ? 'text-emerald-600' : 'text-gray-400'}`} title={connecte ? 'Temps réel actif' : 'Reconnexion…'}>
            <span className={`w-2 h-2 rounded-full ${connecte ? 'bg-emerald-500' : 'bg-gray-300'}`} /> {connecte ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>
        <ListeConversations
          conversations={liste.conversations}
          chargement={liste.chargement}
          actifId={conversationId}
          basePath={basePath}
          messageVide={role === 'acheteur'
            ? 'Aucune conversation. Cliquez sur « Discuter » depuis un produit pour contacter une boutique.'
            : 'Aucun message pour le moment. Les clients peuvent vous écrire depuis vos produits.'}
        />
      </aside>

      {/* ── Fil ──────────────────────────────────────────────────────────── */}
      <section className={`${conversationId ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col`}>
        {!conversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-[#F8F9FF]">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4"><MessagesSquare size={28} className="text-[#FC7701]" /></div>
            <p className="text-base font-bold text-[#011023]">Sélectionnez une conversation</p>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">Vos échanges avec {role === 'acheteur' ? 'les boutiques' : 'vos clients'} apparaissent ici en temps réel.</p>
          </div>
        ) : fil.erreur ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <p className="text-sm text-gray-600">{fil.erreur}</p>
            <Link to={basePath} className="mt-4 text-sm font-semibold text-[#FC7701] hover:underline">Retour aux messages</Link>
          </div>
        ) : (
          <>
            {/* En-tête */}
            <header className="flex items-center gap-3 px-3 sm:px-5 py-3 border-b border-gray-100">
              <Link to={basePath} className="md:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Retour aux conversations">
                <ArrowLeft size={18} />
              </Link>
              {interlocuteur ? (
                <>
                  <Avatar nom={interlocuteur.nom} image={interlocuteur.image} type={interlocuteur.type} taille="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#011023] truncate">{interlocuteur.nom}</p>
                    <p className="text-xs text-gray-400">{fil.interlocuteurEcrit ? <span className="text-[#FC7701]">écrit…</span> : interlocuteur.type === 'boutique' ? 'Boutique' : 'Client'}</p>
                  </div>
                  {interlocuteur.type === 'boutique' && interlocuteur.slug && (
                    <Link to={`/boutique/${interlocuteur.slug}`} className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-1.5">
                      <Store size={14} /> Voir la boutique
                    </Link>
                  )}
                </>
              ) : (
                <div className="h-9 w-48 rounded-lg bg-gray-100 animate-pulse" />
              )}
            </header>

            {/* Produit en discussion */}
            {fil.conversation?.produit && !produitJoint && (
              <div className="px-3 sm:px-5 py-2 border-b border-gray-100 bg-white">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Produit en discussion</p>
                <CarteProduitMessage produit={fil.conversation.produit} />
              </div>
            )}

            {fil.chargement ? (
              <div className="flex-1 bg-[#F8F9FF] p-6 space-y-3">
                {[0, 1, 2].map((i) => <div key={i} className={`h-10 rounded-2xl bg-white animate-pulse ${i % 2 ? 'ml-auto w-1/2' : 'w-2/3'}`} />)}
              </div>
            ) : premiereFois ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-[#F8F9FF]">
                <p className="text-sm font-semibold text-[#011023]">Démarrez la conversation avec {interlocuteur?.nom}</p>
                <p className="text-xs text-gray-500 mt-1">Posez vos questions sur le produit, la livraison ou les quantités.</p>
              </div>
            ) : (
              <FilMessages
                messages={fil.messages}
                monId={fil.monId}
                aPlus={fil.aPlus}
                chargementHistorique={fil.chargementHistorique}
                interlocuteurEcrit={fil.interlocuteurEcrit}
                nomInterlocuteur={interlocuteur?.nom ?? ''}
                onChargerHistorique={fil.chargerHistorique}
                onRenvoyer={fil.renvoyer}
              />
            )}

            <ZoneSaisie
              onEnvoyer={envoyer}
              onSaisie={fil.signalerSaisie}
              produitJoint={produitJoint}
              onRetirerProduit={retirerProduit}
              suggestions={role === 'acheteur' && premiereFois ? SUGGESTIONS_ACHETEUR : []}
              desactive={fil.chargement || !fil.conversation}
            />
          </>
        )}
      </section>
    </div>
  );
}
