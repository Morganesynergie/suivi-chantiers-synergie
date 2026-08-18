import "./globals.css";

export const metadata = {
  title: "Suivi Chantiers — SYNERGIE BTP",
  description: "Suivi des chantiers, situations, règlements et retenues de garantie",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
