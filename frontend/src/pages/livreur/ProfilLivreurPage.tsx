import { useState, useEffect } from 'react';
import {
  User, Phone, MapPin, Truck, BadgeCheck, RefreshCw,
  AlertCircle, CheckCircle2, Pencil, X, Save,
} from 'lucide-react';
import DispositionLivreur from '../../components/livreur/layout/DispositionLivreur';
import { getMonProfilLivreur, completerProfilLivreur } from '../../services/admin/livreurService';
import { lireSession } from '../../services/auth/authService';
import type { TypeVehicule } from '../../types/admin';

const VEHICULES: { valeur: TypeVehicule; libelle: string; emoji: string }[] = [
  { valeur: 'moto',        libelle: 'Moto',        emoji: '🏍️' },
  { valeur: 'velo',        libelle: 'Vélo',        emoji: '🚲' },
  { valeur: 'voiture',     libelle: 'Voiture',     emoji: '🚗' },
  { valeur: 'camionnette', libelle: 'Camionnette', emoji: '🚐' },
  { valeur: 'autre',       libelle: 'Autre',       emoji: '🚚' },
];

const BADGE_STATUT: Record<string, { label: string; cls: string }> = {
  actif:      { label: 'Actif',      cls: 'bg-green-100 text-green-700' },
  en_attente: { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
  suspendu:   { label: 'Suspendu',   cls: 'bg-red-100 text-red-600'     },
};

interface ProfilData {
  typeVehicule: TypeVehicule | null;
  numeroplaque: string | null;
  villeService: string | null;
  zonelivraison: string | null;
  telephone: string | null;
  statut: string;
  profilComplete: boolean;
}

export default function ProfilLivreurPage() {
  const session = lireSession();
  const [profil, setProfil]           = useState<ProfilData | null>(null);
  const [chargement, setChargement]   = useState(true);
  const [erreur, setErreur]           = useState<string | null>(null);
  const [enEdition, setEnEdition]     = useState(false);
  const [sauvegarde, setSauvegarde]   = useState(false);
  const [succes, setSucces]           = useState<string | null>(null);

  const [form, setForm] = useState({
    telephone: '', typeVehicule: '' as TypeVehicule | '',
    numeroplaque: '', villeService: '', zonelivraison: '',
  });

  const charger = async () => {
    setChargement(true); setErreur(null);
    try {
      const rep = await getMonProfilLivreur();
      const l   = rep.data.livreur;
      setProfil(l);
      setForm({
        telephone:    l.telephone    ?? '',
        typeVehicule: l.typeVehicule ?? '',
        numeroplaque: l.numeroplaque ?? '',
        villeService:  l.villeService  ?? '',
        zonelivraison: l.zonelivraison ?? '',
      });
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
    } finally { setChargement(false); }
  };

  useEffect(() => { charger(); }, []);

  const handleSauvegarder = async () => {
    if (!form.telephone || !form.typeVehicule || !form.villeService || !form.zonelivraison) {
      setErreur('Téléphone, type de véhicule, ville et zone sont obligatoires.');
      return;
    }
    setSauvegarde(true); setErreur(null);
    try {
      await completerProfilLivreur({
        telephone: form.telephone, typeVehicule: form.typeVehicule as TypeVehicule,
        numeroplaque: form.numeroplaque, villeService: form.villeService, zonelivraison: form.zonelivraison,
      });
      setSucces('Profil mis à jour avec succès.');
      setEnEdition(false);
      await charger();
      setTimeout(() => setSucces(null), 4000);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally { setSauvegarde(false); }
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all';

  return (
    <DispositionLivreur>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Mon profil</h1>
          <p className="text-sm text-[#74777d] mt-1">Vos informations personnelles et véhicule</p>
        </div>
        {!enEdition && profil && (
          <button onClick={() => setEnEdition(true)}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Pencil size={15} /> Modifier
          </button>
        )}
      </div>

      {succes && (
        <div className="mb-4 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircle2 size={16} /> {succes}
        </div>
      )}
      {erreur && (
        <div className="mb-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} /> {erreur}
          <button onClick={() => setErreur(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {chargement ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-5">

          {/* Carte identité */}
          <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-black text-2xl">
                {session?.fullName?.charAt(0).toUpperCase() ?? 'L'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-primary">{session?.fullName}</h2>
                  {profil?.profilComplete && <BadgeCheck size={18} className="text-accent" />}
                </div>
                <p className="text-sm text-[#74777d]">{session?.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${BADGE_STATUT[profil?.statut ?? 'en_attente']?.cls}`}>
                    {BADGE_STATUT[profil?.statut ?? 'en_attente']?.label}
                  </span>
                  {!profil?.profilComplete && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                      Profil incomplet
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Infos — vue ou édition */}
          {enEdition ? (
            <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-primary text-sm uppercase tracking-wide">Modifier les informations</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#74777d] mb-1.5">Téléphone *</label>
                  <input value={form.telephone} onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))}
                    placeholder="+229 97 00 00 00" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#74777d] mb-1.5">Numéro de plaque</label>
                  <input value={form.numeroplaque} onChange={(e) => setForm((p) => ({ ...p, numeroplaque: e.target.value }))}
                    placeholder="AB 1234 BJ" className={`${inputCls} uppercase`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#74777d] mb-1.5">Ville de service *</label>
                  <input value={form.villeService} onChange={(e) => setForm((p) => ({ ...p, villeService: e.target.value }))}
                    placeholder="Cotonou" className={inputCls} />
                </div>
              </div>

              {/* Véhicule */}
              <div>
                <label className="block text-xs font-semibold text-[#74777d] mb-2">Type de véhicule *</label>
                <div className="grid grid-cols-5 gap-2">
                  {VEHICULES.map(({ valeur, libelle, emoji }) => (
                    <button key={valeur} type="button" onClick={() => setForm((p) => ({ ...p, typeVehicule: valeur }))}
                      className={[
                        'flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-semibold transition-all',
                        form.typeVehicule === valeur
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-gray-200 text-[#74777d] hover:border-accent/40',
                      ].join(' ')}>
                      <span className="text-lg">{emoji}</span>
                      {libelle}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#74777d] mb-1.5">Zone de livraison *</label>
                <textarea value={form.zonelivraison} onChange={(e) => setForm((p) => ({ ...p, zonelivraison: e.target.value }))}
                  rows={3} placeholder="Ex : Akpakpa, Cadjèhoun…" className={`${inputCls} resize-none`} />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setEnEdition(false); setErreur(null); }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#74777d] hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button onClick={handleSauvegarder} disabled={sauvegarde}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-sm font-bold transition-colors disabled:opacity-50">
                  {sauvegarde
                    ? <><RefreshCw size={14} className="animate-spin" /> Sauvegarde…</>
                    : <><Save size={14} /> Enregistrer</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-primary text-sm uppercase tracking-wide mb-4">Informations livreur</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icone: Phone,     label: 'Téléphone',        valeur: profil?.telephone    },
                  { icone: Truck,     label: 'Véhicule',         valeur: VEHICULES.find((v) => v.valeur === profil?.typeVehicule)?.libelle ?? profil?.typeVehicule },
                  { icone: BadgeCheck, label: 'Plaque',          valeur: profil?.numeroplaque },
                  { icone: MapPin,    label: 'Ville de service',  valeur: profil?.villeService  },
                ].map(({ icone: Icone, label, valeur }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-xl flex-shrink-0">
                      <Icone size={15} className="text-[#74777d]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#74777d] font-medium">{label}</p>
                      <p className="text-sm font-semibold text-primary mt-0.5">
                        {valeur || <span className="text-gray-400 font-normal">Non renseigné</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {profil?.zonelivraison && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-xl flex-shrink-0">
                    <MapPin size={15} className="text-[#74777d]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#74777d] font-medium">Zone de livraison</p>
                    <p className="text-sm text-primary mt-0.5 leading-relaxed">{profil.zonelivraison}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </DispositionLivreur>
  );
}
