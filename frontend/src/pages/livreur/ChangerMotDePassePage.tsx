import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { changerMotDePasseInitial } from '../../services/admin/livreurService';
import { sauvegarderSession } from '../../services/auth/authService';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import logo from '../../assets/logo.jpg';

/* ── Validation mot de passe fort ─────────────────────────────────────────── */
const REGEX_MDP_FORT = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

interface Formulaire {
  motDePasseTemp: string;
  nouveauMotDePasse: string;
  confirmationMotDePasse: string;
}

interface Erreurs {
  motDePasseTemp?: string;
  nouveauMotDePasse?: string;
  confirmationMotDePasse?: string;
  global?: string;
}

/* ── Indicateur de force du mot de passe ─────────────────────────────────── */

interface RegleForce {
  label: string;
  valide: (mdp: string) => boolean;
}

const REGLES_FORCE: RegleForce[] = [
  { label: '8 caractères minimum',      valide: (m) => m.length >= 8                 },
  { label: 'Une lettre majuscule',       valide: (m) => /[A-Z]/.test(m)              },
  { label: 'Une lettre minuscule',       valide: (m) => /[a-z]/.test(m)              },
  { label: 'Un chiffre',                 valide: (m) => /\d/.test(m)                 },
  { label: 'Un caractère spécial',       valide: (m) => /[^A-Za-z0-9]/.test(m)      },
];

