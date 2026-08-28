"use client";

import { useEffect } from "react";

// Désactive automatiquement tout service worker et vide tout cache
// (Cache Storage) qui aurait pu être enregistré pour ce site par le passé.
// Un service worker, une fois enregistré dans un navigateur, reste actif
// indéfiniment et peut continuer à servir d'anciennes versions du site —
// y compris en navigation privée sur certains navigateurs mobiles — même
// si le code actuel n'en installe plus aucun. Ce composant s'assure qu'un
// visiteur qui aurait un service worker "fantôme" d'une ancienne version
// en soit débarrassé automatiquement, sans action manuelle de sa part.
export default function KillServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        })
        .catch(() => {});
    }

    if (typeof caches !== "undefined") {
      caches
        .keys()
        .then((names) => Promise.all(names.map((name) => caches.delete(name))))
        .catch(() => {});
    }
  }, []);

  return null;
}
