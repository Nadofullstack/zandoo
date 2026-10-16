/**
 * Limiteur de débit en mémoire (fenêtre fixe).
 *
 * Suffisant pour une instance unique. En cas de déploiement sur plusieurs
 * instances, remplacer le stockage par Redis (même interface).
 *
 * Derrière un proxy (Render, Nginx, Cloudflare…), `req.ip` n'est fiable que si
 * `app.set('trust proxy', …)` est configuré — voir TRUST_PROXY dans server.js.
 *
 * @param {object}   options
 * @param {number}   options.max                 - Requêtes autorisées par fenêtre
 * @param {number}   options.fenetreMs           - Durée de la fenêtre
 * @param {string}   [options.message]           - Message renvoyé au-delà de la limite
 * @param {Function} [options.cle]               - (req) => clé de comptage ; défaut : adresse IP.
 *                                                 Renvoyer null pour ne pas limiter la requête.
 * @param {boolean}  [options.compterEchecsSeulement] - Ne compte que les réponses en erreur (≥ 400) :
 *                                                 idéal pour verrouiller un compte après des
 *                                                 mots de passe erronés sans gêner les succès.
 */
export function limiteurDebit({
  max,
  fenetreMs,
  message = 'Trop de requêtes. Réessayez dans quelques minutes.',
  cle = (req) => req.ip || req.socket?.remoteAddress || 'inconnu',
  compterEchecsSeulement = false,
}) {
  const compteurs = new Map(); // clé → { nombre, reinitialisation }

  /* Nettoyage périodique pour ne pas accumuler les entrées expirées */
  const nettoyage = setInterval(() => {
    const maintenant = Date.now();
    for (const [k, c] of compteurs) if (c.reinitialisation <= maintenant) compteurs.delete(k);
  }, fenetreMs);
  nettoyage.unref?.();

  const lire = (k, maintenant) => {
    let c = compteurs.get(k);
    if (!c || c.reinitialisation <= maintenant) {
      c = { nombre: 0, reinitialisation: maintenant + fenetreMs };
      compteurs.set(k, c);
    }
    return c;
  };

  return (req, res, next) => {
    const k = cle(req);
    if (k === null || k === undefined || k === '') return next();

    const maintenant = Date.now();
    const c = lire(k, maintenant);

    if (c.nombre >= max) {
      res.setHeader('Retry-After', String(Math.ceil((c.reinitialisation - maintenant) / 1000)));
      return res.status(429).json({ success: false, message });
    }

    if (compterEchecsSeulement) {
      /* Le compteur n'augmente qu'une fois la réponse connue, et seulement en cas d'échec */
      res.on('finish', () => {
        if (res.statusCode >= 400 && res.statusCode !== 429) lire(k, Date.now()).nombre += 1;
      });
    } else {
      c.nombre += 1;
      res.setHeader('RateLimit-Limit', String(max));
      res.setHeader('RateLimit-Remaining', String(Math.max(0, max - c.nombre)));
    }

    return next();
  };
}
