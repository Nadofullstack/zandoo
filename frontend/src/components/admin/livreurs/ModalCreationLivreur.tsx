import { useState } from 'react';
import { X, UserPlus, Mail, User, AlertCircle } from 'lucide-react';
import Button from '../../ui/Button';
import Alert from '../../ui/Alert';
import { creerLivreur } from '../../../services/admin/adminLivreurService';
import type { FormulaireCreationLivreur } from '../../../types/admin';

interface Props {
  ouvert: boolean;
  onFermer: () => void;
  onSucces: () => void;
}

interface EtatFormulaire extends FormulaireCreationLivreur {}

const FORMULAIRE_INITIAL: EtatFormulaire = { nom: '', prenom: '', email: '' };

function champClass(aErreur: boolean) {
  return [
    'w-full px-4 py-3 bg-white border rounded-lg',
    'text-sm text-primary placeholder:text-gray-400',
    'transition-all outline-none focus:ring-2',
    aErreur
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-[#c4c6cd] focus:border-accent focus:ring-accent/20',
  ].join(' ');
}

/**
 * Modal de création d'un compte livreur par l'administrateur.
 * Affiche un résumé avec le lien d'activation après succès.
 */
export default function ModalCreationLivreur({ ouvert, onFermer, onSucces }: Props) {
  const [form, setForm]       = useState<EtatFormulaire>(FORMULAIRE_INITIAL);
  const [erreurs, setErreurs] = useState<Partial<EtatFormulaire & { global: string }>>({});
  const [chargement, setChargement] = useState(false);

  if (!ouvert) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErreurs((prev) => ({ ...prev, [name]: undefined, global: undefined }));
  };

  const valider = (): boolean => {
    const nouvellesErreurs: typeof erreurs = {};

    if (!form.prenom.trim())       nouvellesErreurs.prenom = 'Le prénom est obligatoire.';
    if (!form.nom.trim())          nouvellesErreurs.nom    = 'Le nom est obligatoire.';
    if (!form.email.trim())        nouvellesErreurs.email  = 'L\'email est obligatoire.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      nouvellesErreurs.email = 'Adresse e-mail invalide.';

    setErreurs(nouvellesErreurs);
    return Object.keys(nouvellesErreurs).length === 0;
  };

  const handleSoumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valider()) return;

    setChargement(true);
    try {
      await creerLivreur(form);
      onSucces();
      handleFermer();
    } catch (err) {
      setErreurs({ global: err instanceof Error ? err.message : 'Erreur lors de la création.' });
    } finally {
      setChargement(false);
    }
  };

  const handleFermer = () => {
    setForm(FORMULAIRE_INITIAL);
    setErreurs({});
    onFermer();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-creation-livreur-titre"
    >
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-xl">
              <UserPlus size={18} className="text-cyan-700" aria-hidden="true" />
            </div>
            <div>
              <h2 id="modal-creation-livreur-titre" className="text-base font-bold text-primary">
                Créer un compte livreur
              </h2>
              <p className="text-xs text-[#74777d]">Un email d'invitation sera envoyé automatiquement.</p>
            </div>
          </div>
          <button
            onClick={handleFermer}
            aria-label="Fermer"
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {/* ── Formulaire de création ────────────────────────────── */}
          <form onSubmit={handleSoumettre} noValidate className="space-y-4">

              {erreurs.global && (
                <Alert variant="error">{erreurs.global}</Alert>
              )}

              {/* Prénom + Nom */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prenom" className="label-admin">
                    <User size={12} className="inline mr-1" aria-hidden="true" />
                    Prénom *
                  </label>
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Jean"
                    value={form.prenom}
                    onChange={handleChange}
                    aria-invalid={!!erreurs.prenom}
                    aria-describedby={erreurs.prenom ? 'prenom-error' : undefined}
                    className={champClass(!!erreurs.prenom)}
                  />
                  {erreurs.prenom && (
                    <p id="prenom-error" role="alert" className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={12} aria-hidden="true" /> {erreurs.prenom}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nom" className="label-admin">
                    <User size={12} className="inline mr-1" aria-hidden="true" />
                    Nom *
                  </label>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Dupont"
                    value={form.nom}
                    onChange={handleChange}
                    aria-invalid={!!erreurs.nom}
                    aria-describedby={erreurs.nom ? 'nom-error' : undefined}
                    className={champClass(!!erreurs.nom)}
                  />
                  {erreurs.nom && (
                    <p id="nom-error" role="alert" className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={12} aria-hidden="true" /> {erreurs.nom}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email-livreur" className="label-admin">
                  <Mail size={12} className="inline mr-1" aria-hidden="true" />
                  Adresse e-mail *
                </label>
                <input
                  id="email-livreur"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jean.dupont@email.com"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={!!erreurs.email}
                  aria-describedby={erreurs.email ? 'email-livreur-error' : undefined}
                  className={champClass(!!erreurs.email)}
                />
                {erreurs.email && (
                  <p id="email-livreur-error" role="alert" className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle size={12} aria-hidden="true" /> {erreurs.email}
                  </p>
                )}
              </div>

              <p className="text-xs text-[#74777d] bg-blue-50 border border-blue-100 rounded-lg p-3">
                📧 Un email avec les identifiants temporaires et le lien d'activation sera envoyé automatiquement au livreur.
              </p>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={handleFermer}
                  disabled={chargement}
                  className=" cursor-pointer px-4 py-2.5 rounded-xl text-sm font-semibold text-[#74777d] hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <Button
                  type="submit"
                  isLoading={chargement}
                  loadingText="Création…"
                  className="!w-auto px-6 py-2.5 text-sm cursor-pointer"
                >
                  Créer le compte
                </Button>
              </div>

            </form>
        </div>
      </div>
    </div>
  );
}
