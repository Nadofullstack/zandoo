import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export default function Button({
  children,
  isLoading = false,
  loadingText = 'Chargement…',
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      className={[
        'w-full flex items-center justify-center gap-2',
        'py-3.5 px-6 rounded-lg font-bold text-base',
        'bg-accent hover:bg-accent/90 text-white',
        'shadow-md hover:shadow-lg active:scale-[0.99]',
        'transition-all disabled:opacity-60 disabled:cursor-not-allowed',
        className,
      ].join(' ')}
    >
      {isLoading ? (
        <>
          <Spinner />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
