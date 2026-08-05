import Commande from '../../models/Commande.js';
import Produit from '../../models/Produit.js';
import Vendeur from '../../models/Vendeur.js';

/**
 * GET /api/vendeur/tableau-de-bord
 * Statistiques globales pour le tableau de bord vendeur.
 */
export const getTableauDeBord = async (req, res) => {
  try {
    const vendeur = await Vendeur.findOne({ utilisateur: req.user._id, statut: 'approuve' }).select('_id');
    if (!vendeur) {
      return res.status(403).json({ success: false, message: 'Boutique non approuvée.' });
    }

    const vendeurId = vendeur._id;

    /* Compter les produits */
    const [totalProduits, prodEnRupture, prodEnStock, prodFaible] = await Promise.all([
      Produit.countDocuments({ vendeur: vendeurId }),
      Produit.countDocuments({ vendeur: vendeurId, statut: 'en_rupture' }),
      Produit.countDocuments({ vendeur: vendeurId, statut: 'en_stock' }),
      Produit.countDocuments({ vendeur: vendeurId, statut: 'faible' }),
    ]);

    /* Commandes contenant au moins un produit de ce vendeur */
    const commandesVendeur = await Commande.find({
      'lignes.vendeur': vendeurId,
      statut: { $ne: 'annulee' },
    })
      .select('lignes statut total createdAt')
      .lean();

    /* Calculer le chiffre d'affaires : somme des sous-totaux des lignes du vendeur */
    let chiffreAffaires = 0;
    let totalCommandes = commandesVendeur.length;

    commandesVendeur.forEach((cmd) => {
      cmd.lignes.forEach((ligne) => {
        if (ligne.vendeur.toString() === vendeurId.toString()) {
          chiffreAffaires += ligne.sousTotal || 0;
        }
      });
    });

    /* Commandes par statut */
    const statsParStatut = await Commande.aggregate([
      { $match: { 'lignes.vendeur': vendeurId } },
      { $group: { _id: '$statut', nombre: { $sum: 1 } } },
    ]);

    const commandesParStatut = {
      en_attente: 0, payee: 0, expediee: 0, livree: 0, annulee: 0,
    };
    statsParStatut.forEach(({ _id, nombre }) => {
      if (_id in commandesParStatut) commandesParStatut[_id] = nombre;
    });

    /* Dernières commandes (5 dernières) */
    const dernieresCommandes = await Commande.find({ 'lignes.vendeur': vendeurId })
      .select('numero statut total createdAt acheteur')
      .populate('acheteur', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        produits: {
          total: totalProduits,
          enStock: prodEnStock,
          faible: prodFaible,
          enRupture: prodEnRupture,
        },
        commandes: {
          total: totalCommandes,
          parStatut: commandesParStatut,
          dernieres: dernieresCommandes,
        },
        chiffreAffaires,
      },
    });
  } catch (erreur) {
    console.error('Erreur getTableauDeBord:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * GET /api/vendeur/tableau-de-bord/statistiques-ventes
 * Statistiques de ventes sur les 30 derniers jours (par jour).
 */
export const getStatistiquesVentes = async (req, res) => {
  try {
    const vendeur = await Vendeur.findOne({ utilisateur: req.user._id, statut: 'approuve' }).select('_id');
    if (!vendeur) {
      return res.status(403).json({ success: false, message: 'Boutique non approuvée.' });
    }

    const il30Jours = new Date();
    il30Jours.setDate(il30Jours.getDate() - 30);

    const stats = await Commande.aggregate([
      {
        $match: {
          'lignes.vendeur': vendeur._id,
          createdAt: { $gte: il30Jours },
          statut: { $ne: 'annulee' },
        },
      },
      {
        $group: {
          _id: {
            annee: { $year: '$createdAt' },
            mois:  { $month: '$createdAt' },
            jour:  { $dayOfMonth: '$createdAt' },
          },
          nombreCommandes: { $sum: 1 },
        },
      },
      { $sort: { '_id.annee': 1, '_id.mois': 1, '_id.jour': 1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: { statsVentes: stats },
    });
  } catch (erreur) {
    console.error('Erreur getStatistiquesVentes:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
