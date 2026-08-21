import Produit from '../../models/Produit.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

const STATUTS_VALIDES = ['en_stock', 'en_rupture', 'faible'];

/** Projection légère pour la liste */
const PROJECTION_LISTE = {
  description: 0,
  attributs: 0,
  historiqueStatut: 0,
  notesAdmin: 0,
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/produits/statistiques
   Vue globale : tous les produits de tous les vendeurs.
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesProduits = async (_req, res) => {
  try {
    const [enStock, enRupture, faible, total] = await Promise.all([
      Produit.countDocuments({ statut: 'en_stock' }),
      Produit.countDocuments({ statut: 'en_rupture' }),
      Produit.countDocuments({ statut: 'faible' }),
      Produit.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: { statistiques: { enStock, enRupture, faible, total } },
    });
  } catch (erreur) {
    console.error('Erreur getStatistiquesProduits:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/produits
   Liste paginée de TOUS les produits (tous vendeurs confondus).
   Filtres : statut, catégorie, vendeur, recherche texte.
───────────────────────────────────────────────────────────────────────────── */
export const getProduits = async (req, res) => {
  try {
    const {
      statut,
      categorie,
      vendeur,
      recherche = '',
      page  = 1,
      limite = 20,
    } = req.query;

    const filtre = {};

    if (statut && STATUTS_VALIDES.includes(statut))  filtre.statut    = statut;
    if (categorie)                                    filtre.categorie = categorie;
    if (vendeur)                                      filtre.vendeur   = vendeur;

    if (recherche.trim()) {
      filtre.$text = { $search: recherche.trim() };
    }

    const saut = (Number(page) - 1) * Number(limite);

    const [produits, total] = await Promise.all([
      Produit.find(filtre, PROJECTION_LISTE)
        .populate('categorie', 'nom slug')
        .populate('vendeur',   'nomEntreprise')
        .sort({ createdAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Produit.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        produits,
        pagination: {
          total,
          page:       Number(page),
          limite:     Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getProduits:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/produits/:id
───────────────────────────────────────────────────────────────────────────── */
export const getProduitParId = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id)
      .populate('categorie', 'nom slug attributs')
      .populate('vendeur',   'nomEntreprise emailContact')
      .populate('historiqueStatut.modifiePar', 'fullName email')
      .lean();

    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    return res.status(200).json({ success: true, data: { produit } });
  } catch (erreur) {
    console.error('Erreur getProduitParId:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/produits/:id/statut
   Modération : l'admin peut changer le statut d'un produit (vendeur).
───────────────────────────────────────────────────────────────────────────── */
export const modifierStatutProduit = async (req, res) => {
  try {
    const { statut, raison = '' } = req.body;

    if (!STATUTS_VALIDES.includes(statut)) {
      return res.status(422).json({
        success: false,
        message: `Statut invalide. Valeurs : ${STATUTS_VALIDES.join(', ')}.`,
      });
    }

    const produit = await Produit.findById(req.params.id);
    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    produit.statut  = statut;
    /* Synchronise le booléen enStock avec le statut */
    produit.enStock = statut !== 'en_rupture';

    produit.historiqueStatut.push({
      statut,
      modifiePar: req.user._id,
      raison:     raison.trim().slice(0, 500),
      modifieAt:  new Date(),
    });

    await produit.save();

    const miseAJour = await Produit.findById(produit._id)
      .populate('categorie', 'nom slug')
      .populate('vendeur', 'nomEntreprise')
      .lean();

    return res.status(200).json({
      success: true,
      message: `Produit ${statut}.`,
      data: { produit: miseAJour },
    });
  } catch (erreur) {
    console.error('Erreur modifierStatutProduit:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/admin/produits/:id
   Modération : l'admin peut supprimer un produit frauduleux ou non conforme.
───────────────────────────────────────────────────────────────────────────── */
export const supprimerProduit = async (req, res) => {
  try {
    const produit = await Produit.findByIdAndDelete(req.params.id);
    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès.',
    });
  } catch (erreur) {
    console.error('Erreur supprimerProduit:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
