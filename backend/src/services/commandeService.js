import mongoose from 'mongoose';
import { notifierAnnulationVendeur } from './notificationService.js';
import Commande from '../models/Commande.js';
import Produit from '../models/Produit.js';
import Vendeur from '../models/Vendeur.js';
import { envoyerAnnulationCommandeVendeur } from './emailService.js';

/**
 * Logique métier des commandes, partagée entre les espaces acheteur, vendeur et admin.
 *
 * Les contrôleurs ne manipulent pas directement les statuts : ils passent par
 * ce service, qui garantit la cohérence (historique, dates clés, stocks).
 */

/* ── Regroupements de statuts exposés à l'acheteur ───────────────────────── */

export const GROUPES_STATUT = {
  en_cours: ['en_attente', 'payee', 'en_preparation', 'expediee'],
  livree:   ['livree'],
  annulee:  ['annulee', 'remboursee'],
};

/** Statuts dans lesquels l'acheteur peut encore annuler lui-même sa commande */
export const STATUTS_ANNULABLES_ACHETEUR = ['en_attente'];

/** Statuts dans lesquels le vendeur peut annuler la commande */
export const STATUTS_ANNULABLES_VENDEUR = ['en_attente', 'payee'];

/**
 * Statuts dans lesquels l'admin peut annuler : tant que la marchandise n'est pas
 * livrée, elle revient en stock. Une commande livrée se traite par remboursement.
 */
export const STATUTS_ANNULABLES_ADMIN = ['en_attente', 'payee', 'en_preparation', 'expediee'];

/** Statuts terminaux : plus aucune transition possible (évite une double remise en stock) */
export const STATUTS_TERMINAUX = ['annulee', 'remboursee'];

export const peutEtreAnnuleeParAcheteur = (commande) =>
  STATUTS_ANNULABLES_ACHETEUR.includes(commande.statut);

/* ── Suivi : chronologie lisible pour l'acheteur ─────────────────────────── */

const ETAPES_SUIVI = [
  { statut: 'en_attente',     libelle: 'Commande passée',     champDate: 'createdAt' },
  { statut: 'payee',          libelle: 'Paiement confirmé',   champDate: 'payeeAt' },
  { statut: 'en_preparation', libelle: 'En préparation',      champDate: 'enPreparationAt' },
  { statut: 'expediee',       libelle: 'Expédiée',            champDate: 'expedieeAt' },
  { statut: 'livree',         libelle: 'Livrée',              champDate: 'livreeAt' },
];

/**
 * Construit les étapes de suivi d'une commande.
 * Chaque étape a un état : 'terminee' | 'actuelle' (prochaine étape attendue) | 'a_venir' | 'annulee'.
 * Une commande annulée/remboursée s'arrête à la dernière étape atteinte,
 * suivie d'une étape terminale « Annulée » ou « Remboursée ».
 */
export const construireSuivi = (commande) => {
  const historique = commande.historiqueStatut ?? [];
  const dateHistorique = (statut) =>
    historique.filter((h) => h.statut === statut).at(-1)?.modifieAt ?? null;

  const estTerminale = commande.statut === 'annulee' || commande.statut === 'remboursee';

  /* Index de la dernière étape atteinte (via la date ou l'historique) */
  const indexAtteint = ETAPES_SUIVI.reduce((dernier, etape, i) => {
    const atteinte = commande[etape.champDate] || dateHistorique(etape.statut) || etape.statut === commande.statut;
    return atteinte ? i : dernier;
  }, 0);

  const etapes = ETAPES_SUIVI.map((etape, i) => {
    let etat = 'a_venir';
    if (i <= indexAtteint) etat = 'terminee';
    else if (i === indexAtteint + 1 && !estTerminale) etat = 'actuelle';

    return {
      statut:  etape.statut,
      libelle: etape.libelle,
      etat,
      date:    etat === 'terminee' ? (commande[etape.champDate] ?? dateHistorique(etape.statut)) : null,
    };
  });

  if (estTerminale) {
    const finale = commande.statut;
    const derniere = historique.filter((h) => h.statut === finale).at(-1);
    return [
      ...etapes.slice(0, indexAtteint + 1),
      {
        statut:  finale,
        libelle: finale === 'annulee' ? 'Annulée' : 'Remboursée',
        etat:    'annulee',
        date:    commande[finale === 'annulee' ? 'annuleeAt' : 'remboureeAt'] ?? derniere?.modifieAt ?? null,
        raison:  derniere?.raison || null,
      },
    ];
  }

  return etapes;
};

