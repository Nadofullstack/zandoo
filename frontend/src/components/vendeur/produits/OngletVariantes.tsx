import { Plus } from 'lucide-react';
import VarianteEditor from './VarianteEditor';
import type { VarianteProduit } from '../../../types/admin';

interface Props {
  variantes: VarianteProduit[];
  onAjouter: () => void;
  onNomChange: (index: number, nom: string) => void;
  onAjouterValeur: (index: number, valeur: string) => void;
  onSupprimerValeur: (indexVariante: number, indexValeur: number) => void;
  onSupprimer: (index: number) => void;
}

export default function OngletVariantes({
  variantes, onAjouter, onNomChange, onAjouterValeur, onSupprimerValeur, onSupprimer,
}: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-[#74777d] bg-blue-50 border border-blue-100 rounded-xl p-3">
        💡 Les variantes permettent de définir des options comme la{' '}
        <strong>Taille</strong> (S, M, L, XL) ou la <strong>Couleur</strong> (Rouge, Bleu, Vert).
      </p>

      {variantes.map((variante, i) => (
        <VarianteEditor
          key={i} index={i} variante={variante}
          onNomChange={(nom) => onNomChange(i, nom)}
          onAjouterValeur={(v) => onAjouterValeur(i, v)}
          onSupprimerValeur={(iv) => onSupprimerValeur(i, iv)}
          onSupprimer={() => onSupprimer(i)}
        />
      ))}

      <button type="button" onClick={onAjouter}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed
                   border-gray-300 rounded-xl text-sm font-semibold text-gray-500
                   hover:border-accent hover:text-accent transition-colors">
        <Plus size={16} aria-hidden /> Ajouter une variante
      </button>
    </div>
  );
}
