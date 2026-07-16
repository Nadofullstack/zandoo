import { FileText, ExternalLink } from 'lucide-react';
import type { DocumentsVendeur } from '../../../types/admin';

interface SectionDocumentsProps {
  documents?: DocumentsVendeur;
}

interface LigneDocument {
  libelle: string;
  url?: string | null;
}

/**
 * Section listant les documents légaux d'un vendeur.
 * Chaque document affiche un lien d'accès ou "Non fourni".
 */
export default function SectionDocuments({ documents }: SectionDocumentsProps) {
  if (!documents) return null;

  const lignes: LigneDocument[] = [
    { libelle: 'RCCM (Registre du Commerce)',    url: documents.rccm },
    { libelle: 'IFU (Identifiant Fiscal Unique)', url: documents.ifu },
    { libelle: "Pièce d'identité",               url: documents.carteIdentite },
    ...(documents.autresDocuments ?? []).map((url, i) => ({
      libelle: `Document complémentaire ${i + 1}`,
      url,
    })),
  ];

  return (
    <div className="bg-surface border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
        <FileText size={15} className="text-accent" aria-hidden="true" />
        Documents légaux
      </h3>

      <ul className="space-y-3">
        {lignes.map((ligne) => (
          <li key={ligne.libelle} className="flex items-center justify-between gap-3">
            <span className="text-sm text-[#74777d]">{ligne.libelle}</span>
            {ligne.url ? (
              <a
                href={ligne.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                Consulter <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : (
              <span className="text-xs text-gray-400 italic">Non fourni</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
