import { ShieldCheck, Globe, Truck, Headphones } from 'lucide-react';

const VALEURS = [
  {
    Icone:       ShieldCheck,
    couleur:     '#3B82F6',
    bg:          '#EFF6FF',
    titre:       'Confiance & Sécurité',
    description: 'Transactions cryptées, vendeurs vérifiés et paiements protégés pour une expérience sereine.',
  },
  {
    Icone:       Globe,
    couleur:     '#10B981',
    bg:          '#ECFDF5',
    titre:       'Portée Panafricaine',
    description: "Abidjan, Lagos, Nairobi, Dakar… nous connectons les marchés d'un océan à l'autre.",
  },
  {
    Icone:       Truck,
    couleur:     '#FC7701',
    bg:          '#FFF7ED',
    titre:       'Livraison Fiable',
    description: 'Une infrastructure logistique robuste pour livrer partout sur le continent, rapidement.',
  },
  {
    Icone:       Headphones,
    couleur:     '#8B5CF6',
    bg:          '#F5F3FF',
    titre:       'Support 24/7',
    description: 'Une équipe dédiée prête à vous aider à chaque étape, en français et en anglais.',
  },
];

export default function SectionValeursMarque() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">

        {/* En-tête */}
        <div className="text-center mb-12">
          <p className="text-[#FC7701] text-xs font-bold uppercase tracking-widest mb-2">
            Pourquoi ZANDOO
          </p>
          <h2 className="text-3xl font-black text-[#011023]">
            Conçu pour l'Afrique qui avance
          </h2>
        </div>

        {/* Cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALEURS.map(({ Icone, couleur, bg, titre, description }) => (
            <div
              key={titre}
              className="group p-6 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-xl hover:shadow-gray-100 transition-all bg-white"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ background: bg }}
              >
                <Icone size={24} style={{ color: couleur }} />
              </div>
              <h3 className="font-bold text-[#011023] text-base mb-2">{titre}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
