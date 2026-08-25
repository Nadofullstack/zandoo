import React from 'react';
import DispositionAdmin from '../../components/admin/layout/DispositionAdmin';
import { AdminDashboardGraphiques } from '../../components/admin/dashboard';

/**
 * Page: Aperçu du Dashboard Admin
 * 
 * Affiche les graphiques et statistiques des utilisateurs
 * - Accès réservé aux administrateurs
 * - Données mises à jour en temps réel
 * - Graphiques interactifs avec Chart.js
 */

const PageDashboard: React.FC = () => {
  return (
    <DispositionAdmin>
      <AdminDashboardGraphiques />
    </DispositionAdmin>
  );
};

export default PageDashboard;
