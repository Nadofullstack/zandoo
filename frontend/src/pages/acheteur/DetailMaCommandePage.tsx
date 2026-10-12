import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bike, ChevronRight, Clock, CreditCard, Mail, MapPin, Phone, RefreshCw, Star, Store } from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import BadgeStatutCommande from '../../components/acheteur/commandes/BadgeStatutCommande';
import SuiviCommande from '../../components/acheteur/commandes/SuiviCommande';
import VignetteProduit from '../../components/acheteur/commandes/VignetteProduit';
import ModalAnnulationCommande from '../../components/acheteur/commandes/ModalAnnulationCommande';
import { METHODES_PAIEMENT, STATUTS, formatDate, formatPrix, nombreArticles } from '../../components/acheteur/commandes/configCommandes';
import { useMaCommande } from '../../hooks/acheteur/useMaCommande';
import { useAvisCommande } from '../../hooks/acheteur/useAvisCommande';
import ModalAvis from '../../components/acheteur/avis/ModalAvis';
import EtoilesNote from '../../components/ui/EtoilesNote';
import type { CommandeDetail, LigneCommande, PointRetrait } from '../../types/acheteur';
import { libelleDelai } from '../../components/acheteur/checkout/checkoutUtils';

const LIBELLES_PAIEMENT = { en_attente: 'En attente', paye: 'Payé', echoue: 'Échoué', rembourse: 'Remboursé' } as const;

