import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, type ApiServiceError } from '../../services/auth/authService';

export interface LoginFormState {
  identifier: string;
  password: string;
  remember: boolean;
}

export interface LoginErrors {
  identifier?: string;
  password?: string;
  global?: string;
}

const INITIAL: LoginFormState = { identifier: '', password: '', remember: false };

export function useLoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginFormState>(INITIAL);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, global: undefined }));
  }

  function validate(): LoginErrors {
    const errs: LoginErrors = {};
    if (!form.identifier.trim()) errs.identifier = "L'e-mail ou le téléphone est requis.";
    if (!form.password) errs.password = 'Le mot de passe est requis.';
    return errs;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }

    setIsLoading(true);
    setErrors({});

    try {
      const reponse = await loginUser(form.identifier.trim(), form.password);
      setIsSuccess(true);

      /* Redirection selon le rôle — délai court pour afficher le message succès */
      const role = reponse.data?.user?.role;
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'livreur') {
          navigate('/livreur/tableau-de-bord');
        } else {
          navigate('/');
        }
      }, 1200);
    } catch (err) {
      const apiErr = err as ApiServiceError;
      if (apiErr.errors?.length) {
        const fieldErrors: LoginErrors = {};
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

  return { form, errors, isLoading, isSuccess, handleChange, handleSubmit };
}
