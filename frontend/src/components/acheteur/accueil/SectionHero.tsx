import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Truck, BadgeCheck, TrendingUp } from 'lucide-react';

const STATS = [
  { valeur: '50K+', libelle: 'Produits' },
  { valeur: '12K+', libelle: 'Vendeurs' },
  { valeur: '20+',  libelle: 'Pays' },
  { valeur: '4.9★', libelle: 'Note moy.' },
];

export default function SectionHero() {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#FC7701]/10 blur-[120px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">

          {/* ── Colonne texte ──────────────────────────── */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#FC7701]/15 border border-[#FC7701]/30 rounded-full px-4 py-1.5 mb-4 sm:mb-6">
              <span className="w-2 h-2 rounded-full bg-[#FC7701] animate-pulse" />
              <span className="text-[#FC7701] text-xs font-semibold tracking-wide uppercase">
                Marketplace panafricaine
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-black text-primary leading-[1.1] tracking-tight mb-4 sm:mb-6">
              Achetez local.{' '}
              <span className="relative inline-block">
                <span className="text-[#FC7701]">Vendez</span>
                <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                  <path d="M0 5 Q50 0 100 5" stroke="#FC7701" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
                </svg>
              </span>{' '}
              global.
              <br />
              <span className="text-primary">Progressez ensemble.</span>
            </h1>

            <p className="text-primary text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-10 max-w-[480px]">
              Découvrez des milliers de produits africains authentiques.
              Connectez vendeurs locaux et acheteurs du monde entier sur une
              plateforme sécurisée et innovante.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-12">
              <Link
                to="/catalogue"
                className="flex items-center justify-center gap-2 bg-[#FC7701] hover:bg-[#e06900] text-white font-semibold px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FC7701]/30 text-sm"
              >
                <ShoppingBag size={18} />
                Explorer le catalogue
              </Link>
              <Link
                to="/inscription"
                className="flex items-center justify-center gap-2 border border-accent text-white bg-primary hover:text-white hover:border-primary/40 hover:bg-primary font-semibold px-6 py-3.5 rounded-xl transition-all text-sm"
              >
                Devenir vendeur
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 pt-6 sm:pt-8 border-t border-accent">
              {STATS.map((s) => (
                <div key={s.libelle}>
                  <div className="text-base sm:text-xl font-black text-accent">{s.valeur}</div>
                  <div className="text-[10px] sm:text-xs text-primary mt-0.5">{s.libelle}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Colonne visuelle ───────────────────────── */}
          <div className="relative hidden lg:block">
            {/* Carte principale */}
            <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=80"
                alt="Marketplace africaine"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#011023]/60 via-transparent to-transparent" />

              {/* Badge flottant bas gauche */}
              <div className="absolute bottom-4 left-4 bg-white rounded-xl px-4 py-3 shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FC7701]/15 flex items-center justify-center">
                  <Truck size={20} className="text-[#FC7701]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Livraison rapide</p>
                  <p className="text-sm font-bold text-[#011023]">Partout en Afrique</p>
                </div>
              </div>
            </div>

            {/* Carte flottante haut droite — vendeurs vérifiés */}
            <div className="absolute -top-6 -right-6 z-20 bg-[#011023] border border-white/15 rounded-2xl p-4 shadow-xl shadow-black/40 w-44">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#FC7701] flex items-center justify-center">
                  <BadgeCheck size={16} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-white">Vendeurs vérifiés</span>
              </div>
              <div className="flex -space-x-2">
                {['🇨🇮', '🇳🇬', '🇬🇭', '🇸🇳'].map((flag, i) => (
                  <div key={i} className="w-8 h-8 text-white rounded-full bg-white/10 border-2 border-[#011023] flex items-center justify-center text-base">
                    {flag}
                  </div>
                ))}
              </div>
              <p className="text-white/40 text-xs mt-2">+12 000 vendeurs</p>
            </div>

            {/* Carte flottante bas droite — ventes */}
            <div className="absolute -bottom-6 -right-4 z-20 bg-white rounded-2xl p-4 shadow-xl w-48">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400 font-medium">Ventes du mois</span>
                <span className="flex items-center gap-0.5 text-xs text-green-500 font-bold">
                  <TrendingUp size={12} />
                  +24%
                </span>
              </div>
              <div className="flex items-end gap-1 h-10 mt-2">
                {[40, 65, 45, 80, 55, 90, 70, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: i === 7 ? '#FC7701' : '#011023',
                      opacity: i === 7 ? 1 : 0.15 + i * 0.08,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="absolute inset-0 -z-10 rounded-full w-72 h-72 bg-[#FC7701]/5 blur-3xl mx-auto my-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
