import api from '../api';
import type {
  ReponseListeLivreursVendeur,
  ReponseLivreurVendeur,
  ReponseStatistiquesLivreursVendeur,
  ReponseCreationLivreurVendeur,
  StatutLivreurVendeur,
  FormulaireCreationLivreurVendeur,
} from '../../types/vendeur/livreur';

export async function getStatistiquesLivreurs(): Promise<ReponseStatistiquesLivreursVendeur> {
  const { data } = await api.get('/vendeur/livreurs/statistiques');
  return data;
}

export async function getMesLivreurs(params?: {
  statut?: StatutLivreurVendeur;
  recherche?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeLivreursVendeur> {
  const { data } = await api.get('/vendeur/livreurs', { params });
  return data;
}

export async function getLivreurParId(id: string): Promise<ReponseLivreurVendeur> {
  const { data } = await api.get(`/vendeur/livreurs/${id}`);
  return data;
}

export async function creerLivreur(
  donnees: FormulaireCreationLivreurVendeur
): Promise<ReponseCreationLivreurVendeur> {
  const { data } = await api.post('/vendeur/livreurs', donnees);
  return data;
}

export async function modifierStatutLivreur(
  id: string,
  statut: StatutLivreurVendeur,
  raison?: string
): Promise<ReponseLivreurVendeur> {
  const { data } = await api.patch(`/vendeur/livreurs/${id}/statut`, {
    statut,
    raison: raison ?? '',
  });
  return data;
}

export async function renvoyerInvitationLivreur(
  id: string
): Promise<{ success: boolean; message: string; data: { lienActivation: string } }> {
  const { data } = await api.post(`/vendeur/livreurs/${id}/renvoyer-invitation`);
  return data;
}

export async function supprimerLivreur(
  id: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/vendeur/livreurs/${id}`);
  return data;
}
