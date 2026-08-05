import { Router } from 'express';
import {
  soumettreInscription,
  getStatutInscription,
} from '../controllers/vendeur/VendeurInscriptionControleur.js';
import {
  getBoutique,
  mettreAJourBoutique,
} from '../controllers/vendeur/VendeurBoutiqueControleur.js';
import {
  getMesProduits,
  getStatistiquesProduits,
  creerProduit,
  getProduitParId,
  modifierProduit,
  supprimerProduit,
  mettreAJourStock,
  modifierStatutProduit,
} from '../controllers/vendeur/VendeurProduitControleur.js';
import {
  getMesCommandes,
  getCommandeParId,
  marquerCommande,
} from '../controllers/vendeur/VendeurCommandeControleur.js';
import {
  getMesPromotions,
  gererPromotion,
} from '../controllers/vendeur/VendeurPromotionControleur.js';
import {
  getTableauDeBord,
  getStatistiquesVentes,
} from '../controllers/vendeur/VendeurTableauDeBordControleur.js';
import { protect, requireRole } from '../middlewars/authentification.js';
import { uploadPhotos as multerPhotos, uploadVideo as multerVideo } from '../config/cloudinary.js';
import { uploadPhotos as uploadPhotosCtrl, uploadVideo as uploadVideoCtrl } from '../controllers/admin/AdminCloudinaryControleur.js';
import { getCategoriesPlates, creerCategorie } from '../controllers/vendeur/VendeurCategorieControleur.js';


const routeur = Router();

/* ── Routes accessibles à tout utilisateur connecté ─────────────────────── */
/* (acheteur qui veut s'inscrire en tant que vendeur) */
routeur.post('/inscription',       protect, soumettreInscription);
routeur.get('/statut-inscription', protect, getStatutInscription);

/* ── Routes protégées (JWT + rôle vendeur) ───────────────────────────────── */
const auth = [protect, requireRole('vendeur')];

/* Tableau de bord */
routeur.get('/tableau-de-bord',                       ...auth, getTableauDeBord);
routeur.get('/tableau-de-bord/statistiques-ventes',   ...auth, getStatistiquesVentes);

/* Boutique */
routeur.get('/boutique',   ...auth, getBoutique);
routeur.patch('/boutique', ...auth, mettreAJourBoutique);

/* Produits */
routeur.get('/produits/statistiques', ...auth, getStatistiquesProduits);
routeur.get('/produits',              ...auth, getMesProduits);
routeur.post('/produits',             ...auth, creerProduit);
routeur.get('/produits/:id',          ...auth, getProduitParId);
routeur.put('/produits/:id',          ...auth, modifierProduit);
routeur.delete('/produits/:id',       ...auth, supprimerProduit);
routeur.patch('/produits/:id/stock',   ...auth, mettreAJourStock);
routeur.patch('/produits/:id/statut',  ...auth, modifierStatutProduit);

/* Commandes */
routeur.get('/commandes',         ...auth, getMesCommandes);
routeur.get('/commandes/:id',     ...auth, getCommandeParId);
routeur.patch('/commandes/:id/statut', ...auth, marquerCommande);

/* Promotions */
routeur.get('/promotions',                    ...auth, getMesPromotions);
routeur.patch('/promotions/:produitId',       ...auth, gererPromotion);

/* Upload médias (logo, bannière, photos produit) */
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

/* Upload vidéo produit */
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

/* Catégories — lecture + création (pour les vendeurs) */
routeur.get('/categories',            ...auth, getCategoriesPlates);
routeur.post('/categories',           ...auth, creerCategorie);

export default routeur;
