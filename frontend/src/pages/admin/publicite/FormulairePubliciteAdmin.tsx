import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import Alert from '../../../components/ui/Alert';
import { creerPublicite, modifierPublicite, getPubliciteParId } from '../../../services/adminPubliciteService';
import type { Publicite, FormulairePublicite, StatutPublicite, TypePublicite, EmplacementPublicite } from '../../../types/admin';

const TYPES: { v: TypePublicite; l: string }[] = [
  { v: 'banniere',               l: 'Bannière'          },
  { v: 'mise_en_avant_produit',  l: 'Mise en avant produit' },
  { v: 'mise_en_avant_vendeur',  l: 'Mise en avant vendeur' },
];
const EMPLACEMENTS: { v: EmplacementPublicite; l: string }[] = [
  { v: 'accueil_haut',    l: 'Accueil — haut'    },
  { v: 'accueil_milieu',  l: 'Accueil — milieu'  },
  { v: 'sidebar',         l: 'Sidebar'            },
  { v: 'page_categorie',  l: 'Page catégorie'     },
  { v: 'page_produit',    l: 'Page produit'       },
];
const STATUTS: { v: StatutPublicite; l: string }[] = [
  { v: 'brouillon', l: 'Brouillon' },
  { v: 'active',    l: 'Active'    },
  { v: 'pausee',    l: 'Pausée'    },
];

const VIDE: FormulairePublicite = {
  titre: '', type: 'banniere', emplacement: 'accueil_haut',
  imageUrl: '', lienCible: '', texteAlt: '',
  produit: '', vendeur: '', dateDebut: '', dateFin: '',
  statut: 'brouillon', ordre: 0,
};

const inputCls = "w-full px-3 py-2.5 bg-white border border-[#c4c6cd] rounded-lg text-sm text-primary placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const selectCls = inputCls;
const labelCls = "block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5";

export default function FormulairePubliciteAdmin() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const estEdition = Boolean(id);

  const [form,           setForm]           = useState<FormulairePublicite>(VIDE);
  const [chargement,     setChargement]     = useState(estEdition);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur,         setErreur]         = useState<string | null>(null);
  const [succes,         setSucces]         = useState<string | null>(null);

  /* Chargement pour édition */
  useEffect(() => {
    if (!id) return;
    let annule = false;
    (async () => {
      try {
        const rep = await getPubliciteParId(id);
        const pub: Publicite = rep.data.publicite;
        if (!annule) setForm({
          titre: pub.titre, type: pub.type, emplacement: pub.emplacement,
          imageUrl: pub.imageUrl ?? '', lienCible: pub.lienCible ?? '',
          texteAlt: pub.texteAlt ?? '', produit: '', vendeur: '',
          dateDebut: pub.dateDebut.slice(0, 10), dateFin: pub.dateFin.slice(0, 10),
          statut: pub.statut === 'expiree' ? 'brouillon' : pub.statut, ordre: pub.ordre,
        });
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Erreur de chargement.');
      } finally { if (!annule) setChargement(false); }
    })();
    return () => { annule = true; };
  }, [id]);

  const set = (k: keyof FormulairePublicite, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSoumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnregistrement(true); setErreur(null);
    try {
      if (estEdition && id) {
        await modifierPublicite(id, form);
        setSucces('Campagne mise à jour.');
        setTimeout(() => navigate('/admin/publicites'), 1200);
      } else {
        await creerPublicite(form);
        navigate('/admin/publicites');
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
      <Link to="/admin/publicites" className="inline-flex items-center gap-1.5 text-sm text-[#74777d] hover:text-primary transition-colors mb-6">
        <ArrowLeft size={15} /> Retour aux campagnes
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-primary">
          {estEdition ? 'Modifier la campagne' : 'Nouvelle campagne'}
        </h1>
      </header>

      {erreur  && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}
      {succes  && <div className="mb-4"><Alert variant="success">{succes}</Alert></div>}

      <form onSubmit={handleSoumettre} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <label className={labelCls}>Titre interne *</label>
              <input value={form.titre} onChange={(e) => set('titre', e.target.value)}
                required className={inputCls} placeholder="Ex : Bannière promo Noël" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Type *</label>
                <select value={form.type} onChange={(e) => set('type', e.target.value)} className={selectCls}>
                  {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Emplacement *</label>
                <select value={form.emplacement} onChange={(e) => set('emplacement', e.target.value)} className={selectCls}>
                  {EMPLACEMENTS.map((e) => <option key={e.v} value={e.v}>{e.l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>URL de l'image</label>
              <input value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)}
                type="url" className={inputCls} placeholder="https://…" />
            </div>

            {form.imageUrl && (
              <img src={form.imageUrl} alt="Aperçu" className="rounded-lg max-h-40 object-contain border border-gray-200" />
            )}

            <div>
              <label className={labelCls}>Lien de destination</label>
              <input value={form.lienCible} onChange={(e) => set('lienCible', e.target.value)}
                type="url" className={inputCls} placeholder="https://…" />
            </div>

            <div>
              <label className={labelCls}>Texte alternatif (accessibilité)</label>
              <input value={form.texteAlt} onChange={(e) => set('texteAlt', e.target.value)}
                className={inputCls} placeholder="Description de l'image pour les lecteurs d'écran" />
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <label className={labelCls}>Statut</label>
              <select value={form.statut} onChange={(e) => set('statut', e.target.value)} className={selectCls}>
                {STATUTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Date de début *</label>
              <input type="date" value={form.dateDebut} onChange={(e) => set('dateDebut', e.target.value)}
                required className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Date de fin *</label>
              <input type="date" value={form.dateFin} onChange={(e) => set('dateFin', e.target.value)}
                required className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Ordre d'affichage</label>
              <input type="number" min={0} value={form.ordre} onChange={(e) => set('ordre', Number(e.target.value))}
                className={inputCls} />
            </div>
          </div>

          <button type="submit" disabled={enregistrement}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
            {enregistrement ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {estEdition ? 'Enregistrer les modifications' : 'Créer la campagne'}
          </button>
        </div>
      </form>
    </DispositionAdmin>
  );
}
