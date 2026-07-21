import { Link } from 'react-router-dom';
import { User, Mail } from 'lucide-react';
import { useRegisterForm } from '../../hooks/auth/useRegisterForm';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import FormField, { inputClass } from '../ui/FormField';
import PasswordInput from '../ui/PasswordInput';
import PhoneField from '../ui/PhoneField';
import logo from '../../assets/logo.jpg';

export default function RegisterForm() {
  const { form, errors, isLoading, isSuccess, handleChange, handlePhoneChange, handleSubmit } =
    useRegisterForm();

  return (
    <>
      {/* Logo + Heading */}
      <div className="mb-3 text-center">
        <img
          src={logo}
          alt="ZANDOO"
          className="h-10 w-10 mx-auto mb-2 object-contain rounded-xl shadow-sm"
        />
        <h2 className="text-lg font-extrabold text-primary">Créer un compte</h2>
        <p className="mt-0.5 text-xs text-[#74777d]">
          Rejoignez ZANDOO et commencez à acheter ou vendre.
        </p>
      </div>

      {/* Retour succès / erreur */}
      {isSuccess && (
        <div className="mb-3">
          <Alert variant="success">Compte créé ! Redirection en cours…</Alert>
        </div>
      )}
      {errors.global && (
        <div className="mb-3">
          <Alert variant="error">{errors.global}</Alert>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
        {/* Nom complet — pleine largeur */}
        <FormField id="fullName" label="Nom complet" icon={User} error={errors.fullName}>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jean Dupont"
            value={form.fullName}
            onChange={handleChange}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            className={inputClass(!!errors.fullName)}
          />
        </FormField>

        {/* Téléphone — pleine largeur, même style que les autres champs */}
        <PhoneField
          value={form.phone}
          onChange={handlePhoneChange}
          error={errors.phone}
        />

        {/* Email */}
        <FormField id="email" label="Adresse e-mail" icon={Mail} error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="votre@email.com"
            value={form.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={inputClass(!!errors.email)}
          />
        </FormField>

        {/* Password */}
        <PasswordInput
          id="password"
          name="password"
          value={form.password}
          error={errors.password}
          onChange={handleChange}
        />

        {/* TOS */}
        <div className="flex items-start gap-2.5">
          <input
            id="tos"
            name="tos"
            type="checkbox"
            checked={form.tos}
            onChange={handleChange}
            aria-invalid={!!errors.tos}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer shrink-0"
          />
          <div>
            <label htmlFor="tos" className="text-xs text-[#44474c] leading-relaxed cursor-pointer">
              J'accepte les{' '}
              <a href="#" className="text-accent font-semibold hover:underline">CGU</a>
              {' '}et la{' '}
              <a href="#" className="text-accent font-semibold hover:underline">Politique de confidentialité</a>.
            </label>
            {errors.tos && (
              <p role="alert" className="mt-0.5 text-xs text-red-600">{errors.tos}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button className='cursor-pointer'
          type="submit"
          isLoading={isLoading}
          loadingText="Création du compte…"
          disabled={isSuccess}
        >
          Créer mon compte →
        </Button>
      </form>

      {/* Lien connexion */}
      <p className="mt-3 text-center text-sl text-[#74777d]">
        Déjà inscrit ?{' '}
        <Link to="/connexion" className="text-primary font-bold hover:text-accent transition-colors">
          Se connecter
        </Link>
      </p>
    </>
  );
}
