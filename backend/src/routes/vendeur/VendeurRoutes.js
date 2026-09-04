import { Router } from 'express';
import { validationResult } from 'express-validator';
import {
  soumettreInscription,
  getStatutInscription,
} from '../../controllers/vendeur/VendeurInscriptionControleur.js';
import {
  getBoutique,
  mettreAJourBoutique,
} from '../../controllers/vendeur/VendeurBoutiqueControleur.js';
import {
  getMesProduits,
  getStatistiquesProduits,
  creerProduit,
  getProduitParId,
  modifierProduit,
  supprimerProduit,
  mettreAJourStock,
  modifierStatutProduit,
} from '../../controllers/vendeur/VendeurProduitControleur.js';
import {
  getMesCommandes,
  getCommandeParId,
  marquerCommande,
  getStatistiquesCommandes,
  annulerCommande,
} from '../../controllers/vendeur/VendeurCommandeControleur.js';
import {
  getMesPromotions,
  gererPromotion,
} from '../../controllers/vendeur/VendeurPromotionControleur.js';
import {
  getTableauDeBord,
  getStatistiquesVentes,
} from '../../controllers/vendeur/VendeurTableauDeBordControleur.js';
import { getCategoriesPlates, creerCategorie } from '../../controllers/vendeur/VendeurCategorieControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';
import { uploadPhotos as multerPhotos, uploadVideo as multerVideo } from '../../config/cloudinary.js';
import { uploadPhotos as uploadPhotosCtrl, uploadVideo as uploadVideoCtrl } from '../../controllers/admin/AdminCloudinaryControleur.js';
import {
  validerFiltresCommandesVendeur,
  validerChangementStatutVendeur,
  validerIdCommande,
} from '../../validators/commandeValidators.js';

const routeur = Router();

/* ── Middleware de gestion des erreurs de validation ─────────────────────── */
const gererErreurs = (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(422).json({ success: false, errors: erreurs.array() });
  }
  next();
};

/* ── Routes accessibles à tout utilisateur connecté ─────────────────────── */
routeur.post('/inscription',       protect, soumettreInscription);
routeur.get('/statut-inscription', protect, getStatutInscription);

/* ── Routes protégées (JWT + rôle vendeur) ───────────────────────────────── */
const auth = [protect, requireRole('vendeur')];

/* Tableau de bord */
routeur.get('/tableau-de-bord',                     ...auth, getTableauDeBord);
routeur.get('/tableau-de-bord/statistiques-ventes', ...auth, getStatistiquesVentes);

/* Boutique */
routeur.get('/boutique',   ...auth, getBoutique);
routeur.patch('/boutique', ...auth, mettreAJourBoutique);

/* Produits */
routeur.get('/produits/statistiques',  ...auth, getStatistiquesProduits);
routeur.get('/produits',               ...auth, getMesProduits);
routeur.post('/produits',              ...auth, creerProduit);
routeur.get('/produits/:id',           ...auth, getProduitParId);
routeur.put('/produits/:id',           ...auth, modifierProduit);
routeur.delete('/produits/:id',        ...auth, supprimerProduit);
routeur.patch('/produits/:id/stock',   ...auth, mettreAJourStock);
routeur.patch('/produits/:id/statut',  ...auth, modifierStatutProduit);

/* Commandes — statistiques doit être AVANT /:id pour éviter le conflit de route */
routeur.get('/commandes/statistiques',
  ...auth,
  getStatistiquesCommandes
);
routeur.get('/commandes',
  ...auth,
  validerFiltresCommandesVendeur,
  gererErreurs,
  getMesCommandes
);
routeur.get('/commandes/:id',
  ...auth,
  validerIdCommande,
  gererErreurs,
  getCommandeParId
);
routeur.patch('/commandes/:id/statut',
  ...auth,
  validerChangementStatutVendeur,
  gererErreurs,
  marquerCommande
);
routeur.patch('/commandes/:id/annuler',
  ...auth,
  validerIdCommande,
  gererErreurs,
  annulerCommande
);

/* Promotions */
routeur.get('/promotions',             ...auth, getMesPromotions);
routeur.patch('/promotions/:produitId',...auth, gererPromotion);

/* Upload photos */
routeur.post(
  '/upload/photos',
  ...auth,
  (req, res, next) => {
    multerPhotos.array('photos', 10)(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  uploadPhotosCtrl
);

/* Upload vidéo */
routeur.post(
  '/upload/video',
  ...auth,
  (req, res, next) => {
    multerVideo.single('video')(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  uploadVideoCtrl
);

/* Catégories */
routeur.get('/categories',  ...auth, getCategoriesPlates);
routeur.post('/categories', ...auth, creerCategorie);

export default routeur;
