import type { RegisterPayload } from '../types/auth';
import { isValidPhoneNumber } from 'react-phone-number-input';

export interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  tos?: string;
  global?: string;
}

export function validateRegisterForm(
  fields: RegisterPayload & { tos: boolean }
): FormErrors {
  const errors: FormErrors = {};

  if (!fields.fullName.trim() || fields.fullName.trim().length < 2)
    errors.fullName = 'Le nom complet doit contenir au moins 2 caractères.';

  if (!fields.email.trim() || !/^\S+@\S+\.\S+$/.test(fields.email))
    errors.email = 'Adresse e-mail invalide.';

  /* Validation du numéro via react-phone-number-input (format E.164 requis) */
  if (!fields.phone || !isValidPhoneNumber(fields.phone))
    errors.phone = 'Numéro de téléphone invalide pour le pays sélectionné.';

  if (!fields.password) {
    errors.password = 'Le mot de passe est requis.';
  } else if (fields.password.length < 8) {
    errors.password = 'Minimum 8 caractères.';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(fields.password)) {
    errors.password =
      'Doit contenir au moins une majuscule, une minuscule et un chiffre.';
  }

  if (!fields.tos)
    errors.tos = "Vous devez accepter les conditions d'utilisation.";

  return errors;
}

export interface PasswordStrength {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  colorClass: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { level: 0, label: '', colorClass: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map: Record<number, PasswordStrength> = {
    1: { level: 1, label: 'Faible',  colorClass: 'bg-red-500'   },
    2: { level: 2, label: 'Moyen',   colorClass: 'bg-yellow-500' },
    3: { level: 3, label: 'Bon',     colorClass: 'bg-blue-500'  },
    4: { level: 4, label: 'Fort',    colorClass: 'bg-green-500' },
  };

  return map[score] ?? { level: 1, label: 'Faible', colorClass: 'bg-red-500' };
}
