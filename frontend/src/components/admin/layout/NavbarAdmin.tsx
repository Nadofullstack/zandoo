import { Menu, X } from 'lucide-react';
import logo from '../../../assets/logo.jpg';

interface NavbarAdminProps {
  ouvert: boolean;
  basculerMenu: () => void;
}

/**
 * Barre de navigation supérieure pour mobile et tablette.
 * Contient le logo et le bouton hamburger pour ouvrir/fermer le menu.
 */
export default function NavbarAdmin({ ouvert, basculerMenu }: NavbarAdminProps) {
  return (
    <nav className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-primary border-b border-white/10 px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="ZANDOO" className="h-8 w-8 rounded-lg object-contain" />
        <div>
          <p className="text-white font-extrabold text-sm leading-tight">ZANDOO</p>
          <p className="text-white/50 text-xs">Administration</p>
        </div>
      </div>

      {/* Bouton hamburger */}
      <button
        onClick={basculerMenu}
        className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
        aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={ouvert}
      >
        {ouvert ? <X size={24} /> : <Menu size={24} />}
      </button>
    </nav>
  );
}
