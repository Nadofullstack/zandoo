import { Link } from 'react-router-dom';
import { Mail, Globe, Smartphone } from 'lucide-react';
import logozandoo from '../../../assets/logozandoo.png';

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

const ICONES_SOCIAUX = [
  { icone: Mail,       label: 'Email' },
  { icone: Globe,      label: 'Site web' },
  { icone: Smartphone, label: 'Application' },
];

export default function Footer() {
  return (
    <footer className="bg-[#011023] text-white">
      {/* Bande orange */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FC7701] via-[#ff9500] to-[#FC7701]" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Corps principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 py-10 sm:py-12 lg:py-14">
          
          {/* Colonne marque */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center mb-4 sm:mb-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-lg">
                <img src={logozandoo} alt="ZanDoo" />
              </div>
              <span className="font-black text-white text-xl tracking-tight">
                AN<span className="text-[#FC7701]">DOO</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-5 sm:mb-6 max-w-xs">
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

          {/* Liens utiles */}
          <div className="sm:col-span-1 lg:col-span-1">
            <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-4 sm:mb-5">
              Liens utiles
            </h4>
            <ul className="space-y-2.5 sm:space-y-3">
              {LIENS_UTILES.map((l) => (
                <li key={l.libelle}>
                  <Link 
                    to={l.href} 
                    className="text-white/50 hover:text-white text-sm transition-colors block py-0.5"
                  >
                    {l.libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div className="sm:col-span-1 lg:col-span-1">
            <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-4 sm:mb-5">
              Légal
            </h4>
            <ul className="space-y-2.5 sm:space-y-3">
              {LIENS_LEGAL.map((l) => (
                <li key={l.libelle}>
                  <a 
                    href={l.href} 
                    className="text-white/50 hover:text-white text-sm transition-colors block py-0.5"
                  >
                    {l.libelle}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bas de pied */}
        <div className="py-5 sm:py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} ZANDOO. Tous droits réservés.
          </p>
          <p className="text-white/30 text-xs text-center">
            Achetez. Vendez. Progressez. 🌍
          </p>
        </div>
      </div>
    </footer>
  );
}