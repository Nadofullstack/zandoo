import api from '../api';
import type {
  FiltresMesCommandes,
  ReponseDetailCommande,
  ReponseMesCommandes,
  ReponseResumeCommandes,
} from '../../types/acheteur';

/** Liste paginée des commandes de l'acheteur connecté (+ compteurs par onglet). */
export async function getMesCommandes(filtres: FiltresMesCommandes = {}): Promise<ReponseMesCommandes> {
  const params = Object.fromEntries(
    Object.entries(filtres).filter(([, v]) => v !== undefined && v !== ''),
  );
  const { data } = await api.get('/acheteur/commandes', { params });
  return data;
}

/** Détail d'une commande, avec son suivi et les autres commandes du même achat. */
export async function getMaCommande(id: string): Promise<ReponseDetailCommande> {
  const { data } = await api.get(`/acheteur/commandes/${id}`);
  return data;
}

/** Annule une commande encore en attente de traitement. */
export async function annulerMaCommande(id: string, raison = ''): Promise<{ success: boolean; message: string }> {
  const { data } = await api.patch(`/acheteur/commandes/${id}/annuler`, { raison });
  return data;
}

/** Chiffres clés de l'acheteur : nombre de commandes par onglet et montant dépensé. */
export async function getResumeCommandes(): Promise<ReponseResumeCommandes> {
  const { data } = await api.get('/acheteur/commandes/resume');
  return data;
}
