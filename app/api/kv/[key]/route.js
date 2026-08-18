import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// Petit magasin clé/valeur générique, backé par la table Supabase
// `kv_store(key text primary key, value jsonb, updated_at timestamptz)`.
// L'application n'utilise que 3 clés : "chantiers", "rg-dues", "settings".
//
// Cette route tourne uniquement côté serveur (Route Handler Next.js) et est
// la seule pièce du système à détenir la clé service role Supabase.

export async function GET(request, { params }) {
  const { key } = await params;

  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("kv_store")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ value: null }, { status: 404 });
    }
    // Le composant client attend une chaîne JSON (comme le faisait
    // l'ancien window.storage), donc on re-sérialise la valeur jsonb.
    return NextResponse.json({ value: JSON.stringify(data.value) });
  } catch (e) {
    console.error(`GET /api/kv/${key} failed`, e);
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { key } = await params;

  try {
    const body = await request.json();
    if (typeof body.value !== "string") {
      return NextResponse.json({ error: "Le corps doit contenir { value: <chaîne JSON> }" }, { status: 400 });
    }

    let parsedValue;
    try {
      parsedValue = JSON.parse(body.value);
    } catch {
      return NextResponse.json({ error: "`value` n'est pas un JSON valide" }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("kv_store")
      .upsert({ key, value: parsedValue, updated_at: new Date().toISOString() });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`PUT /api/kv/${key} failed`, e);
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
