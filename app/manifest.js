export default function manifest() {
  return {
    name: "Suivi Chantiers — SYNERGIE BTP",
    short_name: "Suivi Chantiers",
    description: "Suivi des chantiers, situations, règlements et retenues de garantie",
    start_url: "/",
    display: "standalone",
    background_color: "#F3F1EA",
    theme_color: "#16233B",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
