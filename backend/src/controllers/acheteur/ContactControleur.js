import { envoyerMessageContact } from '../../services/emailService.js';

/**
 * POST /api/acheteur/contact
 * Body : { nom, email, telephone?, sujet, message, site? }
 *
 * `site` est un champ piège invisible pour les humains : s'il est rempli,
 * l'envoi provient d'un robot — on répond « succès » sans rien envoyer.
 */

const SUJETS = ['commande', 'vendeur', 'partenariat', 'technique', 'autre'];
const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const contacter = async (req, res) => {
  try {
    const corps = req.body ?? {};
    if (corps.site) return res.status(200).json({ success: true, message: 'Message envoyé.' });

    const nom       = String(corps.nom ?? '').trim().slice(0, 100);
    const email     = String(corps.email ?? '').trim().toLowerCase().slice(0, 150);
    const telephone = String(corps.telephone ?? '').trim().slice(0, 30);
    const sujet     = SUJETS.includes(corps.sujet) ? corps.sujet : 'autre';
    const message   = String(corps.message ?? '').trim().slice(0, 3000);

    if (nom.length < 2)            return res.status(422).json({ success: false, message: 'Indiquez votre nom.' });
    if (!EMAIL_VALIDE.test(email)) return res.status(422).json({ success: false, message: 'Adresse e-mail invalide.' });
    if (message.length < 10)       return res.status(422).json({ success: false, message: 'Votre message doit contenir au moins 10 caractères.' });

    await envoyerMessageContact({ nom, email, telephone, sujet, message });

    return res.status(200).json({ success: true, message: 'Merci ! Votre message a bien été envoyé.' });
  } catch (erreur) {
    console.error('Erreur contacter:', erreur.message);
    return res.status(502).json({ success: false, message: "L'envoi a échoué. Réessayez dans quelques instants ou écrivez-nous directement par e-mail." });
  }
};
