import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User } from 'lucide-react';
import type { MessageTicket } from '../../../types/admin';

interface FilDiscussionProps {
  messages: MessageTicket[];
  chargementEnvoi: boolean;
  onEnvoyer: (contenu: string) => void;
}

/**
 * Fil de discussion d'un ticket — affiche les messages et le champ de réponse.
 */
export default function FilDiscussion({ messages, chargementEnvoi, onEnvoyer }: FilDiscussionProps) {
  const [contenu, setContenu] = useState('');
  const bas = useRef<HTMLDivElement>(null);

  /* Scroll automatique vers le bas à chaque nouveau message */
  useEffect(() => {
    bas.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleEnvoyer = () => {
    const texte = contenu.trim();
    if (!texte) return;
    onEnvoyer(texte);
    setContenu('');
  };

  const handleTouche = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnvoyer();
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Liste des messages */}
      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[#74777d] py-6">
            Aucun message pour l'instant.
          </p>
        )}

        {messages.map((msg) => {
          const estAdmin = msg.roleAuteur === 'admin';

          return (
            <div
              key={msg._id}
              className={`flex gap-3 ${estAdmin ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold
                ${estAdmin ? 'bg-accent' : 'bg-primary/20 text-primary'}`}
              >
                {msg.auteur?.fullName?.charAt(0).toUpperCase() ?? <User size={14} />}
              </div>

              {/* Bulle */}
              <div className={`max-w-[75%] ${estAdmin ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${estAdmin
                    ? 'bg-accent text-white rounded-tr-sm'
                    : 'bg-gray-100 text-primary rounded-tl-sm'
                  }`}
                >
                  {msg.contenu}
                </div>
                <p className="text-xs text-gray-400">
                  {msg.auteur?.fullName ?? '—'}
                  {' · '}
                  {new Date(msg.createdAt).toLocaleString('fr-FR', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bas} />
      </div>

      {/* Champ de réponse */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex gap-3 items-end">
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            onKeyDown={handleTouche}
            rows={3}
            maxLength={2000}
            placeholder="Écrire une réponse… (Entrée pour envoyer, Maj+Entrée pour sauter une ligne)"
            disabled={chargementEnvoi}
            className="flex-1 px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none disabled:opacity-50"
          />
          <button
            onClick={handleEnvoyer}
            disabled={!contenu.trim() || chargementEnvoi}
            aria-label="Envoyer le message"
            className="p-3 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {chargementEnvoi
              ? <Loader2 size={18} className="animate-spin" />
              : <Send size={18} />
            }
          </button>
        </div>
        <p className="text-right text-xs text-gray-400 mt-1">{contenu.length}/2000</p>
      </div>
    </div>
  );
}
