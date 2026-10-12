import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMesCommandes } from '../../services/acheteur/acheteurCommandeService';
import type { CommandeResume, CompteursCommandes, GroupeStatut, Pagination } from '../../types/acheteur';

const GROUPES: GroupeStatut[] = ['en_cours', 'livree', 'annulee'];
const PAR_PAGE = 8;
const DELAI_RECHERCHE_MS = 350;

/**
 * État de la page « Mes commandes ».
 *
 * Les filtres (onglet, recherche, page) vivent dans l'URL : la vue est
 * partageable, survit au rafraîchissement et le bouton « retour » fonctionne.
 */
export function useMesCommandes() {
  const [params, setParams] = useSearchParams();

  const groupeParam = params.get('onglet');
  const groupe = GROUPES.includes(groupeParam as GroupeStatut) ? (groupeParam as GroupeStatut) : undefined;
  const recherche = params.get('q') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [commandes, setCommandes]   = useState<CommandeResume[]>([]);
  const [compteurs, setCompteurs]   = useState<CompteursCommandes | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]         = useState<string | null>(null);
  const [version, setVersion]       = useState(0);

  /* Saisie locale de la recherche, propagée à l'URL après un court délai */
  const [saisie, setSaisie] = useState(recherche);

  const mettreAJourParams = useCallback(
    (maj: Record<string, string | undefined>) => {
      setParams((prev) => {
        const suivant = new URLSearchParams(prev);
        for (const [cle, valeur] of Object.entries(maj)) {
          if (valeur) suivant.set(cle, valeur);
          else suivant.delete(cle);
        }
        return suivant;
      }, { replace: true });
    },
    [setParams],
  );

  useEffect(() => {
    if (saisie.trim() === recherche) return;
    const minuteur = setTimeout(() => mettreAJourParams({ q: saisie.trim() || undefined, page: undefined }), DELAI_RECHERCHE_MS);
    return () => clearTimeout(minuteur);
  }, [saisie, recherche, mettreAJourParams]);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const { data } = await getMesCommandes({ groupe, recherche, page, limite: PAR_PAGE });
        if (annule) return;
        setCommandes(data.commandes);
        setCompteurs(data.compteurs);
        setPagination(data.pagination);
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Impossible de charger vos commandes.');
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [groupe, recherche, page, version]);

  return {
    commandes,
    compteurs,
    pagination,
    chargement,
    erreur,
    groupe,
    recherche,
    saisie,
    setSaisie,
    changerGroupe: (g?: GroupeStatut) => mettreAJourParams({ onglet: g, page: undefined }),
    changerPage:   (p: number) => mettreAJourParams({ page: p > 1 ? String(p) : undefined }),
    reinitialiser: () => { setSaisie(''); mettreAJourParams({ q: undefined, onglet: undefined, page: undefined }); },
    recharger:     () => setVersion((v) => v + 1),
  };
}
