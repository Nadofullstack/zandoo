import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  ShieldCheck,
  Package,
  Store,
  LogOut,
  Edit2,
  ChevronRight,
  Settings,
  CreditCard,
  Heart,
  Star,
  Award,
  Clock,
  MapPin,
  ShoppingBag,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import { lireSession, logoutUser, mettreAJourProfil } from '../../services/auth/authService';

export default function MonComptePage() {
  const navigate = useNavigate();
  const [utilisateur, setUtilisateur] = useState(lireSession);
  const [chargement, setChargement] = useState(false);

  /* ── État du modal ────────────────────────────── */
  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '' });
  const [erreurs, setErreurs] = useState<{ fullName?: string; phone?: string }>({});
  const [enregistrement, setEnregistrement] = useState(false);
  const [messageSucces, setMessageSucces] = useState('');

  if (!utilisateur) {
    navigate('/connexion');
    return null;
  }

  const handleDeconnexion = async () => {
    setChargement(true);
    await logoutUser();
    navigate('/connexion');
  };

  const ouvrirModal = () => {
    setForm({ fullName: utilisateur.fullName, phone: utilisateur.phone ?? '' });
    setErreurs({});
    setMessageSucces('');
    setModalOuvert(true);
  };

  const validerForm = () => {
    const nouvellesErreurs: typeof erreurs = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      nouvellesErreurs.fullName = 'Le nom doit contenir au moins 2 caractères.';
    return nouvellesErreurs;
  };

  const handleSauvegarder = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validerForm();
    if (Object.keys(errs).length > 0) { setErreurs(errs); return; }

    setEnregistrement(true);
    setErreurs({});
    try {
      const userMisAJour = await mettreAJourProfil({ fullName: form.fullName.trim(), phone: form.phone.trim() });
      setUtilisateur(userMisAJour);
      setMessageSucces('Profil mis à jour avec succès !');
      setTimeout(() => setModalOuvert(false), 1200);
    } catch {
      setErreurs({ fullName: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setEnregistrement(false);
    }
  };

  const initiales = utilisateur.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <AcheteurLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-white to-[#eef0fb] py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mon compte</h1>
            <p className="text-gray-500 mt-1">Gérez votre profil et vos activités sur ZanDoo</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Colonne gauche - Profil ───────────────── */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-[#011023] to-[#0a2540] relative">
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FC7701] to-[#e96b00] flex items-center justify-center text-white text-2xl font-black shadow-lg ring-4 ring-white">
                      {initiales}
                    </div>
                  </div>
                </div>

                <div className="pt-12 pb-6 px-6 text-center">
                  <h2 className="text-xl font-bold text-gray-900 mt-2">{utilisateur.fullName}</h2>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#FC7701] bg-orange-50 px-3 py-1 rounded-full mt-1 capitalize">
                    <ShieldCheck size={12} />
                    {utilisateur.role}
                  </span>

                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-left">
                    <InfoItem icon={<Mail size={14} className="text-[#FC7701]" />} label="Email" value={utilisateur.email} />
                    <InfoItem icon={<Phone size={14} className="text-[#FC7701]" />} label="Téléphone" value={utilisateur.phone || '—'} />
                  </div>

                  <button
                    onClick={ouvrirModal}
                    className="cursor-pointer w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:border-[#FC7701] hover:text-[#FC7701] hover:bg-orange-50 transition-all"
                  >
                    <Edit2 size={14} />
                    Modifier mon profil
                  </button>
                </div>
              </div>

              {/* Statistiques */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <StatItem icon={<ShoppingBag size={18} className="text-indigo-500" />} value="12" label="Commandes" />
                  <StatItem icon={<Heart size={18} className="text-red-500" />} value="8" label="Favoris" />
                  <StatItem icon={<Star size={18} className="text-yellow-500" />} value="4.8" label="Évaluation" />
                  <StatItem icon={<Award size={18} className="text-green-500" />} value="15" label="Points" />
                </div>
              </div>
            </div>

            {/* ── Colonne droite - Actions ──────────────── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700">Actions rapides</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  <ActionItem icon={<Package size={18} className="text-indigo-500" />} title="Mes commandes" description="Suivez et gérez toutes vos commandes" to="/mes-commandes" color="indigo" />
                  <ActionItem icon={<Clock size={18} className="text-blue-500" />} title="Historique" description="Consultez votre historique d'achats" to="/historique" color="blue" />
                  <ActionItem icon={<Heart size={18} className="text-red-500" />} title="Mes favoris" description="Retrouvez vos articles préférés" to="/favoris" color="red" />
                  <ActionItem icon={<CreditCard size={18} className="text-green-500" />} title="Moyens de paiement" description="Gérez vos cartes et méthodes de paiement" to="/paiement" color="green" />
                  <ActionItem icon={<MapPin size={18} className="text-purple-500" />} title="Adresses de livraison" description="Gérez vos adresses d'expédition" to="/adresses" color="purple" />
                  <ActionItem icon={<Settings size={18} className="text-gray-500" />} title="Paramètres" description="Préférences et configuration du compte" to="/parametres" color="gray" />
                </div>
              </div>

              {/* Devenir vendeur */}
              <div className="bg-gradient-to-r from-[#FC7701] to-[#e96b00] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                    <Store size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">Devenez vendeur</h3>
                    <p className="text-sm text-white/90 leading-relaxed">Lancez votre boutique en ligne et rejoignez la communauté ZanDoo</p>
                  </div>
                  <Link
                    to="/devenir-vendeur"
                    className="shrink-0 bg-white text-[#FC7701] font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-orange-50 transition-colors shadow-sm flex items-center gap-2"
                  >
                    Commencer
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Déconnexion */}
              <button
                onClick={handleDeconnexion}
                disabled={chargement}
                className="cursor-pointer w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors disabled:opacity-60"
              >
                <LogOut size={16} />
                {chargement ? 'Déconnexion en cours...' : 'Se déconnecter'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal modification du profil ─────────────── */}
      {modalOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !enregistrement && setModalOuvert(false)}
          />

          {/* Carte modale */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* En-tête */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Modifier mon profil</h2>
                <p className="text-xs text-gray-400 mt-0.5">Mettez à jour vos coordonnées</p>
              </div>
              <button
                onClick={() => setModalOuvert(false)}
                disabled={enregistrement}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-40"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSauvegarder} className="px-6 py-5 space-y-4">

              {/* Nom complet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom complet <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    erreurs.fullName
                      ? 'border-red-400 bg-red-50 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#FC7701] focus:ring-2 focus:ring-[#FC7701]/20'
                  }`}
                  placeholder="Votre nom complet"
                  disabled={enregistrement}
                />
                {erreurs.fullName && (
                  <p className="mt-1 text-xs text-red-500">{erreurs.fullName}</p>
                )}
              </div>

              {/* Email (lecture seule) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse e-mail
                </label>
                <div className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400">
                  <Mail size={14} className="shrink-0" />
                  {utilisateur.email}
                </div>
                <p className="mt-1 text-xs text-gray-400">L'adresse e-mail ne peut pas être modifiée.</p>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FC7701] focus:ring-2 focus:ring-[#FC7701]/20 text-sm outline-none transition-all"
                  placeholder="+225 07 00 00 00 00"
                  disabled={enregistrement}
                />
              </div>

              {/* Message succès */}
              {messageSucces && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                  <ShieldCheck size={16} />
                  {messageSucces}
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOuvert(false)}
                  disabled={enregistrement}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={enregistrement}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FC7701] hover:bg-[#e06900] transition-all disabled:opacity-60"
                >
                  {enregistrement ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AcheteurLayout>
  );
}

/* ── Composants internes ─────────────────────────────────────── */

interface InfoItemProps { icon: React.ReactNode; label: string; value: string; }
function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <span className="text-gray-600">{label}:</span>
      <span className="text-gray-900 font-medium truncate">{value}</span>
    </div>
  );
}

interface StatItemProps { icon: React.ReactNode; value: string; label: string; }
function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

interface ActionItemProps { icon: React.ReactNode; title: string; description: string; to: string; color: string; }
function ActionItem({ icon, title, description, to, color }: ActionItemProps) {
  const hoverColor = {
    indigo: 'group-hover:bg-indigo-50',
    blue:   'group-hover:bg-blue-50',
    red:    'group-hover:bg-red-50',
    green:  'group-hover:bg-green-50',
    purple: 'group-hover:bg-purple-50',
    gray:   'group-hover:bg-gray-50',
  }[color];

  return (
    <Link to={to} className={`flex items-center gap-4 px-6 py-4 transition-colors group ${hoverColor}`}>
      <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white flex items-center justify-center transition-colors shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 group-hover:text-[#FC7701] transition-colors">{title}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#FC7701] transition-colors" />
    </Link>
  );
}
