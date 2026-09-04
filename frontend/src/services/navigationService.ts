/**
 * Service de navigation impératif — permet de naviguer depuis des modules
 * en dehors de l'arbre React (ex : intercepteurs axios).
 *
 * Usage :
 *   1. Dans App.tsx, appeler NavigationService.setNavigate(navigate) au montage.
 *   2. N'importe où dans le code : NavigationService.navigate('/connexion').
 */

type NavigateFn = (path: string, options?: { replace?: boolean }) => void;

let _navigate: NavigateFn | null = null;

export const NavigationService = {
  setNavigate(fn: NavigateFn): void {
    _navigate = fn;
  },

  navigate(path: string, options?: { replace?: boolean }): void {
    if (_navigate) {
      _navigate(path, options);
    } else {
      // Fallback si React Router n'est pas encore monté
      window.location.href = path;
    }
  },
};
