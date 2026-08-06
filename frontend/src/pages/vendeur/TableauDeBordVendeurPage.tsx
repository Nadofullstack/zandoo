import { ShoppingBag, Package, PackageX, TrendingUp, Loader2 } from 'lucide-react';
import DispositionVendeur from '../../components/vendeur/layout/DispositionVendeur';
import Alert from '../../components/ui/Alert';
import CarteStatistique from '../../components/admin/modal/CarteStatistique';
import { useDashboardVendeur } from '../../hooks/vendeur/useDashboardVendeur';

/* Badge statut commande */
function BadgeStatutCommande({ statut }: { statut: string }) {
  const map: Record<string, string> = {
    en_attente: 'bg-yellow-100 text-yellow-700',
    payee:      'bg-blue-100 text-blue-700',
    expediee:   'bg-purple-100 text-purple-700',
    livree:     'bg-green-100 text-green-700',
    annulee:    'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    en_attente: 'En attente',
    payee:      'Payée',
    expediee:   'Expédiée',
    livree:     'Livrée',
    annulee:    'Annulée',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[statut] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[statut] ?? statut}
    </span>
  );
}

export default function TableauDeBordVendeurPage() {
  const { dashboard, chargement, erreur } = useDashboardVendeur();

  return (
    <DispositionVendeur>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary">Tableau de bord</h1>
        <p className="text-sm text-[#74777d] mt-1">Vue d'ensemble de votre activité.</p>
      </header>

      {erreur && <div className="mb-6"><Alert variant="error">{erreur}</Alert></div>}

      {chargement ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-accent" />
        </div>
      ) : dashboard ? (
        <div className="space-y-8">
          {/* Cartes stats */}
          <section aria-label="Statistiques">
            <h2 className="text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-3">
              Vue d'ensemble
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <CarteStatistique
                titre="Commandes"
                valeur={dashboard.commandes.total}
                icone={ShoppingBag}
                couleur="primary"
              />
              <CarteStatistique
                titre="Chiffre d'affaires"
                valeur={dashboard.chiffreAffaires}
                icone={TrendingUp}
                couleur="success"
                sousTitre="FCFA"
              />
              <CarteStatistique
                titre="Produits publiés"
                valeur={dashboard.produits.total}
                icone={Package}
                couleur="warning"
                sousTitre={`${dashboard.produits.enStock} en stock`}
              />
              <CarteStatistique
                titre="Ruptures de stock"
                valeur={dashboard.produits.enRupture}
                icone={PackageX}
                couleur="danger"
              />
            </div>
          </section>

          {/* Dernières commandes */}
          {dashboard.commandes.dernieres.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
                Dernières commandes
              </h2>
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {/* Vue desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm" aria-label="Dernières commandes">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Commande</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Acheteur</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Montant</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Statut</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dashboard.commandes.dernieres.map((cmd) => (
                        <tr key={cmd._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-primary">{cmd.numero}</td>
                          <td className="px-4 py-3 text-primary">{cmd.acheteur?.fullName ?? '—'}</td>
                          <td className="px-4 py-3 font-semibold text-primary">
                            {cmd.total.toLocaleString('fr-FR')} FCFA
                          </td>
                          <td className="px-4 py-3">
                            <BadgeStatutCommande statut={cmd.statut} />
                          </td>
                          <td className="px-4 py-3 text-[#74777d] text-xs whitespace-nowrap">
                            {new Date(cmd.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vue mobile — cartes */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {dashboard.commandes.dernieres.map((cmd) => (
                    <div key={cmd._id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-primary font-semibold">{cmd.numero}</span>
                        <BadgeStatutCommande statut={cmd.statut} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#74777d]">{cmd.acheteur?.fullName ?? '—'}</span>
                        <span className="font-semibold text-primary">{cmd.total.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <p className="text-xs text-[#74777d]">
                        {new Date(cmd.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Répartition commandes par statut */}
          <section>
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
              Répartition des commandes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(dashboard.commandes.parStatut).map(([statut, nb]) => (
                <div key={statut} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-primary">{nb}</p>
                  <BadgeStatutCommande statut={statut} />
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </DispositionVendeur>
  );
}
