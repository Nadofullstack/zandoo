import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import TableauDeBordAdmin from './pages/admin/vendeur/TableauDeBordAdmin';
import ListeVendeursAdmin from './pages/admin/vendeur/ListeVendeursAdmin';
import ProfilVendeurAdmin from './pages/admin/vendeur/ProfilVendeurAdmin';
import ListeProduitsAdmin from './pages/admin/produit/ListeProduitsAdmin';
import CreerProduitAdmin from './pages/admin/produit/CreerProduitAdmin';
import DetailProduitAdmin from './pages/admin/produit/DetailProduitAdmin';
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
import GardeRouteAdmin from './components/admin/layout/GardeRouteAdmin';
import GardeLivreur from './components/admin/livreurs/GardeLivreur';
import ActivationPage from './pages/livreur/ActivationPage';
import ChangerMotDePassePage from './pages/livreur/ChangerMotDePassePage';
import CompleterProfilPage from './pages/livreur/CompleterProfilPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Auth ───────────────────────────────────────────────────────── */}
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/connexion"   element={<LoginPage />} />

        {/* ── Livreur — flux d'activation (public, token dans l'URL) ─────── */}
        <Route path="/livreur/activation/:token"                          element={<ActivationPage />} />
        <Route path="/livreur/activation/:token/changer-mot-de-passe"    element={<ChangerMotDePassePage />} />

        {/* ── Livreur — pages protégées (JWT + rôle livreur) ─────────────── */}
        <Route
          path="/livreur/completer-profil"
          element={<GardeLivreur><CompleterProfilPage /></GardeLivreur>}
        />

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

        {/* Produits */}
        <Route path="/admin/produits"         element={<GardeRouteAdmin><ListeProduitsAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/produits/nouveau" element={<GardeRouteAdmin><CreerProduitAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/produits/:id"     element={<GardeRouteAdmin><DetailProduitAdmin /></GardeRouteAdmin>} />

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
        <Route path="*" element={<Navigate to="/inscription" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
