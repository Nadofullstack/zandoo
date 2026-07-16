import type { LucideIcon } from 'lucide-react';

interface CarteStatistiqueProps {
  titre: string;
  valeur: number;
  icone: LucideIcon;
  couleur?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
}

const CONFIG_COULEUR: Record<string, { fond: string; icone: string; bordure: string }> = {
  primary: { fond: 'bg-primary/10',    icone: 'text-primary',     bordure: 'border-primary/20'   },
  accent:  { fond: 'bg-accent/10',     icone: 'text-accent',      bordure: 'border-accent/20'    },
  success: { fond: 'bg-green-50',      icone: 'text-green-600',   bordure: 'border-green-200'    },
  warning: { fond: 'bg-yellow-50',     icone: 'text-yellow-600',  bordure: 'border-yellow-200'   },
  danger:  { fond: 'bg-red-50',        icone: 'text-red-600',     bordure: 'border-red-200'      },
};

/**
 * Carte affichant une statistique avec icône colorée.
 */
export default function CarteStatistique({
  titre,
  valeur,
  icone: Icone,
  couleur = 'primary',
}: CarteStatistiqueProps) {
  const { fond, icone, bordure } = CONFIG_COULEUR[couleur];

  return (
    <div className={`bg-surface rounded-xl border ${bordure} p-5 flex items-center gap-4 shadow-sm`}>
      <div className={`p-3 rounded-xl ${fond}`}>
        <Icone size={22} className={icone} aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm text-[#74777d] font-medium">{titre}</p>
        <p className="text-2xl font-extrabold text-primary">{valeur.toLocaleString('fr-FR')}</p>
      </div>
    </div>
  );
}
