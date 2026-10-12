import api from '../api';
import type { ChampsAdresse, ReponseAdresses } from '../../types/acheteur';

/** Carnet d'adresses de l'utilisateur connecté (adresse par défaut en premier). */
export async function getMesAdresses(): Promise<ReponseAdresses> {
  const { data } = await api.get('/acheteur/adresses');
  return data;
}

export async function ajouterAdresse(adresse: ChampsAdresse & { parDefaut?: boolean }): Promise<ReponseAdresses> {
  const { data } = await api.post('/acheteur/adresses', adresse);
  return data;
}

export async function modifierAdresse(id: string, adresse: Partial<ChampsAdresse> & { parDefaut?: boolean }): Promise<ReponseAdresses> {
  const { data } = await api.put(`/acheteur/adresses/${id}`, adresse);
  return data;
}

export async function definirAdresseParDefaut(id: string): Promise<ReponseAdresses> {
  const { data } = await api.patch(`/acheteur/adresses/${id}/par-defaut`);
  return data;
}

export async function supprimerAdresse(id: string): Promise<ReponseAdresses> {
  const { data } = await api.delete(`/acheteur/adresses/${id}`);
  return data;
}
