import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Produit from '../models/Produit.js';
import Vendeur from '../models/Vendeur.js';
import { emettreA } from '../realtime/socket.js';
import { nomPublic } from './avisService.js';

/**
 * Logique métier de la messagerie acheteur ⇄ boutique.
 * Les contrôleurs valident l'entrée HTTP ; ce service garantit les règles :
 * participants autorisés, produit cohérent avec la boutique, compteurs de non-lus.
 */

export class ErreurMessagerie extends Error {
  constructor(message, status = 422) {
    super(message);
    this.status = status;
  }
}

export const LONGUEUR_MAX_MESSAGE = 2000;

const CHAMPS_PRODUIT = 'nom slug photoCouverture variantesPhotos prix prixPromotionnel vendeur statut';

/** Instantané d'un produit pour une carte dans un message */
const instantaneProduit = (p) => ({
  _id:              p._id,
  nom:              p.nom,
  slug:             p.slug,
  photo:            p.photoCouverture ?? p.variantesPhotos?.[0]?.photos?.[0] ?? null,
  prix:             p.prix,
  prixPromotionnel: p.prixPromotionnel ?? null,
});

/**
 * Forme renvoyée au client pour une conversation, du point de vue de `userId`.
 * L'interlocuteur est la boutique (vue acheteur) ou le client (vue vendeur).
 */
export function versConversationClient(c, userId) {
  const role = c.acheteur?._id
    ? (String(c.acheteur._id) === String(userId) ? 'acheteur' : 'vendeur')
    : (String(c.acheteur) === String(userId) ? 'acheteur' : 'vendeur');

  const interlocuteur = role === 'acheteur'
    ? { nom: c.vendeur?.nomEntreprise ?? 'Boutique', image: c.vendeur?.logo ?? null, slug: c.vendeur?.slug ?? null, type: 'boutique' }
    : { nom: nomPublic(c.acheteur?.fullName), image: c.acheteur?.avatar ?? null, slug: null, type: 'client' };

  return {
    _id:            c._id,
    monRole:        role,
    interlocuteur,
    produit:        c.produit && typeof c.produit === 'object' && c.produit.nom ? instantaneProduit(c.produit) : null,
    dernierMessage: c.dernierMessage?.envoyeAt ? {
      texte:    c.dernierMessage.texte,
      aProduit: c.dernierMessage.aProduit,
      deMoi:    String(c.dernierMessage.auteur) === String(userId),
      envoyeAt: c.dernierMessage.envoyeAt,
    } : null,
    nonLus:    role === 'acheteur' ? c.nonLusAcheteur : c.nonLusVendeur,
    updatedAt: c.updatedAt,
  };
}

/** Recharge une conversation avec ce qu'il faut pour l'affichage */
export const chargerConversation = (id) =>
  Conversation.findById(id)
    .populate('vendeur', 'nomEntreprise logo slug')
    .populate('acheteur', 'fullName avatar')
    .populate('produit', CHAMPS_PRODUIT)
    .lean();

/**
 * Ouvre (ou retrouve) la conversation entre l'acheteur et la boutique d'un produit,
 * ou directement d'une boutique.
 */
export async function ouvrirConversation(acheteurId, { produitId, vendeurId }) {
  let produit = null;
  let vendeur;

  if (produitId) {
    if (!mongoose.isValidObjectId(produitId)) throw new ErreurMessagerie('Produit invalide.');
    produit = await Produit.findById(produitId).select(CHAMPS_PRODUIT).lean();
    if (!produit) throw new ErreurMessagerie('Produit introuvable.', 404);
    vendeurId = produit.vendeur;
  }

  if (!vendeurId || !mongoose.isValidObjectId(vendeurId)) throw new ErreurMessagerie('Boutique invalide.');
  vendeur = await Vendeur.findOne({ _id: vendeurId, statut: 'approuve' }).select('utilisateur').lean();
  if (!vendeur) throw new ErreurMessagerie('Cette boutique ne peut pas être contactée pour le moment.', 404);

  if (String(vendeur.utilisateur) === String(acheteurId)) {
    throw new ErreurMessagerie('Vous ne pouvez pas écrire à votre propre boutique.', 403);
  }

  /* Création atomique : deux clics simultanés ne créent pas deux conversations */
  const conversation = await Conversation.findOneAndUpdate(
    { acheteur: acheteurId, vendeur: vendeur._id },
    {
      $setOnInsert: { acheteur: acheteurId, vendeur: vendeur._id, vendeurUtilisateur: vendeur.utilisateur },
      ...(produit ? { $set: { produit: produit._id } } : {}),
    },
    { upsert: true, returnDocument: 'after' },
  );

  return { conversation, produit };
}

