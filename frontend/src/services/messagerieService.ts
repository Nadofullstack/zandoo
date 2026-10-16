import api from './api';
import type { Conversation, Message, Notification, RoleConversation } from '../types/messagerie';

/* ── Messagerie ───────────────────────────────────────────────────────────── */

export async function getConversations(role: RoleConversation, page = 1) {
  const { data } = await api.get('/messagerie/conversations', { params: { role, page } });
  return data.data as { conversations: Conversation[]; pagination: { total: number; totalPages: number; page: number } };
}

/** Ouvre ou retrouve la conversation avec la boutique d'un produit (ou une boutique). */
export async function demarrerConversation(cible: { produitId?: string; vendeurId?: string }) {
  const { data } = await api.post('/messagerie/conversations', cible);
  return data.data as { conversation: Conversation; produitContexte: string | null };
}

export async function getConversation(id: string) {
  const { data } = await api.get(`/messagerie/conversations/${id}`);
  return data.data.conversation as Conversation;
}

/** Messages du plus ancien au plus récent ; `avant` = curseur pour charger l'historique. */
export async function getMessages(id: string, avant?: string) {
  const { data } = await api.get(`/messagerie/conversations/${id}/messages`, { params: avant ? { avant } : {} });
  return data.data as { messages: Message[]; aPlus: boolean };
}

export async function envoyerMessage(id: string, contenu: { texte?: string; produitId?: string }) {
  const { data } = await api.post(`/messagerie/conversations/${id}/messages`, contenu);
  return data.data as { message: Message; conversation: Conversation };
}

export async function marquerConversationLue(id: string) {
  await api.patch(`/messagerie/conversations/${id}/lue`);
}

export async function getNonLus() {
  const { data } = await api.get('/messagerie/non-lus');
  return data.data as { acheteur: number; vendeur: number };
}

/* ── Notifications ────────────────────────────────────────────────────────── */

export async function getNotifications(page = 1, limite = 10) {
  const { data } = await api.get('/notifications', { params: { page, limite } });
  return data.data as { notifications: Notification[]; nonLues: number; pagination: { totalPages: number } };
}

export async function getNombreNotificationsNonLues() {
  const { data } = await api.get('/notifications/non-lues');
  return data.data.nonLues as number;
}

export async function marquerNotificationLue(id: string) {
  await api.patch(`/notifications/${id}/lue`);
}

export async function toutMarquerLu() {
  await api.patch('/notifications/tout-lire');
}
