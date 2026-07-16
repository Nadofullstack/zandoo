import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, CheckCircle, Ban } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import BadgeStatut from '../../../components/admin/modal/BadgeStatut';
import SectionDocuments from '../../../components/admin/vendeurs/SectionDocuments';
import HistoriqueStatut from '../../../components/admin/vendeurs/HistoriqueStatut';
import NotesAdmin from '../../../components/admin/vendeurs/NotesAdmin';
import ModalConfirmation from '../../../components/admin/modal/ModalConfirmation';
import Alert from '../../../components/ui/Alert';
import { useProfilVendeur } from '../../../hooks/useProfilVendeur';
import type { StatutVendeur } from '../../../types/admin';

/**
 * Page de profil détaillé d'un vendeur.
 * Informations entreprise, contact, documents légaux, historique, notes admin.
 */
export default function ProfilVendeurAdmin() {
  const { id } = useParams<{ id: string }>();
  const {
    vendeur,
    chargement,
    chargementAction,
    erreur,
    messageSucces,
    changerStatut,
    sauvegarderNotes,
  } = useProfilVendeur(id ?? '');

  const [modalStatut, setModalStatut] = useState<{
    ouvert: boolean;
    type: 'approuver' | 'suspendre';
  }>({ ouvert: false, type: 'approuver' });

  if (chargement) {
    return (
      <DispositionAdmin>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-40 rounded-xl bg-gray-200" />
          <div className="h-60 rounded-xl bg-gray-200" />
        </div>
      </DispositionAdmin>
    );
  }

  if (!vendeur) {
    return (
      <DispositionAdmin>
        <Alert variant="error">Vendeur introuvable.</Alert>
      </DispositionAdmin>
    );
  }

  const handleConfirmerStatut = (raison?: string) => {
    const statut: StatutVendeur = modalStatut.type === 'approuver' ? 'approuve' : 'suspendu';
    changerStatut(statut, raison);
    setModalStatut((prev) => ({ ...prev, ouvert: false }));
  };

  return (
    <DispositionAdmin>

      {/* Retour */}
      <Link
        to="/admin/vendeurs"
        className="inline-flex items-center gap-1.5 text-sm text-[#74777d] hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Retour à la liste
      </Link>

      {/* Messages */}
      {erreur && (
        <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>
      )}
      {messageSucces && (
        <div className="mb-4"><Alert variant="success">{messageSucces}</Alert></div>
      )}

      {/* En-tête profil */}
      <div className="bg-surface border border-gray-200 rounded-2xl p-6 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-extrabold text-primary">{vendeur.nomEntreprise}</h1>
            <BadgeStatut statut={vendeur.statut} />
          </div>
          <p className="text-sm text-[#74777d]">
            Inscrit le {new Date(vendeur.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 shrink-0">
          {vendeur.statut !== 'approuve' && (
            <button
              onClick={() => setModalStatut({ ouvert: true, type: 'approuver' })}
              disabled={chargementAction}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={15} aria-hidden="true" />
              Approuver
            </button>
          )}
          {vendeur.statut !== 'suspendu' && (
            <button
              onClick={() => setModalStatut({ ouvert: true, type: 'suspendre' })}
              disabled={chargementAction}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <Ban size={15} aria-hidden="true" />
              Suspendre
            </button>
          )}
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">

          {/* Informations entreprise */}
          <div className="bg-surface border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 size={15} className="text-accent" aria-hidden="true" />
              Informations entreprise
            </h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <InfoLigne libelle="Type" valeur={vendeur.typeEntreprise ?? '—'} />
              <InfoLigne libelle="Secteur" valeur={vendeur.secteurActivite ?? '—'} />
              <InfoLigne libelle="Ville" valeur={vendeur.adresse?.ville ?? '—'} icone={MapPin} />
              <InfoLigne libelle="Pays" valeur={vendeur.adresse?.pays ?? '—'} />
              {vendeur.adresse?.rue && (
                <InfoLigne libelle="Rue" valeur={vendeur.adresse.rue} spanFull />
              )}
            </dl>
          </div>

          {/* Informations du compte utilisateur */}
          <div className="bg-surface border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={15} className="text-accent" aria-hidden="true" />
              Compte utilisateur
            </h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <InfoLigne libelle="Nom complet"  valeur={vendeur.utilisateur?.fullName   ?? '—'} />
              <InfoLigne libelle="Email"        valeur={vendeur.utilisateur?.email      ?? '—'} icone={Mail} />
              <InfoLigne libelle="Téléphone"    valeur={vendeur.utilisateur?.telephone  ?? '—'} icone={Phone} />
              <InfoLigne libelle="Compte actif" valeur={vendeur.utilisateur?.isActive ? 'Oui' : 'Non'} />
            </dl>
          </div>

          {/* Documents légaux */}
          <SectionDocuments documents={vendeur.documents} />

        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          <NotesAdmin
            notesInitiales={vendeur.notesAdmin ?? ''}
            chargement={chargementAction}
            onSauvegarder={sauvegarderNotes}
          />
          <HistoriqueStatut historique={vendeur.historiqueStatut} />
        </div>

      </div>

      {/* Modal confirmation statut */}
      <ModalConfirmation
        ouvert={modalStatut.ouvert}
        titre={modalStatut.type === 'approuver' ? 'Approuver ce vendeur ?' : 'Suspendre ce vendeur ?'}
        description={
          modalStatut.type === 'approuver'
            ? `Vous allez approuver « ${vendeur.nomEntreprise} ». Le vendeur pourra accéder à la plateforme.`
            : `Vous allez suspendre « ${vendeur.nomEntreprise} ». Son accès sera immédiatement révoqué.`
        }
        labelConfirmer={modalStatut.type === 'approuver' ? 'Approuver' : 'Suspendre'}
        variante={modalStatut.type === 'approuver' ? 'success' : 'danger'}
        avecRaison={modalStatut.type === 'suspendre'}
        chargement={chargementAction}
        onConfirmer={handleConfirmerStatut}
        onAnnuler={() => setModalStatut((prev) => ({ ...prev, ouvert: false }))}
      />

    </DispositionAdmin>
  );
}

/* ── Composant local : ligne de définition ────────────────────────────────── */

interface InfoLigneProps {
  libelle: string;
  valeur: string;
  icone?: typeof Mail;
  spanFull?: boolean;
}

function InfoLigne({ libelle, valeur, spanFull }: InfoLigneProps) {
  return (
    <div className={spanFull ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-semibold text-[#74777d] uppercase tracking-wider">{libelle}</dt>
      <dd className="mt-0.5 text-primary font-medium">{valeur}</dd>
    </div>
  );
}
