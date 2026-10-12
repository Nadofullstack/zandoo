/**
 * Limiteur de débit en mémoire (fenêtre fixe, par adresse IP).
 *
 * Suffisant pour une instance unique. En cas de déploiement sur plusieurs
 * instances, remplacer le stockage par Redis (même interface).
 *
 * @param {object} options
 * @param {number} options.max         - Requêtes autorisées par fenêtre
 * @param {number} options.fenetreMs   - Durée de la fenêtre
 * @param {string} [options.message]   - Message renvoyé au-delà de la limite
 */
export function limiteurDebit({ max, fenetreMs, message = 'Trop de requêtes. Réessayez dans quelques minutes.' }) {
  const compteurs = new Map(); // ip → { nombre, reinitialisation }

  /* Nettoyage périodique pour ne pas accumuler les entrées expirées */
  const nettoyage = setInterval(() => {
    const maintenant = Date.now();
    for (const [ip, c] of compteurs) if (c.reinitialisation <= maintenant) compteurs.delete(ip);
  }, fenetreMs);
  nettoyage.unref?.();

  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'inconnu';
    const maintenant = Date.now();
    let c = compteurs.get(ip);

    if (!c || c.reinitialisation <= maintenant) {
      c = { nombre: 0, reinitialisation: maintenant + fenetreMs };
      compteurs.set(ip, c);
    }
    c.nombre += 1;

    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - c.nombre)));

    if (c.nombre > max) {
      res.setHeader('Retry-After', String(Math.ceil((c.reinitialisation - maintenant) / 1000)));
      return res.status(429).json({ success: false, message });
    }
    return next();
  };
}
