import type { ReactNode } from 'react';
import BrandPanel from './RegisterBrandPanel';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#eef1f8] flex items-center justify-center px-4 py-6">
      {/* Conteneur global — largeur max réduite, centré */}
      <div className="w-full max-w-4xl flex rounded-2xl shadow-2xl overflow-hidden">

        {/* Panneau gauche — branding */}
        <BrandPanel />

        {/* Panneau droit — formulaire */}
        <section className="flex-1 flex flex-col justify-center items-center px-6 py-5 bg-white">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </section>

      </div>
    </main>
  );
}
