import { CheckCircle, XCircle, X } from 'lucide-react';
import { usePanier } from '../../../context/PanierContext';

/**
 * Toast de notification pour les actions panier.
 * Se positionne en haut à droite et disparaît automatiquement.
 */
export default function NotificationPanier() {
  const { notification, effacerNotification } = usePanier();

  if (!notification) return null;

  const estSucces = notification.type === 'succes';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-20 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-xs animate-in slide-in-from-right-4 duration-300 ${
        estSucces
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}
    >
      {estSucces ? (
        <CheckCircle size={18} className="text-green-500 shrink-0" />
      ) : (
        <XCircle size={18} className="text-red-500 shrink-0" />
      )}
      <span className="flex-1">{notification.message}</span>
      <button
        onClick={effacerNotification}
        className="shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Fermer la notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