/** Détail et suivi d'une commande de l'acheteur. */
export default function DetailMaCommandePage() {
  const { id } = useParams<{ id: string }>();
  const { commande, autresCommandes, chargement, erreur, annuler, recharger } = useMaCommande(id);
  const [modalAnnulation, setModalAnnulation] = useState(false);
  const avisCommande = useAvisCommande(id, commande?.statut === 'livree');
  const [ligneAEvaluer, setLigneAEvaluer] = useState<LigneCommande | null>(null);

  return (
    <AcheteurLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        <Link to="/mes-commandes" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#FC7701] mb-5">
          <ArrowLeft size={16} /> Mes commandes
        </Link>

        {erreur && !commande ? (
          <div className="flex flex-col items-center text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-base font-bold text-[#011023]">Commande introuvable</p>
            <p className="text-sm text-gray-500 mt-1">{erreur}</p>
            <button onClick={recharger} className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50">
              <RefreshCw size={14} /> Réessayer
            </button>
          </div>
        ) : !commande ? (
          <Squelette />
        ) : (
          <div className={`transition-opacity ${chargement ? 'opacity-60' : ''}`}>
            {/* En-tête */}
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#011023]">
                    Commande <span className="font-mono">{commande.numero}</span>
                  </h1>
                  <BadgeStatutCommande statut={commande.statut} />
                </div>
                <p className="text-sm text-gray-500 mt-1.5">
                  Passée le {formatDate(commande.createdAt)} · {nombreArticles(commande.lignes)} article{nombreArticles(commande.lignes) > 1 ? 's' : ''}
                </p>
              </div>
              {commande.peutAnnuler && (
                <button
                  onClick={() => setModalAnnulation(true)}
                  className="self-start sm:self-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 bg-white hover:bg-red-50 transition-colors"
                >
                  Annuler la commande
                </button>
              )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ── Colonne principale ─────────────────────────────── */}
              <div className="lg:col-span-2 space-y-6">
                <Bloc titre="Suivi de la commande" sousTitre={STATUTS[commande.statut].description}>
                  <SuiviCommande etapes={commande.suivi} />
                </Bloc>

                <Bloc titre="Articles" action={<LienBoutique commande={commande} />}>
                  <ul className="divide-y divide-gray-100 -my-3">
                    {commande.lignes.map((l) => {
                      const avis = avisCommande.avisParProduit[idProduit(l)];
                      return (
                        <LigneArticle
                          key={l._id}
                          ligne={l}
                          devise={commande.devise}
                          action={commande.statut === 'livree' && idProduit(l) ? (
                            <button
                              onClick={() => setLigneAEvaluer(l)}
                              className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-[#FC7701] hover:underline"
                            >
                              {avis ? <><EtoilesNote note={avis.note} taille={11} /> Modifier mon avis</> : <><Star size={12} /> Noter ce produit</>}
                            </button>
                          ) : null}
                        />
                      );
                    })}
                  </ul>
                </Bloc>

                {autresCommandes.length > 0 && (
                  <Bloc
                    titre="Commandes du même achat"
                    sousTitre="Ces articles proviennent d'autres boutiques et sont expédiés séparément."
                  >
                    <ul className="space-y-2">
                      {autresCommandes.map((a) => (
                        <li key={a._id}>
                          <Link
                            to={`/mes-commandes/${a._id}`}
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <Store size={16} className="text-gray-400 shrink-0" />
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium text-[#011023] truncate">{a.vendeur?.nomEntreprise ?? 'Boutique'}</span>
                              <span className="block text-xs text-gray-500 font-mono">{a.numero}</span>
                            </span>
                            <BadgeStatutCommande statut={a.statut} />
                            <span className="hidden sm:block text-sm font-semibold tabular-nums w-28 text-right">{formatPrix(a.total)}</span>
                            <ChevronRight size={16} className="text-gray-300" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Bloc>
                )}
              </div>

              {/* ── Colonne latérale ───────────────────────────────── */}
              <aside className="space-y-6">
                <Bloc titre="Récapitulatif">
                  <dl className="space-y-2.5 text-sm">
                    <LigneMontant libelle="Sous-total" valeur={formatPrix(commande.sousTotal, commande.devise)} />
                    <LigneMontant
                      libelle="Livraison"
                      valeur={commande.fraisLivraison > 0 ? formatPrix(commande.fraisLivraison, commande.devise) : 'Offerte'}
                    />
                    {commande.remise > 0 && (
                      <LigneMontant libelle="Remise" valeur={`− ${formatPrix(commande.remise, commande.devise)}`} accent />
                    )}
                    <div className="flex justify-between pt-3 mt-1 border-t border-gray-100">
                      <dt className="font-bold text-[#011023]">Total</dt>
                      <dd className="font-black text-lg text-[#011023] tabular-nums">{formatPrix(commande.total, commande.devise)}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 text-sm">
                    <CreditCard size={16} className="text-gray-400" />
                    <span className="flex-1 text-gray-700">{METHODES_PAIEMENT[commande.paiement.methode]}</span>
                    <span className="text-xs font-semibold text-gray-500">{LIBELLES_PAIEMENT[commande.paiement.statut]}</span>
                  </div>
                </Bloc>

                <Bloc titre={commande.livraison?.mode === 'retrait' ? 'Retrait en boutique' : 'Livraison à domicile'}>
                  {commande.livraison?.mode === 'retrait' && commande.livraison.pointRetrait ? (
                    <PointRetraitBloc point={commande.livraison.pointRetrait} />
                  ) : (
                    <Adresse commande={commande} />
                  )}
                  {libelleDelai(commande.livraison?.delaiMin, commande.livraison?.delaiMax) && !['livree', 'annulee', 'remboursee'].includes(commande.statut) && (
                    <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={13} /> Délai annoncé : {libelleDelai(commande.livraison?.delaiMin, commande.livraison?.delaiMax)}
                    </p>
                  )}
                  {commande.livreur && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center"><Bike size={16} className="text-[#FC7701]" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Votre livreur</p>
                        <p className="text-sm font-semibold text-[#011023] truncate">{commande.livreur.nom}</p>
                      </div>
                      {commande.livreur.telephone && (
                        <a href={`tel:${commande.livreur.telephone}`} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50" aria-label="Appeler le livreur">
                          <Phone size={16} className="text-gray-600" />
                        </a>
                      )}
                    </div>
                  )}
                </Bloc>

                {commande.vendeur && (
                  <Bloc titre="Une question ?" sousTitre="Contactez directement la boutique.">
                    <div className="space-y-2 text-sm">
                      {commande.vendeur.telephoneContact && (
                        <a href={`tel:${commande.vendeur.telephoneContact}`} className="flex items-center gap-2.5 text-gray-700 hover:text-[#FC7701]">
                          <Phone size={15} className="text-gray-400" /> {commande.vendeur.telephoneContact}
                        </a>
                      )}
                      {commande.vendeur.emailContact && (
                        <a href={`mailto:${commande.vendeur.emailContact}?subject=Commande ${commande.numero}`} className="flex items-center gap-2.5 text-gray-700 hover:text-[#FC7701] break-all">
                          <Mail size={15} className="text-gray-400 shrink-0" /> {commande.vendeur.emailContact}
                        </a>
                      )}
                    </div>
                  </Bloc>
                )}
              </aside>
            </div>
          </div>
        )}
      </div>

      {ligneAEvaluer && (
        <ModalAvis
          nomProduit={ligneAEvaluer.nomProduit}
          photo={ligneAEvaluer.photoProduit}
          avisExistant={avisCommande.avisParProduit[idProduit(ligneAEvaluer)] ?? null}
          onEnregistrer={(saisie) => avisCommande.enregistrer(idProduit(ligneAEvaluer), saisie)}
          onSupprimer={avisCommande.avisParProduit[idProduit(ligneAEvaluer)] ? () => avisCommande.supprimer(idProduit(ligneAEvaluer)) : undefined}
          onFermer={() => setLigneAEvaluer(null)}
        />
      )}

      {modalAnnulation && commande && (
        <ModalAnnulationCommande
          numero={commande.numero}
          onConfirmer={annuler}
          onFermer={() => setModalAnnulation(false)}
        />
      )}
    </AcheteurLayout>
  );
}

/* ── Sous-composants de présentation ─────────────────────────────────────── */

function Bloc({ titre, sousTitre, action, children }: { titre: string; sousTitre?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
      <header className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-[#011023]">{titre}</h2>
          {sousTitre && <p className="text-xs text-gray-500 mt-0.5">{sousTitre}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function LienBoutique({ commande }: { commande: CommandeDetail }) {
  if (!commande.vendeur) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
      <Store size={14} /> {commande.vendeur.nomEntreprise}
    </span>
  );
}

/** Identifiant du produit d'une ligne (peuplé ou non) */
const idProduit = (l: LigneCommande): string =>
  typeof l.produit === 'object' && l.produit ? l.produit._id : (l.produit ?? '');

function LigneArticle({ ligne, devise, action }: { ligne: LigneCommande; devise: string; action?: React.ReactNode }) {
  const slug = typeof ligne.produit === 'object' ? ligne.produit?.slug : undefined;
  const nom = <span className="text-sm font-medium text-gray-900 line-clamp-2">{ligne.nomProduit}</span>;

  return (
    <li className="flex items-center gap-4 py-3">
      <VignetteProduit ligne={ligne} />
      <div className="flex-1 min-w-0">
        {slug ? <Link to={`/produit/${slug}`} className="hover:text-[#FC7701]">{nom}</Link> : nom}
        <p className="text-xs text-gray-500 mt-0.5">
          {ligne.variante && <>{ligne.variante} · </>}
          {ligne.quantite} × {formatPrix(ligne.prixUnitaire, devise)}
        </p>
        {action}
      </div>
      <p className="text-sm font-semibold text-[#011023] tabular-nums">{formatPrix(ligne.sousTotal, devise)}</p>
    </li>
  );
}

function LigneMontant({ libelle, valeur, accent }: { libelle: string; valeur: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{libelle}</dt>
      <dd className={`tabular-nums ${accent ? 'text-emerald-600 font-medium' : 'text-gray-900'}`}>{valeur}</dd>
    </div>
  );
}

function Adresse({ commande }: { commande: CommandeDetail }) {
  const a = commande.adresseLivraison;
  return (
    <div className="flex gap-3 text-sm">
      <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
      <address className="not-italic text-gray-700 leading-relaxed">
        <span className="font-semibold text-[#011023]">{a.nomComplet}</span><br />
        {[a.rue, a.quartier].filter(Boolean).join(', ')}{(a.rue || a.quartier) && <br />}
        {[a.ville, a.pays].filter(Boolean).join(', ')}
        {a.telephone && <><br />{a.telephone}</>}
        {a.instructions && <span className="block mt-1.5 text-xs text-gray-500 italic">« {a.instructions} »</span>}
      </address>
    </div>
  );
}

function PointRetraitBloc({ point }: { point: PointRetrait }) {
  return (
    <div className="flex gap-3 text-sm">
      <Store size={16} className="text-gray-400 shrink-0 mt-0.5" />
      <div className="text-gray-700 leading-relaxed">
        <p className="font-semibold text-[#011023]">{point.adresse}</p>
        <p>{point.ville}</p>
        {point.horaires && <p className="text-xs text-gray-500 mt-1">{point.horaires}</p>}
        {point.instructions && <p className="text-xs text-gray-500 italic mt-1">« {point.instructions} »</p>}
      </div>
    </div>
  );
}

function Squelette() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-80 max-w-full rounded-xl bg-gray-100" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-40 rounded-2xl bg-white border border-gray-100" />
          <div className="h-64 rounded-2xl bg-white border border-gray-100" />
        </div>
        <div className="space-y-6">
          <div className="h-56 rounded-2xl bg-white border border-gray-100" />
          <div className="h-40 rounded-2xl bg-white border border-gray-100" />
        </div>
      </div>
    </div>
  );
}
