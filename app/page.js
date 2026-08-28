import SuiviChantiers from "@/components/SuiviChantiers";

// Ceci est la page réellement affichée pour "/", donc pour TOUT le monde
// une fois connecté (le mot de passe est vérifié en amont par proxy.js —
// personne n'atteint ce fichier sans un cookie valide). Elle doit donc
// simplement afficher l'application (components/SuiviChantiers.jsx).
//
// Avant ce correctif, ce fichier contenait par erreur un ANCIEN formulaire
// de connexion autonome (avec son propre "Connexion réussie", son délai de
// 3 secondes, etc.), complètement indépendant du système de connexion
// actuel (proxy.js + app/login/page.js + app/api/login/route.js). Résultat :
// même avec un cookie de session valide et proxy.js qui laissait passer la
// requête normalement, la page "/" affichait quand même cet ancien
// formulaire de connexion à chaque fois, ce qui donnait l'impression d'un
// bouclage vers la page de connexion après une connexion pourtant réussie.
export default function HomePage() {
  return <SuiviChantiers />;
}
