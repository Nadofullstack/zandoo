import Notification from '../models/Notification.js';
import { emettreA } from '../realtime/socket.js';

/**
 * Crée une notification et la pousse en temps réel au destinataire.
 *
 * Best-effort : ne lève jamais d'erreur — une notification manquée ne doit pas
 * faire échouer l'action métier qui l'a déclenchée (commande, avis…).
 *
 * @param {object} n
 * @param {string} n.destinataire - Identifiant User
 * @param {string} n.type         - Voir TYPES_NOTIFICATION
 * @param {string} n.titre
 * @param {string} [n.contenu]
 * @param {string} [n.lien]       - Chemin interne à ouvrir au clic
 */
export async function notifier({ destinataire, type, titre, contenu = '', lien = '' }) {
  try {
    if (!destinataire) return null;
    const notification = await Notification.create({
      destinataire,
      type,
      titre:   String(titre).slice(0, 120),
      contenu: String(contenu).slice(0, 300),
      lien,
    });
    emettreA(destinataire, 'notification:nouvelle', notification.toObject());
    return notification;
  } catch (erreur) {
    console.error('Notification non créée:', erreur.message);
    return null;
  }
}

/* ── Notifications métier (libellés centralisés) ─────────────────────────── */

const LIBELLES_STATUT = {
  payee:          'confirmée',
  en_preparation: 'en préparation',
  expediee:       'expédiée',
  livree:         'livrée',
  annulee:        'annulée',
  remboursee:     'remboursée',
};

/** Vendeur : une nouvelle commande vient d'être passée dans sa boutique. */
export const notifierNouvelleCommande = ({ vendeurUtilisateur, numero, total }) =>
  notifier({
    destinataire: vendeurUtilisateur,
    type:   'commande_nouvelle',
    titre:  `Nouvelle commande ${numero}`,
    contenu: `Montant : ${new Intl.NumberFormat('fr-FR').format(total)} FCFA. Préparez-la dès que possible.`,
    lien:   '/vendeur/commandes',
  });

/** Acheteur : le statut de sa commande a changé. */
export const notifierStatutCommande = ({ acheteur, commandeId, numero, statut, nomBoutique }) => {
  const libelle = LIBELLES_STATUT[statut];
  if (!libelle) return Promise.resolve(null);
  return notifier({
    destinataire: acheteur,
    type:   statut === 'annulee' ? 'commande_annulee' : 'commande_statut',
    titre:  `Commande ${numero} ${libelle}`,
    contenu: nomBoutique ? `Boutique : ${nomBoutique}` : '',
    lien:   `/mes-commandes/${commandeId}`,
  });
};

/** Vendeur : une commande a été annulée par l'acheteur ou l'administration. */
export const notifierAnnulationVendeur = ({ vendeurUtilisateur, numero, auteur }) =>
  notifier({
    destinataire: vendeurUtilisateur,
    type:   'commande_annulee',
    titre:  `Commande ${numero} annulée`,
    contenu: auteur === 'admin' ? "Annulée par l'équipe ZANDOO. Le stock a été remis à jour." : "Annulée par l'acheteur. Le stock a été remis à jour.",
    lien:   '/vendeur/commandes',
  });
