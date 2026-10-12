import api from '../api';

export interface PageResume {
  _id: string;
  slug: string;
  titre: string;
  ordre: number;
}

export interface PageContenu {
  _id: string;
  slug: string;
  titre: string;
  contenu: string;
  metaTitre?: string;
  metaDescription?: string;
  updatedAt: string;
}

export type SujetContact = 'commande' | 'vendeur' | 'partenariat' | 'technique' | 'autre';

export interface MessageContact {
  nom: string;
  email: string;
  telephone?: string;
  sujet: SujetContact;
  message: string;
  /** Champ piège anti-robots : toujours vide pour un humain */
  site?: string;
}

/** Pages de contenu publiées (pied de page). */
export async function getPagesPubliees(): Promise<PageResume[]> {
  const { data } = await api.get('/acheteur/pages');
  return data.data.pages;
}

/** Contenu d'une page publiée. */
export async function getPage(slug: string): Promise<PageContenu> {
  const { data } = await api.get(`/acheteur/pages/${encodeURIComponent(slug)}`);
  return data.data.page;
}

/** Envoie un message via le formulaire de contact. */
export async function envoyerMessageContact(message: MessageContact): Promise<string> {
  const { data } = await api.post('/acheteur/contact', message);
  return data.message;
}
