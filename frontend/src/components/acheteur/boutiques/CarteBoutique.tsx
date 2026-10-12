import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Package, Store } from 'lucide-react';
import type { BoutiqueResume } from '../../../types/acheteur';
import { lienBoutique } from '../../../services/acheteur/acheteurBoutiqueService';
import EtoilesNote from '../../ui/EtoilesNote';
import { EASE_SORTIE, elementCascade } from '../accueil/animations';

/** Carte d'une boutique dans l'annuaire : identité, réputation et aperçu du catalogue. */
export default function CarteBoutique({ boutique: b }: { boutique: BoutiqueResume }) {
  return (
    <motion.article variants={elementCascade} whileHover="survol" className="h-full">
      <Link
        to={lienBoutique(b)}
        className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/70 hover:border-transparent transition-shadow duration-300"
      >
        {/* Bannière */}
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#011023] to-[#0a2a4f]">
          {b.banniere && (
            <motion.img
              src={b.banniere}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              variants={{ survol: { scale: 1.08 } }}
              transition={{ duration: 0.7, ease: EASE_SORTIE }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {b.retrait && (
            <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide bg-white/90 text-[#011023] px-2 py-0.5 rounded-full">
              Retrait possible
            </span>
          )}
        </div>

        {/* Identité */}
        <div className="px-5 pb-5 flex flex-col flex-1">
          <div className="-mt-8 mb-3 w-16 h-16 rounded-2xl bg-white p-1 shadow-md ring-1 ring-gray-100">
            <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
              {b.logo ? <img src={b.logo} alt="" className="w-full h-full object-cover" /> : <Store size={24} className="text-gray-300" />}
            </div>
          </div>

          <h3 className="text-base font-black text-[#011023] leading-tight group-hover:text-[#FC7701] transition-colors line-clamp-1">
            {b.nomEntreprise}
          </h3>
          <p className="mt-1 text-xs text-gray-500 flex items-center gap-1.5 truncate">
            {b.secteurActivite && <span className="truncate">{b.secteurActivite}</span>}
            {b.secteurActivite && b.ville && <span className="text-gray-300">•</span>}
            {b.ville && <span className="inline-flex items-center gap-0.5 shrink-0"><MapPin size={11} /> {b.ville}</span>}
          </p>

          <div className="mt-3 flex items-center gap-3 text-xs">
            {b.nombreAvis > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <EtoilesNote note={b.noteMoyenne} taille={12} />
                <span className="font-semibold text-[#011023]">{b.noteMoyenne.toLocaleString('fr-FR', { minimumFractionDigits: 1 })}</span>
                <span className="text-gray-400">({b.nombreAvis})</span>
              </span>
            ) : (
              <span className="text-gray-400">Nouvelle boutique</span>
            )}
            <span className="ml-auto inline-flex items-center gap-1 text-gray-500">
              <Package size={12} /> {b.nombreProduits} produit{b.nombreProduits > 1 ? 's' : ''}
            </span>
          </div>

          {b.description && <p className="mt-3 text-sm text-gray-600 line-clamp-2">{b.description}</p>}

          {/* Aperçu du catalogue */}
          {b.apercu.length > 0 && (
            <div className="mt-auto pt-4 grid grid-cols-3 gap-2">
              {b.apercu.map((photo, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-50">
                  <img src={photo} alt="" loading="lazy" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
