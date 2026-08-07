import Commande from '../../models/Commande.js';

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/commandes
   Liste paginée des commandes de l'acheteur connecté.
   Regroupées par groupeCommandeId si demandé (vue "mes commandes").
───────────────────────────────────────────────────────────────────────────── */
export const getMesCommandes = async (req, res) => {
  try {
    const {
      statut,
      page   = 1,
      limite = 10,
    } = req.query;

    const filtre = { acheteur: req.user._id };
    if (statut) filtre.statut = statut;

    const saut = (Number(page) - 1) * Number(limite);

    const [commandes, total] = await Promise.all([
      Commande.find(filtre, {
        notesAdmin:         0,
        adresseFacturation: 0,
        notesVendeur:       0,
        historiqueStatut:   0,
      })
        .populate('vendeur', 'nomEntreprise logo slug')
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
    console.error('Erreur getMesCommandes acheteur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/commandes/:id
   Détail d'une commande appartenant à l'acheteur connecté.
───────────────────────────────────────────────────────────────────────────── */
export const getCommandeParId = async (req, res) => {
  try {
    const commande = await Commande.findOne({ _id: req.params.id, acheteur: req.user._id })
      .populate('vendeur',       'nomEntreprise emailContact telephoneContact logo slug')
      .populate('lignes.produit','nom reference photoCouverture slug')
      .lean();

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    return res.status(200).json({ success: true, data: { commande } });
  } catch (erreur) {
    console.error('Erreur getCommandeParId acheteur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/commandes/groupe/:groupeCommandeId
   Toutes les sous-commandes d'un même passage en caisse.
───────────────────────────────────────────────────────────────────────────── */
export const getGroupeCommandes = async (req, res) => {
  try {
    const { groupeCommandeId } = req.params;

    const commandes = await Commande.find({
      groupeCommandeId,
      acheteur: req.user._id,
    })
      .populate('vendeur',       'nomEntreprise logo slug')
      .populate('lignes.produit','nom reference photoCouverture slug')
      .lean();

    if (commandes.length === 0) {
      return res.status(404).json({ success: false, message: 'Groupe de commandes introuvable.' });
    }

    const total = commandes.reduce((acc, c) => acc + c.total, 0);

    return res.status(200).json({
      success: true,
      data: { groupeCommandeId, commandes, totalGlobal: total },
    });
  } catch (erreur) {
    console.error('Erreur getGroupeCommandes:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
