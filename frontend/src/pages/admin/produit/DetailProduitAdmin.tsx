import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import BadgeStatutProduit from '../../../components/admin/produits/BadgeStatutProduit';
import ModalConfirmation from '../../../components/admin/modal/ModalConfirmation';
import Alert from '../../../components/ui/Alert';
import { getProduitParId, supprimerProduit } from '../../../services/admin/adminProduitService';
import type { Produit } from '../../../types/admin';

export default function DetailProduitAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [produit, setProduit] = useState<Produit | null>(null);
  const [chargement, setChargement] = useState(true);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [modalSupprimer, setModalSupprimer] = useState(false);

  useEffect(() => {
    if (!id) return;
    let annule = false;
    (async () => {
      setChargement(true);
      try {
        const rep = await getProduitParId(id);
        if (!annule) setProduit(rep.data.produit);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => { annule = true; };
  }, [id]);

  const handleSupprimer = async () => {
    if (!id) return;
    setChargementAction(true);
    setModalSupprimer(false);
    try {
      await supprimerProduit(id);
      navigate('/admin/produits');
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
      setChargementAction(false);
    }
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

  if (!produit) {
    return <DispositionAdmin><Alert variant="error">Produit introuvable.</Alert></DispositionAdmin>;
  }

  return (
    <DispositionAdmin>
      <Link to="/admin/produits"
        className="inline-flex items-center gap-1.5 text-sm text-[#74777d] hover:text-primary transition-colors mb-6">
        <ArrowLeft size={15} /> Retour au catalogue
      </Link>

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-primary">{produit.nom}</h1>
          <BadgeStatutProduit statut={produit.statut} />
        </div>

        {/* Seule action admin : suppression pour modération */}
        <button
          onClick={() => setModalSupprimer(true)}
          disabled={chargementAction}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 shrink-0">
          <Trash2 size={15} /> Supprimer
        </button>
      </div>

      {erreur && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}

      {/* Informations produit (lecture seule) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {produit.photoCouverture && (
          <div className="md:col-span-2">
            <img
              src={produit.photoCouverture}
              alt={produit.nom}
              className="w-full max-h-64 object-contain rounded-2xl border border-gray-200 bg-gray-50"
            />
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wide">Informations</h2>
          <InfoLigne label="Référence"   valeur={produit.reference} />
          <InfoLigne label="Catégorie"   valeur={typeof produit.categorie === 'object' ? produit.categorie?.nom : '—'} />
          <InfoLigne label="Vendeur"     valeur={typeof produit.vendeur === 'object' ? produit.vendeur?.nomEntreprise ?? '—' : '—'} />
          <InfoLigne label="Description" valeur={produit.description} multiline />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wide">Prix & Stock</h2>
          <InfoLigne label="Prix"      valeur={formatPrix(produit.prix)} />
          {produit.prixPromotionnel && (
            <InfoLigne label="Prix promo" valeur={formatPrix(produit.prixPromotionnel)} />
          )}
          <InfoLigne label="Quantité"  valeur={`${produit.quantiteDisponible} unité${produit.quantiteDisponible !== 1 ? 's' : ''}`} />
          <InfoLigne label="En stock"  valeur={produit.enStock ? 'Oui' : 'Non'} />
        </div>
      </div>

      <ModalConfirmation
        ouvert={modalSupprimer}
        titre="Supprimer définitivement ?"
        description={`Cette action est irréversible. « ${produit.nom} » sera supprimé de la plateforme.`}
        labelConfirmer="Supprimer"
        variante="danger"
        chargement={chargementAction}
        onConfirmer={handleSupprimer}
        onAnnuler={() => setModalSupprimer(false)}
      />
    </DispositionAdmin>
  );
}

function formatPrix(v: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(v);
}

function InfoLigne({ label, valeur, multiline = false }: { label: string; valeur: string; multiline?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-[#74777d] uppercase tracking-wide">{label}</span>
      <span className={`text-sm text-primary ${multiline ? 'whitespace-pre-wrap' : 'truncate'}`}>{valeur || '—'}</span>
    </div>
  );
}
