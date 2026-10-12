import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import type { AdresseEnregistree, ChampsAdresse } from '../../../types/acheteur';
import FormulaireAdresse from './FormulaireAdresse';
import { ADRESSE_VIDE, validerAdresse } from './adresseUtils';

interface Props {
  /** Adresse à modifier ; absente = création */
  adresse?: AdresseEnregistree | null;
  /** Nom pré-rempli pour une nouvelle adresse (utilisateur connecté) */
  nomParDefaut?: string;
  telephoneParDefaut?: string;
  onEnregistrer: (champs: ChampsAdresse, parDefaut: boolean) => Promise<void>;
  onFermer: () => void;
}

export default function ModalAdresse({ adresse, nomParDefaut = '', telephoneParDefaut = '', onEnregistrer, onFermer }: Props) {
  const [champs, setChamps] = useState<ChampsAdresse>(() =>
    adresse
      ? { ...ADRESSE_VIDE, ...adresse }
      : { ...ADRESSE_VIDE, nomComplet: nomParDefaut, telephone: telephoneParDefaut },
  );
  const [parDefaut, setParDefaut] = useState(adresse?.parDefaut ?? false);
  const [envoi, setEnvoi]         = useState(false);
  const [erreur, setErreur]       = useState<string | null>(null);

  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => { if (e.key === 'Escape' && !envoi) onFermer(); };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [envoi, onFermer]);

  const enregistrer = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalide = validerAdresse(champs);
    if (invalide) { setErreur(invalide); return; }

    setEnvoi(true);
    setErreur(null);
    try {
      await onEnregistrer(champs, parDefaut);
      onFermer();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "L'enregistrement a échoué.");
      setEnvoi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="titre-modal-adresse">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !envoi && onFermer()} />

      <form onSubmit={enregistrer} className="relative w-full sm:max-w-lg max-h-[92vh] flex flex-col bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="titre-modal-adresse" className="text-base font-bold text-[#011023]">
            {adresse ? "Modifier l'adresse" : 'Nouvelle adresse'}
          </h2>
          <button type="button" onClick={onFermer} disabled={envoi} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Fermer">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <FormulaireAdresse valeur={champs} onChange={setChamps} />

          {!adresse?.parDefaut && (
            <label className="mt-5 flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={parDefaut} onChange={(e) => setParDefaut(e.target.checked)} className="w-4 h-4 accent-[#FC7701]" />
              Utiliser comme adresse par défaut
            </label>
          )}

          {erreur && <p className="mt-4 text-sm text-red-600" role="alert">{erreur}</p>}
        </div>

        <footer className="flex flex-col-reverse sm:flex-row gap-2 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onFermer} disabled={envoi} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50">
            Annuler
          </button>
          <button type="submit" disabled={envoi} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FC7701] hover:bg-[#e06900] disabled:opacity-70 inline-flex items-center justify-center gap-2">
            {envoi && <Loader2 size={16} className="animate-spin" />}
            Enregistrer
          </button>
        </footer>
      </form>
    </div>
  );
}
