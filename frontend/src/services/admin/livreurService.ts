import api from '../api';
import type { ReponseVerificationToken } from '../../types/admin';

export async function verifierTokenActivation(
  token: string
): Promise<ReponseVerificationToken> {
  const { data } = await api.get(`/livreur/activation/${token}/verifier`);
  return data;
}

export async function changerMotDePasseInitial(
  token: string,
  motDePasseTemp: string,
  nouveauMotDePasse: string,
  confirmationMotDePasse: string
): Promise<{
  success: boolean;
  message: string;
  data: { user: { id: string; fullName: string; email: string; phone: string; role: string }; token: string };
}> {
  const { data } = await api.post(`/livreur/activation/${token}/changer-mot-de-passe`, {
    motDePasseTemp,
    nouveauMotDePasse,
    confirmationMotDePasse,
  });
  return data;
}

export async function completerProfilLivreur(donnees: {
  telephone: string;
  typeVehicule: string;
  numeroplaque: string;
  villeService: string;
  zonelivraison: string;
}) {
  const { data } = await api.put('/livreur/profil', donnees);
  return data;
}

export async function getMonProfilLivreur() {
  const { data } = await api.get('/livreur/profil');
  return data;
}
