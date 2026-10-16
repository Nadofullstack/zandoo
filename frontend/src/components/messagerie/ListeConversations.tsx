import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessagesSquare, Package, Search } from 'lucide-react';
import type { Conversation } from '../../types/messagerie';
import Avatar from './Avatar';
import { horodatageListe } from './messagerieUtils';

interface Props {
  conversations: Conversation[];
  chargement: boolean;
  actifId?: string;
  basePath: string;
  /** Texte de l'état vide (diffère côté acheteur et côté vendeur) */
  messageVide: string;
}

/** Liste des conversations : recherche locale, aperçu du dernier message, non-lus. */
export default function ListeConversations({ conversations, chargement, actifId, basePath, messageVide }: Props) {
  const [recherche, setRecherche] = useState('');
  const terme = recherche.trim().toLowerCase();
  const filtrees = terme
    ? conversations.filter((c) => c.interlocuteur.nom.toLowerCase().includes(terme) || c.produit?.nom.toLowerCase().includes(terme))
    : conversations;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher"
            aria-label="Rechercher une conversation"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-transparent text-sm focus:outline-none focus:bg-white focus:border-[#FC7701]/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chargement ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-50 animate-pulse" />)}
          </div>
        ) : filtrees.length === 0 ? (
          <div className="flex flex-col items-center text-center px-6 py-12">
            <MessagesSquare size={28} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">{terme ? 'Aucune conversation trouvée.' : messageVide}</p>
          </div>
        ) : (
          <ul>
            {filtrees.map((c) => {
              const actif = c._id === actifId;
              const apercu = c.dernierMessage
                ? `${c.dernierMessage.deMoi ? 'Vous : ' : ''}${c.dernierMessage.texte || (c.dernierMessage.aProduit ? 'Produit partagé' : '')}`
                : 'Nouvelle conversation';
              return (
                <li key={c._id}>
                  <Link
                    to={`${basePath}/${c._id}`}
                    aria-current={actif ? 'page' : undefined}
                    className={`flex items-center gap-3 px-4 py-3 border-l-[3px] transition-colors ${
                      actif ? 'bg-orange-50/60 border-[#FC7701]' : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <Avatar nom={c.interlocuteur.nom} image={c.interlocuteur.image} type={c.interlocuteur.type} />
                    <span className="flex-1 min-w-0">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={`text-sm truncate ${c.nonLus ? 'font-bold text-[#011023]' : 'font-semibold text-gray-800'}`}>{c.interlocuteur.nom}</span>
                        {c.dernierMessage && <span className={`text-[11px] shrink-0 ${c.nonLus ? 'text-[#FC7701] font-semibold' : 'text-gray-400'}`}>{horodatageListe(c.dernierMessage.envoyeAt)}</span>}
                      </span>
                      <span className="flex items-center justify-between gap-2 mt-0.5">
                        <span className={`text-xs truncate flex items-center gap-1 ${c.nonLus ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                          {c.dernierMessage?.aProduit && <Package size={12} className="shrink-0" />}
                          {apercu}
                        </span>
                        {c.nonLus > 0 && (
                          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#FC7701] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            {c.nonLus > 99 ? '99+' : c.nonLus}
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
