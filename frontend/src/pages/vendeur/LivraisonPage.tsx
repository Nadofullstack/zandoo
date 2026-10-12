import { Loader2, MapPin, Plus, Truck } from 'lucide-react';
import DispositionVendeur from '../../components/vendeur/layout/DispositionVendeur';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Interrupteur from '../../components/vendeur/livraison/Interrupteur';
import CarteZone from '../../components/vendeur/livraison/CarteZone';
import { nouvelleZone } from '../../components/vendeur/livraison/formulaireLivraison';
import { useLivraisonVendeur } from '../../hooks/vendeur/useLivraisonVendeur';

const CHAMP = 'w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20';
const CARTE = 'bg-white border border-gray-200 rounded-2xl p-6 space-y-5';

/**
 * Espace vendeur — politique de livraison :
 * zones tarifaires, tarif hors zones, livraison offerte et retrait en boutique.
 */
export default function LivraisonPage() {
  const { form, configuree, chargement, enregistrement, erreur, succes, modifie, modifier, enregistrer } = useLivraisonVendeur();

  if (chargement || !form) {
    return (
      <DispositionVendeur>
        {erreur ? <Alert variant="error">{erreur}</Alert> : (
          <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-accent" /></div>
        )}
      </DispositionVendeur>
    );
  }

  return (
    <DispositionVendeur>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary flex items-center gap-2">
          <Truck size={22} className="text-accent" aria-hidden /> Livraison
        </h1>
        <p className="text-sm text-[#74777d] mt-1">
          Définissez vos tarifs par zone. Les frais sont ajoutés automatiquement aux commandes de votre boutique.
        </p>
      </header>

      <div className="space-y-3 mb-5">
        {!configuree && (
          <Alert variant="info">
            Vous n'avez pas encore configuré la livraison : elle est actuellement <strong>offerte</strong> sur toutes vos commandes.
          </Alert>
        )}
        {erreur && <Alert variant="error">{erreur}</Alert>}
        {succes && <Alert variant="success">{succes}</Alert>}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); enregistrer(); }} className="space-y-6 pb-24">
        {/* ── Livraison à domicile ───────────────────────────────────── */}
        <section className={CARTE}>
          <Interrupteur
            actif={form.domicileActif}
            onChange={(domicileActif) => modifier({ domicileActif })}
            libelle="Livraison à domicile"
            description="Vous (ou vos livreurs) livrez le colis à l'adresse de l'acheteur."
          />

          {form.domicileActif && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Zones et tarifs</h2>
                  <span className="text-xs text-[#74777d]">{form.zones.length}/20</span>
                </div>
                {form.zones.length === 0 && (
                  <p className="text-sm text-[#74777d]">Regroupez les villes que vous desservez au même tarif (ex : « Grand Cotonou » → Cotonou, Abomey-Calavi, Sèmè-Kpodji).</p>
                )}
                {form.zones.map((z, i) => (
                  <CarteZone
                    key={z.cle}
                    zone={z}
                    index={i}
                    onChange={(zone) => modifier((f) => ({ ...f, zones: f.zones.map((x) => (x.cle === zone.cle ? zone : x)) }))}
                    onSupprimer={() => modifier((f) => ({ ...f, zones: f.zones.filter((x) => x.cle !== z.cle) }))}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => modifier((f) => ({ ...f, zones: [...f.zones, nouvelleZone()] }))}
                  disabled={form.zones.length >= 20}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-[#74777d] hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                >
                  <Plus size={16} /> Ajouter une zone
                </button>
              </div>

              <div className="pt-5 border-t border-gray-100 space-y-3">
                <Interrupteur
                  actif={form.autresVillesActif}
                  onChange={(autresVillesActif) => modifier({ autresVillesActif })}
                  libelle="Livrer aussi les autres villes"
                  description="Tarif appliqué aux villes qui ne figurent dans aucune zone. Désactivé : ces acheteurs ne pourront pas être livrés."
                />
                {form.autresVillesActif && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="autres-tarif" className="label-admin">Tarif (FCFA)</label>
                      <input id="autres-tarif" type="number" min={0} step={100} value={form.tarifAutresVilles} onChange={(e) => modifier({ tarifAutresVilles: e.target.value })} placeholder="3000" className={CHAMP} />
                    </div>
                    <div>
                      <label htmlFor="autres-dmin" className="label-admin">Délai min (j)</label>
                      <input id="autres-dmin" type="number" min={0} max={60} value={form.delaiAutresMin} onChange={(e) => modifier({ delaiAutresMin: e.target.value })} className={CHAMP} />
                    </div>
                    <div>
                      <label htmlFor="autres-dmax" className="label-admin">Délai max (j)</label>
                      <input id="autres-dmax" type="number" min={0} max={60} value={form.delaiAutresMax} onChange={(e) => modifier({ delaiAutresMax: e.target.value })} className={CHAMP} />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-5 border-t border-gray-100 space-y-3">
                <Interrupteur
                  actif={form.gratuiteActif}
                  onChange={(gratuiteActif) => modifier({ gratuiteActif })}
                  libelle="Livraison offerte à partir d'un montant"
                  description="Incite les acheteurs à commander davantage dans votre boutique."
                />
                {form.gratuiteActif && (
                  <div className="max-w-xs">
                    <label htmlFor="gratuite" className="label-admin">Montant minimum (FCFA)</label>
                    <input id="gratuite" type="number" min={0} step={500} value={form.gratuiteDes} onChange={(e) => modifier({ gratuiteDes: e.target.value })} placeholder="50000" className={CHAMP} />
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        {/* ── Retrait en boutique ────────────────────────────────────── */}
        <section className={CARTE}>
          <Interrupteur
            actif={form.retraitActif}
            onChange={(retraitActif) => modifier({ retraitActif })}
            libelle="Retrait en boutique"
            description="Gratuit pour l'acheteur, qui vient récupérer sa commande à votre point de retrait."
          />

          {form.retraitActif && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="retrait-adresse" className="label-admin">Adresse du point de retrait *</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="retrait-adresse" value={form.retraitAdresse} onChange={(e) => modifier({ retraitAdresse: e.target.value })} maxLength={200} placeholder="Marché Dantokpa, allée 4, boutique 12" className={`${CHAMP} pl-10`} />
                </div>
              </div>
              <div>
                <label htmlFor="retrait-ville" className="label-admin">Ville *</label>
                <input id="retrait-ville" value={form.retraitVille} onChange={(e) => modifier({ retraitVille: e.target.value })} maxLength={60} placeholder="Cotonou" className={CHAMP} />
              </div>
              <div>
                <label htmlFor="retrait-horaires" className="label-admin">Horaires</label>
                <input id="retrait-horaires" value={form.retraitHoraires} onChange={(e) => modifier({ retraitHoraires: e.target.value })} maxLength={120} placeholder="Lun–Sam, 9h–18h" className={CHAMP} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="retrait-instr" className="label-admin">Instructions</label>
                <input id="retrait-instr" value={form.retraitInstructions} onChange={(e) => modifier({ retraitInstructions: e.target.value })} maxLength={300} placeholder="Présentez votre numéro de commande" className={CHAMP} />
              </div>
            </div>
          )}
        </section>

        {/* Barre d'enregistrement */}
        <div className="fixed bottom-0 inset-x-0 lg:left-64 z-20 bg-white/95 backdrop-blur border-t border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-end gap-4">
          {modifie && <span className="text-xs text-[#74777d]">Modifications non enregistrées</span>}
          <Button type="submit" isLoading={enregistrement} loadingText="Enregistrement…" className="!w-auto px-8 py-2.5">
            Enregistrer
          </Button>
        </div>
      </form>
    </DispositionVendeur>
  );
}
