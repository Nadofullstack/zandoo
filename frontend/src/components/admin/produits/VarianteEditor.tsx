import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { VarianteProduit } from '../../../types/admin';

interface Props {
  index: number;
  variante: VarianteProduit;
  onNomChange: (nom: string) => void;
  onAjouterValeur: (valeur: string) => void;
  onSupprimerValeur: (index: number) => void;
  onSupprimer: () => void;
}

export default function VarianteEditor({
  index, variante, onNomChange, onAjouterValeur, onSupprimerValeur, onSupprimer,
}: Props) {
  const [saisie, setSaisie] = useState('');

  const confirmer = () => {
    if (saisie.trim()) { onAjouterValeur(saisie.trim()); setSaisie(''); }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">

      {/* Nom de la variante + bouton supprimer */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={variante.nom}
          onChange={(e) => onNomChange(e.target.value)}
          placeholder="Ex : Taille, Couleur, Matière…"
          className="flex-1 px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg outline-none
                     focus:ring-2 focus:ring-accent/20 focus:border-accent font-semibold"
        />
        <button
          type="button"
          onClick={onSupprimer}
          aria-label={`Supprimer la variante ${index + 1}`}
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Tags des valeurs existantes */}
      {variante.valeurs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {variante.valeurs.map((val, iv) => (
            <span
              key={iv}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                         bg-orange-100 text-accent text-xs font-semibold"
            >
              {val}
              <button
                type="button"
                onClick={() => onSupprimerValeur(iv)}
                aria-label={`Supprimer ${val}`}
                className="hover:text-red-600 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Saisie nouvelle valeur */}
      <div className="flex gap-2">
        <input
          type="text"
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmer(); } }}
          placeholder="Ajouter une valeur (Entrée pour valider)"
          className="flex-1 px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg outline-none
                     focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
        <button
          type="button"
          disabled={!saisie.trim()}
          onClick={confirmer}
          className="px-3 py-2 rounded-lg bg-accent text-white text-xs font-semibold
                     disabled:opacity-40 hover:bg-accent/90 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
