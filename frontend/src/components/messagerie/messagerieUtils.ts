/** Utilitaires d'affichage de la messagerie (dates, prix, aperçus). */

const nf = new Intl.NumberFormat('fr-FR');

export const formatPrixMessage = (montant: number) => `${nf.format(Math.round(montant))} FCFA`;

export const formatHeure = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const memeJour = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** « Aujourd'hui », « Hier », « lundi 6 octobre »… pour les séparateurs du fil */
export function libelleJour(iso: string): string {
  const date = new Date(iso);
  const aujourdhui = new Date();
  const hier = new Date();
  hier.setDate(aujourdhui.getDate() - 1);
  if (memeJour(date, aujourdhui)) return "Aujourd'hui";
  if (memeJour(date, hier)) return 'Hier';
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
    ...(date.getFullYear() !== aujourdhui.getFullYear() ? { year: 'numeric' } : {}),
  });
}

/** Horodatage compact pour la liste : heure si aujourd'hui, « Hier », sinon date courte */
export function horodatageListe(iso: string): string {
  const date = new Date(iso);
  const aujourdhui = new Date();
  const hier = new Date();
  hier.setDate(aujourdhui.getDate() - 1);
  if (memeJour(date, aujourdhui)) return formatHeure(iso);
  if (memeJour(date, hier)) return 'Hier';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

export const memeJourIso = (a: string, b: string) => memeJour(new Date(a), new Date(b));

/** Réponses rapides proposées à l'acheteur qui arrive depuis un produit */
export const SUGGESTIONS_ACHETEUR = [
  'Bonjour, ce produit est-il toujours disponible ?',
  'Quels sont les délais de livraison ?',
  'Faites-vous un prix pour plusieurs pièces ?',
  'Avez-vous d’autres tailles ou couleurs ?',
];
