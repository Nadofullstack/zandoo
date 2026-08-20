import { Link } from 'react-router-dom';
import { Store, CreditCard, BarChart2, HeadphonesIcon, ArrowRight } from 'lucide-react';

const AVANTAGES = [
  { Icone: Store,           texte: 'Boutique gratuite' },
  { Icone: CreditCard,      texte: 'Paiements sécurisés' },
  { Icone: BarChart2,       texte: 'Tableau de bord' },
  { Icone: HeadphonesIcon,  texte: 'Support dédié' },
];

export default function SectionBanniereVendeur() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="relative bg-[#011023] rounded-3xl overflow-hidden p-6 sm:p-10 lg:p-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-10">

          {/* Déco */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FC7701]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots2" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots2)" />
          </svg>

          {/* Texte */}
          <div className="relative flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#FC7701]/15 border border-[#FC7701]/30 rounded-full px-4 py-1.5 mb-4 sm:mb-5">
              <Store size={14} className="text-[#FC7701]" />
              <span className="text-[#FC7701] text-xs font-bold uppercase tracking-wide">
                Devenez vendeur
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-3 sm:mb-4">
              Votre boutique, <br />
              <span className="text-[#FC7701]">votre succès.</span>
            </h2>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
              Rejoignez +12 000 vendeurs africains qui développent leur activité sur ZANDOO.
              Inscription gratuite, commission transparente.
            </p>
          </div>

          {/* Avantages + CTA */}
          <div className="relative shrink-0 w-full lg:w-auto">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {AVANTAGES.map(({ Icone, texte }) => (
                <div
                  key={texte}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3"
                >
                  <Icone size={15} className="text-[#FC7701] shrink-0" />
                  <span className="text-white/80 text-xs sm:text-sm font-medium">{texte}</span>
                </div>
              ))}
            </div>
            <Link
              to="/inscription"
              className="flex items-center justify-center gap-2 w-full bg-[#FC7701] hover:bg-[#e06900] text-white font-bold px-8 py-3.5 sm:py-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FC7701]/30"
            >
              Ouvrir ma boutique
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
