import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Package,
  Store,
  LogOut,
  Edit2,
  ChevronRight,
} from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import { lireSession, logoutUser } from '../../services/auth/authService';

export default function MonComptePage() {
  const navigate    = useNavigate();
  const utilisateur = lireSession();
  const [chargement, setChargement] = useState(false);

  /* Rediriger si non connecté */
  if (!utilisateur) {
    navigate('/connexion');
    return null;
  }

  const handleDeconnexion = async () => {
    setChargement(true);
    await logoutUser();
    navigate('/connexion');
  };

  const initiales = utilisateur.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <AcheteurLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] to-[#eef0fb] py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* ── Carte profil ──────────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Bandeau */}
            <div className="h-24 bg-gradient-to-r from-[#011023] to-[#0a2540]" />

            {/* Avatar + nom */}
            <div className="px-6 pb-6 -mt-10 flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-[#FC7701] flex items-center justify-center text-white text-2xl font-black shadow-lg ring-4 ring-white">
                {initiales}
              </div>
              <div className="mb-1 flex-1">
                <h1 className="text-xl font-bold text-gray-900">{utilisateur.fullName}</h1>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#FC7701] bg-orange-50 px-2 py-0.5 rounded-full capitalize">
                  <ShieldCheck size={11} />
                  {utilisateur.role}
                </span>
              </div>
              <button
                className="mb-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:border-[#FC7701] hover:text-[#FC7701] transition-all"
                title="Modifier le profil"
              >
                <Edit2 size={14} />
                Modifier
              </button>
            </div>

            {/* Informations personnelles */}
            <div className="px-6 pb-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Informations personnelles
              </h2>
              <div className="space-y-3">
                <InfoLigne
                  icone={<User size={16} className="text-[#FC7701]" />}
                  label="Nom complet"
                  valeur={utilisateur.fullName}
                />
                <InfoLigne
                  icone={<Mail size={16} className="text-[#FC7701]" />}
                  label="Adresse e-mail"
                  valeur={utilisateur.email}
                />
                <InfoLigne
                  icone={<Phone size={16} className="text-[#FC7701]" />}
                  label="Téléphone"
                  valeur={utilisateur.phone}
                />
              </div>
            </div>
          </div>

          {/* ── Actions rapides ───────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <h2 className="px-6 pt-5 pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Mon espace
            </h2>

            <ActionLigne
              icone={<Package size={18} className="text-indigo-500" />}
              titre="Mes commandes"
              description="Suivre et gérer vos achats"
              vers="/mes-commandes"
            />
          </div>

          {/* ── Devenir vendeur ───────────────────────────────────── */}
          <div className="bg-gradient-to-r from-[#FC7701] to-[#e96b00] rounded-3xl p-6 text-white shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Store size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold mb-1">Commencer à vendre sur ZanDoo</h3>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  Rejoignez des milliers de vendeurs et développez votre activité en ligne.
                  Créez votre boutique en quelques minutes.
                </p>
                <Link
                  to="/devenir-vendeur"
                  className="inline-flex items-center gap-2 bg-white text-[#FC7701] font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
                >
                  Créer ma boutique
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* ── Déconnexion ───────────────────────────────────────── */}
          <button
            onClick={handleDeconnexion}
            disabled={chargement}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-red-500 border border-red-100 bg-white hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            <LogOut size={16} />
            {chargement ? 'Déconnexion…' : 'Se déconnecter'}
          </button>
        </div>
      </div>
    </AcheteurLayout>
  );
}

/* ── Composants internes ──────────────────────────────────────────────────── */

function InfoLigne({
  icone,
  label,
  valeur,
}: {
  icone: React.ReactNode;
  label: string;
  valeur: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
      <span className="shrink-0">{icone}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{valeur}</p>
      </div>
    </div>
  );
}

function ActionLigne({
  icone,
  titre,
  description,
  vers,
}: {
  icone: React.ReactNode;
  titre: string;
  description: string;
  vers: string;
}) {
  return (
    <Link
      to={vers}
      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-indigo-50 flex items-center justify-center transition-colors shrink-0">
        {icone}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{titre}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#FC7701] transition-colors" />
    </Link>
  );
}
