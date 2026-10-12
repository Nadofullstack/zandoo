import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fondu, VUE_UNIQUE } from './animations';

interface Props {
  children: ReactNode;
  className?: string;
  /** Délai avant l'animation (secondes) */
  delai?: number;
  as?: 'div' | 'section';
}

/** Fait apparaître un bloc en fondu montant lorsqu'il entre dans l'écran (une seule fois). */
export default function Apparition({ children, className, delai = 0, as = 'div' }: Props) {
  const Composant = as === 'section' ? motion.section : motion.div;
  return (
    <Composant
      className={className}
      variants={fondu}
      initial="cache"
      whileInView="visible"
      viewport={VUE_UNIQUE}
      transition={{ delay: delai }}
    >
      {children}
    </Composant>
  );
}
