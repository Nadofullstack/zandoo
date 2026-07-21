import type { ReponseVerificationToken } from '../../types/admin';

const API_URL = import.meta.env.VITE_API_URL as string;

const optionsBase: RequestInit = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

async function verifierReponse<T>(res: Response): Promise<T> {
  const donnees = await res.json();
  if (!res.ok) throw new Error(donnees.message || 'Erreur serveur.');
  return donnees as T;
}

/**
 * Vérifie si un token d'activation est valide (sans le consommer).
 */
export async function verifierTokenActivation(
  token: string
): Promise<ReponseVerificationToken> {
  const res = await fetch(`${API_URL}/livreur/activation/${token}/verifier`, optionsBase);
  return verifierReponse<ReponseVerificationToken>(res);
}

/**
 * Changement du mot de passe initial lors de la première connexion.
 * Le champ `phone` est inclus (vide par défaut) pour satisfaire AuthUser.
 */
export async function changerMotDePasseInitial(
  token: string,
  motDePasseTemp: string,
  nouveauMotDePasse: string,
  confirmationMotDePasse: string
): Promise<{ success: boolean; message: string; data: { user: { id: string; fullName: string; email: string; phone: string; role: string }; token: string } }> {
  const res = await fetch(`${API_URL}/livreur/activation/${token}/changer-mot-de-passe`, {
    ...optionsBase,
    method: 'POST',
    body:   JSON.stringify({ motDePasseTemp, nouveauMotDePasse, confirmationMotDePasse }),
  });
  return verifierReponse(res);
}

/**
 * Complétion du profil livreur (nécessite d'être connecté).
 */
export async function completerProfilLivreur(donnees: {
  telephone: string;
  typeVehicule: string;
  numeroplaque: string;
  villeService: string;
  zonelivraison: string;
}) {
  const res = await fetch(`${API_URL}/livreur/profil`, {
    ...optionsBase,
    method: 'PUT',
    body:   JSON.stringify(donnees),
  });
  return verifierReponse(res);
}

/**
 * Récupère le profil du livreur connecté.
 */
export async function getMonProfilLivreur() {
  const res = await fetch(`${API_URL}/livreur/profil`, optionsBase);
  return verifierReponse(res);
}
