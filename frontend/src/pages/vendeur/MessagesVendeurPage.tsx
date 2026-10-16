import { useParams } from 'react-router-dom';
import { MessagesSquare } from 'lucide-react';
import DispositionVendeur from '../../components/vendeur/layout/DispositionVendeur';
import VueMessagerie from '../../components/messagerie/VueMessagerie';

/** Espace vendeur — messages des clients de la boutique. */
export default function MessagesVendeurPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <DispositionVendeur>
      <header className="mb-4 hidden sm:block">
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary flex items-center gap-2">
          <MessagesSquare size={22} className="text-accent" aria-hidden /> Messages clients
        </h1>
        <p className="text-sm text-[#74777d] mt-1">Répondez rapidement : la réactivité rassure les acheteurs et augmente vos ventes.</p>
      </header>
      <VueMessagerie role="vendeur" basePath="/vendeur/messages" conversationId={id} hauteur="h-[calc(100dvh-9rem)] sm:h-[calc(100dvh-12rem)]" />
    </DispositionVendeur>
  );
}
