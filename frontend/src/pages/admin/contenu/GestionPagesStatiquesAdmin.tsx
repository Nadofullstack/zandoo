import { useState } from 'react';
import { FileText, Edit2, Trash2, Plus, Eye, EyeOff, Loader2, X, Save } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import ModalConfirmation from '../../../components/admin/modal/ModalConfirmation';
import Alert from '../../../components/ui/Alert';
import { useGestionPagesStatiques } from '../../../hooks/useGestionPagesStatiques';
import type { PageStatique, FormulairePageStatique } from '../../../types/admin';

const inputCls  = "w-full px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const labelCls  = "block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5";

const VIDE: FormulairePageStatique = {
  slug: '', titre: '', contenu: '', metaTitre: '', metaDescription: '', publiee: false, ordre: 0,
};

/* ── Panel d'édition ─────────────────────────────────────────────────────── */
function PanelEdition({
  page, onSauvegarder, onFermer, chargement,
}: {
  page: PageStatique | null;
  onSauvegarder: (id: string | null, d: Partial<FormulairePageStatique>) => void;
  onFermer: () => void;
  chargement: boolean;
}) {
  const [form, setForm] = useState<FormulairePageStatique>(
    page
      ? { slug: page.slug, titre: page.titre, contenu: page.contenu,
          metaTitre: page.metaTitre ?? '', metaDescription: page.metaDescription ?? '',
          publiee: page.publiee, ordre: page.ordre }
      : VIDE
  );
  const set = (k: keyof FormulairePageStatique, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-40 bg-primary/50 backdrop-blur-sm flex items-center justify-center px-4"
      role="dialog" aria-modal="true">
      <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-primary">{page ? 'Modifier la page' : 'Nouvelle page statique'}</h2>
          <button onClick={onFermer} className="p-1 rounded-lg text-gray-400 hover:text-primary"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Slug * <span className="text-gray-400 normal-case font-normal">(ex: a-propos)</span></label>
              <input value={form.slug} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                required disabled={Boolean(page)} className={`${inputCls} ${page ? 'bg-gray-50 cursor-not-allowed' : ''}`} placeholder="a-propos" />
            </div>
            <div>
              <label className={labelCls}>Titre *</label>
              <input value={form.titre} onChange={(e) => set('titre', e.target.value)} required className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Contenu *</label>
            <textarea value={form.contenu} onChange={(e) => set('contenu', e.target.value)}
              rows={10} required
              className={`${inputCls} resize-y font-mono text-xs`}
              placeholder="Contenu HTML ou texte brut…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Méta-titre SEO <span className="text-gray-400 normal-case font-normal">(70 car. max)</span></label>
              <input value={form.metaTitre} onChange={(e) => set('metaTitre', e.target.value)} maxLength={70} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Méta-description <span className="text-gray-400 normal-case font-normal">(160 car. max)</span></label>
              <input value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} maxLength={160} className={inputCls} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.publiee} onChange={(e) => set('publiee', e.target.checked)} className="w-4 h-4 accent-accent" />
              <span className="text-sm font-medium text-primary">Publier la page</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#74777d]">Ordre :</span>
              <input type="number" min={0} value={form.ordre} onChange={(e) => set('ordre', Number(e.target.value))}
                className="w-20 px-2 py-1 border border-[#c4c6cd] rounded-lg text-sm text-primary outline-none focus:border-accent" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onFermer} className="px-4 py-2 rounded-lg text-sm font-semibold text-[#74777d] hover:bg-gray-100 transition-colors">
            Annuler
          </button>
          <button onClick={() => onSauvegarder(page?._id ?? null, form)} disabled={chargement}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors">
            {chargement ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page principale ─────────────────────────────────────────────────────── */
export default function GestionPagesStatiquesAdmin() {
  const { pages, chargement, chargementAction, erreur, creer, modifier, supprimer } = useGestionPagesStatiques();
  const [panelPage,    setPanelPage]    = useState<PageStatique | 'nouveau' | null>(null);
  const [modalSuppr,   setModalSuppr]   = useState<{ ouvert: boolean; page: PageStatique | null }>({ ouvert: false, page: null });
  const [succes,       setSucces]       = useState<string | null>(null);

  const afficherSucces = (msg: string) => {
    setSucces(msg); setTimeout(() => setSucces(null), 3000);
  };

  const handleSauvegarder = async (id: string | null, d: Partial<FormulairePageStatique>) => {
    if (id) {
      await modifier(id, d);
      afficherSucces('Page mise à jour.');
    } else {
      await creer(d);
      afficherSucces('Page créée.');
    }
    setPanelPage(null);
  };

  const handleSupprimer = async () => {
    if (modalSuppr.page) { await supprimer(modalSuppr.page._id); afficherSucces('Page supprimée.'); }
    setModalSuppr({ ouvert: false, page: null });
  };

  return (
    <DispositionAdmin>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Pages statiques</h1>
          <p className="text-sm text-[#74777d] mt-1">Gérez le contenu des pages fixes du site.</p>
        </div>
        <button onClick={() => setPanelPage('nouveau')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shrink-0">
          <Plus size={16} /> Nouvelle page
        </button>
      </header>

      {erreur  && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}
      {succes  && <div className="mb-4"><Alert variant="success">{succes}</Alert></div>}

      {chargement ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-20 text-[#74777d] text-sm">Aucune page statique.</div>
      ) : (
        <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm" aria-label="Pages statiques">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Slug', 'Titre', 'Statut', 'Modifié le', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page._id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-accent">{page.slug}</td>
                  <td className="px-4 py-3.5 font-medium text-primary">{page.titre}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      page.publiee ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {page.publiee ? <><Eye size={11} /> Publiée</> : <><EyeOff size={11} /> Brouillon</>}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#74777d]">
                    {new Date(page.updatedAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}
                    {page.modifiePar && <p className="text-gray-400">{page.modifiePar.fullName}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setPanelPage(page)} title="Modifier"
                        className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setModalSuppr({ ouvert: true, page })} title="Supprimer"
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Panel édition */}
      {panelPage !== null && (
        <PanelEdition
          page={panelPage === 'nouveau' ? null : panelPage}
          onSauvegarder={handleSauvegarder}
          onFermer={() => setPanelPage(null)}
          chargement={chargementAction}
        />
      )}

      <ModalConfirmation
        ouvert={modalSuppr.ouvert}
        titre="Supprimer cette page ?"
        description={`La page « ${modalSuppr.page?.titre} » sera définitivement supprimée.`}
        labelConfirmer="Supprimer" variante="danger" chargement={chargementAction}
        onConfirmer={handleSupprimer}
        onAnnuler={() => setModalSuppr({ ouvert: false, page: null })}
      />
    </DispositionAdmin>
  );
}
