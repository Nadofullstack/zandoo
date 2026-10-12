import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MessageSquareReply, MessageSquareText, Package, Star } from 'lucide-react';
import DispositionVendeur from '../../components/vendeur/layout/DispositionVendeur';
import Alert from '../../components/ui/Alert';
import EtoilesNote from '../../components/ui/EtoilesNote';
import { getAvisBoutique, repondreAvis } from '../../services/vendeur/vendeurAvisService';
import type { AvisBoutique, StatistiquesAvisBoutique } from '../../types/vendeur';

type Filtre = 'tous' | 'sans_reponse';

/** Espace vendeur — avis clients reçus et réponses publiques de la boutique. */
export default function AvisClientsPage() {
  const [filtre, setFiltre]   = useState<Filtre>('tous');
  const [note, setNote]       = useState<number | undefined>();
  const [page, setPage]       = useState(1);
  const [avis, setAvis]       = useState<AvisBoutique[]>([]);
  const [stats, setStats]     = useState<StatistiquesAvisBoutique | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]   = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const { data } = await getAvisBoutique({ page, note, ...(filtre === 'sans_reponse' ? { filtre } : {}) });
        if (annule) return;
        setAvis(data.avis);
        setStats(data.statistiques);
        setTotalPages(data.pagination.totalPages);
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Impossible de charger les avis.');
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [filtre, note, page]);

  /** Met à jour un avis après réponse (et le compteur « sans réponse ») */
  const surReponse = (id: string, reponse: AvisBoutique['reponseVendeur']) => {
    const avant = avis.find((a) => a._id === id)?.reponseVendeur;
    setAvis((liste) => liste.map((a) => (a._id === id ? { ...a, reponseVendeur: reponse } : a)));
    setStats((s) => s && { ...s, sansReponse: s.sansReponse + (avant && !reponse ? 1 : !avant && reponse ? -1 : 0) });
  };

  return (
    <DispositionVendeur>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary flex items-center gap-2">
          <Star size={22} className="text-accent" aria-hidden /> Avis clients
        </h1>
        <p className="text-sm text-[#74777d] mt-1">Répondez aux avis : vos réponses sont visibles par tous sur la fiche produit.</p>
      </header>

      {/* Indicateurs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Indicateur libelle="Note moyenne" valeur={stats ? stats.moyenne.toLocaleString('fr-FR', { minimumFractionDigits: 1 }) : '—'}>
          {stats && <EtoilesNote note={stats.moyenne} taille={14} />}
        </Indicateur>
        <Indicateur libelle="Avis reçus" valeur={stats ? String(stats.total) : '—'} />
        <Indicateur libelle="Sans réponse" valeur={stats ? String(stats.sansReponse) : '—'} accent={!!stats?.sansReponse} />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(['tous', 'sans_reponse'] as Filtre[]).map((f) => (
          <button
            key={f}
            onClick={() => { setFiltre(f); setPage(1); }}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${filtre === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-[#74777d] hover:text-primary'}`}
          >
            {f === 'tous' ? 'Tous les avis' : 'Sans réponse'}
          </button>
        ))}
        <select
          value={note ?? ''}
          onChange={(e) => { setNote(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
          aria-label="Filtrer par note"
          className="ml-auto px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-primary focus:outline-none focus:border-accent"
        >
          <option value="">Toutes les notes</option>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} étoile{n > 1 ? 's' : ''}</option>)}
        </select>
      </div>

      {erreur && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}

      {chargement && avis.length === 0 ? (
        <div className="flex justify-center py-20"><Loader2 size={26} className="animate-spin text-accent" /></div>
      ) : avis.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 bg-white border border-gray-200 rounded-2xl">
          <MessageSquareText size={28} className="text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-primary">{filtre === 'sans_reponse' ? 'Vous avez répondu à tous les avis 👏' : 'Aucun avis pour le moment'}</p>
          <p className="text-sm text-[#74777d] mt-1">Les clients peuvent noter vos produits une fois leur commande livrée.</p>
        </div>
      ) : (
        <div className={`space-y-4 transition-opacity ${chargement ? 'opacity-60' : ''}`}>
          {avis.map((a) => <CarteAvisVendeur key={a._id} avis={a} onReponse={(r) => surReponse(a._id, r)} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">Précédent</button>
          <span className="text-[#74777d]">Page {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">Suivant</button>
        </div>
      )}
    </DispositionVendeur>
  );
}

function Indicateur({ libelle, valeur, accent, children }: { libelle: string; valeur: string; accent?: boolean; children?: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <p className="text-xs font-semibold text-[#74777d] uppercase tracking-wider">{libelle}</p>
      <div className="flex items-center gap-3 mt-2">
        <span className={`text-2xl font-extrabold tabular-nums ${accent ? 'text-accent' : 'text-primary'}`}>{valeur}</span>
        {children}
      </div>
    </div>
  );
}

function CarteAvisVendeur({ avis, onReponse }: { avis: AvisBoutique; onReponse: (r: AvisBoutique['reponseVendeur']) => void }) {
  const [edition, setEdition] = useState(false);
  const [texte, setTexte]     = useState(avis.reponseVendeur?.texte ?? '');
  const [envoi, setEnvoi]     = useState(false);
  const [erreur, setErreur]   = useState<string | null>(null);

  const publier = async (valeur: string) => {
    setEnvoi(true);
    setErreur(null);
    try {
      const reponse = await repondreAvis(avis._id, valeur.trim());
      onReponse(reponse);
      setTexte(reponse?.texte ?? '');
      setEdition(false);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Envoi impossible.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <article className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
          {avis.produit?.photoCouverture ? <img src={avis.produit.photoCouverture} alt="" className="w-full h-full object-cover" /> : <Package size={18} className="text-gray-300" />}
        </div>
        <div className="flex-1 min-w-0">
          {avis.produit ? (
            <Link to={`/produit/${avis.produit.slug}`} target="_blank" className="text-sm font-semibold text-primary hover:text-accent truncate block">{avis.produit.nom}</Link>
          ) : <p className="text-sm text-[#74777d]">Produit supprimé</p>}
          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#74777d]">
            <EtoilesNote note={avis.note} taille={13} />
            <span>{avis.auteur} · {new Date(avis.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
        {!avis.reponseVendeur && <span className="shrink-0 text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">À répondre</span>}
      </div>

      {avis.titre && <h3 className="text-sm font-bold text-primary mt-3">{avis.titre}</h3>}
      {avis.commentaire ? (
        <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{avis.commentaire}</p>
      ) : (
        <p className="text-sm text-[#74777d] italic mt-2">Note sans commentaire.</p>
      )}

      {/* Réponse */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        {edition ? (
          <div className="space-y-2">
            <textarea
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              maxLength={1000}
              rows={3}
              autoFocus
              placeholder="Remerciez le client, apportez une précision ou une solution…"
              className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20 resize-none"
            />
            {erreur && <p className="text-xs text-red-600">{erreur}</p>}
            <div className="flex items-center gap-2 justify-end">
              {avis.reponseVendeur && (
                <button onClick={() => publier('')} disabled={envoi} className="mr-auto text-xs font-semibold text-red-600 hover:underline">Retirer la réponse</button>
              )}
              <button onClick={() => { setEdition(false); setTexte(avis.reponseVendeur?.texte ?? ''); }} disabled={envoi} className="px-3 py-1.5 rounded-lg text-sm text-[#74777d] hover:bg-gray-50">Annuler</button>
              <button onClick={() => publier(texte)} disabled={envoi || !texte.trim()} className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-accent hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5">
                {envoi && <Loader2 size={14} className="animate-spin" />} Publier
              </button>
            </div>
          </div>
        ) : avis.reponseVendeur ? (
          <div className="pl-3 border-l-2 border-accent/50">
            <p className="text-xs font-semibold text-primary">Votre réponse</p>
            <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-line">{avis.reponseVendeur.texte}</p>
            <button onClick={() => setEdition(true)} className="mt-1.5 text-xs font-semibold text-accent hover:underline">Modifier</button>
          </div>
        ) : (
          <button onClick={() => setEdition(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
            <MessageSquareReply size={15} /> Répondre
          </button>
        )}
      </div>
    </article>
  );
}
