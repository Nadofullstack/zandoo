import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Tag, AlertTriangle, Clock } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import { BadgeStatutTicket, BadgePriorite } from '../../../components/admin/reclamations/BadgeStatutTicket';
import FilDiscussion from '../../../components/admin/reclamations/FilDiscussion';
import ModalConfirmation from '../../../components/admin/modal/ModalConfirmation';
import Alert from '../../../components/ui/Alert';
import {
  getReclamationParId,
  modifierStatutReclamation,
  ajouterMessage,
  modifierPriorite,
  modifierNotesReclamation,
} from '../../../services/admin/adminReclamationService';
import type { Reclamation, StatutReclamation, PrioriteReclamation } from '../../../types/admin';

const LABELS_CATEGORIE: Record<string, string> = {
  produit_non_recu:     'Produit non reçu',
  produit_defectueux:   'Produit défectueux',
  produit_non_conforme: 'Produit non conforme',
  remboursement:        'Remboursement',
  vendeur:              'Vendeur',
  paiement:             'Paiement',
  compte:               'Compte',
  autre:                'Autre',
};

const OPTIONS_STATUT: { valeur: StatutReclamation; libelle: string }[] = [
  { valeur: 'ouvert',             libelle: 'Ouvert'           },
  { valeur: 'en_cours',           libelle: 'En cours'         },
  { valeur: 'en_attente_reponse', libelle: 'En attente réponse' },
  { valeur: 'resolu',             libelle: 'Résolu'           },
  { valeur: 'ferme',              libelle: 'Fermé'            },
];

const OPTIONS_PRIORITE: { valeur: PrioriteReclamation; libelle: string }[] = [
  { valeur: 'basse',   libelle: 'Basse'   },
  { valeur: 'normale', libelle: 'Normale' },
  { valeur: 'haute',   libelle: 'Haute'   },
  { valeur: 'urgente', libelle: 'Urgente' },
];

