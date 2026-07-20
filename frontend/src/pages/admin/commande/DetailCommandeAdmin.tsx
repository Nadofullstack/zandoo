import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, MapPin, CreditCard, Package, Clock } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import BadgeStatutCommande from '../../../components/admin/commandes/BadgeStatutCommande';
import ModalConfirmation from '../../../components/admin/modal/ModalConfirmation';
import Alert from '../../../components/ui/Alert';
import { getCommandeParId, modifierStatutCommande, modifierNotesCommande } from '../../../services/adminCommandeService';
import type { Commande, StatutCommande } from '../../../types/admin';

/* Transitions disponibles selon le statut actuel */
const TRANSITIONS: Record<StatutCommande, { statut: StatutCommande; libelle: string; variante: 'success' | 'danger' | 'warning' }[]> = {
  en_attente: [
    { statut: 'payee',   libelle: 'Marquer payée',    variante: 'success' },
    { statut: 'annulee', libelle: 'Annuler',           variante: 'danger'  },
  ],
  payee: [
    { statut: 'expediee', libelle: 'Marquer expédiée', variante: 'success' },
    { statut: 'annulee',  libelle: 'Annuler',           variante: 'danger'  },
  ],
  expediee: [
    { statut: 'livree', libelle: 'Marquer livrée', variante: 'success' },
  ],
  livree:  [],
  annulee: [],
};

