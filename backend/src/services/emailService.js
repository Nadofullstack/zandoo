import nodemailer from 'nodemailer';
import env from '../config/env.js';

function creerTransporteur() {
  return nodemailer.createTransport({
    host:   env.smtp.host,
    port:   env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
}


const transporter = creerTransporteur();

await transporter.verify();

console.log("✅ Serveur SMTP Gmail prêt");


const EXPEDITEUR = `"ZANDOO" <${env.smtp.user}>`;

/* ─────────────────────────────────────────────────────────────────────────────
   Template HTML — Invitation livreur
───────────────────────────────────────────────────────────────────────────── */
function htmlInvitationLivreur({ prenomNom, email, motDePasseTemporaire, lienActivation }) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenue chez ZANDOO</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(1,16,35,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#011023;padding:32px 40px;text-align:center;">
              <h1 style="color:#FC7701;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">ZANDOO</h1>
              <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px;">Plateforme de livraison</p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#011023;font-size:20px;font-weight:700;margin:0 0 16px;">Bienvenue, ${prenomNom} !</h2>
              <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Un compte livreur vous a été créé sur la plateforme <strong style="color:#FC7701;">ZANDOO</strong>.
                Vous trouverez ci-dessous vos identifiants de première connexion.
              </p>

              <!-- Encadré identifiants -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#011023;text-transform:uppercase;letter-spacing:0.05em;">Vos identifiants</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;min-width:130px;">Adresse e-mail :</td>
                        <td style="padding:6px 0;color:#011023;font-weight:600;font-size:14px;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;">Mot de passe temp. :</td>
                        <td style="padding:6px 0;">
                          <code style="background:#011023;color:#FC7701;padding:4px 10px;border-radius:6px;font-size:15px;font-weight:700;letter-spacing:2px;">${motDePasseTemporaire}</code>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 28px;">
                ⚠️ <strong>Ce mot de passe est temporaire.</strong> Vous serez obligé(e) de le changer lors de votre première connexion. Le lien ci-dessous est valable <strong>48 heures</strong>.
              </p>

              <!-- Bouton CTA -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${lienActivation}"
                   style="display:inline-block;background:#FC7701;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:16px;letter-spacing:0.3px;">
                  Activer mon compte →
                </a>
              </div>

       
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} ZANDOO — Tous droits réservés</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`.trim();
}

/* ─────────────────────────────────────────────────────────────────────────────
   Fonctions exportées
───────────────────────────────────────────────────────────────────────────── */

/**
 * Envoie l'email d'invitation au livreur avec ses identifiants temporaires.
 *
 * @param {object} options
 * @param {string} options.prenomNom        — Nom complet du livreur
 * @param {string} options.email            — Email du livreur
 * @param {string} options.motDePasseTemporaire — Mot de passe temporaire en clair
 * @param {string} options.lienActivation   — URL du lien de première connexion
 */
export async function envoyerInvitationLivreur({ prenomNom, email, motDePasseTemporaire, lienActivation }) {
  const transporteur = creerTransporteur();

  await transporteur.sendMail({
    from:    EXPEDITEUR,
    to:      email,
    subject: `[ZANDOO] Votre compte livreur a été créé`,
    html:    htmlInvitationLivreur({ prenomNom, email, motDePasseTemporaire, lienActivation }),
  });
}
