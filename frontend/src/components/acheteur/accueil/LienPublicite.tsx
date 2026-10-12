import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface Props {
  lien: string;
  onClic?: () => void;
  className?: string;
  libelle?: string;
  children: ReactNode;
}

/**
 * Lien d'une campagne : navigation interne (React Router) pour « /… »,
 * nouvel onglet sécurisé pour une adresse externe (rel sponsored, conforme aux usages SEO).
 */
export default function LienPublicite({ lien, onClic, className, libelle, children }: Props) {
  if (/^https?:\/\//i.test(lien)) {
    return (
      <a href={lien} target="_blank" rel="noopener noreferrer sponsored" onClick={onClic} className={className} aria-label={libelle}>
        {children}
      </a>
    );
  }
  return (
    <Link to={lien.startsWith('/') ? lien : '/catalogue'} onClick={onClic} className={className} aria-label={libelle}>
      {children}
    </Link>
  );
}
