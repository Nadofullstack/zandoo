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
import GardeRouteAdmin from './components/admin/layout/GardeRouteAdmin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Auth ───────────────────────────────────────────────────────── */}
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/connexion"   element={<LoginPage />} />

        {/* ── Admin ──────────────────────────────────────────────────────── */}
        <Route path="/admin" element={<GardeRouteAdmin><TableauDeBordAdmin /></GardeRouteAdmin>} />

        {/* Utilisateurs */}
        <Route path="/admin/utilisateurs"     element={<GardeRouteAdmin><ListeUtilisateursAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/utilisateurs/:id" element={<GardeRouteAdmin><ProfilUtilisateurAdmin /></GardeRouteAdmin>} />

        {/* Vendeurs */}
        <Route path="/admin/vendeurs"         element={<GardeRouteAdmin><ListeVendeursAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/vendeurs/:id"     element={<GardeRouteAdmin><ProfilVendeurAdmin /></GardeRouteAdmin>} />

        {/* Produits */}
        <Route path="/admin/produits"         element={<GardeRouteAdmin><ListeProduitsAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/produits/nouveau" element={<GardeRouteAdmin><CreerProduitAdmin /></GardeRouteAdmin>} />
        <Route path="/admin/produits/:id"     element={<GardeRouteAdmin><DetailProduitAdmin /></GardeRouteAdmin>} />

        {/* Catégories */}
        <Route path="/admin/categories" element={<GardeRouteAdmin><GestionCategoriesAdmin /></GardeRouteAdmin>} />

        {/* ── Défaut ─────────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/inscription" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
