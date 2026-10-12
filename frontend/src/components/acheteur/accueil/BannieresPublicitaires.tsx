import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { PublicitePublique } from '../../../types/acheteur';
import LienPublicite from './LienPublicite';
import { EASE_SORTIE, VUE_UNIQUE, cascade, elementCascade } from './animations';

interface Props {
  publicites: PublicitePublique[];
  onVue: (id: string) => void;
  onClic: (id: string) => void;
}

/**
 * Bannières « accueil_milieu » en grille modulaire :
 *  1 campagne → pleine largeur ; 2 → deux colonnes ; 3 → une grande + deux empilées.
 */
export default function BannieresPublicitaires({ publicites, onVue, onClic }: Props) {
  const liste = publicites.slice(0, 3);
  const grille =
    liste.length === 1 ? 'grid-cols-1'
      : liste.length === 2 ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 md:grid-rows-2';

  return (
    <section aria-label="Offres partenaires" className="bg-white py-12 sm:py-16">
      <motion.div
        variants={cascade(0.12)}
        initial="cache"
        whileInView="visible"
        viewport={VUE_UNIQUE}
        className={`max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 grid gap-4 sm:gap-5 ${grille}`}
      >
        {liste.map((p, i) => {
          const grande = liste.length === 3 && i === 0;
          return (
            <Banniere
              key={p._id}
              publicite={p}
              onVue={onVue}
              onClic={onClic}
              className={`${grande ? 'md:row-span-2 h-[260px] md:h-auto' : 'h-[220px] sm:h-[260px]'} ${liste.length === 1 ? 'sm:h-[320px]' : ''}`}
            />
          );
        })}
      </motion.div>
    </section>
  );
}

function Banniere({ publicite: p, onVue, onClic, className }: { publicite: PublicitePublique; onVue: (id: string) => void; onClic: (id: string) => void; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (visible) onVue(p._id);
  }, [visible, p._id, onVue]);

  return (
    <motion.div ref={ref} variants={elementCascade} whileHover="survol" className={`relative rounded-3xl overflow-hidden bg-[#011023] ${className}`}>
      <LienPublicite lien={p.lien} onClic={() => onClic(p._id)} libelle={p.accroche || p.texteAlt} className="group block w-full h-full">
        <motion.img
          src={p.imageUrl}
          alt={p.texteAlt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          variants={{ survol: { scale: 1.06 } }}
          transition={{ duration: 0.8, ease: EASE_SORTIE }}
        />

        {(p.accroche || p.description) && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-[#011023]/85 via-[#011023]/25 to-transparent transition-opacity duration-500 group-hover:opacity-90" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 flex items-end justify-between gap-4">
              <div className="min-w-0 transition-transform duration-500 group-hover:-translate-y-1">
                {p.accroche && <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">{p.accroche}</h3>}
                {p.description && <p className="mt-1.5 text-sm text-white/75 line-clamp-2">{p.description}</p>}
                {p.libelleBouton && (
                  <span className="mt-3 inline-block text-sm font-semibold text-[#FC7701]">{p.libelleBouton}</span>
                )}
              </div>
              <span className="shrink-0 w-11 h-11 rounded-full bg-white text-[#011023] flex items-center justify-center transition-all duration-500 group-hover:bg-[#FC7701] group-hover:text-white group-hover:rotate-45">
                <ArrowUpRight size={18} />
              </span>
            </div>
          </>
        )}
      </LienPublicite>

      {/* Mention légale des contenus sponsorisés */}
      <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider text-white/80 bg-black/30 backdrop-blur px-2 py-0.5 rounded-full pointer-events-none">
        Sponsorisé
      </span>
    </motion.div>
  );
}
