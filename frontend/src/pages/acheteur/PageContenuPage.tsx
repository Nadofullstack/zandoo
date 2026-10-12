import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MotionConfig, motion } from 'framer-motion';
import { ChevronRight, FileText, MessageCircle } from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import RenduContenu from '../../components/acheteur/contenu/RenduContenu';
import { analyserContenu } from '../../components/acheteur/contenu/contenuUtils';
import { cascade, fondu } from '../../components/acheteur/accueil/animations';
import { getPage, type PageContenu } from '../../services/acheteur/acheteurContenuService';

interface Props {
  /** Slug imposé par une route dédiée (/a-propos, /cgu…) ; sinon lu dans l'URL (/pages/:slug) */
  slugFixe?: string;
}

/** Page de contenu éditée par l'admin : CGU, confidentialité, à propos, FAQ… */
export default function PageContenuPage({ slugFixe }: Props) {
  const params = useParams<{ slug: string }>();
  const slug = slugFixe ?? params.slug ?? '';

  const [page, setPage]             = useState<PageContenu | null>(null);
  const [chargement, setChargement] = useState(true);
  const [introuvable, setIntrouvable] = useState(false);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true);
      setIntrouvable(false);
      try {
        const p = await getPage(slug);
        if (!annule) setPage(p);
      } catch {
        if (!annule) { setPage(null); setIntrouvable(true); }
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [slug]);

  /* Référencement : titre et description de la page */
  useEffect(() => {
    if (!page) return;
    const titrePrecedent = document.title;
    document.title = `${page.metaTitre || page.titre} — ZANDOO`;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const descriptionPrecedente = meta?.content;
    if (page.metaDescription) {
      if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
      meta.content = page.metaDescription;
    }
    return () => {
      document.title = titrePrecedent;
      if (meta && descriptionPrecedente !== undefined) meta.content = descriptionPrecedente;
    };
  }, [page]);

  /* Sommaire : titres de niveau 2 et 3, avec les mêmes ancres que RenduContenu */
  const sommaire = useMemo(
    () => (page ? analyserContenu(page.contenu)
      .map((b, i) => ({ b, i }))
      .filter(({ b }) => b.type === 'titre' && b.niveau <= 3)
      .map(({ b, i }) => ({ id: `section-${i}`, texte: b.type === 'titre' ? b.texte.replace(/\*|\[|\]\([^)]*\)/g, '') : '', niveau: b.type === 'titre' ? b.niveau : 2 })) : []),
    [page],
  );

  return (
    <MotionConfig reducedMotion="user">
      <AcheteurLayout>
        <section className="bg-[#011023]">
          <motion.div variants={cascade(0.08)} initial="cache" animate="visible" className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
            <motion.nav variants={fondu} aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs text-white/50 mb-4">
              <Link to="/" className="hover:text-white">Accueil</Link>
              <ChevronRight size={12} />
              <span className="text-white/80">{page?.titre ?? 'Information'}</span>
            </motion.nav>
            <motion.h1 variants={fondu} className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {chargement ? <span className="inline-block h-10 w-72 max-w-full rounded-lg bg-white/10 animate-pulse" /> : page?.titre ?? 'Page introuvable'}
            </motion.h1>
            {page && (
              <motion.p variants={fondu} className="mt-3 text-sm text-white/50">
                Dernière mise à jour : {new Date(page.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </motion.p>
            )}
          </motion.div>
        </section>

        <div className="bg-[#F8F9FF]">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
            {chargement ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-4 animate-pulse">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className={`h-4 rounded bg-gray-100 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />)}
              </div>
            ) : introuvable || !page ? (
              <div className="flex flex-col items-center text-center py-16 bg-white rounded-2xl border border-gray-100">
                <FileText size={28} className="text-gray-300 mb-3" />
                <p className="text-base font-bold text-[#011023]">Cette page n'est pas encore disponible</p>
                <p className="text-sm text-gray-500 mt-1">Une question ? Notre équipe vous répond.</p>
                <Link to="/contact" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FC7701] hover:bg-[#e06900]">
                  <MessageCircle size={16} /> Nous contacter
                </Link>
              </div>
            ) : (
              <div className={`grid gap-8 ${sommaire.length >= 3 ? 'lg:grid-cols-[240px_1fr]' : ''}`}>
                {sommaire.length >= 3 && (
                  <aside className="hidden lg:block">
                    <nav aria-label="Sommaire" className="sticky top-28">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Sommaire</p>
                      <ul className="space-y-1.5 border-l border-gray-200">
                        {sommaire.map((s) => (
                          <li key={s.id}>
                            <a href={`#${s.id}`} className={`block -ml-px border-l-2 border-transparent hover:border-[#FC7701] hover:text-[#011023] text-sm text-gray-500 transition-colors ${s.niveau === 3 ? 'pl-6' : 'pl-4'}`}>
                              {s.texte}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </aside>
                )}
                <motion.article
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 min-w-0"
                >
                  <RenduContenu contenu={page.contenu} />
                </motion.article>
              </div>
            )}
          </div>
        </div>
      </AcheteurLayout>
    </MotionConfig>
  );
}
