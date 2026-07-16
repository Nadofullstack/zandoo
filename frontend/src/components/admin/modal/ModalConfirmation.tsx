import { useState, type ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../../ui/Button';

interface ModalConfirmationProps {
  ouvert: boolean;
  titre: string;
  description: string;
  labelConfirmer?: string;
  labelAnnuler?: string;
  variante?: 'danger' | 'warning' | 'success';
  avecRaison?: boolean;
  labelRaison?: string;
  chargement?: boolean;
  onConfirmer: (raison?: string) => void;
  onAnnuler: () => void;
  children?: ReactNode;
}

/**
 * Modal de confirmation avec champ raison optionnel.
 * Utilisé pour approuver ou suspendre un vendeur.
 */
export default function ModalConfirmation({
  ouvert,
  titre,
  description,
  labelConfirmer = 'Confirmer',
  labelAnnuler = 'Annuler',
  variante = 'warning',
  avecRaison = false,
  labelRaison = 'Raison (optionnel)',
  chargement = false,
  onConfirmer,
  onAnnuler,
}: ModalConfirmationProps) {
  const [raison, setRaison] = useState('');

  if (!ouvert) return null;

  const couleurIcone: Record<string, string> = {
    danger:  'text-red-500',
    warning: 'text-yellow-500',
    success: 'text-green-500',
  };

  const handleConfirmer = () => {
    onConfirmer(raison.trim() || undefined);
    setRaison('');
  };

  const handleAnnuler = () => {
    setRaison('');
    onAnnuler();
  };

  return (
    /* Fond semi-transparent */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titre"
    >
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl p-6 relative">

        {/* Bouton fermeture */}
        <button
          onClick={handleAnnuler}
          aria-label="Fermer"
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-primary transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icône + titre */}
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={22} className={`shrink-0 mt-0.5 ${couleurIcone[variante]}`} aria-hidden="true" />
          <div>
            <h2 id="modal-titre" className="text-base font-bold text-primary">
              {titre}
            </h2>
            <p className="mt-1 text-sm text-[#74777d] leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Champ raison optionnel */}
        {avecRaison && (
          <div className="mb-4">
            <label htmlFor="modal-raison" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
              {labelRaison}
            </label>
            <textarea
              id="modal-raison"
              value={raison}
              onChange={(e) => setRaison(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Précisez la raison..."
              className="w-full px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-0.5">{raison.length}/300</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleAnnuler}
            disabled={chargement}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-[#74777d] hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {labelAnnuler}
          </button>
          <Button
            onClick={handleConfirmer}
            isLoading={chargement}
            loadingText="En cours…"
            className="!w-auto px-5 py-2 text-sm"
          >
            {labelConfirmer}
          </Button>
        </div>

      </div>
    </div>
  );
}
