import { useState, type ChangeEvent } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import FormField, { inputClass } from './FormField';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function PasswordInput({
  id,
  name,
  value,
  error,
  onChange,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField id={id} label="Mot de passe" icon={Lock} error={error}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClass(!!error)} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-[#74777d] hover:text-primary transition-colors"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </FormField>
  );
}
