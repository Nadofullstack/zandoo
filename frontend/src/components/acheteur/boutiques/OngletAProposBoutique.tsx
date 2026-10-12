import { motion } from 'framer-motion';
import { Clock, Gift, MapPin, Store, Truck } from 'lucide-react';
import type { BoutiqueDetail } from '../../../types/acheteur';
import { formatPrix } from '../commandes/configCommandes';
import { libelleDelai } from '../checkout/checkoutUtils';
import { VUE_UNIQUE, cascade, elementCascade } from '../accueil/animations';

/** Présentation de la boutique et conditions de livraison (zones, tarifs, retrait). */
export default function OngletAProposBoutique({ boutique: b }: { boutique: BoutiqueDetail }) {
  const l = b.livraison;

  return (
    <motion.div variants={cascade(0.08)} initial="cache" whileInView="visible" viewport={VUE_UNIQUE} className="grid lg:grid-cols-[1fr_400px] gap-6">
      <motion.section variants={elementCascade} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <h2 className="text-lg font-black text-[#011023] mb-4 flex items-center gap-2"><Store size={18} className="text-[#FC7701]" /> À propos</h2>
        {b.description ? (
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{b.description}</p>
        ) : (
          <p className="text-gray-500 italic">Cette boutique n'a pas encore rédigé sa présentation.</p>
        )}
      </motion.section>

      <motion.section variants={elementCascade} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 self-start">
        <h2 className="text-lg font-black text-[#011023] flex items-center gap-2"><Truck size={18} className="text-[#FC7701]" /> Livraison</h2>

        {!l.configuree ? (
          <p className="text-sm text-gray-600">Livraison à domicile offerte.</p>
        ) : (
          <>
            {l.domicile && (
              <div>
                <p className="text-sm font-semibold text-[#011023] mb-2">À domicile</p>
                {l.zones.length > 0 && (
                  <ul className="space-y-2">
                    {l.zones.map((z) => (
                      <li key={z.nom} className="rounded-xl bg-gray-50 px-3.5 py-2.5">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-[#011023]">{z.nom}</span>
                          <span className="font-bold text-[#011023] tabular-nums">{z.tarif ? formatPrix(z.tarif) : 'Gratuit'}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{z.villes.join(', ')}</p>
                        {libelleDelai(z.delaiMin, z.delaiMax) && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={11} /> {libelleDelai(z.delaiMin, z.delaiMax)}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {l.autresVilles ? 'Livraison possible dans les autres villes (tarif calculé à la commande).' : 'Uniquement dans les zones ci-dessus.'}
                </p>
                {l.gratuiteDes !== null && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3.5 py-2.5">
                    <Gift size={15} /> Offerte dès {formatPrix(l.gratuiteDes)} d'achat
                  </p>
                )}
              </div>
            )}

            {l.retrait && (
              <div className={l.domicile ? 'pt-4 border-t border-gray-100' : ''}>
                <p className="text-sm font-semibold text-[#011023] mb-2">Retrait en boutique · gratuit</p>
                <p className="text-sm text-gray-600 flex gap-2"><MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" /> {l.retrait.adresse}, {l.retrait.ville}</p>
                {l.retrait.horaires && <p className="text-xs text-gray-500 mt-1 pl-[23px]">{l.retrait.horaires}</p>}
              </div>
            )}
          </>
        )}
      </motion.section>
    </motion.div>
  );
}
