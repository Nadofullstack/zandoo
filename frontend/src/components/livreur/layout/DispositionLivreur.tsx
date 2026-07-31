import type { ReactNode } from 'react';
import SidebarLivreur from './SidebarLivreur';

interface Props {
  children: ReactNode;
}

export default function DispositionLivreur({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <SidebarLivreur />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
