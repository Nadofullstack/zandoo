import Livreur from '../../models/Livreur.js';
import User   from '../../models/User.js';

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/livreurs/statistiques
   Compte tous les livreurs créés par les vendeurs.
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesLivreurs = async (_req, res) => {
  try {
    /* On compte uniquement les livreurs créés par des vendeurs */
    const filtrVendeur = { creerPar: { $ne: null } };

    const [enAttente, actifs, suspendus, total, profilsComplets] = await Promise.all([
      Livreur.countDocuments({ ...filtrVendeur, statut: 'en_attente' }),
      Livreur.countDocuments({ ...filtrVendeur, statut: 'actif'      }),
      Livreur.countDocuments({ ...filtrVendeur, statut: 'suspendu'   }),
      Livreur.countDocuments(filtrVendeur),
      Livreur.countDocuments({ ...filtrVendeur, profilComplete: true }),
    ]);

    return res.status(200).json({
      success: true,
      data: { statistiques: { enAttente, actifs, suspendus, total, profilsComplets } },
    });
  } catch (erreur) {
    console.error('Erreur getStatistiquesLivreurs:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/livreurs
   Liste paginée de tous les livreurs créés par des vendeurs.
───────────────────────────────────────────────────────────────────────────── */
export const getLivreurs = async (req, res) => {
  try {
    const {
      statut,
      vendeurId,
      recherche = '',
      page  = 1,
      limite = 15,
    } = req.query;

    /* Restreindre aux livreurs créés par des vendeurs */
    const filtre = { creerPar: { $ne: null } };

    if (statut && ['en_attente', 'actif', 'suspendu'].includes(statut)) {
      filtre.statut = statut;
    }

    /* Filtre par boutique (vendeurId) */
    if (vendeurId) {
      filtre.creerPar = vendeurId;
    }

    const saut = (Number(page) - 1) * Number(limite);

    let [livreurs, total] = await Promise.all([
      Livreur.find(filtre)
        .populate('utilisateur', 'fullName email phone isActive isVerified createdAt avatar')
        .populate('creerPar',    'nomEntreprise')
        .sort({ createdAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Livreur.countDocuments(filtre),
    ]);

    /* Filtrage textuel post-populate */
    if (recherche.trim()) {
      const regex = new RegExp(recherche.trim(), 'i');
      livreurs = livreurs.filter(
        (l) =>
          regex.test(l.utilisateur?.fullName   ?? '') ||
          regex.test(l.utilisateur?.email      ?? '') ||
          regex.test(l.telephone               ?? '') ||
          regex.test(l.villeService            ?? '') ||
          regex.test(l.creerPar?.nomEntreprise ?? '')
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
    console.error('Erreur getLivreurs:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/livreurs/:id
   Profil complet d'un livreur (lecture seule).
───────────────────────────────────────────────────────────────────────────── */
export const getLivreurParId = async (req, res) => {
  try {
    const livreur = await Livreur.findById(req.params.id)
      .populate('utilisateur', 'fullName email phone isActive isVerified createdAt avatar')
      .populate('creerPar',    'nomEntreprise utilisateur')
      .populate('historiqueStatut.modifiePar', 'fullName email')
      .lean();

    if (!livreur) {
      return res.status(404).json({ success: false, message: 'Livreur introuvable.' });
    }

    return res.status(200).json({ success: true, data: { livreur } });
  } catch (erreur) {
    console.error('Erreur getLivreurParId:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/admin/livreurs/:id
   Supprime le livreur et l'utilisateur associé.
───────────────────────────────────────────────────────────────────────────── */
export const supprimerLivreur = async (req, res) => {
  try {
    const livreur = await Livreur.findById(req.params.id);
    if (!livreur) {
      return res.status(404).json({ success: false, message: 'Livreur introuvable.' });
    }

    await Promise.all([
      Livreur.findByIdAndDelete(req.params.id),
      User.findByIdAndDelete(livreur.utilisateur),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Compte livreur supprimé définitivement.',
    });
  } catch (erreur) {
    console.error('Erreur supprimerLivreur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
