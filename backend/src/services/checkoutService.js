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

/**
 * Service Checkout — logique métier du passage en caisse.
 *
 * Responsabilités :
 *  1. Valider les produits (existence, stock, vendeur approuvé).
 *  2. Regrouper les lignes par vendeur.
 *  3. Créer une commande distincte par vendeur (session Mongo).
 *  4. Décrémenter les stocks atomiquement.
 *  5. Vider le panier de l'acheteur.
 *
 * @param {object} params
 * @param {string} params.acheteurId       - ID de l'utilisateur acheteur
 * @param {object} params.adresseLivraison  - Adresse de livraison
 * @param {object} params.paiement          - Informations de paiement
 * @param {string} [params.notesClient]     - Notes optionnelles du client
 * @returns {Promise<{ commandes: Commande[], groupeCommandeId: string }>}
 */
export async function validerPanier({
  acheteurId,
  adresseLivraison,
  paiement,
  notesClient = '',
}) {
  /* ── 1. Charger le panier ─────────────────────────────────────────── */
  const panier = await Panier.findOne({ acheteur: acheteurId }).lean();
  if (!panier || panier.lignes.length === 0) {
    throw new ErreurCheckout('Votre panier est vide.', 400);
  }

  /* ── 2. Charger et valider tous les produits ──────────────────────── */
  const produitIds = [...new Set(panier.lignes.map((l) => l.produit.toString()))];
  const produits   = await Produit.find({ _id: { $in: produitIds } })
    .populate('vendeur', '_id nomEntreprise statut')
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

  /* ── 3. Regrouper les lignes par vendeur ──────────────────────────── */
  const groupes = new Map(); // vendeurId → lignes[]

  for (const ligne of panier.lignes) {
    const produit   = produitMap.get(ligne.produit.toString());
    const vendeurId = produit.vendeur._id.toString();

    if (!groupes.has(vendeurId)) groupes.set(vendeurId, []);

    groupes.get(vendeurId).push({
      produit:      produit._id,
      nomProduit:   produit.nom,
      photoProduit: produit.photoCouverture ?? null,
      reference:    produit.reference ?? '',
      variante:     ligne.variante ?? '',
      quantite:     ligne.quantite,
      prixUnitaire: produit.prixPromotionnel ?? produit.prix,
      sousTotal:    (produit.prixPromotionnel ?? produit.prix) * ligne.quantite,
    });
  }

  /* ── 4. Créer les commandes dans une session Mongo (atomique) ─────── */
  const session          = await mongoose.startSession();
  const groupeCommandeId = randomUUID();
  const commandesCrees   = [];

  try {
    await session.withTransaction(async () => {
      for (const [vendeurId, lignes] of groupes) {
        const sousTotal = lignes.reduce((acc, l) => acc + l.sousTotal, 0);
        const total     = sousTotal; // frais livraison à ajouter selon logique métier

        const [commande] = await Commande.create(
          [
            {
              groupeCommandeId,
              acheteur:          acheteurId,
              vendeur:           vendeurId,
              lignes,
              sousTotal,
              fraisLivraison:    0,
              remise:            0,
              total,
              devise:            'XOF',
              adresseLivraison,
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
