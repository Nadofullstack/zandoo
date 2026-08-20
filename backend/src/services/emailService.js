import nodemailer from 'nodemailer';
import env from '../config/env.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Transporteur SMTP — singleton réutilisable
───────────────────────────────────────────────────────────────────────────── */
function creerTransporteur() {
  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
}

const transporter = creerTransporteur();

/* Vérification silencieuse au démarrage */
transporter.verify().then(() => {
  console.log('✅ Serveur SMTP Gmail prêt');
}).catch((err) => {
  console.error('⚠️  SMTP non disponible:', err.message);
});

const EXPEDITEUR = `"ZANDOO" <${env.smtp.user}>`;

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers internes
───────────────────────────────────────────────────────────────────────────── */

/**
 * Échappe les caractères spéciaux HTML afin d'éviter
 * l'injection de HTML / XSS dans les emails.
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Vérifie qu'une URL est autorisée et l'échappe pour son insertion
 * dans un attribut HTML.
 */
function safeUrl(value) {
  try {
    const url = new URL(String(value));

    if (!['http:', 'https:'].includes(url.protocol)) {
      return '#';
    }

    return escapeHtml(url.toString());
  } catch {
    return '#';
  }
}

function formatMontant(montant) {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
}

function libelleLivraison(adresse) {
  return [
    escapeHtml(adresse?.rue),
    escapeHtml(adresse?.ville),
    escapeHtml(adresse?.pays),
  ]
    .filter(Boolean)
    .join(', ');
}

/** Enveloppe HTML commune */
function htmlEnveloppe({ titre, sousTitre, corps, anneeCourante }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapeHtml(titre)}</title>
</head>

