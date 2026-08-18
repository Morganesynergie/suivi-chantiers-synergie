// Petite couche de compatibilité : reproduit exactement la forme de l'ancien
// `window.storage` (spécifique aux artefacts Claude) mais persiste maintenant
// dans Supabase via nos propres routes API (/api/kv/[key]), qui sont les
// seules à détenir la clé service Supabase (jamais exposée au navigateur).
//
// Signatures conservées volontairement identiques à window.storage pour ne
// changer qu'un minimum de lignes dans SuiviChantiers.jsx :
//   storage.get(key, shared) -> Promise<{ value: string } | null>
//   storage.set(key, value, shared) -> Promise<void>

async function get(key) {
  const res = await fetch(`/api/kv/${encodeURIComponent(key)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Échec de lecture (${res.status})`);
  }
  const data = await res.json();
  if (data.value === null || data.value === undefined) return null;
  return { value: data.value };
}

async function set(key, value) {
  const res = await fetch(`/api/kv/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Échec d'écriture (${res.status})`);
  }
}

export const storage = { get, set };
