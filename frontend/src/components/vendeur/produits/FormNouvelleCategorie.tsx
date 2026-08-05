import { useState } from 'react';

interface Props {
  onCreer: (nom: string) => void;
  onAnnuler: () => void;
  chargement: boolean;
  erreur?: string;
}

export default function FormNouvelleCategorie({ onCreer, onAnnuler, chargement, erreur }: Props) {
  const [nom, setNom] = useState('');

  return (
    <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
      <p className="text-xs font-semibold text-primary">Créer une nouvelle catégorie</p>
      <input
        type="text"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        placeholder="Nom de la catégorie"
        className="w-full px-3 py-2 text-sm border border-[#c4c6cd] rounded-lg outline-none
                   focus:ring-2 focus:ring-accent/20 focus:border-accent"
      />
      {erreur && <p className="text-xs text-red-600">{erreur}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onAnnuler}
          className="px-3 py-1.5 text-xs text-gray-500 hover:text-primary transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          disabled={chargement || !nom.trim()}
          onClick={() => nom.trim() && onCreer(nom.trim())}
          className="px-3 py-1.5 text-xs font-semibold bg-accent text-white rounded-lg
                     disabled:opacity-50 hover:bg-accent/90 transition-colors"
        >
          {chargement ? 'Création…' : 'Créer'}
        </button>
      </div>
    </div>
  );
}
