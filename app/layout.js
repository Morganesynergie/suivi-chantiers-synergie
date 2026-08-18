import "./globals.css";

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
