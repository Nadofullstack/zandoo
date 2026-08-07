import { useEffect, useState } from 'react';
import {
  X, Package, User, MapPin, CreditCard, Clock,
  Loader2,
} from 'lucide-react';
import BadgeStatutCommande from './BadgeStatutCommande';
import { getCommandeParId } from '../../../services/admin/adminCommandeService';
import type { Commande } from '../../../types/admin';

interface Props {
  commandeId: string | null;
  onFermer: () => void;
}

export default function ModalDetailCommande({ commandeId, onFermer }: Props) {
  const ouvert = !!commandeId;

  const [commande,    setCommande]    = useState<Commande | null>(null);
  const [chargement,  setChargement]  = useState(false);
  const [erreur,      setErreur]      = useState<string | null>(null);

  /* Charger la commande à chaque ouverture */
  useEffect(() => {
    if (!commandeId) {
      setCommande(null);
      return;
    }
    let annule = false;
    setChargement(true);
    setErreur(null);

    getCommandeParId(commandeId)
      .then((rep) => {
        if (!annule) setCommande(rep.data.commande);
      })
      .catch((err) => {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => { annule = true; };
  }, [commandeId]);

  /* Fermer avec Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onFermer(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onFermer]);

  /* Bloquer le scroll */
  useEffect(() => {
    document.body.style.overflow = ouvert ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [ouvert]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200 ${
          ouvert ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onFermer}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
          ouvert ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Détail commande"
          onClick={(e) => e.stopPropagation()}
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-200 ${
            ouvert ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        >
          {/* ── En-tête ─────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
              {commande && (
                <>
                  <span className="font-mono text-sm font-bold text-primary bg-gray-100 px-2.5 py-0.5 rounded-lg">
                    {commande.numero}
                  </span>
                  <BadgeStatutCommande statut={commande.statut} />
                </>
              )}
              {!commande && !chargement && (
                <span className="text-sm font-semibold text-primary">Détail commande</span>
              )}
            </div>
            <button
              onClick={onFermer}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Corps ───────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Chargement */}
            {chargement && (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className="animate-spin text-accent" />
              </div>
            )}

            {/* Erreur */}
            {erreur && !chargement && (
              <div className="py-10 text-center text-sm text-red-600">{erreur}</div>
            )}

            {/* Contenu */}
            {commande && !chargement && (
              <>
                {/* Articles */}
                <section>
                  <h3 className="flex items-center gap-2 text-xs font-bold text-[#74777d] uppercase tracking-wider mb-3">
                    <Package size={14} /> Articles commandés
                  </h3>
                  <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
                    {commande.lignes.map((ligne) => (
                      <div key={ligne._id} className="flex items-start gap-3 p-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {ligne.photoProduit ? (
                            <img
                              src={ligne.photoProduit}
                              alt={ligne.nomProduit}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package size={18} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-primary truncate">{ligne.nomProduit}</p>
                          {ligne.variante && (
                            <p className="text-xs text-[#74777d]">{ligne.variante}</p>
                          )}
                          <p className="text-xs text-[#74777d]">
                            {ligne.vendeur?.nomEntreprise ?? '—'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-primary">
                            {ligne.sousTotal.toLocaleString('fr-FR')} {commande.devise}
                          </p>
                          <p className="text-xs text-[#74777d]">
                            {ligne.quantite} × {ligne.prixUnitaire.toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totaux */}
                  <div className="mt-2 space-y-1 px-1">
                    {commande.fraisLivraison > 0 && (
                      <div className="flex justify-between text-sm text-[#74777d]">
                        <span>Frais de livraison</span>
                        <span>{commande.fraisLivraison.toLocaleString('fr-FR')} {commande.devise}</span>
                      </div>
                    )}
                    {commande.remise > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Remise</span>
                        <span>− {commande.remise.toLocaleString('fr-FR')} {commande.devise}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-base text-primary pt-1 border-t border-gray-200">
                      <span>Total</span>
                      <span>{commande.total.toLocaleString('fr-FR')} {commande.devise}</span>
                    </div>
                  </div>
                </section>

                {/* Ligne séparatrice */}
                <hr className="border-gray-100" />

                {/* Grille infos */}
                <div className="grid sm:grid-cols-2 gap-4">

                  {/* Acheteur */}
                  <section className="bg-gray-50 rounded-xl p-4">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-[#74777d] uppercase tracking-wider mb-2">
                      <User size={13} /> Acheteur
                    </h3>
                    <p className="font-semibold text-primary text-sm">{commande.acheteur?.fullName ?? '—'}</p>
                    <p className="text-xs text-[#74777d] mt-0.5">{commande.acheteur?.email ?? '—'}</p>
                    {commande.acheteur?.phone && (
                      <p className="text-xs text-[#74777d]">{commande.acheteur.phone}</p>
                    )}
                  </section>

                  {/* Adresse livraison */}
                  <section className="bg-gray-50 rounded-xl p-4">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-[#74777d] uppercase tracking-wider mb-2">
                      <MapPin size={13} /> Livraison
                    </h3>
                    <p className="font-semibold text-primary text-sm">{commande.adresseLivraison.nomComplet}</p>
                    {commande.adresseLivraison.telephone && (
                      <p className="text-xs text-[#74777d]">{commande.adresseLivraison.telephone}</p>
                    )}
                    <p className="text-xs text-[#74777d] mt-0.5">
                      {[
                        commande.adresseLivraison.rue,
                        commande.adresseLivraison.ville,
                        commande.adresseLivraison.pays,
                      ].filter(Boolean).join(', ')}
                    </p>
                    {commande.adresseLivraison.instructions && (
                      <p className="text-xs text-[#74777d] mt-1 italic">
                        "{commande.adresseLivraison.instructions}"
                      </p>
                    )}
                  </section>

                  {/* Paiement */}
                  <section className="bg-gray-50 rounded-xl p-4">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-[#74777d] uppercase tracking-wider mb-2">
                      <CreditCard size={13} /> Paiement
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#74777d]">Méthode</span>
                        <span className="font-medium text-primary capitalize">
                          {commande.paiement.methode.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#74777d]">Statut</span>
                        <span className={`font-semibold ${
                          commande.paiement.statut === 'paye'    ? 'text-green-600' :
                          commande.paiement.statut === 'echoue'  ? 'text-red-500'   : 'text-yellow-600'
                        }`}>
                          {commande.paiement.statut.replace('_', ' ')}
                        </span>
                      </div>
                      {commande.paiement.reference && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[#74777d]">Référence</span>
                          <span className="font-mono text-xs text-primary">{commande.paiement.reference}</span>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Date commande */}
                  <section className="bg-gray-50 rounded-xl p-4">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-[#74777d] uppercase tracking-wider mb-2">
                      <Clock size={13} /> Dates
                    </h3>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#74777d]">Commande</span>
                        <span className="text-primary">
                          {new Date(commande.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </div>
                      {commande.payeeAt && (
                        <div className="flex justify-between">
                          <span className="text-[#74777d]">Payée</span>
                          <span className="text-primary">
                            {new Date(commande.payeeAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      {commande.expedieeAt && (
                        <div className="flex justify-between">
                          <span className="text-[#74777d]">Expédiée</span>
                          <span className="text-primary">
                            {new Date(commande.expedieeAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      {commande.livreeAt && (
                        <div className="flex justify-between">
                          <span className="text-[#74777d]">Livrée</span>
                          <span className="text-primary">
                            {new Date(commande.livreeAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      {commande.annuleeAt && (
                        <div className="flex justify-between">
                          <span className="text-[#74777d]">Annulée</span>
                          <span className="text-red-500">
                            {new Date(commande.annuleeAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Historique statuts */}
                {commande.historiqueStatut && commande.historiqueStatut.length > 0 && (
                  <section>
                    <h3 className="flex items-center gap-2 text-xs font-bold text-[#74777d] uppercase tracking-wider mb-3">
                      <Clock size={13} /> Historique des statuts
                    </h3>
                    <ol className="relative border-l border-gray-200 space-y-3 ml-2">
                      {commande.historiqueStatut.map((h) => (
                        <li key={h._id} className="ml-4">
                          <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-accent border-2 border-white" />
                          <p className="text-sm font-semibold text-primary capitalize">
                            {h.statut.replace('_', ' ')}
                          </p>
                          {h.raison && (
                            <p className="text-xs text-[#74777d] mt-0.5">{h.raison}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(h.modifieAt).toLocaleString('fr-FR')}
                            {h.modifiePar ? ` — ${h.modifiePar.fullName}` : ''}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {/* Notes client */}
                {commande.notesClient && (
                  <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1">
                      Note du client
                    </p>
                    <p className="text-sm text-yellow-900 italic">"{commande.notesClient}"</p>
                  </section>
                )}
              </>
            )}
          </div>

          {/* ── Pied ────────────────────────────────── */}
          <div className="px-6 py-4 border-t border-gray-100 shrink-0">
            <button
              onClick={onFermer}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
