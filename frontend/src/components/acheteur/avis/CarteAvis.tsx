import { BadgeCheck, Store } from 'lucide-react';
import type { AvisPublic } from '../../../types/acheteur';
import EtoilesNote from '../../ui/EtoilesNote';
import { formatDate } from '../commandes/configCommandes';

/** Un avis client publié, avec la réponse éventuelle de la boutique. */
export default function CarteAvis({ avis, nomBoutique }: { avis: AvisPublic; nomBoutique?: string }) {
  return (
    <article className="py-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-[#011023] text-white text-sm font-bold flex items-center justify-center shrink-0">
          {avis.auteur.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#011023] flex items-center gap-1.5">
            {avis.auteur}
            {avis.achatVerifie && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-700">
                <BadgeCheck size={13} /> Achat vérifié
              </span>
            )}
          </p>
          <p className="text-xs text-gray-400">
            {formatDate(avis.createdAt)}{avis.modifie && ' · modifié'}
          </p>
        </div>
      </div>

      <EtoilesNote note={avis.note} taille={14} />
      {avis.titre && <h4 className="text-sm font-bold text-[#011023] mt-2">{avis.titre}</h4>}
      {avis.commentaire && <p className="text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-line">{avis.commentaire}</p>}

      {avis.reponseVendeur && (
        <div className="mt-3 ml-4 pl-4 border-l-2 border-[#FC7701]/40">
          <p className="text-xs font-semibold text-[#011023] flex items-center gap-1.5">
            <Store size={12} className="text-[#FC7701]" /> Réponse de {nomBoutique ?? 'la boutique'}
          </p>
          <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{avis.reponseVendeur.texte}</p>
        </div>
      )}
    </article>
  );
}
