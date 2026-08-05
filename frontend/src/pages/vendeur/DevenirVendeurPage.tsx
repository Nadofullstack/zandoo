import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ChevronRight, CheckCircle2, Clock, Ban, ArrowLeft, Loader2 } from 'lucide-react';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { soumettreInscription, getStatutInscription } from '../../services/vendeur/vendeurService';
import { lireSession, rafraichirSession } from '../../services/auth/authService';
import type { PayloadInscription, StatutVendeurInscription } from '../../types/vendeur';

type Etape = 'statut' | 'infos' | 'conditions' | 'confirmation';

const TYPES = ['individuel', 'organisation', 'autre'] as const;
const LABELS_TYPE: Record<string, string> = {
  individuel: 'Individuel / Auto-entrepreneur',
  organisation: 'Organisation',
  autre: 'Autre',
};

export default function DevenirVendeurPage() {
  const navigate   = useNavigate();
  const session    = lireSession();

  const [etape, setEtape]             = useState<Etape>('infos');
  const [statutExist, setStatutExist] = useState<StatutVendeurInscription | null | 'loading'>('loading');
  const [chargement, setChargement]   = useState(false);
  const [erreur, setErreur]           = useState<string | null>(null);

  const [form, setForm] = useState<PayloadInscription>({
    nomEntreprise: '',
    typeEntreprise: 'individuel',
    secteurActivite: '',
    adresse: { ville: '', pays: 'Bénin' },
    emailContact: session?.email ?? '',
    telephoneContact: session?.phone ?? '',
    conditionsAcceptees: false,
  });

  /* Vérifier si une demande existe déjà + rafraîchir la session */
  useEffect(() => {
    if (!session) { navigate('/connexion'); return; }

    // Rafraîchir la session pour avoir le flag estVendeur à jour
    rafraichirSession().then((userFrais) => {
      if (userFrais?.estVendeur === true || userFrais?.role === 'vendeur') {
        navigate('/vendeur/tableau-de-bord', { replace: true });
      }
    });

    getStatutInscription()
      .then((r) => setStatutExist(r.data.vendeur))
      .catch(() => setStatutExist(null))
      .finally(() => {
        if (statutExist !== 'loading') return;
      });
  }, []);

  /* Rediriger si déjà vendeur */
  useEffect(() => {
    if (session?.role === 'vendeur' || session?.estVendeur === true) {
      navigate('/vendeur/tableau-de-bord', { replace: true });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('adresse.')) {
      const k = name.split('.')[1];
      setForm((p) => ({ ...p, adresse: { ...p.adresse, [k]: value } }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const soumettre = async () => {
    setChargement(true);
    setErreur(null);
    try {
      await soumettreInscription({ ...form, conditionsAcceptees: true });
      setEtape('confirmation');
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la soumission.');
    } finally {
      setChargement(false);
    }
  };

  /* ── Affichage statut demande existante ─────────────────────────────── */
  if (statutExist === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (statutExist) {
    return <PageStatutDemande statut={statutExist} />;
  }

  /* ── Étape confirmation ─────────────────────────────────────────────── */
  if (etape === 'confirmation') {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-xl font-extrabold text-primary mb-2">Demande envoyée !</h1>
          <p className="text-sm text-[#74777d] mb-6">
            Votre demande pour devenir vendeur sur ZANDOO a bien été reçue.
            L'équipe ZANDOO l'examinera dans les meilleurs délais.
            Vous recevrez une notification dès qu'elle sera traitée.
          </p>
          <Link
            to="/"
            className="block w-full py-3 rounded-xl bg-accent text-white text-sm font-semibold text-center hover:bg-accent/90 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  /* ── Formulaire inscription ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f4f6fb] px-4 py-10">
      <div className="max-w-xl mx-auto">

        {/* Retour */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#74777d] hover:text-primary transition-colors mb-6">
          <ArrowLeft size={14} /> Retour
        </Link>

        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <Store size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-extrabold text-primary">Commencer à vendre sur ZANDOO</h1>
          <p className="text-sm text-[#74777d] mt-1.5">Créez gratuitement votre boutique en quelques minutes.</p>
        </div>

        {/* Étapes visuelles */}
        <div className="flex items-center justify-center gap-2 mb-8 text-xs font-semibold">
          {(['infos', 'conditions'] as Etape[]).map((e, i) => (
            <div key={e} className="flex items-center gap-2">
              {i > 0 && <ChevronRight size={13} className="text-gray-300" />}
              <span className={[
                'px-3 py-1.5 rounded-full',
                etape === e ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500',
              ].join(' ')}>
                {i + 1}. {e === 'infos' ? 'Informations' : 'Conditions'}
              </span>
            </div>
          ))}
        </div>

        {erreur && <div className="mb-5"><Alert variant="error">{erreur}</Alert></div>}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

          {/* ── ÉTAPE 1 : Informations commerciales ───────────────── */}
          {etape === 'infos' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-primary mb-2">Informations commerciales</h2>

              <div>
                <label htmlFor="nomEntreprise" className="block text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-1.5">
                  Nom de l'entreprise / boutique *
                </label>
                <input
                  id="nomEntreprise" name="nomEntreprise" type="text" required
                  value={form.nomEntreprise} onChange={handleChange}
                  placeholder="Ex : Boutique Adeola"
                  className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20"
                />
              </div>

              <div>
                <label htmlFor="typeEntreprise" className="block text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-1.5">
                  Type d'entreprise
                </label>
                <select
                  id="typeEntreprise" name="typeEntreprise"
                  value={form.typeEntreprise} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{LABELS_TYPE[t]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="secteurActivite" className="block text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-1.5">
                  Secteur d'activité
                </label>
                <input
                  id="secteurActivite" name="secteurActivite" type="text"
                  value={form.secteurActivite} onChange={handleChange}
                  placeholder="Ex : Mode & vêtements, Électronique, Alimentation…"
                  className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="adresse.ville" className="block text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-1.5">Ville</label>
                  <input
                    id="adresse.ville" name="adresse.ville" type="text"
                    value={form.adresse.ville ?? ''} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20"
                  />
                </div>
                <div>
                  <label htmlFor="adresse.pays" className="block text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-1.5">Pays</label>
                  <input
                    id="adresse.pays" name="adresse.pays" type="text"
                    value={form.adresse.pays ?? ''} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="emailContact" className="block text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-1.5">
                  E-mail de contact
                </label>
                <input
                  id="emailContact" name="emailContact" type="email"
                  value={form.emailContact} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20"
                />
                {session?.email && (
                  <p className="text-xs text-accent mt-1">Pré-rempli depuis votre profil — modifiable si besoin.</p>
                )}
              </div>

              <div>
                <label htmlFor="telephoneContact" className="block text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-1.5">
                  Téléphone de contact
                </label>
                <input
                  id="telephoneContact" name="telephoneContact" type="tel"
                  value={form.telephoneContact} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20"
                />
                {session?.phone && (
                  <p className="text-xs text-accent mt-1">Pré-rempli depuis votre profil — modifiable si besoin.</p>
                )}
              </div>

              <button
                type="button"
                disabled={!form.nomEntreprise.trim()}
                onClick={() => setEtape('conditions')}
                className="w-full py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Suivant →
              </button>
            </div>
          )}

          {/* ── ÉTAPE 2 : Conditions d'utilisation ────────────────── */}
          {etape === 'conditions' && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-primary">Conditions d'utilisation</h2>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-[#74777d] space-y-3 max-h-52 overflow-y-auto">
                <p className="font-semibold text-primary">Conditions générales vendeur ZANDOO</p>
                <p>En devenant vendeur sur ZANDOO, vous vous engagez à :</p>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li>Proposer des produits légaux, conformes et de qualité.</li>
                  <li>Traiter les commandes dans les délais convenus.</li>
                  <li>Maintenir vos informations commerciales à jour.</li>
                  <li>Respecter les politiques de remboursement et retour de ZANDOO.</li>
                  <li>Ne pas vendre de produits contrefaits ou illicites.</li>
                  <li>Accepter que ZANDOO prélève une commission sur chaque vente.</li>
                  <li>Respecter la vie privée des acheteurs et la législation sur les données personnelles.</li>
                </ul>
                <p>ZANDOO se réserve le droit de suspendre un compte vendeur en cas de manquement à ces règles.</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.conditionsAcceptees}
                  onChange={(e) => setForm((p) => ({ ...p, conditionsAcceptees: e.target.checked }))}
                  className="mt-0.5 accent-accent w-4 h-4"
                />
                <span className="text-sm text-primary">
                  J'ai lu et j'accepte les <span className="text-accent font-semibold">conditions d'utilisation vendeur</span> de ZANDOO.
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEtape('infos')}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-[#74777d] hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  ← Retour
                </button>
                <Button
                  type="button"
                  isLoading={chargement}
                  loadingText="Envoi en cours…"
                  disabled={!form.conditionsAcceptees}
                  onClick={soumettre}
                  className="flex-1 !py-3 cursor-pointer"
                >
                  Créer ma boutique gratuitement
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ── Composant statut de la demande ─────────────────────────────────────── */

function PageStatutDemande({ statut }: { statut: StatutVendeurInscription }) {
  const confMap: Record<string, { icone: typeof Clock; cls: string; titre: string; msg: string }> = {
    en_attente: {
      icone: Clock,
      cls:   'bg-yellow-100 text-yellow-600',
      titre: 'Demande en cours d\'examen',
      msg:   'Votre demande pour devenir vendeur est en attente de validation par l\'équipe ZANDOO. Vous serez notifié dès qu\'elle sera traitée.',
    },
    approuve: {
      icone: CheckCircle2,
      cls:   'bg-green-100 text-green-600',
      titre: 'Boutique approuvée !',
      msg:   'Votre boutique est active. Vous pouvez accéder à votre espace vendeur.',
    },
    suspendu: {
      icone: Ban,
      cls:   'bg-red-100 text-red-600',
      titre: 'Compte suspendu',
      msg:   'Votre accès vendeur a été suspendu. Contactez le support ZANDOO pour plus d\'informations.',
    },
  };

  const conf = confMap[statut.statut] ?? confMap.en_attente;
  const Icone = conf.icone;

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${conf.cls}`}>
          <Icone size={32} />
        </div>
        <p className="text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-1">{statut.nomEntreprise}</p>
        <h1 className="text-xl font-extrabold text-primary mb-2">{conf.titre}</h1>
        <p className="text-sm text-[#74777d] mb-6">{conf.msg}</p>
        {statut.statut === 'approuve' ? (
          <Link
            to="/vendeur/tableau-de-bord"
            className="block w-full py-3 rounded-xl bg-accent text-white text-sm font-semibold text-center hover:bg-accent/90 transition-colors"
          >
            Accéder à mon espace vendeur
          </Link>
        ) : (
          <Link
            to="/"
            className="block w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold text-center hover:bg-primary/90 transition-colors"
          >
            Retour à l'accueil
          </Link>
        )}
      </div>
    </div>
  );
}
