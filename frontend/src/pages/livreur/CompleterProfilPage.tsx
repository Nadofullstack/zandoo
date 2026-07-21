import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Phone, MapPin, CheckCircle2,
  AlertCircle, ArrowRight, Car,
} from 'lucide-react';
import { completerProfilLivreur } from '../../services/admin/livreurService';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import logo from '../../assets/logo.jpg';

/* ── Types ────────────────────────────────────────────────────────────────── */

type TypeVehicule = 'moto' | 'velo' | 'voiture' | 'camionnette' | 'autre';

interface Formulaire {
  telephone: string;
  typeVehicule: TypeVehicule | '';
  numeroplaque: string;
  villeService: string;
  zonelivraison: string;
}

interface Erreurs {
  telephone?: string;
  typeVehicule?: string;
  numeroplaque?: string;
  villeService?: string;
  zonelivraison?: string;
  global?: string;
}

/* ── Constantes ───────────────────────────────────────────────────────────── */

const FORMULAIRE_INITIAL: Formulaire = {
  telephone:    '',
  typeVehicule: '',
  numeroplaque: '',
  villeService: '',
  zonelivraison:'',
};

const OPTIONS_VEHICULE: { valeur: TypeVehicule; libelle: string; emoji: string }[] = [
  { valeur: 'moto',        libelle: 'Moto',         emoji: '🏍️'  },
  { valeur: 'velo',        libelle: 'Vélo',         emoji: '🚲'  },
  { valeur: 'voiture',     libelle: 'Voiture',      emoji: '🚗'  },
  { valeur: 'camionnette', libelle: 'Camionnette',  emoji: '🚐'  },
  { valeur: 'autre',       libelle: 'Autre',        emoji: '🚚'  },
];

/* ── Helpers UI ───────────────────────────────────────────────────────────── */

