import { useEffect, useRef, useState } from 'react';
import { Loader2, SendHorizonal } from 'lucide-react';
import type { ProduitMessage } from '../../types/messagerie';
import CarteProduitMessage from './CarteProduitMessage';

const LONGUEUR_MAX = 2000;

interface Props {
  onEnvoyer: (texte: string, produit?: ProduitMessage) => Promise<void>;
  onSaisie: () => void;
  /** Produit joint au prochain message (arrivée depuis le bouton « Discuter ») */
  produitJoint?: ProduitMessage | null;
  onRetirerProduit?: () => void;
  /** Réponses rapides proposées tant que le champ est vide */
  suggestions?: string[];
  desactive?: boolean;
}

/** Zone de saisie : hauteur automatique, Entrée pour envoyer, Maj+Entrée pour aller à la ligne. */
export default function ZoneSaisie({ onEnvoyer, onSaisie, produitJoint, onRetirerProduit, suggestions = [], desactive }: Props) {
  const [texte, setTexte] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const champ = useRef<HTMLTextAreaElement>(null);

  /* Hauteur automatique (jusqu'à ~6 lignes) */
  useEffect(() => {
    const el = champ.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [texte]);

  useEffect(() => { if (produitJoint) champ.current?.focus(); }, [produitJoint]);

  const envoyer = async (contenu = texte) => {
    if ((!contenu.trim() && !produitJoint) || envoi || desactive) return;
    setEnvoi(true);
    setErreur(null);
    setTexte('');
    try {
      await onEnvoyer(contenu, produitJoint ?? undefined);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Le message n'a pas pu être envoyé.");
    } finally {
      setEnvoi(false);
      champ.current?.focus();
    }
  };

  const surTouche = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      envoyer();
    }
  };

  const peutEnvoyer = (!!texte.trim() || !!produitJoint) && !envoi && !desactive;

  return (
    <div className="border-t border-gray-100 bg-white px-3 sm:px-4 py-3 space-y-2">
      {produitJoint && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Produit joint au message</p>
          <CarteProduitMessage produit={produitJoint} onRetirer={onRetirerProduit} />
        </div>
      )}

      {suggestions.length > 0 && !texte && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => envoyer(s)}
              disabled={envoi || desactive}
              className="shrink-0 text-xs font-medium text-[#011023] bg-orange-50 border border-[#FC7701]/30 hover:bg-orange-100 rounded-full px-3 py-1.5 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {erreur && <p className="text-xs text-red-600" role="alert">{erreur}</p>}

      <div className="flex items-end gap-2">
        <textarea
          ref={champ}
          value={texte}
          onChange={(e) => { setTexte(e.target.value.slice(0, LONGUEUR_MAX)); onSaisie(); }}
          onKeyDown={surTouche}
          rows={1}
          disabled={desactive}
          placeholder="Écrivez votre message…"
          aria-label="Votre message"
          className="flex-1 resize-none px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm leading-relaxed focus:outline-none focus:bg-white focus:border-[#FC7701] focus:ring-2 focus:ring-[#FC7701]/15 max-h-40"
        />
        <button
          type="button"
          onClick={() => envoyer()}
          disabled={!peutEnvoyer}
          aria-label="Envoyer"
          className="w-11 h-11 rounded-full bg-[#FC7701] hover:bg-[#e06900] text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-105"
        >
          {envoi ? <Loader2 size={18} className="animate-spin" /> : <SendHorizonal size={18} />}
        </button>
      </div>
      {texte.length > LONGUEUR_MAX * 0.9 && <p className="text-[11px] text-right text-gray-400">{texte.length}/{LONGUEUR_MAX}</p>}
    </div>
  );
}
