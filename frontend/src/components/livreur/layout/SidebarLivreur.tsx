import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Truck, ClockArrowDown, User, LogOut } from 'lucide-react';
import { logoutUser, lireSession, supprimerSession } from '../../../services/auth/authService';
import logo from '../../../assets/logo.jpg';

interface LienNav {
  vers: string;
  libelle: string;
  icone: typeof Truck;
  exact?: boolean;
}

const LIENS: LienNav[] = [
  { vers: '/livreur/tableau-de-bord', libelle: 'Tableau de bord', icone: LayoutDashboard, exact: true },
  { vers: '/livreur/mes-livraisons',  libelle: 'Mes livraisons',  icone: Truck                        },
  { vers: '/livreur/historique',      libelle: 'Historique',      icone: ClockArrowDown               },
  { vers: '/livreur/profil',          libelle: 'Mon profil',      icone: User                         },
];

export default function SidebarLivreur() {
  const navigate = useNavigate();
  const session  = lireSession();

  const seDeconnecter = () => {
    supprimerSession();
    navigate('/connexion', { replace: true });
    logoutUser().catch(() => {});
  };

  return (
    <aside className="w-60 shrink-0 min-h-screen bg-primary flex flex-col">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="relative">
          <img src={logo} alt="ZANDOO" className="h-8 w-8 rounded-lg object-contain" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-primary" />
        </div>
        <div>
          <p className="text-white font-extrabold text-sm leading-tight">ZANDOO</p>
          <p className="text-accent/80 text-xs font-medium">Livreur</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navigation livreur">
        {LIENS.map(({ vers, libelle, icone: Icone, exact }) => (
          <NavLink
            key={vers}
            to={vers}
            end={exact}
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

      {/* Bas de sidebar — utilisateur + déconnexion */}
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
  );
}
