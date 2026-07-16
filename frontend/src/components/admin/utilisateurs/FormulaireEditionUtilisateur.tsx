import { useState, type FormEvent } from 'react';
import { User, Mail, Phone, Shield, BadgeCheck } from 'lucide-react';
import type { UtilisateurAdmin, FormulaireUtilisateur, RoleUtilisateur } from '../../../types/admin';
import Button from '../../ui/Button';
import { inputClass } from '../../ui/FormField';

interface Props {
  utilisateur: UtilisateurAdmin;
  chargement?: boolean;
  onSoumettre: (donnees: Partial<FormulaireUtilisateur>) => void;
  onAnnuler: () => void;
}

const ROLES: { valeur: RoleUtilisateur; libelle: string }[] = [
  { valeur: 'acheteur', libelle: 'Acheteur' },
  { valeur: 'vendeur',  libelle: 'Vendeur'  },
  { valeur: 'livreur',  libelle: 'Livreur'  },
  { valeur: 'admin',    libelle: 'Admin'     },
];

export default function FormulaireEditionUtilisateur({ utilisateur, chargement = false, onSoumettre, onAnnuler }: Props) {
  const [form, setForm] = useState<FormulaireUtilisateur>({
    fullName:   utilisateur.fullName,
    email:      utilisateur.email,
    phone:      utilisateur.phone ?? '',
    role:       utilisateur.role,
    isVerified: utilisateur.isVerified,
  });

  const changer = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSoumettre(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {/* Nom complet */}
      <div>
        <label className="label-admin flex items-center gap-1.5">
          <User size={12} /> Nom complet
        </label>
        <input name="fullName" value={form.fullName} onChange={changer} required
          maxLength={100} className={inputClass(false)} />
      </div>

      {/* Email */}
      <div>
        <label className="label-admin flex items-center gap-1.5">
          <Mail size={12} /> Adresse e-mail
        </label>
        <input name="email" type="email" value={form.email} onChange={changer} required
          className={inputClass(false)} />
      </div>

      {/* Téléphone */}
      <div>
        <label className="label-admin flex items-center gap-1.5">
          <Phone size={12} /> Téléphone
        </label>
        <input name="phone" type="tel" value={form.phone} onChange={changer}
          placeholder="+229 00 00 00 00" className={inputClass(false)} />
      </div>

      {/* Rôle */}
      <div>
        <label className="label-admin flex items-center gap-1.5">
          <Shield size={12} /> Rôle
        </label>
        <select name="role" value={form.role} onChange={changer} className={inputClass(false)}>
          {ROLES.map((r) => (
            <option key={r.valeur} value={r.valeur}>{r.libelle}</option>
          ))}
        </select>
        {form.role === 'admin' && (
          <p className="mt-1 text-xs text-orange-600">
            ⚠ Attribuer le rôle Admin donne un accès complet au panneau d'administration.
          </p>
        )}
      </div>

      {/* Vérifié */}
      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <input type="checkbox" name="isVerified" checked={form.isVerified} onChange={changer}
          className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent" />
        <span className="flex items-center gap-1.5 text-sm text-primary font-medium">
          <BadgeCheck size={15} className="text-green-600" />
          Compte vérifié
        </span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onAnnuler}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#74777d] hover:bg-gray-100 transition-colors">
          Annuler
        </button>
        <Button type="submit" isLoading={chargement} loadingText="Enregistrement…" className="!w-auto px-6">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
