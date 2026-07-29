import type { ReactNode } from 'react';
import TopNavBar from './TopNavBar';
import Footer from './Footer';

interface Props {
  children: ReactNode;
}

/**
 * Mise en page commune de l'interface acheteur :
 * TopNavBar en haut, Footer en bas, contenu principal au centre.
 */
export default function AcheteurLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <TopNavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
