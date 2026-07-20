import { useState, useEffect, useCallback } from 'react';
import type {
  PageStatique, Article, StatistiquesArticles, Pagination, StatutArticle,
} from '../types/admin';
import {
  getPages, getPageParSlug, sauvegarderPage, creerPage, supprimerPage,
  getArticles, getStatistiquesArticles, getArticleParId,
  creerArticle, modifierArticle, supprimerArticle,
} from '../services/adminContenuService';

/* ── Hook pages statiques ─────────────────────────────────────────────── */
interface EtatPages {
  pages: PageStatique[];
  chargement: boolean;
  chargementAction: boolean;
  erreur: string | null;
  chargerPage: (slug: string) => Promise<PageStatique | null>;
  creer: (d: Pick<PageStatique, 'slug' | 'titre'> & Partial<PageStatique>) => Promise<PageStatique | null>;
  sauvegarder: (slug: string, d: Partial<PageStatique>) => Promise<void>;
  supprimer: (slug: string) => Promise<void>;
  recharger: () => void;
}

export function useGestionPages(): EtatPages {
  const [pages,           setPages]           = useState<PageStatique[]>([]);
  const [chargement,      setChargement]      = useState(true);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur,          setErreur]          = useState<string | null>(null);
  const [compteur,        setCompteur]        = useState(0);

  const recharger = useCallback(() => setCompteur((n) => n + 1), []);

  useEffect(() => {
    let annule = false;
    (async () => {
      setChargement(true);
      try {
        const rep = await getPages();
        if (!annule) setPages(rep.data.pages);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => { annule = true; };
  }, [compteur]);

  const chargerPage = useCallback(async (slug: string): Promise<PageStatique | null> => {
    try {
      const rep = await getPageParSlug(slug);
      return rep.data.page;
    } catch { return null; }
  }, []);

  const creer = useCallback(async (
    d: Pick<PageStatique, 'slug' | 'titre'> & Partial<PageStatique>
  ): Promise<PageStatique | null> => {
    setChargementAction(true);
    try {
      const rep = await creerPage(d);
      recharger();
      return rep.data.page;
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la création.');
      return null;
    } finally { setChargementAction(false); }
  }, [recharger]);

  const sauvegarder = useCallback(async (slug: string, d: Partial<PageStatique>) => {
    setChargementAction(true);
    try {
      const rep = await sauvegarderPage(slug, d);
      setPages((p) => p.map((pg) => pg.slug === slug ? rep.data.page : pg));
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally { setChargementAction(false); }
  }, []);

  const supprimer = useCallback(async (slug: string) => {
    setChargementAction(true);
    try {
      await supprimerPage(slug);
      setPages((p) => p.filter((pg) => pg.slug !== slug));
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    } finally { setChargementAction(false); }
  }, []);

  return { pages, chargement, chargementAction, erreur, chargerPage, creer, sauvegarder, supprimer, recharger };
}

/* ── Hook articles ────────────────────────────────────────────────────── */
interface EtatArticles {
  articles: Article[];
  pagination: Pagination | null;
  statistiques: StatistiquesArticles | null;
  chargement: boolean;
  chargementAction: boolean;
  erreur: string | null;
  filtreStatut: StatutArticle | '';
  recherche: string;
  page: number;
  setFiltreStatut: (v: StatutArticle | '') => void;
  setRecherche: (v: string) => void;
  setPage: (v: number) => void;
  chargerArticle: (id: string) => Promise<Article | null>;
  creer: (d: Partial<Article>) => Promise<Article | null>;
  modifier: (id: string, d: Partial<Article>) => Promise<void>;
  supprimer: (id: string) => Promise<void>;
  recharger: () => void;
}

export function useGestionArticles(): EtatArticles {
  const [articles,         setArticles]         = useState<Article[]>([]);
  const [pagination,       setPagination]       = useState<Pagination | null>(null);
  const [statistiques,     setStatistiques]     = useState<StatistiquesArticles | null>(null);
  const [chargement,       setChargement]       = useState(true);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur,           setErreur]           = useState<string | null>(null);
  const [filtreStatut,     setFiltreStatut]     = useState<StatutArticle | ''>('');
  const [recherche,        setRecherche]        = useState('');
  const [page,             setPage]             = useState(1);
  const [compteur,         setCompteur]         = useState(0);

  const recharger = useCallback(() => setCompteur((n) => n + 1), []);

  useEffect(() => {
    let annule = false;
    (async () => {
      setChargement(true);
      setErreur(null);
      try {
        const [rep, stats] = await Promise.all([
          getArticles({ statut: filtreStatut || undefined, recherche: recherche || undefined, page }),
          getStatistiquesArticles(),
        ]);
        if (annule) return;
        setArticles(rep.data.articles);
        setPagination(rep.data.pagination);
        setStatistiques(stats.data.statistiques);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => { annule = true; };
  }, [filtreStatut, recherche, page, compteur]);

  const chargerArticle = useCallback(async (id: string): Promise<Article | null> => {
    try {
      const rep = await getArticleParId(id);
      return rep.data.article;
    } catch { return null; }
  }, []);

  const creer = useCallback(async (d: Partial<Article>): Promise<Article | null> => {
    setChargementAction(true);
    try {
      const rep = await creerArticle(d);
      recharger();
      return rep.data.article;
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la création.');
      return null;
    } finally { setChargementAction(false); }
  }, [recharger]);

  const modifier = useCallback(async (id: string, d: Partial<Article>) => {
    setChargementAction(true);
    try {
      const rep = await modifierArticle(id, d);
      setArticles((a) => a.map((art) => art._id === id ? rep.data.article : art));
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la modification.');
    } finally { setChargementAction(false); }
  }, []);

  const supprimer = useCallback(async (id: string) => {
    setChargementAction(true);
    try {
      await supprimerArticle(id);
      setArticles((a) => a.filter((art) => art._id !== id));
      recharger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    } finally { setChargementAction(false); }
  }, [recharger]);

  return {
    articles, pagination, statistiques, chargement, chargementAction, erreur,
    filtreStatut, recherche, page,
    setFiltreStatut, setRecherche, setPage,
    chargerArticle, creer, modifier, supprimer, recharger,
  };
}
