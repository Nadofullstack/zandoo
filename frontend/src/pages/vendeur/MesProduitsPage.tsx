import { useState } from 'react';
import { Package, PackageX, PackageCheck, AlertTriangle, Plus, Search, Pencil, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import DispositionVendeur from '../../components/vendeur/layout/DispositionVendeur';
import Alert from '../../components/ui/Alert';
import ModalCreationProduit from '../../components/vendeur/produits/ModalCreationProduit';
import CarteStatistique from '../../components/admin/modal/CarteStatistique';
import { useProduitsVendeur } from '../../hooks/vendeur/useProduitsVendeur';
import { creerProduitVendeur, modifierProduitVendeur } from '../../services/vendeur/vendeurService';
import { uploadPhotos as vendeurUploadPhotos, uploadVideo as vendeurUploadVideo } from '../../services/vendeur/vendeurUploadService';
import type { ProduitVendeur } from '../../types/vendeur';
import { getCategoriesPlates as getCategoriesVendeur, creerCategorie as creerCategorieVendeur } from '../../services/vendeur/vendeurCategorieService';

/* Badge statut stock */
function BadgeStock({ statut }: { statut: string }) {
  const map: Record<string, string> = {
    en_stock: 'bg-green-100 text-green-700',
    faible: 'bg-yellow-100 text-yellow-700',
    en_rupture: 'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    en_stock: 'En stock',
    faible: 'Faible',
    en_rupture: 'Rupture',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[statut] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[statut] ?? statut}
    </span>
  );
}

