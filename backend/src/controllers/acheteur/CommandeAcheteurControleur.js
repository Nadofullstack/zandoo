import mongoose from 'mongoose';
import Commande from '../../models/Commande.js';
import {
  GROUPES_STATUT,
  STATUTS_ANNULABLES_ACHETEUR,
  ErreurCommande,
  annulerCommande,
  construireSuivi,
  notifierVendeurAnnulation,
  peutEtreAnnuleeParAcheteur,
} from '../../services/commandeService.js';

/** Champs internes jamais exposés à l'acheteur */
const PROJECTION_ACHETEUR = {
  notesAdmin:         0,
  notesVendeur:       0,
  adresseFacturation: 0,
  'paiement.reference': 0,
};

/**
 * Compteurs par onglet + montant total dépensé (hors commandes annulées/remboursées),
 * en une seule agrégation.
 */
const calculerResume = async (acheteur) => {
  const parStatutBrut = await Commande.aggregate([
    { $match: { acheteur } },
    { $group: { _id: '$statut', n: { $sum: 1 }, montant: { $sum: '$total' } } },
  ]);

  const parStatut = Object.fromEntries(parStatutBrut.map((c) => [c._id, c]));
  const somme = (statuts, champ = 'n') => statuts.reduce((s, st) => s + (parStatut[st]?.[champ] ?? 0), 0);

  return {
    compteurs: {
      toutes:   parStatutBrut.reduce((s, c) => s + c.n, 0),
      en_cours: somme(GROUPES_STATUT.en_cours),
      livree:   somme(GROUPES_STATUT.livree),
      annulee:  somme(GROUPES_STATUT.annulee),
    },
    montantTotal: Math.round(somme([...GROUPES_STATUT.en_cours, ...GROUPES_STATUT.livree], 'montant')),
  };
};

/** Échappe une saisie utilisateur avant de l'utiliser dans une RegExp */
const echapperRegex = (texte) => texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/commandes
   Liste paginée des commandes de l'acheteur connecté.

   Query :
     - groupe    : 'en_cours' | 'livree' | 'annulee'  (onglets)
     - statut    : statut précis (prioritaire sur groupe)
     - recherche : numéro de commande, nom de produit ou de boutique
     - page, limite

   Renvoie aussi `compteurs` (par onglet) pour afficher les badges sans
   requête supplémentaire.
