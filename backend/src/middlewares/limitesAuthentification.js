import { limiteurDebit } from './limiteurDebit.js';

/**
 * Limites appliquées aux routes d'authentification.
 *
 * Deux niveaux pour la connexion :
 *  - par adresse IP : freine les attaques massives depuis une même machine ;
 *  - par compte (e-mail / téléphone visé) : verrouille temporairement un compte
 *    après plusieurs mots de passe erronés, même si l'attaquant change d'IP.
 */

const MINUTE = 60 * 1000;

/** Identifiant de compte normalisé (e-mail en minuscules, téléphone sans espaces) */
const identifiantCompte = (req) => {
  const id = String(req.body?.identifier ?? '').trim().toLowerCase().replace(/\s+/g, '');
  return id ? `compte:${id}` : null;
};

export const limiteConnexionIp = limiteurDebit({
  max: 20,
  fenetreMs: 15 * MINUTE,
  message: 'Trop de tentatives de connexion depuis cet appareil. Réessayez dans 15 minutes.',
});

export const limiteConnexionCompte = limiteurDebit({
  max: 5,
  fenetreMs: 15 * MINUTE,
  cle: identifiantCompte,
  compterEchecsSeulement: true,
  message: 'Trop de tentatives échouées sur ce compte. Par sécurité, réessayez dans 15 minutes.',
});

export const limiteInscription = limiteurDebit({
  max: 10,
  fenetreMs: 60 * MINUTE,
  message: "Trop d'inscriptions depuis cet appareil. Réessayez plus tard.",
});

export const limiteGoogle = limiteurDebit({
  max: 30,
  fenetreMs: 15 * MINUTE,
  message: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.',
});

/** Activation des comptes livreurs (jeton dans l'URL + choix du mot de passe) */
export const limiteActivation = limiteurDebit({
  max: 10,
  fenetreMs: 15 * MINUTE,
  message: 'Trop de tentatives. Réessayez dans 15 minutes.',
});
