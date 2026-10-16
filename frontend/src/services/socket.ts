import { io, type Socket } from 'socket.io-client';
import type { EvenementsServeur } from '../types/messagerie';

/**
 * Connexion temps réel unique pour toute l'application.
 * Authentifiée par le cookie httpOnly de session (withCredentials) : aucun
 * jeton n'est manipulé en JavaScript.
 */

type ClientSocket = Socket<EvenementsServeur, { 'conversation:ecrit': (d: { conversationId: string; ecrit: boolean }) => void }>;

/** L'API est servie sous /api ; le temps réel écoute à la racine du même serveur */
const URL_SERVEUR = new URL(import.meta.env.VITE_API_URL as string).origin;

let socket: ClientSocket | null = null;

export function obtenirSocket(): ClientSocket {
  if (!socket) {
    socket = io(URL_SERVEUR, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnectionDelayMax: 10000,
    });
  }
  return socket;
}

export function deconnecterSocket() {
  socket?.disconnect();
}