───────────────────────────────────────────────────────────────────────────── */
export const getMesCommandes = async (req, res) => {
  try {
    const { groupe, statut, recherche = '', page = 1, limite = 10 } = req.query;
    const acheteur = new mongoose.Types.ObjectId(String(req.user._id));

    const filtre = { acheteur };
    if (statut)      filtre.statut = statut;
    else if (groupe) filtre.statut = { $in: GROUPES_STATUT[groupe] };

    const terme = String(recherche).trim();
    if (terme) {
      const regex = new RegExp(echapperRegex(terme), 'i');
      filtre.$or = [{ numero: regex }, { 'lignes.nomProduit': regex }];
    }

    const saut = (Number(page) - 1) * Number(limite);

    const [commandes, total, { compteurs }] = await Promise.all([
      Commande.find(filtre, { ...PROJECTION_ACHETEUR, historiqueStatut: 0 })
        .populate('vendeur', 'nomEntreprise logo slug')
        .sort({ createdAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Commande.countDocuments(filtre),
      calculerResume(acheteur),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        commandes: commandes.map((c) => ({ ...c, peutAnnuler: peutEtreAnnuleeParAcheteur(c) })),
        compteurs,
        pagination: {
          total,
          page:       Number(page),
          limite:     Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getMesCommandes acheteur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/commandes/resume
   Chiffres clés de l'acheteur (page « Mon compte ») : nombre de commandes
   par onglet et montant total dépensé.
───────────────────────────────────────────────────────────────────────────── */
export const getResumeCommandes = async (req, res) => {
  try {
    const acheteur = new mongoose.Types.ObjectId(String(req.user._id));
    const resume = await calculerResume(acheteur);
    return res.status(200).json({ success: true, data: resume });
  } catch (erreur) {
    console.error('Erreur getResumeCommandes:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/commandes/:id
   Détail d'une commande de l'acheteur connecté, avec :
     - suivi        : chronologie des étapes (pour la frise de suivi)
     - autresCommandes : sous-commandes du même passage en caisse (autres boutiques)
     - peutAnnuler
───────────────────────────────────────────────────────────────────────────── */
export const getCommandeParId = async (req, res) => {
  try {
    const commande = await Commande.findOne({ _id: req.params.id, acheteur: req.user._id }, PROJECTION_ACHETEUR)
      .populate('vendeur', 'nomEntreprise emailContact telephoneContact logo slug')
      .populate('lignes.produit', 'nom reference photoCouverture slug')
      .populate({ path: 'livreur', select: 'telephone utilisateur', populate: { path: 'utilisateur', select: 'fullName' } })
      .lean();

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    const autresCommandes = await Commande.find(
      { groupeCommandeId: commande.groupeCommandeId, acheteur: req.user._id, _id: { $ne: commande._id } },
      { numero: 1, statut: 1, total: 1, vendeur: 1, 'lignes.quantite': 1 },
    )
      .populate('vendeur', 'nomEntreprise logo')
      .lean();

    /* Le livreur n'est communiqué qu'une fois la commande en route */
    const livreurVisible = ['expediee', 'livree'].includes(commande.statut) && commande.livreur;
    const livreur = livreurVisible
      ? { nom: commande.livreur.utilisateur?.fullName ?? 'Livreur', telephone: commande.livreur.telephone ?? '' }
      : null;

    return res.status(200).json({
      success: true,
      data: {
        commande: {
          ...commande,
          historiqueStatut: undefined, // remplacé par `suivi` (n'expose pas les auteurs)
          livreur,
          suivi:       construireSuivi(commande),
          peutAnnuler: peutEtreAnnuleeParAcheteur(commande),
        },
        autresCommandes,
      },
    });
  } catch (erreur) {
    console.error('Erreur getCommandeParId acheteur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/acheteur/commandes/:id/annuler
   L'acheteur annule sa commande tant qu'elle n'a pas été traitée.
   Les quantités sont remises en stock (transaction).
───────────────────────────────────────────────────────────────────────────── */
export const annulerMaCommande = async (req, res) => {
  try {
    const raison = req.body.raison ?? '';
    const commande = await annulerCommande({
      filtre:           { _id: req.params.id, acheteur: req.user._id },
      statutsAutorises: STATUTS_ANNULABLES_ACHETEUR,
      auteurId:         req.user._id,
      raison,
    });

    /* Pas d'await : la réponse n'attend pas l'envoi de l'email */
    notifierVendeurAnnulation(commande, 'acheteur', raison);

    return res.status(200).json({ success: true, message: 'Votre commande a été annulée.' });
  } catch (erreur) {
    if (erreur instanceof ErreurCommande) {
      return res.status(erreur.status).json({ success: false, message: erreur.message });
    }
    console.error('Erreur annulerMaCommande:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/commandes/groupe/:groupeCommandeId
   Toutes les sous-commandes d'un même passage en caisse.
───────────────────────────────────────────────────────────────────────────── */
export const getGroupeCommandes = async (req, res) => {
  try {
    const { groupeCommandeId } = req.params;

    const commandes = await Commande.find(
      { groupeCommandeId, acheteur: req.user._id },
      { ...PROJECTION_ACHETEUR, historiqueStatut: 0 },
    )
      .populate('vendeur',       'nomEntreprise logo slug')
      .populate('lignes.produit','nom reference photoCouverture slug')
      .lean();

    if (commandes.length === 0) {
      return res.status(404).json({ success: false, message: 'Groupe de commandes introuvable.' });
    }

    const total = commandes.reduce((acc, c) => acc + c.total, 0);

    return res.status(200).json({
      success: true,
      data: { groupeCommandeId, commandes, totalGlobal: total },
    });
  } catch (erreur) {
    console.error('Erreur getGroupeCommandes:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
