import { useEffect, useState } from 'react';
import { Loader2, Trash2, X } from 'lucide-react';
import type { MonAvis, SaisieAvis } from '../../../types/acheteur';
import SaisieNote from './SaisieNote';

interface Props {
  nomProduit: string;
  photo?: string | null;
  /** Avis existant (modification) ; absent = nouvel avis */
  avisExistant?: MonAvis | null;
  onEnregistrer: (saisie: SaisieAvis) => Promise<void>;
  onSupprimer?: () => Promise<void>;
  onFermer: () => void;
}

const MAX_COMMENTAIRE = 1000;

/** Rédaction ou modification d'un avis produit. */
export default function ModalAvis({ nomProduit, photo, avisExistant, onEnregistrer, onSupprimer, onFermer }: Props) {
  const [saisie, setSaisie] = useState<SaisieAvis>({
    note:        avisExistant?.note ?? 0,
    titre:       avisExistant?.titre ?? '',
    commentaire: avisExistant?.commentaire ?? '',
  });
  const [envoi, setEnvoi]   = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [confirmerSuppression, setConfirmerSuppression] = useState(false);

  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => { if (e.key === 'Escape' && !envoi) onFermer(); };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [envoi, onFermer]);

  const executer = async (action: () => Promise<void>) => {
    setEnvoi(true);
    setErreur(null);
    try {
      await action();
      onFermer();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Une erreur est survenue.');
      setEnvoi(false);
    }
  };

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saisie.note) { setErreur('Choisissez une note de 1 à 5 étoiles.'); return; }
    executer(() => onEnregistrer({ ...saisie, titre: saisie.titre.trim(), commentaire: saisie.commentaire.trim() }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="titre-modal-avis">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !envoi && onFermer()} />

      <form onSubmit={soumettre} className="relative w-full sm:max-w-lg max-h-[92vh] flex flex-col bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl">
        <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          {photo && <img src={photo} alt="" className="w-11 h-11 rounded-lg object-cover border border-gray-100" />}
          <div className="flex-1 min-w-0">
            <h2 id="titre-modal-avis" className="text-base font-bold text-[#011023]">{avisExistant ? 'Modifier mon avis' : 'Donner mon avis'}</h2>
            <p className="text-xs text-gray-500 truncate">{nomProduit}</p>
          </div>
          <button type="button" onClick={onFermer} disabled={envoi} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Fermer">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Votre note *</p>
            <SaisieNote valeur={saisie.note} onChange={(note) => setSaisie((s) => ({ ...s, note }))} />
          </div>

          <div>
            <label htmlFor="avis-titre" className="text-sm font-semibold text-gray-700 mb-1.5 block">Titre</label>
            <input
              id="avis-titre"
              value={saisie.titre}
              onChange={(e) => setSaisie((s) => ({ ...s, titre: e.target.value }))}
              maxLength={100}
              placeholder="Résumez votre expérience en quelques mots"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FC7701] focus:ring-2 focus:ring-[#FC7701]/15"
            />
          </div>

          <div>
            <label htmlFor="avis-commentaire" className="text-sm font-semibold text-gray-700 mb-1.5 block">Votre avis</label>
            <textarea
              id="avis-commentaire"
              value={saisie.commentaire}
              onChange={(e) => setSaisie((s) => ({ ...s, commentaire: e.target.value }))}
              maxLength={MAX_COMMENTAIRE}
              rows={5}
              placeholder="Qualité, conformité à la description, emballage… Votre retour aide les autres acheteurs."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FC7701] focus:ring-2 focus:ring-[#FC7701]/15 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{saisie.commentaire.length}/{MAX_COMMENTAIRE}</p>
          </div>

          <p className="text-xs text-gray-400">Votre avis sera publié avec votre prénom et l'initiale de votre nom.</p>
          {erreur && <p className="text-sm text-red-600" role="alert">{erreur}</p>}
        </div>

        <footer className="flex items-center gap-2 px-6 py-4 border-t border-gray-100">
          {avisExistant && onSupprimer && (
            confirmerSuppression ? (
              <button type="button" onClick={() => executer(onSupprimer)} disabled={envoi} className="mr-auto text-xs font-semibold text-red-600 hover:underline">
                Confirmer la suppression
              </button>
            ) : (
              <button type="button" onClick={() => setConfirmerSuppression(true)} disabled={envoi} className="mr-auto p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label="Supprimer mon avis">
                <Trash2 size={16} />
              </button>
            )
          )}
          <button type="button" onClick={onFermer} disabled={envoi} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50">
            Annuler
          </button>
          <button type="submit" disabled={envoi} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FC7701] hover:bg-[#e06900] disabled:opacity-70 inline-flex items-center gap-2">
            {envoi && <Loader2 size={16} className="animate-spin" />}
            {avisExistant ? 'Mettre à jour' : 'Publier'}
          </button>
        </footer>
      </form>
    </div>
  );
}
