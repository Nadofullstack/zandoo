import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  villes: string[];
  onChange: (villes: string[]) => void;
  id?: string;
}

const MAX_VILLES = 30;

/** Saisie de villes sous forme d'étiquettes (Entrée ou virgule pour valider). */
export default function SaisieVilles({ villes, onChange, id }: Props) {
  const [saisie, setSaisie] = useState('');

  const ajouter = (brut: string) => {
    const nouvelles = brut.split(',').map((v) => v.trim()).filter(Boolean);
    const existantes = new Set(villes.map((v) => v.toLowerCase()));
    const ajout = nouvelles.filter((v) => !existantes.has(v.toLowerCase()));
    if (ajout.length) onChange([...villes, ...ajout].slice(0, MAX_VILLES));
    setSaisie('');
  };

  const surTouche = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && saisie.trim()) {
      e.preventDefault();
      ajouter(saisie);
    } else if (e.key === 'Backspace' && !saisie && villes.length) {
      onChange(villes.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 min-h-[42px] px-2 py-1.5 border border-[#c4c6cd] rounded-xl bg-white focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent">
      {villes.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-[#eff4ff] text-xs font-medium text-primary">
          {v}
          <button type="button" onClick={() => onChange(villes.filter((x) => x !== v))} className="p-0.5 rounded hover:bg-white" aria-label={`Retirer ${v}`}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={saisie}
        onChange={(e) => setSaisie(e.target.value)}
        onKeyDown={surTouche}
        onBlur={() => saisie.trim() && ajouter(saisie)}
        placeholder={villes.length ? 'Ajouter…' : 'Ex : Cotonou, Abomey-Calavi'}
        disabled={villes.length >= MAX_VILLES}
        className="flex-1 min-w-[140px] px-1.5 py-1 text-sm text-primary bg-transparent focus:outline-none"
      />
    </div>
  );
}
