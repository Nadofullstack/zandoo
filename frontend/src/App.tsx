import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AccueilPage from './pages/acheteur/AccueilPage';
import CataloguePage from './pages/acheteur/CataloguePage';
import DetailProduitPage from './pages/acheteur/DetailProduitPage';
import MonComptePage from './pages/acheteur/MonComptePage';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import TableauDeBordAdmin from './pages/admin/vendeur/TableauDeBordAdmin';
import ListeVendeursAdmin from './pages/admin/vendeur/ListeVendeursAdmin';
import ProfilVendeurAdmin from './pages/admin/vendeur/ProfilVendeurAdmin';
import ListeProduitsAdmin from './pages/admin/produit/ListeProduitsAdmin';
import GestionCategoriesAdmin from './pages/admin/categorie/GestionCategoriesAdmin';
import ListeUtilisateursAdmin from './pages/admin/utilisateur/ListeUtilisateursAdmin';
import ProfilUtilisateurAdmin from './pages/admin/utilisateur/ProfilUtilisateurAdmin';
import ListeCommandesAdmin from './pages/admin/commande/ListeCommandesAdmin';
import DetailCommandeAdmin from './pages/admin/commande/DetailCommandeAdmin';
import ListeReclamationsAdmin from './pages/admin/reclamation/ListeReclamationsAdmin';
import DetailReclamationAdmin from './pages/admin/reclamation/DetailReclamationAdmin';
import ListePublicitesAdmin from './pages/admin/publicite/ListePublicitesAdmin';
import FormulairePubliciteAdmin from './pages/admin/publicite/FormulairePubliciteAdmin';
import GestionPagesStatiquesAdmin from './pages/admin/contenu/GestionPagesStatiquesAdmin';
import ListeArticlesAdmin from './pages/admin/contenu/ListeArticlesAdmin';
import EditeurArticleAdmin from './pages/admin/contenu/EditeurArticleAdmin';
import ListeLivreursAdmin from './pages/admin/livreur/ListeLivreursAdmin';
import ProfilLivreurAdmin from './pages/admin/livreur/ProfilLivreurAdmin';
import TableauDeBordLivreurPage from './pages/livreur/TableauDeBordLivreurPage';
import MesLivraisonsPage from './pages/livreur/MesLivraisonsPage';
import HistoriqueLivraisonsPage from './pages/livreur/HistoriqueLivraisonsPage';
import ProfilLivreurPage from './pages/livreur/ProfilLivreurPage';
import GardeRouteAdmin from './components/admin/layout/GardeRouteAdmin';
import GardeLivreur from './components/admin/livreurs/GardeLivreur';
import GardeVendeur from './components/vendeur/GardeVendeur';
import ActivationPage from './pages/livreur/ActivationPage';
import ChangerMotDePassePage from './pages/livreur/ChangerMotDePassePage';
import CompleterProfilPage from './pages/livreur/CompleterProfilPage';
import DevenirVendeurPage from './pages/vendeur/DevenirVendeurPage';
import TableauDeBordVendeurPage from './pages/vendeur/TableauDeBordVendeurPage';
import BoutiquePage from './pages/vendeur/BoutiquePage';
import MesProduitsPage from './pages/vendeur/MesProduitsPage';
import MesCommandesPage from './pages/vendeur/MesCommandesPage';
import PromotionsPage from './pages/vendeur/PromotionsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Acheteur ───────────────────────────────────────────────────────── */}
        <Route path="/"                             element={<AccueilPage />} />
        <Route path="/catalogue"                    element={<CataloguePage />} />
        <Route path="/catalogue/categorie/:slug"    element={<CataloguePage />} />
        <Route path="/produit/:slug"                element={<DetailProduitPage />} />

        {/* ── Auth ───────────────────────────────────────────────────────── */}
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/connexion"   element={<LoginPage />} />

        {/* ── Acheteur — pages protégées ─────────────────────────────────── */}
        <Route path="/mon-compte"    element={<MonComptePage />} />
        <Route path="/mes-commandes" element={<MonComptePage />} />

        {/* ── Vendeur — inscription (public, utilisateur connecté) ───────── */}
        <Route path="/devenir-vendeur" element={<DevenirVendeurPage />} />

        {/* ── Vendeur — espace protégé (JWT + rôle vendeur) ──────────────── */}
        <Route path="/vendeur/tableau-de-bord" element={<GardeVendeur><TableauDeBordVendeurPage /></GardeVendeur>} />
        <Route path="/vendeur/boutique"         element={<GardeVendeur><BoutiquePage /></GardeVendeur>} />
        <Route path="/vendeur/produits"         element={<GardeVendeur><MesProduitsPage /></GardeVendeur>} />
        <Route path="/vendeur/commandes"        element={<GardeVendeur><MesCommandesPage /></GardeVendeur>} />
        <Route path="/vendeur/promotions"       element={<GardeVendeur><PromotionsPage /></GardeVendeur>} />

        {/* ── Livreur — flux d'activation (public, token dans l'URL) ─────── */}
        <Route path="/livreur/activation/:token"                          element={<ActivationPage />} />
        <Route path="/livreur/activation/:token/changer-mot-de-passe"    element={<ChangerMotDePassePage />} />

        {/* ── Livreur — pages protégées (JWT + rôle livreur) ─────────────── */}
        <Route path="/livreur/completer-profil"       element={<GardeLivreur><CompleterProfilPage /></GardeLivreur>} />
        <Route path="/livreur/tableau-de-bord"        element={<GardeLivreur><TableauDeBordLivreurPage /></GardeLivreur>} />
        <Route path="/livreur/mes-livraisons"         element={<GardeLivreur><MesLivraisonsPage /></GardeLivreur>} />
        <Route path="/livreur/historique"             element={<GardeLivreur><HistoriqueLivraisonsPage /></GardeLivreur>} />
        <Route path="/livreur/profil"                 element={<GardeLivreur><ProfilLivreurPage /></GardeLivreur>} />

        {/* ── Admin ──────────────────────────────────────────────────────── */}
        <Route path="/admin" element={<GardeRouteAdmin><TableauDeBordAdmin /></GardeRouteAdmin>} />

        {/* Utilisateurs */}
        <Route path="/admin/utilisateurs"     element={<GardeRouteAdmin><ListeUtilisateursAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/utilisateurs/:id" element={<GardeRouteAdmin><ProfilUtilisateurAdmin /></GardeRouteAdmin>} />

        {/* Vendeurs */}
        <Route path="/admin/vendeurs"         element={<GardeRouteAdmin><ListeVendeursAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/vendeurs/:id"     element={<GardeRouteAdmin><ProfilVendeurAdmin /></GardeRouteAdmin>} />

        {/* Livreurs */}
        <Route path="/admin/livreurs"         element={<GardeRouteAdmin><ListeLivreursAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/livreurs/:id"     element={<GardeRouteAdmin><ProfilLivreurAdmin /></GardeRouteAdmin>} />

        {/* Produits — lecture + modération uniquement */}
        <Route path="/admin/produits" element={<GardeRouteAdmin><ListeProduitsAdmin /></GardeRouteAdmin>} />

        {/* Catégories */}
        <Route path="/admin/categories" element={<GardeRouteAdmin><GestionCategoriesAdmin /></GardeRouteAdmin>} />

        {/* Commandes */}
        <Route path="/admin/commandes"     element={<GardeRouteAdmin><ListeCommandesAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/commandes/:id" element={<GardeRouteAdmin><DetailCommandeAdmin /></GardeRouteAdmin>} />

        {/* Réclamations */}
        <Route path="/admin/reclamations"     element={<GardeRouteAdmin><ListeReclamationsAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/reclamations/:id" element={<GardeRouteAdmin><DetailReclamationAdmin /></GardeRouteAdmin>} />

        {/* Publicités */}
        <Route path="/admin/publicites"          element={<GardeRouteAdmin><ListePublicitesAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/publicites/nouvelle" element={<GardeRouteAdmin><FormulairePubliciteAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/publicites/:id"      element={<GardeRouteAdmin><FormulairePubliciteAdmin /></GardeRouteAdmin>} />

        {/* Contenu — Pages statiques */}
        <Route path="/admin/pages-statiques" element={<GardeRouteAdmin><GestionPagesStatiquesAdmin /></GardeRouteAdmin>} />

        {/* Contenu — Blog */}
        <Route path="/admin/articles"         element={<GardeRouteAdmin><ListeArticlesAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/articles/nouveau" element={<GardeRouteAdmin><EditeurArticleAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/articles/:id"     element={<GardeRouteAdmin><EditeurArticleAdmin /></GardeRouteAdmin>} />

        {/* ── Défaut ─────────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