<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(1,16,35,0.08);">

          <tr>
            <td style="background:#011023;padding:32px 40px;text-align:center;">
              <h1 style="color:#FC7701;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">
                ZANDOO
              </h1>

              <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px;">
                ${escapeHtml(sousTitre)}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">
              ${corps}
            </td>
          </tr>

          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                © ${escapeHtml(anneeCourante)} ZANDOO — Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/* ─────────────────────────────────────────────────────────────────────────────
   Template — Invitation livreur
───────────────────────────────────────────────────────────────────────────── */
function htmlInvitationLivreur({
  prenomNom,
  email,
  motDePasseTemporaire,
  lienActivation,
}) {
  const corps = `
    <h2 style="color:#011023;font-size:20px;font-weight:700;margin:0 0 16px;">
      Bienvenue, ${escapeHtml(prenomNom)} !
    </h2>

    <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Un compte livreur vous a été créé sur la plateforme
      <strong style="color:#FC7701;">ZANDOO</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:28px;">

      <tr>
        <td style="padding:24px;">

          <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#011023;text-transform:uppercase;">
            Vos identifiants
          </p>

          <table cellpadding="0" cellspacing="0">

            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:14px;min-width:130px;">
                E-mail :
              </td>

              <td style="padding:6px 0;color:#011023;font-weight:600;font-size:14px;">
                ${escapeHtml(email)}
              </td>
            </tr>

            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:14px;">
                Mot de passe :
              </td>

              <td style="padding:6px 0;">
                <code style="background:#011023;color:#FC7701;padding:4px 10px;border-radius:6px;font-size:15px;font-weight:700;letter-spacing:2px;">
                  ${escapeHtml(motDePasseTemporaire)}
                </code>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

    <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 28px;">
      ⚠️ <strong>Mot de passe temporaire.</strong>
      Vous devrez le modifier lors de la première connexion.
      Lien valable <strong>48 heures</strong>.
    </p>

    <div style="text-align:center;margin-bottom:32px;">
      <a
        href="${safeUrl(lienActivation)}"
        style="display:inline-block;background:#FC7701;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:16px;"
      >
        Activer mon compte →
      </a>
    </div>
  `;

  return htmlEnveloppe({
    titre: 'Bienvenue sur ZANDOO',
    sousTitre: 'Plateforme de livraison',
    corps,
    anneeCourante: new Date().getFullYear(),
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Template — Confirmation commande (acheteur)
───────────────────────────────────────────────────────────────────────────── */
function htmlConfirmationCommande({
  acheteurNom,
  commandes,
  groupeCommandeId,
  adresseLivraison,
}) {
  const nbCommandes = commandes.length;

  const totalGlobal = commandes.reduce(
    (acc, c) => acc + c.total,
    0
  );

  const lignesCommandes = commandes
    .map((c) => `
      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:16px;overflow:hidden;"
      >

        <tr style="background:#f8fafc;">

          <td style="padding:12px 16px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#011023;">
              ${escapeHtml(c.vendeurNom ?? 'Boutique')}
            </p>

            <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">
              N° ${escapeHtml(c.numero)}
            </p>
          </td>

          <td style="padding:12px 16px;text-align:right;">
            <p style="margin:0;font-weight:700;color:#FC7701;font-size:14px;">
              ${formatMontant(c.total)}
            </p>
          </td>

        </tr>

        ${c.lignes
          .map((l) => `
            <tr>

              <td style="padding:8px 16px;border-top:1px solid #f1f5f9;">
                <p style="margin:0;font-size:13px;color:#374151;">
                  ${escapeHtml(l.nomProduit)}
                </p>

                <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">
                  Qté : ${escapeHtml(l.quantite)}
                </p>
              </td>

              <td style="padding:8px 16px;text-align:right;border-top:1px solid #f1f5f9;">
                <p style="margin:0;font-size:13px;color:#374151;">
                  ${formatMontant(l.sousTotal)}
                </p>
              </td>

            </tr>
          `)
          .join('')}

      </table>
    `)
    .join('');

  const corps = `
    <h2 style="color:#011023;font-size:20px;font-weight:700;margin:0 0 8px;">
      Merci pour votre commande, ${escapeHtml(acheteurNom)} !
    </h2>

    <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Votre passage en caisse a généré
      <strong>
        ${escapeHtml(nbCommandes)}
        commande${nbCommandes > 1 ? 's' : ''}
      </strong>.
      Chaque vendeur prépare sa partie indépendamment.
    </p>

    ${lignesCommandes}

    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:24px;"
    >
      <tr>
        <td style="padding:16px;">

          <div style="display:flex;justify-content:space-between;">

            <span style="font-weight:700;color:#011023;font-size:16px;">
              Total global
            </span>

            <span style="font-weight:900;color:#16a34a;font-size:18px;">
              ${formatMontant(totalGlobal)}
            </span>

          </div>

        </td>
      </tr>
    </table>

    <p style="color:#4b5563;font-size:14px;margin:0 0 6px;">
      <strong>Adresse de livraison :</strong>
    </p>

    <p style="color:#374151;font-size:14px;margin:0 0 24px;">
      ${escapeHtml(adresseLivraison?.nomComplet)}
      <br>
      ${libelleLivraison(adresseLivraison)}
    </p>

    <p style="color:#6b7280;font-size:12px;">
      Référence groupe :
      <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">
        ${escapeHtml(groupeCommandeId)}
      </code>
    </p>
  `;

  return htmlEnveloppe({
    titre: 'Confirmation de commande',
    sousTitre: 'Votre commande a bien été enregistrée',
    corps,
    anneeCourante: new Date().getFullYear(),
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Template — Nouvelle commande (vendeur)
───────────────────────────────────────────────────────────────────────────── */
function htmlNouvelleCommandeVendeur({ vendeurNom, commande }) {
  const lignes = commande.lignes
    .map((l) => `
      <tr>

        <td style="padding:8px 12px;border-top:1px solid #f1f5f9;font-size:13px;color:#374151;">
          ${escapeHtml(l.nomProduit)}
        </td>

        <td style="padding:8px 12px;border-top:1px solid #f1f5f9;font-size:13px;text-align:center;color:#374151;">
          ${escapeHtml(l.quantite)}
        </td>

        <td style="padding:8px 12px;border-top:1px solid #f1f5f9;font-size:13px;text-align:right;color:#374151;">
          ${formatMontant(l.sousTotal)}
        </td>

      </tr>
    `)
    .join('');

  const corps = `
    <h2 style="color:#011023;font-size:20px;font-weight:700;margin:0 0 8px;">
      Nouvelle commande reçue !
    </h2>

    <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Bonjour <strong>${escapeHtml(vendeurNom)}</strong>,
      vous avez reçu une nouvelle commande
      <strong style="color:#FC7701;">
        ${escapeHtml(commande.numero)}
      </strong>.
    </p>

    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;"
    >

      <tr style="background:#f8fafc;">

        <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;">
          Produit
        </th>

        <th style="padding:10px 12px;text-align:center;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;">
          Qté
        </th>

        <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;">
          Montant
        </th>

      </tr>

      ${lignes}

    </table>

    <p style="font-weight:700;color:#011023;font-size:16px;text-align:right;margin:0 0 24px;">
      Total :
      <span style="color:#FC7701;">
        ${formatMontant(commande.total)}
      </span>
    </p>

    <p style="color:#4b5563;font-size:14px;margin:0 0 24px;">
      Connectez-vous à votre espace vendeur pour préparer cette commande.
    </p>
  `;

  return htmlEnveloppe({
    titre: 'Nouvelle commande',
    sousTitre: 'Espace vendeur ZANDOO',
    corps,
    anneeCourante: new Date().getFullYear(),
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Template — Changement de statut commande (acheteur)
───────────────────────────────────────────────────────────────────────────── */
const LABELS_STATUT = {
  payee: {
    label: 'Payée',
    emoji: '✅',
    couleur: '#16a34a',
  },

  en_preparation: {
    label: 'En préparation',
    emoji: '📦',
    couleur: '#2563eb',
  },

  expediee: {
    label: 'Expédiée',
    emoji: '🚚',
    couleur: '#7c3aed',
  },

  livree: {
    label: 'Livrée',
    emoji: '🎉',
    couleur: '#15803d',
  },

  annulee: {
    label: 'Annulée',
    emoji: '❌',
    couleur: '#dc2626',
  },

  remboursee: {
    label: 'Remboursée',
    emoji: '💰',
    couleur: '#d97706',
  },
};

function htmlChangementStatutAcheteur({
  acheteurNom,
  numero,
  statut,
  raison,
  vendeurNom,
}) {
  const info = LABELS_STATUT[statut] ?? {
    label: statut,
    emoji: '📋',
    couleur: '#6b7280',
  };

  const corps = `
    <h2 style="color:#011023;font-size:20px;font-weight:700;margin:0 0 16px;">
      ${info.emoji}
      Commande ${escapeHtml(info.label.toLowerCase())}
    </h2>

    <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Bonjour <strong>${escapeHtml(acheteurNom)}</strong>,
      votre commande
      <strong style="color:#FC7701;">
        ${escapeHtml(numero)}
      </strong>

      auprès de
      <strong>${escapeHtml(vendeurNom)}</strong>

      est désormais
      <strong style="color:${info.couleur};">
        ${escapeHtml(info.label.toLowerCase())}
      </strong>.
    </p>

    ${
      raison
        ? `
          <p
            style="color:#6b7280;font-size:14px;background:#f8fafc;padding:12px 16px;border-radius:8px;border-left:4px solid ${info.couleur};margin:0 0 20px;"
          >
            ${escapeHtml(raison)}
          </p>
        `
        : ''
    }

    <p style="color:#4b5563;font-size:14px;">
      Retrouvez toutes vos commandes dans votre espace personnel.
    </p>
  `;

  return htmlEnveloppe({
    titre: `Commande ${info.label}`,
    sousTitre: 'Suivi de commande ZANDOO',
    corps,
    anneeCourante: new Date().getFullYear(),
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Fonctions exportées
───────────────────────────────────────────────────────────────────────────── */

/**
 * Envoie l'email d'invitation au livreur.
 */
export async function envoyerInvitationLivreur({
  prenomNom,
  email,
  motDePasseTemporaire,
  lienActivation,
}) {
  await transporter.sendMail({
    from: EXPEDITEUR,
    to: email,
    subject: '[ZANDOO] Votre compte livreur a été créé',
    html: htmlInvitationLivreur({
      prenomNom,
      email,
      motDePasseTemporaire,
      lienActivation,
    }),
  });
}

/**
 * Envoie la confirmation de commande à l'acheteur après un checkout.
 *
 * @param {object} options
 * @param {string} options.emailAcheteur
 * @param {string} options.acheteurNom
 * @param {object[]} options.commandes
 * @param {string} options.groupeCommandeId
 * @param {object} options.adresseLivraison
 */
export async function envoyerConfirmationCommande({
  emailAcheteur,
  acheteurNom,
  commandes,
  groupeCommandeId,
  adresseLivraison,
}) {
  await transporter.sendMail({
    from: EXPEDITEUR,
    to: emailAcheteur,
    subject: `[ZANDOO] Confirmation de votre commande — ${commandes.length} boutique${commandes.length > 1 ? 's' : ''}`,
    html: htmlConfirmationCommande({
      acheteurNom,
      commandes,
      groupeCommandeId,
      adresseLivraison,
    }),
  });
}

/**
 * Notifie le vendeur d'une nouvelle commande.
 *
 * @param {object} options
 * @param {string} options.emailVendeur
 * @param {string} options.vendeurNom
 * @param {object} options.commande
 */
export async function envoyerNouvelleCommandeVendeur({
  emailVendeur,
  vendeurNom,
  commande,
}) {
  await transporter.sendMail({
    from: EXPEDITEUR,
    to: emailVendeur,
    subject: `[ZANDOO] Nouvelle commande reçue — ${commande.numero}`,
    html: htmlNouvelleCommandeVendeur({
      vendeurNom,
      commande,
    }),
  });
}

/**
 * Notifie l'acheteur d'un changement de statut sur sa commande.
 *
 * @param {object} options
 * @param {string} options.emailAcheteur
 * @param {string} options.acheteurNom
 * @param {string} options.numero
 * @param {string} options.statut
 * @param {string} [options.raison]
 * @param {string} options.vendeurNom
 */
export async function envoyerChangementStatutAcheteur({
  emailAcheteur,
  acheteurNom,
  numero,
  statut,
  raison,
  vendeurNom,
}) {
  const info = LABELS_STATUT[statut];

  if (!info) return;

  await transporter.sendMail({
    from: EXPEDITEUR,
    to: emailAcheteur,
    subject: `[ZANDOO] Votre commande ${numero} est ${info.label.toLowerCase()}`,
    html: htmlChangementStatutAcheteur({
      acheteurNom,
      numero,
      statut,
      raison,
      vendeurNom,
    }),
  });
}