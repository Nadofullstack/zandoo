import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, Loader2, Package, PackageCheck, PackageX, Star } from 'lucide-react';
import { getNotifications, marquerNotificationLue, toutMarquerLu } from '../../services/messagerieService';
import { useTempsReel } from '../../context/TempsReelContext';
import type { Notification, TypeNotification } from '../../types/messagerie';

const ICONES: Record<TypeNotification, React.ReactNode> = {
  commande_nouvelle: <Package size={16} />,
  commande_statut:   <PackageCheck size={16} />,
  commande_annulee:  <PackageX size={16} />,
  avis_nouveau:      <Star size={16} />,
  avis_reponse:      <Star size={16} />,
  systeme:           <Bell size={16} />,
};

/** « il y a 5 min », « il y a 2 h », « 12 oct. » */
function ilYA(iso: string) {
  const secondes = (Date.now() - new Date(iso).getTime()) / 1000;
  if (secondes < 60) return "à l'instant";
  if (secondes < 3600) return `il y a ${Math.floor(secondes / 60)} min`;
  if (secondes < 86400) return `il y a ${Math.floor(secondes / 3600)} h`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

interface Props {
  /** Apparence du bouton selon la barre qui l'accueille */
  theme?: 'sombre' | 'clair';
}

/** Cloche de notifications : badge temps réel et liste déroulante des dernières notifications. */
export default function ClocheNotifications({ theme = 'sombre' }: Props) {
  const navigate = useNavigate();
  const { socket, notificationsNonLues, ajusterNotificationsNonLues } = useTempsReel();
  const [ouvert, setOuvert] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chargement, setChargement] = useState(false);
  const conteneur = useRef<HTMLDivElement>(null);

  /* Chargement à l'ouverture */
  useEffect(() => {
    if (!ouvert) return;
    let annule = false;
    const charger = async () => {
      setChargement(true);
      try {
        const { notifications: liste } = await getNotifications(1, 10);
        if (!annule) setNotifications(liste);
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [ouvert]);

  /* Une notification qui arrive pendant que la liste est ouverte s'y ajoute en tête */
  useEffect(() => {
    const surNouvelle = (n: Notification) => setNotifications((liste) => [n, ...liste.filter((x) => x._id !== n._id)].slice(0, 10));
    socket.on('notification:nouvelle', surNouvelle);
    return () => { socket.off('notification:nouvelle', surNouvelle); };
  }, [socket]);

  /* Fermeture au clic extérieur et à la touche Échap */
  useEffect(() => {
    if (!ouvert) return;
    const surClic = (e: MouseEvent) => { if (!conteneur.current?.contains(e.target as Node)) setOuvert(false); };
    const surTouche = (e: KeyboardEvent) => { if (e.key === 'Escape') setOuvert(false); };
    document.addEventListener('mousedown', surClic);
    document.addEventListener('keydown', surTouche);
    return () => {
      document.removeEventListener('mousedown', surClic);
      document.removeEventListener('keydown', surTouche);
    };
  }, [ouvert]);

  const ouvrirNotification = (n: Notification) => {
    if (!n.luAt) {
      marquerNotificationLue(n._id).catch(() => {});
      ajusterNotificationsNonLues(-1);
      setNotifications((liste) => liste.map((x) => (x._id === n._id ? { ...x, luAt: new Date().toISOString() } : x)));
    }
    setOuvert(false);
    if (n.lien) navigate(n.lien);
  };

  const toutLire = async () => {
    await toutMarquerLu().catch(() => {});
    ajusterNotificationsNonLues('zero');
    setNotifications((liste) => liste.map((x) => ({ ...x, luAt: x.luAt ?? new Date().toISOString() })));
  };

  const classesBouton = theme === 'sombre'
    ? 'text-white/70 hover:text-white hover:bg-white/10'
    : 'text-gray-500 hover:text-primary hover:bg-gray-100';

  return (
    <div ref={conteneur} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-haspopup="true"
        aria-label={`Notifications${notificationsNonLues ? ` — ${notificationsNonLues} non lue${notificationsNonLues > 1 ? 's' : ''}` : ''}`}
        className={`relative w-9 h-9 flex items-center justify-center rounded-full transition-all ${classesBouton}`}
      >
        <motion.span key={notificationsNonLues} animate={notificationsNonLues ? { rotate: [0, -14, 12, -8, 0] } : {}} transition={{ duration: 0.6 }} className="inline-flex">
          <Bell size={20} />
        </motion.span>
        {notificationsNonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#FC7701] rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1">
            {notificationsNonLues > 99 ? '99+' : notificationsNonLues}
          </span>
        )}
      </button>

      <AnimatePresence>
        {ouvert && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 overflow-hidden z-50 origin-top-right"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-[#011023]">Notifications</p>
              {notifications.some((n) => !n.luAt) && (
                <button type="button" onClick={toutLire} className="inline-flex items-center gap-1 text-xs font-semibold text-[#FC7701] hover:underline">
                  <CheckCheck size={14} /> Tout marquer comme lu
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {chargement && notifications.length === 0 ? (
                <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center text-center py-10 px-6">
                  <Bell size={26} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Vous êtes à jour : aucune notification.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {notifications.map((n) => (
                    <li key={n._id}>
                      <button
                        type="button"
                        onClick={() => ouvrirNotification(n)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${n.luAt ? '' : 'bg-orange-50/40'}`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.type === 'commande_annulee' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-[#FC7701]'}`}>
                          {ICONES[n.type]}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className={`block text-sm truncate ${n.luAt ? 'text-gray-700' : 'font-semibold text-[#011023]'}`}>{n.titre}</span>
                          {n.contenu && <span className="block text-xs text-gray-500 line-clamp-2 mt-0.5">{n.contenu}</span>}
                          <span className="block text-[11px] text-gray-400 mt-1">{ilYA(n.createdAt)}</span>
                        </span>
                        {!n.luAt && <span className="w-2 h-2 rounded-full bg-[#FC7701] mt-2 shrink-0" aria-label="Non lue" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
