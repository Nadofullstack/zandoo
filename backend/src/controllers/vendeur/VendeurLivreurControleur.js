import crypto  from 'crypto';
import Livreur  from '../../models/Livreur.js';
import Vendeur  from '../../models/Vendeur.js';
import User     from '../../models/User.js';
import { envoyerInvitationLivreurVendeur } from '../../services/emailService.js';
import env from '../../config/env.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

/** Génère un mot de passe temporaire lisible (8 caractères) */
function genererMotDePasseTemp() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let mdp = '';
  const bytes = crypto.randomBytes(8);
  for (const b of bytes) mdp += chars[b % chars.length];
  return mdp;
}

/**
 * Récupère le profil Vendeur de l'utilisateur connecté.
 * Retourne null si l'utilisateur n'a pas de boutique approuvée.
 */
async function getVendeurConnecte(userId) {
  return Vendeur.findOne({
    utilisateur: userId,
    statut:      'approuve',
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/vendeur/livreurs/statistiques
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesLivreurs = async (req, res) => {
  try {
    const vendeur = await getVendeurConnecte(req.user._id);
    if (!vendeur) {
      return res.status(403).json({
        success: false,
        message: 'Boutique introuvable ou non approuvée.',
      });
    }

    const [enAttente, actifs, suspendus, total, profilsComplets] = await Promise.all([
      Livreur.countDocuments({ creerPar: vendeur._id, statut: 'en_attente' }),
      Livreur.countDocuments({ creerPar: vendeur._id, statut: 'actif'      }),
      Livreur.countDocuments({ creerPar: vendeur._id, statut: 'suspendu'   }),
      Livreur.countDocuments({ creerPar: vendeur._id                       }),
      Livreur.countDocuments({ creerPar: vendeur._id, profilComplete: true }),
    ]);

    return res.status(200).json({
      success: true,
      data: { statistiques: { enAttente, actifs, suspendus, total, profilsComplets } },
    });
  } catch (erreur) {
    console.error('Erreur getStatistiquesLivreurs (vendeur):', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/vendeur/livreurs
   Liste paginée des livreurs de ce vendeur.
───────────────────────────────────────────────────────────────────────────── */
export const getMesLivreurs = async (req, res) => {
  try {
    const vendeur = await getVendeurConnecte(req.user._id);
    if (!vendeur) {
      return res.status(403).json({
        success: false,
        message: 'Boutique introuvable ou non approuvée.',
      });
    }

    const {
      statut,
      recherche = '',
      page   = 1,
      limite = 15,
    } = req.query;

    const filtre = { creerPar: vendeur._id };

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

    /* Filtrage textuel post-populate */
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
    console.error('Erreur getMesLivreurs (vendeur):', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/vendeur/livreurs
   Création d'un livreur par le vendeur.
───────────────────────────────────────────────────────────────────────────── */
export const creerLivreur = async (req, res) => {
  try {
    const vendeur = await getVendeurConnecte(req.user._id);
    if (!vendeur) {
      return res.status(403).json({
        success: false,
        message: 'Boutique introuvable ou non approuvée.',
      });
    }

    const { nom, prenom, email } = req.body;

    if (!nom?.trim() || !prenom?.trim() || !email?.trim()) {
      return res.status(422).json({
        success: false,
        message: 'Nom, prénom et email sont obligatoires.',
      });
    }

    const emailNorm  = email.toLowerCase().trim();
    const nomComplet = `${prenom.trim()} ${nom.trim()}`;

    /* Unicité email */
    const existant = await User.findOne({ email: emailNorm });
    if (existant) {
      return res.status(409).json({
        success: false,
        message: 'Un compte avec cette adresse e-mail existe déjà.',
      });
    }

    /* Génération des credentials temporaires */
    const motDePasseTemp  = genererMotDePasseTemp();
    const tokenActivation = crypto.randomBytes(32).toString('hex');
    const expirationToken = new Date(Date.now() + 48 * 60 * 60 * 1000);

    /* Création de l'utilisateur */
    const utilisateur = await User.create({
      fullName:             nomComplet,
      email:                emailNorm,
      phone:                '',
      password:             motDePasseTemp,
      role:                 'livreur',
      isVerified:           false,
      isActive:             true,
      mustChangePassword:   true,
      activationToken:      tokenActivation,
      activationTokenExp:   expirationToken,
    });

    /* Création du profil Livreur lié à ce vendeur */
    await Livreur.create({
      utilisateur: utilisateur._id,
      creerPar:    vendeur._id,
    });

    /* Lien d'activation */
    const lienActivation = `${env.server.clientUrl}/livreur/activation/${tokenActivation}`;

    /* Email d'invitation avec le nom de la boutique */
    try {
      await envoyerInvitationLivreurVendeur({
        prenomNom:            nomComplet,
        email:                emailNorm,
        motDePasseTemporaire: motDePasseTemp,
        lienActivation,
        nomBoutique:          vendeur.nomEntreprise,
      });
    } catch (erreurEmail) {
      console.error('Erreur envoi email invitation livreur (vendeur):', erreurEmail);
    }

    return res.status(201).json({
      success: true,
      message: `Compte livreur créé. Un email d'invitation a été envoyé à ${emailNorm}.`,
      data: {
        livreur: {
          utilisateurId: utilisateur._id,
          nomComplet,
          email: emailNorm,
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur creerLivreur (vendeur):', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/vendeur/livreurs/:id
   Profil complet — vérifie l'appartenance au vendeur.
───────────────────────────────────────────────────────────────────────────── */
export const getLivreurParId = async (req, res) => {
  try {
    const vendeur = await getVendeurConnecte(req.user._id);
    if (!vendeur) {
      return res.status(403).json({
        success: false,
        message: 'Boutique introuvable ou non approuvée.',
      });
    }

    const livreur = await Livreur.findOne({
      _id:      req.params.id,
      creerPar: vendeur._id,
    })
      .populate('utilisateur', 'fullName email phone isActive isVerified createdAt avatar')
      .populate('historiqueStatut.modifiePar', 'fullName email')
      .lean();

    if (!livreur) {
      return res.status(404).json({
        success: false,
        message: 'Livreur introuvable ou vous n\'avez pas accès à ce profil.',
      });
    }

    return res.status(200).json({ success: true, data: { livreur } });
  } catch (erreur) {
    console.error('Erreur getLivreurParId (vendeur):', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/vendeur/livreurs/:id/statut
   Activer / suspendre un livreur appartenant à ce vendeur.
───────────────────────────────────────────────────────────────────────────── */
export const modifierStatutLivreur = async (req, res) => {
  try {
    const vendeur = await getVendeurConnecte(req.user._id);
    if (!vendeur) {
      return res.status(403).json({
        success: false,
        message: 'Boutique introuvable ou non approuvée.',
      });
    }

    const { statut, raison = '' } = req.body;

    if (!['en_attente', 'actif', 'suspendu'].includes(statut)) {
      return res.status(422).json({
        success: false,
        message: 'Statut invalide. Valeurs : en_attente, actif, suspendu.',
      });
    }

    const livreur = await Livreur.findOne({
      _id:      req.params.id,
      creerPar: vendeur._id,
    });

    if (!livreur) {
      return res.status(404).json({
        success: false,
        message: 'Livreur introuvable ou vous n\'avez pas accès à ce profil.',
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

    /* Synchronise isActive sur l'utilisateur */
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
    console.error('Erreur modifierStatutLivreur (vendeur):', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/vendeur/livreurs/:id/renvoyer-invitation
   Renvoie l'email d'invitation avec de nouveaux credentials.
───────────────────────────────────────────────────────────────────────────── */
export const renvoyerInvitation = async (req, res) => {
  try {
    const vendeur = await getVendeurConnecte(req.user._id);
    if (!vendeur) {
      return res.status(403).json({
        success: false,
        message: 'Boutique introuvable ou non approuvée.',
      });
    }

    const livreur = await Livreur.findOne({
      _id:      req.params.id,
      creerPar: vendeur._id,
    }).lean();

    if (!livreur) {
      return res.status(404).json({
        success: false,
        message: 'Livreur introuvable ou vous n\'avez pas accès à ce profil.',
      });
    }

    const utilisateur = await User.findById(livreur.utilisateur)
      .select('+mustChangePassword +activationToken +activationTokenExp');

    if (!utilisateur) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    /* Nouveaux credentials */
    const motDePasseTemp  = genererMotDePasseTemp();
    const tokenActivation = crypto.randomBytes(32).toString('hex');
    const expirationToken = new Date(Date.now() + 48 * 60 * 60 * 1000);

    utilisateur.password           = motDePasseTemp;
    utilisateur.mustChangePassword = true;
    utilisateur.activationToken    = tokenActivation;
    utilisateur.activationTokenExp = expirationToken;
    utilisateur.isVerified         = false;
    await utilisateur.save();

    const lienActivation = `${env.server.clientUrl}/livreur/activation/${tokenActivation}`;

    try {
      await envoyerInvitationLivreurVendeur({
        prenomNom:            utilisateur.fullName,
        email:                utilisateur.email,
        motDePasseTemporaire: motDePasseTemp,
        lienActivation,
        nomBoutique:          vendeur.nomEntreprise,
      });
    } catch (erreurEmail) {
      console.error('Erreur renvoi email invitation livreur (vendeur):', erreurEmail);
    }

    return res.status(200).json({
      success: true,
      message: `Email d'invitation renvoyé à ${utilisateur.email}.`,
      data: { lienActivation },
    });
  } catch (erreur) {
    console.error('Erreur renvoyerInvitation (vendeur):', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/vendeur/livreurs/:id
   Supprime un livreur appartenant à ce vendeur.
───────────────────────────────────────────────────────────────────────────── */
export const supprimerLivreur = async (req, res) => {
  try {
    const vendeur = await getVendeurConnecte(req.user._id);
    if (!vendeur) {
      return res.status(403).json({
        success: false,
        message: 'Boutique introuvable ou non approuvée.',
      });
    }

    const livreur = await Livreur.findOne({
      _id:      req.params.id,
      creerPar: vendeur._id,
    });

    if (!livreur) {
      return res.status(404).json({
        success: false,
        message: 'Livreur introuvable ou vous n\'avez pas accès à ce profil.',
      });
    }

    await Promise.all([
      Livreur.findByIdAndDelete(livreur._id),
      User.findByIdAndDelete(livreur.utilisateur),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Compte livreur supprimé définitivement.',
    });
  } catch (erreur) {
    console.error('Erreur supprimerLivreur (vendeur):', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
