import Vendeur from '../../models/Vendeur.js';
import User from '../../models/User.js';

/**
 * POST /api/vendeur/inscription
 * Soumet une demande pour devenir vendeur.
 * L'utilisateur doit être connecté (rôle acheteur).
 */
export const soumettreInscription = async (req, res) => {
  try {
    const userId = req.user._id;

    /* Vérifier qu'il n'a pas déjà une demande */
    const demandeExistante = await Vendeur.findOne({ utilisateur: userId });
    if (demandeExistante) {
      return res.status(409).json({
        success: false,
        message: 'Vous avez déjà soumis une demande vendeur.',
        data: { statut: demandeExistante.statut },
      });
    }

    const {
      nomEntreprise,
      typeEntreprise,
      secteurActivite,
      adresse,
      emailContact,
      telephoneContact,
      conditionsAcceptees,
    } = req.body;

    if (!conditionsAcceptees) {
      return res.status(422).json({
        success: false,
        message: 'Vous devez accepter les conditions d\'utilisation.',
      });
    }

    if (!nomEntreprise?.trim()) {
      return res.status(422).json({
        success: false,
        message: 'Le nom de l\'entreprise est requis.',
      });
    }

    const vendeur = await Vendeur.create({
      utilisateur: userId,
      nomEntreprise: nomEntreprise.trim(),
      typeEntreprise: typeEntreprise || 'individuel',
      secteurActivite: secteurActivite?.trim() || '',
      adresse: adresse || {},
      emailContact: emailContact?.trim().toLowerCase() || req.user.email,
      telephoneContact: telephoneContact?.trim() || req.user.phone,
      conditionsAcceptees: true,
      conditionsAccepteesAt: new Date(),
      statut: 'en_attente',
    });

    return res.status(201).json({
      success: true,
      message: 'Demande soumise avec succès. Elle sera examinée par l\'équipe ZANDOO.',
      data: { vendeur },
    });
  } catch (erreur) {
    console.error('Erreur soumettreInscription:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * GET /api/vendeur/statut-inscription
 * Retourne le statut de la demande vendeur de l'utilisateur connecté.
 */
export const getStatutInscription = async (req, res) => {
  try {
    const vendeur = await Vendeur.findOne({ utilisateur: req.user._id })
      .select('statut nomEntreprise conditionsAcceptees createdAt')
      .lean();

    if (!vendeur) {
      return res.status(200).json({
        success: true,
        data: { vendeur: null },
      });
    }

    return res.status(200).json({
      success: true,
      data: { vendeur },
    });
  } catch (erreur) {
    console.error('Erreur getStatutInscription:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
