import { useCallback, useEffect, useRef, useState } from 'react';
import * as service from '../../services/messagerieService';
import { useTempsReel } from '../../context/TempsReelContext';
import { lireSession } from '../../services/auth/authService';
import type { Conversation, Message } from '../../types/messagerie';

const DUREE_INDICATEUR_SAISIE_MS = 4000;
const INTERVALLE_SIGNAL_SAISIE_MS = 2500;

/**
 * Fil d'une conversation :
 *  - chargement par pages (du plus récent vers l'historique) ;
 *  - envoi optimiste (le message s'affiche immédiatement, confirmé par l'API) ;
 *  - réception temps réel, accusés de lecture, indicateur « en train d'écrire ».
 */
export function useFilConversation(conversationId: string | undefined) {
  const { socket, rafraichirCompteurs } = useTempsReel();
  const monId = lireSession()?.id;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [aPlus, setAPlus]               = useState(false);
  const [chargement, setChargement]     = useState(true);
  const [chargementHistorique, setChargementHistorique] = useState(false);
  const [erreur, setErreur]             = useState<string | null>(null);
  const [interlocuteurEcrit, setInterlocuteurEcrit] = useState(false);

  const minuteurSaisie = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dernierSignalSaisie = useRef(0);

  const marquerLue = useCallback(() => {
    if (!conversationId || document.visibilityState !== 'visible') return;
    service.marquerConversationLue(conversationId).then(rafraichirCompteurs).catch(() => {});
  }, [conversationId, rafraichirCompteurs]);

  /* Chargement initial */
  useEffect(() => {
    if (!conversationId) return;
    let annule = false;
    const charger = async () => {
      setChargement(true);
      setErreur(null);
      setMessages([]);
      try {
        const [conv, page] = await Promise.all([service.getConversation(conversationId), service.getMessages(conversationId)]);
        if (annule) return;
        setConversation(conv);
        setMessages(page.messages);
        setAPlus(page.aPlus);
        if (conv.nonLus > 0) marquerLue();
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Conversation introuvable.');
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [conversationId, marquerLue]);

  /* Temps réel */
  useEffect(() => {
    if (!conversationId) return;

    const surMessage = ({ message, conversation: conv }: { message: Message; conversation: Conversation }) => {
      if (message.conversation !== conversationId) return;
      setConversation(conv);
      setMessages((liste) => {
        if (liste.some((m) => m._id === message._id)) return liste;
        /* Mon propre message (autre onglet ou écho) : remplace l'éventuel brouillon optimiste */
        if (message.auteur === monId) {
          const i = liste.findIndex((m) => m.enAttente && m.texte === message.texte && (m.produit?._id ?? null) === (message.produit?._id ?? null));
          if (i !== -1) return liste.map((m, j) => (j === i ? message : m));
        }
        return [...liste, message];
      });
      if (message.auteur !== monId) {
        setInterlocuteurEcrit(false);
        marquerLue();
      }
    };

    const surLue = ({ conversationId: id, luAt }: { conversationId: string; luAt: string }) => {
      if (id !== conversationId) return;
      setMessages((liste) => liste.map((m) => (m.auteur === monId && !m.luAt ? { ...m, luAt } : m)));
    };

    const surEcrit = ({ conversationId: id, ecrit }: { conversationId: string; ecrit: boolean }) => {
      if (id !== conversationId) return;
      setInterlocuteurEcrit(ecrit);
      if (minuteurSaisie.current) clearTimeout(minuteurSaisie.current);
      if (ecrit) minuteurSaisie.current = setTimeout(() => setInterlocuteurEcrit(false), DUREE_INDICATEUR_SAISIE_MS);
    };

    /* Retour sur l'onglet : les messages arrivés entre-temps sont marqués lus */
    const surVisibilite = () => { if (document.visibilityState === 'visible') marquerLue(); };

    socket.on('message:nouveau', surMessage);
    socket.on('conversation:lue', surLue);
    socket.on('conversation:ecrit', surEcrit);
    document.addEventListener('visibilitychange', surVisibilite);
    return () => {
      socket.off('message:nouveau', surMessage);
      socket.off('conversation:lue', surLue);
      socket.off('conversation:ecrit', surEcrit);
      document.removeEventListener('visibilitychange', surVisibilite);
      if (minuteurSaisie.current) clearTimeout(minuteurSaisie.current);
    };
  }, [socket, conversationId, monId, marquerLue]);

  /** Charge les messages plus anciens (défilement vers le haut). */
  const chargerHistorique = useCallback(async () => {
    if (!conversationId || !aPlus || chargementHistorique || messages.length === 0) return;
    setChargementHistorique(true);
    try {
      const page = await service.getMessages(conversationId, messages[0].createdAt);
      setMessages((liste) => [...page.messages, ...liste]);
      setAPlus(page.aPlus);
    } finally {
      setChargementHistorique(false);
    }
  }, [conversationId, aPlus, chargementHistorique, messages]);

  /** Envoi optimiste : affichage immédiat, puis remplacement par la version serveur. */
  const envoyer = useCallback(async (texte: string, produit?: Message['produit']) => {
    if (!conversationId || !monId || (!texte.trim() && !produit)) return;
    const idTemporaire = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const brouillon: Message = {
      _id: idTemporaire, conversation: conversationId, auteur: monId, roleAuteur: conversation?.monRole ?? 'acheteur',
      texte: texte.trim(), produit: produit ?? null, luAt: null, createdAt: new Date().toISOString(), enAttente: true,
    };
    setMessages((liste) => [...liste, brouillon]);
    socket.emit('conversation:ecrit', { conversationId, ecrit: false });

    try {
      const { message, conversation: conv } = await service.envoyerMessage(conversationId, { texte: texte.trim(), produitId: produit?._id });
      setConversation(conv);
      setMessages((liste) => {
        /* L'écho temps réel a pu arriver avant la réponse HTTP */
        const sansDoublon = liste.filter((m) => m._id !== message._id);
        return sansDoublon.map((m) => (m._id === idTemporaire ? message : m));
      });
    } catch (e) {
      setMessages((liste) => liste.map((m) => (m._id === idTemporaire ? { ...m, enAttente: false, echec: true } : m)));
      throw e;
    }
  }, [conversationId, monId, conversation?.monRole, socket]);

  /** Renvoie un message en échec. */
  const renvoyer = useCallback((message: Message) => {
    setMessages((liste) => liste.filter((m) => m._id !== message._id));
    return envoyer(message.texte, message.produit);
  }, [envoyer]);

  /** Signale la saisie à l'interlocuteur (au plus toutes les 2,5 s). */
  const signalerSaisie = useCallback(() => {
    if (!conversationId) return;
    const maintenant = Date.now();
    if (maintenant - dernierSignalSaisie.current < INTERVALLE_SIGNAL_SAISIE_MS) return;
    dernierSignalSaisie.current = maintenant;
    socket.emit('conversation:ecrit', { conversationId, ecrit: true });
  }, [conversationId, socket]);

  return {
    monId, conversation, messages, aPlus, chargement, chargementHistorique, erreur, interlocuteurEcrit,
    chargerHistorique, envoyer, renvoyer, signalerSaisie,
  };
}
