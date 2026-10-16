import mongoose from 'mongoose';
import Avis from '../../models/Avis.js';
import { recalculerNoteProduitSansErreur } from '../../services/avisService.js';

/**
 * Modération des avis clients.
 *   GET   /api/admin/avis?statut=masque&note=1&page=1
 *   PATCH /api/admin/avis/:id/statut   { statut: 'publie'|'masque', motif? }
 */

export const getAvis = async (req, res) => {
  try {
    const page   = Math.max(1, Number(req.query.page) || 1);
    const limite = Math.min(50, Math.max(1, Number(req.query.limite) || 20));
    const note   = Number(req.query.note);

    const filtre = {};
    if (['publie', 'masque'].includes(req.query.statut)) filtre.statut = req.query.statut;
    if (Number.isInteger(note) && note >= 1 && note <= 5) filtre.note = note;

    const [avis, total] = await Promise.all([
      Avis.find(filtre)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limite)
        .limit(limite)
        .populate('acheteur', 'fullName email')
        .populate('produit', 'nom slug')
        .populate('vendeur', 'nomEntreprise')
        .lean(),
      Avis.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: { avis, pagination: { total, page, limite, totalPages: Math.ceil(total / limite) } },
    });
  } catch (erreur) {
    console.error('Erreur getAvis admin:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

export const modifierStatutAvis = async (req, res) => {
  try {
    const { statut, motif = '' } = req.body;
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(422).json({ success: false, message: 'Avis invalide.' });
    }
    if (!['publie', 'masque'].includes(statut)) {
      return res.status(422).json({ success: false, message: 'Statut invalide (publie ou masque).' });
    }

    const avis = await Avis.findByIdAndUpdate(
      req.params.id,
      { $set: { statut, motifMasquage: statut === 'masque' ? String(motif).trim().slice(0, 300) : '' } },
      { returnDocument: 'after' },
    ).lean();
    if (!avis) return res.status(404).json({ success: false, message: 'Avis introuvable.' });

    /* La note du produit ne tient compte que des avis publiés */
    recalculerNoteProduitSansErreur(avis.produit);

    return res.status(200).json({
      success: true,
      message: statut === 'masque' ? 'Avis masqué.' : 'Avis republié.',
      data: { avis },
    });
  } catch (erreur) {
    console.error('Erreur modifierStatutAvis:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
