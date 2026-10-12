import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CalendarDays, MapPin, Package, Store, Tag, Truck } from 'lucide-react';
import type { BoutiqueDetail } from '../../../types/acheteur';
import EtoilesNote from '../../ui/EtoilesNote';
import { cascade, elementCascade } from '../accueil/animations';

/** En-tête de la vitrine : bannière en parallaxe, identité et indicateurs de confiance. */
export default function EnTeteBoutique({ boutique: b }: { boutique: BoutiqueDetail }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yBanniere = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opaciteBanniere = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  const membreDepuis = new Date(b.membreDepuis).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <section ref={ref} className="relative bg-white">
      {/* Bannière */}
      <div className="relative h-44 sm:h-60 lg:h-72 overflow-hidden bg-gradient-to-br from-[#011023] via-[#0a2a4f] to-[#011023]">
        {b.banniere ? (
          <motion.img src={b.banniere} alt="" style={{ y: yBanniere, opacity: opaciteBanniere }} className="absolute inset-0 w-full h-[125%] object-cover" />
        ) : (
          <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      </div>

      {/* Identité */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <motion.div variants={cascade(0.08, 0.1)} initial="cache" animate="visible" className="relative -mt-14 sm:-mt-16 pb-6 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          <motion.div variants={elementCascade} className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-1.5 shadow-xl ring-1 ring-gray-100 shrink-0">
            <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
              {b.logo ? <img src={b.logo} alt={`Logo ${b.nomEntreprise}`} className="w-full h-full object-cover" /> : <Store size={40} className="text-gray-300" />}
            </div>
          </motion.div>

          <div className="flex-1 min-w-0 sm:pb-1">
            <motion.h1 variants={elementCascade} className="text-2xl sm:text-4xl font-black text-[#011023] tracking-tight">{b.nomEntreprise}</motion.h1>
            <motion.div variants={elementCascade} className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">
              {b.secteurActivite && <span className="font-medium text-gray-700">{b.secteurActivite}</span>}
              {b.ville && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {b.ville}</span>}
              <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> Sur ZANDOO depuis {membreDepuis}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Indicateurs */}
        <motion.dl
          variants={cascade(0.06, 0.3)}
          initial="cache"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 mb-2"
        >
          <Indicateur icone={<StarIcone />} libelle="Note clients">
            {b.nombreAvis > 0 ? (
              <span className="flex items-center gap-2">
                {b.noteMoyenne.toLocaleString('fr-FR', { minimumFractionDigits: 1 })}
                <EtoilesNote note={b.noteMoyenne} taille={13} />
              </span>
            ) : '—'}
            <span className="block text-xs font-normal text-gray-400">{b.nombreAvis} avis</span>
          </Indicateur>
          <Indicateur icone={<Package size={16} />} libelle="Produits">{b.nombreProduits}</Indicateur>
          <Indicateur icone={<Tag size={16} />} libelle="En promotion">{b.enPromotion}</Indicateur>
          <Indicateur icone={<Truck size={16} />} libelle="Livraison">
            <span className="text-sm">
              {[b.livraison.domicile && 'À domicile', b.livraison.retrait && 'Retrait'].filter(Boolean).join(' · ') || '—'}
            </span>
          </Indicateur>
        </motion.dl>
      </div>
    </section>
  );
}

function Indicateur({ icone, libelle, children }: { icone: React.ReactNode; libelle: string; children: React.ReactNode }) {
  return (
    <motion.div variants={elementCascade} className="bg-white px-4 sm:px-5 py-4">
      <dt className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        <span className="text-[#FC7701]">{icone}</span> {libelle}
      </dt>
      <dd className="mt-1.5 text-xl font-black text-[#011023] tabular-nums">{children}</dd>
    </motion.div>
  );
}

const StarIcone = () => <span className="text-base leading-none">★</span>;
