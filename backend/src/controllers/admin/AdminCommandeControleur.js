import Commande from '../../models/Commande.js';
import { validationResult } from 'express-validator';
import { envoyerChangementStatutAcheteur } from '../../services/emailService.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

/** Projection liste — exclut les champs lourds inutiles */
const PROJECTION_LISTE = {
  notesAdmin:         0,
  historiqueStatut:   0,
  adresseFacturation: 0,
};

function getErreurs(req) {
  const erreurs = validationResult(req);
  return erreurs.isEmpty() ? null : erreurs.array();
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/commandes/statistiques
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesCommandes = async (_req, res) => {
  try {
    const [enAttente, payees, enPreparation, expediees, livrees, annulees, total, agregation] =
      await Promise.all([
        Commande.countDocuments({ statut: 'en_attente' }),
        Commande.countDocuments({ statut: 'payee' }),
        Commande.countDocuments({ statut: 'en_preparation' }),
        Commande.countDocuments({ statut: 'expediee' }),
        Commande.countDocuments({ statut: 'livree' }),
        Commande.countDocuments({ statut: 'annulee' }),
        Commande.countDocuments(),
        Commande.aggregate([
          { $match: { statut: { $in: ['payee', 'expediee', 'livree'] } } },
          { $group: { _id: null, chiffreAffaires: { $sum: '$total' } } },
        ]),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        statistiques: {
          enAttente, payees, enPreparation, expediees, livrees, annulees, total,
          chiffreAffaires: agregation[0]?.chiffreAffaires ?? 0,
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getStatistiquesCommandes:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/commandes
   Liste paginée de toutes les commandes (tous vendeurs confondus).
───────────────────────────────────────────────────────────────────────────── */
export const getCommandes = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const {
      statut,
      vendeur,
      recherche = '',
      dateDebut,
      dateFin,
      page   = 1,
      limite = 15,
    } = req.query;

    const filtre = {};
    if (statut)  filtre.statut  = statut;
    if (vendeur) filtre.vendeur = vendeur;

    if (recherche.trim()) {
      filtre.numero = new RegExp(recherche.trim(), 'i');
    }

    if (dateDebut || dateFin) {
      filtre.createdAt = {};
      if (dateDebut) filtre.createdAt.$gte = new Date(dateDebut);
      if (dateFin)   filtre.createdAt.$lte = new Date(dateFin);
    }

    const saut = (Number(page) - 1) * Number(limite);

    const [commandes, total] = await Promise.all([
      Commande.find(filtre, PROJECTION_LISTE)
        .populate('acheteur', 'fullName email phone')
        .populate('vendeur',  'nomEntreprise emailContact')
        .sort({ createdAt: -1 })
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
          page:       Number(page),
          limite:     Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getCommandes:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/commandes/:id
   Détail complet d'une commande.
───────────────────────────────────────────────────────────────────────────── */
export const getCommandeParId = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const commande = await Commande.findById(req.params.id)
      .populate('acheteur', 'fullName email phone avatar createdAt')
      .populate('vendeur',  'nomEntreprise emailContact telephoneContact')
      .populate('lignes.produit', 'nom reference photoCouverture slug')
      .populate('livreur', 'fullName email phone')
      .populate('historiqueStatut.modifiePar', 'fullName email')
      .lean();

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    return res.status(200).json({ success: true, data: { commande } });
  } catch (erreur) {
    console.error('Erreur getCommandeParId:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/commandes/:id/statut
   L'admin peut changer le statut vers n'importe quel statut valide.
───────────────────────────────────────────────────────────────────────────── */
export const modifierStatutCommande = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const { statut, raison = '' } = req.body;

    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    const maintenant = new Date();
    commande.statut  = statut;

    if (statut === 'payee')          commande.payeeAt          = maintenant;
    if (statut === 'en_preparation') commande.enPreparationAt  = maintenant;
    if (statut === 'expediee')       commande.expedieeAt       = maintenant;
    if (statut === 'livree')         commande.livreeAt         = maintenant;
    if (statut === 'annulee')        commande.annuleeAt        = maintenant;
    if (statut === 'remboursee')     commande.remboureeAt      = maintenant;

    commande.historiqueStatut.push({
      statut,
      modifiePar: req.user._id,
      raison:     raison.trim().slice(0, 300),
      modifieAt:  maintenant,
    });

    await commande.save();

    const miseAJour = await Commande.findById(commande._id)
      .populate('acheteur', 'fullName email phone')
      .populate('vendeur',  'nomEntreprise emailContact')
      .populate('lignes.produit', 'nom reference photoCouverture')
      .populate('historiqueStatut.modifiePar', 'fullName email')
      .lean();

    /* Notification email acheteur — best-effort */
    if (miseAJour?.acheteur?.email) {
      envoyerChangementStatutAcheteur({
        emailAcheteur: miseAJour.acheteur.email,
        acheteurNom:   miseAJour.acheteur.fullName,
        numero:        miseAJour.numero,
        statut,
        raison:        raison.trim() || undefined,
        vendeurNom:    miseAJour.vendeur?.nomEntreprise ?? 'Un vendeur',
      }).catch((err) => console.error('Email statut commande:', err.message));
    }

    return res.status(200).json({
      success: true,
      message: `Statut mis à jour : ${statut}.`,
      data: { commande: miseAJour },
    });
  } catch (erreur) {
    console.error('Erreur modifierStatutCommande:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/commandes/:id/notes
   Notes internes de l'admin.
───────────────────────────────────────────────────────────────────────────── */
export const modifierNotesCommande = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const { notesAdmin = '' } = req.body;

    const commande = await Commande.findByIdAndUpdate(
      req.params.id,
      { notesAdmin: notesAdmin.trim().slice(0, 500) },
      { new: true, runValidators: true }
    )
      .populate('acheteur', 'fullName email')
      .populate('vendeur',  'nomEntreprise')
      .lean();

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    return res.status(200).json({ success: true, message: 'Notes mises à jour.', data: { commande } });
  } catch (erreur) {
    console.error('Erreur modifierNotesCommande:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/commandes/:id/livreur
   Assigner ou changer le livreur d'une commande.
───────────────────────────────────────────────────────────────────────────── */
export const assignerLivreur = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const { livreurId } = req.body;

    const commande = await Commande.findByIdAndUpdate(
      req.params.id,
      { livreur: livreurId ?? null },
      { new: true, runValidators: true }
    )
      .populate('acheteur', 'fullName email')
      .populate('vendeur',  'nomEntreprise')
      .populate('livreur',  'fullName email phone')
      .lean();

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    return res.status(200).json({ success: true, message: 'Livreur assigné.', data: { commande } });
  } catch (erreur) {
    console.error('Erreur assignerLivreur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
