import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import FormulaireProduit from '../../../components/admin/produits/FormulaireProduit';
import BadgeStatutProduit from '../../../components/admin/produits/BadgeStatutProduit';
import ModalConfirmation from '../../../components/admin/modal/ModalConfirmation';
import Alert from '../../../components/ui/Alert';
import { useGestionCategories } from '../../../hooks/admin/useGestionCategories';
import { getProduitParId, modifierProduit, modifierStatutProduit, supprimerProduit } from '../../../services/admin/adminProduitService';
import type { Produit, FormulaireProduiit } from '../../../types/admin';
import { useEffect } from 'react';

export default function DetailProduitAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { categories } = useGestionCategories();

  const [produit, setProduit] = useState<Produit | null>(null);
  const [chargement, setChargement] = useState(true);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);
  const [modalStatut, setModalStatut] = useState<{ ouvert: boolean; type: 'approuver' | 'rejeter' | 'supprimer' }>({
    ouvert: false, type: 'approuver',
  });

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

  const afficherSucces = (msg: string) => {
    setMessageSucces(msg);
    setTimeout(() => setMessageSucces(null), 3000);
  };

  const handleModifier = async (donnees: Partial<FormulaireProduiit>) => {
    if (!id) return;
    setChargementAction(true);
    setErreur(null);
    try {
      const rep = await modifierProduit(id, donnees);
      setProduit(rep.data.produit);
      afficherSucces('Produit mis à jour.');
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de mise à jour.');
    } finally { setChargementAction(false); }
  };

  const handleConfirmerModal = async (raison?: string) => {
    if (!id) return;
    setChargementAction(true);
    setModalStatut((m) => ({ ...m, ouvert: false }));
    try {
      if (modalStatut.type === 'supprimer') {
        await supprimerProduit(id);
        navigate('/admin/produits');
      } else {
        const statut = modalStatut.type === 'approuver' ? 'approuve' : 'rejete';
        const rep = await modifierStatutProduit(id, statut, raison);
        setProduit(rep.data.produit);
        afficherSucces(`Produit ${statut}.`);
      }
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur.');
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
        <div className="flex gap-2 shrink-0">
          {produit.statut !== 'approuve' && (
            <button onClick={() => setModalStatut({ ouvert: true, type: 'approuver' })}
              disabled={chargementAction}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
              <CheckCircle size={15} /> Approuver
            </button>
          )}
          {produit.statut !== 'rejete' && (
            <button onClick={() => setModalStatut({ ouvert: true, type: 'rejeter' })}
              disabled={chargementAction}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50">
              <XCircle size={15} /> Rejeter
            </button>
          )}
          <button onClick={() => setModalStatut({ ouvert: true, type: 'supprimer' })}
            disabled={chargementAction}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
            <Trash2 size={15} /> Supprimer
          </button>
        </div>
      </div>

      {erreur      && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}
      {messageSucces && <div className="mb-4"><Alert variant="success">{messageSucces}</Alert></div>}

      <FormulaireProduit
        produitInitial={produit}
        categories={categories}
        onSoumettre={handleModifier}
        chargement={chargementAction}
      />

      <ModalConfirmation
        ouvert={modalStatut.ouvert}
        titre={
          modalStatut.type === 'approuver' ? 'Approuver ce produit ?' :
          modalStatut.type === 'rejeter'   ? 'Rejeter ce produit ?' :
                                             'Supprimer définitivement ?'
        }
        description={
          modalStatut.type === 'approuver' ? `« ${produit.nom} » sera publié sur la plateforme.` :
          modalStatut.type === 'rejeter'   ? 'Le vendeur sera informé du motif de rejet.' :
                                             'Cette action est irréversible.'
        }
        labelConfirmer={modalStatut.type === 'approuver' ? 'Approuver' : modalStatut.type === 'rejeter' ? 'Rejeter' : 'Supprimer'}
        variante={modalStatut.type === 'approuver' ? 'success' : 'danger'}
        avecRaison={modalStatut.type === 'rejeter'}
        chargement={chargementAction}
        onConfirmer={handleConfirmerModal}
        onAnnuler={() => setModalStatut((m) => ({ ...m, ouvert: false }))}
      />
    </DispositionAdmin>
  );
}
