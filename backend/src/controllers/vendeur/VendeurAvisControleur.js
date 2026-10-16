import mongoose from 'mongoose';
import Avis from '../../models/Avis.js';
import Vendeur from '../../models/Vendeur.js';
import { nomPublic } from '../../services/avisService.js';

/**
 * Avis reçus sur les produits de la boutique du vendeur connecté.
 *   GET   /api/vendeur/avis?filtre=sans_reponse&note=1&page=1
 *   PATCH /api/vendeur/avis/:id/reponse   { texte }  (texte vide = retirer la réponse)
 */

const idVendeur = async (userId) => (await Vendeur.findOne({ utilisateur: userId }).select('_id').lean())?._id ?? null;

const erreurServeur = (res, contexte, erreur) => {
  console.error(`Erreur ${contexte}:`, erreur);
  return res.status(500).json({ success: false, message: 'Erreur serveur.' });
};

export const getAvisBoutique = async (req, res) => {
  try {
    const vendeurId = await idVendeur(req.user._id);
    if (!vendeurId) return res.status(404).json({ success: false, message: 'Boutique introuvable.' });

    const page   = Math.max(1, Number(req.query.page) || 1);
    const limite = Math.min(50, Math.max(1, Number(req.query.limite) || 10));
    const note   = Number(req.query.note);

    const base = { vendeur: vendeurId, statut: 'publie' };
    const filtre = { ...base };
    if (req.query.filtre === 'sans_reponse') filtre['reponseVendeur.texte'] = { $in: ['', null] };
    if (Number.isInteger(note) && note >= 1 && note <= 5) filtre.note = note;

    const [avis, total, [stats]] = await Promise.all([
      Avis.find(filtre)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limite)
        .limit(limite)
        .populate('acheteur', 'fullName')
        .populate('produit', 'nom slug photoCouverture')
        .lean(),
      Avis.countDocuments(filtre),
      Avis.aggregate([
        { $match: base },
        {
          $group: {
            _id: null,
            moyenne:     { $avg: '$note' },
            total:       { $sum: 1 },
            sansReponse: { $sum: { $cond: [{ $in: [{ $ifNull: ['$reponseVendeur.texte', ''] }, ['']] }, 1, 0] } },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        avis: avis.map((a) => ({
          _id:            a._id,
          note:           a.note,
          titre:          a.titre,
          commentaire:    a.commentaire,
          auteur:         nomPublic(a.acheteur?.fullName),
          produit:        a.produit,
          createdAt:      a.createdAt,
          reponseVendeur: a.reponseVendeur?.texte ? a.reponseVendeur : null,
        })),
        statistiques: {
          moyenne:     stats ? Math.round(stats.moyenne * 10) / 10 : 0,
          total:       stats?.total ?? 0,
          sansReponse: stats?.sansReponse ?? 0,
        },
        pagination: { total, page, limite, totalPages: Math.ceil(total / limite) },
      },
    });
  } catch (erreur) {
    return erreurServeur(res, 'getAvisBoutique', erreur);
  }
};

export const repondreAvis = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(422).json({ success: false, message: 'Avis invalide.' });
    }
    const vendeurId = await idVendeur(req.user._id);
    if (!vendeurId) return res.status(404).json({ success: false, message: 'Boutique introuvable.' });

    const texte = String(req.body.texte ?? '').trim();
    if (texte.length > 1000) {
      return res.status(422).json({ success: false, message: 'La réponse ne peut pas dépasser 1000 caractères.' });
    }

    const avis = await Avis.findOneAndUpdate(
      { _id: req.params.id, vendeur: vendeurId },
      { $set: { reponseVendeur: { texte, reponduAt: texte ? new Date() : null } } },
      { returnDocument: 'after' },
    ).lean();
    if (!avis) return res.status(404).json({ success: false, message: 'Avis introuvable.' });

    return res.status(200).json({
      success: true,
      message: texte ? 'Réponse publiée.' : 'Réponse retirée.',
      data: { reponseVendeur: avis.reponseVendeur?.texte ? avis.reponseVendeur : null },
    });
  } catch (erreur) {
    return erreurServeur(res, 'repondreAvis', erreur);
  }
};
