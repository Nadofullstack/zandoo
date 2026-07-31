import { useState } from 'react';
import { Plus, Tag, ImageOff, Pencil, Trash2, LayoutGrid } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import ModalCategorie from '../../../components/admin/categories/ModalCategorie';
import ModalConfirmation from '../../../components/admin/modal/ModalConfirmation';
import Alert from '../../../components/ui/Alert';
import { useGestionCategories } from '../../../hooks/admin/useGestionCategories';
import type { Categorie } from '../../../types/admin';

export default function GestionCategoriesAdmin() {
  const {
    categories,
    chargement,
    chargementAction,
    erreur,
    messageSucces,
    creer,
    modifier,
    supprimer,
  } = useGestionCategories();

  const [modalOuvert, setModalOuvert]           = useState(false);
  const [categorieEnEdition, setCategorieEnEdition] = useState<Categorie | null>(null);
  const [modalSuppr, setModalSuppr]             = useState<{ ouvert: boolean; categorie: Categorie | null }>({
    ouvert: false, categorie: null,
  });

  const ouvrirCreer = () => {
    setCategorieEnEdition(null);
    setModalOuvert(true);
  };

  const ouvrirEditer = (cat: Categorie) => {
    setCategorieEnEdition(cat);
    setModalOuvert(true);
  };

  const fermerModal = () => {
    setModalOuvert(false);
    setCategorieEnEdition(null);
  };

  const handleSoumettre = async (donnees: { nom: string; description: string; image: string | null }) => {
    if (categorieEnEdition) {
      await modifier(categorieEnEdition._id, donnees);
    } else {
      await creer(donnees);
    }
    fermerModal();
  };

  const handleConfirmerSuppr = async () => {
    if (!modalSuppr.categorie) return;
    await supprimer(modalSuppr.categorie._id);
    setModalSuppr({ ouvert: false, categorie: null });
  };

  /* ── Aplatir toutes les catégories (racines + sous) pour la grille ── */
  const toutes: Categorie[] = categories.flatMap((c) => [
    c,
    ...(c.sousCategories ?? []),
  ]);

  return (
    <DispositionAdmin>

      {/* Modal création / modification */}
      <ModalCategorie
        ouvert={modalOuvert}
        categorieInitiale={categorieEnEdition}
        onFermer={fermerModal}
        onSoumettre={handleSoumettre}
        chargement={chargementAction}
      />

      {/* Modal suppression */}
      <ModalConfirmation
        ouvert={modalSuppr.ouvert}
        titre="Supprimer cette catégorie ?"
        description={`« ${modalSuppr.categorie?.nom} » sera supprimée. L'opération sera bloquée si des produits ou sous-catégories y sont rattachés.`}
        labelConfirmer="Supprimer"
        variante="danger"
        chargement={chargementAction}
        onConfirmer={handleConfirmerSuppr}
        onAnnuler={() => setModalSuppr({ ouvert: false, categorie: null })}
      />

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Catégories</h1>
          <p className="text-sm text-[#74777d] mt-1">
            {toutes.length > 0 ? `${toutes.length} catégorie${toutes.length > 1 ? 's' : ''}` : 'Aucune catégorie'}
          </p>
        </div>
        <button
          onClick={ouvrirCreer}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          <Plus size={16} /> Nouvelle catégorie
        </button>
      </div>

      {/* Alertes */}
      {erreur        && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}
      {messageSucces && <div className="mb-4"><Alert variant="success">{messageSucces}</Alert></div>}

      {/* Squelettes */}
      {chargement && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-48" />
          ))}
        </div>
      )}

      {/* Grille de catégories */}
      {!chargement && toutes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {toutes.map((cat) => (
            <CarteCategorie
              key={cat._id}
              categorie={cat}
              onEditer={() => ouvrirEditer(cat)}
              onSupprimer={() => setModalSuppr({ ouvert: true, categorie: cat })}
              desactive={chargementAction}
            />
          ))}

          {/* Tuile "Ajouter" */}
          <button
            onClick={ouvrirCreer}
            className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-[#FC7701]/30 hover:border-accent hover:bg-orange-50/50 transition-all min-h-[12rem]"
          >
            <div className="w-14 h-14 rounded-xl bg-orange-50 group-hover:bg-accent/20 flex items-center justify-center transition-all">
              <Plus size={28} className="text-accent" />
            </div>
            <span className="text-sm font-semibold text-accent text-center">Nouvelle catégorie</span>
          </button>
        </div>
      )}

      {/* État vide */}
      {!chargement && toutes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
            <LayoutGrid size={36} className="text-gray-300" />
          </div>
          <p className="text-lg font-bold text-primary">Aucune catégorie</p>
          <p className="text-sm text-[#74777d]">Créez votre première catégorie pour organiser vos produits.</p>
          <button
            onClick={ouvrirCreer}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors mt-2"
          >
            <Plus size={16} /> Créer une catégorie
          </button>
        </div>
      )}

    </DispositionAdmin>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Carte catégorie
───────────────────────────────────────────────────────────────────────── */
interface CarteProps {
  categorie: Categorie;
  onEditer: () => void;
  onSupprimer: () => void;
  desactive: boolean;
}

function CarteCategorie({ categorie, onEditer, onSupprimer, desactive }: CarteProps) {
  const estSousCategorie = !!categorie.parent;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-xl hover:shadow-gray-200/80 transition-all duration-300 overflow-hidden flex flex-col">

      {/* Image ou placeholder */}
      <div className="relative aspect-video bg-gray-50 overflow-hidden">
        {categorie.image ? (
          <img
            src={categorie.image}
            alt={categorie.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff size={32} className="text-gray-300" />
          </div>
        )}

        {/* Badge sous-catégorie */}
        {estSousCategorie && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-[#74777d] px-2 py-0.5 rounded-full border border-gray-200">
            Sous-catégorie
          </div>
        )}

        {/* Badge inactif */}
        {!categorie.active && (
          <div className="absolute top-2 right-2 bg-gray-800/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Inactif
          </div>
        )}

        {/* Actions (hover) */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={onEditer}
            disabled={desactive}
            className="p-2 bg-white rounded-xl shadow-md text-primary hover:bg-accent hover:text-white transition-all disabled:opacity-50"
            title="Modifier"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onSupprimer}
            disabled={desactive}
            className="p-2 bg-white rounded-xl shadow-md text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
            title="Supprimer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Infos */}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-primary leading-snug line-clamp-1">{categorie.nom}</h3>
          <Tag size={14} className="text-accent flex-shrink-0 mt-0.5" />
        </div>

        {categorie.description && (
          <p className="text-xs text-[#74777d] mt-1 line-clamp-2 leading-relaxed">{categorie.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 mt-2">
          <span className="text-[10px] font-mono text-gray-400 truncate">/{categorie.slug}</span>
          {(categorie.sousCategories?.length ?? 0) > 0 && (
            <span className="text-[10px] font-semibold text-accent bg-orange-50 px-1.5 py-0.5 rounded-full">
              {categorie.sousCategories!.length} sous
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
