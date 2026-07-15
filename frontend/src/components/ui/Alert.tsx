import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AlertProps {
  variant: 'success' | 'error' | 'info';
  children: React.ReactNode;
}

const STYLES: Record<AlertProps['variant'], string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-red-50   border-red-200   text-red-700',
  info:    'bg-[#eff4ff] border-[#dce9ff] text-[#011023]',
};

const ICONS: Record<AlertProps['variant'], LucideIcon> = {
  success: CheckCircle2,
  error:   AlertTriangle,
  info:    Info,
};

export default function Alert({ variant, children }: AlertProps) {
  const Icon = ICONS[variant];
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3.5 rounded-lg border text-sm ${STYLES[variant]}`}
    >
      <Icon size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
      <div className="leading-snug">{children}</div>
    </div>
  );
}
