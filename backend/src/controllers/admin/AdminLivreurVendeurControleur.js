import Livreur from '../../models/Livreur.js';
import Vendeur from '../../models/Vendeur.js';

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/vendeurs/:vendeurId/livreurs
   Liste paginée des livreurs d'un vendeur précis.
───────────────────────────────────────────────────────────────────────────── */
export const getLivreursParVendeur = async (req, res) => {
  try {
    const { vendeurId } = req.params;

    const vendeur = await Vendeur.findById(vendeurId)
      .populate('utilisateur', 'fullName email')
      .lean();

    if (!vendeur) {
      return res.status(404).json({ success: false, message: 'Vendeur introuvable.' });
    }

    const {
      statut,
      recherche = '',
      page   = 1,
      limite = 15,
    } = req.query;

    const filtre = { creerPar: vendeurId };

    if (statut && ['en_attente', 'actif', 'suspendu'].includes(statut)) {
      filtre.statut = statut;
    }

    const saut = (Number(page) - 1) * Number(limite);

    let [livreurs, total] = await Promise.all([
      Livreur.find(filtre)
        .populate('utilisateur', 'fullName email phone isActive isVerified createdAt avatar')
        .sort({ createdAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Livreur.countDocuments(filtre),
    ]);

    if (recherche.trim()) {
      const regex = new RegExp(recherche.trim(), 'i');
      livreurs = livreurs.filter(
        (l) =>
          regex.test(l.utilisateur?.fullName ?? '') ||
          regex.test(l.utilisateur?.email    ?? '') ||
          regex.test(l.telephone             ?? '') ||
          regex.test(l.villeService          ?? '')
      );
      total = livreurs.length;
    }

    return res.status(200).json({
      success: true,
      data: {
        vendeur: {
          _id:          vendeur._id,
          nomEntreprise: vendeur.nomEntreprise,
          utilisateur:  vendeur.utilisateur,
        },
        livreurs,
        pagination: {
          total,
          page:       Number(page),
          limite:     Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getLivreursParVendeur (admin):', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/vendeurs/:vendeurId/livreurs/:livreurId
   Profil complet d'un livreur appartenant à un vendeur précis.
───────────────────────────────────────────────────────────────────────────── */
export const getLivreurVendeurParId = async (req, res) => {
  try {
    const { vendeurId, livreurId } = req.params;

    const vendeur = await Vendeur.findById(vendeurId).lean();
    if (!vendeur) {
      return res.status(404).json({ success: false, message: 'Vendeur introuvable.' });
    }

    const livreur = await Livreur.findOne({ _id: livreurId, creerPar: vendeurId })
      .populate('utilisateur', 'fullName email phone isActive isVerified createdAt avatar')
      .populate('historiqueStatut.modifiePar', 'fullName email')
      .lean();

    if (!livreur) {
      return res.status(404).json({
        success: false,
        message: 'Livreur introuvable pour ce vendeur.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        vendeur: {
          _id:          vendeur._id,
          nomEntreprise: vendeur.nomEntreprise,
        },
        livreur,
      },
    });
  } catch (erreur) {
    console.error('Erreur getLivreurVendeurParId (admin):', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/vendeurs/:vendeurId/livreurs/:livreurId/statut
   L'admin peut aussi changer le statut d'un livreur d'un vendeur.
───────────────────────────────────────────────────────────────────────────── */
export const modifierStatutLivreurVendeur = async (req, res) => {
  try {
    const { vendeurId, livreurId } = req.params;
    const { statut, raison = '' } = req.body;

    if (!['en_attente', 'actif', 'suspendu'].includes(statut)) {
      return res.status(422).json({
        success: false,
        message: 'Statut invalide. Valeurs : en_attente, actif, suspendu.',
      });
    }

    const vendeur = await Vendeur.findById(vendeurId).lean();
    if (!vendeur) {
      return res.status(404).json({ success: false, message: 'Vendeur introuvable.' });
    }

    const livreur = await Livreur.findOne({ _id: livreurId, creerPar: vendeurId });
    if (!livreur) {
      return res.status(404).json({
        success: false,
        message: 'Livreur introuvable pour ce vendeur.',
      });
    }

    livreur.statut = statut;
    livreur.historiqueStatut.push({
      statut,
      modifiePar: req.user._id,
      raison:     raison.trim().slice(0, 300),
      modifieAt:  new Date(),
    });
    await livreur.save();

    const { default: User } = await import('../../models/User.js');
    await User.findByIdAndUpdate(livreur.utilisateur, {
      isActive: statut !== 'suspendu',
    });

    const miseAJour = await Livreur.findById(livreur._id)
      .populate('utilisateur', 'fullName email phone isActive')
      .lean();

    return res.status(200).json({
      success: true,
      message: `Statut mis à jour : ${statut}.`,
      data: { livreur: miseAJour },
    });
  } catch (erreur) {
    console.error('Erreur modifierStatutLivreurVendeur (admin):', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/livreurs-vendeurs
   Vue globale : tous les livreurs créés par des vendeurs, avec infos vendeur.
───────────────────────────────────────────────────────────────────────────── */
export const getTousLesLivreursVendeurs = async (req, res) => {
  try {
    const {
      statut,
      recherche = '',
      vendeurId,
      page  = 1,
      limite = 20,
    } = req.query;

    /* Ne retourne que les livreurs créés par un vendeur (creerPar != null) */
    const filtre = { creerPar: { $ne: null } };

    if (statut && ['en_attente', 'actif', 'suspendu'].includes(statut)) {
      filtre.statut = statut;
    }
    if (vendeurId) {
      filtre.creerPar = vendeurId;
    }

    const saut = (Number(page) - 1) * Number(limite);

    let [livreurs, total] = await Promise.all([
      Livreur.find(filtre)
        .populate('utilisateur', 'fullName email phone isActive isVerified createdAt avatar')
        .populate('creerPar', 'nomEntreprise utilisateur slug')
        .sort({ createdAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Livreur.countDocuments(filtre),
    ]);

    if (recherche.trim()) {
      const regex = new RegExp(recherche.trim(), 'i');
      livreurs = livreurs.filter(
        (l) =>
          regex.test(l.utilisateur?.fullName    ?? '') ||
          regex.test(l.utilisateur?.email       ?? '') ||
          regex.test(l.telephone                ?? '') ||
          regex.test(l.villeService             ?? '') ||
          regex.test(l.creerPar?.nomEntreprise  ?? '')
      );
      total = livreurs.length;
    }

    return res.status(200).json({
      success: true,
      data: {
        livreurs,
        pagination: {
          total,
          page:       Number(page),
          limite:     Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getTousLesLivreursVendeurs (admin):', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
