import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // L'app est en français : les apostrophes dans le JSX (l'appli,
      // n'est-ce pas, etc.) sont légitimes et n'ont pas besoin d'être
      // échappées en &apos;.
      "react/no-unescaped-entities": "off",
      // Logo et écrans de démo : pas d'optimisation next/image nécessaire ici.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
