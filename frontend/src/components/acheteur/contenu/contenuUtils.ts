/**
 * Analyse du contenu des pages statiques (saisi par l'admin dans un champ texte).
 *
 * Syntaxe prise en charge (sous-ensemble de Markdown) :
 *   # Titre   ## Sous-titre   ### Intertitre
 *   - élément / * élément      1. élément numéroté
 *   > citation                 ---  (séparateur)
 *   **gras**  *italique*  [texte](https://… | /page | mailto:… | tel:…)
 *
 * Aucun HTML n'est injecté : le rendu construit des éléments React, donc tout
 * le texte est échappé. Un contenu historique saisi en HTML est converti en texte.
 */

export type Bloc =
  | { type: 'titre'; niveau: 2 | 3 | 4; texte: string }
  | { type: 'paragraphe'; texte: string }
  | { type: 'liste'; ordonnee: boolean; elements: string[] }
  | { type: 'citation'; texte: string }
  | { type: 'separateur' };

export type Segment =
  | { type: 'texte'; valeur: string }
  | { type: 'gras'; valeur: string }
  | { type: 'italique'; valeur: string }
  | { type: 'lien'; valeur: string; href: string };

/** Convertit un ancien contenu HTML en texte structuré (sans jamais l'interpréter). */
function htmlVersTexte(html: string): string {
  return html
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*h1[^>]*>/gi, '\n# ').replace(/<\s*h2[^>]*>/gi, '\n## ').replace(/<\s*h[3-6][^>]*>/gi, '\n### ')
    .replace(/<\s*li[^>]*>/gi, '\n- ')
    .replace(/<\/\s*(p|div|h[1-6]|ul|ol|blockquote)\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");
}

const RE_TITRE    = /^(#{1,3})\s+(.+)$/;
const RE_PUCE     = /^\s*[-*•]\s+(.+)$/;
const RE_NUMERO   = /^\s*\d+[.)]\s+(.+)$/;
const RE_CITATION = /^>\s?(.*)$/;
const RE_SEPARATEUR = /^\s*(-{3,}|\*{3,})\s*$/;

/** Découpe le contenu en blocs typés. */
export function analyserContenu(source: string): Bloc[] {
  const texte = /<\/?[a-z][^>]*>/i.test(source) ? htmlVersTexte(source) : source;
  const lignes = texte.replace(/\r\n?/g, '\n').split('\n');
  const blocs: Bloc[] = [];
  let paragraphe: string[] = [];

  const fermerParagraphe = () => {
    if (paragraphe.length) blocs.push({ type: 'paragraphe', texte: paragraphe.join(' ') });
    paragraphe = [];
  };

  for (const brute of lignes) {
    const ligne = brute.trim();
    let m: RegExpMatchArray | null;

    if (!ligne) { fermerParagraphe(); continue; }

    if (RE_SEPARATEUR.test(ligne)) { fermerParagraphe(); blocs.push({ type: 'separateur' }); continue; }

    if ((m = ligne.match(RE_TITRE))) {
      fermerParagraphe();
      blocs.push({ type: 'titre', niveau: (m[1].length + 1) as 2 | 3 | 4, texte: m[2].trim() });
      continue;
    }

    const puce = ligne.match(RE_PUCE);
    const numero = ligne.match(RE_NUMERO);
    if (puce || numero) {
      fermerParagraphe();
      const ordonnee = !puce;
      const element = (puce ?? numero)![1].trim();
      const dernier = blocs.at(-1);
      if (dernier?.type === 'liste' && dernier.ordonnee === ordonnee) dernier.elements.push(element);
      else blocs.push({ type: 'liste', ordonnee, elements: [element] });
      continue;
    }

    if ((m = ligne.match(RE_CITATION))) {
      fermerParagraphe();
      const dernier = blocs.at(-1);
      if (dernier?.type === 'citation') dernier.texte += ` ${m[1]}`;
      else blocs.push({ type: 'citation', texte: m[1] });
      continue;
    }

    paragraphe.push(ligne);
  }
  fermerParagraphe();
  return blocs;
}

/** Seuls ces liens sont rendus cliquables (pas de javascript:, data:, etc.). */
export const lienSur = (href: string) => /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i.test(href.trim());

const RE_INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Découpe une ligne en segments mis en forme. */
export function analyserLigne(texte: string): Segment[] {
  const segments: Segment[] = [];
  let curseur = 0;

  for (const m of texte.matchAll(RE_INLINE)) {
    const debut = m.index ?? 0;
    if (debut > curseur) segments.push({ type: 'texte', valeur: texte.slice(curseur, debut) });

    if (m[1] !== undefined) segments.push({ type: 'gras', valeur: m[1] });
    else if (m[2] !== undefined) segments.push({ type: 'italique', valeur: m[2] });
    else if (lienSur(m[4])) segments.push({ type: 'lien', valeur: m[3], href: m[4].trim() });
    else segments.push({ type: 'texte', valeur: m[3] }); // lien refusé : texte seul

    curseur = debut + m[0].length;
  }
  if (curseur < texte.length) segments.push({ type: 'texte', valeur: texte.slice(curseur) });
  return segments;
}
