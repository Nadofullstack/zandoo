import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { PublicitePublique } from '../../../types/acheteur';
import { formatPrix } from '../commandes/configCommandes';
import LienPublicite from './LienPublicite';
import { EASE_SORTIE, cascade, elementCascade } from './animations';

interface Props {
  publicites: PublicitePublique[];
  onVue: (id: string) => void;
  onClic: (id: string) => void;
}

const DUREE_DIAPO_MS = 6500;
const SEUIL_GLISSEMENT_PX = 80;

/** Décalage d'entrée/sortie selon le sens de navigation */
const variantesDiapo = {
  entree: (sens: number) => ({ x: `${sens * 8}%`, opacity: 0 }),
  centre: { x: '0%', opacity: 1, transition: { duration: 0.9, ease: EASE_SORTIE } },
  sortie: (sens: number) => ({ x: `${sens * -8}%`, opacity: 0, transition: { duration: 0.6, ease: EASE_SORTIE } }),
};

/**
 * Carrousel des campagnes « accueil_haut ».
 * Lecture automatique avec barres de progression, glissement tactile, clavier,
 * pause au survol / onglet masqué / hors écran, et mesure d'audience.
 */
export default function CarrouselPublicitaire({ publicites, onVue, onClic }: Props) {
  const conteneur = useRef<HTMLElement>(null);
  const enVue = useInView(conteneur, { amount: 0.4 });
  const reduireAnimations = useReducedMotion();

  const [[index, sens], setDiapo] = useState<[number, number]>([0, 1]);
  const [survol, setSurvol] = useState(false);
  const [pauseManuelle, setPauseManuelle] = useState(false);
  const [ongletMasque, setOngletMasque] = useState(false);
  /* Un glissement ne doit pas déclencher le clic (navigation) au relâchement */
  const aGlisse = useRef(false);

  const total = publicites.length;
  const active = publicites[index];
  const lectureAuto = total > 1 && !reduireAnimations;
  const enPause = !lectureAuto || survol || pauseManuelle || ongletMasque || !enVue;

  /* ── Navigation ─────────────────────────────────────────────────────────── */
  const progression = useMotionValue(0);
  const largeurBarre = useTransform(progression, (v) => `${v * 100}%`);

  const allerA = useCallback((cible: number, direction?: number) => {
    setDiapo(([courant]) => {
      const suivant = (cible + total) % total;
      return [suivant, direction ?? (suivant > courant ? 1 : -1)];
    });
    progression.set(0);
  }, [total, progression]);

  const suivante  = useCallback(() => allerA(index + 1, 1), [allerA, index]);
  const precedente = useCallback(() => allerA(index - 1, -1), [allerA, index]);

  /* Progression temporelle : la pause reprend exactement où elle s'était arrêtée */
  useAnimationFrame((_, delta) => {
    if (enPause) return;
    const valeur = progression.get() + delta / DUREE_DIAPO_MS;
    if (valeur >= 1) suivante();
    else progression.set(valeur);
  });

  useEffect(() => {
    const surVisibilite = () => setOngletMasque(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', surVisibilite);
    return () => document.removeEventListener('visibilitychange', surVisibilite);
  }, []);

  /* Impression : la diapositive active est réellement visible à l'écran */
  useEffect(() => {
    if (enVue && active) onVue(active._id);
  }, [enVue, active, onVue]);

  const surGlissement = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SEUIL_GLISSEMENT_PX || info.velocity.x < -500) suivante();
    else if (info.offset.x > SEUIL_GLISSEMENT_PX || info.velocity.x > 500) precedente();
  };

  const surTouche = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); suivante(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); precedente(); }
  };

  if (!active) return null;

  return (
    <section
      ref={conteneur}
      aria-roledescription="carrousel"
      aria-label="Offres à la une"
      tabIndex={0}
      onKeyDown={surTouche}
      onMouseEnter={() => setSurvol(true)}
      onMouseLeave={() => setSurvol(false)}
      onFocusCapture={() => setSurvol(true)}
      onBlurCapture={() => setSurvol(false)}
      className="relative bg-[#011023] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FC7701] focus-visible:ring-inset"
    >
      <div className="relative h-[340px] sm:h-[440px] lg:h-[540px]">
        <AnimatePresence initial={false} custom={sens}>
          <motion.div
            key={active._id}
            custom={sens}
            variants={variantesDiapo}
            initial="entree"
            animate="centre"
            exit="sortie"
            drag={total > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragStart={() => { aGlisse.current = true; }}
            onDragEnd={surGlissement}
            onPointerDown={() => { aGlisse.current = false; }}
            onClickCapture={(e) => {
              if (aGlisse.current) { e.preventDefault(); e.stopPropagation(); aGlisse.current = false; }
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${index + 1} sur ${total}`}
          >
            <Diapositive publicite={active} onClic={() => onClic(active._id)} reduireAnimations={!!reduireAnimations} />
          </motion.div>
        </AnimatePresence>

        <span className="absolute top-4 right-4 z-20 text-[10px] font-semibold uppercase tracking-wider text-white/80 bg-black/30 backdrop-blur px-2 py-0.5 rounded-full pointer-events-none">
          Sponsorisé
        </span>

        {/* ── Contrôles ─────────────────────────────────────────────────── */}
        {total > 1 && (
          <div className="absolute inset-x-0 bottom-0 z-20">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pb-5 sm:pb-7 flex items-end justify-between gap-6">
              {/* Barres de progression (cliquables) */}
              <div className="flex-1 max-w-md">
                <p className="text-white/60 text-xs font-semibold tabular-nums mb-2.5 tracking-widest">
                  <span className="text-white">{String(index + 1).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
                </p>
                <div className="flex gap-1.5">
                  {publicites.map((p, i) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => allerA(i)}
                      aria-label={`Afficher l'offre ${i + 1}`}
                      aria-current={i === index}
                      className="group relative flex-1 h-6 flex items-center"
                    >
                      <span className="relative block w-full h-[3px] rounded-full bg-white/25 overflow-hidden group-hover:bg-white/40 transition-colors">
                        {i < index && <span className="absolute inset-0 bg-white" />}
                        {i === index && <motion.span className="absolute inset-y-0 left-0 bg-[#FC7701]" style={{ width: lectureAuto ? largeurBarre : '100%' }} />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flèches + lecture */}
              <div className="flex items-center gap-2">
                {lectureAuto && (
                  <BoutonRond onClick={() => setPauseManuelle((p) => !p)} libelle={pauseManuelle ? 'Reprendre le défilement' : 'Mettre en pause'}>
                    {pauseManuelle ? <Play size={16} /> : <Pause size={16} />}
                  </BoutonRond>
                )}
                <BoutonRond onClick={precedente} libelle="Offre précédente"><ChevronLeft size={18} /></BoutonRond>
                <BoutonRond onClick={suivante} libelle="Offre suivante"><ChevronRight size={18} /></BoutonRond>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Diapositive ─────────────────────────────────────────────────────────── */

function Diapositive({ publicite: p, onClic, reduireAnimations }: { publicite: PublicitePublique; onClic: () => void; reduireAnimations: boolean }) {
  const aDuTexte = !!(p.accroche || p.description);
  const prix = p.produit ? (p.produit.prixPromotionnel ?? p.produit.prix) : null;

  return (
    <LienPublicite lien={p.lien} onClic={onClic} libelle={p.accroche || p.texteAlt} className="block w-full h-full select-none" >
      {/* Visuel : zoom lent (effet Ken Burns) */}
      <motion.img
        src={p.imageUrl}
        alt={p.texteAlt}
        draggable={false}
        initial={{ scale: reduireAnimations ? 1 : 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: DUREE_DIAPO_MS / 1000 + 1.5, ease: 'linear' }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Voile de lisibilité (uniquement si du texte est superposé) */}
      {aDuTexte && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#011023]/90 via-[#011023]/55 to-transparent" aria-hidden="true" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#011023]/70 to-transparent" aria-hidden="true" />

      {aDuTexte && (
        <div className="relative z-10 h-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center">
          <motion.div variants={cascade(0.12, 0.35)} initial="cache" animate="visible" className="max-w-xl pb-16 sm:pb-12">
            {p.vendeur && (
              <motion.p variants={elementCascade} className="inline-flex items-center gap-2 mb-4 text-xs font-semibold text-white/80 uppercase tracking-[0.2em]">
                {p.vendeur.logo && <img src={p.vendeur.logo} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-white/30" />}
                {p.vendeur.nomEntreprise}
              </motion.p>
            )}

            {p.accroche && (
              <motion.h2 variants={elementCascade} className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight">
                {p.accroche}
              </motion.h2>
            )}

            {p.description && (
              <motion.p variants={elementCascade} className="mt-4 text-sm sm:text-lg text-white/80 leading-relaxed max-w-md">
                {p.description}
              </motion.p>
            )}

            {prix !== null && p.produit && (
              <motion.p variants={elementCascade} className="mt-5 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-[#FC7701]">{formatPrix(prix)}</span>
                {p.produit.prixPromotionnel && <span className="text-sm text-white/50 line-through">{formatPrix(p.produit.prix)}</span>}
              </motion.p>
            )}

            <motion.span
              variants={elementCascade}
              className="group/cta mt-7 inline-flex items-center gap-2 bg-[#FC7701] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-[#FC7701]/30"
            >
              {p.libelleBouton || 'Découvrir'}
              <ArrowRight size={18} className="transition-transform group-hover/cta:translate-x-1" />
            </motion.span>
          </motion.div>
        </div>
      )}
    </LienPublicite>
  );
}

function BoutonRond({ onClick, libelle, children }: { onClick: () => void; libelle: string; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={libelle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-colors"
    >
      {children}
    </motion.button>
  );
}
