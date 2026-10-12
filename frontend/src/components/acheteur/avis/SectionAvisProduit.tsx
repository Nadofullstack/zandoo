import { useState } from 'react';
import { Loader2, MessageSquareText, PenLine } from 'lucide-react';
import { useAvisProduit } from '../../../hooks/acheteur/useAvisProduit';
import type { TriAvis } from '../../../types/acheteur';
import ResumeNotes from './ResumeNotes';
import CarteAvis from './CarteAvis';
import ModalAvis from './ModalAvis';

interface Props {
  produitId: string;
  nomProduit: string;
  photo?: string | null;
  nomBoutique?: string;
}

const TRIS: { valeur: TriAvis; libelle: string }[] = [
  { valeur: 'recents',    libelle: 'Plus récents' },
  { valeur: 'note_haute', libelle: 'Meilleures notes' },
  { valeur: 'note_basse', libelle: 'Notes les plus basses' },
];

/** Section « Avis clients » de la fiche produit. */
export default function SectionAvisProduit({ produitId, nomProduit, photo, nomBoutique }: Props) {
  const a = useAvisProduit(produitId);
  const [modalOuverte, setModalOuverte] = useState(false);

  const bouton = a.peutEvaluer && (
    <button
      onClick={() => setModalOuverte(true)}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-[#011023] text-[#011023] hover:bg-[#011023] hover:text-white transition-colors"
    >
      <PenLine size={16} /> {a.monAvis ? 'Modifier mon avis' : 'Donner mon avis'}
    </button>
  );

  return (
    <section id="avis" className="mb-16 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[#FC7701] text-xs font-bold uppercase tracking-widest mb-2">Ils l'ont acheté</p>
          <h2 className="text-2xl font-black text-[#011023]">Avis clients</h2>
        </div>
        {bouton}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8">
        {a.chargement && !a.resume ? (
          <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
        ) : !a.resume || a.resume.total === 0 ? (
          <div className="flex flex-col items-center text-center py-8">
            <MessageSquareText size={28} className="text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-[#011023]">Aucun avis pour le moment</p>
            <p className="text-sm text-gray-500 mt-1">
              {a.peutEvaluer ? 'Vous avez reçu ce produit : soyez le premier à donner votre avis !' : 'Les avis sont publiés par les clients ayant reçu ce produit.'}
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[320px_1fr] gap-8">
            <div className="lg:sticky lg:top-24 self-start">
              <ResumeNotes resume={a.resume} noteFiltre={a.note} onFiltrer={a.filtrerParNote} />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <p className="text-sm text-gray-500">
                  {a.note ? <>Avis {a.note} étoile{a.note > 1 ? 's' : ''} · <button onClick={() => a.filtrerParNote(undefined)} className="text-[#FC7701] font-semibold hover:underline">tout afficher</button></> : `${a.resume.total} avis`}
                </p>
                <select
                  value={a.tri}
                  onChange={(e) => a.trier(e.target.value as TriAvis)}
                  aria-label="Trier les avis"
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-[#FC7701]"
                >
                  {TRIS.map((t) => <option key={t.valeur} value={t.valeur}>{t.libelle}</option>)}
                </select>
              </div>

              <div className={`divide-y divide-gray-100 transition-opacity ${a.chargement ? 'opacity-60' : ''}`}>
                {a.avis.map((av) => <CarteAvis key={av._id} avis={av} nomBoutique={nomBoutique} />)}
              </div>

              {a.aPlus && (
                <button
                  onClick={a.voirPlus}
                  disabled={a.chargement}
                  className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center gap-2"
                >
                  {a.chargement && <Loader2 size={14} className="animate-spin" />} Voir plus d'avis
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {modalOuverte && (
        <ModalAvis
          nomProduit={nomProduit}
          photo={photo}
          avisExistant={a.monAvis}
          onEnregistrer={a.enregistrer}
          onSupprimer={a.monAvis ? a.supprimer : undefined}
          onFermer={() => setModalOuverte(false)}
        />
      )}
    </section>
  );
}
