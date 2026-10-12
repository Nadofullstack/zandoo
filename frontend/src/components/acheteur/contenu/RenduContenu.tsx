import { Link } from 'react-router-dom';
import { analyserContenu, analyserLigne } from './contenuUtils';

/** Mise en forme d'une ligne : gras, italique, liens (internes ou externes). */
function Ligne({ texte }: { texte: string }) {
  return (
    <>
      {analyserLigne(texte).map((s, i) => {
        if (s.type === 'gras') return <strong key={i} className="font-semibold text-[#011023]">{s.valeur}</strong>;
        if (s.type === 'italique') return <em key={i}>{s.valeur}</em>;
        if (s.type === 'lien') {
          const classes = 'text-[#FC7701] font-medium underline underline-offset-2 hover:no-underline';
          return s.href.startsWith('/')
            ? <Link key={i} to={s.href} className={classes}>{s.valeur}</Link>
            : <a key={i} href={s.href} className={classes} {...(/^https?:/i.test(s.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{s.valeur}</a>;
        }
        return <span key={i}>{s.valeur}</span>;
      })}
    </>
  );
}

/** Rendu typographique sûr du contenu d'une page statique (aucune injection HTML). */
export default function RenduContenu({ contenu }: { contenu: string }) {
  const blocs = analyserContenu(contenu);

  return (
    <div className="text-[15px] sm:text-base leading-relaxed text-gray-700 space-y-5">
      {blocs.map((b, i) => {
        switch (b.type) {
          case 'titre': {
            const classes = {
              2: 'text-2xl font-black text-[#011023] pt-4 scroll-mt-28',
              3: 'text-xl font-bold text-[#011023] pt-2 scroll-mt-28',
              4: 'text-base font-bold text-[#011023] uppercase tracking-wide',
            }[b.niveau];
            const Balise = `h${b.niveau}` as 'h2' | 'h3' | 'h4';
            return <Balise key={i} id={`section-${i}`} className={classes}><Ligne texte={b.texte} /></Balise>;
          }
          case 'liste': {
            const Balise = b.ordonnee ? 'ol' : 'ul';
            return (
              <Balise key={i} className={`pl-6 space-y-2 ${b.ordonnee ? 'list-decimal' : 'list-disc'} marker:text-[#FC7701]`}>
                {b.elements.map((e, j) => <li key={j} className="pl-1"><Ligne texte={e} /></li>)}
              </Balise>
            );
          }
          case 'citation':
            return <blockquote key={i} className="border-l-4 border-[#FC7701] bg-orange-50/50 rounded-r-xl px-5 py-3 italic text-gray-600"><Ligne texte={b.texte} /></blockquote>;
          case 'separateur':
            return <hr key={i} className="border-gray-200 my-8" />;
          default:
            return <p key={i}><Ligne texte={b.texte} /></p>;
        }
      })}
    </div>
  );
}
