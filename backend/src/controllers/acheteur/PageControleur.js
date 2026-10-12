import PageStatique from '../../models/PageStatique.js';

/**
 * Pages de contenu publiées (CGU, confidentialité, à propos…) — publiques.
 *   GET /api/acheteur/pages         — liste pour le pied de page
 *   GET /api/acheteur/pages/:slug   — contenu d'une page
 */

export const getPagesPubliees = async (_req, res) => {
  try {
    const pages = await PageStatique.find({ publiee: true })
      .select('slug titre ordre')
      .sort({ ordre: 1, titre: 1 })
      .lean();
    return res.status(200).json({ success: true, data: { pages } });
  } catch (erreur) {
    console.error('Erreur getPagesPubliees:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

export const getPagePubliee = async (req, res) => {
  try {
    const slug = String(req.params.slug).toLowerCase();
    if (!/^[a-z0-9-]{1,100}$/.test(slug)) {
      return res.status(404).json({ success: false, message: 'Page introuvable.' });
    }

    const page = await PageStatique.findOne({ slug, publiee: true })
      .select('slug titre contenu metaTitre metaDescription updatedAt')
      .lean();
    if (!page) return res.status(404).json({ success: false, message: 'Page introuvable.' });

    return res.status(200).json({ success: true, data: { page } });
  } catch (erreur) {
    console.error('Erreur getPagePubliee:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
