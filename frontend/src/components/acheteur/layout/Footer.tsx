import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import logozandoo from '../../../assets/logozandoo.png';
import { getPagesPubliees, type PageResume } from '../../../services/acheteur/acheteurContenuService';

const LIENS_DECOUVRIR = [
  { libelle: 'Catalogue',       href: '/catalogue' },
  { libelle: 'Boutiques',       href: '/boutiques' },
  { libelle: 'Promotions',      href: '/promotions' },
  { libelle: 'Devenir vendeur', href: '/devenir-vendeur' },
];

const LIENS_AIDE = [
  { libelle: 'Mes commandes', href: '/mes-commandes' },
  { libelle: 'Mes favoris',   href: '/favoris' },
  { libelle: 'Nous contacter', href: '/contact' },
];

/** Pages publiées mises en cache pour la session (le pied de page est présent sur toutes les pages) */
let pagesEnCache: Promise<PageResume[]> | null = null;
const chargerPages = () => (pagesEnCache ??= getPagesPubliees().catch(() => { pagesEnCache = null; return []; }));

/** Pages publiées sans lien dédié : « contact » a sa propre page */
const PAGES_EXCLUES = new Set(['contact']);

export default function Footer() {
  const [pages, setPages] = useState<PageResume[]>([]);

  useEffect(() => {
    let annule = false;
    chargerPages().then((p) => { if (!annule) setPages(p.filter((x) => !PAGES_EXCLUES.has(x.slug))); });
    return () => { annule = true; };
  }, []);

  return (
    <footer className="bg-[#011023] text-white">
      {/* Bande orange */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FC7701] via-[#ff9500] to-[#FC7701]" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 sm:gap-10 py-10 sm:py-12 lg:py-14">
          {/* Marque */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center mb-4 sm:mb-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-lg">
                <img src={logozandoo} alt="ZanDoo" />
              </div>
              <span className="font-black text-white text-xl tracking-tight">
                AN<span className="text-[#FC7701]">DOO</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-5 max-w-xs">
              La marketplace e-commerce dédiée à l'essor économique du continent africain.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-white/5 border border-white/10 hover:bg-[#FC7701]/20 hover:border-[#FC7701]/40 px-4 py-2 rounded-xl transition-all"
            >
              <MessageCircle size={15} className="text-[#FC7701]" /> Nous contacter
            </Link>
          </div>

          <Colonne titre="Découvrir" liens={LIENS_DECOUVRIR} />
          <Colonne titre="Aide" liens={LIENS_AIDE} />
          <Colonne
            titre="Informations"
            liens={pages.map((p) => ({ libelle: p.titre, href: `/pages/${p.slug}` }))}
            vide="À propos et conditions bientôt disponibles."
          />
        </div>

        {/* Bas de pied */}
        <div className="py-5 sm:py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} ZANDOO. Tous droits réservés.
          </p>
          <p className="text-white/30 text-xs text-center">Achetez. Vendez. Progressez. 🌍</p>
        </div>
      </div>
    </footer>
  );
}

function Colonne({ titre, liens, vide }: { titre: string; liens: { libelle: string; href: string }[]; vide?: string }) {
  return (
    <nav aria-label={titre}>
      <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-4 sm:mb-5">{titre}</h4>
      {liens.length === 0 && vide ? (
        <p className="text-white/30 text-sm">{vide}</p>
      ) : (
        <ul className="space-y-2.5 sm:space-y-3">
          {liens.map((l) => (
            <li key={l.href}>
              <Link to={l.href} className="text-white/50 hover:text-white text-sm transition-colors block py-0.5">{l.libelle}</Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
