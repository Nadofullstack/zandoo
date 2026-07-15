import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  children: ReactNode;
}

export default function FormField({
  id,
  label,
  icon: Icon,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#011023] uppercase tracking-wider"
      >
        <Icon size={13} aria-hidden="true" />
        {label}
      </label>

      {children}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1 text-xs text-red-600"
        >
          <AlertCircle size={12} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

/**
 * Utility to build consistent input class names.
 */
export function inputClass(hasError: boolean): string {
  return [
    'w-full px-4 py-3 bg-white border rounded-lg',
    'text-sm text-[#011023] placeholder:text-gray-400',
    'transition-all outline-none focus:ring-2',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-[#c4c6cd] focus:border-[#FC7701] focus:ring-[#FC7701]/20',
  ].join(' ');
}
