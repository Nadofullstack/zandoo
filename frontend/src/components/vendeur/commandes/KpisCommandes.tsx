import { ShoppingBag, Clock, PackageCheck, Truck, CheckCircle2, TrendingUp } from 'lucide-react';
import CarteStatistique from '../../admin/modal/CarteStatistique';
import type { StatistiquesCommandesVendeur } from '../../../types/vendeur';

interface Props {
  statistiques: StatistiquesCommandesVendeur;
}

export default function KpisCommandes({ statistiques }: Props) {
  return (
    <section className="mb-6" aria-label="Indicateurs clés commandes">
      <h2 className="text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-3">
        Mes commandes
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <CarteStatistique
          titre="Total"
          valeur={statistiques.total}
          icone={ShoppingBag}
          couleur="primary"
        />
        <CarteStatistique
          titre="En attente"
          valeur={statistiques.enAttente}
          icone={Clock}
          couleur="warning"
        />
        <CarteStatistique
          titre="En préparation"
          valeur={statistiques.enPreparation}
          icone={PackageCheck}
          couleur="accent"
        />
        <CarteStatistique
          titre="Expédiées"
          valeur={statistiques.expediees}
          icone={Truck}
          couleur="primary"
        />
        <CarteStatistique
          titre="Livrées"
          valeur={statistiques.livrees}
          icone={CheckCircle2}
          couleur="success"
        />
        <CarteStatistique
          titre="Chiffre d'affaires"
          valeur={statistiques.chiffreAffaires}
          icone={TrendingUp}
          couleur="success"
          sousTitre="FCFA"
        />
      </div>
    </section>
  );
}
