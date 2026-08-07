import { ChevronDown } from 'lucide-react';

interface Props {
  statut: string;
  total?: number;
  onChange: (statut: string) => void;
}

const OPTIONS = [
  { value: '',              label: 'Tous les statuts' },
  { value: 'en_attente',    label: 'En attente'       },
  { value: 'payee',         label: 'Payée'            },
  { value: 'en_preparation',label: 'En préparation'   },
  { value: 'expediee',      label: 'Expédiée'         },
  { value: 'livree',        label: 'Livrée'           },
  { value: 'annulee',       label: 'Annulée'          },
];

export default function FiltreCommandes({ statut, total, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-100">
      <div className="relative">
        <select
          value={statut}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none pl-3 pr-8 py-2.5 border border-[#c4c6cd] rounded-xl text-sm
                     text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      {total !== undefined && (
        <span className="ml-auto text-xs text-[#74777d]">
          {total} commande{total > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
