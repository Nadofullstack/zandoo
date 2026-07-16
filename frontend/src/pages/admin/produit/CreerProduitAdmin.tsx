import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import FormulaireProduit from '../../../components/admin/produits/FormulaireProduit';
import Alert from '../../../components/ui/Alert';
import { useGestionCategories } from '../../../hooks/useGestionCategories';
import { creerProduit } from '../../../services/adminProduitService';
import type { FormulaireProduiit } from '../../../types/admin';

export default function CreerProduitAdmin() {
  const navigate = useNavigate();
  const { categories } = useGestionCategories();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const handleSoumettre = async (donnees: Partial<FormulaireProduiit>) => {
    setChargement(true);
    setErreur(null);
    try {
      const rep = await creerProduit(donnees);
      navigate(`/admin/produits/${rep.data.produit._id}`);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la création.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <DispositionAdmin>
      <Link to="/admin/produits"
        className="inline-flex items-center gap-1.5 text-sm text-[#74777d] hover:text-primary transition-colors mb-6">
        <ArrowLeft size={15} /> Retour au catalogue
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-primary">Nouveau produit</h1>
        <p className="text-sm text-[#74777d] mt-1">Créez un produit directement depuis l'administration.</p>
      </header>

      {erreur && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}

      <FormulaireProduit
        categories={categories}
        onSoumettre={handleSoumettre}
        chargement={chargement}
      />
    </DispositionAdmin>
  );
}
