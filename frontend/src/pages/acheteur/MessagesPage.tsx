import { useParams } from 'react-router-dom';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import VueMessagerie from '../../components/messagerie/VueMessagerie';

/** Messagerie de l'acheteur : conversations avec les boutiques. */
export default function MessagesPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <AcheteurLayout>
      <div className="max-w-[1280px] mx-auto px-0 sm:px-6 lg:px-10 py-0 sm:py-6">
        <VueMessagerie role="acheteur" basePath="/messages" conversationId={id} hauteur="h-[calc(100dvh-4.5rem)] sm:h-[calc(100dvh-8rem)]" />
      </div>
    </AcheteurLayout>
  );
}
