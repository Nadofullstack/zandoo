import { NavLink, useNavigate } from 'react-router-dom';
import {
  Store, LayoutDashboard, Package, Tag, Users,
  ShoppingCart, MessageSquare, Megaphone, FileText, BookOpen, Truck, LogOut,
} from 'lucide-react';
import logo from '../../../assets/logo.jpg';
import { lireSession, logoutUser, supprimerSession } from '../../../services/auth/authService';

interface LienNav {
  vers: string;
  libelle: string;
  icone: typeof Store;
  exact?: boolean;
}

interface SidebarAdminProps {
  ouvert?: boolean;
  fermer?: () => void;
}

const LIENS_NAV: LienNav[] = [
  { vers: '/admin',                 libelle: 'Tableau de bord', icone: LayoutDashboard, exact: true },
  { vers: '/admin/utilisateurs',    libelle: 'Utilisateurs',    icone: Users            },
  { vers: '/admin/vendeurs',        libelle: 'Vendeurs',        icone: Store            },
  { vers: '/admin/livreurs',        libelle: 'Livreurs',        icone: Truck            },
  { vers: '/admin/produits',        libelle: 'Produits',        icone: Package          },
  { vers: '/admin/categories',      libelle: 'Catégories',      icone: Tag              },
  { vers: '/admin/commandes',       libelle: 'Commandes',       icone: ShoppingCart     },
  { vers: '/admin/reclamations',    libelle: 'Réclamations',    icone: MessageSquare    },
  { vers: '/admin/publicites',      libelle: 'Publicités',      icone: Megaphone        },
  { vers: '/admin/pages-statiques', libelle: 'Pages statiques', icone: FileText         },
  { vers: '/admin/articles',        libelle: 'Blog',            icone: BookOpen         },
];

/**
 * Barre latérale de navigation du panneau d'administration.
 * - Desktop (lg+) : toujours visible à gauche
 * - Mobile/tablette : drawer qui glisse depuis la gauche
 */
export default function SidebarAdmin({ ouvert = false, fermer }: SidebarAdminProps) {
  const navigate = useNavigate();
  const session  = lireSession();

  const seDeconnecter = () => {
    supprimerSession();
    navigate('/connexion', { replace: true });
    logoutUser().catch(() => {});
  };

  const handleNavClick = () => {
    // Ferme le menu sur mobile après clic sur un lien
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
        aria-label="Navigation administration"
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
          <img src={logo} alt="ZANDOO" className="h-8 w-8 rounded-lg object-contain" />
          <div>
            <p className="text-white font-extrabold text-sm leading-tight">ZANDOO</p>
            <p className="text-white/50 text-xs">Administration</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Menu principal">
          {LIENS_NAV.map(({ vers, libelle, icone: Icone, exact }) => (
            <NavLink
              key={vers}
              to={vers}
              end={exact}
              onClick={handleNavClick}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                ].join(' ')
              }
            >
              <Icone size={17} aria-hidden="true" />
              {libelle}
            </NavLink>
          ))}
        </nav>

        {/* Pied de sidebar — utilisateur + déconnexion */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          {/* Info utilisateur */}
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

          {/* Bouton déconnexion */}
          <button
            onClick={seDeconnecter}
            className="w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={16} aria-hidden="true" />
            Se déconnecter
          </button>

          <p className="text-white/20 text-xs px-3 pt-1">© {new Date().getFullYear()} ZANDOO</p>
        </div>
      </aside>
    </>
  );
}
