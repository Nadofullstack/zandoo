import Commande from '../../models/Commande.js';
import Vendeur from '../../models/Vendeur.js';
import { envoyerChangementStatutAcheteur } from '../../services/emailService.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Helper — récupère l'_id Vendeur de l'utilisateur connecté (approuvé)
───────────────────────────────────────────────────────────────────────────── */
async function getVendeurApprouve(userId) {
  const vendeur = await Vendeur.findOne({ utilisateur: userId, statut: 'approuve' }).select('_id').lean();
  return vendeur?._id ?? null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/vendeur/commandes
   Liste paginée des commandes de la boutique du vendeur connecté.
   Une commande = un vendeur → on filtre par { vendeur: vendeurId }.
───────────────────────────────────────────────────────────────────────────── */
export const getMesCommandes = async (req, res) => {
  try {
    const vendeurId = await getVendeurApprouve(req.user._id);
    if (!vendeurId) {
      return res.status(403).json({ success: false, message: 'Boutique non approuvée.' });
    }

    const {
      statut,
      recherche = '',
      page   = 1,
      limite = 20,
    } = req.query;

    const filtre = { vendeur: vendeurId };
    if (statut) filtre.statut = statut;
    if (recherche.trim()) {
      filtre.numero = new RegExp(recherche.trim(), 'i');
    }

    const saut = (Number(page) - 1) * Number(limite);

    const [commandes, total] = await Promise.all([
      Commande.find(filtre, { notesAdmin: 0, adresseFacturation: 0, historiqueStatut: 0 })
        .populate('acheteur', 'fullName email phone')
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
    console.error('Erreur getMesCommandes:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/vendeur/commandes/:id
   Détail d'une commande appartenant à la boutique du vendeur.
───────────────────────────────────────────────────────────────────────────── */
export const getCommandeParId = async (req, res) => {
  try {
    const vendeurId = await getVendeurApprouve(req.user._id);
    if (!vendeurId) {
      return res.status(403).json({ success: false, message: 'Boutique non approuvée.' });
    }

    const commande = await Commande.findOne({ _id: req.params.id, vendeur: vendeurId })
      .populate('acheteur', 'fullName email phone avatar')
      .populate('lignes.produit', 'nom reference photoCouverture slug')
      .populate('historiqueStatut.modifiePar', 'fullName email')
      .lean();

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    return res.status(200).json({ success: true, data: { commande } });
  } catch (erreur) {
    console.error('Erreur getCommandeParId vendeur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/vendeur/commandes/:id/statut
   Le vendeur peut uniquement passer le statut à "en_preparation" ou "expediee".
   Transition autorisée : payee → en_preparation → expediee
───────────────────────────────────────────────────────────────────────────── */
export const marquerCommande = async (req, res) => {
  try {
    const vendeurId = await getVendeurApprouve(req.user._id);
    if (!vendeurId) {
      return res.status(403).json({ success: false, message: 'Boutique non approuvée.' });
    }

    const { statut, notesVendeur = '' } = req.body;

    const STATUTS_AUTORISES = ['en_preparation', 'expediee'];
    if (!STATUTS_AUTORISES.includes(statut)) {
      return res.status(422).json({
        success: false,
        message: `Statut non autorisé. Valeurs acceptées : ${STATUTS_AUTORISES.join(', ')}.`,
      });
    }

    const commande = await Commande.findOne({ _id: req.params.id, vendeur: vendeurId });
    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    /* Contrôle de la machine à états */
    const transitionsValides = {
      en_preparation: ['payee'],
      expediee:       ['en_preparation', 'payee'],
    };

    if (!transitionsValides[statut]?.includes(commande.statut)) {
      return res.status(422).json({
        success: false,
        message: `Transition invalide : "${commande.statut}" → "${statut}".`,
      });
    }

    const maintenant = new Date();
    commande.statut = statut;
    if (statut === 'en_preparation') commande.enPreparationAt = maintenant;
    if (statut === 'expediee')       commande.expedieeAt      = maintenant;

    if (notesVendeur.trim()) {
      commande.notesVendeur = notesVendeur.trim().slice(0, 500);
    }

    commande.historiqueStatut.push({
      statut,
      modifiePar: req.user._id,
      raison:     notesVendeur.trim().slice(0, 300),
      modifieAt:  maintenant,
    });

    await commande.save();

    const miseAJour = await Commande.findById(commande._id)
      .populate('acheteur', 'fullName email phone')
      .populate('lignes.produit', 'nom reference photoCouverture')
      .lean();

    /* Notification email acheteur — best-effort */
    if (miseAJour?.acheteur?.email) {
      const vendeur = await Vendeur.findById(commande.vendeur).select('nomEntreprise').lean();
      envoyerChangementStatutAcheteur({
        emailAcheteur: miseAJour.acheteur.email,
        acheteurNom:   miseAJour.acheteur.fullName,
        numero:        miseAJour.numero,
        statut,
        raison:        notesVendeur.trim() || undefined,
        vendeurNom:    vendeur?.nomEntreprise ?? 'Un vendeur',
      }).catch((err) => console.error('Email statut commande vendeur:', err.message));
    }

    return res.status(200).json({
      success: true,
      message: `Commande passée à "${statut}".`,
      data: { commande: miseAJour },
    });
  } catch (erreur) {
    console.error('Erreur marquerCommande:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/vendeur/commandes/:id/annuler
   Le vendeur peut annuler une commande en statut "en_attente" ou "payee".
───────────────────────────────────────────────────────────────────────────── */
export const annulerCommande = async (req, res) => {
  try {
    const vendeurId = await getVendeurApprouve(req.user._id);
    if (!vendeurId) {
      return res.status(403).json({ success: false, message: 'Boutique non approuvée.' });
    }

    const commande = await Commande.findOne({ _id: req.params.id, vendeur: vendeurId });
    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    const STATUTS_ANNULABLES = ['en_attente', 'payee'];
    if (!STATUTS_ANNULABLES.includes(commande.statut)) {
      return res.status(422).json({
        success: false,
        message: `Impossible d'annuler une commande avec le statut "${commande.statut}".`,
      });
    }

    const { raison = '' } = req.body;
    const maintenant = new Date();

    commande.statut    = 'annulee';
    commande.annuleeAt = maintenant;

    commande.historiqueStatut.push({
      statut:    'annulee',
      modifiePar: req.user._id,
      raison:    raison.trim().slice(0, 300),
      modifieAt: maintenant,
    });

    await commande.save();

    const miseAJour = await Commande.findById(commande._id)
      .populate('acheteur', 'fullName email phone')
      .populate('lignes.produit', 'nom reference photoCouverture')
      .lean();

    /* Notification email acheteur — best-effort */
    if (miseAJour?.acheteur?.email) {
      const vendeur = await Vendeur.findById(commande.vendeur).select('nomEntreprise').lean();
      envoyerChangementStatutAcheteur({
        emailAcheteur: miseAJour.acheteur.email,
        acheteurNom:   miseAJour.acheteur.fullName,
        numero:        miseAJour.numero,
        statut:        'annulee',
        raison:        raison.trim() || undefined,
        vendeurNom:    vendeur?.nomEntreprise ?? 'Un vendeur',
      }).catch((err) => console.error('Email annulation commande vendeur:', err.message));
    }

    return res.status(200).json({
      success: true,
      message: 'Commande annulée.',
      data: { commande: miseAJour },
    });
  } catch (erreur) {
    console.error('Erreur annulerCommande vendeur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/vendeur/commandes/statistiques
   Statistiques rapides pour le tableau de bord vendeur.
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesCommandes = async (req, res) => {
  try {
    const vendeurId = await getVendeurApprouve(req.user._id);
    if (!vendeurId) {
      return res.status(403).json({ success: false, message: 'Boutique non approuvée.' });
    }

    const base = { vendeur: vendeurId };

    const [enAttente, enPreparation, expediees, livrees, annulees, total, ca] = await Promise.all([
      Commande.countDocuments({ ...base, statut: 'en_attente' }),
      Commande.countDocuments({ ...base, statut: 'en_preparation' }),
      Commande.countDocuments({ ...base, statut: 'expediee' }),
      Commande.countDocuments({ ...base, statut: 'livree' }),
      Commande.countDocuments({ ...base, statut: 'annulee' }),
      Commande.countDocuments(base),
      Commande.aggregate([
        { $match: { ...base, statut: { $in: ['payee', 'expediee', 'livree'] } } },
        { $group: { _id: null, chiffreAffaires: { $sum: '$total' } } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        statistiques: {
          enAttente, enPreparation, expediees, livrees, annulees, total,
          chiffreAffaires: ca[0]?.chiffreAffaires ?? 0,
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getStatistiquesCommandes vendeur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
