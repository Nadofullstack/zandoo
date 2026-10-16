import { useEffect, useLayoutEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, CheckCheck, Clock, Loader2 } from 'lucide-react';
import type { Message } from '../../types/messagerie';
import CarteProduitMessage from './CarteProduitMessage';
import { formatHeure, libelleJour, memeJourIso } from './messagerieUtils';

interface Props {
  messages: Message[];
  monId?: string;
  aPlus: boolean;
  chargementHistorique: boolean;
  interlocuteurEcrit: boolean;
  nomInterlocuteur: string;
  onChargerHistorique: () => void;
  onRenvoyer: (m: Message) => void;
}

const SEUIL_BAS_PX = 120;

/**
 * Fil de messages : séparateurs de jour, bulles groupées par auteur,
 * statut (envoi, envoyé, lu), historique au défilement vers le haut
 * sans saut de position, défilement automatique vers les nouveaux messages.
 */
export default function FilMessages({
  messages, monId, aPlus, chargementHistorique, interlocuteurEcrit, nomInterlocuteur, onChargerHistorique, onRenvoyer,
}: Props) {
  const conteneur = useRef<HTMLDivElement>(null);
  const hauteurAvantHistorique = useRef<number | null>(null);
  const premierId = messages[0]?._id;
  const dernierId = messages.at(-1)?._id;
  const nombreInitial = useRef(true);

  /* Historique ajouté en haut : on conserve la position de lecture */
  useLayoutEffect(() => {
    const el = conteneur.current;
    if (el && hauteurAvantHistorique.current !== null) {
      el.scrollTop = el.scrollHeight - hauteurAvantHistorique.current;
      hauteurAvantHistorique.current = null;
    }
  }, [premierId]);

  /* Nouveau message en bas : défilement si l'utilisateur est déjà près du bas (ou si c'est le sien) */
  useEffect(() => {
    const el = conteneur.current;
    if (!el || !dernierId) return;
    const dernier = messages.at(-1);
    const presDuBas = el.scrollHeight - el.scrollTop - el.clientHeight < SEUIL_BAS_PX * 3;
    if (nombreInitial.current || presDuBas || dernier?.auteur === monId) {
      el.scrollTo({ top: el.scrollHeight, behavior: nombreInitial.current ? 'auto' : 'smooth' });
      nombreInitial.current = false;
    }
  }, [dernierId, messages, monId]);

  useEffect(() => {
    if (!interlocuteurEcrit) return;
    const el = conteneur.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < SEUIL_BAS_PX) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [interlocuteurEcrit]);

  const surDefilement = () => {
    const el = conteneur.current;
    if (el && el.scrollTop < 80 && aPlus && !chargementHistorique) {
      hauteurAvantHistorique.current = el.scrollHeight;
      onChargerHistorique();
    }
  };

  /* Seul mon dernier message lu porte l'indicateur « Lu » (comme les messageries grand public) */
  const dernierLuId = [...messages].reverse().find((m) => m.auteur === monId && m.luAt)?._id;

  return (
    <div ref={conteneur} onScroll={surDefilement} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-[#F8F9FF]" aria-live="polite">
      {chargementHistorique && <div className="flex justify-center py-2"><Loader2 size={18} className="animate-spin text-gray-400" /></div>}
      {!aPlus && messages.length > 0 && <p className="text-center text-xs text-gray-400 py-3">Début de la conversation</p>}

      {messages.map((m, i) => {
        const precedent = messages[i - 1];
        const suivant = messages[i + 1];
        const deMoi = m.auteur === monId;
        const nouveauJour = !precedent || !memeJourIso(precedent.createdAt, m.createdAt);
        const debutGroupe = nouveauJour || precedent?.auteur !== m.auteur;
        const finGroupe = !suivant || suivant.auteur !== m.auteur || !memeJourIso(suivant.createdAt, m.createdAt);

        return (
          <div key={m._id}>
            {nouveauJour && (
              <div className="flex justify-center my-4">
                <span className="text-[11px] font-semibold text-gray-500 bg-white border border-gray-100 rounded-full px-3 py-1 first-letter:uppercase">{libelleJour(m.createdAt)}</span>
              </div>
            )}
            <motion.div
              initial={m.enAttente || i >= messages.length - 1 ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${deMoi ? 'justify-end' : 'justify-start'} ${debutGroupe ? 'mt-3' : 'mt-0.5'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col gap-1 ${deMoi ? 'items-end' : 'items-start'}`}>
                {m.produit && <CarteProduitMessage produit={m.produit} surFondSombre={deMoi} />}
                {m.texte && (
                  <div
                    className={`px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      deMoi ? 'bg-[#011023] text-white' : 'bg-white text-gray-800 border border-gray-100'
                    } ${deMoi
                      ? `rounded-2xl ${finGroupe ? 'rounded-br-md' : ''}`
                      : `rounded-2xl ${finGroupe ? 'rounded-bl-md' : ''}`} ${m.echec ? 'opacity-60' : ''}`}
                  >
                    {m.texte}
                  </div>
                )}
                {finGroupe && (
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 px-1">
                    {formatHeure(m.createdAt)}
                    {deMoi && (m.echec ? (
                      <button type="button" onClick={() => onRenvoyer(m)} className="inline-flex items-center gap-0.5 text-red-500 font-semibold hover:underline">
                        <AlertCircle size={11} /> Échec — renvoyer
                      </button>
                    ) : m.enAttente ? (
                      <Clock size={11} aria-label="Envoi en cours" />
                    ) : m._id === dernierLuId ? (
                      <span className="inline-flex items-center gap-0.5 text-[#FC7701]"><CheckCheck size={12} /> Lu</span>
                    ) : m.luAt ? (
                      <CheckCheck size={12} className="text-[#FC7701]" aria-label="Lu" />
                    ) : (
                      <Check size={12} aria-label="Envoyé" />
                    ))}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        );
      })}

      {/* Indicateur « en train d'écrire » */}
      <AnimatePresence>
        {interlocuteurEcrit && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 bg-white border border-gray-100 rounded-2xl rounded-bl-md px-3.5 py-3">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </span>
            <span className="text-xs text-gray-400">{nomInterlocuteur} écrit…</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
