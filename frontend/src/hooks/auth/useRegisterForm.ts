import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { registerUser, type ApiServiceError } from '../../services/auth/authService';
import {
  validateRegisterForm,
  type FormErrors,
} from '../../utils/validation';

export interface RegisterFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  tos: boolean;
}

const INITIAL_STATE: RegisterFormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  tos: false,
};

/**
 * Gère l'état et la logique du formulaire d'inscription.
 * Les composants restent purement présentationnels.
 */
export function useRegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  /** Gère les champs texte / checkbox classiques */
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    /* Efface l'erreur du champ modifié */
    setErrors((prev) => ({ ...prev, [name]: undefined, global: undefined }));
  }

  /**
   * Gère le champ téléphone via react-phone-number-input.
   * La valeur est un numéro au format E.164 (ex : +2250700000000) ou une chaîne vide.
   */
  function handlePhoneChange(value: string) {
    setForm((prev) => ({ ...prev, phone: value }));
    setErrors((prev) => ({ ...prev, phone: undefined, global: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const clientErrors = validateRegisterForm(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await registerUser({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      setIsSuccess(true);
      setTimeout(() => navigate('/connexion'), 2000);
    } catch (err) {
      const apiErr = err as ApiServiceError;

      if (apiErr.errors?.length) {
        const fieldErrors: FormErrors = {};
        for (const fe of apiErr.errors) {
          (fieldErrors as Record<string, string>)[fe.field] = fe.message;
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ global: apiErr.message });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return {
    form,
    errors,
    isLoading,
    isSuccess,
    handleChange,
    handlePhoneChange,
    handleSubmit,
  };
}
