import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import Panier from '../models/Panier.js';
import Produit from '../models/Produit.js';
import Commande from '../models/Commande.js';
import Vendeur from '../models/Vendeur.js';
import User from '../models/User.js';
import {
  envoyerConfirmationCommande,
  envoyerNouvelleCommandeVendeur,
} from './emailService.js';
import { calculerOptionsLivraison, resoudreLivraison, ErreurLivraison } from './livraisonService.js';

/**
 * Service Checkout — logique métier du passage en caisse.
 *
 * Responsabilités :
 *  1. Valider les produits (existence, stock, vendeur approuvé).
 *  2. Regrouper les lignes par vendeur (une commande = une boutique).
 *  3. Calculer les frais de livraison de chaque boutique (tarifs du vendeur).
 *  4. Créer une commande distincte par vendeur (session Mongo).
 *  5. Décrémenter les stocks atomiquement.
 *  6. Vider le panier de l'acheteur.
 */

/**
 * Charge le panier de l'acheteur, valide les produits et regroupe les lignes par boutique.
 *
 * @returns {Promise<{ panier, produitMap: Map, groupes: Map<string, { vendeur, lignes, sousTotal }> }>}
 */
async function chargerPanierParBoutique(acheteurId) {
  const panier = await Panier.findOne({ acheteur: acheteurId }).lean();
  if (!panier || panier.lignes.length === 0) {
    throw new ErreurCheckout('Votre panier est vide.', 400);
  }

  const produitIds = [...new Set(panier.lignes.map((l) => l.produit.toString()))];
  const produits   = await Produit.find({ _id: { $in: produitIds } })
    .populate('vendeur', '_id nomEntreprise statut livraison')
    .lean();

  const produitMap = new Map(produits.map((p) => [p._id.toString(), p]));

  const erreursStock = [];
  for (const ligne of panier.lignes) {
    const produit = produitMap.get(ligne.produit.toString());

    if (!produit) {
      erreursStock.push(`Produit introuvable (id: ${ligne.produit}).`);
      continue;
    }
    if (!produit.vendeur || produit.vendeur.statut !== 'approuve') {
      erreursStock.push(`La boutique du produit « ${produit.nom} » n'est plus disponible.`);
      continue;
    }
    if (produit.quantiteDisponible < ligne.quantite) {
      erreursStock.push(
        `Stock insuffisant pour « ${produit.nom} » (disponible : ${produit.quantiteDisponible}, demandé : ${ligne.quantite}).`
      );
    }
  }
  if (erreursStock.length > 0) {
    throw new ErreurCheckout(erreursStock.join(' | '), 422);
  }

  const groupes = new Map(); // vendeurId → { vendeur, lignes[], sousTotal }
  for (const ligne of panier.lignes) {
    const produit   = produitMap.get(ligne.produit.toString());
    const vendeurId = produit.vendeur._id.toString();
    const prix      = produit.prixPromotionnel ?? produit.prix;

    if (!groupes.has(vendeurId)) groupes.set(vendeurId, { vendeur: produit.vendeur, lignes: [], sousTotal: 0 });
    const groupe = groupes.get(vendeurId);

    groupe.lignes.push({
      produit:      produit._id,
      nomProduit:   produit.nom,
      photoProduit: produit.photoCouverture ?? null,
      reference:    produit.reference ?? '',
      variante:     ligne.variante ?? '',
      quantite:     ligne.quantite,
      prixUnitaire: prix,
      sousTotal:    prix * ligne.quantite,
    });
    groupe.sousTotal += prix * ligne.quantite;
  }

  return { panier, produitMap, groupes };
}

/**
 * Options de livraison de chaque boutique du panier, pour une ville donnée.
 * Utilisé par le tunnel de commande pour afficher les choix et les frais.
 *
 * @returns {Promise<Array<{ vendeur, sousTotal, nombreArticles, options }>>}
 */
export async function calculerOptionsCheckout({ acheteurId, ville }) {
  const { groupes } = await chargerPanierParBoutique(acheteurId);

  return [...groupes.values()].map(({ vendeur, lignes, sousTotal }) => ({
    vendeur:        { _id: vendeur._id, nomEntreprise: vendeur.nomEntreprise },
    sousTotal,
    nombreArticles: lignes.reduce((n, l) => n + l.quantite, 0),
    options:        calculerOptionsLivraison(vendeur.livraison, { ville, sousTotal }),
  }));
}

/**
 * Passage en caisse : crée une commande par boutique.
 *
 * @param {object} params
 * @param {string} params.acheteurId
 * @param {object} params.adresseLivraison
 * @param {object} params.paiement
 * @param {Object<string, 'domicile'|'retrait'>} [params.livraisons] - Mode choisi par boutique (vendeurId → mode).
 *        Par défaut : domicile. Les frais sont toujours recalculés ici, jamais repris du client.
 * @param {string} [params.notesClient]
 * @returns {Promise<{ commandes: Commande[], groupeCommandeId: string }>}
 */
