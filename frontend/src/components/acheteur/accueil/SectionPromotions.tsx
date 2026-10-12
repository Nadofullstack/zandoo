import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import type { ProduitPromotion } from '../../../types/acheteur';
import CarteProduit from './CarteProduit';
import { VUE_UNIQUE, cascade, elementCascade, fondu } from './animations';

interface Props {
  promotions: ProduitPromotion[];
}

/**
 * Bandeau « Promotions du moment » : meilleures remises en cours,
 * carrousel horizontal à défilement aimanté, révélation en cascade.
 */
export default function SectionPromotions({ promotions }: Props) {
  const rail = useRef<HTMLDivElement>(null);
  const [bords, setBords] = useState({ debut: true, fin: false });
  const remiseMax = Math.max(...promotions.map((p) => p.remise));

  const majBords = () => {
    const el = rail.current;
    if (!el) return;
    setBords({ debut: el.scrollLeft <= 4, fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };

  /* Mesure initiale après le premier rendu (et si la liste change) */
  useEffect(() => {
    const id = requestAnimationFrame(majBords);
    return () => cancelAnimationFrame(id);
  }, [promotions]);

  const defiler = (sens: 1 | -1) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: sens * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="titre-promotions" className="relative overflow-hidden bg-[#011023] py-14 sm:py-20">
      <FondAnime />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* ── En-tête ─────────────────────────────────────────────────── */}
        <motion.div
          variants={cascade(0.1)}
          initial="cache"
          whileInView="visible"
          viewport={VUE_UNIQUE}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 sm:mb-10"
        >
          <div>
            <motion.span variants={fondu} className="inline-flex items-center gap-2 rounded-full bg-[#FC7701]/15 border border-[#FC7701]/30 px-3.5 py-1.5 mb-4">
              <motion.span
                animate={{ scale: [1, 1.25, 1], rotate: [0, -8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex"
              >
                <Flame size={14} className="text-[#FC7701]" />
              </motion.span>
              <span className="text-[#FC7701] text-xs font-bold uppercase tracking-[0.18em]">Bonnes affaires</span>
            </motion.span>

            <motion.h2 variants={fondu} id="titre-promotions" className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Promotions du moment
            </motion.h2>
            <motion.p variants={fondu} className="mt-3 text-white/60 text-sm sm:text-base">
              Jusqu'à <CompteurRemise valeur={remiseMax} /> sur une sélection de produits de nos boutiques.
            </motion.p>
          </div>

          <motion.div variants={fondu} className="flex items-center gap-3">
            <div className="hidden sm:flex gap-2">
              <BoutonDefilement sens={-1} desactive={bords.debut} onClick={() => defiler(-1)} />
              <BoutonDefilement sens={1} desactive={bords.fin} onClick={() => defiler(1)} />
            </div>
            <Link
              to="/promotions"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2.5 rounded-xl transition-colors"
            >
              Toutes les promotions
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Rail de produits ───────────────────────────────────────── */}
        <motion.div
          ref={rail}
          onScroll={majBords}
          variants={cascade(0.07, 0.15)}
          initial="cache"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {promotions.map((p) => (
            <motion.div
              key={p._id}
              variants={elementCascade}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="snap-start shrink-0 w-[70%] sm:w-[calc((100%-2*1.25rem)/3)] lg:w-[calc((100%-4*1.25rem)/5)]"
            >
              <CarteProduit produit={p} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/** « -XX % » qui compte jusqu'à sa valeur lorsqu'il apparaît à l'écran */
function CompteurRemise({ valeur }: { valeur: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const reduire = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !visible) return;
    if (reduire) { el.textContent = `-${valeur} %`; return; }
    const controle = animate(0, valeur, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { el.textContent = `-${Math.round(v)} %`; },
    });
    return () => controle.stop();
  }, [visible, valeur, reduire]);

  return <span ref={ref} className="font-black text-[#FC7701] tabular-nums">-{valeur} %</span>;
}

/** Halos lumineux en mouvement lent (décoratif, désactivé si animations réduites) */
function FondAnime() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <motion.div
        className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-[#FC7701]/20 blur-[120px]"
        animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-48 right-0 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[130px]"
        animate={{ x: [0, -60, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:28px_28px]" />
    </div>
  );
}

function BoutonDefilement({ sens, desactive, onClick }: { sens: 1 | -1; desactive: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={desactive}
      whileHover={desactive ? undefined : { scale: 1.08 }}
      whileTap={desactive ? undefined : { scale: 0.92 }}
      aria-label={sens === 1 ? 'Promotions suivantes' : 'Promotions précédentes'}
      className="w-11 h-11 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {sens === 1 ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
    </motion.button>
  );
}
