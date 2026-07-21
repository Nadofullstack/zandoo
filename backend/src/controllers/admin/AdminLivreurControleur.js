import crypto from 'crypto';
import Livreur from '../../models/Livreur.js';
import User   from '../../models/User.js';
import { envoyerInvitationLivreur } from '../../services/emailService.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

/** Projection pour la liste — champs légers uniquement */
const PROJECTION_LISTE = { notesAdmin: 0 };

/** Génère un mot de passe temporaire lisible */
function genererMotDePasseTemp() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let mdp = '';
  const bytes = crypto.randomBytes(8);
  for (const b of bytes) mdp += chars[b % chars.length];
  return mdp;
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/livreurs/statistiques
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesLivreurs = async (_req, res) => {
  try {
    const [enAttente, actifs, suspendus, total, profilsComplets] = await Promise.all([
      Livreur.countDocuments({ statut: 'en_attente' }),
      Livreur.countDocuments({ statut: 'actif'      }),
      Livreur.countDocuments({ statut: 'suspendu'   }),
      Livreur.countDocuments(),
      Livreur.countDocuments({ profilComplete: true }),
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
   POST /api/admin/livreurs
   Création d'un compte livreur + envoi de l'email d'invitation.
───────────────────────────────────────────────────────────────────────────── */
export const creerLivreur = async (req, res) => {
  try {
    const { nom, prenom, email } = req.body;

    /* Validation de base */
    if (!nom?.trim() || !prenom?.trim() || !email?.trim()) {
      return res.status(422).json({
        success: false,
        message: 'Nom, prénom et email sont obligatoires.',
      });
    }

    const emailNorm = email.toLowerCase().trim();
    const nomComplet = `${prenom.trim()} ${nom.trim()}`;

    /* Unicité de l'email */
    const existant = await User.findOne({ email: emailNorm });
    if (existant) {
      return res.status(409).json({
        success: false,
        message: 'Un compte avec cette adresse e-mail existe déjà.',
      });
    }

    /* Génération du mot de passe temporaire */
    const motDePasseTemp = genererMotDePasseTemp();

    /* Token d'activation sécurisé (48h) */
    const tokenActivation  = crypto.randomBytes(32).toString('hex');
    const expirationToken  = new Date(Date.now() + 48 * 60 * 60 * 1000);

    /* Création de l'utilisateur */
    const utilisateur = await User.create({
      fullName:          nomComplet,
      email:             emailNorm,
      phone:             '',
      password:          motDePasseTemp,
      role:              'livreur',
      isVerified:        false,
      isActive:          true,
      /* Champs customs pour le flux d'activation */
      mustChangePassword:  true,
      activationToken:     tokenActivation,
      activationTokenExp:  expirationToken,
    });

    /* Création du profil Livreur associé */
    await Livreur.create({ utilisateur: utilisateur._id });

    /* Construction du lien d'activation */
    const lienActivation = `${process.env.CLIENT_URL}/livreur/activation/${tokenActivation}`;

    /* Envoi de l'email d'invitation */
    try {
      await envoyerInvitationLivreur({
        prenomNom:          nomComplet,
        email:              emailNorm,
        motDePasseTemporaire: motDePasseTemp,
        lienActivation,
      });
    } catch (erreurEmail) {
      /* L'email a échoué — on log mais on ne bloque pas la création */
      console.error('Erreur envoi email invitation livreur:', erreurEmail);
    }

    return res.status(201).json({
      success: true,
      message: `Compte livreur créé. Un email d'invitation a été envoyé à ${emailNorm}.`,
      data: {
        livreur: {
          utilisateurId: utilisateur._id,
          nomComplet,
          email: emailNorm,
          lienActivation, // retourné pour l'admin (fallback si email échoue)
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur creerLivreur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/livreurs
   Liste paginée avec filtres.
───────────────────────────────────────────────────────────────────────────── */
export const getLivreurs = async (req, res) => {
  try {
    const {
      statut,
      recherche = '',
      page  = 1,
      limite = 15,
    } = req.query;

    const filtre = {};

    if (statut && ['en_attente', 'actif', 'suspendu'].includes(statut)) {
      filtre.statut = statut;
    }

    /* Recherche sur les champs du User lié — on passe par $lookup ou on filtre via populate */
    const saut = (Number(page) - 1) * Number(limite);

    let requete = Livreur.find(filtre, PROJECTION_LISTE)
      .populate('utilisateur', 'fullName email phone isActive isVerified createdAt avatar')
      .sort({ createdAt: -1 })
      .skip(saut)
      .limit(Number(limite))
      .lean();

    let [livreurs, total] = await Promise.all([
      requete,
      Livreur.countDocuments(filtre),
    ]);

    /* Filtrage textuel post-populate (simple, efficace pour des volumes raisonnables) */
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
   Profil complet d'un livreur.
───────────────────────────────────────────────────────────────────────────── */
export const getLivreurParId = async (req, res) => {
  try {
    const livreur = await Livreur.findById(req.params.id)
      .populate('utilisateur', 'fullName email phone isActive isVerified createdAt avatar')
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
   PATCH /api/admin/livreurs/:id/statut
   Change le statut : actif | suspendu | en_attente
───────────────────────────────────────────────────────────────────────────── */
export const modifierStatutLivreur = async (req, res) => {
  try {
    const { statut, raison = '' } = req.body;

    if (!['en_attente', 'actif', 'suspendu'].includes(statut)) {
      return res.status(422).json({
        success: false,
        message: 'Statut invalide. Valeurs : en_attente, actif, suspendu.',
      });
    }

    const livreur = await Livreur.findById(req.params.id);
    if (!livreur) {
      return res.status(404).json({ success: false, message: 'Livreur introuvable.' });
    }

    livreur.statut = statut;
    livreur.historiqueStatut.push({
      statut,
      modifiePar: req.user._id,
      raison:     raison.trim().slice(0, 300),
      modifieAt:  new Date(),
    });

    await livreur.save();

    /* Synchronise isActive sur l'utilisateur lié */
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
    console.error('Erreur modifierStatutLivreur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/livreurs/:id/notes
   Mise à jour des notes internes.
───────────────────────────────────────────────────────────────────────────── */
export const modifierNotesAdmin = async (req, res) => {
  try {
    const { notesAdmin = '' } = req.body;

    const livreur = await Livreur.findByIdAndUpdate(
      req.params.id,
      { notesAdmin: notesAdmin.trim().slice(0, 500) },
      { new: true, runValidators: true }
    ).populate('utilisateur', 'fullName email').lean();

    if (!livreur) {
      return res.status(404).json({ success: false, message: 'Livreur introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Notes mises à jour.',
      data: { livreur },
    });
  } catch (erreur) {
    console.error('Erreur modifierNotesAdmin:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/admin/livreurs/:id/renvoyer-invitation
   Renvoie l'email d'invitation avec un nouveau token d'activation.
───────────────────────────────────────────────────────────────────────────── */
export const renvoyerInvitation = async (req, res) => {
  try {
    const livreur = await Livreur.findById(req.params.id).lean();
    if (!livreur) {
      return res.status(404).json({ success: false, message: 'Livreur introuvable.' });
    }

    const utilisateur = await User.findById(livreur.utilisateur).select('+mustChangePassword');
    if (!utilisateur) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    /* Nouveau mot de passe temporaire + nouveau token */
    const motDePasseTemp  = genererMotDePasseTemp();
    const tokenActivation = crypto.randomBytes(32).toString('hex');
    const expirationToken = new Date(Date.now() + 48 * 60 * 60 * 1000);

    utilisateur.password            = motDePasseTemp;
    utilisateur.mustChangePassword  = true;
    utilisateur.activationToken     = tokenActivation;
    utilisateur.activationTokenExp  = expirationToken;
    utilisateur.isVerified          = false;
    await utilisateur.save();

    const lienActivation = `${process.env.CLIENT_URL}/livreur/activation/${tokenActivation}`;

    try {
      await envoyerInvitationLivreur({
        prenomNom:            utilisateur.fullName,
        email:                utilisateur.email,
        motDePasseTemporaire: motDePasseTemp,
        lienActivation,
      });
    } catch (erreurEmail) {
      console.error('Erreur renvoi email invitation:', erreurEmail);
    }

    return res.status(200).json({
      success: true,
      message: `Email d'invitation renvoyé à ${utilisateur.email}.`,
      data: { lienActivation },
    });
  } catch (erreur) {
    console.error('Erreur renvoyerInvitation:', erreur);
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
