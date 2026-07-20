import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Eye, PauseCircle, PlayCircle, Trash2, Plus, Loader2 } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import CarteStatistique from '../../../components/admin/modal/CarteStatistique';
import Pagination from '../../../components/admin/modal/Pagination';
import ModalConfirmation from '../../../components/admin/modal/ModalConfirmation';
import Alert from '../../../components/ui/Alert';
import { useGestionPublicites } from '../../../hooks/useGestionPublicites';
import type { Publicite, StatutPublicite, TypePublicite, EmplacementPublicite } from '../../../types/admin';

/* ── Badges ─────────────────────────────────────────────────────────────── */
const BADGE_STATUT: Record<StatutPublicite, string> = {
  brouillon: 'bg-gray-100   text-gray-600   border border-gray-200',
  active:    'bg-green-100  text-green-800  border border-green-200',
  pausee:    'bg-yellow-100 text-yellow-800 border border-yellow-200',
  expiree:   'bg-red-100    text-red-800    border border-red-200',
};
const LABEL_STATUT: Record<StatutPublicite, string> = {
  brouillon: 'Brouillon', active: 'Active', pausee: 'Pausée', expiree: 'Expirée',
};
const LABEL_TYPE: Record<TypePublicite, string> = {
  banniere: 'Bannière', mise_en_avant_produit: 'Produit', mise_en_avant_vendeur: 'Vendeur',
};

function BadgeStatutPub({ statut }: { statut: StatutPublicite }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${BADGE_STATUT[statut]}`}>
      {LABEL_STATUT[statut]}
    </span>
  );
}

/* ── Options de filtre ───────────────────────────────────────────────────── */
const OPTIONS_STATUT: { v: StatutPublicite | ''; l: string }[] = [
  { v: '', l: 'Tous' }, { v: 'brouillon', l: 'Brouillon' },
  { v: 'active', l: 'Active' }, { v: 'pausee', l: 'Pausée' }, { v: 'expiree', l: 'Expirée' },
];
const OPTIONS_TYPE: { v: TypePublicite | ''; l: string }[] = [
  { v: '', l: 'Tous types' }, { v: 'banniere', l: 'Bannière' },
  { v: 'mise_en_avant_produit', l: 'Produit' }, { v: 'mise_en_avant_vendeur', l: 'Vendeur' },
];
const OPTIONS_EMP: { v: EmplacementPublicite | ''; l: string }[] = [
  { v: '', l: 'Tous emplacements' }, { v: 'accueil_haut', l: 'Accueil haut' },
  { v: 'accueil_milieu', l: 'Accueil milieu' }, { v: 'sidebar', l: 'Sidebar' },
  { v: 'page_categorie', l: 'Catégorie' }, { v: 'page_produit', l: 'Produit' },
];

const selectCls = "px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";

export default function ListePublicitesAdmin() {
  const {
    publicites, pagination, statistiques, chargement, chargementAction, erreur,
    filtre, setFiltre, modifier, supprimer,
  } = useGestionPublicites();

  const [modalSuppr, setModalSuppr] = useState<{ ouvert: boolean; pub: Publicite | null }>({
    ouvert: false, pub: null,
  });

  const handleTogglePause = async (pub: Publicite) => {
    const nvStatut: StatutPublicite = pub.statut === 'active' ? 'pausee' : 'active';
    await modifier(pub._id, { statut: nvStatut });
  };

  const handleSupprimer = async () => {
    if (modalSuppr.pub) await supprimer(modalSuppr.pub._id);
    setModalSuppr({ ouvert: false, pub: null });
  };

  return (
    <DispositionAdmin>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Gestion des publicités</h1>
          <p className="text-sm text-[#74777d] mt-1">Créez et gérez vos campagnes publicitaires.</p>
        </div>
        <Link
          to="/admin/publicites/nouvelle"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shrink-0"
        >
          <Plus size={16} /> Nouvelle campagne
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <CarteStatistique titre="Total"       valeur={statistiques?.total      ?? 0} icone={Megaphone}  couleur="primary" />
        <CarteStatistique titre="Actives"     valeur={statistiques?.actives    ?? 0} icone={PlayCircle} couleur="success" />
        <CarteStatistique titre="Impressions" valeur={statistiques?.impressions ?? 0} icone={Eye}        couleur="accent"  />
        <CarteStatistique titre="Clics"       valeur={statistiques?.clics      ?? 0} icone={Megaphone}  couleur="warning" />
      </div>

      {erreur && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}

      {/* Filtres */}
      <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <select value={filtre.statut} onChange={(e) => setFiltre({ statut: e.target.value as StatutPublicite | '' })} className={selectCls}>
            {OPTIONS_STATUT.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <select value={filtre.type} onChange={(e) => setFiltre({ type: e.target.value as TypePublicite | '' })} className={selectCls}>
            {OPTIONS_TYPE.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <select value={filtre.emplacement} onChange={(e) => setFiltre({ emplacement: e.target.value as EmplacementPublicite | '' })} className={selectCls}>
            {OPTIONS_EMP.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>

        <div className="p-4">
          {chargement ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />)}</div>
          ) : publicites.length === 0 ? (
            <p className="text-center py-16 text-[#74777d] text-sm">Aucune campagne trouvée.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm" aria-label="Liste des publicités">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Titre', 'Type', 'Emplacement', 'Période', 'Statut', 'Perf.', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {publicites.map((pub) => (
                    <tr key={pub._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-primary max-w-[180px] truncate">{pub.titre}</td>
                      <td className="px-4 py-3.5 text-[#74777d] text-xs">{LABEL_TYPE[pub.type]}</td>
                      <td className="px-4 py-3.5 text-[#74777d] text-xs capitalize">{pub.emplacement.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3.5 text-xs text-[#74777d] whitespace-nowrap">
                        <p>{new Date(pub.dateDebut).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })}</p>
                        <p>→ {new Date(pub.dateFin).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}</p>
                      </td>
                      <td className="px-4 py-3.5"><BadgeStatutPub statut={pub.statut} /></td>
                      <td className="px-4 py-3.5 text-xs text-[#74777d]">
                        <p>{pub.impressions.toLocaleString('fr-FR')} impr.</p>
                        <p>{pub.clics.toLocaleString('fr-FR')} clics</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          {chargementAction
                            ? <Loader2 size={16} className="animate-spin text-accent" />
                            : <>
                                {(pub.statut === 'active' || pub.statut === 'pausee') && (
                                  <button onClick={() => handleTogglePause(pub)} title={pub.statut === 'active' ? 'Mettre en pause' : 'Activer'}
                                    className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors">
                                    {pub.statut === 'active' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                                  </button>
                                )}
                                <Link to={`/admin/publicites/${pub._id}`} title="Modifier"
                                  className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                                  <Eye size={16} />
                                </Link>
                                <button onClick={() => setModalSuppr({ ouvert: true, pub })} title="Supprimer"
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </>
                          }
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
        titre="Supprimer cette campagne ?"
        description={`« ${modalSuppr.pub?.titre} » sera définitivement supprimée.`}
        labelConfirmer="Supprimer" variante="danger"
        chargement={chargementAction}
        onConfirmer={handleSupprimer}
        onAnnuler={() => setModalSuppr({ ouvert: false, pub: null })}
      />
    </DispositionAdmin>
  );
}
