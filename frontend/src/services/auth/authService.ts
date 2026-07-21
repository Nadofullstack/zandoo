import type { RegisterPayload, AuthResponse } from '../../types/auth/auth';

const API_URL = import.meta.env.VITE_API_URL as string;

/* ─────────────────────────────────────────────────────────────────────────────
   Clé de stockage localStorage
───────────────────────────────────────────────────────────────────────────── */
const CLE_UTILISATEUR = 'utilisateur_courant';

/**
 * Persiste les informations de l'utilisateur connecté dans localStorage.
 * Ne stocke jamais le token (géré via cookie httpOnly côté backend).
 */
export function sauvegarderSession(user: AuthResponse['data']['user']): void {
  localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(user));
}

/**
 * Récupère l'utilisateur courant depuis localStorage.
 * Retourne null si aucune session n'existe.
 */
export function lireSession(): AuthResponse['data']['user'] | null {
  try {
    const raw = localStorage.getItem(CLE_UTILISATEUR);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Supprime la session locale (logout côté client).
 */
export function supprimerSession(): void {
  localStorage.removeItem(CLE_UTILISATEUR);
}

/**
 * Raccourci : lit uniquement le rôle de l'utilisateur courant.
 */
export function lireRoleSession(): string | null {
  return lireSession()?.role ?? null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Appels API
───────────────────────────────────────────────────────────────────────────── */

/**
 * Register a new user account.
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data: AuthResponse = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || 'Erreur serveur. Veuillez réessayer.');
    (err as ApiServiceError).errors = data.errors;
    throw err;
  }

  return data;
}

/**
 * Login an existing user (email or phone + password).
 * Sauvegarde automatiquement les infos user dans localStorage.
 */
export async function loginUser(identifier: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, password }),
  });

  const data: AuthResponse = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || 'Erreur serveur. Veuillez réessayer.');
    (err as ApiServiceError).errors = data.errors;
    throw err;
  }

  /* Persiste le rôle et les infos pour la garde de route */
  if (data.data?.user) {
    sauvegarderSession(data.data.user);
  }

  return data;
}

/**
 * Connexion via Google OAuth.
 * Sauvegarde automatiquement les infos user dans localStorage.
 */
export async function googleLoginUser(credential: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ credential }),
  });

  const data: AuthResponse = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || 'Erreur Google. Veuillez réessayer.');
    (err as ApiServiceError).errors = data.errors;
    throw err;
  }

  /* Persiste le rôle et les infos pour la garde de route */
  if (data.data?.user) {
    sauvegarderSession(data.data.user);
  }

  return data;
}

export interface ApiServiceError extends Error {
  errors?: { field: string; message: string }[];
}
