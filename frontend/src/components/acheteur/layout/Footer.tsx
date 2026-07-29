import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe, Smartphone } from 'lucide-react';

const LIENS_UTILES = [
  { libelle: 'Mes commandes',   href: '/commandes' },
  { libelle: 'Support client', href: '/support' },
  { libelle: 'Devenir vendeur', href: '/inscription' },
  { libelle: 'Carrières',       href: '#' },
];

const LIENS_LEGAL = [
  { libelle: "Conditions d'utilisation", href: '#' },
  { libelle: 'Confidentialité',          href: '#' },
  { libelle: 'Cookies',                  href: '#' },
];

const CATEGORIES = [
  { libelle: 'Électronique', href: '/catalogue?categorie=electronique' },
  { libelle: 'Mode',         href: '/catalogue?categorie=mode' },
  { libelle: 'Maison',       href: '/catalogue?categorie=maison' },
  { libelle: 'Beauté',       href: '/catalogue?categorie=beaute' },
  { libelle: 'Artisanat',    href: '/catalogue?categorie=artisanat' },
];

const ICONES_SOCIAUX = [
  { icone: Mail,       label: 'Email' },
  { icone: Globe,      label: 'Site web' },
  { icone: Smartphone, label: 'Application' },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const soumettreNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: appel API newsletter
    setEmail('');
  };

  return (
    <footer className="bg-[#011023] text-white">
      {/* Bande orange */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FC7701] via-[#ff9500] to-[#FC7701]" />

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        {/* Corps principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-14">

          {/* Colonne marque */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-[#FC7701] flex items-center justify-center text-white font-black text-lg">
                Z
              </div>
              <span className="font-black text-white text-xl tracking-tight">
                ZAN<span className="text-[#FC7701]">DOO</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              La marketplace e-commerce dédiée à l'essor économique du continent africain.
            </p>
            <div className="flex gap-2">
              {ICONES_SOCIAUX.map(({ icone: Icone, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#FC7701]/20 hover:border-[#FC7701]/40 transition-all"
                >
                  <Icone size={16} className="text-white/60" />
                </a>
              ))}
            </div>
          </div>

          {/* Catégories */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-5">Catégories</h4>
            <ul className="space-y-3">
              {CATEGORIES.map((l) => (
                <li key={l.libelle}>
                  <Link to={l.href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {l.libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens utiles + Légal */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-5">Liens utiles</h4>
            <ul className="space-y-3 mb-8">
              {LIENS_UTILES.map((l) => (
                <li key={l.libelle}>
                  <Link to={l.href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {l.libelle}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-5">Légal</h4>
            <ul className="space-y-3">
              {LIENS_LEGAL.map((l) => (
                <li key={l.libelle}>
                  <a href={l.href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {l.libelle}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-5">Newsletter</h4>
            <p className="text-white/50 text-sm mb-5 leading-relaxed">
              Offres exclusives, nouveautés et actualités panafricaines dans votre boîte mail.
            </p>
            <form onSubmit={soumettreNewsletter}>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#FC7701]/50 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full bg-[#FC7701] hover:bg-[#e06900] text-white font-semibold py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5"
                >
                  S'abonner
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bas de pied */}
        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} ZANDOO. Tous droits réservés.
          </p>
          <p className="text-white/30 text-xs">Achetez. Vendez. Progressez. 🌍</p>
        </div>
      </div>
    </footer>
  );
}
