import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import SidebarAdmin from './SidebarAdmin';
import NavbarAdmin from './NavbarAdmin';

interface DispositionAdminProps {
  children: ReactNode;
}

/**
 * Disposition principale du panneau d'administration.
 *
 * - Desktop (lg+) : sidebar fixe à gauche + contenu scrollable à droite
 * - Mobile/tablette : navbar avec hamburger en haut + drawer latéral
 */
export default function DispositionAdmin({ children }: DispositionAdminProps) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const location = useLocation();

  // Ferme le menu à chaque changement de route (navigation)
  useEffect(() => {
    setMenuOuvert(false);
  }, [location.pathname]);

  // Bloque le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (menuOuvert) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOuvert]);

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      {/* Sidebar — desktop toujours visible, mobile via drawer */}
      <SidebarAdmin
        ouvert={menuOuvert}
        fermer={() => setMenuOuvert(false)}
      />

      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar mobile/tablette avec hamburger */}
        <NavbarAdmin
          ouvert={menuOuvert}
          basculerMenu={() => setMenuOuvert(prev => !prev)}
        />

        {/* Contenu — padding-top sur mobile pour compenser la navbar fixe */}
        <main className="flex-1 overflow-auto pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
