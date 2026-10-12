/** Délai de livraison lisible : « 24h », « Sous 2 jours », « 2 à 3 jours »… (null si inconnu) */
export function libelleDelai(min?: number | null, max?: number | null): string | null {
  if (min == null && max == null) return null;
  const a = min ?? max!;
  const b = max ?? min!;

  if (a === b) {
    if (a === 0) return 'Le jour même';
    return a === 1 ? '24h' : `${a} jours`;
  }
  if (a === 0) return `Sous ${b} jour${b > 1 ? 's' : ''}`;
  return `${a} à ${b} jours`;
}
