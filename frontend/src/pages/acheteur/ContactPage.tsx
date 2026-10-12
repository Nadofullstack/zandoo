import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ChevronRight, CircleCheck, Clock, Loader2, Package, Send, ShieldCheck, Store } from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import RenduContenu from '../../components/acheteur/contenu/RenduContenu';
import { cascade, elementCascade, fondu } from '../../components/acheteur/accueil/animations';
import { envoyerMessageContact, getPage, type MessageContact, type SujetContact } from '../../services/acheteur/acheteurContenuService';
import { lireSession } from '../../services/auth/authService';

const SUJETS: { valeur: SujetContact; libelle: string }[] = [
  { valeur: 'commande',    libelle: 'Une commande' },
  { valeur: 'vendeur',     libelle: 'Devenir vendeur / ma boutique' },
  { valeur: 'partenariat', libelle: 'Partenariat & publicité' },
  { valeur: 'technique',   libelle: 'Un problème technique' },
  { valeur: 'autre',       libelle: 'Autre chose' },
];

const CHAMP = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#FC7701] focus:ring-2 focus:ring-[#FC7701]/15 transition-colors';
const LABEL = 'text-sm font-semibold text-gray-700 mb-1.5 block';

/** Page Contact : formulaire (avec anti-robot et limitation côté serveur) + coordonnées éditables par l'admin. */
export default function ContactPage() {
  const session = lireSession();
  const [form, setForm] = useState<MessageContact>({
    nom: session?.fullName ?? '', email: session?.email ?? '', telephone: session?.phone ?? '', sujet: 'commande', message: '', site: '',
  });
  const [envoi, setEnvoi]     = useState(false);
  const [erreur, setErreur]   = useState<string | null>(null);
  const [envoye, setEnvoye]   = useState<string | null>(null);
  const [coordonnees, setCoordonnees] = useState<string | null>(null);

  /* Coordonnées : page statique « contact » si l'admin l'a publiée */
  useEffect(() => {
    let annule = false;
    getPage('contact').then((p) => { if (!annule) setCoordonnees(p.contenu); }).catch(() => {});
    return () => { annule = true; };
  }, []);

  const maj = (champ: keyof MessageContact) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [champ]: e.target.value }));

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nom.trim().length < 2) return setErreur('Indiquez votre nom.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return setErreur('Adresse e-mail invalide.');
    if (form.message.trim().length < 10) return setErreur('Votre message doit contenir au moins 10 caractères.');

    setEnvoi(true);
    setErreur(null);
    try {
      setEnvoye(await envoyerMessageContact({ ...form, nom: form.nom.trim(), email: form.email.trim(), message: form.message.trim() }));
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "L'envoi a échoué.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <AcheteurLayout>
        <section className="relative overflow-hidden bg-[#011023]">
          <div className="absolute -top-40 -right-20 w-[520px] h-[520px] rounded-full bg-[#FC7701]/15 blur-[130px] pointer-events-none" aria-hidden="true" />
          <motion.div variants={cascade(0.1)} initial="cache" animate="visible" className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
            <motion.nav variants={fondu} aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs text-white/50 mb-4">
              <Link to="/" className="hover:text-white">Accueil</Link>
              <ChevronRight size={12} />
              <span className="text-white/80">Contact</span>
            </motion.nav>
            <motion.h1 variants={fondu} className="text-3xl sm:text-5xl font-black text-white tracking-tight">Parlons-en</motion.h1>
            <motion.p variants={fondu} className="mt-3 text-white/60 max-w-xl">
              Une question sur une commande, votre boutique ou un partenariat ? Notre équipe vous répond sous 24 à 48 heures ouvrées.
            </motion.p>
          </motion.div>
        </section>

        <div className="bg-[#F8F9FF]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-10 grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* Formulaire */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {envoye ? (
                  <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-10" role="status">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }} className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                      <CircleCheck size={32} className="text-emerald-600" />
                    </motion.div>
                    <h2 className="text-xl font-black text-[#011023]">{envoye}</h2>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm">Un accusé de réception vient de vous être envoyé à <strong>{form.email}</strong>.</p>
                    <button onClick={() => { setEnvoye(null); setForm((f) => ({ ...f, message: '' })); }} className="mt-6 text-sm font-semibold text-[#FC7701] hover:underline">
                      Envoyer un autre message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" exit={{ opacity: 0 }} onSubmit={soumettre} noValidate className="space-y-5">
                    <h2 className="text-lg font-black text-[#011023]">Écrivez-nous</h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="c-nom" className={LABEL}>Nom *</label>
                        <input id="c-nom" value={form.nom} onChange={maj('nom')} maxLength={100} autoComplete="name" className={CHAMP} />
                      </div>
                      <div>
                        <label htmlFor="c-email" className={LABEL}>E-mail *</label>
                        <input id="c-email" type="email" value={form.email} onChange={maj('email')} maxLength={150} autoComplete="email" className={CHAMP} />
                      </div>
                      <div>
                        <label htmlFor="c-tel" className={LABEL}>Téléphone</label>
                        <input id="c-tel" type="tel" value={form.telephone} onChange={maj('telephone')} maxLength={30} autoComplete="tel" placeholder="Facultatif" className={CHAMP} />
                      </div>
                      <div>
                        <label htmlFor="c-sujet" className={LABEL}>Votre demande concerne</label>
                        <select id="c-sujet" value={form.sujet} onChange={maj('sujet')} className={CHAMP}>
                          {SUJETS.map((s) => <option key={s.valeur} value={s.valeur}>{s.libelle}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="c-message" className={LABEL}>Message *</label>
                      <textarea
                        id="c-message"
                        value={form.message}
                        onChange={maj('message')}
                        maxLength={3000}
                        rows={6}
                        placeholder={form.sujet === 'commande' ? 'Indiquez si possible votre numéro de commande (CMD-…)' : 'Décrivez votre demande'}
                        className={`${CHAMP} resize-y min-h-[140px]`}
                      />
                      <p className="text-xs text-gray-400 text-right mt-1">{form.message.length}/3000</p>
                    </div>

                    {/* Piège anti-robots : invisible et ignoré par les lecteurs d'écran */}
                    <div className="absolute w-px h-px overflow-hidden -left-[9999px]" aria-hidden="true">
                      <label htmlFor="c-site">Site web</label>
                      <input id="c-site" tabIndex={-1} autoComplete="off" value={form.site} onChange={maj('site')} />
                    </div>

                    {erreur && <p className="text-sm text-red-600" role="alert">{erreur}</p>}

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
                      <p className="text-xs text-gray-400 flex items-center gap-1.5"><ShieldCheck size={13} /> Vos informations servent uniquement à vous répondre.</p>
                      <motion.button
                        type="submit"
                        disabled={envoi}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#FC7701] hover:bg-[#e06900] shadow-lg shadow-[#FC7701]/25 disabled:opacity-70"
                      >
                        {envoi ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Envoyer
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Informations */}
            <motion.aside variants={cascade(0.1, 0.25)} initial="cache" animate="visible" className="space-y-4">
              <CarteInfo icone={<Clock size={18} />} titre="Délai de réponse">Sous 24 à 48 heures ouvrées, du lundi au samedi.</CarteInfo>
              <CarteInfo icone={<Package size={18} />} titre="Suivre une commande">
                Retrouvez l'état de vos commandes dans <Link to="/mes-commandes" className="text-[#FC7701] font-semibold hover:underline">Mes commandes</Link>.
              </CarteInfo>
              <CarteInfo icone={<Store size={18} />} titre="Vendre sur ZANDOO">
                Ouvrez votre boutique gratuitement depuis <Link to="/devenir-vendeur" className="text-[#FC7701] font-semibold hover:underline">Devenir vendeur</Link>.
              </CarteInfo>
              {coordonnees && (
                <motion.div variants={elementCascade} className="bg-white rounded-2xl border border-gray-100 p-5 text-sm">
                  <RenduContenu contenu={coordonnees} />
                </motion.div>
              )}
            </motion.aside>
          </div>
        </div>
      </AcheteurLayout>
    </MotionConfig>
  );
}

function CarteInfo({ icone, titre, children }: { icone: React.ReactNode; titre: string; children: React.ReactNode }) {
  return (
    <motion.div variants={elementCascade} className="flex gap-4 bg-white rounded-2xl border border-gray-100 p-5">
      <span className="w-10 h-10 rounded-xl bg-orange-50 text-[#FC7701] flex items-center justify-center shrink-0">{icone}</span>
      <div>
        <p className="text-sm font-bold text-[#011023]">{titre}</p>
        <p className="text-sm text-gray-500 mt-0.5">{children}</p>
      </div>
    </motion.div>
  );
}
