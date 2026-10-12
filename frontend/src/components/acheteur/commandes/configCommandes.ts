import type { GroupeStatut, MethodePaiement, StatutCommande } from '../../../types/acheteur';

/**
 * Présentation des commandes côté acheteur : libellés, couleurs et formatage.
 * Source unique utilisée par la liste, le détail et le suivi.
 */

export const STATUTS: Record<StatutCommande, { libelle: string; description: string; badge: string; point: string }> = {
  en_attente:     { libelle: 'En attente',     description: 'En attente de confirmation par la boutique', badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',       point: 'bg-amber-500' },
  payee:          { libelle: 'Confirmée',      description: 'Paiement confirmé, bientôt en préparation',  badge: 'bg-blue-50 text-blue-700 ring-blue-600/20',          point: 'bg-blue-500' },
  en_preparation: { libelle: 'En préparation', description: 'La boutique prépare votre colis',            badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',    point: 'bg-indigo-500' },
  expediee:       { libelle: 'Expédiée',       description: 'Votre colis est en route',                   badge: 'bg-violet-50 text-violet-700 ring-violet-600/20',    point: 'bg-violet-500' },
  livree:         { libelle: 'Livrée',         description: 'Commande livrée',                            badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', point: 'bg-emerald-500' },
  annulee:        { libelle: 'Annulée',        description: 'Commande annulée',                           badge: 'bg-gray-100 text-gray-600 ring-gray-500/20',         point: 'bg-gray-400' },
  remboursee:     { libelle: 'Remboursée',     description: 'Commande remboursée',                        badge: 'bg-gray-100 text-gray-600 ring-gray-500/20',         point: 'bg-gray-400' },
};

export const ONGLETS: { valeur?: GroupeStatut; libelle: string; cleCompteur: 'toutes' | GroupeStatut }[] = [
  { valeur: undefined,  libelle: 'Toutes',    cleCompteur: 'toutes' },
  { valeur: 'en_cours', libelle: 'En cours',  cleCompteur: 'en_cours' },
  { valeur: 'livree',   libelle: 'Livrées',   cleCompteur: 'livree' },
  { valeur: 'annulee',  libelle: 'Annulées',  cleCompteur: 'annulee' },
];

export const METHODES_PAIEMENT: Record<MethodePaiement, string> = {
  mobile_money:   'Mobile Money',
  carte_bancaire: 'Carte bancaire',
  virement:       'Virement',
  especes:        'Paiement à la livraison',
  autre:          'Autre',
};

export const MOTIFS_ANNULATION = [
  "J'ai changé d'avis",
  "J'ai trouvé moins cher ailleurs",
  'Erreur dans ma commande (article, quantité, adresse)',
  'Le délai de livraison est trop long',
];

const nf = new Intl.NumberFormat('fr-FR');

export const formatPrix = (montant: number, devise = 'XOF') =>
  `${nf.format(Math.round(montant))} ${devise === 'XOF' ? 'FCFA' : devise}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatDateHeure = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const nombreArticles = (lignes: { quantite: number }[]) =>
  lignes.reduce((total, l) => total + l.quantite, 0);
