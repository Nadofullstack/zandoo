import { Store, User } from 'lucide-react';

interface Props {
  nom: string;
  image?: string | null;
  type?: 'boutique' | 'client';
  taille?: 'sm' | 'md';
}

/** Avatar d'un interlocuteur : image, sinon initiale sur fond de marque. */
export default function Avatar({ nom, image, type = 'client', taille = 'md' }: Props) {
  const dimension = taille === 'sm' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base';
  return (
    <span className={`${dimension} rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold bg-[#011023] text-white`}>
      {image ? (
        <img src={image} alt="" className="w-full h-full object-cover" />
      ) : nom ? (
        nom.charAt(0).toUpperCase()
      ) : type === 'boutique' ? (
        <Store size={16} />
      ) : (
        <User size={16} />
      )}
    </span>
  );
}
