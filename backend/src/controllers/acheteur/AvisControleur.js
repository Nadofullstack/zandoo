import mongoose from 'mongoose';
import Avis from '../../models/Avis.js';
import Produit from '../../models/Produit.js';
import {
  recalculerNoteProduitSansErreur,
  resumeNotesProduit,
  trouverCommandeLivree,
  versAvisPublic,
} from '../../services/avisService.js';

const TRIS = {
  recents:      { createdAt: -1 },
  note_haute:   { note: -1, createdAt: -1 },
  note_basse:   { note: 1, createdAt: -1 },
};

const erreurServeur = (res, contexte, erreur) => {
  console.error(`Erreur ${contexte}:`, erreur);
  return res.status(500).json({ success: false, message: 'Erreur serveur.' });
};

/** Normalise les champs saisis par l'acheteur. Lève une Error lisible si invalides. */
const lireSaisie = (corps, { partiel = false } = {}) => {
  const saisie = {};
  if (corps.note !== undefined || !partiel) {
    const note = Number(corps.note);
    if (!Number.isInteger(note) || note < 1 || note > 5) throw new Error('Choisissez une note de 1 à 5 étoiles.');
    saisie.note = note;
  }
  if (corps.titre !== undefined)       saisie.titre = String(corps.titre).trim().slice(0, 100);
  if (corps.commentaire !== undefined) saisie.commentaire = String(corps.commentaire).trim().slice(0, 1000);
  return saisie;
};

/* ═══ Public ═════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/produits/:produitId/avis?page=1&note=5&tri=recents
   Avis publiés d'un produit + résumé des notes. Accessible sans connexion.
───────────────────────────────────────────────────────────────────────────── */
export const getAvisProduit = async (req, res) => {
  try {
    const { produitId } = req.params;
    if (!mongoose.isValidObjectId(produitId)) {
      return res.status(422).json({ success: false, message: 'Produit invalide.' });
    }

    const page   = Math.max(1, Number(req.query.page) || 1);
    const limite = Math.min(20, Math.max(1, Number(req.query.limite) || 5));
    const note   = Number(req.query.note);

    const filtre = { produit: produitId, statut: 'publie' };
    if (Number.isInteger(note) && note >= 1 && note <= 5) filtre.note = note;

    const [avis, total, resume] = await Promise.all([
      Avis.find(filtre)
        .sort(TRIS[req.query.tri] ?? TRIS.recents)
        .skip((page - 1) * limite)
        .limit(limite)
        .populate('acheteur', 'fullName')
        .lean(),
      Avis.countDocuments(filtre),
      resumeNotesProduit(produitId),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        avis: avis.map(versAvisPublic),
        resume,
        pagination: { total, page, limite, totalPages: Math.ceil(total / limite) },
      },
    });
  } catch (erreur) {
    return erreurServeur(res, 'getAvisProduit', erreur);
  }
};

