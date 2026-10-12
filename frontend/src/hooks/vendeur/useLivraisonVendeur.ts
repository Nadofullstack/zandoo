import { useEffect, useState } from 'react';
import { enregistrerPolitiqueLivraison, getPolitiqueLivraison } from '../../services/vendeur/vendeurLivraisonService';
import {
  versFormulaire,
  versPolitique,
  validerFormulaire,
  type FormLivraison,
} from '../../components/vendeur/livraison/formulaireLivraison';

/** Chargement, édition et enregistrement de la politique de livraison du vendeur. */
export function useLivraisonVendeur() {
  const [form, setForm]                 = useState<FormLivraison | null>(null);
  const [configuree, setConfiguree]     = useState(true);
  const [chargement, setChargement]     = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur]             = useState<string | null>(null);
  const [succes, setSucces]             = useState<string | null>(null);
  const [modifie, setModifie]           = useState(false);

  useEffect(() => {
    getPolitiqueLivraison()
      .then(({ data }) => {
        setForm(versFormulaire(data.livraison, data.adresseBoutique?.ville ?? ''));
        setConfiguree(data.livraison.configuree);
      })
      .catch((e) => setErreur(e instanceof Error ? e.message : 'Impossible de charger votre politique de livraison.'))
      .finally(() => setChargement(false));
  }, []);

  /** Met à jour une partie du formulaire */
  const modifier = (maj: Partial<FormLivraison> | ((f: FormLivraison) => FormLivraison)) => {
    setForm((f) => (f ? (typeof maj === 'function' ? maj(f) : { ...f, ...maj }) : f));
    setModifie(true);
    setSucces(null);
  };

  const enregistrer = async () => {
    if (!form) return;
    const invalide = validerFormulaire(form);
    if (invalide) { setErreur(invalide); return; }

    setEnregistrement(true);
    setErreur(null);
    setSucces(null);
    try {
      const { data, message } = await enregistrerPolitiqueLivraison(versPolitique(form));
      setForm(versFormulaire(data.livraison, data.adresseBoutique?.ville ?? ''));
      setConfiguree(true);
      setModifie(false);
      setSucces(message ?? 'Politique de livraison enregistrée.');
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "L'enregistrement a échoué.");
    } finally {
      setEnregistrement(false);
    }
  };

  return { form, configuree, chargement, enregistrement, erreur, succes, modifie, modifier, enregistrer };
}
