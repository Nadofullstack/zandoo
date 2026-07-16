import { Search, X } from 'lucide-react';

interface ChampRechercheProps {
  valeur: string;
  onChange: (valeur: string) => void;
  placeholder?: string;
}

/**
 * Champ de recherche avec bouton de réinitialisation.
 */
export default function ChampRecherche({
  valeur,
  onChange,
  placeholder = 'Rechercher…',
}: ChampRechercheProps) {
  return (
    <div className="relative flex-1 min-w-0">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
      />
      {valeur && (
        <button
          onClick={() => onChange('')}
          aria-label="Effacer la recherche"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
