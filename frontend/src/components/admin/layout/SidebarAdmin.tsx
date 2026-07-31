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

const LIENS_NAV: LienNav[] = [
  { vers: '/admin',                libelle: 'Tableau de bord', icone: LayoutDashboard, exact: true },
  { vers: '/admin/utilisateurs',   libelle: 'Utilisateurs',    icone: Users            },
  { vers: '/admin/vendeurs',       libelle: 'Vendeurs',        icone: Store            },
  { vers: '/admin/livreurs',       libelle: 'Livreurs',        icone: Truck            },
  { vers: '/admin/produits',       libelle: 'Produits',        icone: Package          },
  { vers: '/admin/categories',     libelle: 'Catégories',      icone: Tag              },
  { vers: '/admin/commandes',      libelle: 'Commandes',       icone: ShoppingCart     },
  { vers: '/admin/reclamations',   libelle: 'Réclamations',    icone: MessageSquare    },
  { vers: '/admin/publicites',     libelle: 'Publicités',      icone: Megaphone        },
  { vers: '/admin/pages-statiques',libelle: 'Pages statiques', icone: FileText         },
  { vers: '/admin/articles',       libelle: 'Blog',            icone: BookOpen         },
];

/**
 * Barre latérale de navigation du panneau d'administration.
 */
export default function SidebarAdmin() {
  const navigate = useNavigate();
  const session  = lireSession();

  const seDeconnecter = () => {
    // Supprime la session et redirige immédiatement — sans attendre le serveur
    supprimerSession();
    navigate('/connexion', { replace: true });
    // Appel backend en arrière-plan pour vider le cookie httpOnly
    logoutUser().catch(() => {});
  };

  return (
    <aside className="w-60 shrink-0 min-h-screen bg-primary flex flex-col">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
        <img src={logo} alt="ZANDOO" className="h-8 w-8 rounded-lg object-contain" />
        <div>
          <p className="text-white font-extrabold text-sm leading-tight">ZANDOO</p>
          <p className="text-white/50 text-xs">Administration</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navigation administration">
        {LIENS_NAV.map(({ vers, libelle, icone: Icone, exact }) => (
          <NavLink
            key={vers}
            to={vers}
            end={exact}
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
  );
}
