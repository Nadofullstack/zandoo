import mongoose from 'mongoose';
import Livreur  from '../../models/Livreur.js';
import User     from '../../models/User.js';
import Vendeur  from '../../models/Vendeur.js';
import Commande from '../../models/Commande.js';

/** Statuts de commande pour lesquels une livraison est encore en cours */
const STATUTS_COMMANDE_EN_COURS = ['payee', 'en_preparation', 'expediee'];

/** Échappe les caractères spéciaux pour construire une RegExp à partir d'une saisie utilisateur */
const echapperRegex = (texte) => texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
      if (!mongoose.isValidObjectId(vendeurId)) {
        return res.status(422).json({ success: false, message: 'Identifiant de boutique invalide.' });
      }
      filtre.creerPar = vendeurId;
    }

    /* Recherche textuelle — appliquée dans la requête (avant pagination)
       pour couvrir tous les livreurs et garder un total exact. */
    if (recherche.trim()) {
      const regex = new RegExp(echapperRegex(recherche.trim()), 'i');

      const [utilisateurs, vendeurs] = await Promise.all([
        User.find({ role: 'livreur', $or: [{ fullName: regex }, { email: regex }] }).select('_id').lean(),
        Vendeur.find({ nomEntreprise: regex }).select('_id').lean(),
      ]);

      filtre.$or = [
        { utilisateur:  { $in: utilisateurs.map((u) => u._id) } },
        { creerPar:     { $in: vendeurs.map((v) => v._id) } },
        { telephone:    regex },
        { villeService: regex },
      ];
    }

    const saut = (Number(page) - 1) * Number(limite);

    const [livreurs, total] = await Promise.all([
      Livreur.find(filtre)
        .populate('utilisateur', 'fullName email phone isActive isVerified createdAt avatar')
        .populate('creerPar',    'nomEntreprise')
        .sort({ createdAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Livreur.countDocuments(filtre),
    ]);

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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Livreur introuvable.' });
    }

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
   Refusé tant que le livreur a des livraisons en cours.
───────────────────────────────────────────────────────────────────────────── */
export const supprimerLivreur = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Livreur introuvable.' });
    }

    const livreur = await Livreur.findById(req.params.id);
    if (!livreur) {
      return res.status(404).json({ success: false, message: 'Livreur introuvable.' });
    }

    const livraisonsEnCours = await Commande.countDocuments({
      livreur: livreur._id,
      statut:  { $in: STATUTS_COMMANDE_EN_COURS },
    });
    if (livraisonsEnCours > 0) {
      return res.status(409).json({
        success: false,
        message: `Impossible de supprimer ce livreur : ${livraisonsEnCours} livraison(s) en cours lui sont assignée(s).`,
      });
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
