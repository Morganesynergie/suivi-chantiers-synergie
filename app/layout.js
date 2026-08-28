import "./globals.css";

// Force le rendu dynamique (jamais de mise en cache statique / ISR) pour
// TOUTE l'application, y compris la page "/" elle-même. Sans ça, Next.js
// prérendait "/" comme page statique ("○ /" dans le build), et Vercel
// pouvait alors servir depuis son cache CDN une ancienne réponse pour "/"
// (par ex. une redirection vers /login capturée avant la connexion) sans
// repasser par la vérification fraîche du cookie dans proxy.js — c'est ce
// qui causait le rebond systématique vers /login malgré un cookie valide.
// Exactement le même problème que celui déjà corrigé sur /login.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Suivi Chantiers — SYNERGIE BTP",
  description: "Suivi des chantiers, situations, règlements et retenues de garantie",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Suivi Chantiers",
  },
};

export const viewport = {
  themeColor: "#16233B",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
