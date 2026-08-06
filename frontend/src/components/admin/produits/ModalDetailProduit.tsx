import { useState, useEffect } from 'react';
import { X, Trash2, Package } from 'lucide-react';
import BadgeStatutProduit from './BadgeStatutProduit';
import ModalConfirmation from '../modal/ModalConfirmation';
import { getProduitParId, supprimerProduit } from '../../../services/admin/adminProduitService';
import type { Produit } from '../../../types/admin';

interface Props {
  produitId: string | null;
  onFermer: () => void;
  onProduitSupprime?: (id: string) => void;
}

function formatPrix(v: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(v);
}

function InfoLigne({
  label,
  valeur,
  multiline = false,
}: {
  label: string;
  valeur: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-[#74777d] uppercase tracking-wide">{label}</span>
      <span className={`text-sm text-primary ${multiline ? 'whitespace-pre-wrap' : 'truncate'}`}>
        {valeur || '—'}
      </span>
    </div>
  );
}

export default function ModalDetailProduit({ produitId, onFermer, onProduitSupprime }: Props) {
  const [produit, setProduit] = useState<Produit | null>(null);
  const [chargement, setChargement] = useState(false);
  const [chargementSuppression, setChargementSuppression] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [modalSupprimer, setModalSupprimer] = useState(false);

  /* Charger le produit quand produitId change */
  useEffect(() => {
    if (!produitId) {
      setProduit(null);
      return;
    }
    let annule = false;
    setChargement(true);
    setErreur(null);
    getProduitParId(produitId)
      .then((rep) => { if (!annule) setProduit(rep.data.produit); })
      .catch((err) => { if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.'); })
      .finally(() => { if (!annule) setChargement(false); });
    return () => { annule = true; };
  }, [produitId]);

  const handleSupprimer = async () => {
    if (!produitId) return;
    setChargementSuppression(true);
    setModalSupprimer(false);
    try {
      await supprimerProduit(produitId);
      onProduitSupprime?.(produitId);
      onFermer();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
      setChargementSuppression(false);
    }
  };

  if (!produitId) return null;

  return (
    <>
      {/* Fond semi-transparent */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-sm px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-produit-titre"
        onClick={(e) => { if (e.target === e.currentTarget) onFermer(); }}
      >
        <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

          {/* ── En-tête ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <Package size={18} className="text-accent shrink-0" />
              <h2 id="modal-produit-titre" className="text-base font-bold text-primary truncate max-w-[340px]">
                {chargement ? 'Chargement…' : (produit?.nom ?? 'Détail produit')}
              </h2>
              {produit && <BadgeStatutProduit statut={produit.statut} />}
            </div>
            <button
              onClick={onFermer}
              aria-label="Fermer"
              className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Corps (scrollable) ───────────────────────────────────────── */}
          <div className="overflow-y-auto p-6 space-y-5 flex-1">

            {/* Erreur */}
            {erreur && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {erreur}
              </p>
            )}

            {/* Skeleton */}
            {chargement && (
              <div className="space-y-4 animate-pulse">
                <div className="h-48 rounded-xl bg-gray-200" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 rounded-xl bg-gray-200" />
                  <div className="h-32 rounded-xl bg-gray-200" />
                </div>
              </div>
            )}

            {/* Contenu */}
            {produit && !chargement && (
              <>
                {/* Photo de couverture */}
                {produit.photoCouverture && (
                  <img
                    src={produit.photoCouverture}
                    alt={produit.nom}
                    className="w-full max-h-56 object-contain rounded-2xl border border-gray-200 bg-gray-50"
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Informations générales */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wide">Informations</h3>
                    <InfoLigne label="Référence"   valeur={produit.reference} />
                    <InfoLigne label="Catégorie"   valeur={typeof produit.categorie === 'object' ? produit.categorie?.nom : '—'} />
                    <InfoLigne label="Vendeur"     valeur={typeof produit.vendeur === 'object' ? produit.vendeur?.nomEntreprise ?? '—' : '—'} />
                    <InfoLigne label="Description" valeur={produit.description} multiline />
                  </div>

                  {/* Prix & Stock */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wide">Prix & Stock</h3>
                    <InfoLigne label="Prix"     valeur={formatPrix(produit.prix)} />
                    {produit.prixPromotionnel && (
                      <InfoLigne label="Prix promo" valeur={formatPrix(produit.prixPromotionnel)} />
                    )}
                    <InfoLigne
                      label="Quantité"
                      valeur={`${produit.quantiteDisponible} unité${produit.quantiteDisponible !== 1 ? 's' : ''}`}
                    />
                    <InfoLigne label="En stock" valeur={produit.enStock ? 'Oui' : 'Non'} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Pied ────────────────────────────────────────────────────── */}
          {produit && !chargement && (
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setModalSupprimer(true)}
                disabled={chargementSuppression}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 size={15} />
                {chargementSuppression ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <ModalConfirmation
        ouvert={modalSupprimer}
        titre="Supprimer définitivement ?"
        description={`Cette action est irréversible. « ${produit?.nom ?? ''} » sera supprimé de la plateforme.`}
        labelConfirmer="Supprimer"
        variante="danger"
        chargement={chargementSuppression}
        onConfirmer={handleSupprimer}
        onAnnuler={() => setModalSupprimer(false)}
      />
    </>
  );
}
