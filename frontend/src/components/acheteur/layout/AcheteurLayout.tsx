import type { ReactNode } from 'react';
import TopNavBar from './TopNavBar';
import Footer from './Footer';
import NotificationPanier from '../panier/NotificationPanier';

interface Props {
  children: ReactNode;
}

/**
 * Mise en page commune de l'interface acheteur.
 * Le TiroirPanier est retiré d'ici — il vit uniquement sur la PanierPage.
 */
export default function AcheteurLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <TopNavBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <NotificationPanier />
    </div>
  );
}
