import User from '../../models/User.js';
import {
  validerPanier,
  calculerOptionsCheckout,
  envoyerEmailsCheckout,
  ErreurCheckout,
} from '../../services/checkoutService.js';

/** Champs d'adresse recopiés dans la commande (snapshot) */
const CHAMPS_ADRESSE = ['nomComplet', 'telephone', 'quartier', 'rue', 'ville', 'pays', 'instructions'];

/**
 * Détermine l'adresse de livraison : adresse enregistrée (`adresseId`)
 * ou adresse saisie dans le formulaire (`adresseLivraison`).
 * L'adresse enregistrée est relue en base : le client ne peut pas la falsifier.
 */
async function resoudreAdresse(userId, { adresseId, adresseLivraison }) {
  let source = adresseLivraison;

  if (adresseId) {
    const user = await User.findById(userId).select('adresses').lean();
    source = user?.adresses?.find((a) => String(a._id) === String(adresseId));
    if (!source) throw new ErreurCheckout('Adresse de livraison introuvable.', 404);
  }

  if (!source?.nomComplet || !source?.ville) {
    throw new ErreurCheckout("L'adresse de livraison est incomplète (nom et ville requis).", 422);
  }

  return Object.fromEntries(CHAMPS_ADRESSE.map((c) => [c, String(source[c] ?? '').trim()]).filter(([, v]) => v));
}

const gererErreur = (res, erreur, contexte) => {
  if (erreur instanceof ErreurCheckout) {
    return res.status(erreur.statusCode).json({ success: false, message: erreur.message });
  }
  console.error(`Erreur ${contexte}:`, erreur);
  return res.status(500).json({ success: false, message: 'Erreur serveur.' });
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/acheteur/checkout/options-livraison
   Body : { ville }
   Options et frais de livraison de chaque boutique du panier pour cette ville.
───────────────────────────────────────────────────────────────────────────── */
export const getOptionsLivraison = async (req, res) => {
  try {
    const boutiques = await calculerOptionsCheckout({ acheteurId: req.user._id, ville: req.body.ville });
    return res.status(200).json({ success: true, data: { boutiques } });
  } catch (erreur) {
    return gererErreur(res, erreur, 'getOptionsLivraison');
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/acheteur/checkout
   Body : { adresseId | adresseLivraison, livraisons: { [vendeurId]: mode }, paiement, notesClient }
───────────────────────────────────────────────────────────────────────────── */
export const checkout = async (req, res) => {
  try {
    const { paiement, livraisons = {}, notesClient = '' } = req.body;

    if (!paiement || !paiement.methode) {
      return res.status(422).json({ success: false, message: 'La méthode de paiement est requise.' });
    }

    const adresseLivraison = await resoudreAdresse(req.user._id, req.body);

    const { commandes, groupeCommandeId } = await validerPanier({
      acheteurId: req.user._id,
      adresseLivraison,
      paiement,
      livraisons,
      notesClient,
    });

    /* Emails best-effort — ne bloque pas la réponse */
    envoyerEmailsCheckout({
      acheteurId:     req.user._id,
      commandesCrees: commandes,
      groupeCommandeId,
      adresseLivraison,
    });

    return res.status(201).json({
      success: true,
      message: `${commandes.length} commande(s) créée(s) avec succès.`,
      data: {
        groupeCommandeId,
        commandes: commandes.map((c) => ({
          _id:            c._id,
          numero:         c.numero,
          fraisLivraison: c.fraisLivraison,
          total:          c.total,
          statut:         c.statut,
        })),
      },
    });
  } catch (erreur) {
    return gererErreur(res, erreur, 'checkout');
  }
};
