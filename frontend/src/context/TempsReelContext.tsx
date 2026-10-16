import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { obtenirSocket } from '../services/socket';
import { getNombreNotificationsNonLues, getNonLus } from '../services/messagerieService';
import { lireSession } from '../services/auth/authService';
import type { Notification } from '../types/messagerie';

interface ContexteTempsReel {
  /** Socket partagé (connecté uniquement si l'utilisateur est authentifié) */
  socket: ReturnType<typeof obtenirSocket>;
  connecte: boolean;
  /** Messages non lus, séparés entre boîte acheteur et boîte vendeur */
  messagesNonLus: { acheteur: number; vendeur: number };
  notificationsNonLues: number;
  rafraichirCompteurs: () => void;
  /** Mise à jour locale après lecture (évite un aller-retour serveur) */
  ajusterNotificationsNonLues: (delta: number | 'zero') => void;
}

const TempsReelContext = createContext<ContexteTempsReel | null>(null);

/**
 * Temps réel de l'application : connexion Socket.IO, badges (messages et
 * notifications) et toast d'arrivée des notifications.
 */
export function TempsReelProvider({ children }: { children: ReactNode }) {
  const socket = obtenirSocket();
  const navigate = useNavigate();
  const estConnecte = !!lireSession();

  const [connecte, setConnecte] = useState(false);
  const [messagesNonLus, setMessagesNonLus] = useState({ acheteur: 0, vendeur: 0 });
  const [notificationsNonLues, setNotificationsNonLues] = useState(0);
  const [toast, setToast] = useState<Notification | null>(null);
  const minuteurCompteurs = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Rafraîchissement regroupé : plusieurs événements rapprochés → une seule requête */
  const rafraichirCompteurs = useCallback(() => {
    if (minuteurCompteurs.current) clearTimeout(minuteurCompteurs.current);
    minuteurCompteurs.current = setTimeout(() => {
      getNonLus().then(setMessagesNonLus).catch(() => {});
      getNombreNotificationsNonLues().then(setNotificationsNonLues).catch(() => {});
    }, 250);
  }, []);

  useEffect(() => {
    if (!estConnecte) return;

    const surConnexion = () => { setConnecte(true); rafraichirCompteurs(); };
    const surDeconnexion = () => setConnecte(false);
    const surMessage = () => rafraichirCompteurs();
    const surNotification = (n: Notification) => {
      setNotificationsNonLues((v) => v + 1);
      setToast(n);
    };

    socket.on('connect', surConnexion);
    socket.on('disconnect', surDeconnexion);
    socket.on('message:nouveau', surMessage);
    socket.on('conversation:lue_par_moi', surMessage);
    socket.on('notification:nouvelle', surNotification);
    socket.connect();

    return () => {
      socket.off('connect', surConnexion);
      socket.off('disconnect', surDeconnexion);
      socket.off('message:nouveau', surMessage);
      socket.off('conversation:lue_par_moi', surMessage);
      socket.off('notification:nouvelle', surNotification);
      socket.disconnect();
    };
  }, [estConnecte, socket, rafraichirCompteurs]);

  /* Disparition automatique du toast */
  useEffect(() => {
    if (!toast) return;
    const minuteur = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(minuteur);
  }, [toast]);

  const ajusterNotificationsNonLues = useCallback((delta: number | 'zero') => {
    setNotificationsNonLues((v) => (delta === 'zero' ? 0 : Math.max(0, v + delta)));
  }, []);

  return (
    <TempsReelContext.Provider
      value={{
        socket,
        connecte: estConnecte && connecte,
        messagesNonLus: estConnecte ? messagesNonLus : { acheteur: 0, vendeur: 0 },
        notificationsNonLues: estConnecte ? notificationsNonLues : 0,
        rafraichirCompteurs,
        ajusterNotificationsNonLues,
      }}
    >
      {children}

      {/* Toast d'arrivée d'une notification */}
      <div className="fixed bottom-4 left-4 right-4 sm:right-auto z-[70] pointer-events-none" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast._id}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="pointer-events-auto sm:w-96 flex items-start gap-3 bg-[#011023] text-white rounded-2xl shadow-2xl shadow-black/30 p-4"
            >
              <span className="w-9 h-9 rounded-xl bg-[#FC7701]/20 text-[#FC7701] flex items-center justify-center shrink-0"><Bell size={17} /></span>
              <button
                type="button"
                className="flex-1 min-w-0 text-left"
                onClick={() => { if (toast.lien) navigate(toast.lien); setToast(null); }}
              >
                <p className="text-sm font-semibold truncate">{toast.titre}</p>
                {toast.contenu && <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{toast.contenu}</p>}
              </button>
              <button type="button" onClick={() => setToast(null)} className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10" aria-label="Fermer">
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TempsReelContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTempsReel(): ContexteTempsReel {
  const ctx = useContext(TempsReelContext);
  if (!ctx) throw new Error('useTempsReel doit être utilisé dans <TempsReelProvider>.');
  return ctx;
}
