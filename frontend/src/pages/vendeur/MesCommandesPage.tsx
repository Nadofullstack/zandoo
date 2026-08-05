import { ShoppingBag, Loader2, ChevronDown, Truck } from 'lucide-react';
import DispositionVendeur from '../../components/vendeur/layout/DispositionVendeur';
import Alert from '../../components/ui/Alert';
import { useCommandesVendeur } from '../../hooks/vendeur/useCommandesVendeur';

function BadgeStatut({ statut }: { statut: string }) {
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

export default function MesCommandesPage() {
  const {
    commandes, pagination, filtre, chargement,
    chargementAction, erreur, messageSucces,
    setFiltre, expedier,
  } = useCommandesVendeur();

  return (
    <DispositionVendeur>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-primary flex items-center gap-2">
          <ShoppingBag size={22} className="text-accent" aria-hidden />
          Mes commandes
        </h1>
        <p className="text-sm text-[#74777d] mt-1">Suivez et gérez les commandes de votre boutique.</p>
      </header>

      {erreur && <div className="mb-5"><Alert variant="error">{erreur}</Alert></div>}
      {messageSucces && <div className="mb-5"><Alert variant="success">{messageSucces}</Alert></div>}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Filtre statut */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative">
            <select
              value={filtre.statut}
              onChange={(e) => setFiltre({ statut: e.target.value, page: 1 })}
              className="appearance-none pl-3 pr-8 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20"
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="payee">Payée</option>
              <option value="expediee">Expédiée</option>
              <option value="livree">Livrée</option>
              <option value="annulee">Annulée</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="p-4">
          {chargement ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-accent" />
            </div>
          ) : commandes.length === 0 ? (
            <div className="text-center py-16 text-[#74777d] text-sm">
              <ShoppingBag size={36} className="mx-auto mb-3 text-gray-300" />
              Aucune commande pour ces critères.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm" aria-label="Liste des commandes">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">N° commande</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Acheteur</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Articles</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Montant</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Date</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commandes.map((cmd) => {
                    const enCours = chargementAction === cmd._id;
                    return (
                      <tr key={cmd._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs text-primary">{cmd.numero}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-primary">{cmd.acheteur?.fullName ?? '—'}</p>
                          <p className="text-xs text-[#74777d]">{cmd.acheteur?.email ?? ''}</p>
                        </td>
                        <td className="px-4 py-3.5 text-[#74777d]">{cmd.lignes.length} article{cmd.lignes.length > 1 ? 's' : ''}</td>
                        <td className="px-4 py-3.5 font-semibold text-primary whitespace-nowrap">
                          {cmd.total.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-4 py-3.5"><BadgeStatut statut={cmd.statut} /></td>
                        <td className="px-4 py-3.5 text-[#74777d] text-xs whitespace-nowrap">
                          {new Date(cmd.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {cmd.statut === 'payee' && (
                            enCours
                              ? <Loader2 size={16} className="animate-spin text-accent inline" />
                              : (
                                <button
                                  onClick={() => expedier(cmd._id)}
                                  className="cursor-pointer flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-200 transition-colors"
                                >
                                  <Truck size={13} aria-hidden /> Expédier
                                </button>
                              )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && !chargement && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 text-sm text-[#74777d]">
              <p>{pagination.total} commande{pagination.total > 1 ? 's' : ''}</p>
              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFiltre({ page: p })}
                    className={[
                      'w-8 h-8 rounded-lg text-xs font-semibold',
                      filtre.page === p ? 'bg-accent text-white' : 'bg-gray-100 text-primary hover:bg-gray-200',
                    ].join(' ')}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DispositionVendeur>
  );
}
