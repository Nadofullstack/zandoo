import type { Transition, Variants } from 'framer-motion';

/**
 * Langage d'animation de la vitrine : mêmes courbes et mêmes durées partout,
 * pour un rendu homogène. Framer Motion respecte « réduire les animations »
 * via <MotionConfig reducedMotion="user"> (voir AccueilPage).
 */

/** Courbe « sortie douce » (proche de easeOutExpo) */
export const EASE_SORTIE = [0.16, 1, 0.3, 1] as const;

export const TRANSITION_DOUCE: Transition = { duration: 0.7, ease: EASE_SORTIE };

/** Apparition vers le haut */
export const fondu: Variants = {
  cache:   { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: TRANSITION_DOUCE },
};

/** Conteneur qui révèle ses enfants les uns après les autres */
export const cascade = (decalage = 0.08, delai = 0): Variants => ({
  cache:   {},
  visible: { transition: { staggerChildren: decalage, delayChildren: delai } },
});

/** Élément enfant d'une cascade (carte, ligne de texte…) */
export const elementCascade: Variants = {
  cache:   { opacity: 0, y: 28, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: TRANSITION_DOUCE },
};

/** Déclenchement au défilement : une seule fois, un peu avant d'être entièrement visible */
export const VUE_UNIQUE = { once: true, amount: 0.2 } as const;