/** Vérifie que l'utilisateur participe à la conversation ; renvoie conversation + rôle. */
export async function verifierParticipant(conversationId, userId) {
  if (!mongoose.isValidObjectId(conversationId)) throw new ErreurMessagerie('Conversation introuvable.', 404);
  const conversation = await Conversation.findById(conversationId);
  const role = conversation?.roleDe(userId);
  if (!role) throw new ErreurMessagerie('Conversation introuvable.', 404);
  return { conversation, role };
}

/**
 * Envoie un message : enregistrement, mise à jour de la conversation,
 * diffusion en temps réel aux deux participants (multi-onglets compris).
 */
export async function envoyerMessage({ conversationId, auteurId, texte = '', produitId }) {
  const { conversation, role } = await verifierParticipant(conversationId, auteurId);

  const contenu = String(texte).trim();
  if (contenu.length > LONGUEUR_MAX_MESSAGE) throw new ErreurMessagerie(`Message trop long (${LONGUEUR_MAX_MESSAGE} caractères maximum).`);

  let produit = null;
  if (produitId) {
    if (!mongoose.isValidObjectId(produitId)) throw new ErreurMessagerie('Produit invalide.');
    const p = await Produit.findById(produitId).select(CHAMPS_PRODUIT).lean();
    /* Une carte produit ne peut concerner que la boutique de la conversation */
    if (!p || String(p.vendeur) !== String(conversation.vendeur)) throw new ErreurMessagerie('Ce produit ne fait pas partie de cette boutique.');
    produit = instantaneProduit(p);
  }

  if (!contenu && !produit) throw new ErreurMessagerie('Le message est vide.');

  const message = await Message.create({
    conversation: conversation._id,
    auteur:       auteurId,
    roleAuteur:   role,
    texte:        contenu,
    produit,
  });

  const champNonLus = role === 'acheteur' ? 'nonLusVendeur' : 'nonLusAcheteur';
  await Conversation.updateOne(
    { _id: conversation._id },
    {
      $set: {
        dernierMessage: { texte: contenu.slice(0, 140), auteur: auteurId, aProduit: !!produit, envoyeAt: message.createdAt },
        ...(produit ? { produit: produit._id } : {}),
      },
      $inc: { [champNonLus]: 1 },
    },
  );

  /* Diffusion : chaque participant reçoit la conversation mise à jour de SON point de vue */
  const misAJour = await chargerConversation(conversation._id);
  const charge = message.toObject();
  for (const participant of [conversation.acheteur, conversation.vendeurUtilisateur]) {
    emettreA(participant, 'message:nouveau', {
      message: charge,
      conversation: versConversationClient(misAJour, participant),
    });
  }

  return { message: charge, conversation: versConversationClient(misAJour, auteurId) };
}

/** Marque comme lus les messages reçus par `userId` et prévient l'autre participant. */
export async function marquerConversationLue(conversationId, userId) {
  const { conversation, role } = await verifierParticipant(conversationId, userId);
  const roleAutre = role === 'acheteur' ? 'vendeur' : 'acheteur';
  const maintenant = new Date();

  await Promise.all([
    Message.updateMany({ conversation: conversation._id, roleAuteur: roleAutre, luAt: null }, { $set: { luAt: maintenant } }),
    Conversation.updateOne({ _id: conversation._id }, { $set: { [role === 'acheteur' ? 'nonLusAcheteur' : 'nonLusVendeur']: 0 } }),
  ]);

  const autre = role === 'acheteur' ? conversation.vendeurUtilisateur : conversation.acheteur;
  emettreA(autre, 'conversation:lue', { conversationId: String(conversation._id), luAt: maintenant });
  emettreA(userId, 'conversation:lue_par_moi', { conversationId: String(conversation._id) });
}

/** Total des messages non lus d'un utilisateur (acheteur et/ou vendeur). */
export async function compterNonLus(userId) {
  const id = new mongoose.Types.ObjectId(String(userId));
  const [resultat] = await Conversation.aggregate([
    { $match: { $or: [{ acheteur: id }, { vendeurUtilisateur: id }] } },
    {
      $group: {
        _id: null,
        acheteur: { $sum: { $cond: [{ $eq: ['$acheteur', id] }, '$nonLusAcheteur', 0] } },
        vendeur:  { $sum: { $cond: [{ $eq: ['$vendeurUtilisateur', id] }, '$nonLusVendeur', 0] } },
      },
    },
  ]);
  return { acheteur: resultat?.acheteur ?? 0, vendeur: resultat?.vendeur ?? 0 };
}
