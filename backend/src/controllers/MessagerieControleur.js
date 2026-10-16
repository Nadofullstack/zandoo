import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import {
  ErreurMessagerie,
  chargerConversation,
  compterNonLus,
  envoyerMessage,
  marquerConversationLue,
  ouvrirConversation,
  verifierParticipant,
  versConversationClient,
} from '../services/messagerieService.js';

/**
 * Messagerie acheteur ⇄ boutique — /api/messagerie (utilisateur connecté).
 * Un même compte peut être acheteur et vendeur : `role` sépare les deux boîtes.
 */

const gererErreur = (res, erreur, contexte) => {
  if (erreur instanceof ErreurMessagerie) return res.status(erreur.status).json({ success: false, message: erreur.message });
  console.error(`Erreur ${contexte}:`, erreur);
  return res.status(500).json({ success: false, message: 'Erreur serveur.' });
};

/* GET /conversations?role=acheteur|vendeur&page=1 */
export const getConversations = async (req, res) => {
  try {
    const role   = req.query.role === 'vendeur' ? 'vendeur' : 'acheteur';
    const page   = Math.max(1, Number(req.query.page) || 1);
    const limite = Math.min(50, Math.max(1, Number(req.query.limite) || 30));
    const filtre = role === 'acheteur' ? { acheteur: req.user._id } : { vendeurUtilisateur: req.user._id };

    /* Une conversation ouverte sans message n'apparaît pas dans la liste */
    filtre['dernierMessage.envoyeAt'] = { $ne: null };

    const [conversations, total] = await Promise.all([
      Conversation.find(filtre)
        .sort({ 'dernierMessage.envoyeAt': -1 })
        .skip((page - 1) * limite)
        .limit(limite)
        .populate('vendeur', 'nomEntreprise logo slug')
        .populate('acheteur', 'fullName avatar')
        .populate('produit', 'nom slug photoCouverture variantesPhotos prix prixPromotionnel')
        .lean(),
      Conversation.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        conversations: conversations.map((c) => versConversationClient(c, req.user._id)),
        pagination: { total, page, limite, totalPages: Math.ceil(total / limite) },
      },
    });
  } catch (erreur) {
    return gererErreur(res, erreur, 'getConversations');
  }
};

/* POST /conversations   { produitId } ou { vendeurId } — ouvre ou retrouve la conversation */
export const demarrerConversation = async (req, res) => {
  try {
    const { conversation, produit } = await ouvrirConversation(req.user._id, req.body ?? {});
    const complete = await chargerConversation(conversation._id);
    return res.status(200).json({
      success: true,
      data: {
        conversation: versConversationClient(complete, req.user._id),
        produitContexte: produit ? String(produit._id) : null,
      },
    });
  } catch (erreur) {
    return gererErreur(res, erreur, 'demarrerConversation');
  }
};

/* GET /conversations/:id */
export const getConversation = async (req, res) => {
  try {
    await verifierParticipant(req.params.id, req.user._id);
    const conversation = await chargerConversation(req.params.id);
    return res.status(200).json({ success: true, data: { conversation: versConversationClient(conversation, req.user._id) } });
  } catch (erreur) {
    return gererErreur(res, erreur, 'getConversation');
  }
};

/* GET /conversations/:id/messages?avant=<ISO>&limite=30 — pagination par curseur (du plus récent) */
export const getMessages = async (req, res) => {
  try {
    const { conversation } = await verifierParticipant(req.params.id, req.user._id);
    const limite = Math.min(50, Math.max(1, Number(req.query.limite) || 30));

    const filtre = { conversation: conversation._id };
    const avant = req.query.avant ? new Date(String(req.query.avant)) : null;
    if (avant && !Number.isNaN(avant.getTime())) filtre.createdAt = { $lt: avant };

    const messages = await Message.find(filtre).sort({ createdAt: -1 }).limit(limite + 1).lean();
    const aPlus = messages.length > limite;

    return res.status(200).json({
      success: true,
      data: { messages: messages.slice(0, limite).reverse(), aPlus },
    });
  } catch (erreur) {
    return gererErreur(res, erreur, 'getMessages');
  }
};

/* POST /conversations/:id/messages   { texte?, produitId? } */
export const posterMessage = async (req, res) => {
  try {
    const resultat = await envoyerMessage({
      conversationId: req.params.id,
      auteurId:       req.user._id,
      texte:          req.body?.texte ?? '',
      produitId:      req.body?.produitId,
    });
    return res.status(201).json({ success: true, data: resultat });
  } catch (erreur) {
    return gererErreur(res, erreur, 'posterMessage');
  }
};

/* PATCH /conversations/:id/lue */
export const marquerLue = async (req, res) => {
  try {
    await marquerConversationLue(req.params.id, req.user._id);
    return res.status(200).json({ success: true });
  } catch (erreur) {
    return gererErreur(res, erreur, 'marquerLue');
  }
};

/* GET /non-lus — compteurs pour les badges { acheteur, vendeur } */
export const getNonLus = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: await compterNonLus(req.user._id) });
  } catch (erreur) {
    return gererErreur(res, erreur, 'getNonLus');
  }
};