export async function validerPanier({
  acheteurId,
  adresseLivraison,
  paiement,
  livraisons = {},
  notesClient = '',
}) {
  /* ── 1-2. Panier validé et regroupé par boutique ──────────────────── */
  const { panier, produitMap, groupes } = await chargerPanierParBoutique(acheteurId);

  /* ── 3. Frais de livraison par boutique (avant toute écriture) ────── */
  const livraisonParVendeur = new Map();
  try {
    for (const [vendeurId, { vendeur, sousTotal }] of groupes) {
      livraisonParVendeur.set(vendeurId, resoudreLivraison(vendeur.livraison, {
        ville:       adresseLivraison.ville,
        sousTotal,
        mode:        livraisons[vendeurId] ?? 'domicile',
        nomBoutique: vendeur.nomEntreprise,
      }));
    }
  } catch (erreur) {
    if (erreur instanceof ErreurLivraison) throw new ErreurCheckout(erreur.message, 422);
    throw erreur;
  }

  /* ── 4. Créer les commandes dans une session Mongo (atomique) ─────── */
  const session          = await mongoose.startSession();
  const groupeCommandeId = randomUUID();
  const commandesCrees   = [];

  try {
    await session.withTransaction(async () => {
      for (const [vendeurId, { lignes, sousTotal }] of groupes) {
        const { fraisLivraison, livraison } = livraisonParVendeur.get(vendeurId);
        const total = sousTotal + fraisLivraison;

        const [commande] = await Commande.create(
          [
            {
              groupeCommandeId,
              acheteur:          acheteurId,
              vendeur:           vendeurId,
              lignes,
              sousTotal,
              fraisLivraison,
              remise:            0,
              total,
              devise:            'XOF',
              adresseLivraison,
              livraison,
              paiement: {
                ...paiement,
                montant: total,
              },
              notesClient:       notesClient.trim().slice(0, 500),
              statut:            'en_attente',
              historiqueStatut: [
                {
                  statut:    'en_attente',
                  raison:    'Commande créée lors du passage en caisse.',
                  modifieAt: new Date(),
                },
              ],
            },
          ],
          { session }
        );

        commandesCrees.push(commande);
      }

      /* ── 5. Décrémenter les stocks atomiquement ─────────────────── */
      const operations = panier.lignes.map((ligne) => ({
        updateOne: {
          filter: {
            _id:                ligne.produit,
            quantiteDisponible: { $gte: ligne.quantite },
          },
          update: {
            $inc: { quantiteDisponible: -ligne.quantite },
          },
        },
      }));

      const resultat = await Produit.bulkWrite(operations, { session });

      /* Vérifier que tous les stocks ont bien été mis à jour */
      if (resultat.modifiedCount !== panier.lignes.length) {
        throw new ErreurCheckout(
          'Stock insuffisant pour un ou plusieurs produits (concurrent). Veuillez rafraîchir votre panier.',
          409
        );
      }

      /* Mettre à jour les statuts de stock des produits concernés */
      for (const ligne of panier.lignes) {
        const produit = produitMap.get(ligne.produit.toString());
        const nouvelleQte = produit.quantiteDisponible - ligne.quantite;

        let nouveauStatut = 'en_stock';
        if (nouvelleQte === 0)      nouveauStatut = 'en_rupture';
        else if (nouvelleQte <= 5)  nouveauStatut = 'faible';

        await Produit.updateOne(
          { _id: ligne.produit },
          { statut: nouveauStatut, enStock: nouvelleQte > 0 },
          { session }
        );
      }

      /* ── 6. Vider le panier ──────────────────────────────────────── */
      await Panier.updateOne(
        { acheteur: acheteurId },
        { $set: { lignes: [], derniereActivite: new Date() } },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  return { commandes: commandesCrees, groupeCommandeId };
}

/**
 * Envoie les notifications email post-checkout (hors transaction, best-effort).
 * Appelé après que la transaction Mongo ait réussi.
 */
export async function envoyerEmailsCheckout({ acheteurId, commandesCrees, groupeCommandeId, adresseLivraison }) {
  try {
    const acheteur = await User.findById(acheteurId).select('email fullName').lean();
    if (!acheteur) return;

    /* Enrichir les commandes avec les infos vendeur pour les emails */
    const commandesAvecVendeur = await Promise.all(
      commandesCrees.map(async (cmd) => {
        const vendeur = await Vendeur.findById(cmd.vendeur).select('nomEntreprise emailContact').lean();
        return {
          _id:        cmd._id,
          numero:     cmd.numero,
          total:      cmd.total,
          lignes:     cmd.lignes,
          vendeurNom: vendeur?.nomEntreprise ?? 'Boutique',
          vendeurEmail: vendeur?.emailContact ?? null,
        };
      })
    );

    /* Email de confirmation à l'acheteur */
    envoyerConfirmationCommande({
      emailAcheteur:   acheteur.email,
      acheteurNom:     acheteur.fullName,
      commandes:       commandesAvecVendeur,
      groupeCommandeId,
      adresseLivraison,
    }).catch((err) => console.error('Email confirmation acheteur:', err.message));

    /* Email à chaque vendeur */
    for (const cmd of commandesAvecVendeur) {
      if (cmd.vendeurEmail) {
        envoyerNouvelleCommandeVendeur({
          emailVendeur: cmd.vendeurEmail,
          vendeurNom:   cmd.vendeurNom,
          commande:     { numero: cmd.numero, total: cmd.total, lignes: cmd.lignes },
        }).catch((err) => console.error(`Email vendeur (${cmd.vendeurNom}):`, err.message));
      }
    }
  } catch (err) {
    console.error('Erreur envoyerEmailsCheckout:', err.message);
  }
}

/* ── Erreur métier checkout ────────────────────────────────────────────── */
export class ErreurCheckout extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name       = 'ErreurCheckout';
    this.statusCode = statusCode;
  }
}
