interface Props {
  actif: boolean;
  onChange: (actif: boolean) => void;
  libelle: string;
  description?: string;
}

/** Interrupteur on/off accessible (role="switch"). */
export default function Interrupteur({ actif, onChange, libelle, description }: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-primary">{libelle}</p>
        {description && <p className="text-xs text-[#74777d] mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={actif}
        aria-label={libelle}
        onClick={() => onChange(!actif)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${actif ? 'bg-accent' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${actif ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}
