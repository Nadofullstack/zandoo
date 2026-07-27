import { X, Mail, Phone, Calendar, ShieldCheck, ShieldOff, UserCheck, UserX } from 'lucide-react';
import type { UtilisateurAdmin } from '../../../types/admin';
import BadgeRole from './BadgeRole';

interface Props {
  utilisateur: UtilisateurAdmin | null;
  onFermer: () => void;
}

function AvatarGrand({ utilisateur }: { utilisateur: UtilisateurAdmin }) {
  if (utilisateur.avatar) {
    return (
      <img
        src={utilisateur.avatar}
        alt={utilisateur.fullName}
        className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shrink-0"
      />
    );
  }
  const initiales = utilisateur.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
      <span className="text-2xl font-extrabold text-primary">{initiales}</span>
    </div>
  );
}

export default function ModalProfilUtilisateur({ utilisateur, onFermer }: Props) {
  if (!utilisateur) return null;

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Profil de ${utilisateur.fullName}`}
      onClick={(e) => { if (e.target === e.currentTarget) onFermer(); }}
    >
      {/* Panneau modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

        {/* ── En-tête ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-primary">Profil utilisateur</h2>
          <button
            onClick={onFermer}
            className="p-1.5 rounded-lg text-[#74777d] hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Corps ── */}
        <div className="px-6 py-5 space-y-5">

          {/* Avatar + nom + badges */}
          <div className="flex items-start gap-4">
            <AvatarGrand utilisateur={utilisateur} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-lg font-extrabold text-primary truncate">
                  {utilisateur.fullName}
                </h3>
                {utilisateur.isVerified ? (
                  <ShieldCheck size={16} className="text-green-600 shrink-0" title="Compte vérifié" />
                ) : (
                  <ShieldOff size={16} className="text-gray-400 shrink-0" title="Non vérifié" />
                )}
              </div>

              <BadgeRole role={utilisateur.role} />

              {/* Statut actif */}
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  utilisateur.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {utilisateur.isActive
                    ? <><UserCheck size={12} /> Compte actif</>
                    : <><UserX size={12} /> Compte suspendu</>
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#74777d] uppercase tracking-wider">Contact</p>
            <div className="flex flex-col gap-1.5 text-sm text-primary">
              <span className="flex items-center gap-2">
                <Mail size={14} className="text-[#74777d] shrink-0" />
                {utilisateur.email}
              </span>
              {utilisateur.phone ? (
                <span className="flex items-center gap-2">
                  <Phone size={14} className="text-[#74777d] shrink-0" />
                  {utilisateur.phone}
                </span>
              ) : (
                <span className="flex items-center gap-2 text-[#74777d]">
                  <Phone size={14} className="shrink-0" />
                  Aucun numéro renseigné
                </span>
              )}
              <span className="flex items-center gap-2">
                <Calendar size={14} className="text-[#74777d] shrink-0" />
                Inscrit le{' '}
                {new Date(utilisateur.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Infos compte */}
          <div>
            <p className="text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-3">
              Informations du compte
            </p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <InfoLigne libelle="ID" valeur={utilisateur._id} mono />
              <InfoLigne libelle="Connexion Google" valeur={utilisateur.googleId ? 'Oui' : 'Non'} />
              <InfoLigne libelle="Vérifié" valeur={utilisateur.isVerified ? 'Oui' : 'Non'} />
              <InfoLigne
                libelle="Dernière mise à jour"
                valeur={new Date(utilisateur.updatedAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              />
            </dl>
          </div>
        </div>

        {/* ── Pied ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onFermer}
            className="px-5 py-2 rounded-xl bg-gray-100 text-sm font-semibold text-primary hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoLigne({ libelle, valeur, mono = false }: { libelle: string; valeur: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[#74777d] uppercase tracking-wider">{libelle}</dt>
      <dd className={`mt-0.5 font-medium text-primary ${mono ? 'font-mono text-xs break-all' : ''}`}>
        {valeur}
      </dd>
    </div>
  );
}
