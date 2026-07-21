import type { LucideIcon } from 'lucide-react';

interface CarteStatistiqueProps {
  titre: string;
  valeur: number;
  icone: LucideIcon;
  couleur?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  sousTitre?: string;
}

/* ── Configuration couleur par variante ──────────────────────────────────── */
const CONFIG: Record<
  string,
  {
    bordure:       string; // border fine tout autour
    bordureGauche: string; // border-left épaisse et marquée
    fondIcone:     string;
    icone:         string;
    texteSous:     string;
  }
> = {
  primary: {
    bordure:       'border-[#011023]/60',
    bordureGauche: 'border-l-[#011023]',
    fondIcone:     'bg-[#011023]/10',
    icone:         'text-[#011023]',
    texteSous:     'text-[#011023]/50',
  },
  accent: {
    bordure:       'border-accent/60',
    bordureGauche: 'border-l-accent',
    fondIcone:     'bg-accent/10',
    icone:         'text-accent',
    texteSous:     'text-accent/60',
  },
  success: {
    bordure:       'border-green-500',
    bordureGauche: 'border-l-green-500',
    fondIcone:     'bg-green-50',
    icone:         'text-green-600',
    texteSous:     'text-green-500',
  },
  warning: {
    bordure:       'border-yellow-500',
    bordureGauche: 'border-l-yellow-500',
    fondIcone:     'bg-yellow-50',
    icone:         'text-yellow-600',
    texteSous:     'text-yellow-500',
  },
  danger: {
    bordure:       'border-red-600',
    bordureGauche: 'border-l-red-500',
    fondIcone:     'bg-red-50',
    icone:         'text-red-500',
    texteSous:     'text-red-400',
  },
};

/**
 * Carte KPI — border fine colorée tout autour + border gauche épaisse marquée.
 */
export default function CarteStatistique({
  titre,
  valeur,
  icone: Icone,
  couleur = 'primary',
  sousTitre,
}: CarteStatistiqueProps) {
  const cfg = CONFIG[couleur];

  return (
    <div
      className={[
        'bg-white rounded-xl shadow-sm',
        /* Border fine tout autour */
        `border ${cfg.bordure}`,
        /* Border gauche épaisse de la même couleur */
        `border-l-6 ${cfg.bordureGauche}`,
        'px-5 py-6',
        'flex items-center gap-4',
        'transition-shadow duration-200 hover:shadow-md',
      ].join(' ')}
    >
      {/* Icône */}
      <div className={`shrink-0 p-2.5 rounded-xl ${cfg.fondIcone}`}>
        <Icone size={20} className={cfg.icone} aria-hidden="true" />
      </div>

      {/* Textes */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[#74777d] uppercase tracking-wider truncate">
          {titre}
        </p>
        <p className="text-2xl font-extrabold text-primary leading-tight mt-0.5">
          {valeur.toLocaleString('fr-FR')}
        </p>
        {sousTitre && (
          <p className={`text-xs font-medium mt-0.5 ${cfg.texteSous}`}>
            {sousTitre}
          </p>
        )}
      </div>
    </div>
  );
}
