import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './src/config/db.js';
import routesAuth             from './src/routes/AuthRoutes.js';
import routesAdminVendeur     from './src/routes/admin/AdminVendeurRoutes.js';
import routesAdminProduit     from './src/routes/admin/AdminProduitRoutes.js';
import routesAdminCategorie   from './src/routes/admin/AdminCategorieRoutes.js';
import routesAdminUtilisateur from './src/routes/admin/AdminUtilisateurRoutes.js';
import routesAdminCommande    from './src/routes/admin/AdminCommandeRoutes.js';
import routesAdminReclamation from './src/routes/admin/AdminReclamationRoutes.js';
import routesAdminPublicite   from './src/routes/admin/AdminPubliciteRoutes.js';
import routesAdminPageStatique from './src/routes/admin/AdminPageStatiqueRoutes.js';
import routesAdminArticle     from './src/routes/admin/AdminArticleRoutes.js';
import routesAdminLivreur     from './src/routes/admin/AdminLivreurRoutes.js';
import routesAdminUpload      from './src/routes/admin/AdminCloudinaryRoutes.js';
import routesVendeur          from './src/routes/VendeurRoutes.js';
import routesLivreur          from './src/routes/LivreurRoutes.js';
import routesAcheteurAccueil  from './src/routes/acheteur/AcheteurAccueilRoutes.js';
import routesAcheteurCatalogue from './src/routes/acheteur/AcheteurCatalogueRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',                 routesAuth);
app.use('/api/admin/vendeurs',       routesAdminVendeur);
app.use('/api/admin/produits',       routesAdminProduit);
app.use('/api/admin/categories',     routesAdminCategorie);
app.use('/api/admin/utilisateurs',   routesAdminUtilisateur);
app.use('/api/admin/commandes',      routesAdminCommande);
app.use('/api/admin/reclamations',   routesAdminReclamation);
app.use('/api/admin/publicites',     routesAdminPublicite);
app.use('/api/admin/pages-statiques',routesAdminPageStatique);
app.use('/api/admin/articles',       routesAdminArticle);
app.use('/api/admin/livreurs',       routesAdminLivreur);
app.use('/api/admin/upload',         routesAdminUpload);
app.use('/api/vendeur',              routesVendeur);
app.use('/api/livreur',              routesLivreur);
app.use('/api/acheteur/accueil',    routesAcheteurAccueil);
app.use('/api/acheteur/produits',   routesAcheteurCatalogue);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'ZANDOO API is running 🚀' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({ success: false, message: 'Erreur serveur interne' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
