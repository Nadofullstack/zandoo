import { NavLink } from 'react-router-dom';
import {
  Store, LayoutDashboard, Package, Tag, Users,
  ShoppingCart, MessageSquare, Megaphone, FileText, BookOpen, Truck,
} from 'lucide-react';
import logo from '../../../assets/logo.jpg';

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

      {/* Pied de sidebar */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/30 text-xs">© {new Date().getFullYear()} ZANDOO</p>
      </div>

    </aside>
  );
}
