import { useState, useEffect } from 'react';
import { getDashboard, getStatistiquesVentes } from '../../services/vendeur/vendeurService';
import type { DashboardData, StatVentesJour } from '../../types/vendeur';

export function useDashboardVendeur() {
  const [dashboard, setDashboard]     = useState<DashboardData | null>(null);
  const [statsVentes, setStatsVentes] = useState<StatVentesJour[]>([]);
  const [chargement, setChargement]   = useState(true);
  const [erreur, setErreur]           = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    setChargement(true);
    Promise.all([getDashboard(), getStatistiquesVentes()])
      .then(([repDash, repVentes]) => {
        if (annule) return;
        setDashboard(repDash.data);
        setStatsVentes(repVentes.data.statsVentes);
      })
      .catch((err) => {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });
    return () => { annule = true; };
  }, []);

  return { dashboard, statsVentes, chargement, erreur };
}
