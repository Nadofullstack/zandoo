import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Package, LogOut, Settings, Store } from 'lucide-react';
import logozandoo from '../../../assets/logozandoo.png';
import { lireSession, logoutUser, rafraichirSession } from '../../../services/auth/authService';


const NAV_LIENS = [
  { libelle: 'Électronique', slug: 'electronique' },
  { libelle: 'Mode',         slug: 'mode' },
  { libelle: 'Maison',       slug: 'maison' },
  { libelle: 'Beauté',       slug: 'beaute' },
  { libelle: 'Artisanat',    slug: 'artisanat' },
];

export default function TopNavBar() {
  const [recherche, setRecherche]         = useState('');
  const [scrolled,  setScrolled]          = useState(false);
  const [menuOuvert, setMenuOuvert]       = useState(false);
  const [dropdownOuvert, setDropdownOuvert] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [utilisateur, setUtilisateur] = useState(lireSession);
  const estConnecte = !!utilisateur;
  const estVendeur  = utilisateur?.estVendeur === true || utilisateur?.role === 'vendeur';

  /* Rafraîchir la session au montage (utile après approbation boutique) */
  useEffect(() => {
    if (lireSession()) {
      rafraichirSession().then((u) => { if (u) setUtilisateur(u); });
    }
  }, []);

  /* ── Scroll effect ─────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Fermer le dropdown en cliquant ailleurs ────── */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOuvert(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const soumettreRecherche = (e: React.FormEvent) => {
    e.preventDefault();
    const terme = recherche.trim();
    if (terme) navigate(`/catalogue?q=${encodeURIComponent(terme)}`);
  };

  const handleDeconnexion = async () => {
    setDropdownOuvert(false);
    await logoutUser();
    navigate('/connexion');
  };

  /* Initiales de l'utilisateur pour l'avatar */
  const initiales = utilisateur?.fullName
    ? utilisateur.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

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
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LIENS.map((lien) => (
            <Link
              key={lien.slug}
              to={`/catalogue?categorie=${lien.slug}`}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              {lien.libelle}
            </Link>
          ))}
        </nav>

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

          {/* ── Profil utilisateur (conditionnel) ───────── */}
          {estConnecte ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOuvert((v) => !v)}
                onMouseEnter={() => setDropdownOuvert(true)}
                className="cursor-pointer flex items-center gap-1.5 px-2 py-1.5 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
                aria-haspopup="true"
                aria-expanded={dropdownOuvert}
              >
                {/* Avatar initiales */}
                <span className="w-7 h-7 rounded-full bg-[#FC7701] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initiales}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-white/60 transition-transform duration-200 ${dropdownOuvert ? 'rotate-180' : ''}`}
                />
              </button>

              {/* ── Dropdown menu ─────────────────────────── */}
              {dropdownOuvert && (
                <div
                  onMouseLeave={() => setDropdownOuvert(false)}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* En-tête du dropdown */}
                  <div className="px-4 py-3 bg-gradient-to-r from-accent to-accent">
                    <p className="text-xs text-white font-medium">Bonjour 👋</p>
                    <p className="text-sm text-white font-semibold truncate mt-0.5">
                      {utilisateur.fullName}
                    </p>
                  </div>

                  {/* Liens du menu */}
                  <div className="py-1.5">
                    <Link
                      to="/mon-compte"
                      onClick={() => setDropdownOuvert(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#FC7701] transition-colors"
                    >
                      <Settings size={16} className="text-gray-400" />
                      Mon compte
                    </Link>
                    <Link
                      to="/mes-commandes"
                      onClick={() => setDropdownOuvert(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#FC7701] transition-colors"
                    >
                      <Package size={16} className="text-gray-400" />
                      Mes commandes
                    </Link>
                    {/* Lien boutique — visible uniquement si l'utilisateur est aussi vendeur */}
                    {estVendeur && (
                      <Link
                        to="/vendeur/tableau-de-bord"
                        onClick={() => setDropdownOuvert(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#FC7701] font-semibold hover:bg-orange-50 transition-colors"
                      >
                        <Store size={16} className="text-[#FC7701]" />
                        Gérer ma boutique
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-gray-100 py-1.5">
                    <button
                      onClick={handleDeconnexion}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/connexion"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <User size={18} />
              <span className="hidden md:block">Connexion</span>
            </Link>
          )}

          {/* Panier avec badge */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <ShoppingCart size={20} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FC7701] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              0
            </span>
          </button>

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
            <form onSubmit={soumettreRecherche} className="flex items-center bg-white/10 border border-white/20 rounded-full px-4 py-2 gap-2 mb-3">
              <Search size={16} className="text-white/50 shrink-0" />
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher..."
                className="bg-transparent border-none outline-none text-sm text-white placeholder-white/40 w-full"
              />
            </form>
            {NAV_LIENS.map((lien) => (
              <Link
                key={lien.slug}
                to={`/catalogue?categorie=${lien.slug}`}
                onClick={() => setMenuOuvert(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                {lien.libelle}
              </Link>
            ))}

            {/* Liens profil dans le menu mobile */}
            {estConnecte ? (
              <>
                <div className="border-t border-white/10 mt-2 pt-2">
                  <p className="px-3 py-1 text-xs text-white/40 font-medium">
                    Bonjour, {utilisateur.fullName}
                  </p>
                  <Link
                    to="/mon-compte"
                    onClick={() => setMenuOuvert(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Settings size={15} />
                    Mon compte
                  </Link>
                  <Link
                    to="/mes-commandes"
                    onClick={() => setMenuOuvert(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Package size={15} />
                    Mes commandes
                  </Link>
                  {/* Lien boutique mobile — visible uniquement si l'utilisateur est aussi vendeur */}
                  {estVendeur && (
                    <Link
                      to="/vendeur/tableau-de-bord"
                      onClick={() => setMenuOuvert(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#FC7701] hover:bg-white/10 transition-all"
                    >
                      <Store size={15} />
                      Gérer ma boutique
                    </Link>
                  )}
                  <button
                    onClick={handleDeconnexion}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-white/10 transition-all"
                  >
                    <LogOut size={15} />
                    Se déconnecter
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/connexion"
                onClick={() => setMenuOuvert(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all mt-2 border-t border-white/10 pt-3"
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
