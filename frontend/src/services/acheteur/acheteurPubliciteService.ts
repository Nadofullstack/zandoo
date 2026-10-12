/**
 * Mesure d'audience des campagnes publicitaires.
 *
 * Requêtes « fire and forget » avec `keepalive` : elles aboutissent même si
 * l'utilisateur quitte la page juste après le clic. Un échec est silencieux,
 * la mesure ne doit jamais gêner la navigation.
 */

const BASE = `${import.meta.env.VITE_API_URL as string}/acheteur/publicites`;

const envoyer = (chemin: string, corps?: unknown) => {
  try {
    void fetch(`${BASE}${chemin}`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: corps ? JSON.stringify(corps) : undefined,
    }).catch(() => {});
  } catch {
    /* environnement sans fetch : ignoré */
  }
};

/** Signale un lot de campagnes réellement affichées à l'écran. */
export const signalerImpressions = (ids: string[]) => {
  if (ids.length) envoyer('/impressions', { ids });
};

/** Signale un clic sur une campagne. */
export const signalerClic = (id: string) => envoyer(`/${id}/clic`);