export default function DetailReclamationAdmin() {
  const { id } = useParams<{ id: string }>();

  const [reclamation,      setReclamation]      = useState<Reclamation | null>(null);
  const [chargement,       setChargement]       = useState(true);
  const [chargementAction, setChargementAction] = useState(false);
  const [chargementMsg,    setChargementMsg]    = useState(false);
  const [erreur,           setErreur]           = useState<string | null>(null);
  const [messageSucces,    setMessageSucces]    = useState<string | null>(null);
  const [notesAdmin,       setNotesAdmin]       = useState('');
  const [modal, setModal] = useState<{ ouvert: boolean; statut: StatutReclamation }>({
    ouvert: false, statut: 'resolu',
  });

  useEffect(() => {
    if (!id) return;
    let annule = false;
    (async () => {
      setChargement(true);
      try {
        const rep = await getReclamationParId(id);
        if (!annule) {
          setReclamation(rep.data.reclamation);
          setNotesAdmin(rep.data.reclamation.notesAdmin ?? '');
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
      const rep = await modifierStatutReclamation(id, modal.statut, raison);
      setReclamation(rep.data.reclamation);
      afficherSucces('Statut mis à jour.');
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur.');
    } finally { setChargementAction(false); }
  };

  const handleChangerPriorite = async (priorite: PrioriteReclamation) => {
    if (!id) return;
    try {
      const rep = await modifierPriorite(id, priorite);
      setReclamation(rep.data.reclamation);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur.');
    }
  };

  const handleEnvoyerMessage = useCallback(async (contenu: string) => {
    if (!id) return;
    setChargementMsg(true);
    try {
      const rep = await ajouterMessage(id, contenu);
      setReclamation(rep.data.reclamation);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de l\'envoi.');
    } finally { setChargementMsg(false); }
  }, [id]);

  const handleSauvegarderNotes = async () => {
    if (!id) return;
    setChargementAction(true);
    try {
      await modifierNotesReclamation(id, notesAdmin);
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
          <div className="h-96 rounded-xl bg-gray-200" />
        </div>
      </DispositionAdmin>
    );
  }

  if (!reclamation) {
    return <DispositionAdmin><Alert variant="error">Réclamation introuvable.</Alert></DispositionAdmin>;
  }

  return (
    <DispositionAdmin>
      <Link
        to="/admin/reclamations"
        className="inline-flex items-center gap-1.5 text-sm text-[#74777d] hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft size={15} /> Retour aux réclamations
      </Link>

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span className="font-mono text-sm font-semibold text-primary bg-gray-100 px-2 py-0.5 rounded">
              {reclamation.numero}
            </span>
            <BadgeStatutTicket statut={reclamation.statut} />
            <BadgePriorite priorite={reclamation.priorite} />
          </div>
          <h1 className="text-xl font-extrabold text-primary">{reclamation.sujet}</h1>
        </div>

        {/* Actions statut */}
        <div className="flex gap-2 shrink-0 flex-wrap">
          {reclamation.statut !== 'resolu' && (
            <button
              onClick={() => setModal({ ouvert: true, statut: 'resolu' })}
              disabled={chargementAction}
              className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Marquer résolu
            </button>
          )}
          {reclamation.statut !== 'ferme' && (
            <button
              onClick={() => setModal({ ouvert: true, statut: 'ferme' })}
              disabled={chargementAction}
              className="px-4 py-2 rounded-xl bg-gray-600 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Fermer le ticket
            </button>
          )}
        </div>
      </div>

      {erreur        && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}
      {messageSucces && <div className="mb-4"><Alert variant="success">{messageSucces}</Alert></div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne principale — fil de discussion */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description initiale */}
          <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
              Description
            </h2>
            <p className="text-sm text-primary leading-relaxed whitespace-pre-wrap">
              {reclamation.description}
            </p>
            {reclamation.commande && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                <span className="text-[#74777d]">Commande liée : </span>
                <Link
                  to={`/admin/commandes/${reclamation.commande._id}`}
                  className="font-mono font-semibold text-accent hover:underline"
                >
                  {reclamation.commande.numero}
                </Link>
                <span className="text-[#74777d] ml-2">
                  — {reclamation.commande.total?.toLocaleString('fr-FR')} XOF
                </span>
              </div>
            )}
          </section>

          {/* Messages */}
          <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
              Fil de discussion
            </h2>
            <FilDiscussion
              messages={reclamation.messages ?? []}
              chargementEnvoi={chargementMsg}
              onEnvoyer={handleEnvoyerMessage}
            />
          </section>

          {/* Historique des statuts */}
          {reclamation.historiqueStatut && reclamation.historiqueStatut.length > 0 && (
            <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-4">
                <Clock size={16} aria-hidden="true" /> Historique
              </h2>
              <ol className="relative border-l border-gray-200 space-y-4 ml-2">
                {reclamation.historiqueStatut.map((h) => (
                  <li key={h._id} className="ml-4">
                    <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-accent border-2 border-white" />
                    <p className="text-sm font-semibold text-primary capitalize">
                      {h.statut.replace(/_/g, ' ')}
                    </p>
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

          {/* Utilisateur */}
          <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-3">
              <User size={16} aria-hidden="true" /> Utilisateur
            </h2>
            <p className="font-semibold text-primary">{reclamation.utilisateur?.fullName ?? '—'}</p>
            <p className="text-sm text-[#74777d] mt-0.5">{reclamation.utilisateur?.email ?? '—'}</p>
            <p className="text-xs text-[#74777d] mt-0.5 capitalize">{reclamation.roleUtilisateur}</p>
          </section>

          {/* Catégorie */}
          <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-3">
              <Tag size={16} aria-hidden="true" /> Détails du ticket
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#74777d]">Catégorie</span>
                <span className="font-medium text-primary">
                  {LABELS_CATEGORIE[reclamation.categorie] ?? reclamation.categorie}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#74777d]">Priorité</span>
                {/* Sélecteur de priorité inline */}
                <select
                  value={reclamation.priorite}
                  onChange={(e) => handleChangerPriorite(e.target.value as PrioriteReclamation)}
                  className="text-sm border border-[#c4c6cd] rounded-lg px-2 py-1 outline-none focus:border-accent"
                  aria-label="Changer la priorité"
                >
                  {OPTIONS_PRIORITE.map((o) => (
                    <option key={o.valeur} value={o.valeur}>{o.libelle}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#74777d]">Statut</span>
                <select
                  value={reclamation.statut}
                  onChange={(e) => setModal({ ouvert: true, statut: e.target.value as StatutReclamation })}
                  className="text-sm border border-[#c4c6cd] rounded-lg px-2 py-1 outline-none focus:border-accent"
                  aria-label="Changer le statut"
                >
                  {OPTIONS_STATUT.map((o) => (
                    <option key={o.valeur} value={o.valeur}>{o.libelle}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between">
                <span className="text-[#74777d]">Créé le</span>
                <span className="text-primary text-xs">
                  {new Date(reclamation.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              {reclamation.resoluAt && (
                <div className="flex justify-between">
                  <span className="text-[#74777d]">Résolu le</span>
                  <span className="text-green-600 text-xs">
                    {new Date(reclamation.resoluAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Assignation */}
          <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-3">
              <AlertTriangle size={16} aria-hidden="true" /> Assigné à
            </h2>
            {reclamation.assigneA ? (
              <div>
                <p className="font-semibold text-primary">{reclamation.assigneA.fullName}</p>
                <p className="text-sm text-[#74777d]">{reclamation.assigneA.email}</p>
              </div>
            ) : (
              <p className="text-sm text-[#74777d]">Non assigné</p>
            )}
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
        description={`Le ticket ${reclamation.numero} passera au statut « ${modal.statut.replace(/_/g, ' ')} ».`}
        labelConfirmer="Confirmer"
        variante={modal.statut === 'resolu' ? 'success' : 'warning'}
        avecRaison
        labelRaison="Commentaire (optionnel)"
        chargement={chargementAction}
        onConfirmer={handleChangerStatut}
        onAnnuler={() => setModal((m) => ({ ...m, ouvert: false }))}
      />
    </DispositionAdmin>
  );
}