export default function DetailCommandeAdmin() {
  const { id } = useParams<{ id: string }>();

  const [commande,         setCommande]         = useState<Commande | null>(null);
  const [chargement,       setChargement]       = useState(true);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur,           setErreur]           = useState<string | null>(null);
  const [messageSucces,    setMessageSucces]    = useState<string | null>(null);
  const [notesAdmin,       setNotesAdmin]       = useState('');
  const [modal, setModal] = useState<{
    ouvert: boolean; statut: StatutCommande; avecRaison: boolean;
  }>({ ouvert: false, statut: 'payee', avecRaison: false });

  useEffect(() => {
    if (!id) return;
    let annule = false;
    (async () => {
      setChargement(true);
      try {
        const rep = await getCommandeParId(id);
        if (!annule) {
          setCommande(rep.data.commande);
          setNotesAdmin(rep.data.commande.notesAdmin ?? '');
        }
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => { annule = true; };
  }, [id]);

  const afficherSucces = (msg: string) => {
    setMessageSucces(msg);
    setTimeout(() => setMessageSucces(null), 3000);
  };

  const handleChangerStatut = async (raison?: string) => {
    if (!id) return;
    setChargementAction(true);
    setModal((m) => ({ ...m, ouvert: false }));
    try {
      const rep = await modifierStatutCommande(id, modal.statut, raison);
      setCommande(rep.data.commande);
      afficherSucces(`Statut mis à jour : ${modal.statut}.`);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally { setChargementAction(false); }
  };

  const handleSauvegarderNotes = async () => {
    if (!id) return;
    setChargementAction(true);
    try {
      await modifierNotesCommande(id, notesAdmin);
      afficherSucces('Notes sauvegardées.');
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally { setChargementAction(false); }
  };

  if (chargement) {
    return (
      <DispositionAdmin>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-64 rounded-xl bg-gray-200" />
        </div>
      </DispositionAdmin>
    );
  }

  if (!commande) {
    return <DispositionAdmin><Alert variant="error">Commande introuvable.</Alert></DispositionAdmin>;
  }

  const transitions = TRANSITIONS[commande.statut] ?? [];

  return (
    <DispositionAdmin>
      <Link
        to="/admin/commandes"
        className="inline-flex items-center gap-1.5 text-sm text-[#74777d] hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft size={15} /> Retour aux commandes
      </Link>

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-extrabold text-primary font-mono">{commande.numero}</h1>
          <BadgeStatutCommande statut={commande.statut} />
        </div>

        {/* Actions de transition */}
        {transitions.length > 0 && (
          <div className="flex gap-2 shrink-0">
            {transitions.map((t) => (
              <button
                key={t.statut}
                onClick={() => setModal({ ouvert: true, statut: t.statut, avecRaison: t.statut === 'annulee' })}
                disabled={chargementAction}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50
                  ${t.variante === 'success' ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                  ${t.variante === 'danger'  ? 'bg-red-500   text-white hover:bg-red-600'   : ''}
                `}
              >
                {t.libelle}
              </button>
            ))}
          </div>
        )}
      </div>

      {erreur       && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}
      {messageSucces && <div className="mb-4"><Alert variant="success">{messageSucces}</Alert></div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">

          {/* Lignes de commande */}
          <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-4">
              <Package size={16} aria-hidden="true" /> Articles commandés
            </h2>
            <div className="divide-y divide-gray-100">
              {commande.lignes.map((ligne) => (
                <div key={ligne._id} className="flex items-start gap-4 py-3">
                  {/* Photo */}
                  <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {ligne.photoProduit ? (
                      <img
                        src={ligne.photoProduit}
                        alt={ligne.nomProduit}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package size={20} />
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary text-sm truncate">{ligne.nomProduit}</p>
                    {ligne.variante && (
                      <p className="text-xs text-[#74777d] mt-0.5">{ligne.variante}</p>
                    )}
                    <p className="text-xs text-[#74777d] mt-0.5">
                      {ligne.vendeur?.nomEntreprise ?? '—'}
                    </p>
                  </div>

                  {/* Prix */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-primary">
                      {ligne.sousTotal.toLocaleString('fr-FR')} {commande.devise}
                    </p>
                    <p className="text-xs text-[#74777d] mt-0.5">
                      {ligne.quantite} × {ligne.prixUnitaire.toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Récapitulatif des montants */}
            <div className="border-t border-gray-200 mt-3 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-[#74777d]">
                <span>Sous-total</span>
                <span>{commande.sousTotal.toLocaleString('fr-FR')} {commande.devise}</span>
              </div>
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

          {/* Historique des statuts */}
          {commande.historiqueStatut && commande.historiqueStatut.length > 0 && (
            <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-4">
                <Clock size={16} aria-hidden="true" /> Historique
              </h2>
              <ol className="relative border-l border-gray-200 space-y-4 ml-2">
                {commande.historiqueStatut.map((h) => (
                  <li key={h._id} className="ml-4">
                    <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-accent border-2 border-white" />
                    <p className="text-sm font-semibold text-primary capitalize">{h.statut.replace('_', ' ')}</p>
                    {h.raison && <p className="text-xs text-[#74777d] mt-0.5">{h.raison}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(h.modifieAt).toLocaleString('fr-FR')}
                      {h.modifiePar ? ` — ${h.modifiePar.fullName}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">

          {/* Acheteur */}
          <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-3">
              <User size={16} aria-hidden="true" /> Acheteur
            </h2>
            <p className="font-semibold text-primary">{commande.acheteur?.fullName ?? '—'}</p>
            <p className="text-sm text-[#74777d] mt-0.5">{commande.acheteur?.email ?? '—'}</p>
            {commande.acheteur?.phone && (
              <p className="text-sm text-[#74777d]">{commande.acheteur.phone}</p>
            )}
          </section>

          {/* Adresse de livraison */}
          <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-3">
              <MapPin size={16} aria-hidden="true" /> Livraison
            </h2>
            <p className="font-semibold text-primary">{commande.adresseLivraison.nomComplet}</p>
            {commande.adresseLivraison.telephone && (
              <p className="text-sm text-[#74777d]">{commande.adresseLivraison.telephone}</p>
            )}
            <p className="text-sm text-[#74777d] mt-0.5">
              {[commande.adresseLivraison.rue, commande.adresseLivraison.ville,
                commande.adresseLivraison.pays].filter(Boolean).join(', ')}
            </p>
            {commande.adresseLivraison.instructions && (
              <p className="text-xs text-[#74777d] mt-1 italic">
                {commande.adresseLivraison.instructions}
              </p>
            )}
          </section>

          {/* Paiement */}
          <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-3">
              <CreditCard size={16} aria-hidden="true" /> Paiement
            </h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#74777d]">Méthode</span>
                <span className="font-medium text-primary capitalize">
                  {commande.paiement.methode.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#74777d]">Statut</span>
                <span className={`font-semibold ${
                  commande.paiement.statut === 'paye' ? 'text-green-600' :
                  commande.paiement.statut === 'echoue' ? 'text-red-500' : 'text-yellow-600'
                }`}>
                  {commande.paiement.statut.replace('_', ' ')}
                </span>
              </div>
              {commande.paiement.reference && (
                <div className="flex justify-between">
                  <span className="text-[#74777d]">Référence</span>
                  <span className="font-mono text-xs text-primary">{commande.paiement.reference}</span>
                </div>
              )}
              {commande.paiement.payeAt && (
                <div className="flex justify-between">
                  <span className="text-[#74777d]">Payée le</span>
                  <span className="text-primary text-xs">
                    {new Date(commande.paiement.payeAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Notes admin */}
          <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
              Notes internes
            </h2>
            <textarea
              value={notesAdmin}
              onChange={(e) => setNotesAdmin(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Notes visibles uniquement par l'équipe admin…"
              className="w-full px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">{notesAdmin.length}/500</p>
              <button
                onClick={handleSauvegarderNotes}
                disabled={chargementAction}
                className="px-4 py-1.5 text-sm font-semibold bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                Sauvegarder
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Modal confirmation changement de statut */}
      <ModalConfirmation
        ouvert={modal.ouvert}
        titre="Confirmer la mise à jour ?"
        description={`La commande ${commande.numero} passera au statut « ${modal.statut} ».`}
        labelConfirmer="Confirmer"
        variante={modal.statut === 'annulee' ? 'danger' : 'success'}
        avecRaison={modal.avecRaison}
        labelRaison="Raison de l'annulation (optionnel)"
        chargement={chargementAction}
        onConfirmer={handleChangerStatut}
        onAnnuler={() => setModal((m) => ({ ...m, ouvert: false }))}
      />
    </DispositionAdmin>
  );
}
