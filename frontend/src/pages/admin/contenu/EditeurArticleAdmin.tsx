import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import Alert from '../../../components/ui/Alert';
import { creerArticle, modifierArticle, getArticleParId } from '../../../services/adminArticleService';
import type { Article, FormulaireArticle, StatutArticle, CategorieEditoriale } from '../../../types/admin';

const inputCls  = "w-full px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const selectCls = inputCls;
const labelCls  = "block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5";

const VIDE: FormulaireArticle = {
  titre: '', resume: '', contenu: '', imageCouverture: '',
  categorieEditoriale: 'actualite', tags: '', statut: 'brouillon',
  publieAt: '', metaTitre: '', metaDescription: '',
};

export default function EditeurArticleAdmin() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const estEdition = Boolean(id);

  const [form,           setForm]           = useState<FormulaireArticle>(VIDE);
  const [chargement,     setChargement]     = useState(estEdition);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur,         setErreur]         = useState<string | null>(null);
  const [succes,         setSucces]         = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let annule = false;
    (async () => {
      try {
        const rep = await getArticleParId(id);
        const art: Article = rep.data.article;
        if (!annule) setForm({
          titre: art.titre, resume: art.resume ?? '', contenu: art.contenu,
          imageCouverture: art.imageCouverture ?? '',
          categorieEditoriale: art.categorieEditoriale,
          tags: art.tags.join(', '), statut: art.statut,
          publieAt: art.publieAt ? art.publieAt.slice(0, 10) : '',
          metaTitre: art.metaTitre ?? '', metaDescription: art.metaDescription ?? '',
        });
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Erreur de chargement.');
      } finally { if (!annule) setChargement(false); }
    })();
    return () => { annule = true; };
  }, [id]);

  const set = (k: keyof FormulaireArticle, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSoumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnregistrement(true); setErreur(null);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        publieAt: form.publieAt || undefined,
        imageCouverture: form.imageCouverture || undefined,
      };
      if (estEdition && id) {
        await modifierArticle(id, payload as unknown as Partial<FormulaireArticle>);
        setSucces('Article mis à jour.');
        setTimeout(() => navigate('/admin/articles'), 1200);
      } else {
        await creerArticle(payload as unknown as Partial<FormulaireArticle>);
        navigate('/admin/articles');
      }
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur.');
    } finally { setEnregistrement(false); }
  };

  if (chargement) {
    return <DispositionAdmin><div className="h-64 rounded-xl bg-gray-200 animate-pulse" /></DispositionAdmin>;
  }

  return (
    <DispositionAdmin>
      <Link to="/admin/articles" className="inline-flex items-center gap-1.5 text-sm text-[#74777d] hover:text-primary transition-colors mb-6">
        <ArrowLeft size={15} /> Retour aux articles
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-primary">{estEdition ? 'Modifier l\'article' : 'Nouvel article'}</h1>
      </header>

      {erreur  && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}
      {succes  && <div className="mb-4"><Alert variant="success">{succes}</Alert></div>}

      <form onSubmit={handleSoumettre} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <label className={labelCls}>Titre *</label>
              <input value={form.titre} onChange={(e) => set('titre', e.target.value)} required className={inputCls} placeholder="Titre de l'article" />
            </div>

            <div>
              <label className={labelCls}>Résumé <span className="text-gray-400 normal-case font-normal">(affiché dans les listes)</span></label>
              <textarea value={form.resume} onChange={(e) => set('resume', e.target.value)} rows={3}
                className={`${inputCls} resize-none`} placeholder="Une brève description de l'article…" />
            </div>

            <div>
              <label className={labelCls}>Contenu *</label>
              <textarea value={form.contenu} onChange={(e) => set('contenu', e.target.value)} rows={16}
                required className={`${inputCls} resize-y`} placeholder="Contenu HTML ou texte de l'article…" />
            </div>

            <div>
              <label className={labelCls}>Image de couverture (URL)</label>
              <input value={form.imageCouverture} onChange={(e) => set('imageCouverture', e.target.value)}
                type="url" className={inputCls} placeholder="https://…" />
              {form.imageCouverture && (
                <img src={form.imageCouverture} alt="Couverture" className="mt-2 rounded-lg max-h-40 object-cover border border-gray-200 w-full" />
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">SEO</h2>
            <div>
              <label className={labelCls}>Méta-titre <span className="text-gray-400 normal-case font-normal">(70 car. max)</span></label>
              <input value={form.metaTitre} onChange={(e) => set('metaTitre', e.target.value)} maxLength={70} className={inputCls} />
              <p className="text-right text-xs text-gray-400 mt-1">{form.metaTitre.length}/70</p>
            </div>
            <div>
              <label className={labelCls}>Méta-description <span className="text-gray-400 normal-case font-normal">(160 car. max)</span></label>
              <textarea value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)}
                rows={2} maxLength={160} className={`${inputCls} resize-none`} />
              <p className="text-right text-xs text-gray-400 mt-1">{form.metaDescription.length}/160</p>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <label className={labelCls}>Statut</label>
              <select value={form.statut} onChange={(e) => set('statut', e.target.value as StatutArticle)} className={selectCls}>
                <option value="brouillon">Brouillon</option>
                <option value="publie">Publié</option>
                <option value="archive">Archivé</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Catégorie</label>
              <select value={form.categorieEditoriale} onChange={(e) => set('categorieEditoriale', e.target.value as CategorieEditoriale)} className={selectCls}>
                <option value="actualite">Actualité</option>
                <option value="conseil">Conseil</option>
                <option value="mise_a_jour">Mise à jour</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Tags <span className="text-gray-400 normal-case font-normal">(séparés par des virgules)</span></label>
              <input value={form.tags} onChange={(e) => set('tags', e.target.value)}
                className={inputCls} placeholder="promo, nouveauté, vendeur" />
            </div>

            <div>
              <label className={labelCls}>Date de publication planifiée</label>
              <input type="date" value={form.publieAt} onChange={(e) => set('publieAt', e.target.value)} className={inputCls} />
            </div>
          </div>

          <button type="submit" disabled={enregistrement}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
            {enregistrement ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {estEdition ? 'Enregistrer les modifications' : 'Créer l\'article'}
          </button>
        </div>
      </form>
    </DispositionAdmin>
  );
}
