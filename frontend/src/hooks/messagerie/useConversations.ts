import { useCallback, useEffect, useState } from 'react';
import { getConversations } from '../../services/messagerieService';
import { useTempsReel } from '../../context/TempsReelContext';
import type { Conversation, RoleConversation } from '../../types/messagerie';

/**
 * Liste des conversations d'une boîte (acheteur ou vendeur), maintenue à jour
 * en temps réel : un nouveau message remonte sa conversation en tête de liste.
 */
export function useConversations(role: RoleConversation) {
  const { socket } = useTempsReel();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const { conversations: liste } = await getConversations(role);
        if (!annule) setConversations(liste);
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Impossible de charger vos conversations.');
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [role]);

  useEffect(() => {
    /* Conversation mise à jour (vue de mon point de vue par le serveur) → en tête de liste */
    const surMessage = ({ conversation }: { conversation: Conversation }) => {
      if (conversation.monRole !== role) return;
      setConversations((liste) => [conversation, ...liste.filter((c) => c._id !== conversation._id)]);
    };
    const surLueParMoi = ({ conversationId }: { conversationId: string }) =>
      setConversations((liste) => liste.map((c) => (c._id === conversationId ? { ...c, nonLus: 0 } : c)));

    socket.on('message:nouveau', surMessage);
    socket.on('conversation:lue_par_moi', surLueParMoi);
    return () => {
      socket.off('message:nouveau', surMessage);
      socket.off('conversation:lue_par_moi', surLueParMoi);
    };
  }, [socket, role]);

  /** Insère/actualise une conversation (ex. : ouverte depuis le bouton « Discuter ») */
  const integrer = useCallback((conversation: Conversation) =>
    setConversations((liste) => (liste.some((c) => c._id === conversation._id) ? liste : [conversation, ...liste])), []);

  return { conversations, chargement, erreur, integrer };
}
