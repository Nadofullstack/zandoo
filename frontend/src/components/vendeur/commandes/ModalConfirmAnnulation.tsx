import { useState } from 'react';
import { XCircle, X, Loader2 } from 'lucide-react';
import type { CommandeVendeur } from '../../../types/vendeur';

interface Props {
  commande: CommandeVendeur;
  chargement: boolean;
  onConfirmer: (raison: string) => void;
  onFermer: () => void;
}

export default function ModalConfirmAnnulation({ commande, chargement, onConfirmer, onFermer }: Props) {
  const [raison, setRaison] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* ── En-tête ── */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle size={18} className="text-red-600" />
            </span>
            <h3 className="font-bold text-primary text-base">Annuler la commande</h3>
          </div>
          <button
            onClick={onFermer}
            aria-label="Fermer"
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* ── Corps ── */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-[#74777d]">
            Vous êtes sur le point d'annuler la commande{' '}
            <span className="font-mono font-semibold text-primary">{commande.numero}</span>.
            Cette action est irréversible.
          </p>
          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">
              Raison <span className="font-normal text-gray-400">(optionnel)</span>
            </label>
            <textarea
              value={raison}
              onChange={(e) => setRaison(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Ex : rupture de stock, erreur de commande…"
              className="w-full px-3 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary
                         focus:outline-none focus:ring-2 focus:ring-red-400/20 focus:border-red-400 resize-none"
            />
          </div>
        </div>

        {/* ── Pied ── */}
        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onFermer}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold
                       text-[#74777d] hover:bg-gray-50 transition-colors"
          >
            Retour
          </button>
          <button
            onClick={() => onConfirmer(raison)}
            disabled={chargement}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold
                       hover:bg-red-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {chargement ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
