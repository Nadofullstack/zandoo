import Commande from '../../models/Commande.js';
import Vendeur from '../../models/Vendeur.js';

const getVendeurId = async (userId) => {
  const v = await Vendeur.findOne({ utilisateur: userId, statut: 'approuve' }).select('_id');
  return v ? v._id : null;
};

/**
 * GET /api/vendeur/commandes
 * Liste des commandes contenant des produits du vendeur.
 */
export const getMesCommandes = async (req, res) => {
  try {
    const vendeurId = await getVendeurId(req.user._id);
    if (!vendeurId) {
      return res.status(403).json({ success: false, message: 'Boutique non approuvée.' });
    }

    const { page = 1, limite = 20, statut, recherche = '' } = req.query;
    const filtre = { 'lignes.vendeur': vendeurId };
    if (statut) filtre.statut = statut;

    const saut = (Number(page) - 1) * Number(limite);
    const [commandes, total] = await Promise.all([
      Commande.find(filtre)
        .populate('acheteur', 'fullName email phone')
        .sort({ createdAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Commande.countDocuments(filtre),
    ]);

    /* On filtre les lignes pour ne retourner que celles du vendeur */
    const commandesFiltrees = commandes.map((cmd) => ({
      ...cmd,
      lignes: cmd.lignes.filter((l) => l.vendeur.toString() === vendeurId.toString()),
    }));

    return res.status(200).json({
      success: true,
      data: {
        commandes: commandesFiltrees,
        pagination: {
          total, page: Number(page), limite: Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getMesCommandes:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * PATCH /api/vendeur/commandes/:id/statut
 * Le vendeur peut passer une commande à "expediee" uniquement.
 */
export const marquerCommande = async (req, res) => {
  try {
    const vendeurId = await getVendeurId(req.user._id);
    if (!vendeurId) {
      return res.status(403).json({ success: false, message: 'Boutique non approuvée.' });
    }

    const { statut } = req.body;
    const STATUTS_AUTORISES = ['expediee'];
    if (!STATUTS_AUTORISES.includes(statut)) {
      return res.status(422).json({
        success: false,
        message: `Statut non autorisé. Valeurs acceptées : ${STATUTS_AUTORISES.join(', ')}.`,
      });
    }

    const commande = await Commande.findOne({
      _id: req.params.id,
      'lignes.vendeur': vendeurId,
    });

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    if (commande.statut !== 'payee') {
      return res.status(422).json({
        success: false,
        message: 'La commande doit être payée avant de pouvoir être expédiée.',
      });
    }

    commande.statut = statut;
    await commande.save();

    return res.status(200).json({
      success: true,
      message: 'Statut de la commande mis à jour.',
      data: { commande },
    });
  } catch (erreur) {
    console.error('Erreur marquerCommande:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * GET /api/vendeur/commandes/:id
 * Détail d'une commande (lignes du vendeur uniquement).
 */
export const getCommandeParId = async (req, res) => {
  try {
    const vendeurId = await getVendeurId(req.user._id);
    if (!vendeurId) {
      return res.status(403).json({ success: false, message: 'Boutique non approuvée.' });
    }

    const commande = await Commande.findOne({
      _id: req.params.id,
      'lignes.vendeur': vendeurId,
    })
      .populate('acheteur', 'fullName email phone')
      .lean();

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    return res.status(200).json({
      success: true,
      data: { commande },
    });
  } catch (erreur) {
    console.error('Erreur getCommandeParId vendeur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
