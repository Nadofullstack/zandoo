import Commande from '../../models/Commande.js';
import Livreur  from '../../models/Livreur.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Helper — récupère le document Livreur lié à l'utilisateur connecté
───────────────────────────────────────────────────────────────────────────── */
async function getLivreurId(userId) {
  const livreur = await Livreur.findOne({ utilisateur: userId }).select('_id').lean();
  return livreur?._id ?? null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/livreur/tableau-de-bord
   Statistiques résumées + livraisons du jour.
───────────────────────────────────────────────────────────────────────────── */
export const getTableauDeBord = async (req, res) => {
  try {
    const livreurId = await getLivreurId(req.user._id);
    if (!livreurId) {
      return res.status(404).json({ success: false, message: 'Profil livreur introuvable.' });
    }

    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);

    const [enCours, livrees, aujourd_hui, livreesAujourdhui] = await Promise.all([
      Commande.countDocuments({ livreur: livreurId, statut: 'expediee' }),
      Commande.countDocuments({ livreur: livreurId, statut: 'livree' }),
      Commande.find({
        livreur: livreurId,
        statut: { $in: ['expediee', 'payee'] },
        updatedAt: { $gte: debutJour },
      })
        .select('numero statut total adresseLivraison createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
      Commande.countDocuments({
        livreur: livreurId,
        statut: 'livree',
        livreeAt: { $gte: debutJour },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        statistiques: {
          enCours,
          livrees,
          livreesAujourdhui,
        },
        livraisonsAujourdhui: aujourd_hui,
      },
    });
  } catch (erreur) {
    console.error('Erreur getTableauDeBord livreur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/livreur/commandes
   Livraisons assignées au livreur connecté (en cours).
───────────────────────────────────────────────────────────────────────────── */
export const getMesLivraisons = async (req, res) => {
  try {
    const livreurId = await getLivreurId(req.user._id);
    if (!livreurId) {
      return res.status(404).json({ success: false, message: 'Profil livreur introuvable.' });
    }

    const { page = 1, limite = 20 } = req.query;
    const saut = (Number(page) - 1) * Number(limite);

    const [commandes, total] = await Promise.all([
      Commande.find({ livreur: livreurId, statut: 'expediee' })
        .select('numero statut total adresseLivraison lignes createdAt updatedAt paiement')
        .sort({ updatedAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Commande.countDocuments({ livreur: livreurId, statut: 'expediee' }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        commandes,
        pagination: {
          total,
          page: Number(page),
          limite: Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getMesLivraisons:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/livreur/commandes/historique
   Livraisons terminées (livrées ou annulées).
───────────────────────────────────────────────────────────────────────────── */
export const getHistoriqueLivraisons = async (req, res) => {
  try {
    const livreurId = await getLivreurId(req.user._id);
    if (!livreurId) {
      return res.status(404).json({ success: false, message: 'Profil livreur introuvable.' });
    }

    const { page = 1, limite = 20, statut } = req.query;
    const saut = (Number(page) - 1) * Number(limite);

    const filtre = {
      livreur: livreurId,
      statut: statut && ['livree', 'annulee'].includes(statut) ? statut : { $in: ['livree', 'annulee'] },
    };

    const [commandes, total] = await Promise.all([
      Commande.find(filtre)
        .select('numero statut total adresseLivraison lignes livreeAt annuleeAt createdAt')
        .sort({ updatedAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Commande.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        commandes,
        pagination: {
          total,
          page: Number(page),
          limite: Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getHistoriqueLivraisons:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/livreur/commandes/:id/livree
   Marquer une commande comme livrée.
───────────────────────────────────────────────────────────────────────────── */
export const marquerLivree = async (req, res) => {
  try {
    const livreurId = await getLivreurId(req.user._id);
    if (!livreurId) {
      return res.status(404).json({ success: false, message: 'Profil livreur introuvable.' });
    }

    const commande = await Commande.findOne({
      _id:     req.params.id,
      livreur: livreurId,
      statut:  'expediee',
    });

    if (!commande) {
      return res.status(404).json({
        success: false,
        message: 'Commande introuvable ou non assignée à ce livreur.',
      });
    }

    commande.statut   = 'livree';
    commande.livreeAt = new Date();
    commande.historiqueStatut.push({
      statut:     'livree',
      modifiePar: req.user._id,
      raison:     'Marquée comme livrée par le livreur.',
      modifieAt:  new Date(),
    });

    await commande.save();

    return res.status(200).json({
      success: true,
      message: 'Commande marquée comme livrée.',
      data: { commande },
    });
  } catch (erreur) {
    console.error('Erreur marquerLivree:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
