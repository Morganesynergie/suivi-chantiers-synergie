/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfjs-dist (utilisé par /api/stamp-repartition pour repérer la position
  // du texte existant sur le PDF Récapitulatif avant d'y superposer
  // l'encadré de répartition) référence en interne un module optionnel
  // "canvas" non installé (inutile ici : on ne fait que LIRE le texte,
  // jamais du rendu graphique) — on l'exclut du bundling pour que Next le
  // résolve directement via node_modules au lieu d'essayer de l'analyser
  // statiquement.
  serverExternalPackages: ["pdfjs-dist"],
};

export default nextConfig;
