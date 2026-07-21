import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useLoginForm } from '../../hooks/auth/useLoginForm';
import { googleLoginUser } from '../../services/auth/authService';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import logo from '../../assets/logo.jpg';

/**
 * Classe utilitaire pour les champs de saisie.
 * Applique le style d'erreur si hasError est vrai.
 */
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

/**
 * Formulaire complet de connexion.
 * - Connexion Google via @react-oauth/google (credential id_token vérifié côté backend)
 * - Connexion classique e-mail / téléphone + mot de passe
 * Toute la logique de connexion classique est dans le hook useLoginForm.
 */
export default function LoginForm() {
  const { form, errors, isLoading, isSuccess, handleChange, handleSubmit } = useLoginForm();
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [googleErreur, setGoogleErreur] = useState('');
  const navigate = useNavigate();

  /**
   * Appelé par le composant GoogleLogin après une authentification réussie.
   * Le credential est un id_token JWT signé par Google, envoyé au backend pour vérification.
   */
  async function onGoogleSuccess(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) return;
    setGoogleErreur('');
    try {
      const reponse = await googleLoginUser(credentialResponse.credential);
      /* Redirection selon le rôle */
      const role = reponse.data?.user?.role;
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch {
      setGoogleErreur('La connexion Google a échoué. Veuillez réessayer.');
    }
  }

  /** Appelé si l'utilisateur ferme le popup Google ou qu'une erreur survient */
  function onGoogleEchec() {
    setGoogleErreur('La connexion Google a été annulée ou a échoué.');
  }

  return (
    <>
      {/* Logo — toujours visible en haut du formulaire */}
      <div className="mb-3 flex justify-center">
        <img src={logo} alt="ZANDOO" className="h-10 w-auto object-contain rounded-xl" />
      </div>

      {/* En-tête */}
      <header className="mb-3 text-center">
        <h2 className="text-lg font-bold text-primary mb-0.5">Connexion</h2>
        <p className="text-xs text-[#74777d]">
          Veuillez entrer vos identifiants pour accéder à votre compte.
        </p>
      </header>

      {/* Bannière succès connexion classique */}
      {isSuccess && (
        <div className="mb-3">
          <Alert variant="success">Connexion réussie ! Redirection en cours…</Alert>
        </div>
      )}

      {/* Bannière erreur connexion classique */}
      {errors.global && (
        <div className="mb-3">
          <Alert variant="error">{errors.global}</Alert>
        </div>
      )}

      {/* Bannière erreur connexion Google */}
      {googleErreur && (
        <div className="mb-3">
          <Alert variant="error">{googleErreur}</Alert>
        </div>
      )}

      {/*
        Bouton Google officiel — @react-oauth/google
        Ouvre le popup Google, récupère le credential (id_token)
        et appelle onGoogleSuccess avec le token.
      */}
      <div className="mb-4 flex justify-center">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={onGoogleEchec}
          text="continue_with"
          shape="rectangular"
          logo_alignment="left"
          width="320"
        />
      </div>

      {/* Séparateur visuel */}
      <div className="relative flex items-center mb-4">
        <div className="flex-grow border-t border-[#c4c6cd]" />
        <span className="mx-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider">
          ou avec email
        </span>
        <div className="flex-grow border-t border-[#c4c6cd]" />
      </div>

      {/* Formulaire de connexion classique */}
      <form onSubmit={handleSubmit} noValidate className="space-y-3">

        {/* Champ identifiant (e-mail ou téléphone) */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="identifier"
            className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider"
          >
            <Mail size={13} aria-hidden="true" />
            E-mail ou Téléphone
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            placeholder="exemple@email.com"
            value={form.identifier}
            onChange={handleChange}
            aria-invalid={!!errors.identifier}
            aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            className={champClass(!!errors.identifier)}
          />
          {errors.identifier && (
            <p id="identifier-error" role="alert" className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle size={12} aria-hidden="true" /> {errors.identifier}
            </p>
          )}
        </div>

        {/* Champ mot de passe avec toggle visibilité */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider"
            >
              <Lock size={13} aria-hidden="true" />
              Mot de passe
            </label>
            {/* Lien mot de passe oublié */}
            <a href="#" className="text-xs font-semibold text-accent hover:underline transition-colors">
              Mot de passe oublié ?
            </a>
          </div>

          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={motDePasseVisible ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`${champClass(!!errors.password)} pr-12`}
            />
            {/* Bouton afficher / masquer */}
            <button
              type="button"
              onClick={() => setMotDePasseVisible((v) => !v)}
              aria-label={motDePasseVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#74777d] hover:text-primary transition-colors"
            >
              {motDePasseVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" role="alert" className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle size={12} aria-hidden="true" /> {errors.password}
            </p>
          )}
        </div>

        {/* Case à cocher "Rester connecté" */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            checked={form.remember}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer"
          />
          <label htmlFor="remember" className="text-sm text-[#74777d] select-none cursor-pointer">
            Se Souvenir de moi
          </label>
        </div>

        {/* Bouton de soumission */}
        <div className="pt-1">
          <Button className='cursor-pointer' type="submit" isLoading={isLoading} loadingText="Connexion…" disabled={isSuccess}>
            Se connecter
          </Button>
        </div>
      </form>

      {/* Lien vers la page d'inscription */}
      <footer className="mt-5 text-center">
        <p className="text-sl text-[#74777d]">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="text-primary font-bold hover:text-accent transition-colors">
            S'inscrire
          </Link>
        </p>
      </footer>
    </>
  );
}
