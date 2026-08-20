import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import logozandoo from '../../../assets/logozandoo.png';
import { lireSession, rafraichirSession } from '../../../services/auth/authService';
import { useNombreArticlesPanier } from '../../../context/PanierContext';

export default function TopNavBar() {
  const [recherche, setRecherche]   = useState('');
  const [scrolled,  setScrolled]    = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const navigate = useNavigate();

  const [utilisateur, setUtilisateur] = useState(lireSession);
  const estConnecte = !!utilisateur;
  const nombreArticles = useNombreArticlesPanier();

  /* Rafraîchir la session au montage */
  useEffect(() => {
    if (lireSession()) {
      rafraichirSession().then((u) => { if (u) setUtilisateur(u); });
    }
  }, []);

  /* Scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const soumettreRecherche = (e: React.FormEvent) => {
    e.preventDefault();
    const terme = recherche.trim();
    if (terme) navigate(`/catalogue?q=${encodeURIComponent(terme)}`);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#011023]/95 backdrop-blur-md py-2 shadow-lg shadow-black/20'
          : 'bg-[#011023] py-4'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 flex items-center justify-between gap-4">

        {/* ── Logo ─────────────────────────────────────── */}
        <Link to="/" className="flex items-center shrink-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-lg leading-none">
            <img src={logozandoo} alt="ZanDoo" />
          </div>
          <span className="hidden sm:block font-black text-white text-xl tracking-tight">
            AN<span className="text-[#FC7701]">DOO</span>
          </span>
        </Link>

        {/* ── Navigation desktop ───────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1" />

        {/* ── Barre de recherche ───────────────────────── */}
        <form
          onSubmit={soumettreRecherche}
          className="hidden md:flex flex-1 max-w-sm items-center bg-white/10 border border-white/20 rounded-full px-4 py-2 gap-2 hover:bg-white/15 transition-colors focus-within:border-[#FC7701]/60 focus-within:bg-white/15"
        >
          <Search size={16} className="text-white/50 shrink-0" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un produit..."
            className="bg-transparent border-none outline-none text-sm text-white placeholder-white/40 w-full"
          />
        </form>

        {/* ── Icônes droite ────────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Icône recherche mobile */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Rechercher"
          >
            <Search size={18} />
          </button>

          {/* ── Icône profil (connecté) ou lien connexion ── */}
          {estConnecte ? (
            <Link
              to="/mon-compte"
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full bg-[#FC7701] hover:bg-[#e06900] transition-all"
              aria-label="Mon profil"
            >
              <User size={18} className="text-white" />
            </Link>
          ) : (
            <Link
              to="/connexion"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <User size={18} />
              <span className="hidden md:block">Connexion</span>
            </Link>
          )}

          {/* ── Panier ───────────────────────────────────── */}
          <Link
            to="/panier"
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
            aria-label={`Panier${nombreArticles > 0 ? ` — ${nombreArticles} article${nombreArticles > 1 ? 's' : ''}` : ''}`}
          >
            <ShoppingCart size={20} />
            {nombreArticles > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#FC7701] rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1">
                {nombreArticles > 99 ? '99+' : nombreArticles}
              </span>
            )}
          </Link>

          {/* Burger mobile */}
          <button
            onClick={() => setMenuOuvert(!menuOuvert)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Menu"
          >
            {menuOuvert ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Menu mobile déroulant ─────────────────────── */}
      {menuOuvert && (
        <div className="lg:hidden border-t border-white/10 bg-[#011023]">
          <div className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-1">

            {/* Barre de recherche mobile */}
            <form onSubmit={soumettreRecherche} className="flex items-center bg-white/10 border border-white/20 rounded-full px-4 py-2 gap-2 mb-2">
              <Search size={16} className="text-white/50 shrink-0" />
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher..."
                className="bg-transparent border-none outline-none text-sm text-white placeholder-white/40 w-full"
              />
            </form>

            {/* Lien profil ou connexion */}
            {estConnecte ? (
              <Link
                to="/mon-compte"
                onClick={() => setMenuOuvert(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <User size={15} />
                Mon profil
              </Link>
            ) : (
              <Link
                to="/connexion"
                onClick={() => setMenuOuvert(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <User size={15} />
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
