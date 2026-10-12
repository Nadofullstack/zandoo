import { useEffect, useState } from 'react';
import { Loader2, TriangleAlert, X } from 'lucide-react';
import { MOTIFS_ANNULATION } from './configCommandes';

interface Props {
  numero: string;
  onConfirmer: (raison: string) => Promise<void>;
  onFermer: () => void;
}

const AUTRE = '__autre__';

/** Confirmation d'annulation avec motif (transmis à la boutique dans l'historique). */
export default function ModalAnnulationCommande({ numero, onConfirmer, onFermer }: Props) {
  const [motif, setMotif]       = useState(MOTIFS_ANNULATION[0]);
  const [precision, setPrecision] = useState('');
  const [envoi, setEnvoi]       = useState(false);
  const [erreur, setErreur]     = useState<string | null>(null);

  /* Fermeture au clavier (Échap), sauf pendant l'envoi */
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => { if (e.key === 'Escape' && !envoi) onFermer(); };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [envoi, onFermer]);

  const raison = motif === AUTRE ? precision.trim() : motif;

  const confirmer = async () => {
    setEnvoi(true);
    setErreur(null);
    try {
      await onConfirmer(raison);
      onFermer();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "L'annulation a échoué. Veuillez réessayer.");
      setEnvoi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="titre-annulation">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !envoi && onFermer()} />

      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl">
        <div className="flex items-start gap-3 p-5 border-b border-gray-100">
          <div className="p-2 rounded-full bg-red-50 shrink-0"><TriangleAlert size={18} className="text-red-500" /></div>
          <div className="flex-1">
            <h2 id="titre-annulation" className="text-base font-bold text-[#011023]">Annuler la commande</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Commande <span className="font-mono">{numero}</span>. Cette action est définitive.
            </p>
          </div>
          <button onClick={onFermer} disabled={envoi} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <fieldset className="p-5 space-y-2" disabled={envoi}>
          <legend className="text-sm font-semibold text-gray-700 mb-3">Pourquoi annulez-vous ?</legend>
          {[...MOTIFS_ANNULATION, AUTRE].map((m) => (
            <label
              key={m}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer text-sm transition-colors ${
                motif === m ? 'border-[#FC7701] bg-orange-50/60 text-[#011023]' : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <input type="radio" name="motif" value={m} checked={motif === m} onChange={() => setMotif(m)} className="accent-[#FC7701]" />
              {m === AUTRE ? 'Autre raison' : m}
            </label>
          ))}
          {motif === AUTRE && (
            <textarea
              value={precision}
              onChange={(e) => setPrecision(e.target.value)}
              maxLength={300}
              rows={3}
              autoFocus
              placeholder="Précisez la raison (facultatif)"
              className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FC7701] focus:ring-2 focus:ring-[#FC7701]/20 resize-none"
            />
          )}
          {erreur && <p className="text-sm text-red-600 pt-1">{erreur}</p>}
        </fieldset>

        <div className="flex flex-col-reverse sm:flex-row gap-2 p-5 pt-0">
          <button
            onClick={onFermer}
            disabled={envoi}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Conserver la commande
          </button>
          <button
            onClick={confirmer}
            disabled={envoi}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-70 inline-flex items-center justify-center gap-2"
          >
            {envoi && <Loader2 size={16} className="animate-spin" />}
            Confirmer l'annulation
          </button>
        </div>
      </div>
    </div>
  );
}
