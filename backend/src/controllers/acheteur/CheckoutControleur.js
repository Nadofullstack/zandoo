import { validerPanier, envoyerEmailsCheckout, ErreurCheckout } from '../../services/checkoutService.js';

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/acheteur/checkout
───────────────────────────────────────────────────────────────────────────── */
export const checkout = async (req, res) => {
  try {
    const { adresseLivraison, paiement, notesClient = '' } = req.body;

    if (!adresseLivraison || !adresseLivraison.nomComplet || !adresseLivraison.ville) {
      return res.status(422).json({
        success: false,
        message: "L'adresse de livraison est incomplète (nomComplet et ville requis).",
      });
    }

    if (!paiement || !paiement.methode) {
      return res.status(422).json({
        success: false,
        message: 'La méthode de paiement est requise.',
      });
    }

    const { commandes, groupeCommandeId } = await validerPanier({
      acheteurId: req.user._id,
      adresseLivraison,
      paiement,
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
          _id:    c._id,
          numero: c.numero,
          total:  c.total,
          statut: c.statut,
        })),
      },
    });
  } catch (erreur) {
    if (erreur instanceof ErreurCheckout) {
      return res.status(erreur.statusCode).json({ success: false, message: erreur.message });
    }
    console.error('Erreur checkout:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur lors du paiement.' });
  }
};
