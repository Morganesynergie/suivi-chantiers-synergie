// Force le rendu dynamique (jamais de mise en cache statique / ISR) pour
// toute la page de connexion. Sans ça, Vercel peut continuer à servir une
// version mise en cache de /login pendant plusieurs minutes après un
// déploiement (en-tête observé : x-vercel-cache: HIT, age > 100s), ce qui
// donnait l'impression que les correctifs n'étaient jamais pris en compte.
export const dynamic = "force-dynamic";

export default function LoginLayout({ children }) {
  return children;
}