export default function MesProduitsPage() {
  const {
    produits, statistiques, pagination, filtre,
    chargement, erreur, setFiltre, supprimerProduit,
    mettreAJourStockProduit, changerStatutProduit, rafraichir,
  } = useProduitsVendeur();

  const [modalOuvert, setModalOuvert] = useState(false);
  const [produitId, setProduitId] = useState<string | null>(null);
  const [confirmerSuppId, setConfirmerSuppId] = useState<string | null>(null);
  const [rechercheInput, setRechercheInput] = useState('');

  const handleRechercheSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFiltre({ recherche: rechercheInput, page: 1 });
  };

  const ouvrir = (id?: string) => { setProduitId(id ?? null); setModalOuvert(true); };
  const fermer = () => { setModalOuvert(false); setProduitId(null); };
  const apresSucces = () => { fermer(); rafraichir(); };

  return (
    <DispositionVendeur>
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-primary">Mes produits</h1>
          <p className="text-sm text-[#74777d] mt-1">Gérez votre catalogue de produits.</p>
        </div>
        <button
          onClick={() => ouvrir()}
          className="cursor-pointer flex items-center gap-2 bg-accent text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-colors shadow w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus size={16} aria-hidden /> Ajouter un produit
        </button>
      </header>

      {erreur && <div className="mb-5"><Alert variant="error">{erreur}</Alert></div>}

      {/* Statistiques rapides */}
      {statistiques && (
        <section aria-label="Statistiques produits" className="mb-6">
          <h2 className="text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-3">
            Mes produits
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { libelle: 'Total',    valeur: statistiques.total,     icone: Package,   couleur: 'primary'  as const },
              { libelle: 'En stock', valeur: statistiques.enStock,   icone: Package,   couleur: 'success'  as const },
              { libelle: 'Faible',   valeur: statistiques.faible,    icone: Package,   couleur: 'warning'  as const },
              { libelle: 'Rupture',  valeur: statistiques.enRupture, icone: PackageX,  couleur: 'danger'   as const },
            ].map(({ libelle, valeur, icone, couleur }) => (
              <CarteStatistique key={libelle} titre={libelle} valeur={valeur} icone={icone} couleur={couleur} />
            ))}
          </div>
        </section>
      )}

      {/* Filtres */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          <form onSubmit={handleRechercheSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
              <input
                type="text"
                placeholder="Rechercher un produit…"
                value={rechercheInput}
                onChange={(e) => setRechercheInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
              OK
            </button>
          </form>

          <div className="relative">
            <select
              value={filtre.statut}
              onChange={(e) => setFiltre({ statut: e.target.value, page: 1 })}
              className="appearance-none pl-3 pr-8 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20"
            >
              <option value="">Tous les statuts</option>
              <option value="en_stock">En stock</option>
              <option value="faible">Faible</option>
              <option value="en_rupture">Rupture</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Tableau */}
        <div className="p-4">
          {chargement ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-accent" />
            </div>
          ) : produits.length === 0 ? (
            <div className="text-center py-16 text-[#74777d] text-sm">
              <Package size={36} className="mx-auto mb-3 text-gray-300" />
              Aucun produit trouvé.
              <button onClick={() => ouvrir()} className="block mx-auto mt-3 text-accent hover:underline font-medium text-sm">
                Créer votre premier produit
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm" aria-label="Liste des produits">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Produit</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Référence</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Prix</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Stock</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Statut</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {produits.map((p) => (
                    <LigneProduit
                      key={p._id}
                      produit={p}
                      onModifier={() => ouvrir(p._id)}
                      onSupprimer={() => setConfirmerSuppId(p._id)}
                      onMajStock={mettreAJourStockProduit}
                      onChangerStatut={changerStatutProduit}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && !chargement && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 text-sm text-[#74777d]">
              <p>{pagination.total} produit{pagination.total > 1 ? 's' : ''}</p>
              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFiltre({ page: p })}
                    className={[
                      'w-8 h-8 rounded-lg text-xs font-semibold',
                      filtre.page === p ? 'bg-accent text-white' : 'bg-gray-100 text-primary hover:bg-gray-200',
                    ].join(' ')}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal confirmation suppression */}
      {confirmerSuppId && (
        <div
          role="dialog" aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 backdrop-blur-sm px-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-red-100">
                <PackageX size={18} className="text-red-600" aria-hidden />
              </div>
              <h3 className="text-base font-bold text-primary">Supprimer ce produit ?</h3>
            </div>
            <p className="text-sm text-[#74777d] mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmerSuppId(null)}
                className="cursor-pointer px-4 py-2 text-sm font-semibold text-[#74777d] hover:bg-gray-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={async () => { await supprimerProduit(confirmerSuppId); setConfirmerSuppId(null); }}
                className="cursor-pointer px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal produit (réutilise le composant admin avec les routes vendeur) */}
      <ModalCreationProduit
        ouvert={modalOuvert}
        onFermer={fermer}
        onSucces={apresSucces}
        produitId={produitId}
        fnCreer={creerProduitVendeur}
        fnModifier={modifierProduitVendeur}
        fnGetCategories={getCategoriesVendeur}
        fnCreerCategorie={creerCategorieVendeur}
        fnUploadPhotos={vendeurUploadPhotos}
        fnUploadVideo={vendeurUploadVideo}
      />

    </DispositionVendeur>
  );
}

/* ── Ligne du tableau ────────────────────────────────────────────────────── */

interface LigneProduitProps {
  produit: ProduitVendeur;
  onModifier: () => void;
  onSupprimer: () => void;
  onMajStock: (id: string, qte: number) => Promise<void>;
  onChangerStatut: (id: string, statut: 'en_stock' | 'faible' | 'en_rupture') => Promise<void>;
}

function LigneProduit({ produit, onModifier, onSupprimer, onMajStock, onChangerStatut }: LigneProduitProps) {
  const [editStock, setEditStock] = useState(false);
  const [stockVal, setStockVal] = useState(String(produit.quantiteDisponible));
  const [saving, setSaving] = useState(false);
  const [changingStatut, setChangingStatut] = useState(false);

  const sauvegarderStock = async () => {
    if (stockVal === String(produit.quantiteDisponible)) { setEditStock(false); return; }
    setSaving(true);
    await onMajStock(produit._id, Number(stockVal));
    setSaving(false);
    setEditStock(false);
  };

  const handleChangerStatut = async (statut: 'en_stock' | 'faible' | 'en_rupture') => {
    setChangingStatut(true);
    await onChangerStatut(produit._id, statut);
    setChangingStatut(false);
  };

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
            {produit.photoCouverture
              ? <img src={produit.photoCouverture} alt={produit.nom} className="w-full h-full object-cover" />
              : <Package size={18} className="m-auto mt-2 text-gray-300" />
            }
          </div>
          <p className="font-semibold text-primary truncate max-w-[160px]">{produit.nom}</p>
        </div>
      </td>
      <td className="px-4 py-3.5 font-mono text-xs text-[#74777d]">{produit.reference}</td>
      <td className="px-4 py-3.5 font-semibold text-primary whitespace-nowrap">
        {produit.prix.toLocaleString('fr-FR')} FCFA
        {produit.prixPromotionnel && (
          <span className="ml-1.5 text-xs text-accent font-semibold">
            → {produit.prixPromotionnel.toLocaleString('fr-FR')}
          </span>
        )}
      </td>
      <td className="px-4 py-3.5">
        {editStock ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number" min={0} value={stockVal}
              onChange={(e) => setStockVal(e.target.value)}
              className="w-16 px-2 py-1 border border-accent rounded-lg text-xs text-primary focus:outline-none"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') sauvegarderStock(); if (e.key === 'Escape') setEditStock(false); }}
            />
            {saving
              ? <Loader2 size={13} className="animate-spin text-accent" />
              : <button onClick={sauvegarderStock} className="text-xs font-semibold text-accent hover:underline">OK</button>
            }
          </div>
        ) : (
          <button
            onClick={() => { setStockVal(String(produit.quantiteDisponible)); setEditStock(true); }}
            className="text-sm text-primary hover:text-accent hover:underline transition-colors"
            title="Cliquer pour modifier le stock"
          >
            {produit.quantiteDisponible}
          </button>
        )}
      </td>
      <td className="px-4 py-3.5">
        <BadgeStock statut={produit.statut} />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1">
          {changingStatut ? (
            <Loader2 size={15} className="animate-spin text-accent" />
          ) : (
            <>
              {/* Marquer en stock */}
              {produit.statut !== 'en_stock' && (
                <button
                  onClick={() => handleChangerStatut('en_stock')}
                  title="Marquer en stock"
                  aria-label="Marquer en stock"
                  className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                >
                  <PackageCheck size={15} />
                </button>
              )}
              {/* Marquer stock faible */}
              {produit.statut !== 'faible' && (
                <button
                  onClick={() => handleChangerStatut('faible')}
                  title="Marquer stock faible"
                  aria-label="Marquer stock faible"
                  className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 transition-colors"
                >
                  <AlertTriangle size={15} />
                </button>
              )}
              {/* Marquer en rupture */}
              {produit.statut !== 'en_rupture' && (
                <button
                  onClick={() => handleChangerStatut('en_rupture')}
                  title="Marquer en rupture"
                  aria-label="Marquer en rupture"
                  className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"
                >
                  <PackageX size={15} />
                </button>
              )}
              {/* Modifier */}
              <button
                onClick={onModifier}
                className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                title="Modifier"
                aria-label={`Modifier ${produit.nom}`}
              >
                <Pencil size={15} />
              </button>
              {/* Supprimer */}
              <button
                onClick={onSupprimer}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                title="Supprimer"
                aria-label={`Supprimer ${produit.nom}`}
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