function IndicateurForce({ motDePasse }: { motDePasse: string }) {
  if (!motDePasse) return null;
  const score = REGLES_FORCE.filter((r) => r.valide(motDePasse)).length;

  const couleur =
    score <= 2 ? 'bg-red-500'    :
    score <= 3 ? 'bg-orange-400' :
    score <= 4 ? 'bg-yellow-400' :
                 'bg-green-500';

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full transition-all ${n <= score ? couleur : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <ul className="space-y-1">
        {REGLES_FORCE.map((regle) => (
          <li key={regle.label} className="flex items-center gap-1.5 text-xs">
            <CheckCircle2
              size={12}
              className={regle.valide(motDePasse) ? 'text-green-600' : 'text-gray-300'}
              aria-hidden="true"
            />
            <span className={regle.valide(motDePasse) ? 'text-green-700' : 'text-[#74777d]'}>
              {regle.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Composant champ mot de passe ─────────────────────────────────────────── */

function champClass(aErreur: boolean): string {
  return [
    'w-full px-4 py-3 bg-white border rounded-lg pr-12',
    'text-sm text-primary placeholder:text-gray-400',
    'transition-all outline-none focus:ring-2',
    aErreur
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-[#c4c6cd] focus:border-accent focus:ring-accent/20',
  ].join(' ');
}

function ChampMotDePasse({
  id,
  label,
  name,
  value,
  erreur,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  name: string;
  value: string;
  erreur?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider"
      >
        <Lock size={12} aria-hidden="true" />
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder ?? '••••••••'}
          value={value}
          onChange={onChange}
          aria-invalid={!!erreur}
          aria-describedby={erreur ? `${id}-error` : undefined}
          className={champClass(!!erreur)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Masquer' : 'Afficher'}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#74777d] hover:text-primary transition-colors"
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {erreur && (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} aria-hidden="true" /> {erreur}
        </p>
      )}
    </div>
  );
}

/* ── Page principale ──────────────────────────────────────────────────────── */

/**
 * Page de changement du mot de passe initial lors de la première connexion livreur.
 * Requiert le token d'activation dans l'URL.
 *
 * URL : /livreur/activation/:token/changer-mot-de-passe
 */
export default function ChangerMotDePassePage() {
  const { token } = useParams<{ token: string }>();
  const navigate  = useNavigate();

  const [form, setForm]       = useState<Formulaire>({
    motDePasseTemp:        '',
    nouveauMotDePasse:     '',
    confirmationMotDePasse:'',
  });
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces]   = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErreurs((prev) => ({ ...prev, [name]: undefined, global: undefined }));
  };

  const valider = (): boolean => {
    const errs: Erreurs = {};

    if (!form.motDePasseTemp.trim())
      errs.motDePasseTemp = 'Le mot de passe temporaire est obligatoire.';

    if (!form.nouveauMotDePasse)
      errs.nouveauMotDePasse = 'Le nouveau mot de passe est obligatoire.';
    else if (!REGEX_MDP_FORT.test(form.nouveauMotDePasse))
      errs.nouveauMotDePasse = 'Le mot de passe ne respecte pas les critères de sécurité.';

    if (!form.confirmationMotDePasse)
      errs.confirmationMotDePasse = 'Confirmez votre nouveau mot de passe.';
    else if (form.nouveauMotDePasse !== form.confirmationMotDePasse)
      errs.confirmationMotDePasse = 'Les mots de passe ne correspondent pas.';

    setErreurs(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSoumettre = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !valider()) return;

    setChargement(true);
    try {
      const rep = await changerMotDePasseInitial(
        token,
        form.motDePasseTemp,
        form.nouveauMotDePasse,
        form.confirmationMotDePasse
      );

      /* Sauvegarde la session pour la garde de route livreur.
         On normalise phone à '' si absent (les comptes livreur
         sont créés sans téléphone, il sera renseigné à l'étape 2). */
      if (rep.data?.user) {
        sauvegarderSession({ phone: '', ...rep.data.user });
      }

      setSucces(true);

      /* Redirection vers la complétion du profil après 1.5 s */
      setTimeout(() => navigate('/livreur/completer-profil'), 1500);

    } catch (err) {
      setErreurs({ global: err instanceof Error ? err.message : 'Erreur serveur. Réessayez.' });
    } finally {
      setChargement(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eef1f8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="bg-primary rounded-t-2xl px-8 py-6 text-center">
          <img src={logo} alt="ZANDOO" className="h-10 w-10 mx-auto mb-3 rounded-xl object-contain" />
          <h1 className="text-accent font-extrabold text-xl tracking-tight">ZANDOO</h1>
          <p className="text-white/60 text-xs mt-1">Première connexion — Étape 1 / 2</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-b-2xl shadow-2xl px-8 py-7">

          {succes ? (
            /* ── Message succès ───────────────────────────── */
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle2 size={32} className="text-green-600" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary mb-1">Mot de passe changé !</h2>
                <p className="text-sm text-[#74777d]">
                  Vous êtes connecté. Redirection vers votre profil…
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-base font-bold text-primary">Changer votre mot de passe</h2>
                <p className="text-xs text-[#74777d] mt-1">
                  Saisissez votre mot de passe temporaire reçu par email, puis définissez un nouveau mot de passe sécurisé.
                </p>
              </div>

              {erreurs.global && (
                <div className="mb-4">
                  <Alert variant="error">{erreurs.global}</Alert>
                </div>
              )}

              <form onSubmit={handleSoumettre} noValidate className="space-y-4">

                <ChampMotDePasse
                  id="motDePasseTemp"
                  name="motDePasseTemp"
                  label="Mot de passe temporaire"
                  value={form.motDePasseTemp}
                  erreur={erreurs.motDePasseTemp}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="Reçu par email"
                />

                <div>
                  <ChampMotDePasse
                    id="nouveauMotDePasse"
                    name="nouveauMotDePasse"
                    label="Nouveau mot de passe"
                    value={form.nouveauMotDePasse}
                    erreur={erreurs.nouveauMotDePasse}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <IndicateurForce motDePasse={form.nouveauMotDePasse} />
                </div>

                <ChampMotDePasse
                  id="confirmationMotDePasse"
                  name="confirmationMotDePasse"
                  label="Confirmer le nouveau mot de passe"
                  value={form.confirmationMotDePasse}
                  erreur={erreurs.confirmationMotDePasse}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <div className="pt-1">
                  <Button
                    type="submit"
                    isLoading={chargement}
                    loadingText="Changement en cours…"
                  >
                    <span className="flex items-center gap-2">
                      Confirmer le changement
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
