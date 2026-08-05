import type { ReactNode } from 'react';
import SidebarVendeur from './SidebarVendeur';

interface Props {
  children: ReactNode;
}

export default function DispositionVendeur({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <SidebarVendeur />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
