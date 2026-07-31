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

export interface ApiServiceError extends Error {
  errors?: { field: string; message: string }[];
}
