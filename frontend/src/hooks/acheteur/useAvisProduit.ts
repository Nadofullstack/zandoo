import { useEffect, useState } from 'react';
import * as service from '../../services/acheteur/acheteurAvisService';
import { lireSession } from '../../services/auth/authService';
import type { AvisPublic, MonAvis, ResumeNotes, SaisieAvis, TriAvis } from '../../types/acheteur';

const PAR_PAGE = 5;

/**
 * Avis d'un produit : liste paginée (« voir plus »), filtre par note, tri,
 * et avis de l'utilisateur connecté (création / modification / suppression).
 */
export function useAvisProduit(produitId: string | undefined) {
  const [avis, setAvis]             = useState<AvisPublic[]>([]);
  const [resume, setResume]         = useState<ResumeNotes | null>(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [note, setNote]             = useState<number | undefined>();
  const [tri, setTri]               = useState<TriAvis>('recents');
  const [chargement, setChargement] = useState(true);
  const [version, setVersion]       = useState(0);

  const [peutEvaluer, setPeutEvaluer] = useState(false);
  const [monAvis, setMonAvis]         = useState<MonAvis | null>(null);
  const connecte = !!lireSession();

  /* Liste des avis (page 1 remplace, pages suivantes ajoutent) */
  useEffect(() => {
    if (!produitId) return;
    let annule = false;
    const charger = async () => {
      setChargement(true);
      try {
        const { data } = await service.getAvisProduit(produitId, { page, limite: PAR_PAGE, note, tri });
        if (annule) return;
        setAvis((prec) => (page === 1 ? data.avis : [...prec, ...data.avis]));
        setResume(data.resume);
        setTotalPages(data.pagination.totalPages);
      } catch {
        /* section non bloquante : la fiche produit reste utilisable */
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [produitId, page, note, tri, version]);

  /* Éligibilité + avis existant de l'utilisateur */
  useEffect(() => {
    if (!produitId || !connecte) return;
    let annule = false;
    service.getMonAvisProduit(produitId)
      .then(({ data }) => {
        if (annule) return;
        setPeutEvaluer(data.peutEvaluer);
        setMonAvis(data.monAvis);
      })
      .catch(() => { /* non bloquant */ });
    return () => { annule = true; };
  }, [produitId, connecte, version]);

  const rafraichir = () => { setPage(1); setVersion((v) => v + 1); };

  const enregistrer = async (saisie: SaisieAvis) => {
    if (!produitId) return;
    if (monAvis) await service.modifierAvis(monAvis._id, saisie);
    else await service.creerAvis(produitId, saisie);
    rafraichir();
  };

  const supprimer = async () => {
    if (!monAvis) return;
    await service.supprimerAvis(monAvis._id);
    setMonAvis(null);
    rafraichir();
  };

  return {
    avis, resume, chargement,
    note, filtrerParNote: (n?: number) => { setNote(n); setPage(1); },
    tri, trier: (t: TriAvis) => { setTri(t); setPage(1); },
    aPlus: page < totalPages,
    voirPlus: () => setPage((p) => p + 1),
    peutEvaluer, monAvis, enregistrer, supprimer,
  };
}
