import { useState, useEffect, useCallback } from 'react';
import type {
  Article, StatistiquesArticles, StatutArticle,
  CategorieEditoriale, Pagination, FormulaireArticle,
} from '../../types/admin';
import {
  getArticles, getStatistiquesArticles,
  creerArticle, modifierArticle, supprimerArticle,
} from '../../services/admin/adminArticleService';

interface EtatFiltre {
  statut: StatutArticle | '';
  categorieEditoriale: CategorieEditoriale | '';
  recherche: string;
  page: number;
}

interface EtatHook {
  articles: Article[];
  pagination: Pagination | null;
  statistiques: StatistiquesArticles | null;
  chargement: boolean;
  chargementAction: boolean;
  erreur: string | null;
  filtre: EtatFiltre;
  setFiltre: (f: Partial<EtatFiltre>) => void;
  creer: (d: Partial<FormulaireArticle>) => Promise<Article | null>;
  modifier: (id: string, d: Partial<FormulaireArticle>) => Promise<void>;
  supprimer: (id: string) => Promise<void>;
  recharger: () => void;
}

const FILTRE_INITIAL: EtatFiltre = { statut: '', categorieEditoriale: '', recherche: '', page: 1 };

export function useGestionArticles(): EtatHook {
  const [articles,         setArticles]         = useState<Article[]>([]);
  const [pagination,       setPagination]       = useState<Pagination | null>(null);
  const [statistiques,     setStatistiques]     = useState<StatistiquesArticles | null>(null);
  const [chargement,       setChargement]       = useState(true);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur,           setErreur]           = useState<string | null>(null);
  const [filtre,           setFiltreState]      = useState<EtatFiltre>(FILTRE_INITIAL);
  const [compteur,         setCompteur]         = useState(0);

  const setFiltre = useCallback((f: Partial<EtatFiltre>) =>
    setFiltreState((p) => ({ ...p, ...f, page: f.page ?? 1 })), []);
  const recharger = useCallback(() => setCompteur((n) => n + 1), []);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true); setErreur(null);
      try {
        const [repArt, repStats] = await Promise.all([
          getArticles({ statut: filtre.statut || undefined,
                        categorieEditoriale: filtre.categorieEditoriale || undefined,
                        recherche: filtre.recherche || undefined, page: filtre.page }),
          getStatistiquesArticles(),
        ]);
        if (annule) return;
        setArticles(repArt.data.articles);
        setPagination(repArt.data.pagination);
        setStatistiques(repStats.data.statistiques);
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Erreur de chargement.');
      } finally { if (!annule) setChargement(false); }
    };
    charger();
    return () => { annule = true; };
  }, [filtre.statut, filtre.categorieEditoriale, filtre.recherche, filtre.page, compteur]);

  const creer = useCallback(async (d: Partial<FormulaireArticle>) => {
    setChargementAction(true);
    try {
      const rep = await creerArticle(d);
      recharger();
      return rep.data.article;
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur.'); return null;
    } finally { setChargementAction(false); }
  }, [recharger]);

  const modifier = useCallback(async (id: string, d: Partial<FormulaireArticle>) => {
    setChargementAction(true);
    try {
      const rep = await modifierArticle(id, d);
      setArticles((prev) => prev.map((a) => a._id === id ? rep.data.article : a));
      recharger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur.');
    } finally { setChargementAction(false); }
  }, [recharger]);

  const supprimer = useCallback(async (id: string) => {
    setChargementAction(true);
    try {
      await supprimerArticle(id);
      setArticles((prev) => prev.filter((a) => a._id !== id));
      recharger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur.');
    } finally { setChargementAction(false); }
  }, [recharger]);

  return { articles, pagination, statistiques, chargement, chargementAction,
           erreur, filtre, setFiltre, creer, modifier, supprimer, recharger };
}
