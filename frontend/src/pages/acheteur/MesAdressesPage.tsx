import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPinPlus, MapPin, RefreshCw } from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import CarteAdresse from '../../components/acheteur/adresses/CarteAdresse';
import ModalAdresse from '../../components/acheteur/adresses/ModalAdresse';
import { useAdresses } from '../../hooks/acheteur/useAdresses';
import { lireSession } from '../../services/auth/authService';
import type { AdresseEnregistree } from '../../types/acheteur';

const MAX_ADRESSES = 10;

/** Page « Mes adresses » : carnet d'adresses de livraison de l'acheteur. */
export default function MesAdressesPage() {
  const session = lireSession();
  const { adresses, chargement, erreur, recharger, ajouter, modifier, definirParDefaut, supprimer } = useAdresses();

  /* undefined = modale fermée ; null = création ; adresse = modification */
  const [edition, setEdition]         = useState<AdresseEnregistree | null | undefined>(undefined);
  const [aSupprimer, setASupprimer]   = useState<string | null>(null);
  const [actionEnCours, setAction]    = useState<string | null>(null);
  const [erreurAction, setErreurAction] = useState<string | null>(null);

  const executer = async (id: string, action: () => Promise<void>) => {
    setAction(id);
    setErreurAction(null);
    try { await action(); } catch (e) { setErreurAction(e instanceof Error ? e.message : 'Action impossible.'); }
    finally { setAction(null); setASupprimer(null); }
  };

  const limiteAtteinte = adresses.length >= MAX_ADRESSES;

  return (
    <AcheteurLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Link to="/mon-compte" className="hover:text-[#FC7701]">Mon compte</Link>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-medium">Mes adresses</span>
        </nav>

        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#011023]">Mes adresses</h1>
            <p className="text-sm text-gray-500 mt-1">Enregistrez vos adresses pour commander plus vite.</p>
          </div>
          {adresses.length > 0 && (
            <button
              onClick={() => setEdition(null)}
              disabled={limiteAtteinte}
              title={limiteAtteinte ? `Maximum ${MAX_ADRESSES} adresses` : undefined}
              className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FC7701] hover:bg-[#e06900] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MapPinPlus size={16} /> Ajouter une adresse
            </button>
          )}
        </header>

        {erreurAction && <p className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700" role="alert">{erreurAction}</p>}

        {erreur ? (
          <div className="flex flex-col items-center text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-600">{erreur}</p>
            <button onClick={recharger} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50">
              <RefreshCw size={14} /> Réessayer
            </button>
          </div>
        ) : chargement ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-44 rounded-2xl bg-white border border-gray-100 animate-pulse" />)}
          </div>
        ) : adresses.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 px-6 bg-white rounded-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4"><MapPin size={22} className="text-[#FC7701]" /></div>
            <h2 className="text-base font-bold text-[#011023]">Aucune adresse enregistrée</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">Ajoutez une adresse pour la retrouver automatiquement lors de vos prochaines commandes.</p>
            <button onClick={() => setEdition(null)} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FC7701] hover:bg-[#e06900]">
              <MapPinPlus size={16} /> Ajouter une adresse
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {adresses.map((a) => (
              <CarteAdresse
                key={a._id}
                adresse={a}
                actions={
                  aSupprimer === a._id ? (
                    <>
                      <span className="text-xs text-gray-600 mr-auto">Supprimer cette adresse ?</span>
                      <button onClick={() => setASupprimer(null)} className={BOUTON}>Non</button>
                      <button onClick={() => executer(a._id, () => supprimer(a._id))} disabled={actionEnCours === a._id} className={`${BOUTON} text-red-600 hover:bg-red-50`}>
                        Oui, supprimer
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEdition(a)} className={BOUTON}>Modifier</button>
                      <button onClick={() => setASupprimer(a._id)} className={`${BOUTON} text-red-600 hover:bg-red-50`}>Supprimer</button>
                      {!a.parDefaut && (
                        <button onClick={() => executer(a._id, () => definirParDefaut(a._id))} disabled={actionEnCours === a._id} className={`${BOUTON} ml-auto text-[#FC7701] hover:bg-orange-50`}>
                          Définir par défaut
                        </button>
                      )}
                    </>
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      {edition !== undefined && (
        <ModalAdresse
          adresse={edition}
          nomParDefaut={session?.fullName}
          telephoneParDefaut={session?.phone}
          onEnregistrer={async (champs, parDefaut) => {
            if (edition) await modifier(edition._id, champs, parDefaut);
            else await ajouter(champs, parDefaut);
          }}
          onFermer={() => setEdition(undefined)}
        />
      )}
    </AcheteurLayout>
  );
}

const BOUTON = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50';
