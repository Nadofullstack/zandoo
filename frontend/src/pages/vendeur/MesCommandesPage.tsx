import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import DispositionVendeur from '../../components/vendeur/layout/DispositionVendeur';
import Alert from '../../components/ui/Alert';
import { useCommandesVendeur } from '../../hooks/vendeur/useCommandesVendeur';
import {
  KpisCommandes,
  FiltreCommandes,
  ListeCommandes,
  ModalDetailsCommande,
  ModalConfirmAnnulation,
} from '../../components/vendeur/commandes';
import type { CommandeVendeur } from '../../types/vendeur';

export default function MesCommandesPage() {
  const {
    commandes, pagination, statistiques,
    filtre, chargement, chargementAction,
    erreur, messageSucces,
    setFiltre, changerStatut, annuler,
  } = useCommandesVendeur();

  const [commandeDetail,  setCommandeDetail]  = useState<CommandeVendeur | null>(null);
  const [commandeAnnuler, setCommandeAnnuler] = useState<CommandeVendeur | null>(null);

  return (
    <DispositionVendeur>
      {/* ── En-tête ── */}
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-primary flex items-center gap-2">
          <ShoppingBag size={22} className="text-accent" aria-hidden />
          Mes commandes
        </h1>
        <p className="text-sm text-[#74777d] mt-1">
          Suivez et gérez les commandes de votre boutique.
        </p>
      </header>

      {/* ── Alertes ── */}
      {erreur        && <div className="mb-5"><Alert variant="error">{erreur}</Alert></div>}
      {messageSucces && <div className="mb-5"><Alert variant="success">{messageSucces}</Alert></div>}

      {/* ── KPIs ── */}
      {statistiques && <KpisCommandes statistiques={statistiques} />}

      {/* ── Tableau + filtres ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <FiltreCommandes
          statut={filtre.statut}
          total={pagination?.total}
          onChange={(statut) => setFiltre({ statut, page: 1 })}
        />
        <div className="p-4">
          <ListeCommandes
            commandes={commandes}
            chargement={chargement}
            chargementAction={chargementAction}
            pagination={pagination}
            pageActive={filtre.page}
            onVoirDetails={setCommandeDetail}
            onChangerStatut={changerStatut}
            onDemanderAnnulation={setCommandeAnnuler}
            onChangerPage={(page) => setFiltre({ page })}
          />
        </div>
      </div>

      {/* ── Modals ── */}
      {commandeDetail && (
        <ModalDetailsCommande
          commande={commandeDetail}
          onFermer={() => setCommandeDetail(null)}
        />
      )}

      {commandeAnnuler && (
        <ModalConfirmAnnulation
          commande={commandeAnnuler}
          chargement={chargementAction === commandeAnnuler._id}
          onFermer={() => setCommandeAnnuler(null)}
          onConfirmer={(raison) => {
            annuler(commandeAnnuler._id, raison);
            setCommandeAnnuler(null);
          }}
        />
      )}
    </DispositionVendeur>
  );
}
