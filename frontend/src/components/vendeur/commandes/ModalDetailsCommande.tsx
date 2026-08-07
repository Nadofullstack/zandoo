import {
  ShoppingBag, X, User, Mail, Phone, Package,
  MapPin, CreditCard, TrendingUp, Clock,
} from 'lucide-react';
import type { CommandeVendeur } from '../../../types/vendeur';
import BadgeStatutCommande from './BadgeStatutCommande';

const METHODES_PAIEMENT: Record<string, string> = {
  mobile_money:   'Mobile Money',
  carte_bancaire: 'Carte bancaire',
  virement:       'Virement',
  especes:        'Espèces',
  autre:          'Autre',
};

interface Props {
  commande: CommandeVendeur;
  onFermer: () => void;
}

export default function ModalDetailsCommande({ commande, onFermer }: Props) {
  const cmd    = commande as any;
  const adresse  = cmd.adresseLivraison;
  const paiement = cmd.paiement;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* ── En-tête ── */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
              <ShoppingBag size={18} className="text-accent" />
            </span>
            <div>
              <h3 className="font-bold text-primary text-base">Détails de la commande</h3>
              <p className="text-xs text-[#74777d] font-mono">{commande.numero}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BadgeStatutCommande statut={commande.statut} />
            <button
              onClick={onFermer}
              aria-label="Fermer"
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* ── Corps scrollable ── */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Acheteur */}
          <section>
            <h4 className="text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User size={13} /> Acheteur
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
              <p className="font-semibold text-primary text-sm">{commande.acheteur?.fullName ?? '—'}</p>
              {commande.acheteur?.email && (
                <p className="text-xs text-[#74777d] flex items-center gap-1.5">
                  <Mail size={12} className="shrink-0" /> {commande.acheteur.email}
                </p>
              )}
              {commande.acheteur?.phone && (
                <p className="text-xs text-[#74777d] flex items-center gap-1.5">
                  <Phone size={12} className="shrink-0" /> {commande.acheteur.phone}
                </p>
              )}
            </div>
          </section>

          {/* Articles */}
          <section>
            <h4 className="text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Package size={13} /> Articles ({commande.lignes.length})
            </h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
              {commande.lignes.map((ligne, i) => {
                // Priorité : snapshot enregistré à la commande → populate si détail
                const nomAffiche   = ligne.nomProduit  || (ligne.produit as any)?.nom  || '—';
                const photoAffiche = ligne.photoProduit ?? (ligne.produit as any)?.photoCouverture ?? null;
                return (
                  <div key={i} className="flex items-center gap-3 p-3.5">
                    {photoAffiche ? (
                      <img
                        src={photoAffiche}
                        alt={nomAffiche}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Package size={18} className="text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-primary text-sm truncate">{nomAffiche}</p>
                      <p className="text-xs text-[#74777d]">
                        {ligne.quantite} × {ligne.prixUnitaire.toLocaleString('fr-FR')} FCFA
                      </p>
                      {ligne.variante && (
                        <p className="text-xs text-[#74777d] italic">{ligne.variante}</p>
                      )}
                    </div>
                    <p className="font-semibold text-primary text-sm whitespace-nowrap">
                      {ligne.sousTotal.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Adresse + Paiement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adresse && (
              <section>
                <h4 className="text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin size={13} /> Livraison
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                  <p className="font-medium text-primary">{adresse.nomComplet}</p>
                  {adresse.telephone && <p className="text-xs text-[#74777d]">{adresse.telephone}</p>}
                  {adresse.rue       && <p className="text-xs text-[#74777d]">{adresse.rue}</p>}
                  <p className="text-xs text-[#74777d]">
                    {adresse.ville}{adresse.pays ? `, ${adresse.pays}` : ''}
                  </p>
                  {adresse.instructions && (
                    <p className="text-xs text-[#74777d] italic mt-1">"{adresse.instructions}"</p>
                  )}
                </div>
              </section>
            )}
            {paiement && (
              <section>
                <h4 className="text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CreditCard size={13} /> Paiement
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
                  <p className="font-medium text-primary">
                    {METHODES_PAIEMENT[paiement.methode] ?? paiement.methode}
                  </p>
                  <p className="text-xs text-[#74777d]">
                    Statut : <span className="font-semibold">{paiement.statut ?? '—'}</span>
                  </p>
                  {paiement.reference && (
                    <p className="text-xs text-[#74777d] font-mono">Réf : {paiement.reference}</p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Récapitulatif montants */}
          <section>
            <h4 className="text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp size={13} /> Récapitulatif
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#74777d]">
                <span>Sous-total</span>
                <span>{(cmd.sousTotal ?? commande.total).toLocaleString('fr-FR')} FCFA</span>
              </div>
              {cmd.fraisLivraison > 0 && (
                <div className="flex justify-between text-[#74777d]">
                  <span>Frais de livraison</span>
                  <span>{cmd.fraisLivraison.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              {cmd.remise > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Remise</span>
                  <span>-{cmd.remise.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-primary pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{commande.total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </section>

          {/* Date */}
          <p className="text-xs text-[#74777d] flex items-center gap-1.5">
            <Clock size={12} />
            Passée le{' '}
            {new Date(commande.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>

        {/* ── Pied ── */}
        <div className="p-5 border-t border-gray-100 shrink-0">
          <button
            onClick={onFermer}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-100 text-sm font-semibold
                       text-primary hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
