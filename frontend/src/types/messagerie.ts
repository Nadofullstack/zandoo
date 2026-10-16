/* ─── Types — messagerie et notifications (communs acheteur / vendeur) ─── */

export type RoleConversation = 'acheteur' | 'vendeur';

export interface ProduitMessage {
  _id: string;
  nom: string;
  slug: string;
  photo: string | null;
  prix: number;
  prixPromotionnel: number | null;
}

export interface Conversation {
  _id: string;
  monRole: RoleConversation;
  interlocuteur: { nom: string; image: string | null; slug: string | null; type: 'boutique' | 'client' };
  /** Dernier produit évoqué (contexte affiché en tête du fil) */
  produit: ProduitMessage | null;
  dernierMessage: { texte: string; aProduit: boolean; deMoi: boolean; envoyeAt: string } | null;
  nonLus: number;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  auteur: string;
  roleAuteur: RoleConversation;
  texte: string;
  produit: ProduitMessage | null;
  luAt: string | null;
  createdAt: string;
  /** Côté client uniquement : message en cours d'envoi (affichage optimiste) */
  enAttente?: boolean;
  /** Côté client uniquement : l'envoi a échoué */
  echec?: boolean;
}

export type TypeNotification =
  | 'commande_nouvelle'
  | 'commande_statut'
  | 'commande_annulee'
  | 'avis_nouveau'
  | 'avis_reponse'
  | 'systeme';

export interface Notification {
  _id: string;
  type: TypeNotification;
  titre: string;
  contenu: string;
  lien: string;
  luAt: string | null;
  createdAt: string;
}

/** Événements Socket.IO reçus du serveur */
export interface EvenementsServeur {
  'message:nouveau': (donnees: { message: Message; conversation: Conversation }) => void;
  'conversation:lue': (donnees: { conversationId: string; luAt: string }) => void;
  'conversation:lue_par_moi': (donnees: { conversationId: string }) => void;
  'conversation:ecrit': (donnees: { conversationId: string; ecrit: boolean }) => void;
  'notification:nouvelle': (notification: Notification) => void;
}
