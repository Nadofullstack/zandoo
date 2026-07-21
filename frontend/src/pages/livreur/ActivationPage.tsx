import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, Clock, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { verifierTokenActivation } from '../../services/admin/livreurService';
import logo from '../../assets/logo.jpg';

/**
 * Page d'activation du compte livreur.
 * Vérifie la validité du token reçu par email avant de rediriger
 * vers la page de changement de mot de passe initial.
 *
 * URL : /livreur/activation/:token
 */
export default function ActivationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate  = useNavigate();

  const [etat, setEtat] = useState<'chargement' | 'valide' | 'expire'>('chargement');
  const [info, setInfo] = useState<{ nomComplet: string; email: string; expireAt: string } | null>(null);

  useEffect(() => {
    if (!token) { setEtat('expire'); return; }

    const verifier = async () => {
      try {
        const rep = await verifierTokenActivation(token);
        setInfo({
          nomComplet: rep.data.nomComplet,
          email:      rep.data.email,
          expireAt:   rep.data.expireAt,
        });
        setEtat('valide');
      } catch {
        setEtat('expire');
      }
    };

    verifier();
  }, [token]);

  /* ── Chargement ─────────────────────────────────────────────── */
  if (etat === 'chargement') {
    return (
      <PageLayout>
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 size={36} className="animate-spin text-accent" aria-hidden="true" />
          <p className="text-sm text-[#74777d]">Vérification du lien d'activation…</p>
        </div>
      </PageLayout>
    );
  }

  /* ── Token invalide / expiré ────────────────────────────────── */
  if (etat === 'expire') {
    return (
      <PageLayout>
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertTriangle size={32} className="text-red-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary mb-2">Lien invalide ou expiré</h2>
            <p className="text-sm text-[#74777d] leading-relaxed max-w-xs mx-auto">
              Ce lien d'activation n'est plus valide. Les liens expirent après <strong>48 heures</strong>.
              <br />Contactez votre administrateur pour recevoir un nouveau lien.
            </p>
          </div>
          <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            💡 L'administrateur peut renvoyer un nouvel email depuis l'espace de gestion des livreurs.
          </div>
        </div>
      </PageLayout>
    );
  }

  /* ── Token valide — affichage du message de bienvenue ───────── */
  const expiration = info ? new Date(info.expireAt).toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
  }) : '';

  return (
    <PageLayout>
      <div className="space-y-5">
        {/* Message de bienvenue */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-cyan-100 rounded-full mb-3">
            <Truck size={28} className="text-cyan-700" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-primary">
            Bienvenue, {info?.nomComplet} !
          </h2>
          <p className="text-sm text-[#74777d] mt-1">
            Votre compte livreur <strong className="text-primary">{info?.email}</strong> est prêt à être activé.
          </p>
        </div>

        {/* Étapes */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[#74777d] uppercase tracking-wider">
            Voici les étapes d'activation :
          </p>
          <ol className="space-y-2.5">
            {[
              { n: 1, label: 'Changer votre mot de passe temporaire', actif: true  },
              { n: 2, label: 'Compléter votre profil livreur',         actif: false },
              { n: 3, label: 'Commencer à livrer sur ZANDOO',          actif: false },
            ].map(({ n, label, actif }) => (
              <li key={n} className="flex items-center gap-3">
                <span
                  className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    actif
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 text-[#74777d]',
                  ].join(' ')}
                >
                  {n}
                </span>
                <span className={`text-sm ${actif ? 'text-primary font-semibold' : 'text-[#74777d]'}`}>
                  {label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Avertissement expiration */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          <Clock size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Ce lien expire le <strong>{expiration}</strong>.
            Activez votre compte avant cette date.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate(`/livreur/activation/${token}/changer-mot-de-passe`)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-colors text-sm"
        >
          Activer mon compte
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </PageLayout>
  );
}

/* ── Layout partagé pour les pages d'activation ──────────────────────────── */

function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#eef1f8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Header card */}
        <div className="bg-primary rounded-t-2xl px-8 py-6 text-center">
          <img src={logo} alt="ZANDOO" className="h-10 w-10 mx-auto mb-3 rounded-xl object-contain" />
          <h1 className="text-accent font-extrabold text-xl tracking-tight">ZANDOO</h1>
          <p className="text-white/60 text-xs mt-1">Activation du compte livreur</p>
        </div>

        {/* Body card */}
        <div className="bg-white rounded-b-2xl shadow-2xl px-8 py-7">
          {children}
        </div>

      </div>
    </main>
  );
}
