import { useState } from 'react';
import { Plus } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import ArbreCategories from '../../../components/admin/categories/ArbreCategories';
import FormulaireCategorie from '../../../components/admin/categories/FormulaireCategorie';
import ModalConfirmation from '../../../components/admin/modal/ModalConfirmation';
import Alert from '../../../components/ui/Alert';
import { useGestionCategories } from '../../../hooks/admin/useGestionCategories';
import type { Categorie } from '../../../types/admin';

type ModeFormulaire = 'creer' | 'modifier' | null;

export default function GestionCategoriesAdmin() {
  const { categories, chargement, chargementAction, erreur, messageSucces, creer, modifier, supprimer } = useGestionCategories();

  const [modeForm, setModeForm] = useState<ModeFormulaire>(null);
  const [categorieEnEdition, setCategorieEnEdition] = useState<Categorie | null>(null);
  const [parentForce, setParentForce] = useState<Categorie | null>(null);
  const [modalSuppr, setModalSuppr] = useState<{ ouvert: boolean; categorie: Categorie | null }>({
    ouvert: false, categorie: null,
  });

  const ouvrirCreer = () => {
    setCategorieEnEdition(null);
    setParentForce(null);
    setModeForm('creer');
  };

  const ouvrirAjouterSous = (parent: Categorie) => {
    setCategorieEnEdition(null);
    setParentForce(parent);
    setModeForm('creer');
  };

  const ouvrirEditer = (cat: Categorie) => {
    setCategorieEnEdition(cat);
    setParentForce(null);
    setModeForm('modifier');
  };

  const fermerForm = () => {
    setModeForm(null);
    setCategorieEnEdition(null);
    setParentForce(null);
  };

  const handleSoumettre = async (
    donnees: Partial<Omit<Categorie, '_id' | 'createdAt' | 'updatedAt' | 'sousCategories'>>
  ) => {
    if (modeForm === 'modifier' && categorieEnEdition) {
      await modifier(categorieEnEdition._id, donnees);
    } else {
      await creer(donnees);
    }
    fermerForm();
  };

  const handleConfirmerSuppr = async () => {
    if (!modalSuppr.categorie) return;
    await supprimer(modalSuppr.categorie._id);
    setModalSuppr({ ouvert: false, categorie: null });
  };

  return (
    <DispositionAdmin>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Catégories</h1>
          <p className="text-sm text-[#74777d] mt-1">Gérez l'arborescence et les attributs des catégories.</p>
        </div>
        <button onClick={ouvrirCreer}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors">
          <Plus size={16} /> Nouvelle catégorie
        </button>
      </div>

      {erreur       && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}
      {messageSucces && <div className="mb-4"><Alert variant="success">{messageSucces}</Alert></div>}

      <div className="grid lg:grid-cols-5 gap-6">

        {/* Arbre */}
        <div className="lg:col-span-3">
          {chargement ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : (
            <ArbreCategories
              categories={categories}
              onEditer={ouvrirEditer}
              onSupprimer={(cat) => setModalSuppr({ ouvert: true, categorie: cat })}
              onAjouterSous={ouvrirAjouterSous}
              chargementAction={chargementAction}
            />
          )}
        </div>

        {/* Formulaire latéral */}
        {modeForm && (
          <div className="lg:col-span-2">
            <div className="bg-surface border border-gray-200 rounded-2xl p-5 sticky top-4">
              <h2 className="text-base font-bold text-primary mb-4">
                {modeForm === 'modifier'
                  ? `Modifier — ${categorieEnEdition?.nom}`
                  : parentForce
                    ? `Sous-catégorie de "${parentForce.nom}"`
                    : 'Nouvelle catégorie'}
              </h2>
              <FormulaireCategorie
                categorieInitiale={categorieEnEdition}
                parentForce={parentForce}
                categories={categories}
                onSoumettre={handleSoumettre}
                chargement={chargementAction}
                onAnnuler={fermerForm}
              />
            </div>
          </div>
        )}
      </div>

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

    </DispositionAdmin>
  );
}