function champClass(aErreur: boolean): string {
  return [
    'w-full px-4 py-3 bg-white border rounded-lg',
    'text-sm text-primary placeholder:text-gray-400',
    'transition-all outline-none focus:ring-2',
    aErreur
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-[#c4c6cd] focus:border-accent focus:ring-accent/20',
  ].join(' ');
}

function LabelChamp({
  htmlFor,
  icone: Icone,
  children,
  optionnel,
}: {
  htmlFor: string;
  icone: typeof Truck;
  children: React.ReactNode;
  optionnel?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider"
    >
      <Icone size={12} aria-hidden="true" />
      {children}
      {optionnel && <span className="text-[#74777d] normal-case font-normal ml-1">(optionnel)</span>}
    </label>
  );
}

/* ── Composant principal ──────────────────────────────────────────────────── */

/**
 * Page de complétion du profil livreur — Étape 2 / 2.
 * Accessible uniquement après le changement du mot de passe initial.
 * Requiert un JWT valide (cookie httpOnly) avec rôle 'livreur'.
 *
 * URL : /livreur/completer-profil
 */
export default function CompleterProfilPage() {
  const navigate = useNavigate();

  const [form, setForm]                 = useState<Formulaire>(FORMULAIRE_INITIAL);
  const [erreurs, setErreurs]           = useState<Erreurs>({});
  const [chargement, setChargement]     = useState(false);
  const [succes, setSucces]             = useState(false);

  /* ── Handlers ───────────────────────────────────────────────── */

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErreurs((prev) => ({ ...prev, [name]: undefined, global: undefined }));
  };

  const handleVehiculeSelect = (valeur: TypeVehicule) => {
    setForm((prev) => ({ ...prev, typeVehicule: valeur }));
    setErreurs((prev) => ({ ...prev, typeVehicule: undefined }));
  };

  /* ── Validation côté client ─────────────────────────────────── */

  const valider = (): boolean => {
    const errs: Erreurs = {};

    if (!form.telephone.trim())
      errs.telephone = 'Le numéro de téléphone est obligatoire.';
    else if (!/^\+?[\d\s\-()]{8,20}$/.test(form.telephone.trim()))
      errs.telephone = 'Numéro de téléphone invalide.';

    if (!form.typeVehicule)
      errs.typeVehicule = 'Veuillez sélectionner un type de véhicule.';

    if (!form.villeService.trim())
      errs.villeService = 'La ville de service est obligatoire.';

    if (!form.zonelivraison.trim())
      errs.zonelivraison = 'La zone de livraison est obligatoire.';

    setErreurs(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Soumission ─────────────────────────────────────────────── */

  const handleSoumettre = async (e: FormEvent) => {
    e.preventDefault();
    if (!valider()) return;

    setChargement(true);
    try {
      await completerProfilLivreur({
        telephone:    form.telephone.trim(),
        typeVehicule: form.typeVehicule as TypeVehicule,
        numeroplaque: form.numeroplaque.trim().toUpperCase(),
        villeService: form.villeService.trim(),
        zonelivraison: form.zonelivraison.trim(),
      });

      setSucces(true);
      setTimeout(() => navigate('/livreur/tableau-de-bord'), 2000);
    } catch (err) {
      setErreurs({
        global: err instanceof Error ? err.message : 'Erreur serveur. Veuillez réessayer.',
      });
    } finally {
      setChargement(false);
    }
  };

  /* ── Rendu ──────────────────────────────────────────────────── */

  return (
    <main className="min-h-screen bg-[#eef1f8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="bg-primary rounded-t-2xl px-8 py-6 text-center">
          <img src={logo} alt="ZANDOO" className="h-10 w-10 mx-auto mb-3 rounded-xl object-contain" />
          <h1 className="text-accent font-extrabold text-xl tracking-tight">ZANDOO</h1>
          <p className="text-white/60 text-xs mt-1">Première connexion — Étape 2 / 2</p>
        </div>

        {/* ── Corps ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-b-2xl shadow-2xl px-8 py-7">

          {succes ? (
            /* ── Succès ─────────────────────────────────────── */
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle2 size={36} className="text-green-600" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary mb-1">Profil complété !</h2>
                <p className="text-sm text-[#74777d]">
                  Bienvenue sur ZANDOO. Redirection vers votre tableau de bord…
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ── Titre ─────────────────────────────────────── */}
              <div className="mb-6">
                <h2 className="text-base font-bold text-primary">Compléter votre profil</h2>
                <p className="text-xs text-[#74777d] mt-1">
                  Ces informations sont obligatoires pour activer pleinement votre compte livreur.
                </p>
              </div>

              {/* ── Alerte globale ────────────────────────────── */}
              {erreurs.global && (
                <div className="mb-5">
                  <Alert variant="error">{erreurs.global}</Alert>
                </div>
              )}

              <form onSubmit={handleSoumettre} noValidate className="space-y-5">

                {/* ── Téléphone ─────────────────────────────── */}
                <div className="flex flex-col gap-1.5">
                  <LabelChamp htmlFor="telephone" icone={Phone}>
                    Numéro de téléphone *
                  </LabelChamp>
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+229 97 00 00 00"
                    value={form.telephone}
                    onChange={handleChange}
                    aria-invalid={!!erreurs.telephone}
                    aria-describedby={erreurs.telephone ? 'telephone-error' : undefined}
                    className={champClass(!!erreurs.telephone)}
                  />
                  {erreurs.telephone && (
                    <p id="telephone-error" role="alert" className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={12} aria-hidden="true" /> {erreurs.telephone}
                    </p>
                  )}
                </div>

                {/* ── Type de véhicule ──────────────────────── */}
                <div className="flex flex-col gap-2">
                  <LabelChamp htmlFor="typeVehicule" icone={Car}>
                    Type de véhicule *
                  </LabelChamp>
                  <div
                    role="radiogroup"
                    aria-label="Type de véhicule"
                    className="grid grid-cols-3 gap-2 sm:grid-cols-5"
                  >
                    {OPTIONS_VEHICULE.map(({ valeur, libelle, emoji }) => {
                      const selectionne = form.typeVehicule === valeur;
                      return (
                        <button
                          key={valeur}
                          type="button"
                          role="radio"
                          aria-checked={selectionne}
                          onClick={() => handleVehiculeSelect(valeur)}
                          className={[
                            'flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-semibold transition-all',
                            selectionne
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-gray-200 text-[#74777d] hover:border-accent/40 hover:bg-gray-50',
                          ].join(' ')}
                        >
                          <span className="text-xl" aria-hidden="true">{emoji}</span>
                          {libelle}
                        </button>
                      );
                    })}
                  </div>
                  {erreurs.typeVehicule && (
                    <p id="typeVehicule-error" role="alert" className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={12} aria-hidden="true" /> {erreurs.typeVehicule}
                    </p>
                  )}
                </div>

                {/* ── Numéro de plaque ──────────────────────── */}
                <div className="flex flex-col gap-1.5">
                  <LabelChamp htmlFor="numeroplaque" icone={Truck} optionnel>
                    Numéro de plaque
                  </LabelChamp>
                  <input
                    id="numeroplaque"
                    name="numeroplaque"
                    type="text"
                    placeholder="AB 1234 BJ"
                    value={form.numeroplaque}
                    onChange={handleChange}
                    className={`${champClass(false)} uppercase tracking-widest font-mono`}
                  />
                </div>

                {/* ── Ville de service ──────────────────────── */}
                <div className="flex flex-col gap-1.5">
                  <LabelChamp htmlFor="villeService" icone={MapPin}>
                    Ville de service *
                  </LabelChamp>
                  <input
                    id="villeService"
                    name="villeService"
                    type="text"
                    placeholder="Cotonou"
                    value={form.villeService}
                    onChange={handleChange}
                    aria-invalid={!!erreurs.villeService}
                    aria-describedby={erreurs.villeService ? 'villeService-error' : undefined}
                    className={champClass(!!erreurs.villeService)}
                  />
                  {erreurs.villeService && (
                    <p id="villeService-error" role="alert" className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={12} aria-hidden="true" /> {erreurs.villeService}
                    </p>
                  )}
                </div>

                {/* ── Zone de livraison ─────────────────────── */}
                <div className="flex flex-col gap-1.5">
                  <LabelChamp htmlFor="zonelivraison" icone={MapPin}>
                    Zone de livraison *
                  </LabelChamp>
                  <textarea
                    id="zonelivraison"
                    name="zonelivraison"
                    rows={3}
                    placeholder="Ex : Quartiers Akpakpa, Cadjèhoun, Fidjrossè…"
                    value={form.zonelivraison}
                    onChange={handleChange}
                    aria-invalid={!!erreurs.zonelivraison}
                    aria-describedby={erreurs.zonelivraison ? 'zonelivraison-error' : undefined}
                    className={`${champClass(!!erreurs.zonelivraison)} resize-none`}
                  />
                  {erreurs.zonelivraison && (
                    <p id="zonelivraison-error" role="alert" className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={12} aria-hidden="true" /> {erreurs.zonelivraison}
                    </p>
                  )}
                </div>

                {/* ── Bouton soumettre ──────────────────────── */}
                <div className="pt-1">
                  <Button
                    type="submit"
                    isLoading={chargement}
                    loadingText="Enregistrement…"
                  >
                    <span className="flex items-center gap-2">
                      Valider mon profil
                      <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </Button>
                </div>

              </form>
            </>
          )}
        </div>

      </div>
    </main>
  );
}
