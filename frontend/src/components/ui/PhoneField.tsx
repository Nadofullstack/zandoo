import PhoneInput, { type Country } from 'react-phone-number-input';
import { Phone, AlertCircle } from 'lucide-react';
import 'react-phone-number-input/style.css';

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/**
 * Champ de saisie du numéro de téléphone avec sélecteur de pays.
 * Utilise react-phone-number-input pour la validation du format selon le pays.
 * Le pays par défaut est la Côte d'Ivoire (CI).
 */
export default function PhoneField({ value, onChange, error }: PhoneFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label
        htmlFor="phone-input"
        className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider"
      >
        <Phone size={13} aria-hidden="true" />
        Téléphone
      </label>

      {/*
        PhoneInput — affiche un sélecteur de drapeau/pays à gauche
        et un champ de saisie formaté selon le pays sélectionné.
      */}
      <div
        className={[
          'flex items-center bg-white border rounded-lg overflow-hidden',
          'transition-all focus-within:ring-2',
          error
            ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-100'
            : 'border-[#c4c6cd] focus-within:border-accent focus-within:ring-accent/20',
        ].join(' ')}
      >
        <PhoneInput
          id="phone-input"
          international
          defaultCountry={'BJ' as Country}
          value={value}
          onChange={(val) => onChange(val ?? '')}
          aria-invalid={!!error}
          aria-describedby={error ? 'phone-error' : undefined}
          className="phone-input-zandoo w-full"
        />
      </div>

      {/* Message d'erreur */}
      {error && (
        <p
          id="phone-error"
          role="alert"
          className="flex items-center gap-1 text-xs text-red-600"
        >
          <AlertCircle size={12} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}
