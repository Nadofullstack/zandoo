import { Link } from 'react-router-dom';
import { BookOpen, Eye, PenLine, Trash2, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import CarteStatistique from '../../../components/admin/modal/CarteStatistique';
import Pagination from '../../../components/admin/modal/Pagination';
import ModalConfirmation from '../../../components/admin/modal/ModalConfirmation';
import Alert from '../../../components/ui/Alert';
import ChampRecherche from '../../../components/admin/modal/ChampRecherche';
import { useGestionArticles } from '../../../hooks/admin/useGestionArticles';
import type { Article, StatutArticle, CategorieEditoriale } from '../../../types/admin';

const BADGE_STATUT: Record<StatutArticle, string> = {
  brouillon: 'bg-gray-100   text-gray-600   border border-gray-200',
  publie:    'bg-green-100  text-green-800  border border-green-200',
  archive:   'bg-orange-100 text-orange-700 border border-orange-200',
};
const LABEL_STATUT: Record<StatutArticle, string> = { brouillon: 'Brouillon', publie: 'Publié', archive: 'Archivé' };
const LABEL_CAT: Record<CategorieEditoriale, string> = {
  actualite: 'Actualité', conseil: 'Conseil', mise_a_jour: 'Mise à jour', autre: 'Autre',
};

const selectCls = "px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";

export default function ListeArticlesAdmin() {
  const {
    articles, pagination, statistiques, chargement, chargementAction, erreur,
    filtre, setFiltre, supprimer,
  } = useGestionArticles();

  const [modalSuppr, setModalSuppr] = useState<{ ouvert: boolean; article: Article | null }>({ ouvert: false, article: null });
  const [succes, setSucces] = useState<string | null>(null);

  const handleSupprimer = async () => {
    if (modalSuppr.article) {
      await supprimer(modalSuppr.article._id);
      setSucces('Article supprimé.'); setTimeout(() => setSucces(null), 3000);
    }
    setModalSuppr({ ouvert: false, article: null });
  };

  return (
    <DispositionAdmin>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Blog & Actualités</h1>
          <p className="text-sm text-[#74777d] mt-1">Publiez et gérez les articles de la plateforme.</p>
        </div>
        <Link to="/admin/articles/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shrink-0">
          <Plus size={16} /> Nouvel article
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <CarteStatistique titre="Total"      valeur={statistiques?.total      ?? 0} icone={BookOpen} couleur="primary" />
        <CarteStatistique titre="Publiés"    valeur={statistiques?.publies    ?? 0} icone={Eye}      couleur="success" />
        <CarteStatistique titre="Brouillons" valeur={statistiques?.brouillons ?? 0} icone={PenLine}  couleur="warning" />
        <CarteStatistique titre="Vues"       valeur={statistiques?.vues       ?? 0} icone={Eye}      couleur="accent"  />
      </div>

      {erreur  && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}
      {succes  && <div className="mb-4"><Alert variant="success">{succes}</Alert></div>}

      <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <ChampRecherche valeur={filtre.recherche}
            onChange={(v) => setFiltre({ recherche: v, page: 1 })} placeholder="Rechercher un article…" />
          <select value={filtre.statut} onChange={(e) => setFiltre({ statut: e.target.value as StatutArticle | '', page: 1 })} className={selectCls}>
            <option value="">Tous statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publié</option>
            <option value="archive">Archivé</option>
          </select>
          <select value={filtre.categorieEditoriale} onChange={(e) => setFiltre({ categorieEditoriale: e.target.value as CategorieEditoriale | '', page: 1 })} className={selectCls}>
            <option value="">Toutes catégories</option>
            <option value="actualite">Actualité</option>
            <option value="conseil">Conseil</option>
            <option value="mise_a_jour">Mise à jour</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div className="p-4">
          {chargement ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />)}</div>
          ) : articles.length === 0 ? (
            <p className="text-center py-16 text-[#74777d] text-sm">Aucun article trouvé.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm" aria-label="Liste des articles">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Titre', 'Catégorie', 'Auteur', 'Statut', 'Vues', 'Date', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.map((art) => (
                    <tr key={art._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5 max-w-[220px]">
                        <p className="font-medium text-primary truncate">{art.titre}</p>
                        {art.resume && <p className="text-xs text-[#74777d] truncate mt-0.5">{art.resume}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#74777d]">{LABEL_CAT[art.categorieEditoriale]}</td>
                      <td className="px-4 py-3.5 text-xs text-[#74777d]">{art.auteur?.fullName ?? '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${BADGE_STATUT[art.statut]}`}>
                          {LABEL_STATUT[art.statut]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#74777d]">{art.vues.toLocaleString('fr-FR')}</td>
                      <td className="px-4 py-3.5 text-xs text-[#74777d] whitespace-nowrap">
                        {art.publieAt
                          ? new Date(art.publieAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
                          : new Date(art.createdAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {chargementAction ? <Loader2 size={16} className="animate-spin text-accent" /> : <>
                            <Link to={`/admin/articles/${art._id}`} title="Modifier"
                              className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                              <PenLine size={16} />
                            </Link>
                            <button onClick={() => setModalSuppr({ ouvert: true, article: art })} title="Supprimer"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && !chargement && (
            <Pagination page={pagination.page} totalPages={pagination.totalPages}
              total={pagination.total} limite={pagination.limite}
              onChangerPage={(p) => setFiltre({ page: p })} />
          )}
        </div>
      </div>

      <ModalConfirmation
        ouvert={modalSuppr.ouvert}
        titre="Supprimer cet article ?"
        description={`« ${modalSuppr.article?.titre} » sera définitivement supprimé.`}
        labelConfirmer="Supprimer" variante="danger" chargement={chargementAction}
        onConfirmer={handleSupprimer}
        onAnnuler={() => setModalSuppr({ ouvert: false, article: null })}
      />
    </DispositionAdmin>
  );
}
