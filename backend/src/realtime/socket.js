import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';

/**
 * Temps réel (Socket.IO).
 *
 *  - Authentification par le même cookie httpOnly que l'API (aucun jeton côté JS).
 *  - Chaque utilisateur rejoint la salle `user:<id>` : le serveur lui adresse
 *    messages, accusés de lecture et notifications via emettreA().
 *  - Événements client → serveur : `conversation:ecrit` (indicateur de saisie).
 *
 * Pour plusieurs instances, brancher l'adaptateur Redis (@socket.io/redis-adapter).
 */

let io = null;

const salleUtilisateur = (userId) => `user:${userId}`;

/** Extrait un cookie de l'en-tête brut (évite une dépendance pour un seul usage) */
const lireCookie = (entete = '', nom) => {
  const paire = entete.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${nom}=`));
  return paire ? decodeURIComponent(paire.slice(nom.length + 1)) : null;
};

export function initialiserTempsReel(serveurHttp) {
  io = new Server(serveurHttp, {
    cors: { origin: env.server.clientUrl || 'http://localhost:5173', credentials: true },
    /* Les clients mobiles en 3G basculent souvent : tolérance plus large que le défaut */
    pingInterval: 25000,
    pingTimeout: 30000,
  });

  /* Authentification à la connexion du socket */
  io.use(async (socket, next) => {
    try {
      const jeton = lireCookie(socket.handshake.headers.cookie, 'token');
      if (!jeton) return next(new Error('non_authentifie'));

      const { id } = jwt.verify(jeton, env.jwt.secret);
      const user = await User.findById(id).select('_id isActive').lean();
      if (!user || !user.isActive) return next(new Error('non_authentifie'));

      socket.data.userId = String(user._id);
      return next();
    } catch {
      return next(new Error('non_authentifie'));
    }
  });

  io.on('connection', (socket) => {
    const { userId } = socket.data;
    socket.join(salleUtilisateur(userId));

    /* « En train d'écrire » : relayé à l'autre participant uniquement */
    socket.on('conversation:ecrit', async ({ conversationId, ecrit } = {}) => {
      try {
        const conversation = await Conversation.findById(conversationId).select('acheteur vendeurUtilisateur');
        const role = conversation?.roleDe(userId);
        if (!role) return;
        const autre = role === 'acheteur' ? conversation.vendeurUtilisateur : conversation.acheteur;
        io.to(salleUtilisateur(autre)).emit('conversation:ecrit', { conversationId, ecrit: !!ecrit });
      } catch {
        /* identifiant invalide : ignoré */
      }
    });
  });

  return io;
}

/** Envoie un événement à toutes les connexions d'un utilisateur (no-op si le temps réel est inactif). */
export function emettreA(userId, evenement, donnees) {
  if (io && userId) io.to(salleUtilisateur(String(userId))).emit(evenement, donnees);
}
