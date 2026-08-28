# Suivi Chantiers — SYNERGIE BTP

Application de suivi de chantiers (marchés, situations, règlements, retenues
de garantie, cessions de paiement...) migrée depuis un artefact React
autonome vers une vraie application web : **Next.js** + **Supabase**
(base de données), déployée sur **Vercel**.

Toute la logique métier vit dans `components/SuiviChantiers.jsx` (inchangée
par rapport à la version artefact — seule la couche de persistance a été
remplacée). Les données sont maintenant stockées dans Supabase au lieu du
stockage propre aux artefacts Claude.

## Architecture

- `components/SuiviChantiers.jsx` — l'application (composant client unique)
- `lib/kv.js` — petite couche `storage.get/set` appelée par le composant,
  qui parle à nos routes API (`fetch`)
- `app/api/kv/[key]/route.js` — route serveur qui lit/écrit dans Supabase
  avec la clé `service_role` (jamais exposée au navigateur)
- `app/api/documents/route.js` — route serveur qui gère l'upload/téléchargement/
  suppression des documents de chantier dans le bucket Supabase Storage
  `chantier-documents` (glisser-déposer dans les "bulles" documents)
- `lib/supabaseServer.js` — client Supabase serveur
- `supabase/schema_and_seed.sql` — création de la table `kv_store` +
  import des données réelles (44 chantiers, RG, code d'édition)

Le modèle de données reste volontairement simple : une table
`kv_store(key, value jsonb)` avec 3 lignes (`chantiers`, `rg-dues`,
`settings`), au lieu de tables normalisées. Cela reproduit fidèlement le
comportement de l'appli d'origine (qui manipule tout en mémoire puis
persiste l'ensemble) sans réécrire toute la logique métier, tout en
donnant une vraie base de données avec sauvegardes, accessible de partout.

Le code PIN d'édition (`MK2026` par défaut, modifiable dans l'appli) est
conservé tel quel — ce n'est pas un vrai système de comptes utilisateurs,
juste un verrou d'édition côté UI, comme dans la version d'origine. Il ne
protège PAS la consultation : c'est le rôle de `SITE_ACCESS_PASSWORD`
ci-dessous (`middleware.js`), qui verrouille l'accès à tout le site (pages
et API) derrière un mot de passe unique côté serveur.

## Mise en route

### 1. Créer le projet Supabase

1. Sur [supabase.com](https://supabase.com), créer un nouveau projet
   (gratuit).
2. Aller dans **SQL Editor > New query**, coller le contenu de
   `supabase/schema_and_seed.sql`, et l'exécuter. Cela crée la table et
   importe toutes les données réelles en une fois.
3. Aller dans **Project Settings > API** (ou **Data API**) et noter :
   - l'**URL du projet** (`SUPABASE_URL`)
   - la clé **`service_role`** (`SUPABASE_SERVICE_ROLE_KEY`) — à garder
     secrète, ne jamais la mettre dans une variable `NEXT_PUBLIC_*`
4. Aller dans **Storage**, créer un bucket nommé `chantier-documents`,
   **non public** (privé). Il sert à stocker les documents de chantier
   (CCAP, actes d'engagement, DC4...) glissés-déposés dans l'appli. Aucune
   policy RLS à configurer : la route serveur y accède uniquement avec la
   clé `service_role`, qui contourne RLS.

### 2. Développement local

```bash
npm install
cp .env.local.example .env.local
# éditer .env.local avec les valeurs Supabase ci-dessus
npm run dev
```

### 3. Déploiement Vercel

1. Importer ce dépôt GitHub dans [vercel.com](https://vercel.com) (New
   Project > Import Git Repository).
2. Dans **Environment Variables**, ajouter `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` et **`SITE_ACCESS_PASSWORD`** (les mêmes
   valeurs qu'en local — voir `.env.local.example`). **`SITE_ACCESS_PASSWORD`
   est indispensable : sans elle, le site reste entièrement public.**
3. Déployer.

## Notes de migration

- L'ancien stockage `window.storage` (spécifique aux artefacts Claude) a
  été remplacé par `lib/kv.js`, qui garde exactement la même signature
  (`get(key)` / `set(key, value)`) pour minimiser les changements dans le
  composant principal.
- Les données de démonstration (`SEED_CHANTIERS` / `SEED_RG`) sont
  toujours embarquées dans le fichier comme filet de sécurité pour le
  bouton "Recharger depuis la source" des réglages — les vraies données
  vivent désormais dans Supabase.
