import type { ReactNode } from 'react';
import SidebarAdmin from './SidebarAdmin';

interface DispositionAdminProps {
  children: ReactNode;
}

/**
 * Disposition principale du panneau d'administration.
 * Sidebar fixe à gauche + zone de contenu scrollable à droite.
 */
export default function DispositionAdmin({ children }: DispositionAdminProps) {
  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <SidebarAdmin />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
