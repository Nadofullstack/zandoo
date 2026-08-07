import api from '../api';
import type { RegisterPayload, AuthResponse } from '../../types/auth/auth';

/* ─────────────────────────────────────────────────────────────────────────────
   Clé de stockage localStorage
───────────────────────────────────────────────────────────────────────────── */
const CLE_UTILISATEUR = 'utilisateur_courant';

export function sauvegarderSession(user: AuthResponse['data']['user']): void {
  localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(user));
}

export function lireSession(): AuthResponse['data']['user'] | null {
  try {
    const raw = localStorage.getItem(CLE_UTILISATEUR);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function supprimerSession(): void {
  localStorage.removeItem(CLE_UTILISATEUR);
}

export function lireRoleSession(): string | null {
  return lireSession()?.role ?? null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Appels API
───────────────────────────────────────────────────────────────────────────── */

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function loginUser(identifier: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { identifier, password });
  if (data.data?.user) sauvegarderSession(data.data.user);
  return data;
}

export async function googleLoginUser(credential: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/google', { credential });
  if (data.data?.user) sauvegarderSession(data.data.user);
  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    // Supprime la session locale dans tous les cas (même si le réseau échoue)
    supprimerSession();
  }
}

/**
 * Rafraîchit la session localStorage depuis l'API.
 * À appeler après des événements qui changent le profil (ex : approbation boutique).
 * Retourne l'utilisateur mis à jour, ou null si non connecté.
 */
export async function rafraichirSession(): Promise<AuthResponse['data']['user'] | null> {
  try {
    const { data } = await api.get<AuthResponse>('/auth/me');
    if (data.data?.user) {
      sauvegarderSession(data.data.user);
      return data.data.user;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Met à jour le profil de l'utilisateur connecté.
 * Retourne l'utilisateur mis à jour et rafraîchit la session localStorage.
 */
export async function mettreAJourProfil(
  payload: { fullName: string; phone: string }
): Promise<AuthResponse['data']['user']> {
  const { data } = await api.put<AuthResponse>('/auth/me', payload);
  if (data.data?.user) sauvegarderSession(data.data.user);
  return data.data.user;
}

export interface ApiServiceError extends Error {
  errors?: { field: string; message: string }[];
}
