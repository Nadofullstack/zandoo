import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingBag,
  Tag,
  LogOut,
  ShoppingCart,
} from 'lucide-react';
import { logoutUser, lireSession, supprimerSession } from '../../../services/auth/authService';
import logo from '../../../assets/logo.jpg';

interface LienNav {
  vers: string;
  libelle: string;
  icone: typeof Store;
  exact?: boolean;
}

interface SidebarVendeurProps {
  ouvert?: boolean;
  fermer?: () => void;
}

const LIENS: LienNav[] = [
  { vers: '/vendeur/tableau-de-bord', libelle: 'Tableau de bord', icone: LayoutDashboard, exact: true },
  { vers: '/vendeur/boutique',        libelle: 'Ma boutique',      icone: Store                       },
  { vers: '/vendeur/produits',        libelle: 'Mes produits',     icone: Package                     },
  { vers: '/vendeur/commandes',       libelle: 'Commandes',        icone: ShoppingBag                 },
  { vers: '/vendeur/promotions',      libelle: 'Promotions',       icone: Tag                         },
];

/**
 * Barre latérale de navigation — espace vendeur.
 * - Desktop (lg+) : toujours visible à gauche
 * - Mobile/tablette : drawer qui glisse depuis la gauche
 */
export default function SidebarVendeur({ ouvert = false, fermer }: SidebarVendeurProps) {
  const navigate = useNavigate();
  const session  = lireSession();

  const seDeconnecter = () => {
    supprimerSession();
    navigate('/connexion', { replace: true });
    logoutUser().catch(() => {});
  };

  const handleNavClick = () => {
    if (fermer) fermer();
  };

  return (
    <>
      {/* ── Overlay sombre (mobile/tablette uniquement) ──────────────────── */}
      {ouvert && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={fermer}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className={[
          // Base
          'fixed top-0 left-0 h-full z-40 w-64 bg-primary flex flex-col',
          'transition-transform duration-300 ease-in-out',
          // Desktop : toujours visible, position statique dans le flux
          'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shrink-0',
          // Mobile/tablette : drawer
          ouvert ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
        ].join(' ')}
        aria-label="Navigation vendeur"
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="relative">
            <img src={logo} alt="ZANDOO" className="h-8 w-8 rounded-lg object-contain" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-primary" />
          </div>
          <div>
            <p className="text-white font-extrabold text-sm leading-tight">ZANDOO</p>
            <p className="text-accent/80 text-xs font-medium">Vendeur</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Menu vendeur">
          {LIENS.map(({ vers, libelle, icone: Icone, exact }) => (
            <NavLink
              key={vers}
              to={vers}
              end={exact}
              onClick={handleNavClick}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-white shadow-lg shadow-accent/30'
                    : 'text-white/60 hover:bg-white/10 hover:text-white',
                ].join(' ')
              }
            >
              <Icone size={17} aria-hidden="true" />
              {libelle}
            </NavLink>
          ))}
        </nav>

        {/* Utilisateur + déconnexion */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          {session && (
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-black text-accent flex-shrink-0">
                {session.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{session.fullName}</p>
                <p className="text-white/40 text-[10px] truncate">{session.email}</p>
              </div>
            </div>
          )}

          {/* Bouton switch vers espace acheteur — visible uniquement si l'utilisateur est aussi acheteur */}
          {session?.estVendeur && (
            <button
              onClick={() => { if (fermer) fermer(); navigate('/'); }}
              className="w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
            >
              <ShoppingCart size={17} aria-hidden="true" />
              Espace acheteur
            </button>
          )}

          <button
            onClick={seDeconnecter}
            className="w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={17} aria-hidden="true" />
            Se déconnecter
          </button>
          <p className="text-white/20 text-xs mt-3 px-1">© {new Date().getFullYear()} ZANDOO</p>
        </div>
      </aside>
    </>
  );
}
