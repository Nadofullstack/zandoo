import { ShieldCheck, Truck, BadgeCheck, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import logo from '../../assets/logo.jpg';

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const FEATURES: FeatureItem[] = [
  { icon: ShieldCheck, title: 'Sécurité',  desc: 'Transactions garanties et protégées.'        },
  { icon: Truck,       title: 'Rapidité',  desc: 'Livraison optimisée dans toute la région.'    },
  { icon: BadgeCheck,  title: 'Certifié',  desc: 'Produits vérifiés et vendeurs validés.'       },
  { icon: Globe,       title: 'Partout',   desc: "Disponible dans toute l'Afrique de l'Ouest."  },
];

function FeatureCard({ icon: Icon, title, desc }: FeatureItem) {
  return (
    <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-left">
      <Icon size={20} className="text-[#FC7701] mb-1.5" aria-hidden="true" />
      <h3 className="text-white font-semibold text-xs mb-0.5">{title}</h3>
      <p className="text-[#b8c7e1] text-xs leading-snug">{desc}</p>
    </div>
  );
}

export default function BrandPanel() {
  return (
    <section
      aria-hidden="true"
      className="hidden lg:flex w-[50%] shrink-0 relative bg-[#011023] items-center justify-center p-5 overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#FC7701]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-[#FC7701]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-sm">
        {/* Logo + headline */}
        <div className="mb-7">
         
          <h1 className="text-2xl font-extrabold text-white mb-3 leading-tight">
            Rejoignez le marché
            <br />
            <span className="text-[#FC7701]">nouvelle génération.</span>
          </h1>
          <p className="text-sm text-[#b8c7e1] leading-relaxed">
            Des milliers de produits certifiés, une expérience fluide et
            sécurisée partout en Afrique.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
