import { useState } from 'react';
import { Plus, Package, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import CarteStatistique from '../../../components/admin/modal/CarteStatistique';
import TableauProduits from '../../../components/admin/produits/TableauProduits';
import FiltresProduits from '../../../components/admin/produits/FiltresProduits';
import Pagination from '../../../components/admin/modal/Pagination';
import Alert from '../../../components/ui/Alert';
import ModalCreationProduit from '../../../components/admin/produits/ModalCreationProduit';
import { useGestionProduits } from '../../../hooks/admin/useGestionProduits';
import { useGestionCategories } from '../../../hooks/admin/useGestionCategories';
import type { StatutProduit } from '../../../types/admin';

export default function ListeProduitsAdmin() {
  const {
    produits, pagination, statistiques, chargement, chargementAction, erreur,
    filtre, setFiltre, changerStatutProduit, supprimerProduit, recharger,
  } = useGestionProduits();

  const { categories } = useGestionCategories();

  const [modalCreation, setModalCreation]   = useState(false);
  const [produitAModifier, setProduitAModifier] = useState<string | null>(null);

  return (
    <DispositionAdmin>

      {/* Modal création / modification */}
      <ModalCreationProduit
        ouvert={modalCreation || !!produitAModifier}
        produitId={produitAModifier}
        onFermer={() => { setModalCreation(false); setProduitAModifier(null); }}
        onSucces={() => { setModalCreation(false); setProduitAModifier(null); recharger(); }}
      />

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Gestion des produits</h1>
          <p className="text-sm text-[#74777d] mt-1">Catalogue global — gestion du stock.</p>
        </div>
        <button
          onClick={() => setModalCreation(true)}
          className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors">
          <Plus size={16} aria-hidden /> Nouveau produit
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CarteStatistique titre="Total"       valeur={statistiques?.total     ?? 0} icone={Package}        couleur="primary"  />
        <CarteStatistique titre="En stock"    valeur={statistiques?.enStock   ?? 0} icone={CheckCircle2}   couleur="success"  />
        <CarteStatistique titre="Faible"      valeur={statistiques?.faible    ?? 0} icone={AlertTriangle}  couleur="warning"  />
        <CarteStatistique titre="En rupture"  valeur={statistiques?.enRupture ?? 0} icone={XCircle}        couleur="danger"   />
      </div>

      {erreur && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}

      {/* Filtres + tableau */}
      <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <FiltresProduits
            recherche={filtre.recherche}
            statut={filtre.statut as StatutProduit | ''}
            categorieId={filtre.categorie}
            categories={categories}
            onRechercheChange={(v) => setFiltre({ recherche: v, page: 1 })}
            onStatutChange={(v)    => setFiltre({ statut: v,    page: 1 })}
            onCategorieChange={(v) => setFiltre({ categorie: v, page: 1 })}
          />
        </div>

        <div className="p-4">
          {chargement ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <TableauProduits
              produits={produits}
              chargementAction={chargementAction}
              onChangerStatut={changerStatutProduit}
              onSupprimer={supprimerProduit}
              onModifier={(id) => setProduitAModifier(id)}
            />
          )}

          {pagination && !chargement && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limite={pagination.limite}
              onChangerPage={(p) => setFiltre({ page: p })}
            />
          )}
        </div>
      </div>

    </DispositionAdmin>
  );
}
