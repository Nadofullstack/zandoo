import { useState } from 'react';
import { StickyNote, Save } from 'lucide-react';

interface NotesAdminProps {
  notesInitiales?: string;
  chargement?: boolean;
  onSauvegarder: (notes: string) => void;
}

/**
 * Zone de notes internes pour l'administrateur.
 * Les modifications ne sont sauvegardées qu'au clic sur le bouton.
 */
export default function NotesAdmin({
  notesInitiales = '',
  chargement = false,
  onSauvegarder,
}: NotesAdminProps) {
  const [notes, setNotes] = useState(notesInitiales);
  const modifie = notes !== notesInitiales;

  return (
    <div className="bg-surface border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
        <StickyNote size={15} className="text-accent" aria-hidden="true" />
        Notes internes
        <span className="text-xs font-normal text-gray-400 normal-case tracking-normal">(visibles uniquement par les admins)</span>
      </h3>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        maxLength={500}
        placeholder="Ajoutez vos observations sur ce vendeur…"
        aria-label="Notes internes administrateur"
        className="w-full px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
      />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">{notes.length}/500</span>
        <button
          onClick={() => onSauvegarder(notes)}
          disabled={!modifie || chargement}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={14} aria-hidden="true" />
          {chargement ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}