/* ═══ Acheteur connecté ══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/avis/produit/:produitId
   Peut-on évaluer ce produit ? + l'avis existant de l'utilisateur.
───────────────────────────────────────────────────────────────────────────── */
export const getMonAvisProduit = async (req, res) => {
  try {
    const { produitId } = req.params;
    if (!mongoose.isValidObjectId(produitId)) {
      return res.status(422).json({ success: false, message: 'Produit invalide.' });
    }

    const [monAvis, commande] = await Promise.all([
      Avis.findOne({ acheteur: req.user._id, produit: produitId }).lean(),
      trouverCommandeLivree(req.user._id, produitId),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        peutEvaluer: !!commande || !!monAvis,
        raison: commande || monAvis ? null : 'Seuls les clients ayant reçu ce produit peuvent laisser un avis.',
        monAvis,
      },
    });
  } catch (erreur) {
    return erreurServeur(res, 'getMonAvisProduit', erreur);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/avis/commande/:commandeId
   Avis déjà laissés sur les produits d'une commande (produitId → avis).
───────────────────────────────────────────────────────────────────────────── */
export const getMesAvisCommande = async (req, res) => {
  try {
    const { commandeId } = req.params;
    if (!mongoose.isValidObjectId(commandeId)) {
      return res.status(422).json({ success: false, message: 'Commande invalide.' });
    }

    const commande = await mongoose.model('Commande')
      .findOne({ _id: commandeId, acheteur: req.user._id }, { 'lignes.produit': 1 }).lean();
    if (!commande) return res.status(404).json({ success: false, message: 'Commande introuvable.' });

    const produitIds = commande.lignes.map((l) => l.produit);
    const avis = await Avis.find({ acheteur: req.user._id, produit: { $in: produitIds } }).lean();

    return res.status(200).json({
      success: true,
      data: { avis: Object.fromEntries(avis.map((a) => [String(a.produit), a])) },
    });
  } catch (erreur) {
    return erreurServeur(res, 'getMesAvisCommande', erreur);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/acheteur/avis   { produitId, note, titre?, commentaire? }
───────────────────────────────────────────────────────────────────────────── */
export const creerAvis = async (req, res) => {
  try {
    const { produitId } = req.body;
    if (!mongoose.isValidObjectId(produitId)) {
      return res.status(422).json({ success: false, message: 'Produit invalide.' });
    }

    let saisie;
    try { saisie = lireSaisie(req.body); } catch (e) { return res.status(422).json({ success: false, message: e.message }); }

    const [produit, commande, existant] = await Promise.all([
      Produit.findById(produitId).select('vendeur').lean(),
      trouverCommandeLivree(req.user._id, produitId),
      Avis.exists({ acheteur: req.user._id, produit: produitId }),
    ]);

    if (!produit) return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    if (existant) return res.status(409).json({ success: false, message: 'Vous avez déjà donné votre avis sur ce produit. Vous pouvez le modifier.' });
    if (!commande) {
      return res.status(403).json({ success: false, message: 'Seuls les clients ayant reçu ce produit peuvent laisser un avis.' });
    }

    const avis = await Avis.create({
      ...saisie,
      produit:  produitId,
      vendeur:  produit.vendeur,
      acheteur: req.user._id,
      commande: commande._id,
    });

    recalculerNoteProduitSansErreur(produitId);
    return res.status(201).json({ success: true, message: 'Merci pour votre avis !', data: { avis } });
  } catch (erreur) {
    if (erreur?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Vous avez déjà donné votre avis sur ce produit.' });
    }
    return erreurServeur(res, 'creerAvis', erreur);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/acheteur/avis/:id   { note?, titre?, commentaire? }
───────────────────────────────────────────────────────────────────────────── */
export const modifierAvis = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(422).json({ success: false, message: 'Avis invalide.' });
    }

    let saisie;
    try { saisie = lireSaisie(req.body, { partiel: true }); } catch (e) { return res.status(422).json({ success: false, message: e.message }); }

    const avis = await Avis.findOneAndUpdate(
      { _id: req.params.id, acheteur: req.user._id },
      { $set: { ...saisie, modifieAt: new Date() } },
      { new: true, runValidators: true },
    ).lean();
    if (!avis) return res.status(404).json({ success: false, message: 'Avis introuvable.' });

    recalculerNoteProduitSansErreur(avis.produit);
    return res.status(200).json({ success: true, message: 'Avis mis à jour.', data: { avis } });
  } catch (erreur) {
    return erreurServeur(res, 'modifierAvis', erreur);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/acheteur/avis/:id
───────────────────────────────────────────────────────────────────────────── */
export const supprimerAvis = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(422).json({ success: false, message: 'Avis invalide.' });
    }

    const avis = await Avis.findOneAndDelete({ _id: req.params.id, acheteur: req.user._id }).lean();
    if (!avis) return res.status(404).json({ success: false, message: 'Avis introuvable.' });

    recalculerNoteProduitSansErreur(avis.produit);
    return res.status(200).json({ success: true, message: 'Avis supprimé.' });
  } catch (erreur) {
    return erreurServeur(res, 'supprimerAvis', erreur);
  }
};
