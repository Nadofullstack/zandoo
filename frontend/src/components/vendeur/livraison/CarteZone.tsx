import { Trash2 } from 'lucide-react';
import SaisieVilles from './SaisieVilles';
import type { ZoneForm } from './formulaireLivraison';

interface Props {
  zone: ZoneForm;
  index: number;
  onChange: (zone: ZoneForm) => void;
  onSupprimer: () => void;
}

const CHAMP = 'w-full px-3 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20';

/** Édition d'une zone tarifaire : nom, villes couvertes, tarif et délai. */
export default function CarteZone({ zone, index, onChange, onSupprimer }: Props) {
  const maj = (champ: keyof ZoneForm) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...zone, [champ]: e.target.value });
  const id = `zone-${zone.cle}`;

  return (
    <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-[#fafbfd]">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
        <input
          value={zone.nom}
          onChange={maj('nom')}
          maxLength={60}
          placeholder="Nom de la zone (ex : Grand Cotonou)"
          aria-label={`Nom de la zone ${index + 1}`}
          className={`${CHAMP} font-semibold`}
        />
        <button type="button" onClick={onSupprimer} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label={`Supprimer la zone ${index + 1}`}>
          <Trash2 size={16} />
        </button>
      </div>

      <div>
        <label htmlFor={`${id}-villes`} className="label-admin">Villes couvertes</label>
        <SaisieVilles id={`${id}-villes`} villes={zone.villes} onChange={(villes) => onChange({ ...zone, villes })} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor={`${id}-tarif`} className="label-admin">Tarif (FCFA)</label>
          <input id={`${id}-tarif`} type="number" min={0} step={100} inputMode="numeric" value={zone.tarif} onChange={maj('tarif')} placeholder="1000" className={CHAMP} />
        </div>
        <div>
          <label htmlFor={`${id}-dmin`} className="label-admin">Délai min (j)</label>
          <input id={`${id}-dmin`} type="number" min={0} max={60} inputMode="numeric" value={zone.delaiMin} onChange={maj('delaiMin')} className={CHAMP} />
        </div>
        <div>
          <label htmlFor={`${id}-dmax`} className="label-admin">Délai max (j)</label>
          <input id={`${id}-dmax`} type="number" min={0} max={60} inputMode="numeric" value={zone.delaiMax} onChange={maj('delaiMax')} className={CHAMP} />
        </div>
      </div>
    </div>
  );
}
