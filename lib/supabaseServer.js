import { createClient } from "@supabase/supabase-js";

// Client Supabase côté serveur uniquement — utilise la clé "service role",
// qui contourne les policies RLS. Elle ne doit JAMAIS être exposée au
// navigateur : ce fichier n'est importé que par des routes API (server-only),
// jamais par un composant "use client".
let cached = null;

export function getSupabaseServer() {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Variables d'environnement Supabase manquantes (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