/* ── Annulation ─────────────────────────────────────────────────────────── */

export class ErreurCommande extends Error {
  constructor(message, status = 422) {
    super(message);
    this.status = status;
  }
}

/** Statut de stock d'un produit selon sa quantité (même règle que le checkout) */
const statutStock = (quantite) => {
  if (quantite <= 0) return 'en_rupture';
  if (quantite <= 5) return 'faible';
  return 'en_stock';
};

/**
 * Annule une commande et remet les quantités en stock, de façon atomique.
 *
 * @param {object} params
 * @param {object} params.filtre           - Filtre de propriété (ex: { _id, acheteur }) — garantit l'autorisation
 * @param {string[]} params.statutsAutorises - Statuts depuis lesquels l'annulation est permise
 * @param {string} params.auteurId         - Utilisateur à l'origine de l'annulation
 * @param {string} [params.raison]
 * @returns {Promise<object>} La commande annulée
 */
export async function annulerCommande({ filtre, statutsAutorises, auteurId, raison = '' }) {
  const session = await mongoose.startSession();
  let commandeAnnulee;

  try {
    await session.withTransaction(async () => {
      const commande = await Commande.findOne(filtre).session(session);
      if (!commande) throw new ErreurCommande('Commande introuvable.', 404);

      if (!statutsAutorises.includes(commande.statut)) {
        throw new ErreurCommande(`Cette commande ne peut plus être annulée (statut : ${commande.statut}).`, 409);
      }

      const maintenant = new Date();
      commande.statut    = 'annulee';
      commande.annuleeAt = maintenant;
      commande.historiqueStatut.push({
        statut:     'annulee',
        modifiePar: auteurId,
        raison:     String(raison).trim().slice(0, 300),
        modifieAt:  maintenant,
      });
      await commande.save({ session });

      /* Remise en stock des quantités commandées */
      for (const ligne of commande.lignes) {
        const produit = await Produit.findOneAndUpdate(
          { _id: ligne.produit },
          { $inc: { quantiteDisponible: ligne.quantite } },
          { returnDocument: 'after', session },
        );
        if (produit) {
          await Produit.updateOne(
            { _id: produit._id },
            { statut: statutStock(produit.quantiteDisponible), enStock: produit.quantiteDisponible > 0 },
            { session },
          );
        }
      }

      commandeAnnulee = commande;
    });
  } finally {
    await session.endSession();
  }

  return commandeAnnulee;
}

/* ── Notifications ──────────────────────────────────────────────────────── */

/**
 * Prévient la boutique qu'une commande a été annulée (best-effort : un échec
 * d'envoi est journalisé mais n'annule jamais l'opération métier).
 *
 * @param {object} commande - Document commande (numero, total, lignes, vendeur)
 * @param {'acheteur'|'admin'} auteur
 * @param {string} [raison]
 */
export async function notifierVendeurAnnulation(commande, auteur, raison = '') {
  try {
    const vendeur = await Vendeur.findById(commande.vendeur)
      .select('nomEntreprise emailContact utilisateur')
      .populate('utilisateur', 'email')
      .lean();

    notifierAnnulationVendeur({ vendeurUtilisateur: vendeur?.utilisateur?._id, numero: commande.numero, auteur });

    const emailVendeur = vendeur?.emailContact || vendeur?.utilisateur?.email;
    if (!emailVendeur) return;

    await envoyerAnnulationCommandeVendeur({
      emailVendeur,
      vendeurNom: vendeur.nomEntreprise,
      commande:   { numero: commande.numero, total: commande.total, lignes: commande.lignes },
      auteur,
      raison:     String(raison).trim() || undefined,
    });
  } catch (erreur) {
    console.error('Email annulation vendeur:', erreur.message);
  }
}
