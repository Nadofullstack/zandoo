import { AlertCircle } from 'lucide-react';

interface EtatForm {
  prix: string;
  prixPromotionnel: string;
  quantiteDisponible: string;
}
interface EtatErreurs {
  prix?: string;
  prixPromotionnel?: string;
  quantiteDisponible?: string;
}

function champCls(err?: string) {
  return [
    'w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-primary',
    'placeholder:text-gray-400 transition-all outline-none focus:ring-2',
    err ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
        : 'border-[#c4c6cd] focus:border-accent focus:ring-accent/20',
  ].join(' ');
}

function ErrChamp({ msg, id }: { msg?: string; id: string }) {
  if (!msg) return null;
  return (
    <p id={id} role="alert" className="flex items-center gap-1 text-xs text-red-600 mt-1">
      <AlertCircle size={11} aria-hidden /> {msg}
    </p>
  );
}

interface Props {
  form: EtatForm;
  erreurs: EtatErreurs;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function OngletPrix({ form, erreurs, onChange }: Props) {
  const qty = Number(form.quantiteDisponible);

  return (
    <div className="space-y-4">

      {/* Prix normal */}
      <div>
        <label htmlFor="prod-prix" className="label-admin">Prix (FCFA) *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">₣</span>
          <input id="prod-prix" name="prix" type="number" min="0" step="0.01"
            value={form.prix} onChange={onChange} placeholder="0"
            aria-invalid={!!erreurs.prix} aria-describedby="prod-prix-err"
            className={champCls(erreurs.prix) + ' pl-7'} />
        </div>
        <ErrChamp msg={erreurs.prix} id="prod-prix-err" />
      </div>

      {/* Prix promotionnel */}
      <div>
        <label htmlFor="prod-promo" className="label-admin">Prix promotionnel (optionnel)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">₣</span>
          <input id="prod-promo" name="prixPromotionnel" type="number" min="0" step="0.01"
            value={form.prixPromotionnel} onChange={onChange} placeholder="0"
            aria-invalid={!!erreurs.prixPromotionnel} aria-describedby="prod-promo-err"
            className={champCls(erreurs.prixPromotionnel) + ' pl-7'} />
        </div>
        <ErrChamp msg={erreurs.prixPromotionnel} id="prod-promo-err" />
        <p className="text-xs text-gray-400 mt-1">Doit être strictement inférieur au prix normal.</p>
      </div>

      {/* Quantité */}
      <div>
        <label htmlFor="prod-qty" className="label-admin">Quantité disponible *</label>
        <input id="prod-qty" name="quantiteDisponible" type="number" min="0" step="1"
          value={form.quantiteDisponible} onChange={onChange} placeholder="0"
          aria-invalid={!!erreurs.quantiteDisponible} aria-describedby="prod-qty-err"
          className={champCls(erreurs.quantiteDisponible)} />
        <ErrChamp msg={erreurs.quantiteDisponible} id="prod-qty-err" />
      </div>

      {/* Indicateur stock dynamique */}
      {form.quantiteDisponible !== '' && (
        <div className={[
          'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold',
          qty === 0 ? 'bg-red-50 text-red-700 border border-red-200'
            : qty <= 5 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            : 'bg-green-50 text-green-700 border border-green-200',
        ].join(' ')}>
          <div className={[
            'w-2 h-2 rounded-full flex-shrink-0',
            qty === 0 ? 'bg-red-500' : qty <= 5 ? 'bg-yellow-500' : 'bg-green-500',
          ].join(' ')} />
          {qty === 0
            ? 'Rupture de stock'
            : qty <= 5
              ? `Stock faible — ${form.quantiteDisponible} restant(s)`
              : `En stock — ${form.quantiteDisponible} unité(s)`}
        </div>
      )}
    </div>
  );
}
