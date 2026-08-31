"use client";
import { storage } from "@/lib/kv";
import { openPrintableDocument } from "@/lib/exportPdf";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { LayoutDashboard, Clock, Building2, ShieldCheck, Lock, Unlock, Plus, Search, ChevronLeft, ChevronDown, X, Check, AlertTriangle, Settings, Loader2, Menu, StickyNote, FileWarning, Undo2, Archive, Send, Trash2, HardHat } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const LOGO_SYNERGIE = "data:image/png;base64,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";

const SEED_CHANTIERS = [{"id": "agence-pigeon", "sheet": "AGENCE PIGEON", "titre": "AGENCE BANCAIRE PIGEON", "client": "REDNECK SCI", "nChantier": "CH001373", "dateDemarrage": null, "betArchi": "INGIENERIE PLUS", "dureePrevue": "3 MOIS", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 216204.89, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 46916.46, "addDate": "2026-04-01", "type": "principal", "tvaRegime": "085"}, {"id": "marche-1", "nom": "AVENANT", "montantHt": 14628.89, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003673", "dateFacture": "2026-05-26", "pctAvancement": 0.38, "montantHt": 73617.63, "tva": 6257.5, "montantTtc": 79875.13, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 23962.54, "fournisseurs": [{"nom": "Transbéton", "montant": 3994.15}], "totalARecevoir": 51918.44, "dateEnvoi": "2026-05-26", "validBet": "2026-06-11", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "agence-pigeon-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003690", "dateFacture": "2026-06-25", "pctAvancement": 0.47, "montantHt": 18226.96, "tva": 1549.29, "montantTtc": 19776.25, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [{"nom": "Transbéton", "montant": 2359.42}], "totalARecevoir": 13423.07, "dateEnvoi": "2026-06-25", "validBet": "2026-06-26", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "agence-pigeon-sit-1", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003732", "dateFacture": "2026-07-29", "pctAvancement": 0.67, "montantHt": 39097.98, "tva": 3323.33, "montantTtc": 42421.31, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 12726.39, "fournisseurs": [{"nom": "Transbéton", "montant": 1561.32}], "totalARecevoir": 28133.6, "dateEnvoi": "2026-07-29", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "agence-pigeon-sit-2", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003734", "dateFacture": "2026-07-29", "pctAvancement": 0.65, "montantHt": 9508.78, "tva": 808.25, "montantTtc": 10317.03, "rg": 515.85, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 9801.17, "dateEnvoi": "2026-07-29", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-1", "isRedFont": true, "id": "agence-pigeon-sit-3", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "Transbéton", "enveloppe": null}], "cessionPaiement": "OUI"}, {"id": "agore", "sheet": "AGORE", "titre": "AGORE", "client": "AGORE", "nChantier": "CH001361", "dateDemarrage": "2026-02-12", "betArchi": "lavilleandco", "dureePrevue": "3 SEMAINES", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 30900, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 10057.95, "addDate": "2026-03-26", "type": "principal", "tvaRegime": "085"}, {"id": "marche-1", "nom": "MARCHE VRD", "montantHt": 124720, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 40596.36, "addDate": "2026-04-27", "type": "ts", "tvaRegime": "085"}, {"id": "prorata", "nom": "PRORATA", "montantHt": null, "tauxTva": null, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": null, "addDate": null, "type": "prorata", "tvaRegime": "autoliq"}], "situations": [{"nSituation": 1, "nFact": "0003560", "dateFacture": "2026-02-24", "pctAvancement": 0.59, "montantHt": 18225, "tva": 1549.12, "montantTtc": 19774.12, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 5932.24, "fournisseurs": [], "totalARecevoir": 13841.89, "dateEnvoi": "2026-03-02", "validBet": "2026-03-25", "validAmo": null, "validAutre": null, "datePaiement": "2026-03-30", "marcheId": "marche-0", "isRedFont": false, "id": "agore-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003589", "dateFacture": "2026-03-25", "pctAvancement": 1, "montantHt": 12675, "tva": 1077.38, "montantTtc": 13752.38, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 4125.71, "fournisseurs": [], "totalARecevoir": 9626.66, "dateEnvoi": "2026-03-27", "validBet": "2026-04-01", "validAmo": null, "validAutre": null, "datePaiement": "2026-04-14", "marcheId": "marche-0", "isRedFont": false, "id": "agore-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003617", "dateFacture": "2026-04-27", "pctAvancement": 0.63, "montantHt": 87821.5, "tva": 7464.83, "montantTtc": 95286.33, "rg": 4764.32, "avanceDeduite": 0, "prorata": 1429.29, "rembAdd": 28972.43, "fournisseurs": [], "totalARecevoir": 60120.29, "dateEnvoi": "2026-04-30", "validBet": "2026-05-19", "validAmo": null, "validAutre": null, "datePaiement": "2026-05-30", "marcheId": "marche-1", "isRedFont": false, "id": "agore-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003650", "dateFacture": "2026-05-25", "pctAvancement": 0.98, "montantHt": 34404.1, "tva": 2924.35, "montantTtc": 37328.45, "rg": 1866.42, "avanceDeduite": 0, "prorata": 559.93, "rembAdd": 11623.93, "fournisseurs": [], "totalARecevoir": 23278.17, "dateEnvoi": "2026-05-26", "validBet": "2026-05-29", "validAmo": null, "validAutre": null, "datePaiement": "2026-06-30", "marcheId": "marche-1", "isRedFont": false, "id": "agore-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "3702", "dateFacture": "2026-06-30", "pctAvancement": 1, "montantHt": 2494.4, "tva": 212.02, "montantTtc": 2706.42, "rg": 135.32, "avanceDeduite": 0, "prorata": 40.6, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 2530.51, "dateEnvoi": "2026-06-30", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-1", "isRedFont": true, "id": "agore-sit-4", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"id": "agore-sit-prorata-0", "nSituation": null, "nFact": "0003666", "dateFacture": "2026-06-30", "pctAvancement": null, "montantHt": 2007.25, "tva": 0, "montantTtc": 2007.25, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 2007.25, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "paye": false, "note": "Bloc PRORATA (format libre dans le fichier source)", "marcheId": "prorata", "montantRegle": null, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "babou", "sheet": "BABOU", "titre": "BABOU", "client": "SCI BABOU", "nChantier": "CH001372", "dateDemarrage": null, "betArchi": "BARBOTTEAU", "dureePrevue": "8 MOIS", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 188314.23, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "085"}, {"id": "marche-1", "nom": "TS", "montantHt": 24000, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003603", "dateFacture": "2026-03-27", "pctAvancement": 0.09, "montantHt": 16077.5, "tva": 1366.59, "montantTtc": 17444.09, "rg": 872.2, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 16571.88, "dateEnvoi": "2026-03-27", "validBet": "2026-04-01", "validAmo": null, "validAutre": null, "datePaiement": "2026-04-08", "marcheId": "marche-0", "isRedFont": false, "id": "babou-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003616", "dateFacture": "2026-04-27", "pctAvancement": 0.21, "montantHt": 25910.78, "tva": 2202.42, "montantTtc": 28113.2, "rg": 1405.66, "avanceDeduite": 0, "prorata": 169.27, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 26538.27, "dateEnvoi": "2026-04-27", "validBet": "2026-04-27", "validAmo": null, "validAutre": null, "datePaiement": "2026-05-06", "marcheId": "marche-0", "isRedFont": false, "id": "babou-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003649", "dateFacture": "2026-05-25", "pctAvancement": 0.35, "montantHt": 24853.97, "tva": 2112.59, "montantTtc": 26966.56, "rg": 1348.33, "avanceDeduite": 0, "prorata": 263.82, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 25354.41, "dateEnvoi": "2026-05-26", "validBet": "2026-05-30", "validAmo": null, "validAutre": null, "datePaiement": "2026-06-26", "marcheId": "marche-0", "isRedFont": false, "id": "babou-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003648", "dateFacture": "2026-06-24", "pctAvancement": 0.42, "montantHt": 11812.85, "tva": 1004.09, "montantTtc": 12816.94, "rg": 640.85, "avanceDeduite": 0, "prorata": 128.17, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 12047.93, "dateEnvoi": "2026-06-25", "validBet": "2026-06-29", "validAmo": null, "validAutre": null, "datePaiement": "2026-07-07", "marcheId": "marche-0", "isRedFont": false, "id": "babou-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003678", "dateFacture": "2026-05-25", "pctAvancement": 0.2, "montantHt": 4886.03, "tva": 415.31, "montantTtc": 5301.34, "rg": 265.07, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 5036.28, "dateEnvoi": "2026-05-26", "validBet": "2026-05-30", "validAmo": null, "validAutre": null, "datePaiement": "2026-06-26", "marcheId": "marche-1", "isRedFont": false, "id": "babou-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "bel-canto", "sheet": "BEL CANTO", "titre": "BEL CANTO", "client": "IMMO DESTRELLAN", "nChantier": "CH001321", "dateDemarrage": "2025-09-01", "betArchi": "SOGERIM", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL (devis 0003780)", "montantHt": 599876.75, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 19468.14, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "085"}, {"id": "marche-1", "nom": "Nouvelle facturation devis 0003780", "montantHt": null, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 19468.14, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-2", "nom": "Nouvelle facturation devis 0003792", "montantHt": null, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 19468.14, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003349", "dateFacture": "2025-09-17", "pctAvancement": 0.09, "montantHt": 22598.12, "tva": 1920.84, "montantTtc": 24518.96, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 24518.96, "dateEnvoi": "2025-09-19", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-09-29", "marcheId": "marche-0", "isRedFont": false, "id": "bel-canto-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "00003372", "dateFacture": "2025-09-25", "pctAvancement": 0.14, "montantHt": 10315.44, "tva": 876.81, "montantTtc": 11192.25, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 11192.25, "dateEnvoi": "2025-09-19", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-11-03", "marcheId": "marche-0", "isRedFont": false, "id": "bel-canto-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003550", "dateFacture": "2026-01-30", "pctAvancement": 0.07, "montantHt": 12212.53, "tva": 1038.07, "montantTtc": 13250.6, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 13250.6, "dateEnvoi": "2026-02-13", "validBet": "2026-02-17", "validAmo": null, "validAutre": null, "datePaiement": "2025-03-27", "marcheId": "marche-1", "isRedFont": false, "id": "bel-canto-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003587", "dateFacture": "2026-03-24", "pctAvancement": 0.1, "montantHt": 4950.28, "tva": 420.77, "montantTtc": 5371.05, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 5371.05, "dateEnvoi": "2026-03-13", "validBet": "2026-03-24", "validAmo": null, "validAutre": null, "datePaiement": "2026-04-30", "marcheId": "marche-1", "isRedFont": false, "id": "bel-canto-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003660", "dateFacture": "2026-05-26", "pctAvancement": null, "montantHt": 8239.54, "tva": 700.36, "montantTtc": 8939.9, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 8939.9, "dateEnvoi": null, "validBet": "2026-06-19", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-1", "isRedFont": false, "id": "bel-canto-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003736", "dateFacture": "2026-07-30", "pctAvancement": 0.17, "montantHt": 5263.2, "tva": 447.37, "montantTtc": 5710.57, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 5710.57, "dateEnvoi": "2026-07-30", "validBet": "2026-07-30", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-1", "isRedFont": true, "id": "bel-canto-sit-5", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003613", "dateFacture": "2026-04-24", "pctAvancement": 0.02, "montantHt": 6870, "tva": 583.95, "montantTtc": 7453.95, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 7453.95, "dateEnvoi": "2026-05-04", "validBet": "2026-05-06", "validAmo": null, "validAutre": null, "datePaiement": "2026-05-28", "marcheId": "marche-2", "isRedFont": false, "id": "bel-canto-sit-6", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003661", "dateFacture": "2026-05-26", "pctAvancement": 0.05, "montantHt": 12329.25, "tva": 1047.99, "montantTtc": 13377.24, "rg": 1041.86, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 12335.38, "dateEnvoi": "2026-05-26", "validBet": "2026-06-19", "validAmo": null, "validAutre": null, "datePaiement": "2026-06-30", "marcheId": "marche-2", "isRedFont": false, "id": "bel-canto-sit-7", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "LBC", "enveloppe": 50911.15}], "cessionPaiement": "OUI"}, {"id": "cabesto", "sheet": "CABESTO", "titre": "CABESTO", "client": "SCI CABESTO HOUELBOURG", "nChantier": "CH1384", "dateDemarrage": "2026-05-06", "betArchi": "BEASSE", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 77741, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 25304.7, "addDate": "2026-05-08", "type": "principal", "tvaRegime": "085"}, {"id": "prorata", "nom": "PRORATA", "montantHt": null, "tauxTva": null, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": null, "addDate": null, "type": "prorata", "tvaRegime": "autoliq"}], "situations": [{"nSituation": 1, "nFact": "0003651", "dateFacture": "2026-05-25", "pctAvancement": 0.82, "montantHt": 63489.1, "tva": 5396.57, "montantTtc": 68885.67, "rg": 0, "avanceDeduite": 0, "prorata": 1033.29, "rembAdd": 20665.7, "fournisseurs": [], "totalARecevoir": 47186.69, "dateEnvoi": "2026-05-26", "validBet": "2026-05-29", "validAmo": null, "validAutre": null, "datePaiement": "2026-07-10", "marcheId": "marche-0", "isRedFont": false, "id": "cabesto-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003693", "dateFacture": "2026-06-25", "pctAvancement": 1, "montantHt": 14251.9, "tva": 1211.41, "montantTtc": 15463.31, "rg": 0, "avanceDeduite": 0, "prorata": 231.95, "rembAdd": 4638.99, "fournisseurs": [], "totalARecevoir": 10592.37, "dateEnvoi": "2026-06-25", "validBet": "2026-07-10", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "cabesto-sit-1", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003731", "dateFacture": "2026-07-27", "pctAvancement": 1, "montantHt": 10342, "tva": 879.07, "montantTtc": 11221.07, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 11221.07, "dateEnvoi": "2026-07-30", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "cabesto-sit-2", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"id": "cabesto-sit-prorata-0", "nSituation": null, "nFact": "0003687", "dateFacture": "2026-06-25", "pctAvancement": null, "montantHt": 3150.84, "tva": 0, "montantTtc": 3150.84, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 3150.84, "dateEnvoi": "2026-06-25", "validBet": "2026-07-10", "validAmo": null, "validAutre": null, "datePaiement": null, "paye": false, "note": "Bloc PRORATA (format libre dans le fichier source)", "marcheId": "prorata", "montantRegle": null, "dateDepotChorus": null}, {"id": "cabesto-sit-prorata-1", "nSituation": null, "nFact": "0003720", "dateFacture": "2026-07-27", "pctAvancement": null, "montantHt": 4451.32, "tva": 0, "montantTtc": 4451.32, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 4451.32, "dateEnvoi": "2026-07-30", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "paye": false, "note": "Bloc PRORATA (format libre dans le fichier source)", "marcheId": "prorata", "montantRegle": null, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "c2e", "sheet": "C2E", "titre": "LOT 3 SYMEG", "client": "C2E", "nChantier": null, "dateDemarrage": null, "betArchi": "Cession de paiement", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 15678, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "085"}], "situations": [], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "chbt", "sheet": "CHBT", "titre": "CHBT", "client": "ICM", "nChantier": null, "dateDemarrage": null, "betArchi": "Cession de paiement", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 12495, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "autoliq"}, {"id": "marche-1", "nom": "NOUVEAU MARCHE PRINCIPAL", "montantHt": 119820.73, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "autoliq"}], "situations": [{"nSituation": 1, "nFact": "0002736", "dateFacture": null, "pctAvancement": 1, "montantHt": 7361, "tva": 0, "montantTtc": 7361, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 7361, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "chbt-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003576", "dateFacture": "2026-03-12", "pctAvancement": 1, "montantHt": 4150, "tva": 0, "montantTtc": 4150, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 4150, "dateEnvoi": "2026-05-19", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "chbt-sit-1", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003577", "dateFacture": "2026-03-12", "pctAvancement": 1, "montantHt": 3785, "tva": 0, "montantTtc": 3785, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 3785, "dateEnvoi": "2026-05-19", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "chbt-sit-2", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003671", "dateFacture": "2026-06-05", "pctAvancement": 1, "montantHt": 6114, "tva": 0, "montantTtc": 6114, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 6114, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "chbt-sit-3", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003716", "dateFacture": "2026-07-20", "pctAvancement": 0.09, "montantHt": 35119.35, "tva": 0, "montantTtc": 35119.35, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 35119.35, "dateEnvoi": "2026-07-21", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-1", "isRedFont": true, "id": "chbt-sit-4", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "cod", "sheet": "COD", "titre": "COD PREFECTURE", "client": "THELEMAQUE", "nChantier": "CH001331", "dateDemarrage": "2025-10-25", "betArchi": "BETA INGENIERIE", "dureePrevue": "4 MOIS", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 249365.98, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 88574.6, "addDate": "2025-10-29", "type": "principal", "tvaRegime": "autoliq"}], "situations": [{"nSituation": 1, "nFact": "0003413", "dateFacture": "2025-10-24", "pctAvancement": 0.09, "montantHt": 24034.3, "tva": 0, "montantTtc": 24034.3, "rg": 1201.71, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 22832.59, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": "2025-11-28", "datePaiement": "2026-03-02", "marcheId": "marche-0", "isRedFont": false, "id": "cod-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003458", "dateFacture": "2025-11-27", "pctAvancement": 0.1, "montantHt": 5828, "tva": 0, "montantTtc": 5828, "rg": 291.4, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 5536.6, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": "2025-01-14", "datePaiement": "2026-03-23", "marcheId": "marche-0", "isRedFont": false, "id": "cod-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003573", "dateFacture": "2025-12-19", "pctAvancement": 0.13, "montantHt": 12062.72, "tva": 0, "montantTtc": 12062.72, "rg": 603.14, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 11459.58, "dateEnvoi": "2026-01-28", "validBet": null, "validAmo": null, "validAutre": "2026-03-03", "datePaiement": "2026-05-19", "marcheId": "marche-0", "isRedFont": false, "id": "cod-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003574", "dateFacture": "2026-01-30", "pctAvancement": 0.26, "montantHt": 43183.16, "tva": 0, "montantTtc": 43183.16, "rg": 2159.16, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 41024.0, "dateEnvoi": "2026-01-28", "validBet": null, "validAmo": null, "validAutre": "2026-03-03", "datePaiement": "2026-05-19", "marcheId": "marche-0", "isRedFont": false, "id": "cod-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 5, "nFact": "0003596", "dateFacture": "2026-03-25", "pctAvancement": 0.44, "montantHt": 29198.29, "tva": 0, "montantTtc": 29198.29, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 29198.29, "dateEnvoi": "2026-03-27", "validBet": null, "validAmo": null, "validAutre": "2026-04-15", "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "cod-sit-4", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 6, "nFact": "0003646", "dateFacture": "2026-05-14", "pctAvancement": 0.56, "montantHt": 66100, "tva": 0, "montantTtc": 66100, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 66100.0, "dateEnvoi": "2026-05-26", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "cod-sit-5", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 7, "nFact": "0003692", "dateFacture": "2026-06-25", "pctAvancement": 0.6, "montantHt": 32896.38, "tva": 0, "montantTtc": 32896.38, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 32896.38, "dateEnvoi": "2026-06-25", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "cod-sit-6", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "crous", "sheet": "CROUS", "titre": "CITERNES AEP DU CROUS AG", "client": "CROUS AG", "nChantier": "CH001375", "dateDemarrage": "2026-04-13", "betArchi": "ETEC", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 130486.37, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 7078.89, "addDate": "2026-06-22", "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003662", "dateFacture": "2026-05-26", "pctAvancement": 0.36, "montantHt": 46807.43, "tva": 3978.63, "montantTtc": 50786.06, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 50786.06, "dateEnvoi": "2026-05-26", "validBet": "2026-06-05", "validAmo": null, "validAutre": null, "datePaiement": "2026-06-24", "marcheId": "marche-0", "isRedFont": false, "id": "crous-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003691", "dateFacture": "2026-06-25", "pctAvancement": 0.45, "montantHt": 11863.25, "tva": 1008.38, "montantTtc": 12871.63, "rg": 643.58, "avanceDeduite": 0, "prorata": 0, "rembAdd": 3861.49, "fournisseurs": [], "totalARecevoir": 8366.56, "dateEnvoi": "2026-06-26", "validBet": "2026-07-03", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "crous-sit-1", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003729", "dateFacture": "2026-07-24", "pctAvancement": 0.78, "montantHt": 43525.7, "tva": 3699.68, "montantTtc": 47225.38, "rg": 2361.27, "avanceDeduite": 0, "prorata": 0, "rembAdd": 2361.27, "fournisseurs": [], "totalARecevoir": 42502.85, "dateEnvoi": "2026-07-24", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "crous-sit-2", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "domaine-de-bel-air", "sheet": "DOMAINE DE BEL AIR", "titre": "DOMAINE DE BEL AIR", "client": "PAYEN", "nChantier": null, "dateDemarrage": null, "betArchi": "-", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 32825, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 14246.05, "addDate": "2026-07-20", "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003728", "dateFacture": "2026-07-30", "pctAvancement": 0.87, "montantHt": 28672.5, "tva": 2437.16, "montantTtc": 31109.66, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 12443.86, "fournisseurs": [], "totalARecevoir": 18665.8, "dateEnvoi": "2026-07-30", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "domaine-de-bel-air-sit-0", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "domaine-de-monteran", "sheet": "DOMAINE DE MONTERAN", "titre": "MONTMIR", "client": "Laurence LIGNIERES", "nChantier": null, "dateDemarrage": "2025-12-01", "betArchi": "-", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 124880, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 40000, "addDate": "2025-12-17", "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003520", "dateFacture": "2026-01-26", "pctAvancement": 0.43, "montantHt": 54328.5, "tva": 4617.92, "montantTtc": 58946.42, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 41262.5, "dateEnvoi": "2026-01-28", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-02-08", "marcheId": "marche-0", "isRedFont": false, "id": "domaine-de-monteran-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003549", "dateFacture": "2026-02-19", "pctAvancement": 0.99, "montantHt": 69151.5, "tva": 5877.88, "montantTtc": 75029.38, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [{"nom": "BTP 971 services", "montant": 17956.75}, {"nom": "JJ BTP", "montant": 18691.76}], "totalARecevoir": 16064.79, "dateEnvoi": "2026-02-24", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-03-03", "marcheId": "marche-0", "isRedFont": false, "id": "domaine-de-monteran-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "BTP 971 services", "enveloppe": null}, {"nom": "JJ BTP", "enveloppe": null}], "cessionPaiement": "OUI"}, {"id": "domdirgest", "sheet": "DOMDIRGEST", "titre": "RELAIS DU MOULIN", "client": "DOMDIRGEST", "nChantier": "CH0001273", "dateDemarrage": "2025-06-01", "betArchi": "CEC INFRA", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 409528, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 44433.79, "addDate": "2025-03-03", "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003231", "dateFacture": "2025-06-27", "pctAvancement": 0.04, "montantHt": 15750, "tva": 1338.75, "montantTtc": 17088.75, "rg": 854.44, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 16234.31, "dateEnvoi": "2025-06-30", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-07-21", "marcheId": "marche-0", "isRedFont": false, "id": "domdirgest-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003304", "dateFacture": "2025-07-24", "pctAvancement": 0.07, "montantHt": 11812.5, "tva": 1004.06, "montantTtc": 12816.56, "rg": 640.83, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 12175.73, "dateEnvoi": "2025-07-30", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-09-17", "marcheId": "marche-0", "isRedFont": false, "id": "domdirgest-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003337", "dateFacture": "2025-08-28", "pctAvancement": 0.11, "montantHt": 15750, "tva": 1338.75, "montantTtc": 17088.75, "rg": 854.44, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 16234.31, "dateEnvoi": "2025-08-30", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-09-17", "marcheId": "marche-0", "isRedFont": false, "id": "domdirgest-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003370", "dateFacture": "2025-09-25", "pctAvancement": 0.17, "montantHt": 28012.5, "tva": 2381.06, "montantTtc": 30393.56, "rg": 1519.68, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 28873.88, "dateEnvoi": "2025-09-30", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-11-06", "marcheId": "marche-0", "isRedFont": false, "id": "domdirgest-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 5, "nFact": "0003451", "dateFacture": "2025-11-24", "pctAvancement": 0.29, "montantHt": 49005, "tva": 4165.43, "montantTtc": 53170.43, "rg": 2658.52, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 34560.78, "dateEnvoi": "2025-11-24", "validBet": "2025-12-05", "validAmo": null, "validAutre": null, "datePaiement": "2025-12-08", "marcheId": "marche-0", "isRedFont": false, "id": "domdirgest-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 6, "nFact": "0003733", "dateFacture": "2026-07-29", "pctAvancement": 0.34, "montantHt": 17940, "tva": 1524.9, "montantTtc": 19464.9, "rg": 973.25, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 14598.68, "dateEnvoi": "2026-07-29", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "domdirgest-sit-5", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "eden-bay", "sheet": "EDEN-BAY", "titre": "EDEN BAY", "client": "ABR INVESTISSMENT", "nChantier": null, "dateDemarrage": null, "betArchi": "JL CAILLEUX", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 797000, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 86474.5, "addDate": null, "type": "principal", "tvaRegime": "085"}], "situations": [], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "SOGETRA", "enveloppe": 86016}], "cessionPaiement": "OUI"}, {"id": "edt", "sheet": "EDT", "titre": "VILLAGE DES FAMILLES", "client": "EDT", "nChantier": "CH001363", "dateDemarrage": "2026-03-09", "betArchi": "VIALIS INGENIERIE", "dureePrevue": "3 MOIS", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 90107.34, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "autoliq"}], "situations": [{"nSituation": 1, "nFact": "0003588", "dateFacture": "2026-03-24", "pctAvancement": 0.17, "montantHt": 17489.83, "tva": 0, "montantTtc": 17489.83, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 17489.83, "dateEnvoi": "2026-03-24", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "edt-sit-0", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003615", "dateFacture": "2026-04-24", "pctAvancement": 0.3, "montantHt": 9503.53, "tva": 0, "montantTtc": 9503.53, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 9503.53, "dateEnvoi": "2026-04-24", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "edt-sit-1", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003663", "dateFacture": "2026-05-26", "pctAvancement": 0.38, "montantHt": 3812.64, "tva": 0, "montantTtc": 3812.64, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 3812.64, "dateEnvoi": "2026-05-26", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "edt-sit-2", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "gadarkan-fils", "sheet": "GADARKAN&FILS", "titre": "CHU", "client": "GADARKAN&FILS TP", "nChantier": "CH001255", "dateDemarrage": "2024-04-01", "betArchi": "ETEC", "dureePrevue": null, "marches": [{"id": "marche-principal", "nom": "Marché principal BETON", "montantHt": 785091, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": null, "addDate": null, "type": "principal", "tvaRegime": "autoliq"}, {"id": "ts-muret-chu", "nom": "TS MURET CHU", "montantHt": 23535, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": null, "addDate": null, "type": "ts", "tvaRegime": "autoliq"}, {"id": "ts-reglage-plateformes", "nom": "TS REGLAGE PLATEFORMES", "montantHt": 60668.75, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": null, "addDate": null, "type": "ts", "tvaRegime": "autoliq"}, {"id": "pose-borne-sgec", "nom": "POSE BORNE - SGEC (CH001365)", "montantHt": 57675, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": null, "addDate": null, "type": "ts", "tvaRegime": "autoliq"}], "situations": [{"nSituation": 1, "nFact": "0003201", "dateFacture": "2025-05-26", "pctAvancement": 0.0519, "montantHt": 37422, "tva": 0, "montantTtc": 37422, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 37422, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2024-07-30", "paye": true, "note": "", "marcheId": "marche-principal", "montantRegle": 38000, "id": "gadarkan-fils-sit-0", "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003353", "dateFacture": "2025-09-22", "pctAvancement": 0.2706, "montantHt": 157675, "tva": 0, "montantTtc": 157675, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 157675, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-12-22", "paye": true, "note": "", "marcheId": "marche-principal", "montantRegle": 145943.15, "id": "gadarkan-fils-sit-1", "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003423", "dateFacture": "2025-11-21", "pctAvancement": 0.3883, "montantHt": 84882.2, "tva": 0, "montantTtc": 84882.2, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 84882.2, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-03-05", "paye": true, "note": "", "marcheId": "marche-principal", "montantRegle": 40348, "id": "gadarkan-fils-sit-2", "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003518", "dateFacture": "2026-02-26", "pctAvancement": 0.7489, "montantHt": 260020.8, "tva": 0, "montantTtc": 260020.8, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 260020.8, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-05-07", "paye": true, "note": "", "marcheId": "marche-principal", "montantRegle": 335615.35, "id": "gadarkan-fils-sit-3", "dateDepotChorus": null}, {"nSituation": 5, "nFact": "0003593", "dateFacture": "2026-04-30", "pctAvancement": 1.1264, "montantHt": 239681.04, "tva": 0, "montantTtc": 239681.04, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 239681.04, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-06-26", "paye": true, "note": "% avancement > 100% dans le fichier source — à vérifier", "marcheId": "marche-principal", "montantRegle": 37563.2, "id": "gadarkan-fils-sit-4", "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003097", "dateFacture": "2025-02-27", "pctAvancement": 0.5, "montantHt": 11767.5, "tva": 0, "montantTtc": 11767.5, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 11767.5, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-04-17", "paye": true, "note": "", "marcheId": "ts-muret-chu", "montantRegle": 11767.5, "id": "gadarkan-fils-sit-5", "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003170", "dateFacture": "2025-03-30", "pctAvancement": 0.95, "montantHt": 10590.75, "tva": 0, "montantTtc": 10590.75, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 10590.75, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-05-28", "paye": true, "note": "", "marcheId": "ts-muret-chu", "montantRegle": 10120.05, "id": "gadarkan-fils-sit-6", "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003575", "dateFacture": "2026-03-06", "pctAvancement": 1, "montantHt": 1176.75, "tva": 0, "montantTtc": 1176.75, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 1176.75, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-09-01", "paye": true, "note": "", "marcheId": "ts-muret-chu", "montantRegle": 1647.45, "id": "gadarkan-fils-sit-7", "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003345", "dateFacture": "2025-08-30", "pctAvancement": 1, "montantHt": 42524.75, "tva": 0, "montantTtc": 42524.75, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 42524.75, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "paye": false, "note": "", "marcheId": "ts-reglage-plateformes", "montantRegle": null, "id": "gadarkan-fils-sit-8", "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003540", "dateFacture": "2025-08-31", "pctAvancement": 1, "montantHt": 18144, "tva": 0, "montantTtc": 18144, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 18144, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "paye": false, "note": "", "marcheId": "ts-reglage-plateformes", "montantRegle": null, "id": "gadarkan-fils-sit-9", "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003571", "dateFacture": "2025-12-22", "pctAvancement": 0.1899, "montantHt": 10951.1, "tva": 0, "montantTtc": 10951.1, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 10951.1, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-03-05", "paye": true, "note": "", "marcheId": "pose-borne-sgec", "montantRegle": 10951.1, "id": "gadarkan-fils-sit-10", "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003572", "dateFacture": "2026-01-30", "pctAvancement": 0.4283, "montantHt": 13750.3, "tva": 0, "montantTtc": 13750.3, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 13750.3, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-05-07", "paye": true, "note": "", "marcheId": "pose-borne-sgec", "montantRegle": 13750.3, "id": "gadarkan-fils-sit-11", "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003461", "dateFacture": "2026-05-08", "pctAvancement": 0.5203, "montantHt": 5306.2, "tva": 0, "montantTtc": 5306.2, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 5306.2, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-06-26", "paye": true, "note": "Montant réglé illisible dans le fichier source (valeur corrompue) — à vérifier avec la banque/le relevé", "marcheId": "pose-borne-sgec", "montantRegle": null, "id": "gadarkan-fils-sit-12", "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003675", "dateFacture": "2026-06-11", "pctAvancement": 0.59, "montantHt": 4297.44, "tva": 0, "montantTtc": 4297.44, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 4297.44, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "paye": false, "note": "", "marcheId": "pose-borne-sgec", "montantRegle": null, "id": "gadarkan-fils-sit-13", "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "gtm", "sheet": "GTM", "titre": "RESIDENCE LES GOYAVIERS", "client": "GTM GUADELOUPE", "nChantier": "CH001308", "dateDemarrage": "2025-11-01", "betArchi": "GTM", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 28466, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "autoliq"}, {"id": "marche-1", "nom": "TENNIS CLUB - MARCHE PRINCIPAL", "montantHt": 9396, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "autoliq"}], "situations": [{"nSituation": 1, "nFact": "0003435", "dateFacture": "2025-11-13", "pctAvancement": 0.35, "montantHt": 9949.5, "tva": 0, "montantTtc": 9949.5, "rg": 497.48, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 9452.02, "dateEnvoi": "2025-11-14", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "gtm-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003514", "dateFacture": "2026-01-16", "pctAvancement": 1, "montantHt": 10611.1, "tva": 0, "montantTtc": 10611.1, "rg": 530.56, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 10080.55, "dateEnvoi": "2026-01-23", "validBet": "2026-02-10", "validAmo": null, "validAutre": null, "datePaiement": "2026-03-10", "marcheId": "marche-0", "isRedFont": false, "id": "gtm-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003501", "dateFacture": "2025-12-30", "pctAvancement": 0.9, "montantHt": 8456.4, "tva": 0, "montantTtc": 8456.4, "rg": 422.82, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 8033.58, "dateEnvoi": "2026-01-05", "validBet": "2026-02-10", "validAmo": null, "validAutre": null, "datePaiement": "2026-06-30", "marcheId": "marche-1", "isRedFont": false, "id": "gtm-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "gtp", "sheet": "GTP", "titre": "GTP", "client": "GTP", "nChantier": "CH001332", "dateDemarrage": "2026-02-15", "betArchi": "CCET", "dureePrevue": "1 MOIS", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 26680, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "085"}, {"id": "marche-1", "nom": "MARCHE PRINCIPAL", "montantHt": 86445.25, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "autoliq"}], "situations": [{"nSituation": 1, "nFact": "0003619", "dateFacture": "2026-04-24", "pctAvancement": 0.05, "montantHt": 4750, "tva": 0, "montantTtc": 4750, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 4750, "dateEnvoi": "2026-04-27", "validBet": "2026-06-30", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-1", "isRedFont": true, "id": "gtp-sit-0", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "hta-cgp-hta", "sheet": "HTA-CGP (HTA)", "titre": "HTA", "client": "HTA-CGP", "nChantier": "CH001392", "dateDemarrage": null, "betArchi": "BARBOTTEAU", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 403116.08, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003683", "dateFacture": "2026-06-26", "pctAvancement": 13.35, "montantHt": 53801.45, "tva": 4573.12, "montantTtc": 58374.57, "rg": 2918.73, "avanceDeduite": 0, "prorata": 583.75, "rembAdd": 0, "fournisseurs": [{"nom": "SGB", "montant": 35431.85}], "totalARecevoir": 19440.25, "dateEnvoi": "2026-06-30", "validBet": "2026-07-02", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "hta-cgp-hta-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003722", "dateFacture": "2026-07-28", "pctAvancement": 0.33, "montantHt": 79076.75, "tva": 6721.52, "montantTtc": 85798.27, "rg": 4289.91, "avanceDeduite": 0, "prorata": 857.98, "rembAdd": 0, "fournisseurs": [{"nom": "SOTRAG", "montant": 20168.99}, {"nom": "SGB", "montant": 2271.24}], "totalARecevoir": 58210.15, "dateEnvoi": "2026-07-28", "validBet": "2026-07-29", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "hta-cgp-hta-sit-1", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "SGB", "enveloppe": 52500}, {"nom": "SOTRAG", "enveloppe": 67229.96}], "cessionPaiement": "OUI"}, {"id": "hta-cgp-cpg", "sheet": "HTA-CGP (CPG)", "titre": "CPG", "client": "HTA-CGP", "nChantier": "CH001391", "dateDemarrage": null, "betArchi": "BARBOTTEAU", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": null, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 145657.65, "addDate": "2026-06-15", "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003684", "dateFacture": "2026-06-26", "pctAvancement": 15.18, "montantHt": 67941.15, "tva": 5775.0, "montantTtc": 73716.15, "rg": 3685.81, "avanceDeduite": 0, "prorata": 737.16, "rembAdd": 22114.84, "fournisseurs": [], "totalARecevoir": 47178.33, "dateEnvoi": "2026-06-30", "validBet": "2026-07-02", "validAmo": null, "validAutre": null, "datePaiement": "2026-07-14", "marcheId": "marche-0", "isRedFont": false, "id": "hta-cgp-cpg-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003723", "dateFacture": "2026-07-28", "pctAvancement": 0.37, "montantHt": 134571.78, "tva": 11438.6, "montantTtc": 146010.38, "rg": 7300.52, "avanceDeduite": 0, "prorata": 1460.1, "rembAdd": 43803.11, "fournisseurs": [{"nom": "SOTRAG", "montant": 71451.98}, {"nom": "SGB", "montant": 0}], "totalARecevoir": 21994.66, "dateEnvoi": "2026-07-28", "validBet": "2026-07-29", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "hta-cgp-cpg-sit-1", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "SGB", "enveloppe": 80300}, {"nom": "SOTRAG", "enveloppe": 102074.25}], "cessionPaiement": "OUI"}, {"id": "jlm-antilles", "sheet": "JLM ANTILLES", "titre": "JLM ANTILLES", "client": "JLM ANTILLES", "nChantier": null, "dateDemarrage": null, "betArchi": "Cession de paiement:", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 22077, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 7186.06, "addDate": "2026-06-22", "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003701", "dateFacture": "2026-06-30", "pctAvancement": 1, "montantHt": 22077, "tva": 1876.55, "montantTtc": 23953.54, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 7186.06, "fournisseurs": [], "totalARecevoir": 16767.48, "dateEnvoi": "2026-07-27", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "jlm-antilles-sit-0", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "horizon", "sheet": "HORIZON", "titre": "SCI HORIZON", "client": "SODIPA", "nChantier": "CH001317", "dateDemarrage": "2025-09-01", "betArchi": "ETEC", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 343600, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 55920.9, "addDate": "2025-08-11", "type": "principal", "tvaRegime": "085"}, {"id": "marche-1", "nom": "MARCHE PRINCIPAL", "montantHt": 97332, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 15840.78, "addDate": "2025-08-11", "type": "ts", "tvaRegime": "085"}, {"id": "marche-2", "nom": "TS VRD MURET MITOYEN + CLOTURE", "montantHt": 33035, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-3", "nom": "TS VRD - RESEAUX ENROBES RALENTISSEURS", "montantHt": 51920, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-4", "nom": "TS GO DEMOLITION ANCIEN REFECTOIRE", "montantHt": 2850, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-5", "nom": "TS VRD QUAIE DECHARGEMENT", "montantHt": 5120, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-6", "nom": "TS VRD RESEAUX EDF", "montantHt": 10659.4, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-7", "nom": "TS VRD ZONE SOGEDIS", "montantHt": 4130, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-8", "nom": "TS VRD PHASE 4", "montantHt": 27497, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003328", "dateFacture": "2025-08-27", "pctAvancement": 0.22, "montantHt": 76226, "tva": 6479.21, "montantTtc": 82705.21, "rg": 4135.26, "avanceDeduite": 0, "prorata": 0, "rembAdd": 12405.78, "fournisseurs": [], "totalARecevoir": 66164.17, "dateEnvoi": "2025-08-27", "validBet": "2025-09-05", "validAmo": "2025-09-10", "validAutre": null, "datePaiement": "2025-09-19", "marcheId": "marche-0", "isRedFont": false, "id": "horizon-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003364", "dateFacture": "2025-09-25", "pctAvancement": 0.62, "montantHt": 136649, "tva": 11615.17, "montantTtc": 148264.17, "rg": -4135.26, "avanceDeduite": 0, "prorata": 0, "rembAdd": 22239.62, "fournisseurs": [], "totalARecevoir": 130159.8, "dateEnvoi": "2025-09-26", "validBet": "2025-09-27", "validAmo": "2025-10-05", "validAutre": null, "datePaiement": "2025-11-07", "marcheId": "marche-0", "isRedFont": false, "id": "horizon-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003399", "dateFacture": "2025-10-23", "pctAvancement": 0.94, "montantHt": 109066, "tva": 9270.61, "montantTtc": 118336.61, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 17750.49, "fournisseurs": [], "totalARecevoir": 100586.12, "dateEnvoi": "2025-10-23", "validBet": "2025-11-03", "validAmo": "2025-11-14", "validAutre": null, "datePaiement": "2025-12-15", "marcheId": "marche-0", "isRedFont": false, "id": "horizon-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003449", "dateFacture": "2025-11-24", "pctAvancement": 0.98, "montantHt": 15331.5, "tva": 1303.18, "montantTtc": 16634.68, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 2889.06, "fournisseurs": [], "totalARecevoir": 13745.62, "dateEnvoi": "2025-11-24", "validBet": "2025-12-17", "validAmo": "2025-12-18", "validAutre": null, "datePaiement": "2026-02-04", "marcheId": "marche-0", "isRedFont": false, "id": "horizon-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 5, "nFact": "0003493", "dateFacture": "2025-12-18", "pctAvancement": 0.99, "montantHt": 3907.5, "tva": 332.14, "montantTtc": 4239.64, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 635.94, "fournisseurs": [], "totalARecevoir": 3603.7, "dateEnvoi": "2025-12-18", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-02-04", "marcheId": "marche-0", "isRedFont": false, "id": "horizon-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 6, "nFact": "0003680", "dateFacture": "2026-06-17", "pctAvancement": 1, "montantHt": 2420, "tva": 205.7, "montantTtc": 2625.7, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 2625.7, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "horizon-sit-5", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003400", "dateFacture": "2025-10-23", "pctAvancement": 0.2, "montantHt": 19095.5, "tva": 1623.12, "montantTtc": 20718.62, "rg": 1035.93, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 19682.69, "dateEnvoi": "2025-10-23", "validBet": "2025-11-03", "validAmo": null, "validAutre": null, "datePaiement": "2025-12-15", "marcheId": "marche-1", "isRedFont": false, "id": "horizon-sit-6", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003450", "dateFacture": "2025-11-24", "pctAvancement": 0.51, "montantHt": 30552.7, "tva": 2596.98, "montantTtc": 33149.68, "rg": -1035.93, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 34185.61, "dateEnvoi": "2025-11-24", "validBet": "2025-12-16", "validAmo": null, "validAutre": null, "datePaiement": "2026-01-27", "marcheId": "marche-1", "isRedFont": false, "id": "horizon-sit-7", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003494", "dateFacture": "2025-12-18", "pctAvancement": 1, "montantHt": 47683.8, "tva": 4053.12, "montantTtc": 42066.75, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 15840.78, "fournisseurs": [], "totalARecevoir": 26225.97, "dateEnvoi": "2025-12-18", "validBet": "2026-01-23", "validAmo": null, "validAutre": null, "datePaiement": "2026-05-04", "marcheId": "marche-1", "isRedFont": false, "id": "horizon-sit-8", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003401", "dateFacture": "2025-10-23", "pctAvancement": 0.44, "montantHt": 14671.75, "tva": 1247.1, "montantTtc": 15918.85, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 15918.85, "dateEnvoi": "2025-10-23", "validBet": "2025-11-03", "validAmo": "2025-11-14", "validAutre": null, "datePaiement": "2025-12-15", "marcheId": "marche-2", "isRedFont": false, "id": "horizon-sit-9", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003453", "dateFacture": "2025-11-25", "pctAvancement": 1, "montantHt": 18363.25, "tva": 1560.88, "montantTtc": 19924.13, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 19924.13, "dateEnvoi": "2026-01-12", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-02-04", "marcheId": "marche-2", "isRedFont": false, "id": "horizon-sit-10", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003418", "dateFacture": "2025-10-28", "pctAvancement": 1, "montantHt": 51920, "tva": 4413.2, "montantTtc": 56333.2, "rg": 2816.66, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 53516.54, "dateEnvoi": "2025-10-28", "validBet": "2025-11-03", "validAmo": "2025-11-14", "validAutre": null, "datePaiement": "2025-12-12", "marcheId": "marche-3", "isRedFont": false, "id": "horizon-sit-11", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003419", "dateFacture": "2025-10-28", "pctAvancement": 1, "montantHt": 2850, "tva": 242.25, "montantTtc": 3092.25, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 3092.25, "dateEnvoi": "2025-10-28", "validBet": "2025-11-05", "validAmo": "2025-11-14", "validAutre": null, "datePaiement": "2025-12-15", "marcheId": "marche-4", "isRedFont": false, "id": "horizon-sit-12", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003420", "dateFacture": "2025-10-28", "pctAvancement": 1, "montantHt": 5120, "tva": 435.2, "montantTtc": 5555.2, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 5555.2, "dateEnvoi": "2025-10-28", "validBet": "2025-11-05", "validAmo": "2025-11-14", "validAutre": null, "datePaiement": "2025-12-15", "marcheId": "marche-5", "isRedFont": false, "id": "horizon-sit-13", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003513", "dateFacture": "2012-11-27", "pctAvancement": 1, "montantHt": 10659.4, "tva": 906.05, "montantTtc": 11565.45, "rg": 578.27, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 10987.18, "dateEnvoi": "2025-10-28", "validBet": "2025-11-05", "validAmo": "2025-12-16", "validAutre": null, "datePaiement": "2026-02-04", "marcheId": "marche-6", "isRedFont": false, "id": "horizon-sit-14", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003408", "dateFacture": "2025-10-28", "pctAvancement": 0.74, "montantHt": 3037, "tva": 258.15, "montantTtc": 3295.14, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 3295.14, "dateEnvoi": "2025-10-28", "validBet": "2025-11-05", "validAmo": "2025-11-14", "validAutre": null, "datePaiement": "2025-12-15", "marcheId": "marche-7", "isRedFont": false, "id": "horizon-sit-15", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003452", "dateFacture": "2025-11-25", "pctAvancement": 1, "montantHt": 1093, "tva": 92.91, "montantTtc": 1185.9, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 1185.9, "dateEnvoi": "2026-01-12", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-7", "isRedFont": false, "id": "horizon-sit-16", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003624", "dateFacture": "2026-04-27", "pctAvancement": null, "montantHt": 27497, "tva": 2337.25, "montantTtc": 29834.24, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 29834.24, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-8", "isRedFont": true, "id": "horizon-sit-17", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "le-green", "sheet": "LE GREEN", "titre": "LE GREEN", "client": "PROIMMO", "nChantier": "CH001212", "dateDemarrage": "2025-01-01", "betArchi": "V2C", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 811827.3, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 88083.26, "addDate": "2024-06-03", "type": "principal", "tvaRegime": "085"}, {"id": "marche-1", "nom": "Avenant", "montantHt": 49191.99, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": null, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-2", "nom": "TS", "montantHt": 15447.45, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0002844", "dateFacture": "2024-08-30", "pctAvancement": 0.02, "montantHt": 18480, "tva": 1570.8, "montantTtc": 20050.8, "rg": 1002.54, "avanceDeduite": 0, "prorata": 300.76, "rembAdd": 3007.62, "fournisseurs": [], "totalARecevoir": 15739.88, "dateEnvoi": "2024-08-30", "validBet": "2024-09-13", "validAmo": null, "validAutre": null, "datePaiement": "2024-10-07", "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0002895", "dateFacture": "2024-09-30", "pctAvancement": 0.04, "montantHt": 10750, "tva": 913.75, "montantTtc": 11663.75, "rg": 583.19, "avanceDeduite": 0, "prorata": 174.96, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 10905.61, "dateEnvoi": "2024-09-30", "validBet": "2024-10-18", "validAmo": null, "validAutre": null, "datePaiement": "2024-10-31", "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0002930", "dateFacture": "2024-10-25", "pctAvancement": 0.11, "montantHt": 59027.35, "tva": 5017.32, "montantTtc": 64044.67, "rg": 3202.23, "avanceDeduite": 0, "prorata": 960.67, "rembAdd": 6404.47, "fournisseurs": [], "totalARecevoir": 53477.3, "dateEnvoi": "2024-10-25", "validBet": "2024-11-05", "validAmo": null, "validAutre": null, "datePaiement": "2024-11-15", "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0002957", "dateFacture": "2024-11-25", "pctAvancement": 0.22, "montantHt": 86409.28, "tva": 8240.33, "montantTtc": 105185.36, "rg": 5259.27, "avanceDeduite": 0, "prorata": 1577.78, "rembAdd": 10234.73, "fournisseurs": [], "totalARecevoir": 88113.58, "dateEnvoi": "2024-11-25", "validBet": "2024-12-11", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 5, "nFact": "0003019", "dateFacture": "2024-12-26", "pctAvancement": 0.33, "montantHt": 95793.48, "tva": 8142.45, "montantTtc": 103935.93, "rg": 5196.8, "avanceDeduite": 0, "prorata": 1559.04, "rembAdd": 10366.03, "fournisseurs": [], "totalARecevoir": 86814.06, "dateEnvoi": "2024-12-26", "validBet": "2025-01-07", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 6, "nFact": "0003052", "dateFacture": "2025-01-28", "pctAvancement": 0.39, "montantHt": 47013.2, "tva": 3996.12, "montantTtc": 51009.32, "rg": 2550.47, "avanceDeduite": 0, "prorata": 765.14, "rembAdd": 5100.93, "fournisseurs": [{"nom": "Dyn TP", "montant": 15380.1}], "totalARecevoir": 27212.69, "dateEnvoi": "2025-01-28", "validBet": "2025-02-10", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-5", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 7, "nFact": "0003151", "dateFacture": "2025-02-25", "pctAvancement": 0.44, "montantHt": 43091.87, "tva": 3662.81, "montantTtc": 46754.68, "rg": 2337.73, "avanceDeduite": 0, "prorata": 701.32, "rembAdd": 0, "fournisseurs": [{"nom": "Dyn TP", "montant": 8027.2}], "totalARecevoir": 35688.42, "dateEnvoi": "2025-02-25", "validBet": "2025-03-13", "validAmo": null, "validAutre": null, "datePaiement": "2025-03-28", "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-6", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 8, "nFact": "0003152", "dateFacture": "2025-03-25", "pctAvancement": 0.47, "montantHt": 23084.12, "tva": 1962.15, "montantTtc": 25046.27, "rg": 1252.31, "avanceDeduite": 0, "prorata": 375.69, "rembAdd": 2504.63, "fournisseurs": [], "totalARecevoir": 20913.63, "dateEnvoi": "2025-03-25", "validBet": "2025-03-30", "validAmo": null, "validAutre": null, "datePaiement": "2025-05-21", "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-7", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 9, "nFact": "0003191", "dateFacture": "2025-05-25", "pctAvancement": 0.65, "montantHt": 146684.23, "tva": 12468.16, "montantTtc": 159152.39, "rg": 7957.62, "avanceDeduite": 0, "prorata": 2387.29, "rembAdd": 15915.24, "fournisseurs": [], "totalARecevoir": 132892.24, "dateEnvoi": "2025-05-25", "validBet": "2025-06-03", "validAmo": null, "validAutre": null, "datePaiement": "2025-07-09", "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-8", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 10, "nFact": "0003237", "dateFacture": "2025-06-23", "pctAvancement": 0.75, "montantHt": 77734.59, "tva": 6607.44, "montantTtc": 84342.03, "rg": 4217.1, "avanceDeduite": 0, "prorata": 1265.13, "rembAdd": 17274.81, "fournisseurs": [{"nom": "Dyn TP", "montant": 8307.9}], "totalARecevoir": 53277.09, "dateEnvoi": "2025-06-23", "validBet": "2025-07-07", "validAmo": null, "validAutre": null, "datePaiement": "2025-07-21", "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-9", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 11, "nFact": "0003299", "dateFacture": "2025-07-23", "pctAvancement": 0.87, "montantHt": 99373.13, "tva": 8446.72, "montantTtc": 107819.85, "rg": 5390.99, "avanceDeduite": 0, "prorata": 1617.3, "rembAdd": 17274.8, "fournisseurs": [], "totalARecevoir": 83536.76, "dateEnvoi": "2025-07-23", "validBet": "2025-08-01", "validAmo": null, "validAutre": null, "datePaiement": "2025-09-24", "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-10", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 12, "nFact": "0003324", "dateFacture": "2025-08-27", "pctAvancement": 0.91, "montantHt": 32628.4, "tva": 2773.41, "montantTtc": 35401.81, "rg": 1770.09, "avanceDeduite": 0, "prorata": 531.03, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 33100.7, "dateEnvoi": "2025-08-23", "validBet": "2025-09-16", "validAmo": null, "validAutre": null, "datePaiement": "2025-10-23", "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-11", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 13, "nFact": "0003369", "dateFacture": "2025-09-25", "pctAvancement": 0.98, "montantHt": 55521.1, "tva": 4719.29, "montantTtc": 60240.39, "rg": 3012.02, "avanceDeduite": 0, "prorata": 903.61, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 56324.77, "dateEnvoi": "2025-09-25", "validBet": "2025-10-13", "validAmo": null, "validAutre": null, "datePaiement": "2025-11-18", "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-12", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 14, "nFact": "0003509", "dateFacture": "2025-12-30", "pctAvancement": 1, "montantHt": 16236.55, "tva": 1380.11, "montantTtc": 17616.66, "rg": 880.83, "avanceDeduite": 0, "prorata": 264.25, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 16471.57, "dateEnvoi": "2025-12-30", "validBet": "2026-02-04", "validAmo": null, "validAutre": null, "datePaiement": "2025-04-09", "marcheId": "marche-0", "isRedFont": false, "id": "le-green-sit-13", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003510", "dateFacture": "2025-10-30", "pctAvancement": 1, "montantHt": 554.25, "tva": 47.11, "montantTtc": 601.36, "rg": 30.07, "avanceDeduite": 0, "prorata": 9.02, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 562.27, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "le-green-sit-14", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003505", "dateFacture": "2026-01-09", "pctAvancement": 100, "montantHt": 48940.99, "tva": 4159.98, "montantTtc": 53100.97, "rg": 2655.05, "avanceDeduite": 0, "prorata": 796.51, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 49649.41, "dateEnvoi": "2025-11-27", "validBet": "2026-02-04", "validAmo": null, "validAutre": null, "datePaiement": "2026-03-05", "marcheId": "marche-1", "isRedFont": false, "id": "le-green-sit-15", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003508", "dateFacture": "2026-01-13", "pctAvancement": 1, "montantHt": 13878, "tva": 1179.63, "montantTtc": 15057.63, "rg": 752.88, "avanceDeduite": 0, "prorata": 225.86, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 14078.88, "dateEnvoi": "2026-04-08", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-2", "isRedFont": true, "id": "le-green-sit-16", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "Dyn TP", "enveloppe": null}], "cessionPaiement": "OUI"}, {"id": "les-hauts-de-bergnolle", "sheet": "LES HAUTS DE BERGNOLLE", "titre": "LES HAUTS DE BERGNOLLE", "client": "LIGNIERES LOUIS", "nChantier": "CH001347", "dateDemarrage": "2026-01-15", "betArchi": "RONALD PASCAUD", "dureePrevue": "4 MOIS", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 424460, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003604", "dateFacture": "2026-03-30", "pctAvancement": 0.51, "montantHt": 113150.26, "tva": 9617.77, "montantTtc": 122768.03, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 122768.03, "dateEnvoi": "2026-03-31", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-04-15", "marcheId": "marche-0", "isRedFont": false, "id": "les-hauts-de-bergnolle-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003618", "dateFacture": "2026-04-26", "pctAvancement": 0.74, "montantHt": 47648.16, "tva": 4050.09, "montantTtc": 51698.25, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 51698.25, "dateEnvoi": "2026-04-27", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-06-02", "marcheId": "marche-0", "isRedFont": false, "id": "les-hauts-de-bergnolle-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003642", "dateFacture": "2026-05-31", "pctAvancement": 0.92, "montantHt": 42979.28, "tva": 3653.24, "montantTtc": 46632.52, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 46632.52, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "les-hauts-de-bergnolle-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003679", "dateFacture": "2026-06-17", "pctAvancement": 0.96, "montantHt": 9747.3, "tva": 828.52, "montantTtc": 10575.82, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 10575.82, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "les-hauts-de-bergnolle-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 5, "nFact": "0003607", "dateFacture": "2026-06-30", "pctAvancement": 1, "montantHt": 8130, "tva": 691.05, "montantTtc": 8821.05, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 8821.05, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "les-hauts-de-bergnolle-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "luigi-sci", "sheet": "LUIGI SCI", "titre": "LUIGI", "client": "NACTO", "nChantier": "CH001344", "dateDemarrage": "2025-12-15", "betArchi": "Bet Bat&co", "dureePrevue": "2 mois", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 120663, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 28904.63, "addDate": "2026-01-06", "type": "principal", "tvaRegime": "autoliq"}, {"id": "marche-1", "nom": "TS", "montantHt": 34208.8, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": null, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-2", "nom": "TS", "montantHt": 4220, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": null, "addDate": null, "type": "ts", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003259", "dateFacture": "2026-01-28", "pctAvancement": 0.4, "montantHt": 48808.51, "tva": 0, "montantTtc": 48808.51, "rg": 2440.43, "avanceDeduite": 0, "prorata": 0, "rembAdd": 11714.04, "fournisseurs": [], "totalARecevoir": 34654.04, "dateEnvoi": "2026-01-28", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-03-06", "marcheId": "marche-0", "isRedFont": false, "id": "luigi-sci-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003556", "dateFacture": "2026-02-24", "pctAvancement": 0.67, "montantHt": 32148.57, "tva": 0, "montantTtc": 32148.57, "rg": 1607.43, "avanceDeduite": 0, "prorata": 0, "rembAdd": 7715.66, "fournisseurs": [], "totalARecevoir": 22825.48, "dateEnvoi": "2026-02-24", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-04-21", "marcheId": "marche-0", "isRedFont": false, "id": "luigi-sci-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003595", "dateFacture": "2026-03-25", "pctAvancement": 0.91, "montantHt": 28927.5, "tva": 0, "montantTtc": 28927.5, "rg": 1446.38, "avanceDeduite": 0, "prorata": 0, "rembAdd": 6942.6, "fournisseurs": [], "totalARecevoir": 15586.87, "dateEnvoi": "2026-03-26", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "luigi-sci-sit-2", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003622", "dateFacture": "2026-04-27", "pctAvancement": 1, "montantHt": 10778.42, "tva": 0, "montantTtc": 10778.42, "rg": 538.92, "avanceDeduite": 0, "prorata": 0, "rembAdd": 2532.33, "fournisseurs": [], "totalARecevoir": 7707.17, "dateEnvoi": "2026-04-27", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "luigi-sci-sit-3", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003608", "dateFacture": "2026-03-25", "pctAvancement": 0.75, "montantHt": 25601.05, "tva": 2176.09, "montantTtc": 27777.14, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 27777.14, "dateEnvoi": "2026-03-26", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-04-20", "marcheId": "marche-1", "isRedFont": false, "id": "luigi-sci-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003623", "dateFacture": "2026-04-27", "pctAvancement": 1, "montantHt": 8607.75, "tva": 731.66, "montantTtc": 9339.41, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 9339.41, "dateEnvoi": "2026-04-28", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-06-03", "marcheId": "marche-1", "isRedFont": false, "id": "luigi-sci-sit-5", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003652", "dateFacture": "2026-05-19", "pctAvancement": 1, "montantHt": 4220, "tva": 358.7, "montantTtc": 4578.7, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 4578.7, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-05-15", "marcheId": "marche-2", "isRedFont": false, "id": "luigi-sci-sit-6", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "malajo", "sheet": "MALAJO", "titre": "SCI MALAJO", "client": "GHP", "nChantier": "CH001370", "dateDemarrage": null, "betArchi": "V2C", "dureePrevue": "8 mois", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 278063.6, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 60339.8, "addDate": "2026-03-30", "type": "principal", "tvaRegime": "085"}, {"id": "prorata", "nom": "PRORATA", "montantHt": null, "tauxTva": null, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": null, "addDate": null, "type": "prorata", "tvaRegime": "autoliq"}], "situations": [{"nSituation": 1, "nFact": "0003626", "dateFacture": "2026-04-27", "pctAvancement": 0.02, "montantHt": 6822.68, "tva": 579.93, "montantTtc": 7402.61, "rg": 370.13, "avanceDeduite": 0, "prorata": 0, "rembAdd": 2220.78, "fournisseurs": [], "totalARecevoir": 4811.7, "dateEnvoi": "2026-04-27", "validBet": "2026-05-05", "validAmo": null, "validAutre": null, "datePaiement": "2026-05-12", "marcheId": "marche-0", "isRedFont": false, "id": "malajo-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003656", "dateFacture": "2026-05-25", "pctAvancement": 0.17, "montantHt": 39579.32, "tva": 3364.24, "montantTtc": 42943.56, "rg": 2147.18, "avanceDeduite": 0, "prorata": 0, "rembAdd": 12883.07, "fournisseurs": [], "totalARecevoir": 27913.32, "dateEnvoi": "2026-05-26", "validBet": "2026-06-02", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "malajo-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003677", "dateFacture": "2026-06-24", "pctAvancement": 0.29, "montantHt": 34971.75, "tva": 2972.6, "montantTtc": 37944.35, "rg": 1897.22, "avanceDeduite": 0, "prorata": 0, "rembAdd": 11383.31, "fournisseurs": [], "totalARecevoir": 24663.82, "dateEnvoi": "2026-06-25", "validBet": "2026-07-01", "validAmo": null, "validAutre": null, "datePaiement": "2026-07-02", "marcheId": "marche-0", "isRedFont": false, "id": "malajo-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"id": "malajo-sit-prorata-0", "nSituation": null, "nFact": "0003665", "dateFacture": "2026-05-26", "pctAvancement": null, "montantHt": 1963.85, "tva": 0, "montantTtc": 1963.85, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 1963.85, "dateEnvoi": null, "validBet": "2026-06-09", "validAmo": null, "validAutre": null, "datePaiement": null, "paye": false, "note": "Bloc PRORATA (format libre dans le fichier source)", "marcheId": "prorata", "montantRegle": null, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "les-villas-de-convenance", "sheet": "LES VILLAS DE CONVENANCE", "titre": "LES VILLAS DE CONVENANCE", "client": "SAS LES VILLAS DE CONVENANCE", "nChantier": "CH001314", "dateDemarrage": "2025-01-01", "betArchi": "V2C", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 260000, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 40000, "addDate": "2025-09-10", "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003327", "dateFacture": "2025-08-27", "pctAvancement": 0.11, "montantHt": 28402.79, "tva": 2414.24, "montantTtc": 30817.03, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 30817.03, "dateEnvoi": "2025-08-27", "validBet": "2025-08-30", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "les-villas-de-convenance-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003357", "dateFacture": "2025-09-24", "pctAvancement": 0.27, "montantHt": 42345.57, "tva": 3599.37, "montantTtc": 45944.94, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 45944.94, "dateEnvoi": "2025-09-25", "validBet": "2025-09-30", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "les-villas-de-convenance-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003395", "dateFacture": "2025-10-25", "pctAvancement": 0.39, "montantHt": 22080.9, "tva": 1876.88, "montantTtc": 23957.78, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 23957.78, "dateEnvoi": "2025-10-29", "validBet": "2025-11-10", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "les-villas-de-convenance-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003443", "dateFacture": "2025-11-21", "pctAvancement": 0.48, "montantHt": 21324.18, "tva": 1812.56, "montantTtc": 23136.74, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 23136.74, "dateEnvoi": "2025-11-21", "validBet": "2025-12-05", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "les-villas-de-convenance-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 5, "nFact": "0003559", "dateFacture": "2026-02-24", "pctAvancement": 0.67, "montantHt": 60794.53, "tva": 5167.54, "montantTtc": 65962.07, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [{"nom": "Transbéton", "montant": 21456.14}], "totalARecevoir": 44505.93, "dateEnvoi": "2026-03-02", "validBet": "2026-03-15", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "les-villas-de-convenance-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 6, "nFact": "0003591", "dateFacture": "2026-03-25", "pctAvancement": 0.83, "montantHt": 42014.39, "tva": 3571.22, "montantTtc": 45585.61, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [{"nom": "Transbéton", "montant": 19216.86}], "totalARecevoir": 26368.75, "dateEnvoi": "2026-03-27", "validBet": "2026-04-13", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "les-villas-de-convenance-sit-5", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 7, "nFact": "0003658", "dateFacture": "2026-05-25", "pctAvancement": 0.87, "montantHt": 9228.84, "tva": 784.45, "montantTtc": 10013.29, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 10013.29, "dateEnvoi": "2025-05-26", "validBet": "2026-06-26", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "les-villas-de-convenance-sit-6", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 8, "nFact": "0003730", "dateFacture": "2026-07-27", "pctAvancement": 0.97, "montantHt": 25372.74, "tva": 2156.68, "montantTtc": 27529.42, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 25066.54, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "les-villas-de-convenance-sit-7", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "Transbéton", "enveloppe": null}], "cessionPaiement": "OUI"}, {"id": "martinique-courrier", "sheet": "MARTINIQUE COURRIER", "titre": "MARTINIQUE COURRIER", "client": "MARTINIQUE COURRIER", "nChantier": "CH001296", "dateDemarrage": "2025-11-17", "betArchi": "ITEC / DEROIRE", "dureePrevue": "1 AN", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 250067.1, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 81396.84, "addDate": "2025-12-24", "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003496", "dateFacture": "2025-12-23", "pctAvancement": 0.19, "montantHt": 46884.88, "tva": 3985.21, "montantTtc": 50870.09, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 50870.09, "dateEnvoi": "2026-01-05", "validBet": "2026-01-09", "validAmo": null, "validAutre": null, "datePaiement": "2026-03-18", "marcheId": "marche-0", "isRedFont": false, "id": "martinique-courrier-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003558", "dateFacture": "2026-02-24", "pctAvancement": 0.26, "montantHt": 18849.32, "tva": 1602.19, "montantTtc": 20451.51, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 14316.06, "dateEnvoi": "2026-02-24", "validBet": "2026-03-04", "validAmo": null, "validAutre": null, "datePaiement": "2026-04-07", "marcheId": "marche-0", "isRedFont": false, "id": "martinique-courrier-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003582", "dateFacture": "2026-03-24", "pctAvancement": 0.35, "montantHt": 21485.75, "tva": 1826.29, "montantTtc": 23312.04, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [{"nom": "Transbéton", "montant": 6641.18}], "totalARecevoir": 9677.25, "dateEnvoi": "2026-03-27", "validBet": "2026-04-07", "validAmo": null, "validAutre": null, "datePaiement": "2026-04-15", "marcheId": "marche-0", "isRedFont": false, "id": "martinique-courrier-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003625", "dateFacture": "2026-04-27", "pctAvancement": 0.44, "montantHt": 22300.55, "tva": 1895.55, "montantTtc": 24196.1, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 16937.27, "dateEnvoi": "2026-04-27", "validBet": "2026-05-19", "validAmo": null, "validAutre": null, "datePaiement": "2026-06-06", "marcheId": "marche-0", "isRedFont": false, "id": "martinique-courrier-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 5, "nFact": "0003654", "dateFacture": "2026-05-25", "pctAvancement": 0.5, "montantHt": 13878.3, "tva": 1179.66, "montantTtc": 15057.96, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 10540.57, "dateEnvoi": "2026-05-26", "validBet": "2026-06-18", "validAmo": null, "validAutre": null, "datePaiement": "2026-06-23", "marcheId": "marche-0", "isRedFont": false, "id": "martinique-courrier-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 6, "nFact": "0003685", "dateFacture": "2026-06-25", "pctAvancement": 0.86, "montantHt": 91537.4, "tva": 7780.68, "montantTtc": 99318.08, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [{"nom": "Transbéton", "montant": 32950.95}], "totalARecevoir": 36571.71, "dateEnvoi": "2026-06-26", "validBet": "2026-07-15", "validAmo": null, "validAutre": null, "datePaiement": "2026-07-21", "marcheId": "marche-0", "isRedFont": false, "id": "martinique-courrier-sit-5", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 7, "nFact": "0003718", "dateFacture": "2026-07-27", "pctAvancement": 0.94, "montantHt": 21263.64, "tva": 1807.41, "montantTtc": 23071.05, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [{"nom": "Transbéton", "montant": 2112.68}], "totalARecevoir": 2958.37, "dateEnvoi": "2026-07-31", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "martinique-courrier-sit-6", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003719", "dateFacture": "2026-07-27", "pctAvancement": 100, "montantHt": 8932, "tva": 759.22, "montantTtc": 9691.22, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [{"nom": "Transbéton", "montant": 7793.84}], "totalARecevoir": 1897.38, "dateEnvoi": "2026-07-31", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "martinique-courrier-sit-7", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "Transbéton", "enveloppe": null}], "cessionPaiement": "OUI"}, {"id": "petit-canal", "sheet": "PETIT-CANAL", "titre": "PARC PAYSAGER PETIT CANAL", "client": "COMMUNE PETIT CANAL", "nChantier": null, "dateDemarrage": "2026-08-24", "betArchi": "CCET", "dureePrevue": "15 mois", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 800491.75, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 86853.35, "addDate": null, "type": "principal", "tvaRegime": "085"}], "situations": [], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "nolivier", "sheet": "NOLIVIER", "titre": "NOLIVIER", "client": "VERNHET RENE", "nChantier": "CH001356", "dateDemarrage": "2026-02-09", "betArchi": "V2C", "dureePrevue": "9 MOIS", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 178500, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003565", "dateFacture": "2026-02-27", "pctAvancement": 0.14, "montantHt": 25784.45, "tva": 2191.68, "montantTtc": 27976.13, "rg": 1398.81, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 26577.32, "dateEnvoi": "2026-02-27", "validBet": "2026-03-05", "validAmo": null, "validAutre": null, "datePaiement": "2026-05-18", "marcheId": "marche-0", "isRedFont": false, "id": "nolivier-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003590", "dateFacture": "2026-03-25", "pctAvancement": 0.27, "montantHt": 22817.75, "tva": 1939.51, "montantTtc": 24757.26, "rg": 1237.86, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 23519.4, "dateEnvoi": "2026-03-25", "validBet": "2027-04-09", "validAmo": null, "validAutre": null, "datePaiement": "2026-06-04", "marcheId": "marche-0", "isRedFont": false, "id": "nolivier-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003614", "dateFacture": "2026-04-24", "pctAvancement": 0.35, "montantHt": 14449.3, "tva": 1228.19, "montantTtc": 15677.49, "rg": 783.87, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 14893.62, "dateEnvoi": "2026-04-24", "validBet": "2026-05-05", "validAmo": null, "validAutre": null, "datePaiement": "2026-07-31", "marcheId": "marche-0", "isRedFont": false, "id": "nolivier-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "port-coton", "sheet": "PORT COTON", "titre": "PORT COTON", "client": "PORT COTON", "nChantier": "CH001237", "dateDemarrage": "2025-01-01", "betArchi": "BEASSE", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 108198, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 35218.45, "addDate": "2025-04-11", "type": "principal", "tvaRegime": "085"}, {"id": "marche-1", "nom": "TS / RESEAUX EP 0003393", "montantHt": 73519, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 23930.43, "addDate": "2025-04-16", "type": "ts", "tvaRegime": "085"}, {"id": "marche-2", "nom": "TS / MURET POUR JARDINIERE", "montantHt": 17571, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 5719.36, "addDate": "2025-04-11", "type": "ts", "tvaRegime": "085"}, {"id": "marche-3", "nom": "TS / BAC A GRAISSE 00003359", "montantHt": 21100, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003376", "dateFacture": "2025-09-25", "pctAvancement": 0.19, "montantHt": 20848.3, "tva": 1772.11, "montantTtc": 22620.41, "rg": 1131.02, "avanceDeduite": 0, "prorata": 339.31, "rembAdd": 6786.12, "fournisseurs": [], "totalARecevoir": 14363.96, "dateEnvoi": "2025-09-26", "validBet": "2025-10-02", "validAmo": null, "validAutre": null, "datePaiement": "2025-10-17", "marcheId": "marche-0", "isRedFont": false, "id": "port-coton-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003404", "dateFacture": "2025-10-24", "pctAvancement": 0.6, "montantHt": 44400.65, "tva": 3774.06, "montantTtc": 48174.71, "rg": 2408.74, "avanceDeduite": 0, "prorata": 722.62, "rembAdd": 14452.41, "fournisseurs": [], "totalARecevoir": 30590.94, "dateEnvoi": "2025-10-24", "validBet": "2025-11-07", "validAmo": null, "validAutre": null, "datePaiement": "2025-12-02", "marcheId": "marche-0", "isRedFont": false, "id": "port-coton-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003445", "dateFacture": "2025-11-26", "pctAvancement": 0.98, "montantHt": 40714.49, "tva": 3460.73, "montantTtc": 44175.22, "rg": 2208.76, "avanceDeduite": 0, "prorata": 662.63, "rembAdd": 13979.92, "fournisseurs": [], "totalARecevoir": 27323.91, "dateEnvoi": "2025-11-26", "validBet": "2025-12-12", "validAmo": null, "validAutre": null, "datePaiement": "2026-01-28", "marcheId": "marche-0", "isRedFont": false, "id": "port-coton-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003481", "dateFacture": "2025-12-10", "pctAvancement": 1, "montantHt": 2234.56, "tva": 189.94, "montantTtc": 2424.5, "rg": 121.22, "avanceDeduite": 0, "prorata": 36.37, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 2266.91, "dateEnvoi": "2025-01-26", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "port-coton-sit-3", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003320", "dateFacture": "2025-05-31", "pctAvancement": 0.47, "montantHt": 34714.95, "tva": 2950.77, "montantTtc": 37665.72, "rg": 1883.29, "avanceDeduite": 0, "prorata": 564.99, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 35217.44, "dateEnvoi": "2025-05-31", "validBet": "2025-07-15", "validAmo": null, "validAutre": null, "datePaiement": "2025-07-23", "marcheId": "marche-1", "isRedFont": false, "id": "port-coton-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003297", "dateFacture": "2025-08-29", "pctAvancement": 0.91, "montantHt": 32520.95, "tva": 2764.28, "montantTtc": 35285.23, "rg": 1764.26, "avanceDeduite": 0, "prorata": 529.28, "rembAdd": 10585.57, "fournisseurs": [], "totalARecevoir": 22406.12, "dateEnvoi": "2025-08-29", "validBet": "2025-08-29", "validAmo": null, "validAutre": null, "datePaiement": "2025-09-10", "marcheId": "marche-1", "isRedFont": false, "id": "port-coton-sit-5", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003377", "dateFacture": "2025-09-25", "pctAvancement": 0.98, "montantHt": 5109.72, "tva": 434.33, "montantTtc": 5544.05, "rg": 277.2, "avanceDeduite": 0, "prorata": 83.16, "rembAdd": 1663.22, "fournisseurs": [], "totalARecevoir": 3520.46, "dateEnvoi": "2025-09-26", "validBet": "2025-10-02", "validAmo": null, "validAutre": null, "datePaiement": "2025-10-15", "marcheId": "marche-1", "isRedFont": false, "id": "port-coton-sit-6", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003502", "dateFacture": "2025-12-30", "pctAvancement": 1, "montantHt": 1173.38, "tva": 99.74, "montantTtc": 1273.12, "rg": 63.66, "avanceDeduite": 0, "prorata": 19.1, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 1190.36, "dateEnvoi": "2025-01-26", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-1", "isRedFont": true, "id": "port-coton-sit-7", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003203", "dateFacture": "2025-05-26", "pctAvancement": 0.47, "montantHt": 8421, "tva": 715.79, "montantTtc": 9136.78, "rg": 456.84, "avanceDeduite": 0, "prorata": 137.05, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 8542.89, "dateEnvoi": "2025-07-15", "validBet": "2025-08-25", "validAmo": null, "validAutre": null, "datePaiement": "2025-07-25", "marcheId": "marche-2", "isRedFont": false, "id": "port-coton-sit-8", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003298", "dateFacture": "2025-07-22", "pctAvancement": 0.95, "montantHt": 8235, "tva": 699.98, "montantTtc": 8934.98, "rg": 446.75, "avanceDeduite": 0, "prorata": 134.02, "rembAdd": 4467.49, "fournisseurs": [], "totalARecevoir": 3886.71, "dateEnvoi": "2025-08-25", "validBet": "2025-08-25", "validAmo": null, "validAutre": null, "datePaiement": "2025-09-02", "marcheId": "marche-2", "isRedFont": false, "id": "port-coton-sit-9", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003504", "dateFacture": "2025-12-30", "pctAvancement": 1, "montantHt": 915, "tva": 77.78, "montantTtc": 992.77, "rg": 49.64, "avanceDeduite": 0, "prorata": 14.89, "rembAdd": 900, "fournisseurs": [], "totalARecevoir": 28.24, "dateEnvoi": "2025-01-26", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-2", "isRedFont": true, "id": "port-coton-sit-10", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003339", "dateFacture": "2025-08-30", "pctAvancement": 0.95, "montantHt": 20054.95, "tva": 1704.67, "montantTtc": 21759.62, "rg": 1087.98, "avanceDeduite": 0, "prorata": 326.39, "rembAdd": 11681.65, "fournisseurs": [], "totalARecevoir": 8663.6, "dateEnvoi": "2025-10-24", "validBet": "2025-11-07", "validAmo": null, "validAutre": null, "datePaiement": "2025-11-07", "marcheId": "marche-3", "isRedFont": false, "id": "port-coton-sit-11", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003503", "dateFacture": "2025-12-30", "pctAvancement": 1, "montantHt": 1055.05, "tva": 89.68, "montantTtc": 1144.73, "rg": 57.24, "avanceDeduite": 0, "prorata": 17.17, "rembAdd": 351.87, "fournisseurs": [], "totalARecevoir": 718.45, "dateEnvoi": "2025-01-26", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-3", "isRedFont": true, "id": "port-coton-sit-12", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "quai-12", "sheet": "QUAI 12", "titre": "QUAI 12", "client": "EIFFAGE MARITIME", "nChantier": "CH001369", "dateDemarrage": "2026-03-18", "betArchi": "-", "dureePrevue": "12 MOIS", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 131316, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 17508.8, "addDate": "2026-05-27", "type": "principal", "tvaRegime": "autoliq"}], "situations": [{"nSituation": 1, "nFact": "0003601", "dateFacture": "2026-03-26", "pctAvancement": 0.04, "montantHt": 5332, "tva": 0, "montantTtc": 5332, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 5332, "dateEnvoi": "2026-03-26", "validBet": "2026-03-27", "validAmo": null, "validAutre": null, "datePaiement": "2026-05-27", "marcheId": "marche-0", "isRedFont": false, "id": "quai-12-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003631", "dateFacture": "2026-04-28", "pctAvancement": 0.07, "montantHt": 3809.28, "tva": 0, "montantTtc": 3809.28, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 3809.28, "dateEnvoi": "2026-04-28", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-07-14", "marcheId": "marche-0", "isRedFont": false, "id": "quai-12-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "ti-perou", "sheet": "TI PEROU", "titre": "TI PEROU", "client": null, "nChantier": "CH001292", "dateDemarrage": "2025-06-02", "betArchi": "BEASSE/ETRA", "dureePrevue": "8 mois", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 143972.45, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 23431.53, "addDate": "2025-06-25", "type": "principal", "tvaRegime": "085"}, {"id": "marche-1", "nom": "TS", "montantHt": 14760, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "prorata", "nom": "PRORATA", "montantHt": null, "tauxTva": null, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": null, "addDate": null, "type": "prorata", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003240", "dateFacture": "2025-06-27", "pctAvancement": 0.28, "montantHt": 39656.49, "tva": 3370.8, "montantTtc": 43027.29, "rg": 2151.36, "avanceDeduite": 0, "prorata": 645.41, "rembAdd": 6454.09, "fournisseurs": [], "totalARecevoir": 33776.43, "dateEnvoi": "2025-06-30", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-07-14", "marcheId": "marche-0", "isRedFont": false, "id": "ti-perou-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003283", "dateFacture": "2025-07-21", "pctAvancement": 0.45, "montantHt": 25837.82, "tva": 2196.21, "montantTtc": 28034.03, "rg": 1401.7, "avanceDeduite": 0, "prorata": 420.51, "rembAdd": 4205.1, "fournisseurs": [], "totalARecevoir": 22006.72, "dateEnvoi": "2025-07-25", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-09-10", "marcheId": "marche-0", "isRedFont": false, "id": "ti-perou-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003447", "dateFacture": "2025-07-21", "pctAvancement": 0.6, "montantHt": 21382.77, "tva": 1817.54, "montantTtc": 23200.31, "rg": 1160.02, "avanceDeduite": 0, "prorata": 348.0, "rembAdd": 3480.05, "fournisseurs": [], "totalARecevoir": 18212.24, "dateEnvoi": "2025-11-26", "validBet": "2025-12-03", "validAmo": null, "validAutre": null, "datePaiement": "2025-12-18", "marcheId": "marche-0", "isRedFont": false, "id": "ti-perou-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003477", "dateFacture": "2025-12-12", "pctAvancement": 0.9, "montantHt": 42179.02, "tva": 3585.22, "montantTtc": 45764.24, "rg": 2288.21, "avanceDeduite": 0, "prorata": 686.46, "rembAdd": 6864.64, "fournisseurs": [{"nom": "Transbéton", "montant": 21287.59}], "totalARecevoir": 14637.34, "dateEnvoi": "2025-12-22", "validBet": "2026-01-15", "validAmo": null, "validAutre": null, "datePaiement": "2026-03-23", "marcheId": "marche-0", "isRedFont": false, "id": "ti-perou-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 5, "nFact": "0003522", "dateFacture": "2026-01-28", "pctAvancement": 0.96, "montantHt": 9558.92, "tva": 812.51, "montantTtc": 10371.43, "rg": 518.57, "avanceDeduite": 0, "prorata": 155.57, "rembAdd": 1555.71, "fournisseurs": [], "totalARecevoir": 8141.57, "dateEnvoi": "2026-01-28", "validBet": "2026-02-10", "validAmo": null, "validAutre": null, "datePaiement": "2026-04-15", "marcheId": "marche-0", "isRedFont": false, "id": "ti-perou-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 6, "nFact": "0003554", "dateFacture": "2026-02-24", "pctAvancement": 0.99, "montantHt": 4334.98, "tva": 368.47, "montantTtc": 4703.45, "rg": 235.17, "avanceDeduite": 0, "prorata": 70.55, "rembAdd": 871.94, "fournisseurs": [], "totalARecevoir": 3525.79, "dateEnvoi": "2026-02-24", "validBet": "2026-02-27", "validAmo": null, "validAutre": null, "datePaiement": "2026-04-15", "marcheId": "marche-0", "isRedFont": false, "id": "ti-perou-sit-5", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 7, "nFact": "0003580", "dateFacture": "2026-03-24", "pctAvancement": 1, "montantHt": 1022.5, "tva": 86.91, "montantTtc": 1109.41, "rg": 55.47, "avanceDeduite": 0, "prorata": 16.64, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 1037.3, "dateEnvoi": "2026-04-22", "validBet": "2026-04-28", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "ti-perou-sit-6", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003479", "dateFacture": "2025-12-10", "pctAvancement": 0.98, "montantHt": 14464.8, "tva": 1229.51, "montantTtc": 15694.31, "rg": 784.72, "avanceDeduite": 0, "prorata": 235.41, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 14674.18, "dateEnvoi": "2025-12-22", "validBet": "2026-01-15", "validAmo": null, "validAutre": null, "datePaiement": "2026-02-23", "marcheId": "marche-1", "isRedFont": false, "id": "ti-perou-sit-7", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003523", "dateFacture": "2026-01-28", "pctAvancement": 1, "montantHt": 295.2, "tva": 25.09, "montantTtc": 320.29, "rg": 16.01, "avanceDeduite": 0, "prorata": 4.8, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 299.48, "dateEnvoi": "2026-01-28", "validBet": "2026-02-10", "validAmo": null, "validAutre": null, "datePaiement": "2026-04-15", "marcheId": "marche-1", "isRedFont": false, "id": "ti-perou-sit-8", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": "PRORATA", "nFact": "0003612", "dateFacture": "2026-04-24", "pctAvancement": 1, "montantHt": 1450, "tva": 123.25, "montantTtc": 1573.25, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 1573.25, "dateEnvoi": "2026-04-24", "validBet": "2026-06-11", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "prorata", "isRedFont": false, "id": "ti-perou-sit-9", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "Transbéton", "enveloppe": null}], "cessionPaiement": "OUI"}, {"id": "sagip", "sheet": "SAGIP", "titre": "SAGIP", "client": "SAGIP GUADELOUPE", "nChantier": "CH001305", "dateDemarrage": "2025-06-02", "betArchi": "BEASSE/ETRA", "dureePrevue": "8 mois", "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 143972.45, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 23431.53, "addDate": "2025-06-25", "type": "principal", "tvaRegime": "085"}, {"id": "marche-1", "nom": "TS", "montantHt": 19710, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003241", "dateFacture": "2025-06-23", "pctAvancement": 0.28, "montantHt": 39656.49, "tva": 3370.8, "montantTtc": 43027.29, "rg": 2151.36, "avanceDeduite": 0, "prorata": 645.41, "rembAdd": 6454.09, "fournisseurs": [], "totalARecevoir": 33776.42, "dateEnvoi": "2025-06-25", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-07-14", "marcheId": "marche-0", "isRedFont": false, "id": "sagip-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003284", "dateFacture": "2025-07-21", "pctAvancement": 0.45, "montantHt": 25837.82, "tva": 2196.21, "montantTtc": 28034.03, "rg": 1401.7, "avanceDeduite": 0, "prorata": 420.51, "rembAdd": 4205.11, "fournisseurs": [], "totalARecevoir": 22006.72, "dateEnvoi": "2025-07-25", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-09-10", "marcheId": "marche-0", "isRedFont": false, "id": "sagip-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003448", "dateFacture": "2025-11-21", "pctAvancement": 0.6, "montantHt": 21074.02, "tva": 1791.29, "montantTtc": 22865.31, "rg": 1143.27, "avanceDeduite": 0, "prorata": 342.98, "rembAdd": 3429.8, "fournisseurs": [], "totalARecevoir": 17949.27, "dateEnvoi": "2025-11-26", "validBet": "2025-12-03", "validAmo": null, "validAutre": null, "datePaiement": "2025-12-18", "marcheId": "marche-0", "isRedFont": false, "id": "sagip-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003478", "dateFacture": "2025-12-12", "pctAvancement": 0.9, "montantHt": 42487.77, "tva": 3611.46, "montantTtc": 46099.23, "rg": 2304.96, "avanceDeduite": 0, "prorata": 691.49, "rembAdd": 6914.88, "fournisseurs": [{"nom": "Transbéton", "montant": 35438.36}], "totalARecevoir": 749.54, "dateEnvoi": "2025-12-22", "validBet": "2026-01-15", "validAmo": null, "validAutre": null, "datePaiement": "2026-03-04", "marcheId": "marche-0", "isRedFont": false, "id": "sagip-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 5, "nFact": "0003524", "dateFacture": "2026-01-28", "pctAvancement": 0.96, "montantHt": 9558.92, "tva": 812.51, "montantTtc": 10371.43, "rg": 518.57, "avanceDeduite": 0, "prorata": 155.57, "rembAdd": 1555.71, "fournisseurs": [], "totalARecevoir": 8141.57, "dateEnvoi": "2026-01-28", "validBet": "2026-02-10", "validAmo": null, "validAutre": null, "datePaiement": "2026-04-15", "marcheId": "marche-0", "isRedFont": false, "id": "sagip-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 6, "nFact": "0003555", "dateFacture": "2026-02-24", "pctAvancement": 0.99, "montantHt": 4334.98, "tva": 368.47, "montantTtc": 4703.45, "rg": 235.17, "avanceDeduite": 0, "prorata": 70.55, "rembAdd": 871.94, "fournisseurs": [], "totalARecevoir": 3525.79, "dateEnvoi": "2026-02-24", "validBet": "2026-02-27", "validAmo": null, "validAutre": null, "datePaiement": "2026-04-15", "marcheId": "marche-0", "isRedFont": false, "id": "sagip-sit-5", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 7, "nFact": "0003581", "dateFacture": "2026-03-24", "pctAvancement": 1, "montantHt": 1022.5, "tva": 86.91, "montantTtc": 1109.41, "rg": 55.47, "avanceDeduite": 0, "prorata": 16.64, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 1037.3, "dateEnvoi": "2026-04-22", "validBet": "2026-04-28", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "sagip-sit-6", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003480", "dateFacture": "2025-12-12", "pctAvancement": 0.98, "montantHt": 19315.8, "tva": 1641.84, "montantTtc": 20957.64, "rg": 1047.88, "avanceDeduite": 0, "prorata": 314.36, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 19595.4, "dateEnvoi": "2025-12-22", "validBet": "2026-01-15", "validAmo": null, "validAutre": null, "datePaiement": "2026-03-04", "marcheId": "marche-1", "isRedFont": false, "id": "sagip-sit-7", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003531", "dateFacture": "2025-12-12", "pctAvancement": 1, "montantHt": 394.2, "tva": 33.51, "montantTtc": 427.71, "rg": 21.39, "avanceDeduite": 0, "prorata": 6.42, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 399.9, "dateEnvoi": "2026-01-28", "validBet": "2026-02-10", "validAmo": null, "validAutre": null, "datePaiement": "2026-04-15", "marcheId": "marche-1", "isRedFont": false, "id": "sagip-sit-8", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "Transbéton", "enveloppe": null}], "cessionPaiement": "OUI"}, {"id": "serco", "sheet": "SERCO", "titre": "SERCO", "client": "SERCO", "nChantier": "CH001343", "dateDemarrage": "2026-01-12", "betArchi": "-", "dureePrevue": "1 MOIS", "marches": [{"id": "marche-0", "nom": "MARCHE VRD", "montantHt": 18295.96, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 5955.33, "addDate": "2025-12-24", "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003585", "dateFacture": "2026-03-25", "pctAvancement": 0.79, "montantHt": 14445.96, "tva": 1227.91, "montantTtc": 15673.87, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 5955.33, "fournisseurs": [], "totalARecevoir": 9718.54, "dateEnvoi": "2026-03-27", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-04-14", "marcheId": "marche-0", "isRedFont": false, "id": "serco-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003708", "dateFacture": "2026-06-30", "pctAvancement": 1, "montantHt": 3850, "tva": 327.25, "montantTtc": 4177.25, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 4177.25, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "serco-sit-1", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "serco-serco-marche-vrd", "sheet": "SERCO (SERCO (Marche Vrd))", "titre": "SERCO (Marche Vrd)", "client": "SERCO", "nChantier": "CH001380", "dateDemarrage": "2026-01-12", "betArchi": "-", "dureePrevue": "1 MOIS", "marches": [{"id": "marche-0", "nom": "MARCHE VRD", "montantHt": 25970, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 8453.24, "addDate": "2026-05-06", "type": "principal", "tvaRegime": "085"}, {"id": "marche-1", "nom": "MARCHE GO", "montantHt": 4499, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 1483.45, "addDate": "2026-05-06", "type": "ts", "tvaRegime": "085"}, {"id": "marche-2", "nom": "MARCHE DEMOLITION", "montantHt": 12000, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-3", "nom": "MARCHE TS", "montantHt": 6937.5, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-4", "nom": "MARCHE TS", "montantHt": 225, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003698", "dateFacture": "2026-06-30", "pctAvancement": 1, "montantHt": 28563.5, "tva": 2427.9, "montantTtc": 30991.4, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 8453.24, "fournisseurs": [], "totalARecevoir": 22538.16, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": false, "id": "serco-serco-marche-vrd-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003697", "dateFacture": "2026-06-30", "pctAvancement": 1, "montantHt": 4499, "tva": 382.42, "montantTtc": 4881.41, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 1483.45, "fournisseurs": [], "totalARecevoir": 3397.97, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-1", "isRedFont": false, "id": "serco-serco-marche-vrd-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003689", "dateFacture": "2026-06-25", "pctAvancement": 1, "montantHt": 10000, "tva": 850.0, "montantTtc": 10850, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 10850, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-2", "isRedFont": false, "id": "serco-serco-marche-vrd-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "00003710", "dateFacture": "2026-07-06", "pctAvancement": 1, "montantHt": 6937.5, "tva": 589.69, "montantTtc": 7527.19, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 7527.19, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-3", "isRedFont": false, "id": "serco-serco-marche-vrd-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "00003711", "dateFacture": "2026-07-06", "pctAvancement": 1, "montantHt": 225, "tva": 19.12, "montantTtc": 244.12, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 244.12, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-4", "isRedFont": false, "id": "serco-serco-marche-vrd-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "sgdm", "sheet": "SGDM", "titre": "SGDM", "client": "SGDM", "nChantier": "CH001188", "dateDemarrage": "2025-09-01", "betArchi": "MPH ARCHI", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "Marché principal", "montantHt": null, "tauxTva": null, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": null, "addDate": null, "type": "principal", "tvaRegime": "085"}], "situations": [], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "sgtc", "sheet": "SGTC", "titre": "SGTC", "client": "SGTC", "nChantier": "CH001340", "dateDemarrage": "2026-11-01", "betArchi": "Cession de paiement:", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 35295, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": null, "addDate": null, "type": "principal", "tvaRegime": "autoliq"}, {"id": "marche-1", "nom": "REPRISE DOTHEMARE", "montantHt": null, "tauxTva": null, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": null, "addDate": null, "type": "ts", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003288", "dateFacture": "2025-08-30", "pctAvancement": 1, "montantHt": 35295, "tva": 0, "montantTtc": 35295, "rg": 1764.75, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 29408.25, "dateEnvoi": "2025-11-25", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "sgtc-sit-0", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003605", "dateFacture": "2026-03-30", "pctAvancement": 1, "montantHt": 3960, "tva": 336.6, "montantTtc": 4296.6, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 4296.6, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-1", "isRedFont": true, "id": "sgtc-sit-1", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003607", "dateFacture": "2026-04-01", "pctAvancement": 1, "montantHt": 1130, "tva": 96.05, "montantTtc": 1226.05, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 1226.05, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-04-17", "marcheId": "marche-1", "isRedFont": false, "id": "sgtc-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "socrema-bca", "sheet": "SOCREMA BCA", "titre": "SOCREMA", "client": "BCA", "nChantier": "CH001378", "dateDemarrage": "2026-04-22", "betArchi": "-", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 56877, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "autoliq"}], "situations": [{"nSituation": 1, "nFact": "0003635", "dateFacture": "2026-04-30", "pctAvancement": 0.29, "montantHt": 16500, "tva": 0, "montantTtc": 16500, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 16500, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-05-28", "marcheId": "marche-0", "isRedFont": false, "id": "socrema-bca-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003653", "dateFacture": "2026-05-19", "pctAvancement": 1, "montantHt": 40377, "tva": 0, "montantTtc": 40377, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 40377, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2026-07-07", "marcheId": "marche-0", "isRedFont": false, "id": "socrema-bca-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "socrema-cat", "sheet": "SOCREMA CAT", "titre": "SOCREMA", "client": "SOCREMA", "nChantier": "CH001402", "dateDemarrage": null, "betArchi": "STUM BET", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 210640.5, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 71674.61, "addDate": "2026-07-07", "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003721", "dateFacture": "2026-07-29", "pctAvancement": 0.58, "montantHt": 122001.18, "tva": 10370.1, "montantTtc": 132371.28, "rg": 6618.56, "avanceDeduite": 0, "prorata": 0, "rembAdd": 39711.38, "fournisseurs": [{"nom": "LBC", "montant": 18996.38}], "totalARecevoir": 67044.95, "dateEnvoi": "2026-07-28", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "socrema-cat-sit-0", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "LBC", "enveloppe": null}], "cessionPaiement": "OUI"}, {"id": "sofijar", "sheet": "SOFIJAR", "titre": "SOFIJAR", "client": "SOFIJAR", "nChantier": "CH001284", "dateDemarrage": "2025-03-01", "betArchi": "SIRENGI", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE VRD", "montantHt": 540548.1, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 58649.47, "addDate": "2024-04-11", "type": "principal", "tvaRegime": "085"}, {"id": "marche-1", "nom": "MARCHE VRD", "montantHt": 540548.1, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003133", "dateFacture": "2025-03-30", "pctAvancement": 0.06, "montantHt": 31515, "tva": 2657.34, "montantTtc": 33920.22, "rg": 1696.01, "avanceDeduite": 0, "prorata": 252.12, "rembAdd": 3419.38, "fournisseurs": [], "totalARecevoir": 28804.83, "dateEnvoi": "2025-04-25", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-05-26", "marcheId": "marche-0", "isRedFont": false, "id": "sofijar-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003169", "dateFacture": "2025-04-25", "pctAvancement": 0.19, "montantHt": 70818.75, "tva": 5971.44, "montantTtc": 76223.64, "rg": 3811.18, "avanceDeduite": 0, "prorata": 566.55, "rembAdd": 7683.83, "fournisseurs": [], "totalARecevoir": 64728.63, "dateEnvoi": "2025-04-25", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-05-26", "marcheId": "marche-0", "isRedFont": false, "id": "sofijar-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003199", "dateFacture": "2025-05-23", "pctAvancement": 0.23, "montantHt": 23158.19, "tva": 1952.7, "montantTtc": 24925.62, "rg": 1246.28, "avanceDeduite": 0, "prorata": 185.27, "rembAdd": 2512.66, "fournisseurs": [], "totalARecevoir": 21166.68, "dateEnvoi": "2025-05-23", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-07-16", "marcheId": "marche-0", "isRedFont": false, "id": "sofijar-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003236", "dateFacture": "2025-06-23", "pctAvancement": 0.32, "montantHt": 49375.7, "tva": 4163.36, "montantTtc": 53144.05, "rg": 2657.2, "avanceDeduite": 0, "prorata": 395.01, "rembAdd": 5357.26, "fournisseurs": [], "totalARecevoir": 45129.59, "dateEnvoi": "2025-06-23", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-07-16", "marcheId": "marche-0", "isRedFont": false, "id": "sofijar-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 5, "nFact": "0003301", "dateFacture": "2025-07-25", "pctAvancement": 0.39, "montantHt": 35548.35, "tva": 2997.44, "montantTtc": 38261.4, "rg": 1913.07, "avanceDeduite": 0, "prorata": 284.39, "rembAdd": 3826.14, "fournisseurs": [], "totalARecevoir": 32522.19, "dateEnvoi": "2025-07-25", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-09-16", "marcheId": "marche-0", "isRedFont": false, "id": "sofijar-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 6, "nFact": "0003557", "dateFacture": "2026-02-24", "pctAvancement": 0.44, "montantHt": 27469.31, "tva": 2316.21, "montantTtc": 29565.77, "rg": 1478.29, "avanceDeduite": 0, "prorata": 219.75, "rembAdd": 2956.58, "fournisseurs": [], "totalARecevoir": 25130.9, "dateEnvoi": "2026-02-24", "validBet": "2026-03-03", "validAmo": null, "validAutre": null, "datePaiement": "2025-03-25", "marcheId": "marche-0", "isRedFont": false, "id": "sofijar-sit-5", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003133", "dateFacture": "2026-07-27", "pctAvancement": 0.95, "montantHt": 9690, "tva": 823.65, "montantTtc": 10513.65, "rg": 525.68, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 9987.97, "dateEnvoi": "2026-07-29", "validBet": "2026-08-04", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-1", "isRedFont": true, "id": "sofijar-sit-6", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "LBC", "enveloppe": 65985.9}], "cessionPaiement": "OUI"}, {"id": "sofijar-sofijar-marche-go", "sheet": "SOFIJAR (SOFIJAR (Marche Go))", "titre": "SOFIJAR (Marche Go)", "client": "SOFIJAR", "nChantier": "CH001285", "dateDemarrage": "2025-03-01", "betArchi": "SIRENGI", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE GO", "montantHt": 599248.1, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 56257.25, "addDate": "2025-05-07", "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003394", "dateFacture": "2025-10-13", "pctAvancement": 0.11, "montantHt": 64624.47, "tva": 5493.08, "montantTtc": 70117.55, "rg": 3505.88, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 59633.36, "dateEnvoi": "2025-10-13", "validBet": "2025-10-22", "validAmo": null, "validAutre": null, "datePaiement": "2025-11-03", "marcheId": "marche-0", "isRedFont": false, "id": "sofijar-sofijar-marche-go-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003459", "dateFacture": "2025-11-30", "pctAvancement": 0.27, "montantHt": 94598.82, "tva": 8040.9, "montantTtc": 102639.72, "rg": -3505.88, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 96910.59, "dateEnvoi": "2025-11-28", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-12-23", "marcheId": "marche-0", "isRedFont": false, "id": "sofijar-sofijar-marche-go-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003500", "dateFacture": "2025-12-24", "pctAvancement": 0.37, "montantHt": 62850.25, "tva": 5342.27, "montantTtc": 68192.52, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 61197.5, "dateEnvoi": "2025-01-07", "validBet": "2026-02-09", "validAmo": null, "validAutre": null, "datePaiement": "2026-02-16", "marcheId": "marche-0", "isRedFont": false, "id": "sofijar-sofijar-marche-go-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003566", "dateFacture": "2026-02-27", "pctAvancement": 0.45, "montantHt": 44636.12, "tva": 3794.07, "montantTtc": 48430.19, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 43587.17, "dateEnvoi": "2026-03-04", "validBet": "2026-03-03", "validAmo": null, "validAutre": null, "datePaiement": "2026-03-25", "marcheId": "marche-0", "isRedFont": false, "id": "sofijar-sofijar-marche-go-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 5, "nFact": "0003668", "dateFacture": "2026-05-28", "pctAvancement": 0.48, "montantHt": 18593, "tva": 1580.41, "montantTtc": 20173.4, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 20173.4, "dateEnvoi": null, "validBet": "2025-06-03", "validAmo": null, "validAutre": null, "datePaiement": "2026-06-24", "marcheId": "marche-0", "isRedFont": false, "id": "sofijar-sofijar-marche-go-sit-4", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 6, "nFact": "0003699", "dateFacture": "2026-06-29", "pctAvancement": 0.59, "montantHt": 65736.36, "tva": 5587.59, "montantTtc": 71323.95, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 62174.21, "dateEnvoi": null, "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "sofijar-sofijar-marche-go-sit-5", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 7, "nFact": "0003758", "dateFacture": "2026-07-29", "pctAvancement": 0.64, "montantHt": 31221.66, "tva": 2653.84, "montantTtc": 33875.5, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 30487.95, "dateEnvoi": "2026-07-29", "validBet": "2026-08-04", "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "sofijar-sofijar-marche-go-sit-6", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}, {"id": "sogetra", "sheet": "SOGETRA", "titre": "SOGETRA", "client": null, "nChantier": "CH001287", "dateDemarrage": null, "betArchi": null, "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PREFECTURE", "montantHt": null, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "autoliq"}, {"id": "marche-1", "nom": "MARCHE PREFECTURE", "montantHt": 0, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-2", "nom": "REQUALIFICATION DE LA RUE RENEE ACHILLE BOISNEUF", "montantHt": 1207894.58, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-3", "nom": "REQUALIFICATION DE LA RUE RENEE ACHILLE BOISNEUF", "montantHt": 13200, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}, {"id": "marche-4", "nom": "REQUALIFICATION DE LA RUE RENEE ACHILLE BOISNEUF", "montantHt": 10312.5, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "ts", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003147", "dateFacture": "2025-04-10", "pctAvancement": 1, "montantHt": 80660, "tva": 0, "montantTtc": 80660, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 80660, "dateEnvoi": "2025-04-15", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-07-21", "marcheId": "marche-0", "isRedFont": false, "id": "sogetra-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003168", "dateFacture": "2025-04-23", "pctAvancement": 1, "montantHt": 1122, "tva": 95.37, "montantTtc": 1217.37, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 1217.37, "dateEnvoi": "2025-03-20", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": "2025-08-05", "marcheId": "marche-1", "isRedFont": false, "id": "sogetra-sit-1", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003439", "dateFacture": "2026-06-21", "pctAvancement": 0.1, "montantHt": 100605, "tva": 8413.66, "montantTtc": 107397.87, "rg": 5369.89, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 102027.97, "dateEnvoi": "2025-11-25", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-2", "isRedFont": false, "id": "sogetra-sit-2", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 2, "nFact": "0003594", "dateFacture": "2026-05-05", "pctAvancement": 0.16, "montantHt": 214352.8, "tva": 17981.36, "montantTtc": 229526.83, "rg": 11716.56, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 82935.38, "dateEnvoi": "2026-04-09", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-2", "isRedFont": false, "id": "sogetra-sit-3", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}, {"nSituation": 3, "nFact": "0003682", "dateFacture": "2026-06-19", "pctAvancement": 0.31, "montantHt": 33375, "tva": 2836.88, "montantTtc": 36211.88, "rg": 1810.59, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [{"nom": "SGB", "montant": 23334.32}], "totalARecevoir": 11066.96, "dateEnvoi": "2026-06-29", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-2", "isRedFont": true, "id": "sogetra-sit-4", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 4, "nFact": "0003724", "dateFacture": "2026-07-24", "pctAvancement": 0.36, "montantHt": 48672.2, "tva": 4137.14, "montantTtc": 52809.34, "rg": 2640.47, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [{"nom": "SGB", "montant": 42829.27}, {"nom": "SGB", "montant": 14388.16}], "totalARecevoir": -14388.16, "dateEnvoi": "2026-07-24", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-2", "isRedFont": true, "id": "sogetra-sit-5", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003561", "dateFacture": "2026-02-24", "pctAvancement": 1, "montantHt": 13200, "tva": 1122, "montantTtc": 14322, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 14322, "dateEnvoi": "2026-02-24", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-3", "isRedFont": false, "id": "sogetra-sit-6", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [{"nom": "SGB", "enveloppe": null}], "cessionPaiement": "OUI"}, {"id": "rsma", "sheet": "SOGETRA (RSMA)", "titre": "RSMA", "client": null, "nChantier": null, "dateDemarrage": null, "betArchi": null, "dureePrevue": null, "cessionPaiement": "NON", "fournisseurs": [], "marches": [{"id": "marche-0", "nom": "Marché principal", "montantHt": 12000, "tauxTva": 0, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "autoliq"}], "situations": [{"nSituation": 1, "nFact": "0003713", "dateFacture": "2026-07-06", "pctAvancement": 1, "montantHt": 12000, "tva": 0, "montantTtc": 12000, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 12000, "dateEnvoi": "2026-07-24", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "rsma-sit-0", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}, {"nSituation": 1, "nFact": "0003712", "dateFacture": "2026-07-06", "pctAvancement": 1, "montantHt": 4556, "tva": 0, "montantTtc": 4556, "rg": 0, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 4556, "dateEnvoi": "2026-07-07", "validBet": null, "validAmo": null, "validAutre": null, "datePaiement": null, "marcheId": "marche-0", "isRedFont": true, "id": "rsma-sit-1", "note": "", "montantRegle": null, "paye": false, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}}, {"id": "villa-yam", "sheet": "VILLA YAM", "titre": "VILLA YAM", "client": "DAN BENDENNOUNE", "nChantier": "CH001373", "dateDemarrage": null, "betArchi": "ETRA", "dureePrevue": null, "marches": [{"id": "marche-0", "nom": "MARCHE PRINCIPAL", "montantHt": 16675.5, "tauxTva": 0.09, "rgMode": "5pct", "rgPct": 0.05, "prorataPct": null, "addMontant": 0, "addDate": null, "type": "principal", "tvaRegime": "085"}], "situations": [{"nSituation": 1, "nFact": "0003586", "dateFacture": "2026-03-23", "pctAvancement": 0.68, "montantHt": 11361.59, "tva": 965.74, "montantTtc": 12327.33, "rg": 616.37, "avanceDeduite": 0, "prorata": 0, "rembAdd": 0, "fournisseurs": [], "totalARecevoir": 11710.96, "dateEnvoi": "2026-03-26", "validBet": "2026-04-28", "validAmo": null, "validAutre": null, "datePaiement": "2026-05-05", "marcheId": "marche-0", "isRedFont": false, "id": "villa-yam-sit-0", "note": "", "montantRegle": null, "paye": true, "dateDepotChorus": null}], "documents": {"acteEngagement": false, "ccap": false, "devisSigne": false, "avenants": [], "dc4Statut": "manquant"}, "fournisseurs": [], "cessionPaiement": "NON"}];
const SEED_RG = {"echues": [{"nChantier": "CH000896", "nom": "TOP CARAIBES", "montantHt": 15780.26, "montantTtc": 17121.58, "betMo": null, "dateEnvoi": "2025-09-25", "notes": "AVOCAT", "id": "rg-e-0"}, {"nChantier": "CH001182", "nom": "ORCA", "montantHt": 6151.38, "montantTtc": 6674.25, "betMo": "BEASSE", "dateEnvoi": "2025-09-29", "notes": null, "id": "rg-e-1"}, {"nChantier": "CH001051", "nom": "BMJ / MUR", "montantHt": 1612.5, "montantTtc": 1612.5, "betMo": "BMJ", "dateEnvoi": "2025-10-08", "notes": null, "id": "rg-e-2"}, {"nChantier": "CH001124", "nom": "BMJ / MARINA MP", "montantHt": 14512.51, "montantTtc": 14512.51, "betMo": "BMJ", "dateEnvoi": "2025-10-08", "notes": null, "id": "rg-e-3"}, {"nChantier": "CH001124", "nom": "BMJ / MARINA TS", "montantHt": 1420.87, "montantTtc": 1420.87, "betMo": "BMJ", "dateEnvoi": "2025-10-08", "notes": null, "id": "rg-e-4"}, {"nChantier": "CH001031", "nom": "LES GALERIES DE MOKO", "montantHt": 18034.01, "montantTtc": 19566.9, "betMo": "BADEL", "dateEnvoi": "2025-10-06", "notes": null, "id": "rg-e-5"}, {"nChantier": "CH000123", "nom": "NAUTILUS", "montantHt": 8610.7, "montantTtc": 9342.61, "betMo": null, "dateEnvoi": null, "notes": null, "id": "rg-e-6"}, {"nChantier": "CH001158", "nom": "CONSTELLATION", "montantHt": 1812.73, "montantTtc": 1966.81, "betMo": null, "dateEnvoi": "2026-02-19", "notes": null, "id": "rg-e-7"}, {"nChantier": "CH001180", "nom": "PIZZAROTI", "montantHt": 20600.25, "montantTtc": 0, "betMo": "PIZZAROTI", "dateEnvoi": "2026-07-10", "notes": null, "id": "rg-e-8"}, {"nChantier": "CH001222", "nom": "CAJOU 19", "montantHt": 2179.57, "montantTtc": 2364.83, "betMo": "ETRA", "dateEnvoi": "2026-05-02", "notes": null, "id": "rg-e-9"}], "aVenir": [{"nChantier": "CH001171", "nom": "GETELEC TP - PLACE PB", "montantHt": 26688.14, "montantTtc": 28956.63, "betMo": "GETELEC", "dateEcheance": "2026-08-11", "id": "rg-v-0"}, {"nChantier": "CH001312", "nom": "ELODIE GIRARD", "montantHt": 1549.72, "montantTtc": 1681.45, "betMo": "ETRA", "dateEcheance": "2026-09-19", "id": "rg-v-1"}, {"nChantier": "CH001258", "nom": "GVH", "montantHt": 3449.99, "montantTtc": 3743.24, "betMo": "MPH", "dateEcheance": "2026-10-01", "id": "rg-v-2"}, {"nChantier": "CH001258", "nom": "GVH", "montantHt": 54966.76, "montantTtc": 59638.94, "betMo": "MPH", "dateEcheance": "2026-10-01", "id": "rg-v-3"}, {"nChantier": "CH001310", "nom": "BLEU ETROIT", "montantHt": 2316.0, "montantTtc": 2512.86, "betMo": "BEASSE", "dateEcheance": "2026-11-01", "id": "rg-v-4"}, {"nChantier": "CH001043", "nom": "GETELEC TP - PLACE REP", "montantHt": 8511.25, "montantTtc": 9234.71, "betMo": "GETELEC", "dateEcheance": "2026-11-21", "id": "rg-v-5"}, {"nChantier": "CH001238", "nom": "PRESTIGE", "montantHt": 8937.07, "montantTtc": 9696.72, "betMo": "ETRA", "dateEcheance": "2026-11-14", "id": "rg-v-6"}, {"nChantier": "CH001311", "nom": "GETELEC DADS", "montantHt": 405, "montantTtc": 405, "betMo": "GETELEC", "dateEcheance": "2026-12-04", "id": "rg-v-7"}, {"nChantier": "CH001317", "nom": "SCI HORIZONS", "montantHt": 3128.97, "montantTtc": 3394.93, "betMo": "ETEC", "dateEcheance": "2027-01-31", "id": "rg-v-8"}, {"nChantier": "CH001308", "nom": "GTM LES GOYAVIERS", "montantHt": 1028.03, "montantTtc": 1028.03, "betMo": "GTM", "dateEcheance": "2027-02-10", "id": "rg-v-9"}, {"nChantier": "CH001150", "nom": "CROIX ROUGE", "montantHt": 24463.19, "montantTtc": 26542.56, "betMo": "GENE CEDRIC", "dateEcheance": "2027-03-11", "id": "rg-v-10"}, {"nChantier": "CH001132", "nom": "BMJ / ZAE", "montantHt": 12391.69, "montantTtc": 12391.69, "betMo": "BMJ", "dateEcheance": "2027-05-26", "id": "rg-v-11"}, {"nChantier": "CH001162", "nom": "DOTHEMARE 26", "montantHt": 29135.94, "montantTtc": 31612.49, "betMo": "BARBOTTEAU", "dateEcheance": null, "id": "rg-v-12"}, {"nChantier": "CH001311", "nom": "GETELEC TP - DADS", "montantHt": 405, "montantTtc": 0, "betMo": "GETELEC", "dateEcheance": null, "id": "rg-v-13"}, {"nChantier": "CH001218", "nom": "SANDRINE DAMOISEAU", "montantHt": 6729.2, "montantTtc": 7301.18, "betMo": "BARBOTTEAU", "dateEcheance": null, "id": "rg-v-14"}, {"nChantier": "CH001212", "nom": "PROMO IMMO", "montantHt": 41145.86, "montantTtc": 44643.26, "betMo": "V2C", "dateEcheance": null, "id": "rg-v-15"}, {"nChantier": "CH001237", "nom": "PORT COTON", "montantHt": 11019.9, "montantTtc": 11956.59, "betMo": "BEASSE", "dateEcheance": null, "id": "rg-v-16"}, {"nChantier": "CH001304", "nom": "DESPROGES - SINERGIS", "montantHt": 16507.96, "montantTtc": 17911.14, "betMo": "ITEC", "dateEcheance": null, "id": "rg-v-17"}, {"nChantier": null, "nom": "SOGETRA - JARDIBRUN", "montantHt": 4318.5, "montantTtc": 0, "betMo": "SOGETRA", "dateEcheance": null, "id": "rg-v-18"}, {"nChantier": "CH001291", "nom": "SCI JADE", "montantHt": 53677.8, "montantTtc": 58240.41, "betMo": "BARBOTTEAU", "dateEcheance": null, "id": "rg-v-19"}, {"nChantier": "CH001346", "nom": "TAPENADE", "montantHt": 1657.0, "montantTtc": 1797.85, "betMo": "ETRA", "dateEcheance": null, "id": "rg-v-20"}]};


// ---------- Style tokens ----------
const COLORS = {
  bg: "#F3F1EA",
  paper: "#FFFFFF",
  ink: "#1C2431",
  inkSoft: "#5B6472",
  navy: "#16233B",
  navySoft: "#22314D",
  line: "#E1DCCE",
  accent: "#2B6CB0",
  accentSoft: "#DCE9F7",
  amber: "#B8720A",
  amberSoft: "#FBEBD2",
  red: "#B23A2E",
  redSoft: "#F7E1DD",
  green: "#1E7A52",
  greenSoft: "#DDEFE5",
};

const MONTHS_FR = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

function fmtEUR(n) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR");
}
function fmtPct(n) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return (n * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " %";
}
function monthKey(iso) {
  if (!iso) return "0000-00";
  return iso.slice(0, 7);
}
function monthLabel(key) {
  if (key === "0000-00") return "Sans date";
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS_FR[m - 1]} ${y}`;
}
function daysSince(iso) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  const now = new Date();
  return Math.floor((now - d) / 86400000);
}
function daysUntil(iso) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  const now = new Date();
  return Math.floor((d - now) / 86400000);
}
// "Un montant reçu est connu" pour une situation : vraie valeur numérique — pas
// null/undefined, mais pas non plus une chaîne vide "" (certaines anciennes situations ont
// ce champ à "" plutôt qu'à null ; en JS, total - "" vaut total, ce qui ferait croire à
// tort qu'aucun règlement n'a été reçu sur des situations pourtant bien payées).
function hasMontantRegle(s) {
  const recu = s.montantRegle;
  return recu !== null && recu !== undefined && recu !== "" && !isNaN(Number(recu));
}
// Montant restant à percevoir sur une situation : plein montant si rien n'a encore été reçu,
// solde après déduction des règlements partiels déjà encaissés si un montant reçu est connu
// (même sur une situation marquée "payée" — un règlement peut être inférieur au montant
// attendu, ex. retenue du client, erreur de virement... auquel cas la différence reste due),
// et 0 uniquement si la situation est payée sans qu'aucun montant reçu distinct n'ait été
// renseigné (on considère alors que le montant attendu a bien été perçu en totalité).
function soldeRestant(s) {
  const total = s.totalARecevoir || 0;
  if (hasMontantRegle(s)) {
    return Math.round(Math.max(0, total - Number(s.montantRegle)) * 100) / 100;
  }
  return s.paye ? 0 : total;
}
// Montant réellement reçu sur une situation, tel qu'on peut le rapprocher d'un règlement
// bancaire : le montant reçu explicite s'il est renseigné, sinon le montant attendu si la
// situation est marquée payée (aucun écart connu), sinon 0 (rien reçu).
function montantEffectivementRecu(s) {
  if (hasMontantRegle(s)) return Number(s.montantRegle);
  return s.paye ? (s.totalARecevoir || 0) : 0;
}
// Parcourt les situations d'UN SEUL marché/TS, dans l'ordre de la séquence
// (n° de situation, puis date de facture en repli), et reporte les
// trop-perçus / manques constatés sur les situations déjà PAYÉES vers les
// situations SUIVANTES pas encore payées du même marché — jamais vers un
// autre marché/TS, jamais vers une situation antérieure.
//
// Exemple (remonté par Morgane, chantier Redneck) : la situation N-1 est
// payée avec 2 000 € de trop-perçu ; la situation N, encore en attente,
// doit voir son montant à recevoir réduit de ces 2 000 € — l'ancienne
// version ne compensait qu'ENTRE situations déjà payées entre elles, jamais
// vers une situation encore en attente, donc ce trop-perçu disparaissait
// purement et simplement au lieu de réduire ce qui restait dû.
// Symétriquement, un manque constaté sur une situation payée s'ajoute au
// montant dû sur la situation en attente suivante.
//
// Renvoie { dueBySituation: {id: montant}, leftoverSolde } : dueBySituation
// donne le montant réellement dû pour chaque situation NON payée (à utiliser
// à la place de son totalARecevoir brut) ; leftoverSolde est le reliquat non
// absorbé quand TOUTES les situations du marché sont déjà payées mais
// laissent malgré tout un écart net (c'est l'ancien cas "solde net du
// marché", ex. CHU : cinq situations toutes payées avec des écarts qui ne
// s'annulent pas complètement).
function walkMarcheLedger(situations) {
  const rank = (s) => {
    const n = Number(s.nSituation);
    const hasN = s.nSituation !== "" && s.nSituation !== null && s.nSituation !== undefined && !isNaN(n);
    return [hasN ? n : Infinity, s.dateFacture || "9999-99-99"];
  };
  const cmp = (a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1].localeCompare(b[1]));
  const ordered = [...situations].sort((a, b) => cmp(rank(a), rank(b)));
  let credit = 0; // > 0 : trop-perçu disponible à reporter ; < 0 : manque encore à couvrir
  const dueBySituation = {};
  for (const s of ordered) {
    const due = s.totalARecevoir || 0;
    if (s.paye) {
      const recu = montantEffectivementRecu(s);
      credit = Math.round((credit + (recu - due)) * 100) / 100;
    } else {
      const dejaRecu = hasMontantRegle(s) ? Number(s.montantRegle) : 0;
      const effectiveDue = Math.round((due - dejaRecu - credit) * 100) / 100;
      if (effectiveDue >= 0) {
        dueBySituation[s.id] = effectiveDue;
        credit = 0;
      } else {
        // le trop-perçu disponible dépasse ce qui était dû ici : rien à
        // payer sur cette ligne, le reliquat continue vers la suivante.
        dueBySituation[s.id] = 0;
        credit = Math.round(-effectiveDue * 100) / 100;
      }
    }
  }
  const leftoverSolde = credit < -0.01 ? Math.round(-credit * 100) / 100 : 0;
  return { dueBySituation, leftoverSolde };
}
// Applique walkMarcheLedger à toutes les situations d'un chantier, groupées
// par marché/TS (jamais de compensation entre deux marchés différents).
function chantierLedger(situations) {
  const byMarche = {};
  for (const s of situations) {
    const key = s.marcheId || `_sans_marche_${s.id}`;
    (byMarche[key] = byMarche[key] || []).push(s);
  }
  const dueBySituation = {};
  const leftoverByMarche = {};
  for (const [marcheId, sits] of Object.entries(byMarche)) {
    const res = walkMarcheLedger(sits);
    Object.assign(dueBySituation, res.dueBySituation);
    if (res.leftoverSolde > 0.01) leftoverByMarche[marcheId] = res.leftoverSolde;
  }
  return { dueBySituation, leftoverByMarche };
}
// Total "en attente de règlement" sur les situations d'un chantier : la
// somme des montants dus (déjà nets des trop-perçus/manques reportés) sur
// chaque situation pas encore payée, plus les reliquats de marchés
// entièrement payés mais pas totalement soldés. C'est la seule fonction à
// utiliser pour un total agrégé — ne jamais sommer soldeRestant() directement,
// ça recompterait chaque écart isolément (voir walkMarcheLedger).
function soldeAttenteChantier(situations) {
  const { dueBySituation, leftoverByMarche } = chantierLedger(situations);
  const sumDue = Object.values(dueBySituation).reduce((a, v) => a + v, 0);
  const sumLeftover = Object.values(leftoverByMarche).reduce((a, v) => a + v, 0);
  return Math.round((sumDue + sumLeftover) * 100) / 100;
}
function addDays(iso, days) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
// Règlement dû 30 jours après la validation BET (pas après la date de facture).
function echeanceReglement(s) {
  return s.validBet ? addDays(s.validBet, 30) : null;
}
function joursRetardReglement(s) {
  const ech = echeanceReglement(s);
  return ech ? daysSince(ech) : null;
}
function uid(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 10);
}
// Nom affiché d'un marché/TS/PRORATA : le libellé auto ("TS 1", "PRORATA"...)
// suivi, s'il est renseigné, du nom/description libre ajouté à côté (ex.
// "TS 1 — Terrassement"). Le libellé auto lui-même reste toujours modifiable
// directement (champ titre du bloc), mais ce champ "description" permet
// d'ajouter une précision SANS avoir à retaper/perdre le repère "TS N".
function marcheDisplayName(m) {
  if (!m) return "";
  return m.description ? `${m.nom} — ${m.description}` : m.nom;
}

function useIsMobile(breakpoint = 760) {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < breakpoint : false));
  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth < breakpoint); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

// A grid that reflows its own columns based on available width — no breakpoint plumbing needed.
function ResponsiveGrid({ children, min = 150, gap = 12, style = {}, className = "" }) {
  return (
    <div className={className} style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap, ...style }}>
      {children}
    </div>
  );
}

// ---------- Small UI atoms ----------
function Pill({ children, color = "ink" }) {
  const map = {
    ink: { bg: "#EDEAE0", fg: COLORS.inkSoft },
    amber: { bg: COLORS.amberSoft, fg: COLORS.amber },
    red: { bg: COLORS.redSoft, fg: COLORS.red },
    green: { bg: COLORS.greenSoft, fg: COLORS.green },
    accent: { bg: COLORS.accentSoft, fg: COLORS.accent },
    purple: { bg: "#EDE9FE", fg: "#6D28D9" },
  };
  const c = map[color] || map.ink;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
      style={{ background: c.bg, color: c.fg }}
    >
      {children}
    </span>
  );
}

function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{ background: COLORS.paper, border: `1px solid ${COLORS.line}`, ...style }}
    >
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, type = "button", title }) {
  const base = "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "px-2.5 py-1 text-xs", md: "px-3.5 py-2 text-sm" };
  const variants = {
    primary: { background: COLORS.navy, color: "#fff" },
    accent: { background: COLORS.accent, color: "#fff" },
    ghost: { background: "transparent", color: COLORS.ink, border: `1px solid ${COLORS.line}` },
    danger: { background: COLORS.redSoft, color: COLORS.red },
  };
  return (
    <button type={type} title={title} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]}`} style={variants[variant]}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span style={{ color: COLORS.inkSoft }} className="font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  border: `1px solid ${COLORS.line}`,
  borderRadius: 6,
  padding: "6px 8px",
  fontSize: 13,
  background: "#fff",
  color: COLORS.ink,
};

function TextInput(props) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} className="outline-none focus:ring-2" />;
}

// ---------- Edit gate ----------
function EditGateModal({ onClose, onUnlock, currentCode }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(22,35,59,0.55)" }}>
      <Card className="w-full max-w-sm p-5" style={{ background: COLORS.paper }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base" style={{ color: COLORS.ink }}>Déverrouiller la modification</h3>
          <button onClick={onClose}><X size={18} color={COLORS.inkSoft} /></button>
        </div>
        <p className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
          Consultation libre pour tous. Seule Morgane modifie les données : saisir le code d'édition.
        </p>
        <TextInput
          autoFocus
          type="password"
          name="synergie-edit-gate-code"
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
          placeholder="Code d'édition"
          value={code}
          onChange={(e) => { setCode(e.target.value); setErr(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") { code === currentCode ? onUnlock() : setErr("Code incorrect"); } }}
        />
        {err && <p className="text-xs mt-1" style={{ color: COLORS.red }}>{err}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={() => code === currentCode ? onUnlock() : setErr("Code incorrect")}>Déverrouiller</Btn>
        </div>
      </Card>
    </div>
  );
}

function MarkPaidModal({ defaultDate, defaultMontant, alreadyPaid, onConfirm, onUnmark, onClose }) {
  const [date, setDate] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [montant, setMontant] = useState(defaultMontant ?? "");
  const ecart = montant !== "" && defaultMontant !== null && defaultMontant !== undefined
    ? Math.round((parseFloat(montant) - defaultMontant) * 100) / 100
    : 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(22,35,59,0.55)" }}>
      <Card className="w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base" style={{ color: COLORS.ink }}>{alreadyPaid ? "Modifier le règlement" : "Marquer réglé"}</h3>
          <button onClick={onClose}><X size={18} color={COLORS.inkSoft} /></button>
        </div>
        <div className="flex flex-col gap-3">
          <Field label="Date de règlement">
            <TextInput type="date" autoFocus value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label={alreadyPaid ? "Montant total réglé" : "Montant reçu (ce règlement)"}>
            <TextInput type="number" step="0.01" value={montant} onChange={(e) => setMontant(e.target.value)} placeholder={defaultMontant != null ? String(defaultMontant) : ""} />
          </Field>
          {!alreadyPaid && montant !== "" && Math.abs(ecart) > 0.01 && (
            ecart < 0 ? (
              <p className="text-xs" style={{ color: COLORS.amber }}>
                Règlement partiel — il restera {fmtEUR(Math.abs(ecart))} à percevoir, la facture restera dans les règlements en attente.
              </p>
            ) : (
              <p className="text-xs" style={{ color: COLORS.amber }}>
                {fmtEUR(Math.abs(ecart))} de plus que le solde attendu ({fmtEUR(defaultMontant)}).
              </p>
            )
          )}
          {alreadyPaid && montant !== "" && Math.abs(ecart) > 0.01 && (
            <p className="text-xs" style={{ color: ecart < 0 ? COLORS.red : COLORS.amber }}>
              Écart de {fmtEUR(Math.abs(ecart))} {ecart < 0 ? "en moins" : "en plus"} par rapport au montant attendu ({fmtEUR(defaultMontant)}).
            </p>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          {alreadyPaid ? (
            <button className="text-xs font-medium" style={{ color: COLORS.red }} onClick={onUnmark}>Annuler le règlement</button>
          ) : <span />}
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
            <Btn variant="primary" disabled={!date} onClick={() => onConfirm(date, montant === "" ? null : parseFloat(montant))}>Valider</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ---------- Derived data helpers ----------
// ---------- Documents helpers ----------
function hasBetArchi(chantier) {
  const v = (chantier.betArchi || "").trim().toLowerCase();
  return v !== "" && v !== "-";
}
// Nom de fichier sûr pour les PDF générés (accents retirés, caractères
// spéciaux remplacés) — utilisé quand l'export doit produire un vrai
// fichier téléchargeable (voir lib/exportPdf.js).
function sanitizeFileName(v) {
  return String(v || "export")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "export";
}

// Version "l\u00e9g\u00e8re" du sanitizer ci-dessus, r\u00e9serv\u00e9e aux PDF de situation
// envoy\u00e9s par email (voir situationDocFileName) : contrairement \u00e0
// sanitizeFileName, on garde les espaces/accents/apostrophes (autoris\u00e9s par
// Windows/macOS) tels quels \u2014 seuls les caract\u00e8res r\u00e9ellement interdits par
// un syst\u00e8me de fichiers (\ / : * ? " < > |) sont retir\u00e9s \u2014 pour produire un
// nom de fichier lisible correspondant au format demand\u00e9 par Morgane.
function sanitizeFileNameKeepAccents(v) {
  return String(v || "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}
const MOIS_FR = ["Janvier", "F\u00e9vrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Ao\u00fbt", "Septembre", "Octobre", "Novembre", "D\u00e9cembre"];


// La superposition de l'encadré "Répartition de règlement" et de la
// signature sur le PDF Récapitulatif se fait maintenant côté serveur, voir
// /api/stamp-repartition (uploadSituationDocument ci-dessous l'appelle) : il
// faut pouvoir LIRE la position réelle du texte déjà présent sur le
// document pour caler l'encadré correctement quel que soit le nombre de
// lignes déjà imprimées au-dessus (pdf-lib, utilisé côté navigateur, ne
// sait qu'écrire, jamais lire une position existante).
// A document entry can be a legacy plain boolean (old data) or the new
// { present, fileName, filePath, uploadedAt } shape (uploaded file). This
// normalizes either form, and also folds in the old tri-state dc4Statut
// field so previously-collected data keeps its meaning.
function getDocMeta(docs, key) {
  const v = docs && docs[key];
  if (v && typeof v === "object") return v;
  if (typeof v === "boolean") return { present: v };
  if (key === "dc4" && docs && docs.dc4Statut === "present") return { present: true };
  return { present: false };
}
function docPresent(docs, key) {
  return !!getDocMeta(docs, key).present;
}
// Documents dont le contenu contient en général le client, le montant du
// marché, etc. — seuls ceux-là déclenchent une tentative de lecture
// automatique après l'upload.
const ANALYZABLE_DOC_KEYS = ["devisSigne", "acteEngagement", "contratSousTraitance"];

// Liste fixe des types de documents contractuels cochables depuis "Modifier
// les infos". L'ordre ici est l'ordre d'affichage des bulles.
const FIXED_DOC_TYPES = [
  { key: "acteEngagement", label: "Acte d'engagement" },
  { key: "os", label: "OS" },
  { key: "bonCommande", label: "Bon de commande" },
  { key: "ccap", label: "CCAP" },
  { key: "dc4", label: "DC4" },
  { key: "contratSousTraitance", label: "Contrat de sous-traitance" },
  { key: "devisSigne", label: "Devis signé" },
  { key: "pvReception", label: "PV de réception" },
  { key: "dgd", label: "DGD" },
];

// ---------- Sous-traitance ----------
// Le DC4 et le contrat de sous-traitance suivent chacun une progression en
// étapes (pas juste présent/absent) : rédigé, signé côté sous-traitant,
// envoyé au BET, puis signé par le client (maître d'ouvrage) — ou annulé.
// Sur marché privé, seule la case "Contrat" a vraiment un sens (le DC4 est
// propre aux marchés publics) ; elle reste modifiable dans tous les cas,
// simplement laissée vide si non concernée.
const SS_TRAITANCE_STATUTS = [
  { key: "redige", label: "Rédigé" },
  { key: "signe_st", label: "Signé Sous-Traitant" },
  { key: "envoye_bet", label: "Envoyé BET" },
  { key: "signe_client", label: "Signé Client" },
  { key: "annule", label: "Annulé" },
];
function ssTraitanceStatutLabel(key) {
  return (SS_TRAITANCE_STATUTS.find((s) => s.key === key) || {}).label || "—";
}
function ssTraitanceStatutColor(key) {
  if (key === "signe_client") return "green";
  if (key === "annule") return "red";
  if (key === "envoye_bet" || key === "signe_st") return "amber";
  if (key === "redige") return "ink";
  return "ink";
}
// Documents administratifs à réunir pour chaque sous-traitant employé sur un
// chantier, à jour au moment de CE contrat précis (Morgane les re-demande à
// chaque nouvel engagement plutôt que de se fier à un document ancien) —
// une simple bulle PDF par pièce, comme partout ailleurs dans l'appli :
// déposée = à jour, vide = manquante.
const ATTESTATION_TYPES = [
  { key: "kbis", label: "KBIS", sousLabel: "< 3 mois" },
  { key: "urssaf", label: "URSSAF", sousLabel: "< 6 mois" },
  { key: "fiscale", label: "Attestation fiscale", sousLabel: "< 6 mois" },
  { key: "assurance", label: "Assurance", sousLabel: "décennale/RC pro" },
  { key: "pi", label: "PI", sousLabel: "police d'assurance" },
];
// Clé de document réutilisant le même stockage générique que le reste de
// l'appli (chantier.documents / getDocMeta / uploadDocument / removeDocument
// / openDocument — voir plus bas) : un sous-traitant donné peut avoir
// plusieurs contrats sur le même chantier au fil du temps (rare mais
// possible), d'où l'id du contrat dans la clé et pas seulement le type de
// pièce.
function sousTraitanceDocKey(entryId, type) {
  return "sst-" + entryId + "-" + type;
}
function emptySousTraitanceEntry() {
  return { id: uid("sst"), sousTraitantId: "", montant: null, dateDebut: "", dateFin: "", statutDc4: "", statutContrat: "" };
}
// Une entrée du répertoire des sous-traitants (réutilisable d'un chantier à
// l'autre) — coordonnées + infos bancaires + validité CACES.
function emptySousTraitant() {
  return { id: uid("stt"), nom: "", representant: "", telephone: "", email: "", banque: "", iban: "", siret: "", adresse: "", caces: "" };
}
// Répertoire initial repris du fichier "FICHIER RENSEIGNEMENTS SS
// TRAITANTS.xlsx" fourni par Morgane — ne sert qu'une seule fois, au tout
// premier chargement (si rien n'est encore enregistré dans le répertoire),
// exactement comme SEED_CHANTIERS/SEED_RG. Les contrats/DC4/attestations par
// chantier ne sont PAS repris automatiquement (le fichier "SUIVI DC4
// CONTRATS.xlsx" désigne les chantiers par un intitulé libre qu'on ne peut
// pas relier à coup sûr aux chantiers réels déjà enregistrés) — Morgane les
// recrée à la main depuis la fiche de chaque chantier, en piochant dans ce
// répertoire déjà prérempli.
const SEED_SOUS_TRAITANTS = [
  { id: uid("stt"), nom: "GENIE BTP & VRD", representant: "VAINQUEUR ALAIN", telephone: "0690092981", email: "alainvainqueure71@gmail.com", banque: "QUONTO", iban: "FR76 1695 8000 0187 8243 1774 375", siret: "80447556400014", adresse: "RTE DE SAINT PROTAIS GRANDS FONDS 97160 LE MOULE", caces: "" },
  { id: uid("stt"), nom: "BELFORT BMV BTP", representant: "BELFORT HARRY", telephone: "0690572028", email: "belfortbmvbtp@gmail.com", banque: "BRED", iban: "FR7610107003920053804852201", siret: "83808241000021", adresse: "Roussel 97129 Lamentin", caces: "" },
  { id: uid("stt"), nom: "JVE BTP", representant: "ELUSUE JEAN JEROME", telephone: "0690949108", email: "elusue.jean.jerome971@gmail.com", banque: "CAISSE D'EPARGNE", iban: "FR7611315000010405242386324", siret: "98225254600014", adresse: "Chemin de Belle Plaine 97115 Sainte-Rose", caces: "" },
  { id: uid("stt"), nom: "PYRAMIDE CONSTRUCTION", representant: "EVANS EDME", telephone: "0690189855", email: "", banque: "", iban: "", siret: "83988152100018", adresse: "RUE ACHILLE BOIS NEUF, 97122 MORNE A L'EAU", caces: "" },
  { id: uid("stt"), nom: "GREGO BTP SERVICES", representant: "GREGO BERNARD", telephone: "0690093631", email: "", banque: "", iban: "", siret: "85173054900017", adresse: "Chemin de La Case aux lamentin 97111 Morne à L'eau", caces: "2033-03-01" },
  { id: uid("stt"), nom: "LAMA ROBERT", representant: "LAMA ROBERT", telephone: "0690302922", email: "robertlama97130@gmail.com", banque: "", iban: "", siret: "53887517000010", adresse: "Source Perou 3 - 97130 Capesterre Belle-eau", caces: "" },
  { id: uid("stt"), nom: "HJB CONSTRUCTIONS", representant: "HENRISCA JEAN-BAPTISTE", telephone: "0690232017", email: "hjbconstructionsasu@gmail.com", banque: "", iban: "", siret: "81070740900015", adresse: "Section Bois de Rose Caraque 97139 Les Abymes", caces: "" },
  { id: uid("stt"), nom: "ENTREPRISE ACESSE JOEL", representant: "ACESSE JOEL", telephone: "0690478796", email: "joelacesse@gmail.com", banque: "", iban: "", siret: "75295752200010", adresse: "34 CARANGAISE 97130 CAPESTERRE-BELLE-EAU", caces: "" },
  { id: uid("stt"), nom: "RENOV HOME", representant: "HATCHI Ayann Lary", telephone: "0690330727", email: "contact.renovhomefwi@gmail.com", banque: "", iban: "", siret: "95331624700022", adresse: "1 Résidence Creole Rubane à Calvaire Rue Gaby Jourson 97122 Baie-Mahault", caces: "" },
  { id: uid("stt"), nom: "LAMA TP", representant: "LAMA RONY", telephone: "0690641557", email: "lamatp586@gmail.com", banque: "", iban: "", siret: "44120598600041", adresse: "Changy 97130 Capesterre-Belle-Eau", caces: "" },
  { id: uid("stt"), nom: "SASU VIVA BTP", representant: "SIMON Guva", telephone: "", email: "", banque: "", iban: "", siret: "98098881000019", adresse: "ROUTE de Pliane 97190, Le Gosier", caces: "" },
];
// Ancienne logique automatique (avant la case à cocher manuelle) : uniquement
// utilisée par normalizeChantiersData pour initialiser docTypesActifs sur les
// chantiers existants, afin que les bulles déjà affichées ne disparaissent
// pas au moment de la migration.
function legacyAutoDocTypeKeys(chantier) {
  if (chantier.isFacturesLibres) return [];
  const docs = chantier.documents || {};
  const has = (k) => docPresent(docs, k);
  const isSousTraitant = has("contratSousTraitance");
  const hasOfficialDoc = has("ccap") || has("acteEngagement") || has("contratSousTraitance");
  const keys = [];
  if (hasBetArchi(chantier) && !isSousTraitant) {
    keys.push("acteEngagement", "ccap");
  }
  if (!hasBetArchi(chantier) && !hasOfficialDoc) {
    keys.push("devisSigne");
  }
  const dc4LegacyNonConcerne = docs.dc4Statut === "non_concerne" && !has("dc4");
  if (!dc4LegacyNonConcerne) {
    keys.push("dc4");
  }
  keys.push("contratSousTraitance");
  return keys;
}
// Les documents contractuels affichés sont désormais choisis explicitement
// par la case à cocher dans "Modifier les infos" (chantier.docTypesActifs),
// plus les avenants (dynamiques, numérotés automatiquement).
function requiredDocuments(chantier) {
  if (chantier.isFacturesLibres) return [];
  const docs = chantier.documents || {};
  const actifs = chantier.docTypesActifs || [];
  const items = FIXED_DOC_TYPES.filter((t) => actifs.includes(t.key)).map((t) => ({
    key: t.key,
    label: t.label,
    present: docPresent(docs, t.key),
  }));
  // Comme les autres documents, un avenant est "présent" quand un fichier a
  // été déposé dans sa bulle — plus une simple case cochée à la main.
  const avenants = (docs.avenants || []).map((a) => ({ key: a.id, label: a.nom || "Avenant", present: docPresent(docs, a.id), isAvenant: true }));
  return [...items, ...avenants];
}
function missingDocuments(chantier) {
  return requiredDocuments(chantier).filter((d) => !d.present);
}

function computeAutoRgCumulees(chantiers) {
  const out = [];
  for (const c of chantiers) {
    if (c.rgExtracted) continue;
    const nonBanqueMarches = c.marches.filter((m) => m.rgMode !== "banque" && m.rgMode !== "aucune");
    if (nonBanqueMarches.length === 0) continue;
    const totalMarcheHtNonBanque = nonBanqueMarches.reduce((a, m) => a + (m.montantHt || 0), 0);
    if (!totalMarcheHtNonBanque) continue;
    const sits = c.situations.filter((s) => nonBanqueMarches.some((m) => m.id === s.marcheId));
    if (sits.length === 0) continue;
    const totalHt = sits.reduce((a, s) => a + (s.montantHt || 0), 0);
    const totalRg = sits.reduce((a, s) => a + (s.rg || 0), 0);
    const resteAFacturerNonBanque = Math.round((totalMarcheHtNonBanque - totalHt) * 100) / 100;
    const enAttenteNonBanque = soldeAttenteChantier(sits);
    if (resteAFacturerNonBanque !== 0 || enAttenteNonBanque !== 0 || totalRg <= 0) continue;
    out.push({ chantierId: c.id, chantierTitre: c.titre, client: c.client, nChantier: c.nChantier, tvaRegime: c.marches[0]?.tvaRegime, totalRg, totalHt, sits, marches: c.marches });
  }
  return out;
}

// Répare silencieusement les situations dont des champs numériques ont été
// enregistrés comme chaînes de caractères (ancien bug de saisie : ces champs
// n'étaient pas explicitement convertis en Number avant sauvegarde). Une
// string mélangée à une somme numérique se transforme en concaténation
// silencieuse (ex. 0 + "29745.44" = "029745.44"), ce qui fausse tous les
// totaux du chantier et casse l'affichage "€" dans les exports PDF.
const NUMERIC_SITUATION_FIELDS = ["nSituation", "pctAvancement", "montantHt", "tva", "montantTtc", "rg", "avanceDeduite", "prorata", "rembAdd", "totalARecevoir", "montantRegle"];

// ---------- % d'avancement : calcul canonique unique ----------
// Une seule implémentation, partagée par TOUS les endroits qui ont besoin du
// cumul HT/% d'avancement d'une situation (le tableau des situations, le
// formulaire d'ajout/édition, l'export PDF, et la réparation silencieuse au
// chargement ci-dessous). Avant, chaque endroit avait sa propre copie du
// calcul ; deux versions légèrement différentes (celle du formulaire et
// celle de la réparation au chargement) ne départageaient pas les
// situations à égalité de rang (même n° de situation, même date) de la même
// façon — l'une pouvait faire compter deux situations à égalité comme
// "avant" l'une de l'autre EN MÊME TEMPS, doublant leur cumul HT et donc
// gonflant leur %. Résultat : le % affiché dans le tableau pouvait rester
// figé sur une valeur fausse tant que la page n'était pas rechargée (seul
// moment où la réparation silencieuse tournait), ou redevenir faux dès
// qu'une situation voisine était ajoutée/modifiée dans la même session.
function computeCumulativeHtBySituation(situations, marches) {
  const cumulMap = new Map();
  const marcheHtMap = new Map();
  const byMarche = {};
  for (const s of situations) {
    const key = s.marcheId || "_sans_marche";
    (byMarche[key] = byMarche[key] || []).push(s);
  }
  const rankOf = (s) => {
    const n = Number(s.nSituation);
    const hasN = s.nSituation !== "" && s.nSituation !== null && s.nSituation !== undefined && !isNaN(n);
    return [hasN ? n : Infinity, s.dateFacture || "9999-99-99"];
  };
  const cmpRank = (a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1].localeCompare(b[1]));
  for (const [marcheId, list] of Object.entries(byMarche)) {
    const marche = (marches || []).find((m) => m.id === marcheId);
    marcheHtMap.set(marcheId, marche ? Number(marche.montantHt) || 0 : 0);
    // Tri stable avec repli explicite sur l'ordre d'origine : à rang
    // STRICTEMENT égal, on ne fait jamais compter deux situations comme
    // "avant" l'une de l'autre en même temps — une seule passe avant
    // l'autre, jamais les deux réciproquement (ce qui doublait leur cumul).
    const ordered = list
      .map((s, i) => [s, i])
      .sort((a, b) => cmpRank(rankOf(a[0]), rankOf(b[0])) || a[1] - b[1])
      .map(([s]) => s);
    let cumul = 0;
    for (const s of ordered) {
      cumul += Number(s.montantHt) || 0;
      cumulMap.set(s.id, cumul);
    }
  }
  return { cumulMap, marcheHtMap };
}
function computeSituationPercentages(situations, marches) {
  const { cumulMap, marcheHtMap } = computeCumulativeHtBySituation(situations, marches);
  const pctMap = new Map();
  for (const s of situations) {
    const marcheHt = marcheHtMap.get(s.marcheId || "_sans_marche") || 0;
    const cumul = cumulMap.get(s.id) || 0;
    pctMap.set(s.id, marcheHt ? Math.round((cumul / marcheHt) * 1000) / 1000 : 0);
  }
  return pctMap;
}
function normalizeChantiersData(list) {
  let changed = false;
  const next = list.map((c) => {
    let chantierChanged = false;
    const casted = (c.situations || []).map((s) => {
      let sChanged = false;
      const patched = { ...s };
      for (const k of NUMERIC_SITUATION_FIELDS) {
        if (typeof s[k] === "string" && s[k].trim() !== "" && !isNaN(Number(s[k]))) {
          patched[k] = Number(s[k]);
          sChanged = true;
        }
      }
      // Migration silencieuse : l'ancien emplacement unique "situationDoc"
      // (une seule bulle PDF par situation) devient "situationDocs.recap",
      // pour ne pas perdre les fichiers déjà déposés avant l'ajout de la
      // 2e bulle "avancement".
      if (s.situationDoc && !s.situationDocs) {
        patched.situationDocs = { recap: s.situationDoc, avancement: null, ea: null, facture: null };
        delete patched.situationDoc;
        sChanged = true;
      } else if (!s.situationDocs) {
        patched.situationDocs = { recap: null, avancement: null, ea: null, facture: null };
        sChanged = true;
      }
      if (!Array.isArray(s.fournisseurFactures)) {
        patched.fournisseurFactures = [];
        sChanged = true;
      }
      if (sChanged) { chantierChanged = true; return patched; }
      return s;
    });

    // Auto-réparation du % d'avancement cumulé, via le calcul canonique
    // partagé ci-dessus (computeSituationPercentages) — jamais une deuxième
    // copie de cette logique ici, pour ne plus jamais risquer que la valeur
    // corrigée au chargement diverge de celle affichée en direct ailleurs.
    const pctMap = computeSituationPercentages(casted, c.marches);
    const situations = casted.map((s) => {
      const pct = pctMap.get(s.id) ?? 0;
      if (s.pctAvancement !== pct) {
        chantierChanged = true;
        return { ...s, pctAvancement: pct };
      }
      return s;
    });

    // Migration silencieuse : les fournisseurs cessionnaires créés avant
    // l'ajout de la bulle PDF "acte de cession" n'ont pas d'id stable — on
    // leur en attribue un une fois pour toutes (voir addChantierFournisseur,
    // qui en donne un dès la création) pour que le document déposé reste
    // bien associé au bon fournisseur même si la liste est réordonnée/un
    // fournisseur supprimé entre-temps.
    let fournisseursChanged = false;
    const fournisseurs = (c.fournisseurs || []).map((f) => {
      if (f.id) return f;
      fournisseursChanged = true;
      return { ...f, id: uid("fourn") };
    });
    if (fournisseursChanged) chantierChanged = true;

    // Migration silencieuse : la case à cocher manuelle "Documents
    // contractuels" (docTypesActifs) remplace l'ancienne détection
    // automatique — on l'initialise une fois avec ce que l'ancienne logique
    // affichait déjà, pour ne rien faire disparaître.
    let docTypesActifsChanged = false;
    const docTypesActifs = c.docTypesActifs || (() => {
      docTypesActifsChanged = true;
      return legacyAutoDocTypeKeys(c);
    })();
    if (docTypesActifsChanged) chantierChanged = true;

    // Migration silencieuse : liste des sous-traitants employés sur ce
    // chantier (contrat + DC4 + attestations), absente sur les chantiers
    // créés avant cette fonctionnalité.
    let sousTraitanceChanged = false;
    const sousTraitance = Array.isArray(c.sousTraitance) ? c.sousTraitance : (() => {
      sousTraitanceChanged = true;
      return [];
    })();
    if (sousTraitanceChanged) chantierChanged = true;

    if (chantierChanged) {
      changed = true;
      return {
        ...c,
        situations,
        ...(fournisseursChanged ? { fournisseurs } : {}),
        ...(docTypesActifsChanged ? { docTypesActifs } : {}),
        ...(sousTraitanceChanged ? { sousTraitance } : {}),
      };
    }
    return c;
  });
  return { changed, chantiers: next };
}

function allSituationsFlat(chantiers) {
  const out = [];
  for (const ch of chantiers) {
    for (const s of ch.situations) {
      const displayTitre = ch.isFacturesLibres
        ? ((ch.marches.find((m) => m.id === s.marcheId) || {}).nom || ch.titre)
        : ch.titre;
      out.push({ ...s, chantierId: ch.id, chantierTitre: displayTitre, chantierClient: ch.client, chantierNChantier: ch.nChantier });
    }
  }
  return out;
}

function computeAddPendingEntries(chantiers) {
  const out = [];
  for (const c of chantiers) {
    for (const m of c.marches) {
      if (m.addMontant && !m.addDate) {
        out.push({
          id: `add-${c.id}-${m.id}`, nSituation: 0, nFact: "ADD", dateFacture: c.dateDemarrage || null,
          totalARecevoir: m.addMontant, montantHt: 0, paye: false, validBet: null, dateEnvoi: null,
          chantierId: c.id, chantierTitre: c.titre, chantierClient: c.client, chantierNChantier: c.nChantier,
          marcheId: m.id, isADDPending: true,
        });
      }
    }
  }
  return out;
}

function computeRgEchuesPendingEntries(rgDues) {
  return (rgDues.echues || [])
    .filter((r) => r.validBet)
    .map((r) => ({
      id: `rg-echue-${r.id}`, nSituation: 0, nFact: "RG", dateFacture: r.dateEnvoi || null,
      totalARecevoir: r.montantTtc || r.montantHt || 0, montantHt: 0, paye: false, validBet: null, dateEnvoi: null,
      chantierId: null, chantierTitre: r.nom, chantierClient: null, chantierNChantier: r.nChantier,
      isRgPending: true, rgEchueId: r.id,
    }));
}

// Une par marché entièrement payé dont les situations laissent malgré tout un solde net non
// nul après compensation des trop-perçus / manques (voir walkMarcheLedger) — cas d'un marché
// où AUCUNE situation n'est encore en attente pour absorber le reliquat. Contrairement aux
// situations impayées listées individuellement, ce solde n'est pas rattaché à une facture
// précise — c'est un écart cumulé sur le marché — donc pas d'action "marquer réglé" dessus :
// la correction se fait situation par situation, depuis la fiche du chantier.
function computeMarcheSoldeEntries(chantiers) {
  const out = [];
  for (const c of chantiers) {
    const { leftoverByMarche } = chantierLedger(c.situations);
    for (const [marcheId, solde] of Object.entries(leftoverByMarche)) {
      const marche = c.marches.find((m) => m.id === marcheId);
      const sits = c.situations.filter((s) => s.marcheId === marcheId);
      const lastDate = sits.reduce((latest, s) => ((s.dateFacture || "") > latest ? s.dateFacture : latest), "");
      out.push({
        id: `marche-solde-${c.id}-${marcheId}`, nSituation: 0, nFact: "SOLDE",
        dateFacture: lastDate || null, totalARecevoir: solde, montantHt: 0, paye: false,
        validBet: null, dateEnvoi: null,
        chantierId: c.id, chantierTitre: c.titre, chantierClient: c.client, chantierNChantier: c.nChantier,
        marcheId, marcheNom: marche ? marcheDisplayName(marche) : "—",
        isMarcheSoldePending: true,
      });
    }
  }
  return out;
}

function useComputed(chantiers, rgDues) {
  return useMemo(() => {
    const flat = allSituationsFlat(chantiers);
    const addPending = computeAddPendingEntries(chantiers);
    const rgPending = computeRgEchuesPendingEntries(rgDues);
    const marcheSoldePending = computeMarcheSoldeEntries(chantiers);
    // Montant réellement dû par situation encore en attente, calculé pour chaque chantier via
    // walkMarcheLedger : reporte déjà les trop-perçus/manques des situations payées du même
    // marché sur les suivantes (voir walkMarcheLedger plus haut).
    const ledgerBySituationId = {};
    for (const c of chantiers) {
      Object.assign(ledgerBySituationId, chantierLedger(c.situations).dueBySituation);
    }
    const impayees = [
      // Situation encore ouverte (non payée) : affichée avec son montant réellement dû, qui
      // tient compte à la fois d'un règlement partiel déjà reçu sur ELLE-MÊME et des
      // trop-perçus/manques reportés depuis les situations payées précédentes du même marché
      // (voir computeMarcheSoldeEntries pour le reliquat quand plus aucune situation du marché
      // n'est en attente pour l'absorber).
      ...flat.filter((s) => !s.paye && (s.totalARecevoir || 0) >= 0).map((s) => {
        const adjusted = ledgerBySituationId[s.id];
        if (adjusted === undefined) return s;
        return Math.abs(adjusted - (s.totalARecevoir || 0)) > 0.01
          ? { ...s, totalARecevoirOriginal: s.totalARecevoir, totalARecevoir: adjusted }
          : s;
      }),
      ...marcheSoldePending,
      ...addPending,
      ...rgPending,
    ];
    const totalEnAttente = impayees.reduce((a, s) => a + (s.totalARecevoir || 0), 0);
    const enRetard = impayees.filter((s) => {
      if (s.isADDPending || s.isRgPending || s.isMarcheSoldePending) return false;
      const j = joursRetardReglement(s);
      return j !== null && j > 0;
    }).sort((a, b) => joursRetardReglement(b) - joursRetardReglement(a));
    const totalRetard = enRetard.reduce((a, s) => a + (s.totalARecevoir || 0), 0);

    const byMonthFacture = {};
    for (const s of flat) {
      const k = monthKey(s.dateFacture);
      byMonthFacture[k] = (byMonthFacture[k] || 0) + (s.montantHt || 0);
    }
    // Année glissante : les 12 derniers mois jusqu'au mois en cours, même si un mois n'a rien facturé.
    const rollingMonths = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      rollingMonths.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    const chartData = rollingMonths.map((k) => ({ mois: monthLabel(k), total: Math.round(byMonthFacture[k] || 0) }));

    const rgAReclamerBientot = (rgDues.aVenir || []).filter((r) => {
      const d = daysUntil(r.dateEcheance);
      return d !== null && d <= 30;
    });

    const totalRgEchues = (rgDues.echues || []).reduce((a, r) => a + (r.montantTtc || r.montantHt || 0), 0);

    const betARelancer = flat.filter((s) => {
      if (!s.dateEnvoi || s.validBet) return false;
      if (s.paye) return false;
      const d = daysSince(s.dateEnvoi);
      return d !== null && d > 7;
    }).sort((a, b) => daysSince(b.dateEnvoi) - daysSince(a.dateEnvoi));

    return { flat, impayees, totalEnAttente, enRetard, totalRetard, byMonthFacture, chartData, rgAReclamerBientot, totalRgEchues, betARelancer };
  }, [chantiers, rgDues]);
}

// ---------- Sidebar ----------
function SidebarContent({ tab, setTab, unlocked, onLockClick, onSettingsClick, onNavigate, undoCount, onUndoClick }) {
  const items = [
    { key: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { key: "reglements", label: "Règlements en attente", icon: Clock },
    { key: "chantiers", label: "Chantiers", icon: Building2 },
    { key: "archives", label: "Archives", icon: Archive },
    { key: "rg", label: "Retenues de garantie", icon: ShieldCheck },
    { key: "documents", label: "Documents contractuels", icon: FileWarning },
    { key: "soustraitants", label: "Sous-traitants", icon: HardHat },
  ];
  return (
    <div className="h-full flex flex-col justify-between py-5 px-3" style={{ background: COLORS.navy }}>
      <div>
        <div className="px-2 mb-6">
          <img src={LOGO_SYNERGIE} alt="SYNERGIE BTP" style={{ height: 38 }} />
          <div style={{ color: "#8FA3C4" }} className="text-xs mt-2">Suivi situations & règlements</div>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const Icon = it.icon;
            const active = tab === it.key;
            return (
              <button
                key={it.key}
                onClick={() => { setTab(it.key); if (onNavigate) onNavigate(); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left transition-colors"
                style={{
                  background: active ? COLORS.navySoft : "transparent",
                  color: active ? "#fff" : "#B7C3D6",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={16} />
                {it.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-col gap-2">
        {unlocked && undoCount > 0 && (
          <button
            onClick={() => { onUndoClick(); if (onNavigate) onNavigate(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium"
            style={{ background: COLORS.navySoft, color: "#B7C3D6" }}
            title={`Annuler la dernière action (${undoCount} disponible${undoCount > 1 ? "s" : ""})`}
          >
            <Undo2 size={14} /> Annuler la dernière action
            <span
              className="ml-auto rounded-full text-center"
              style={{ background: "#8FA3C4", color: COLORS.navy, minWidth: 16, height: 16, fontSize: 10, lineHeight: "16px" }}
            >
              {undoCount}
            </span>
          </button>
        )}
        <button
          onClick={onSettingsClick}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs"
          style={{ color: "#8FA3C4" }}
        >
          <Settings size={14} /> Réglages
        </button>
        <button
          onClick={onLockClick}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium"
          style={{ background: unlocked ? COLORS.greenSoft : COLORS.navySoft, color: unlocked ? COLORS.green : "#B7C3D6" }}
        >
          {unlocked ? <Unlock size={14} /> : <Lock size={14} />}
          {unlocked ? "Mode édition actif" : "Consultation seule"}
        </button>
      </div>
    </div>
  );
}

// Desktop: fixed-width column. Mobile: slide-out drawer with a dimmed backdrop.
function Sidebar({ tab, setTab, unlocked, onLockClick, onSettingsClick, isMobile, mobileOpen, onCloseMobile, undoCount, onUndoClick }) {
  if (!isMobile) {
    return (
      <div className="w-56 shrink-0 h-full">
        <SidebarContent tab={tab} setTab={setTab} unlocked={unlocked} onLockClick={onLockClick} onSettingsClick={onSettingsClick} undoCount={undoCount} onUndoClick={onUndoClick} />
      </div>
    );
  }
  if (!mobileOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" style={{ background: "rgba(22,35,59,0.55)" }} onClick={onCloseMobile} />
      <div className="absolute top-0 left-0 h-full" style={{ width: 240, maxWidth: "80vw" }}>
        <div className="relative h-full">
          <button onClick={onCloseMobile} className="absolute p-2 rounded-md" style={{ top: 16, right: -44, background: COLORS.navy }}>
            <X size={18} color="#fff" />
          </button>
          <SidebarContent tab={tab} setTab={setTab} unlocked={unlocked} onLockClick={onLockClick} onSettingsClick={onSettingsClick} onNavigate={onCloseMobile} undoCount={undoCount} onUndoClick={onUndoClick} />
        </div>
      </div>
    </div>
  );
}

// ---------- Dashboard ----------
function Dashboard({ chantiers, rgDues, computed, setTab, setSelectedChantier }) {
  const { totalEnAttente, impayees, enRetard, totalRetard, chartData, rgAReclamerBientot, betARelancer } = computed;
  const chantiersDocsIncomplets = chantiers.filter((c) => missingDocuments(c).length > 0).length;
  const [showAllBet, setShowAllBet] = useState(false);
  return (
    <div className="p-4 max-w-6xl">
      <h1 className="text-xl font-semibold mb-1" style={{ color: COLORS.ink }}>Tableau de bord</h1>
      <p className="text-sm mb-5" style={{ color: COLORS.inkSoft }}>Vue d'ensemble des règlements clients et retenues de garantie</p>

      <ResponsiveGrid min={160} className="mb-6">
        <Card className="p-4">
          <div className="text-xs font-medium mb-1" style={{ color: COLORS.inkSoft }}>Total en attente</div>
          <div className="text-2xl font-semibold tabular-nums" style={{ color: COLORS.ink }}>{fmtEUR(totalEnAttente)}</div>
          <div className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>{impayees.length} situation(s) non réglée(s)</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium mb-1" style={{ color: COLORS.inkSoft }}>En retard (+60j)</div>
          <div className="text-2xl font-semibold tabular-nums" style={{ color: COLORS.red }}>{fmtEUR(totalRetard)}</div>
          <div className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>{enRetard.length} situation(s) à relancer</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium mb-1" style={{ color: COLORS.inkSoft }}>RG à réclamer (30j)</div>
          <div className="text-2xl font-semibold tabular-nums" style={{ color: COLORS.amber }}>{rgAReclamerBientot.length}</div>
          <div className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>échéance proche</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium mb-1" style={{ color: COLORS.inkSoft }}>Chantiers actifs</div>
          <div className="text-2xl font-semibold tabular-nums" style={{ color: COLORS.ink }}>{chantiers.length}</div>
          <div className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>tous clients confondus</div>
        </Card>
        <Card className="p-4" style={{ cursor: "pointer" }} onClick={() => setTab("documents")}>
          <div className="text-xs font-medium mb-1" style={{ color: COLORS.inkSoft }}>Documents contractuels</div>
          <div className="text-2xl font-semibold tabular-nums" style={{ color: chantiersDocsIncomplets > 0 ? COLORS.red : COLORS.green }}>{chantiersDocsIncomplets}</div>
          <div className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>chantier(s) incomplet(s)</div>
        </Card>
      </ResponsiveGrid>

      {enRetard.length > 0 && (
        <Card className="p-4 mb-6" style={{ borderColor: COLORS.redSoft, background: COLORS.redSoft }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} color={COLORS.red} />
            <span className="text-sm font-semibold" style={{ color: COLORS.red }}>Relances à effectuer</span>
          </div>
          <div className="flex flex-col gap-1">
            {enRetard.slice(0, 5).map((s) => (
              <div key={s.id} className="text-xs flex justify-between" style={{ color: COLORS.ink }}>
                <span>{s.chantierTitre} — facture {s.nFact || "—"} ({fmtDate(s.dateFacture)})</span>
                <span className="font-medium tabular-nums">{fmtEUR(s.totalARecevoir)}</span>
              </div>
            ))}
          </div>
          {enRetard.length > 5 && (
            <button onClick={() => setTab("reglements")} className="text-xs font-medium mt-2" style={{ color: COLORS.red }}>
              Voir les {enRetard.length} situations en retard →
            </button>
          )}
        </Card>
      )}

      {betARelancer.length > 0 && (
        <Card className="p-4 mb-6" style={{ borderColor: COLORS.amberSoft, background: COLORS.amberSoft }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} color={COLORS.amber} />
            <span className="text-sm font-semibold" style={{ color: COLORS.amber }}>Validations BET à relancer (envoyées depuis plus d'une semaine, sans réponse)</span>
          </div>
          <div className="flex flex-col gap-1">
            {betARelancer.slice(0, showAllBet ? betARelancer.length : 8).map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedChantier(s.chantierId); setTab("chantierDetail"); }}
                className="text-xs flex justify-between text-left hover:underline"
                style={{ color: COLORS.ink }}
              >
                <span>{s.chantierTitre} — facture {s.nFact || "—"} (envoyée le {fmtDate(s.dateEnvoi)})</span>
                <span className="font-medium tabular-nums" style={{ color: COLORS.amber }}>{daysSince(s.dateEnvoi)} j</span>
              </button>
            ))}
          </div>
          {betARelancer.length > 8 && (
            <button onClick={() => setShowAllBet(!showAllBet)} className="text-xs mt-2 font-medium hover:underline" style={{ color: COLORS.amber }}>
              {showAllBet ? "Réduire la liste" : `+ ${betARelancer.length - 8} autre(s) situation(s) en attente de validation BET`}
            </button>
          )}
        </Card>
      )}

      <Card className="p-4">
        <div className="text-sm font-semibold mb-3" style={{ color: COLORS.ink }}>Montant total facturé par mois</div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k€`} />
              <Tooltip formatter={(v) => fmtEUR(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.line}` }} />
              <Bar dataKey="total" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
// ---------- Reglements en attente ----------
function Reglements({ computed, unlocked, onMarkPaid, onMarkAddPaid, onMarkRgReceived, onDeleteRgEchue, setTab, setSelectedChantier, onCreateFactureSeule, onDeleteSituation }) {
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    const source = qLower
      ? computed.impayees.filter((s) =>
          (s.chantierTitre || "").toLowerCase().includes(qLower) ||
          (s.chantierClient || "").toLowerCase().includes(qLower) ||
          (s.chantierNChantier || "").toLowerCase().includes(qLower) ||
          (s.nFact || "").toLowerCase().includes(qLower)
        )
      : computed.impayees;
    const byMonth = {};
    for (const s of source) {
      const k = monthKey(s.dateFacture);
      if (!byMonth[k]) byMonth[k] = [];
      byMonth[k].push(s);
    }
    return Object.keys(byMonth).sort().map((k) => ({
      key: k,
      label: monthLabel(k),
      items: byMonth[k].sort((a, b) => (a.dateFacture || "").localeCompare(b.dateFacture || "")),
      total: byMonth[k].reduce((a, s) => a + (s.totalARecevoir || 0), 0),
    }));
  }, [computed.impayees, q]);

  // Regroupement par mois pour l'export PDF — indépendant de la recherche à l'écran (q),
  // pour que l'export "global" couvre bien tout, même si une recherche est active.
  const exportGroups = useMemo(() => {
    const byMonth = {};
    for (const s of computed.impayees) {
      const k = monthKey(s.dateFacture);
      if (!byMonth[k]) byMonth[k] = [];
      byMonth[k].push(s);
    }
    return Object.keys(byMonth).sort().map((k) => ({
      key: k,
      label: monthLabel(k),
      items: byMonth[k].sort((a, b) => (a.dateFacture || "").localeCompare(b.dateFacture || "")),
      total: byMonth[k].reduce((a, s) => a + (s.totalARecevoir || 0), 0),
    }));
  }, [computed.impayees]);

  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportPdfError, setExportPdfError] = useState("");
  const [exportSelectedMonths, setExportSelectedMonths] = useState([]);

  function openExportPanel() {
    setExportSelectedMonths(exportGroups.map((g) => g.key));
    setShowExportPanel(true);
  }

  function toggleExportMonth(key) {
    setExportSelectedMonths((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function exportReglementsPdf(selectedKeys) {
    const monthsToExport = exportGroups.filter((g) => selectedKeys.includes(g.key));
    if (!monthsToExport.length) return;
    setExportPdfError("");
    const grandTotal = monthsToExport.reduce((a, g) => a + g.total, 0);
    const isGlobal = selectedKeys.length === exportGroups.length;
    const periodLabel = isGlobal ? "Toutes échéances" : monthsToExport.map((g) => g.label).join(", ");
    const blocks = monthsToExport.map((g) => {
      const rows = g.items.map((s) => `<tr>
          <td>${s.chantierTitre || "—"}${s.chantierClient ? " — " + s.chantierClient : ""}</td>
          <td>${s.nSituation ?? "—"}</td><td>${s.nFact || "—"}</td><td>${fmtDate(s.dateFacture)}</td>
          <td style="text-align:right">${fmtEUR(s.totalARecevoir)}</td>
        </tr>`).join("");
      return `
        <div class="month-block">
          <div class="month-header"><span>${g.label}</span><span>${fmtEUR(g.total)}</span></div>
          <table><thead><tr><th>Client / Chantier</th><th>N° Sit.</th><th>N° Fact.</th><th>Date</th><th>À recevoir</th></tr></thead>
          <tbody>${rows}</tbody></table>
        </div>`;
    }).join("");
    const html = `
      <html><head><title>Règlements en attente — SYNERGIE BTP</title>
      <style>
        body{font-family:system-ui,sans-serif;color:#16233B;padding:32px;}
        .close-bar{position:sticky;top:0;z-index:10;background:linear-gradient(120deg,#16233B 0%,#22314D 100%);padding:10px 16px;margin:-32px -32px 24px -32px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px 16px;box-shadow:0 2px 10px rgba(22,35,59,0.25);}
        .close-bar-brand{display:flex;align-items:center;gap:10px;min-width:0;overflow:hidden;}
        .close-bar-brand img{height:22px;width:auto;display:block;flex-shrink:0;}
        .close-bar-label{color:rgba(255,255,255,0.55);font-size:10.5px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .close-bar-actions{display:flex;gap:8px;flex-shrink:0;margin-left:auto;}
        .print-btn{display:inline-flex;align-items:center;gap:6px;background:#2B6CB0;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 6px rgba(43,108,176,0.45);white-space:nowrap;}
        .close-btn{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:8px 12px;font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap;}
        @media (max-width:480px){
          .close-bar{padding:8px 12px;}
          .close-bar-label{display:none;}
          .close-bar-brand img{height:20px;}
          .print-btn,.close-btn{padding:7px 11px;font-size:12px;}
        }
        @media print { .close-bar{display:none;} .month-block{page-break-inside:avoid;} }
        .header{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #16233B;padding-bottom:16px;margin-bottom:20px;}
        .header img{height:34px;}
        .header .meta{text-align:right;font-size:11px;color:#5B6472;}
        h1{font-size:19px;margin:0 0 2px 0;}
        h2{font-size:13px;font-weight:500;color:#5B6779;margin:0 0 20px 0;}
        .grand-total{background:#DCE9F7;color:#16233B;border-radius:8px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;font-size:15px;font-weight:600;}
        .month-block{margin-bottom:22px;}
        .month-header{display:flex;justify-content:space-between;background:#F7F5EF;padding:8px 12px;font-size:12px;font-weight:600;border-radius:6px 6px 0 0;}
        table{width:100%;border-collapse:collapse;font-size:11px;}
        th,td{border:1px solid #ddd;padding:5px 7px;text-align:left;}
        th{background:#F7F5EF;}
        footer{margin-top:28px;font-size:10px;color:#9AA3B1;text-align:center;}
      </style></head><body>
      <div class="close-bar">
        <div class="close-bar-brand">
          <img src="${LOGO_SYNERGIE}" alt="SYNERGIE BTP" />
          <span class="close-bar-label">Aperçu avant impression</span>
        </div>
        <div class="close-bar-actions">
          <button class="print-btn" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
          <button class="close-btn" onclick="window.close()">✕ Fermer</button>
        </div>
      </div>
      <div class="header">
        <img src="${LOGO_SYNERGIE}" alt="SYNERGIE BTP" />
        <div class="meta">Édité le ${fmtDate(new Date().toISOString().slice(0, 10))}</div>
      </div>
      <h1>Règlements clients à recevoir</h1>
      <h2>${periodLabel}</h2>
      <div class="grand-total"><span>Total à recevoir</span><span>${fmtEUR(grandTotal)}</span></div>
      ${blocks}
      <footer>SYNERGIE BTP — Suivi Chantiers</footer>
      </body></html>
    `;
    const fileName = `Reglements_clients_${new Date().toISOString().slice(0, 10)}.pdf`;
    openPrintableDocument(html, { fileName, onError: setExportPdfError });
  }

  const [payingSituation, setPayingSituation] = useState(null);
  const [confirmDeleteSitId, setConfirmDeleteSitId] = useState(null);
  const [showFacture, setShowFacture] = useState(false);
  const [fClient, setFClient] = useState("");
  const [fNFact, setFNFact] = useState("");
  const [fDate, setFDate] = useState("");
  const [fMontant, setFMontant] = useState("");
  const [fTva, setFTva] = useState("085");

  function submitFacture() {
    if (!fClient.trim() || !fMontant) return;
    onCreateFactureSeule({
      titre: fClient.trim(), client: fClient.trim(), nFact: fNFact.trim(),
      dateFacture: fDate, montantHt: parseFloat(fMontant) || 0, tvaRegime: fTva,
    });
    setFClient(""); setFNFact(""); setFDate(""); setFMontant(""); setFTva("085"); setShowFacture(false);
  }

  return (
    <div className="p-4 max-w-6xl">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h1 className="text-xl font-semibold" style={{ color: COLORS.ink }}>Règlements clients à recevoir</h1>
        <div className="flex items-center gap-3">
          {unlocked && <Btn variant="ghost" size="sm" onClick={() => setShowFacture(true)}><Plus size={14} /> Facture seule</Btn>}
          <Btn variant="ghost" size="sm" onClick={openExportPanel}>Exporter PDF</Btn>
          <div className="text-sm font-semibold tabular-nums" style={{ color: COLORS.accent }}>{fmtEUR(computed.totalEnAttente)}</div>
        </div>
      </div>
      <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>Situations facturées et non réglées, groupées par mois de facturation</p>
      {exportPdfError && <p className="text-xs mb-3" style={{ color: COLORS.red }}>{exportPdfError}</p>}

      <div className="relative mb-2 max-w-sm">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" color={COLORS.inkSoft} />
        <TextInput placeholder="Rechercher un client, chantier, n° facture..." value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 28, width: "100%" }} />
      </div>
      {q.trim() && (
        <p className="text-sm mb-5" style={{ color: COLORS.ink }}>
          {groups.reduce((a, g) => a + g.items.length, 0)} résultat(s) — total <span className="font-semibold" style={{ color: COLORS.accent }}>{fmtEUR(groups.reduce((a, g) => a + g.total, 0))}</span>
        </p>
      )}
      {!q.trim() && <div className="mb-5" />}

      {showFacture && (
        <Card className="p-4 mb-5" style={{ background: COLORS.accentSoft }}>
          <p className="text-xs font-medium mb-3" style={{ color: COLORS.inkSoft }}>
            Pour un petit travaux ponctuel facturé en une fois — crée directement la facture sans avoir à configurer un marché.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Nom client"><TextInput value={fClient} onChange={(e) => setFClient(e.target.value)} /></Field>
            <Field label="N° facture"><TextInput value={fNFact} onChange={(e) => setFNFact(e.target.value)} /></Field>
            <Field label="Date facture"><TextInput type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} /></Field>
            <Field label="Montant HT"><TextInput type="number" step="0.01" value={fMontant} onChange={(e) => setFMontant(e.target.value)} /></Field>
            <Field label="Régime TVA">
              <select value={fTva} onChange={(e) => setFTva(e.target.value)} style={inputStyle} className="outline-none focus:ring-2">
                <option value="085">8,5 %</option>
                <option value="021">2,1 %</option>
                <option value="autoliq">Autoliquidée (0 %)</option>
              </select>
            </Field>
            <Btn variant="primary" onClick={submitFacture}>Créer la facture</Btn>
            <Btn variant="ghost" onClick={() => setShowFacture(false)}>Annuler</Btn>
          </div>
        </Card>
      )}

      {showExportPanel && (
        <Card className="p-4 mb-5" style={{ background: COLORS.accentSoft }}>
          <p className="text-xs font-medium mb-3" style={{ color: COLORS.inkSoft }}>
            Choisis les mois à inclure dans le PDF (tous cochés par défaut = export global).
          </p>
          {exportGroups.length === 0 ? (
            <p className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>Aucun règlement en attente à exporter.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {exportGroups.map((g) => {
                const checked = exportSelectedMonths.includes(g.key);
                return (
                  <label
                    key={g.key}
                    className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md cursor-pointer capitalize"
                    style={{ background: checked ? COLORS.paper : "#F0EEE6", border: `1px solid ${checked ? COLORS.accent : COLORS.line}` }}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleExportMonth(g.key)} />
                    {g.label} <span style={{ color: COLORS.inkSoft }}>({fmtEUR(g.total)})</span>
                  </label>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <Btn variant="primary" disabled={exportSelectedMonths.length === 0} onClick={() => { exportReglementsPdf(exportSelectedMonths); setShowExportPanel(false); }}>
              Générer le PDF
            </Btn>
            <Btn variant="ghost" onClick={() => setShowExportPanel(false)}>Annuler</Btn>
            {exportGroups.length > 0 && (
              <button
                type="button"
                className="text-xs underline"
                style={{ color: COLORS.inkSoft }}
                onClick={() => setExportSelectedMonths(exportSelectedMonths.length === exportGroups.length ? [] : exportGroups.map((g) => g.key))}
              >
                {exportSelectedMonths.length === exportGroups.length ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            )}
          </div>
        </Card>
      )}

      {groups.length === 0 && (
        <Card className="p-8 text-center text-sm" style={{ color: COLORS.inkSoft }}>{q.trim() ? "Aucun résultat pour cette recherche" : "Aucun règlement en attente 🎉"}</Card>
      )}

      <div className="flex flex-col gap-5">
        {groups.map((g) => (
          <Card key={g.key} className="overflow-hidden">
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "#F7F5EF", borderBottom: `1px solid ${COLORS.line}` }}>
              <span className="text-sm font-semibold capitalize" style={{ color: COLORS.ink }}>{g.label}</span>
              <span className="text-sm font-semibold tabular-nums" style={{ color: COLORS.ink }}>{fmtEUR(g.total)}</span>
            </div>
            <div style={{ overflowX: "auto" }}>
            <table className="text-xs" style={{ width: "100%", minWidth: 720 }}>
              <thead>
                <tr style={{ color: COLORS.inkSoft }}>
                  <th className="text-left font-medium px-4 py-2">Client / Chantier</th>
                  <th className="text-left font-medium px-2 py-2">N° Sit.</th>
                  <th className="text-left font-medium px-2 py-2">N° Fact.</th>
                  <th className="text-left font-medium px-2 py-2">Date</th>
                  <th className="text-right font-medium px-2 py-2">À recevoir</th>
                  <th className="text-left font-medium px-2 py-2">Retard</th>
                  {unlocked && <th className="px-4 py-2"></th>}
                </tr>
              </thead>
              <tbody>
                {g.items.map((s) => {
                  const retard = joursRetardReglement(s);
                  return (
                    <tr key={s.id} style={{ borderTop: `1px solid ${COLORS.line}`, background: s.isADDPending ? "#FBF8F0" : s.isRgPending ? "#F5F3FF" : s.isMarcheSoldePending ? "#FEF2F2" : undefined }}>
                      <td className="px-4 py-2">
                        {s.isRgPending ? (
                          <button className="font-medium hover:underline text-left" style={{ color: "#8B5CF6" }} onClick={() => setTab("rg")}>
                            {s.chantierTitre}
                          </button>
                        ) : (
                          <button className="font-medium hover:underline text-left" style={{ color: COLORS.accent }} onClick={() => { setSelectedChantier(s.chantierId); setTab("chantierDetail"); }}>
                            {s.chantierTitre}
                          </button>
                        )}
                        {s.isMarcheSoldePending && <div className="text-xs font-normal" style={{ color: COLORS.inkSoft }}>{s.marcheNom}</div>}
                      </td>
                      <td className="px-2 py-2" style={{ color: COLORS.ink }}>{s.nSituation ?? "—"}</td>
                      <td className="px-2 py-2" style={{ color: COLORS.ink, fontWeight: (s.isADDPending || s.isRgPending || s.isMarcheSoldePending) ? 600 : 400 }}>{s.nFact || "—"}</td>
                      <td className="px-2 py-2" style={{ color: COLORS.ink }}>{fmtDate(s.dateFacture)}</td>
                      <td className="px-2 py-2 text-right font-medium tabular-nums" style={{ color: COLORS.ink }}>
                        {fmtEUR(s.totalARecevoir)}
                        {s.totalARecevoirOriginal != null ? <div className="text-xs font-normal" style={{ color: COLORS.inkSoft }}>reste sur {fmtEUR(s.totalARecevoirOriginal)}</div> : null}
                      </td>
                      <td className="px-2 py-2" title={s.isMarcheSoldePending ? "Écart net entre le total facturé et les règlements reçus sur ce marché (compense les trop-perçus et manques entre situations déjà réglées) — à corriger situation par situation depuis la fiche chantier" : s.isADDPending ? "Avance de démarrage non encore réglée" : s.isRgPending ? "RG échue, validation BET obtenue, en attente de réclamation" : "Échéance = date de validation BET + 30 jours"}>
                        {s.isMarcheSoldePending ? (
                          <Pill color="red">solde net du marché</Pill>
                        ) : s.totalARecevoirOriginal != null ? (
                          <Pill color="amber">partiel</Pill>
                        ) : s.isADDPending ? (
                          <Pill color="amber">avance de démarrage</Pill>
                        ) : s.isRgPending ? (
                          <Pill color="purple">RG à réclamer</Pill>
                        ) : !s.validBet ? (
                          <Pill>validation BET en attente</Pill>
                        ) : retard > 0 ? (
                          <Pill color="red">{retard} j de retard</Pill>
                        ) : retard > -7 ? (
                          <Pill color="amber">échéance dans {Math.abs(retard)} j</Pill>
                        ) : (
                          <Pill color="green">à jour</Pill>
                        )}
                      </td>
                      {unlocked && (
                        <td className="px-4 py-2">
                          <div className="flex gap-1 justify-end items-center">
                            {s.isMarcheSoldePending ? null : s.isADDPending ? (
                              <Btn size="sm" variant="accent" onClick={() => setPayingSituation(s)}>
                                <Check size={12} /> Marquer réglée
                              </Btn>
                            ) : s.isRgPending ? (
                              confirmDeleteSitId === s.id ? (
                                <>
                                  <span className="text-xs" style={{ color: COLORS.red }}>Confirmer ?</span>
                                  <button title="Oui, supprimer cette ligne de RG" onClick={() => { onDeleteRgEchue(s.rgEchueId); setConfirmDeleteSitId(null); }} className="p-1.5 rounded" style={{ background: COLORS.red }}>
                                    <Check size={12} color="#fff" />
                                  </button>
                                  <button title="Annuler" onClick={() => setConfirmDeleteSitId(null)} className="p-1.5 rounded" style={{ background: "#F0EEE6" }}>
                                    <X size={12} color={COLORS.inkSoft} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <Btn size="sm" variant="accent" onClick={() => setPayingSituation(s)}>
                                    <Check size={12} /> Marquer réglée
                                  </Btn>
                                  <button title="Supprimer cette ligne de RG" onClick={() => setConfirmDeleteSitId(s.id)} className="p-1.5 rounded" style={{ background: COLORS.redSoft }}>
                                    <X size={12} color={COLORS.red} />
                                  </button>
                                </>
                              )
                            ) : confirmDeleteSitId === s.id ? (
                              <>
                                <span className="text-xs" style={{ color: COLORS.red }}>Confirmer ?</span>
                                <button title="Oui, supprimer" onClick={() => { onDeleteSituation(s.chantierId, s.id); setConfirmDeleteSitId(null); }} className="p-1.5 rounded" style={{ background: COLORS.red }}>
                                  <Check size={12} color="#fff" />
                                </button>
                                <button title="Annuler" onClick={() => setConfirmDeleteSitId(null)} className="p-1.5 rounded" style={{ background: "#F0EEE6" }}>
                                  <X size={12} color={COLORS.inkSoft} />
                                </button>
                              </>
                            ) : (
                              <>
                                <Btn size="sm" variant="accent" onClick={() => setPayingSituation(s)}>
                                  <Check size={12} /> Marquer réglé
                                </Btn>
                                <button title="Supprimer cette facture/situation" onClick={() => setConfirmDeleteSitId(s.id)} className="p-1.5 rounded" style={{ background: COLORS.redSoft }}>
                                  <X size={12} color={COLORS.red} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </Card>
        ))}
      </div>

      {payingSituation && (
        <MarkPaidModal
          defaultDate={new Date().toISOString().slice(0, 10)}
          defaultMontant={payingSituation.totalARecevoir}
          alreadyPaid={false}
          onClose={() => setPayingSituation(null)}
          onConfirm={(date, montant) => {
            if (payingSituation.isADDPending) {
              onMarkAddPaid(payingSituation.chantierId, payingSituation.marcheId, date);
            } else if (payingSituation.isRgPending) {
              onMarkRgReceived(payingSituation.rgEchueId, date, montant);
            } else {
              onMarkPaid(payingSituation.chantierId, payingSituation.id, date, montant);
            }
            setPayingSituation(null);
          }}
        />
      )}
    </div>
  );
}

// ---------- Chantiers list ----------
// archivedOnly bascule entre la liste des chantiers actifs (onglet "Chantiers")
// et celle des chantiers clôturés (onglet "Archives" à part dans le menu de
// gauche) — les deux réutilisent ce même composant plutôt que de dupliquer le
// tableau, seul le filtre et les libellés changent.
function ChantiersList({ chantiers, setTab, setSelectedChantier, unlocked, onCreateChantier, onArchiveChantier, onDeleteChantier, archivedOnly = false }) {
  const [q, setQ] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newTitre, setNewTitre] = useState("");
  const [newClient, setNewClient] = useState("");
  const showArchived = archivedOnly;
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const facturesLibres = chantiers.find((c) => c.isFacturesLibres);
  const base = chantiers.filter((c) => !c.isFacturesLibres && !!c.archived === showArchived);
  const archivedCount = chantiers.filter((c) => !c.isFacturesLibres && c.archived).length;
  const filtered = base.filter((c) =>
    (c.titre || "").toLowerCase().includes(q.toLowerCase()) ||
    (c.client || "").toLowerCase().includes(q.toLowerCase()) ||
    (c.nChantier || "").toLowerCase().includes(q.toLowerCase())
  ).sort((a, b) => (a.titre || "").localeCompare(b.titre || ""));

  function submitNew() {
    if (!newTitre.trim()) return;
    onCreateChantier({ titre: newTitre.trim(), client: newClient.trim() });
    setNewTitre(""); setNewClient(""); setShowNew(false);
  }


  return (
    <div className="p-4 max-w-6xl">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h1 className="text-xl font-semibold" style={{ color: COLORS.ink }}>{showArchived ? "Archives" : "Chantiers"}</h1>
        {unlocked && !showArchived && (
          <div className="flex gap-2">
            <Btn variant="primary" onClick={() => setShowNew(true)}><Plus size={14} /> Nouveau chantier</Btn>
          </div>
        )}
      </div>
      <p className="text-sm mb-4" style={{ color: COLORS.inkSoft }}>
        {showArchived ? (
          <button className="hover:underline" style={{ color: COLORS.accent }} onClick={() => setTab("chantiers")}>← retour aux chantiers actifs</button>
        ) : (
          <>
            {filtered.length} chantiers suivis
            {facturesLibres && (
              <> · <button className="hover:underline" style={{ color: COLORS.accent }} onClick={() => { setSelectedChantier("factures-libres"); setTab("chantierDetail"); }}>voir les {facturesLibres.marches.length} facture(s) ponctuelle(s)</button></>
            )}
            {archivedCount > 0 && (
              <> · <button className="hover:underline" style={{ color: COLORS.inkSoft }} onClick={() => setTab("archives")}>Archives ({archivedCount})</button></>
            )}
          </>
        )}
      </p>

      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" color={COLORS.inkSoft} />
        <TextInput placeholder="Rechercher un client, chantier..." value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 28, width: "100%" }} />
      </div>

      {showNew && (
        <Card className="p-4 mb-4 flex flex-wrap items-end gap-3" style={{ background: COLORS.accentSoft }}>
          <Field label="Nom du chantier"><TextInput value={newTitre} onChange={(e) => setNewTitre(e.target.value)} placeholder="Ex. RESIDENCE LES PALMES" /></Field>
          <Field label="Client"><TextInput value={newClient} onChange={(e) => setNewClient(e.target.value)} placeholder="Ex. SCI DUPONT" /></Field>
          <Btn variant="primary" onClick={submitNew}>Créer</Btn>
          <Btn variant="ghost" onClick={() => setShowNew(false)}>Annuler</Btn>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div style={{ overflowX: "auto" }}>
        <table className="text-xs" style={{ width: "100%", minWidth: 780 }}>
          <thead>
            <tr style={{ color: COLORS.inkSoft, background: "#F7F5EF" }}>
              <th className="text-left font-medium px-4 py-2.5">Chantier</th>
              <th className="text-left font-medium px-2 py-2.5">Client</th>
              <th className="text-left font-medium px-2 py-2.5">N° chantier</th>
              <th className="text-right font-medium px-2 py-2.5">Marché HT</th>
              <th className="text-right font-medium px-2 py-2.5">Facturé</th>
              <th className="text-right font-medium px-2 py-2.5">En attente</th>
              <th className="text-left font-medium px-4 py-2.5">Situations</th>
              {unlocked && <th className="px-3 py-2.5"></th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center" style={{ color: COLORS.inkSoft }}>{showArchived ? "Aucun chantier archivé" : "Aucun chantier"}</td></tr>
            )}
            {filtered.map((c) => {
              const facture = c.situations.reduce((a, s) => a + (s.montantHt || 0), 0);
              const attente = soldeAttenteChantier(c.situations);
              return (
                <tr key={c.id} style={{ borderTop: `1px solid ${COLORS.line}`, cursor: "pointer" }} onClick={() => { setSelectedChantier(c.id); setTab("chantierDetail"); }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: COLORS.accent }}>{c.titre}</td>
                  <td className="px-2 py-2.5" style={{ color: COLORS.ink }}>{c.client || "—"}</td>
                  <td className="px-2 py-2.5" style={{ color: COLORS.inkSoft }}>{c.nChantier || "—"}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums" style={{ color: COLORS.ink }}>{fmtEUR((c.marches || []).reduce((a, m) => a + (m.montantHt || 0), 0))}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums" style={{ color: COLORS.ink }}>{fmtEUR(facture)}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums font-medium" style={{ color: attente > 0 ? COLORS.amber : COLORS.green }}>{fmtEUR(attente)}</td>
                  <td className="px-4 py-2.5" style={{ color: COLORS.inkSoft }}>{c.situations.length}</td>
                  {unlocked && (
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1 justify-end items-center" onClick={(e) => e.stopPropagation()}>
                        <button title={showArchived ? "Désarchiver" : "Archiver"} onClick={() => onArchiveChantier(c.id, !showArchived)} className="p-1 rounded" style={{ background: COLORS.accentSoft }}>
                          {showArchived ? <Unlock size={12} color={COLORS.accent} /> : <Lock size={12} color={COLORS.accent} />}
                        </button>
                        {confirmDeleteId === c.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs" style={{ color: COLORS.red }}>Confirmer ?</span>
                            <button title="Oui, supprimer" onClick={() => { onDeleteChantier(c.id); setConfirmDeleteId(null); }} className="p-1 rounded" style={{ background: COLORS.red }}>
                              <Check size={12} color="#fff" />
                            </button>
                            <button title="Annuler" onClick={() => setConfirmDeleteId(null)} className="p-1 rounded" style={{ background: "#F0EEE6" }}>
                              <X size={12} color={COLORS.inkSoft} />
                            </button>
                          </div>
                        ) : (
                          <button title="Supprimer" onClick={() => setConfirmDeleteId(c.id)} className="p-1 rounded" style={{ background: COLORS.redSoft }}>
                            <X size={12} color={COLORS.red} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
            </div>
      </Card>
    </div>
  );
}
// ---------- Chantier detail ----------
const TVA_REGIMES = {
  "085": { label: "8,5 %", rate: 0.085 },
  "021": { label: "2,1 %", rate: 0.021 },
  "autoliq": { label: "Autoliquidée (0 %)", rate: 0 },
};

const emptySituation = () => ({
  id: uid("sit"), nSituation: "", nFact: "", dateFacture: "", pctAvancement: "",
  montantHt: "", tva: "", montantTtc: "", rg: "", avanceDeduite: "", prorata: "", rembAdd: "",
  fournisseurs: [], totalARecevoir: "", dateEnvoi: "", validBet: "", validAmo: "", validAutre: "", datePaiement: "", montantRegle: "", dateDepotChorus: "", paye: false, note: "",
  // Les 2 PDF déposés sur les bulles à côté de cette situation (voir la
  // colonne "PDF" du tableau des situations) : "recap" (le Récapitulatif de
  // facturation — c'est sur celui-là que la répartition de règlement est
  // ajoutée automatiquement) et "avancement" (le document d'avancement).
  // Deux emplacements nommés et bien séparés, pour ne plus jamais qu'un
  // dépôt écrase l'autre — chacun a la même forme que les documents de
  // chantier ({ present, fileName, filePath, uploadedAt }).
  situationDocs: { recap: null, avancement: null, ea: null, facture: null },
  // Factures fournisseurs en cession déposées sur cette situation : une
  // LISTE (pas un simple slot unique comme situationDocs) car il peut y en
  // avoir plusieurs, un dépôt ne doit jamais écraser les précédents — chaque
  // entrée { id, fileName, filePath, uploadedAt }.
  fournisseurFactures: [],
});

function ChantierDetail({ chantier, updateChantier, unlocked, setTab, onArchiveChantier, sousTraitants, onAddSousTraitant }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptySituation());
  const [headerEdit, setHeaderEdit] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [payingSituation, setPayingSituation] = useState(null);
  const [uploadingDocKey, setUploadingDocKey] = useState(null);
  const [dragOverDocKey, setDragOverDocKey] = useState(null);
  const [docError, setDocError] = useState("");
  const [pendingUploadKey, setPendingUploadKey] = useState(null);
  const docFileInputRef = useRef(null);
  // 2 bulles PDF à côté de chaque ligne de situation (marché principal, TS,
  // Prorata) — "recap" (Récapitulatif) et "avancement" — même principe que
  // les bulles documents ci-dessus, mais une paire par situation au lieu
  // d'une par chantier. uploadingSituationDocId/dragOverSituationId portent
  // une clé composite "<situationId>:<docType>" pour distinguer les deux
  // bulles d'une même situation ; pendingSituationUploadId porte
  // { situationId, docType }.
  const [uploadingSituationDocId, setUploadingSituationDocId] = useState(null);
  const [dragOverSituationId, setDragOverSituationId] = useState(null);
  const [situationDocError, setSituationDocError] = useState("");
  const [pendingSituationUploadId, setPendingSituationUploadId] = useState(null);
  const situationDocFileInputRef = useRef(null);
  // Bulle "factures fournisseurs cédées" à côté de chaque situation : à la
  // différence des bulles ci-dessus (un seul PDF par emplacement, remplacé à
  // chaque dépôt), celle-ci accepte PLUSIEURS fichiers — un dépôt s'AJOUTE
  // toujours à la liste (situation.fournisseurFactures), il n'écrase jamais
  // les précédents. Une seule bulle pour tous les fournisseurs confondus.
  const [pendingFournisseurFactureSituationId, setPendingFournisseurFactureSituationId] = useState(null);
  const fournisseurFactureFileInputRef = useRef(null);
  const [openFournisseurFacturesId, setOpenFournisseurFacturesId] = useState(null);
  const [exportPdfError, setExportPdfError] = useState("");
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [emailNotice, setEmailNotice] = useState("");
  // Bloc "Sous-traitance" : formulaire inline "+ Nouveau sous-traitant"
  // ouvert sous une entrée précise (id de l'entrée sousTraitance concernée,
  // ou null si fermé) quand elle ne trouve pas son entreprise dans le
  // répertoire global et veut l'ajouter à la volée.
  const [addingSousTraitantForEntryId, setAddingSousTraitantForEntryId] = useState(null);
  const [newSousTraitantNom, setNewSousTraitantNom] = useState("");
  // Lecture automatique (IA) d'un devis signé / acte d'engagement / contrat
  // de sous-traitance à l'upload, pour proposer un pré-remplissage de la
  // fiche chantier. `docAnalysis` porte le résultat de la dernière lecture
  // en attente de validation ; rien n'est appliqué sans clic explicite.
  const [analyzingDoc, setAnalyzingDoc] = useState(false);
  const [docAnalysisError, setDocAnalysisError] = useState("");
  const [docAnalysis, setDocAnalysis] = useState(null); // { docKey, extracted, selected }

  function updateHeaderField(patch) {
    updateChantier({ ...chantier, ...patch });
  }

  function num(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }

  function getMarche(marcheId) {
    return chantier.marches.find((m) => m.id === marcheId) || chantier.marches[0] || null;
  }

  // % d'avancement cumulé d'un marché/TS : somme du montant HT de la
  // situation en cours ET de toutes celles qui la PRÉCÈDENT dans ce marché
  // (jamais celles qui viennent après), rapportée au montant HT total du
  // marché. L'ordre est donné par le n° de situation (le champ "N°
  // situation"), et par la date de facture en repli quand le n° est
  // identique ou pas encore renseigné.
  //
  // Avant : la fonction sommait TOUTES les autres situations du marché sans
  // distinguer avant/après, donc chaque situation affichait le même total
  // (= facturé cumulé sur tout le marché), y compris en comptant des
  // situations postérieures pas encore arrivées à ce stade — d'où le "ça se
  // cumule à 100 % à chaque fois" remonté.
  // Délègue au calcul canonique partagé (computeCumulativeHtBySituation) en
  // simulant la situation en cours d'édition dans le formulaire (elle n'est
  // pas encore, ou plus à jour, dans chantier.situations à ce stade) — ainsi
  // le cumul affiché en direct pendant la saisie est TOUJOURS identique à ce
  // qui sera affiché dans le tableau une fois enregistré, y compris pour les
  // situations à égalité de rang (même n° / même date).
  function cumulativeMontantHt(marcheId, ownHt, excludeId, ownSituation) {
    const candidate = { ...(ownSituation || {}), id: excludeId || "__preview__", marcheId, montantHt: ownHt };
    const others = chantier.situations.filter((s) => s.marcheId === marcheId && s.id !== excludeId);
    const { cumulMap } = computeCumulativeHtBySituation([...others, candidate], chantier.marches);
    return cumulMap.get(candidate.id) || 0;
  }

  function autoCalc(f) {
    const marche = getMarche(f.marcheId) || {};
    const ht = num(f.montantHt);
    const regime = TVA_REGIMES[marche.tvaRegime] ? marche.tvaRegime : "085";
    const tva = Math.round(ht * TVA_REGIMES[regime].rate * 100) / 100;
    const ttc = Math.round((ht + tva) * 100) / 100;
    const rgOff = marche.rgMode === "banque" || marche.rgMode === "aucune";
    const rgPct = typeof marche.rgPct === "number" ? marche.rgPct : 0.05;
    const rg = rgOff ? 0 : (f.rg !== "" ? num(f.rg) : Math.round(ttc * rgPct * 100) / 100);
    const prorata = num(f.prorata);
    const remb = num(f.rembAdd);
    const fournisseurs = (f.fournisseurs || []).map((x) => ({ nom: x.nom || "", montant: num(x.montant) })).filter((x) => x.nom || x.montant);
    const fournisseurTotal = fournisseurs.reduce((a, x) => a + x.montant, 0);
    const total = f.totalARecevoir !== "" ? num(f.totalARecevoir) : Math.round((ttc - rg - prorata - remb - fournisseurTotal) * 100) / 100;
    const paye = f.datePaiement ? true : !!f.paye;
    const montantRegle = f.montantRegle !== "" && f.montantRegle != null ? num(f.montantRegle) : (f.montantRegle === "" ? null : f.montantRegle);
    const marcheHt = num(marche.montantHt);
    const cumulHt = cumulativeMontantHt(marche.id || f.marcheId, ht, f.id, f);
    const pctAvancement = marcheHt ? Math.round((cumulHt / marcheHt) * 1000) / 1000 : 0;
    const nSituation = f.nSituation === "" || f.nSituation === null || f.nSituation === undefined ? f.nSituation : num(f.nSituation);
    // Les champs numériques doivent impérativement être castés en Number ici (et
    // non simplement propagés via ...f) : ils arrivent en string depuis les
    // <input type="number">, et une string "additionnée" à un total numérique
    // fait une concaténation silencieuse (ex. 0 + "29745.44" = "029745.44"),
    // ce qui casse tous les totaux du chantier en aval et l'affichage en €.
    return {
      ...f,
      marcheId: marche.id || f.marcheId,
      nSituation,
      montantHt: ht,
      pctAvancement,
      tva,
      montantTtc: ttc,
      rg,
      prorata,
      rembAdd: remb,
      fournisseurs,
      totalARecevoir: total,
      paye,
      montantRegle,
    };
  }

  function openNew(marcheId) {
    // Chaque bloc (marché principal, chaque TS, chaque PRORATA) a sa PROPRE
    // numérotation indépendante repartant à 1 — un nouveau TS ne continue
    // JAMAIS la numérotation du marché principal ni d'un TS précédent. Pour
    // un bloc PRORATA le champ n'est de toute façon pas affiché (voir plus
    // bas), donc peu importe ce qu'on calcule ici pour ce cas.
    const targetMarcheId = marcheId || chantier.marches[0]?.id || "";
    const sitsDuBloc = chantier.situations.filter((s) => s.marcheId === targetMarcheId);
    const nextNum = sitsDuBloc.length ? Math.max(...sitsDuBloc.map((s) => (typeof s.nSituation === "number" ? s.nSituation : 0))) + 1 : 1;
    setForm({ ...emptySituation(), nSituation: nextNum, marcheId: targetMarcheId });
    setEditingId(null);
    setShowForm(true);
  }
  function openEdit(s) {
    const merged = { ...emptySituation(), ...s, fournisseurs: (s.fournisseurs && s.fournisseurs.length ? s.fournisseurs : []) };
    setForm(Object.fromEntries(Object.entries(merged).map(([k, v]) => [k, v === null ? "" : v])));
    setEditingId(s.id);
    setShowForm(true);
  }

  function addFournisseurRow() {
    setFormAuto({ fournisseurs: [...(form.fournisseurs || []), { nom: "", montant: "" }] });
  }
  function updateFournisseurRow(idx, field, value) {
    const next = [...form.fournisseurs];
    next[idx] = { ...next[idx], [field]: value };
    setFormAuto({ fournisseurs: next });
  }
  function removeFournisseurRow(idx) {
    setFormAuto({ fournisseurs: form.fournisseurs.filter((_, i) => i !== idx) });
  }

  // Le montant à recevoir se recalcule automatiquement (TTC − RG − Prorata − Cession
  // fournisseur − Avance/Remb ADD) dès qu'un de ces éléments change sur la situation.
  function computeAutoTotal(f) {
    const selMarcheCalc = getMarche(f.marcheId || chantier.marches[0]?.id) || {};
    const rate = TVA_REGIMES[selMarcheCalc.tvaRegime]?.rate ?? 0.085;
    const ht = num(f.montantHt);
    const ttc = Math.round((ht + ht * rate) * 100) / 100;
    const rgOff = selMarcheCalc.rgMode === "banque" || selMarcheCalc.rgMode === "aucune";
    const rgPct = typeof selMarcheCalc.rgPct === "number" ? selMarcheCalc.rgPct : 0.05;
    const rg = rgOff ? 0 : (f.rg !== "" ? num(f.rg) : Math.round(ttc * rgPct * 100) / 100);
    const prorata = num(f.prorata);
    const fournisseurTotal = (f.fournisseurs || []).reduce((a, x) => a + (num(x.montant) || 0), 0);
    const remb = num(f.rembAdd);
    return Math.round((ttc - rg - prorata - fournisseurTotal - remb) * 100) / 100;
  }
  function setFormAuto(patch) {
    const next = { ...form, ...patch };
    next.totalARecevoir = computeAutoTotal(next);
    setForm(next);
  }

  function submitForm() {
    const calced = autoCalc(form);
    let situations;
    if (editingId) {
      situations = chantier.situations.map((s) => (s.id === editingId ? { ...calced, id: editingId } : s));
    } else {
      situations = [...chantier.situations, { ...calced, id: uid("sit") }];
    }
    updateChantier({ ...chantier, situations });
    setShowForm(false);
    setEditingId(null);
  }

  function deleteSituation(id) {
    updateChantier({ ...chantier, situations: chantier.situations.filter((s) => s.id !== id) });
  }

  function confirmPaid(situationId, date, montant) {
    const situations = chantier.situations.map((x) => {
      if (x.id !== situationId) return x;
      if (x.paye) {
        // Correction d'un règlement déjà soldé : le montant saisi remplace le total reçu.
        const total = montant != null ? montant : x.totalARecevoir;
        const solde = Math.round(((x.totalARecevoir || 0) - total) * 100) / 100;
        return { ...x, datePaiement: date, montantRegle: total, paye: solde <= 0.01 };
      }
      // Nouveau règlement (total ou partiel) : le montant saisi s'ajoute à ce qui a déjà été reçu.
      const dejaRecu = x.montantRegle || 0;
      const montantCePaiement = montant != null ? montant : Math.max(0, (x.totalARecevoir || 0) - dejaRecu);
      const totalRecu = Math.round((dejaRecu + montantCePaiement) * 100) / 100;
      const solde = Math.round(((x.totalARecevoir || 0) - totalRecu) * 100) / 100;
      return { ...x, datePaiement: date, montantRegle: totalRecu, paye: solde <= 0.01 };
    });
    updateChantier({ ...chantier, situations });
    setPayingSituation(null);
  }

  function unmarkPaid(situationId) {
    const situations = chantier.situations.map((x) => x.id === situationId ? { ...x, datePaiement: null, montantRegle: null, paye: false } : x);
    updateChantier({ ...chantier, situations });
    setPayingSituation(null);
  }


  const emptyMarche = () => ({
    // Numéroté parmi les TS existants uniquement (le marché principal ne compte pas comme
    // "TS 1") : le tout premier TS ajouté doit s'appeler "TS 1", pas "TS 2".
    id: uid("marche"), nom: "TS " + (chantier.marches.filter((m) => m.type === "ts").length + 1), description: "", montantHt: "", tauxTva: 0.085,
    rgMode: "5pct", rgPct: 0.05, prorataPct: "", addMontant: "", addDate: "", tvaRegime: "085",
    type: "ts",
  });

  function addMarche() {
    updateChantier({ ...chantier, marches: [...chantier.marches, emptyMarche()] });
  }
  function addProrataBloc() {
    const n = chantier.marches.filter((m) => m.type === "prorata").length + 1;
    updateChantier({ ...chantier, marches: [...chantier.marches, { ...emptyMarche(), nom: "PRORATA" + (n > 1 ? " " + n : ""), type: "prorata" }] });
  }
  function updateMarche(id, patch) {
    updateChantier({ ...chantier, marches: chantier.marches.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  }
  function removeMarche(id) {
    if (chantier.marches.length <= 1) return;
    const stillUsed = chantier.situations.some((s) => s.marcheId === id);
    if (stillUsed && !window.confirm("Des situations sont rattachées à ce marché/TS. Le supprimer quand même ?")) return;
    updateChantier({ ...chantier, marches: chantier.marches.filter((m) => m.id !== id) });
  }
  function addChantierFournisseur() {
    updateChantier({ ...chantier, fournisseurs: [...(chantier.fournisseurs || []), { id: uid("fourn"), nom: "", enveloppe: "" }], cessionPaiement: "OUI" });
  }
  function updateChantierFournisseur(idx, field, value) {
    const next = [...(chantier.fournisseurs || [])];
    next[idx] = { ...next[idx], [field]: value };
    updateChantier({ ...chantier, fournisseurs: next });
  }
  function removeChantierFournisseur(idx) {
    updateChantier({ ...chantier, fournisseurs: (chantier.fournisseurs || []).filter((_, i) => i !== idx) });
  }
  function montantUtiliseFournisseur(nom) {
    const key = (nom || "").trim().toLowerCase();
    if (!key) return 0;
    return chantier.situations.reduce((a, s) => a + (s.fournisseurs || []).reduce((a2, f) => a2 + ((f.nom || "").trim().toLowerCase() === key ? (f.montant || 0) : 0), 0), 0);
  }
  // Petite bulle PDF pour l'acte de cession d'un fournisseur cessionnaire —
  // même mécanique visuelle que les bulles Récap/Avancement/EA/Facture des
  // situations, mais réutilise le système générique de documents CHANTIER
  // (chantier.documents / getDocMeta / uploadDocument / removeDocument /
  // openDocument / triggerDocUpload, définis plus bas dans ce composant —
  // ce sont des déclarations "function", donc hissées, donc appelables ici)
  // puisque l'acte de cession est un document par FOURNISSEUR, pas par
  // situation. Toujours consultable (ouverture du PDF déjà déposé) même en
  // lecture seule — seuls le dépôt/remplacement/suppression sont réservés au
  // mode édition.
  function renderFournisseurCessionBubble(f) {
    const docs = chantier.documents || {};
    const key = "fournisseur-cession-" + (f.id || f.nom);
    const meta = getDocMeta(docs, key);
    const isUploading = uploadingDocKey === key;
    const isDragOver = dragOverDocKey === key;
    const clickable = !isUploading && (meta.present || unlocked);
    return (
      <div
        key={key}
        onDragOver={(e) => { if (!unlocked || isUploading) return; e.preventDefault(); setDragOverDocKey(key); }}
        onDragLeave={() => setDragOverDocKey((k) => (k === key ? null : k))}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverDocKey((k) => (k === key ? null : k));
          if (!unlocked || isUploading) return;
          const file = e.dataTransfer.files && e.dataTransfer.files[0];
          if (file) uploadDocument(key, file);
        }}
        onClick={() => {
          if (isUploading) return;
          if (meta.present) { openDocument(key); return; }
          if (unlocked) triggerDocUpload(key);
        }}
        title={`Acte de cession${meta.present ? " — " + (meta.fileName || "cliquer pour ouvrir") : unlocked ? " — cliquer ou glisser-déposer le PDF ici" : " — aucun PDF déposé"}`}
        className="relative inline-flex items-center justify-center shrink-0"
        style={{
          width: 34, height: 24, borderRadius: 7,
          border: `1.5px ${meta.present ? "solid" : "dashed"} ${meta.present ? COLORS.green : isDragOver ? COLORS.accent : COLORS.line}`,
          background: meta.present ? COLORS.greenSoft : isDragOver ? COLORS.accentSoft : "#fff",
          cursor: clickable ? "pointer" : "default",
          opacity: isUploading ? 0.6 : 1,
        }}
      >
        {unlocked && meta.present && !isUploading && (
          <button
            onClick={(e) => { e.stopPropagation(); removeDocument(key); }}
            title="Retirer le PDF (acte de cession)"
            style={{ position: "absolute", top: -6, right: -6, width: 13, height: 13, borderRadius: 999, background: "#fff", border: `1px solid ${COLORS.red}`, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          >
            <X size={8} color={COLORS.red} />
          </button>
        )}
        {isUploading ? (
          <Loader2 size={11} color={COLORS.accent} className="animate-spin" />
        ) : (
          <span className="text-[8px] font-bold leading-none" style={{ color: meta.present ? COLORS.green : COLORS.inkSoft }}>PDF</span>
        )}
      </div>
    );
  }
  // Montant déjà remboursé sur l'ADD d'un marché : par défaut la somme de la colonne "Remb.
  // ADD" des situations de ce marché, mais peut être saisi/corrigé directement (champ "Déjà
  // remboursé (ADD)" dans "Modifier les infos") quand une situation a été perdue/mal
  // renseignée et qu'il n'est plus possible de reconstituer le détail situation par situation.
  function addRembourseTotal(marcheId) {
    const m = chantier.marches.find((x) => x.id === marcheId);
    if (!m) return 0;
    if (m.addRembourseManuel !== "" && m.addRembourseManuel !== null && m.addRembourseManuel !== undefined) {
      return Number(m.addRembourseManuel) || 0;
    }
    return chantier.situations.filter((s) => s.marcheId === marcheId).reduce((a, s) => a + (s.rembAdd || 0), 0);
  }
  function addResteARembourser(marcheId) {
    const m = chantier.marches.find((x) => x.id === marcheId);
    if (!m || !m.addMontant) return null;
    return Math.round((m.addMontant - addRembourseTotal(marcheId)) * 100) / 100;
  }

  function exportChantierPdf() {
    const totalMarcheHtX = chantier.marches.reduce((a, m) => a + (m.montantHt || 0), 0);
    const totalFactureX = chantier.situations.reduce((a, s) => a + (s.montantHt || 0), 0);
    const totalAttenteX = soldeAttenteChantier(chantier.situations);
    setExportPdfError("");
    const pctMapExport = computeSituationPercentages(chantier.situations, chantier.marches);
    const blocks = chantier.marches.map((m) => {
      const sits = chantier.situations.filter((s) => s.marcheId === m.id).sort((a, b) => (a.dateFacture || "").localeCompare(b.dateFacture || ""));
      const rows = sits.map((s) => `<tr>
          <td>${s.nSituation ?? "—"}</td><td>${s.nFact || "—"}</td><td>${fmtDate(s.dateFacture)}</td>
          <td style="text-align:right">${fmtPct(pctMapExport.get(s.id) ?? s.pctAvancement)}</td>
          <td style="text-align:right">${fmtEUR(s.montantHt)}</td><td style="text-align:right">${fmtEUR(s.montantTtc)}</td>
          <td style="text-align:right">${fmtEUR(s.rg)}</td><td style="text-align:right">${fmtEUR(s.totalARecevoir)}</td>
          <td>${s.paye ? "Réglée" + (s.datePaiement ? " le " + fmtDate(s.datePaiement) : "") + (hasMontantRegle(s) && Math.abs(Number(s.montantRegle) - (s.totalARecevoir || 0)) > 0.01 ? ` — montant reçu ${fmtEUR(s.montantRegle)}` : "") : "En attente"}</td>
        </tr>`).join("");
      return `
        <h3>${marcheDisplayName(m)}${m.montantHt ? " — " + fmtEUR(m.montantHt) + " HT marché" : ""}</h3>
        <table><thead><tr><th>N°</th><th>Facture</th><th>Date</th><th>% Av.</th><th>Mt HT</th><th>TTC</th><th>RG</th><th>À recevoir</th><th>Paiement</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="9" style="text-align:center;color:#999">Aucune situation</td></tr>'}</tbody></table>`;
    }).join("");
    const html = `
      <html><head><title>Suivi — ${chantier.titre}</title>
      <style>
        body{font-family:system-ui,sans-serif;color:#16233B;padding:32px;}
        h1{font-size:22px;margin:0 0 2px 0;color:#16233B;}
        .eyebrow{font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8A93A3;margin-bottom:4px;}
        .subtitle{font-size:13px;color:#5B6779;margin:0 0 18px 0;}
        h3{font-size:13.5px;font-weight:700;margin-top:26px;margin-bottom:8px;color:#16233B;border-bottom:1px solid #E5E1D8;padding-bottom:6px;}
        .header{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #16233B;padding-bottom:16px;margin-bottom:24px;}
        .header img{height:34px;}
        .header .meta{text-align:right;font-size:11px;color:#5B6472;}
        .info-tiles{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px;}
        .info-tile{background:#F7F5EF;border-radius:8px;padding:9px 14px;flex:1;min-width:140px;}
        .info-tile-label{display:block;font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#9AA3B1;margin-bottom:3px;}
        .info-tile-value{display:block;font-size:13px;font-weight:600;}
        .stat-row{display:flex;gap:12px;margin-bottom:26px;}
        .stat-card{flex:1;background:#F7F5EF;border-radius:10px;padding:14px 16px;}
        .stat-label{display:block;font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#8A93A3;margin-bottom:4px;}
        .stat-value{display:block;font-size:18px;font-weight:700;color:#16233B;}
        table{width:100%;border-collapse:collapse;font-size:11px;}
        th,td{border:1px solid #ddd;padding:5px 7px;text-align:left;}
        th{background:#F7F5EF;}
        tbody tr:nth-child(even){background:#FBFAF7;}
        .close-bar{position:sticky;top:0;z-index:10;background:linear-gradient(120deg,#16233B 0%,#22314D 100%);padding:10px 16px;margin:-32px -32px 24px -32px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px 16px;box-shadow:0 2px 10px rgba(22,35,59,0.25);}
        .close-bar-brand{display:flex;align-items:center;gap:10px;min-width:0;overflow:hidden;}
        .close-bar-brand img{height:22px;width:auto;display:block;flex-shrink:0;}
        .close-bar-label{color:rgba(255,255,255,0.55);font-size:10.5px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .close-bar-actions{display:flex;gap:8px;flex-shrink:0;margin-left:auto;}
        .print-btn{display:inline-flex;align-items:center;gap:6px;background:#2B6CB0;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 6px rgba(43,108,176,0.45);white-space:nowrap;}
        .close-btn{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:8px 12px;font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap;}
        @media (max-width:480px){
          .close-bar{padding:8px 12px;}
          .close-bar-label{display:none;}
          .close-bar-brand img{height:20px;}
          .print-btn,.close-btn{padding:7px 11px;font-size:12px;}
        }
        @media print { .close-bar{display:none;} }
      </style></head><body>
      <div class="close-bar">
        <div class="close-bar-brand">
          <img src="${LOGO_SYNERGIE}" alt="SYNERGIE BTP" />
          <span class="close-bar-label">Aperçu avant impression</span>
        </div>
        <div class="close-bar-actions">
          <button class="print-btn" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
          <button class="close-btn" onclick="window.close()">✕ Fermer</button>
        </div>
      </div>
      <div class="header">
        <img src="${LOGO_SYNERGIE}" alt="SYNERGIE BTP" />
        <div class="meta">Édité le ${fmtDate(new Date().toISOString().slice(0, 10))}</div>
      </div>
      <div class="eyebrow">Suivi de chantier</div>
      <h1>${chantier.titre}</h1>
      <p class="subtitle">${chantier.client || "Client non renseigné"}${chantier.nChantier ? " · " + chantier.nChantier : ""}</p>
      <div class="info-tiles">
        <div class="info-tile"><span class="info-tile-label">BET / Architecte</span><span class="info-tile-value">${chantier.betArchi || "—"}</span></div>
        <div class="info-tile"><span class="info-tile-label">Démarrage</span><span class="info-tile-value">${chantier.dateDemarrage ? fmtDate(chantier.dateDemarrage) : "—"}</span></div>
        <div class="info-tile"><span class="info-tile-label">Durée prévue</span><span class="info-tile-value">${chantier.dureePrevue || "—"}</span></div>
      </div>
      <div class="stat-row">
        <div class="stat-card"><span class="stat-label">Marché HT total</span><span class="stat-value">${fmtEUR(totalMarcheHtX)}</span></div>
        <div class="stat-card"><span class="stat-label">Facturé HT</span><span class="stat-value">${fmtEUR(totalFactureX)}</span></div>
        <div class="stat-card"><span class="stat-label">En attente de règlement</span><span class="stat-value" style="color:${totalAttenteX > 0.01 ? "#B45309" : "#15803D"}">${fmtEUR(totalAttenteX)}</span></div>
      </div>
      ${blocks}
      </body></html>
    `;
    const fileName = `Suivi_${sanitizeFileName(chantier.titre)}.pdf`;
    openPrintableDocument(html, { fileName, onError: setExportPdfError });
  }

  function setDocMeta(key, meta) {
    const docs = chantier.documents || {};
    updateChantier({ ...chantier, documents: { ...docs, [key]: meta } });
  }
  function triggerDocUpload(key) {
    if (!unlocked) return;
    setPendingUploadKey(key);
    docFileInputRef.current?.click();
  }
  function handleDocFileInputChange(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (file && pendingUploadKey) uploadDocument(pendingUploadKey, file);
  }
  async function uploadDocument(key, file) {
    if (!unlocked) return;
    const MAX_SIZE = 4 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setDocError("Fichier trop volumineux (4 Mo max). Essayez de le compresser.");
      return;
    }
    setDocError("");
    setUploadingDocKey(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("chantierId", chantier.id);
      fd.append("docKey", key);
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Échec de l'envoi du document.");
      setDocMeta(key, { present: true, fileName: data.fileName, filePath: data.path, uploadedAt: data.uploadedAt });
      // Ces documents contiennent en général le nom du client, le montant du
      // marché... : on tente une lecture automatique pour proposer un
      // pré-remplissage (jamais appliqué sans validation explicite).
      if (ANALYZABLE_DOC_KEYS.includes(key)) {
        analyzeDocument(key, file);
      }
    } catch (err) {
      setDocError(err.message || "Échec de l'envoi du document.");
    } finally {
      setUploadingDocKey(null);
    }
  }

  function principalMarche() {
    return chantier.marches.find((m) => m.type === "principal") || chantier.marches[0] || null;
  }

  async function analyzeDocument(docKey, file) {
    setDocAnalysisError("");
    setDocAnalysis(null);
    setAnalyzingDoc(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/analyze-document", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Échec de la lecture automatique du document.");
      const extracted = data.extracted || {};
      const marche = principalMarche();
      // Coché par défaut uniquement pour les champs actuellement VIDES côté
      // appli — on ne propose jamais d'écraser une information déjà saisie.
      const currentlyEmpty = {
        titre: !chantier.titre,
        client: !chantier.client,
        nChantier: !chantier.nChantier,
        betArchi: !chantier.betArchi,
        dateDemarrage: !chantier.dateDemarrage,
        montantHt: !marche || !marche.montantHt,
      };
      const selected = {};
      for (const k of Object.keys(currentlyEmpty)) {
        selected[k] = currentlyEmpty[k] && extracted[k] !== null && extracted[k] !== undefined && extracted[k] !== "";
      }
      setDocAnalysis({ docKey, extracted, selected, currentlyEmpty });
    } catch (err) {
      setDocAnalysisError(err.message || "Échec de la lecture automatique du document.");
    } finally {
      setAnalyzingDoc(false);
    }
  }

  function toggleDocAnalysisField(field) {
    setDocAnalysis((prev) => (prev ? { ...prev, selected: { ...prev.selected, [field]: !prev.selected[field] } } : prev));
  }

  function applyDocAnalysis() {
    if (!docAnalysis) return;
    const { extracted, selected } = docAnalysis;
    const headerPatch = {};
    for (const k of ["titre", "client", "nChantier", "betArchi", "dateDemarrage"]) {
      if (selected[k] && extracted[k]) headerPatch[k] = extracted[k];
    }
    let next = Object.keys(headerPatch).length ? { ...chantier, ...headerPatch } : chantier;
    if (selected.montantHt && extracted.montantHt) {
      const marche = principalMarche();
      if (marche) {
        next = { ...next, marches: next.marches.map((m) => (m.id === marche.id ? { ...m, montantHt: extracted.montantHt } : m)) };
      }
    }
    if (next !== chantier) updateChantier(next);
    setDocAnalysis(null);
  }
  async function removeDocument(key) {
    if (!unlocked) return;
    const docs = chantier.documents || {};
    const meta = getDocMeta(docs, key);
    setUploadingDocKey(key);
    setDocError("");
    try {
      if (meta.filePath) {
        await fetch(`/api/documents?path=${encodeURIComponent(meta.filePath)}`, { method: "DELETE" });
      }
      setDocMeta(key, { present: false, fileName: null, filePath: null, uploadedAt: null });
    } catch (err) {
      setDocError(err.message || "Échec de la suppression du document.");
    } finally {
      setUploadingDocKey(null);
    }
  }
  async function openDocument(key) {
    const docs = chantier.documents || {};
    const meta = getDocMeta(docs, key);
    if (!meta.filePath) return;
    setDocError("");
    try {
      const res = await fetch(`/api/documents?path=${encodeURIComponent(meta.filePath)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Échec de l'ouverture du document.");
      window.open(data.url, "_blank");
    } catch (err) {
      setDocError(err.message || "Impossible d'ouvrir le document.");
    }
  }

  // ---------- 2 bulles PDF par situation (Récapitulatif + Avancement) ----------
  // Réutilise la même route /api/documents (qui ne connaît que chantierId +
  // docKey) avec un docKey dérivé de l'id de situation ET du type de
  // document ("situation-<id>-<recap|avancement>"), pour éviter de dupliquer
  // toute la logique de stockage tout en gardant les deux fichiers
  // totalement séparés — déposer l'un n'écrase jamais l'autre. Les
  // métadonnées sont écrites directement sur la situation concernée
  // (situation.situationDocs.recap / .avancement), indépendamment du
  // formulaire d'édition. L'état (upload en cours / survol drag) est suivi
  // par une clé composite "<situationId>:<docType>" pour distinguer les deux
  // bulles d'une même situation.
  function situationDocKey(situationId, docType) {
    return "situation-" + situationId + "-" + docType;
  }
  function situationDocMeta(s, docType) {
    return (s && s.situationDocs && s.situationDocs[docType]) || { present: false };
  }
  // extraPatch : champs supplémentaires à appliquer sur la situation dans le
  // MÊME appel updateChantier (voir dépôt d'un PDF "ea" dans
  // uploadSituationDocument, qui date automatiquement Validation BET) — deux
  // appels updateChantier séparés partiraient chacun du même chantier.situations
  // figé et le second écraserait le premier.
  function setSituationDocMeta(situationId, docType, meta, extraPatch) {
    const situations = chantier.situations.map((x) =>
      x.id === situationId
        ? { ...x, ...extraPatch, situationDocs: { recap: null, avancement: null, ea: null, facture: null, ...x.situationDocs, [docType]: meta } }
        : x
    );
    updateChantier({ ...chantier, situations });
  }
  function triggerSituationDocUpload(situationId, docType) {
    if (!unlocked) return;
    setPendingSituationUploadId({ situationId, docType });
    situationDocFileInputRef.current?.click();
  }
  function handleSituationDocFileInputChange(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (file && pendingSituationUploadId) uploadSituationDocument(pendingSituationUploadId.situationId, pendingSituationUploadId.docType, file);
  }
  async function uploadSituationDocument(situationId, docType, file) {
    if (!unlocked) return;
    const stateKey = situationId + ":" + docType;
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
    if (!isPdf) {
      setSituationDocError("Seuls les fichiers PDF sont acceptés ici.");
      return;
    }
    const MAX_SIZE = 4 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setSituationDocError("Fichier trop volumineux (4 Mo max). Essayez de le compresser.");
      return;
    }
    setSituationDocError("");
    setUploadingSituationDocId(stateKey);
    try {
      const situation = chantier.situations.find((x) => x.id === situationId);
      let fileToUpload = file;
      // La signature est ajoutée automatiquement sur TOUT PDF "Récapitulatif"
      // déposé (avec ou sans cession fournisseur) — jamais sur avancement/EA/
      // facture, qui n'ont rien à voir avec ça. L'encadré "Répartition de
      // règlement" ne s'ajoute en plus que s'il y a des fournisseurs à
      // détailler. Le tamponnage se fait côté serveur (/api/stamp-repartition)
      // car il faut pouvoir LIRE la position réelle du texte déjà présent sur
      // le PDF (pdf-lib, utilisé côté navigateur, ne sait qu'écrire) pour
      // caler l'encadré juste sous "Règlement :" quel que soit le nombre de
      // lignes déjà imprimées au-dessus sur ce document précis. En cas
      // d'échec (PDF protégé/illisible...), on dépose quand même le fichier
      // original tel quel plutôt que de bloquer l'envoi.
      if (docType === "recap" && situation) {
        try {
          const stampFd = new FormData();
          stampFd.append("file", file);
          stampFd.append("data", JSON.stringify({
            fournisseurs: situation.fournisseurs || [],
            prorata: situation.prorata || 0,
            totalARecevoir: situation.totalARecevoir || 0,
          }));
          const stampRes = await fetch("/api/stamp-repartition", { method: "POST", body: stampFd });
          if (!stampRes.ok) {
            const errData = await stampRes.json().catch(() => ({}));
            throw new Error(errData.error || "Échec du tamponnage du PDF.");
          }
          const stampedBlob = await stampRes.blob();
          fileToUpload = new File([stampedBlob], file.name, { type: "application/pdf" });
        } catch (stampErr) {
          console.error("Échec de l'ajout automatique de la signature/répartition sur le PDF", stampErr);
          setSituationDocError("La signature n'a pas pu être ajoutée automatiquement sur ce PDF (document protégé ou illisible) — le fichier a été déposé tel quel, sans signature.");
          fileToUpload = file;
        }
      }
      const fd = new FormData();
      fd.append("file", fileToUpload);
      fd.append("chantierId", chantier.id);
      fd.append("docKey", situationDocKey(situationId, docType));
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Échec de l'envoi du PDF.");
      // Déposer l'état d'acompte (EA) ou, pour une situation prorata, la
      // facture signée (F) vaut validation BET : la date du jour est
      // enregistrée automatiquement dans "Validation BET" de la situation.
      const extraPatch = (docType === "ea" || docType === "facture") ? { validBet: new Date().toISOString().slice(0, 10) } : undefined;
      setSituationDocMeta(situationId, docType, { present: true, fileName: data.fileName, filePath: data.path, uploadedAt: data.uploadedAt }, extraPatch);
    } catch (err) {
      setSituationDocError(err.message || "Échec de l'envoi du PDF.");
    } finally {
      setUploadingSituationDocId(null);
    }
  }
  async function removeSituationDocument(situationId, docType) {
    if (!unlocked) return;
    const stateKey = situationId + ":" + docType;
    const s = chantier.situations.find((x) => x.id === situationId);
    const meta = situationDocMeta(s, docType);
    setUploadingSituationDocId(stateKey);
    setSituationDocError("");
    try {
      if (meta?.filePath) {
        await fetch(`/api/documents?path=${encodeURIComponent(meta.filePath)}`, { method: "DELETE" });
      }
      setSituationDocMeta(situationId, docType, { present: false, fileName: null, filePath: null, uploadedAt: null });
    } catch (err) {
      setSituationDocError(err.message || "Échec de la suppression du PDF.");
    } finally {
      setUploadingSituationDocId(null);
    }
  }
  async function openSituationDocument(situationId, docType) {
    const s = chantier.situations.find((x) => x.id === situationId);
    const meta = situationDocMeta(s, docType);
    if (!meta?.filePath) return;
    setSituationDocError("");
    try {
      const res = await fetch(`/api/documents?path=${encodeURIComponent(meta.filePath)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Échec de l'ouverture du PDF.");
      window.open(data.url, "_blank");
    } catch (err) {
      setSituationDocError(err.message || "Impossible d'ouvrir le PDF.");
    }
  }
  function triggerFournisseurFactureUpload(situationId) {
    if (!unlocked) return;
    setPendingFournisseurFactureSituationId(situationId);
    fournisseurFactureFileInputRef.current?.click();
  }
  function handleFournisseurFactureFileInputChange(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length && pendingFournisseurFactureSituationId) uploadFournisseurFactureFiles(pendingFournisseurFactureSituationId, files);
  }
  // Ajoute un ou plusieurs PDF à la liste fournisseurFactures de la
  // situation. IMPORTANT : un seul appel updateChantier à la toute fin (avec
  // TOUS les fichiers de ce dépôt), jamais un appel par fichier dans la
  // boucle — sinon chaque appel repartirait du même chantier.situations figé
  // au moment du rendu et les ajouts précédents de CE dépôt s'écraseraient
  // entre eux (cf. le même piège déjà rencontré sur les RG à venir groupées).
  async function uploadFournisseurFactureFiles(situationId, files) {
    if (!unlocked || !files.length) return;
    const stateKey = situationId + ":fournFact";
    const MAX_SIZE = 4 * 1024 * 1024;
    setSituationDocError("");
    setUploadingSituationDocId(stateKey);
    try {
      const newMetas = [];
      for (const file of files) {
        const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
        if (!isPdf) {
          setSituationDocError("Seuls les fichiers PDF sont acceptés ici.");
          continue;
        }
        if (file.size > MAX_SIZE) {
          setSituationDocError(`"${file.name}" est trop volumineux (4 Mo max) — ignoré.`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        fd.append("chantierId", chantier.id);
        fd.append("docKey", situationDocKey(situationId, "fournfact-" + uid("ff")));
        const res = await fetch("/api/documents", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Échec de l'envoi du PDF.");
        newMetas.push({ id: uid("ff"), fileName: data.fileName, filePath: data.path, uploadedAt: data.uploadedAt });
      }
      if (newMetas.length) {
        const situations = chantier.situations.map((x) =>
          x.id === situationId ? { ...x, fournisseurFactures: [...(x.fournisseurFactures || []), ...newMetas] } : x
        );
        updateChantier({ ...chantier, situations });
      }
    } catch (err) {
      setSituationDocError(err.message || "Échec de l'envoi du PDF.");
    } finally {
      setUploadingSituationDocId(null);
    }
  }
  async function removeFournisseurFactureFile(situationId, fileId) {
    if (!unlocked) return;
    const s = chantier.situations.find((x) => x.id === situationId);
    const item = (s?.fournisseurFactures || []).find((f) => f.id === fileId);
    const stateKey = situationId + ":fournFact";
    setUploadingSituationDocId(stateKey);
    setSituationDocError("");
    try {
      if (item?.filePath) {
        await fetch(`/api/documents?path=${encodeURIComponent(item.filePath)}`, { method: "DELETE" });
      }
      const situations = chantier.situations.map((x) =>
        x.id === situationId ? { ...x, fournisseurFactures: (x.fournisseurFactures || []).filter((f) => f.id !== fileId) } : x
      );
      updateChantier({ ...chantier, situations });
    } catch (err) {
      setSituationDocError(err.message || "Échec de la suppression du PDF.");
    } finally {
      setUploadingSituationDocId(null);
    }
  }
  async function openFournisseurFactureFile(fileMeta) {
    if (!fileMeta?.filePath) return;
    setSituationDocError("");
    try {
      const res = await fetch(`/api/documents?path=${encodeURIComponent(fileMeta.filePath)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Échec de l'ouverture du PDF.");
      window.open(data.url, "_blank");
    } catch (err) {
      setSituationDocError(err.message || "Impossible d'ouvrir le PDF.");
    }
  }
  // Télécharge le PDF déjà déposé pour cette situation (recap ou avancement)
  // sous un nom de fichier explicite, prêt à être glissé dans un email. Un
  // navigateur ne peut pas joindre un fichier à un nouveau message pour des
  // raisons de sécurité — impossible à contourner depuis une appli web —
  // donc le geste le plus proche est : télécharger les PDF, puis ouvrir un
  // brouillon pré-rempli (voir sendSituationByEmail) où il ne reste plus
  // qu'à glisser les fichiers téléchargés et cliquer sur Envoyer.
  async function downloadSituationDoc(situationId, docType, downloadName) {
    const s = chantier.situations.find((x) => x.id === situationId);
    const meta = situationDocMeta(s, docType);
    if (!meta?.filePath) return false;
    const res = await fetch(`/api/documents?path=${encodeURIComponent(meta.filePath)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error(data.error || "Échec du téléchargement du PDF.");
    const fileRes = await fetch(data.url);
    if (!fileRes.ok) throw new Error("Échec du téléchargement du PDF.");
    const blob = await fileRes.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    return true;
  }
  // Les bulles PDF possibles pour une situation — recap/avancement/état
  // d'acompte pour un marché normal, ou juste "facture" (la facture signée)
  // pour une situation PRORATA — utilisé pour vérifier ce qui est déposé
  // avant l'envoi par email.
  const SITUATION_DOC_TYPES = [
    { key: "recap", label: "récapitulatif" },
    { key: "avancement", label: "avancement" },
    { key: "ea", label: "état d'acompte" },
    { key: "facture", label: "facture signée" },
  ];
  // Nom du fichier téléchargé avant l'envoi par email, au format demandé :
  //  - Récap/Avancement/Facture : "SIT.<n° situation sur 2 chiffres> <Mois><aa> - <Récapitulatif|Avancement|Facture> - <nom chantier>"
  //    ex. "SIT.01 Août26 - Récapitulatif - HTA" (mois = mois de la date de
  //    facture de la situation, en toutes lettres, collé à l'année sur 2 chiffres)
  //  - État d'acompte : "EA n°<n° situation> - <nom chantier>" (pas de mois/année)
  function situationDocFileName(docType, s) {
    const chantierName = sanitizeFileNameKeepAccents(chantier.titre);
    const nSituation = s.nSituation ?? "";
    if (docType === "ea") {
      return sanitizeFileNameKeepAccents(`EA n°${nSituation} - ${chantierName}`) + ".pdf";
    }
    const d = s.dateFacture ? new Date(s.dateFacture + "T00:00:00") : null;
    const moisAnnee = d && !isNaN(d.getTime()) ? `${MOIS_FR[d.getMonth()]}${String(d.getFullYear()).slice(-2)}` : "";
    const nSituationPadded = String(nSituation).padStart(2, "0");
    const label = docType === "recap" ? "Récapitulatif" : docType === "facture" ? "Facture" : "Avancement";
    return sanitizeFileNameKeepAccents(`SIT.${nSituationPadded} ${moisAnnee} - ${label} - ${chantierName}`) + ".pdf";
  }
  async function sendSituationByEmail(s, isProrata) {
    const stateKey = s.id + ":send";
    setSituationDocError("");
    setEmailNotice("");
    setSendingEmailId(stateKey);
    try {
      const present = SITUATION_DOC_TYPES.filter((t) => situationDocMeta(s, t.key).present);
      if (present.length === 0) {
        setSituationDocError(
          isProrata
            ? "Dépose d'abord la facture signée de cette situation (bulle F) avant de l'envoyer."
            : "Dépose d'abord le PDF récapitulatif, avancement et/ou état d'acompte de cette situation (bulles R/A/EA) avant de l'envoyer."
        );
        return;
      }
      for (const t of present) {
        await downloadSituationDoc(s.id, t.key, situationDocFileName(t.key, s));
      }

      const chantierLabel = `${chantier.titre}${chantier.nChantier ? " (" + chantier.nChantier + ")" : ""}`;
      const subject = `Situation n°${s.nSituation ?? ""} — ${chantierLabel}`;
      const piecesJointes = present.map((t) => t.label).join(present.length > 1 ? " et " : "");
      const pluriel = present.length > 1 ? "s" : "";
      // "du mois de ..." avec élision correcte devant une voyelle (d'avril,
      // d'août, d'octobre) plutôt que "de avril"/"de août"/"de octobre".
      const dFact = s.dateFacture ? new Date(s.dateFacture + "T00:00:00") : null;
      const moisSegment = dFact && !isNaN(dFact.getTime())
        ? (() => {
            const nom = MOIS_FR[dFact.getMonth()];
            const prep = /^[AEIOUÀÂÎÔÛÉÈÊËaeiouàâîôûéèêë]/.test(nom) ? "d’" : "de ";
            return ` du mois ${prep}${nom.toLowerCase()} ${String(dFact.getFullYear()).slice(-2)}`;
          })()
        : "";
      // Pas de formule de politesse/signature en dur : Outlook insère la
      // signature enregistrée par Morgane à l'ouverture du nouveau message
      // (si l'option "inclure automatiquement ma signature" est activée dans
      // ses réglages Outlook — sinon il faudra l'ajouter à la main une fois).
      const body =
        `Bonjour,\n\n` +
        `Veuillez trouver ci-joint la situation n°${s.nSituation ?? ""}${moisSegment}, concernant le chantier ${chantierLabel}.\n\n` +
        `Dans l'attente de votre retour pour validation.\n\n`;
      const to = (chantier.clientEmail || "").trim();
      const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      // Impossible de joindre un fichier à un email depuis une appli web
      // (restriction de sécurité des navigateurs, aucun contournement
      // possible) — les PDF viennent d'être téléchargés dans le dossier de
      // téléchargements, il ne reste plus qu'à les glisser dans le nouveau
      // message qui s'ouvre avec objet/texte déjà pré-remplis.
      setEmailNotice(`PDF ${piecesJointes} téléchargé${pluriel} — glisse-le${pluriel} dans le nouveau message qui vient de s'ouvrir, puis clique sur Envoyer.${to ? "" : " (Pense à renseigner l'email du client dans « Modifier les infos » pour qu'il soit pré-rempli la prochaine fois.)"}`);
      window.location.href = mailto;
    } catch (err) {
      setSituationDocError(err.message || "Échec de la préparation de l'email.");
    } finally {
      setSendingEmailId(null);
    }
  }
  function addAvenant() {
    const docs = chantier.documents || { acteEngagement: false, ccap: false, devisSigne: false, avenants: [] };
    const n = (docs.avenants || []).length + 1;
    updateChantier({ ...chantier, documents: { ...docs, avenants: [...(docs.avenants || []), { id: uid("avn"), nom: "Avenant " + String(n).padStart(2, "0"), present: false }] } });
  }
  function renameAvenant(id, nom) {
    const docs = chantier.documents || { acteEngagement: false, ccap: false, devisSigne: false, avenants: [] };
    updateChantier({ ...chantier, documents: { ...docs, avenants: docs.avenants.map((a) => (a.id === id ? { ...a, nom } : a)) } });
  }
  // Supprime l'avenant ET, s'il avait un PDF déposé, ce fichier (sur le
  // stockage ET dans chantier.documents) — sinon le fichier restait
  // orphelin indéfiniment (jamais réaffiché nulle part, mais jamais
  // supprimé du stockage non plus).
  async function removeAvenant(id) {
    const docs = chantier.documents || { acteEngagement: false, ccap: false, devisSigne: false, avenants: [] };
    const meta = getDocMeta(docs, id);
    if (meta.present && meta.filePath) {
      try {
        await fetch(`/api/documents?path=${encodeURIComponent(meta.filePath)}`, { method: "DELETE" });
      } catch {
        // On retire quand même l'avenant même si la suppression du fichier
        // sur le stockage échoue (pas de blocage pour Morgane).
      }
    }
    const { [id]: _removed, ...restDocs } = docs;
    updateChantier({ ...chantier, documents: { ...restDocs, avenants: (docs.avenants || []).filter((a) => a.id !== id) } });
  }
  // Décocher un type de document qui a déjà un PDF déposé doit aussi
  // supprimer ce fichier (sur le stockage ET dans chantier.documents) :
  // sinon le fichier reste "orphelin" en coulisses et réapparaît tel quel
  // dès qu'on recoche ce même type — ce qui donnait l'impression qu'il
  // était impossible de vraiment supprimer un PDF depuis cette liste (la
  // petite corbeille en haut à gauche ne faisait que décocher la case,
  // jamais supprimer le fichier déjà déposé dessous).
  async function toggleDocTypeActif(key) {
    const actifs = chantier.docTypesActifs || [];
    const isRemoving = actifs.includes(key);
    const next = isRemoving ? actifs.filter((k) => k !== key) : [...actifs, key];
    const docs = chantier.documents || {};
    const meta = getDocMeta(docs, key);
    if (isRemoving && meta.present) {
      if (meta.filePath) {
        try {
          await fetch(`/api/documents?path=${encodeURIComponent(meta.filePath)}`, { method: "DELETE" });
        } catch {
          // On décoche quand même la case même si la suppression du fichier
          // sur le stockage échoue (pas de blocage pour Morgane).
        }
      }
      updateChantier({ ...chantier, docTypesActifs: next, documents: { ...docs, [key]: { present: false, fileName: null, filePath: null, uploadedAt: null } } });
      return;
    }
    updateChantier({ ...chantier, docTypesActifs: next });
  }

  // ---- Sous-traitance : contrats des sous-traitants employés sur ce
  // chantier (DC4, contrat, attestations à jour) — voir SS_TRAITANCE_STATUTS
  // / ATTESTATION_TYPES / sousTraitanceDocKey plus haut dans le fichier.
  function addSousTraitanceEntry() {
    updateChantier({ ...chantier, sousTraitance: [...(chantier.sousTraitance || []), emptySousTraitanceEntry()] });
  }
  function updateSousTraitanceEntry(id, patch) {
    updateChantier({ ...chantier, sousTraitance: (chantier.sousTraitance || []).map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  }
  // Supprime l'entrée ET les pièces déjà déposées dessus (DC4, contrat, les
  // 5 attestations) — même logique que removeAvenant/toggleDocTypeActif :
  // jamais de fichier orphelin laissé sur le stockage.
  async function removeSousTraitanceEntry(id) {
    const docsCur = chantier.documents || {};
    const pieceKeys = ["dc4", "contrat", ...ATTESTATION_TYPES.map((a) => a.key)].map((t) => sousTraitanceDocKey(id, t));
    await Promise.all(pieceKeys.map(async (k) => {
      const meta = getDocMeta(docsCur, k);
      if (meta.present && meta.filePath) {
        try {
          await fetch(`/api/documents?path=${encodeURIComponent(meta.filePath)}`, { method: "DELETE" });
        } catch {
          // On retire quand même l'entrée même si une suppression échoue.
        }
      }
    }));
    const restDocs = { ...docsCur };
    for (const k of pieceKeys) delete restDocs[k];
    updateChantier({ ...chantier, documents: restDocs, sousTraitance: (chantier.sousTraitance || []).filter((e) => e.id !== id) });
  }
  // Crée une nouvelle entreprise dans le répertoire global des sous-traitants
  // (réutilisable sur tous les chantiers) et l'affecte aussitôt à l'entrée en
  // cours d'édition — évite d'aller jusqu'à l'onglet "Sous-traitants" juste
  // pour saisir une entreprise rencontrée pour la première fois.
  function confirmNewSousTraitant(entryId) {
    const nom = newSousTraitantNom.trim();
    if (!nom || !onAddSousTraitant) { setAddingSousTraitantForEntryId(null); setNewSousTraitantNom(""); return; }
    const newId = onAddSousTraitant({ nom });
    updateSousTraitanceEntry(entryId, { sousTraitantId: newId });
    setAddingSousTraitantForEntryId(null);
    setNewSousTraitantNom("");
  }

  const docs = chantier.documents || { acteEngagement: false, ccap: false, devisSigne: false, avenants: [] };
  const reqDocs = requiredDocuments(chantier);
  const missingDocs = reqDocs.filter((d) => !d.present);
  const coreDocs = reqDocs.filter((d) => !d.isAvenant);
  const docsPresentCount = coreDocs.filter((d) => d.present).length;
  const docsTotalCount = coreDocs.length;
  const docsPresentPct = docsTotalCount ? Math.round((docsPresentCount / docsTotalCount) * 100) : 100;

  const totalMarcheHt = chantier.marches.reduce((a, m) => a + (m.montantHt || 0), 0);
  const totalMarcheTtc = chantier.marches.reduce((a, m) => a + (m.montantHt || 0) * (1 + (TVA_REGIMES[m.tvaRegime]?.rate ?? 0.085)), 0);
  const totalFactureTtc = chantier.situations.reduce((a, s) => a + (s.montantTtc || 0), 0);
  const totalAttente = soldeAttenteChantier(chantier.situations);
  const totalFournisseur = chantier.situations.reduce((a, s) => a + (s.fournisseurs || []).reduce((a2, f) => a2 + (f.montant || 0), 0), 0);
  const resteAFacturer = Math.round((totalMarcheTtc - totalFactureTtc) * 100) / 100;
  const allSupplierNames = Array.from(new Set((chantier.fournisseurs || []).map((f) => f.nom).filter(Boolean)));

  // Petite bulle PDF (24x24, comme R/A/EA/F sur les situations) réutilisée
  // pour chaque pièce d'un contrat de sous-traitance (DC4, contrat,
  // attestations) — repose sur le même stockage générique chantier.documents
  // que le reste de l'appli (getDocMeta/uploadDocument/removeDocument/
  // openDocument/triggerDocUpload, déjà génériques sur la clé).
  function renderSousTraitanceDocBubble(entryId, type, label) {
    const key = sousTraitanceDocKey(entryId, type);
    const meta = getDocMeta(docs, key);
    const isUploading = uploadingDocKey === key;
    const isDragOver = dragOverDocKey === key;
    const clickable = !isUploading && (meta.present || unlocked);
    return (
      <div
        key={type}
        onDragOver={(e) => { if (!unlocked || isUploading) return; e.preventDefault(); setDragOverDocKey(key); }}
        onDragLeave={() => setDragOverDocKey((k) => (k === key ? null : k))}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverDocKey((k) => (k === key ? null : k));
          if (!unlocked || isUploading) return;
          const f = e.dataTransfer.files && e.dataTransfer.files[0];
          if (f) uploadDocument(key, f);
        }}
        onClick={() => {
          if (isUploading) return;
          if (meta.present) { openDocument(key); return; }
          if (unlocked) triggerDocUpload(key);
        }}
        title={`${label}${meta.present ? " — " + (meta.fileName || "cliquer pour ouvrir") : unlocked ? " — cliquer ou glisser-déposer le PDF ici" : " — manquant"}`}
        className="relative inline-flex items-center justify-center"
        style={{
          width: 24, height: 24, borderRadius: 7,
          border: `1.5px ${meta.present ? "solid" : "dashed"} ${meta.present ? COLORS.green : isDragOver ? COLORS.accent : COLORS.line}`,
          background: meta.present ? COLORS.greenSoft : isDragOver ? COLORS.accentSoft : "#fff",
          cursor: clickable ? "pointer" : "default",
          opacity: isUploading ? 0.6 : 1,
          flexShrink: 0,
        }}
      >
        {unlocked && meta.present && !isUploading && (
          <button
            onClick={(e) => { e.stopPropagation(); removeDocument(key); }}
            title={`Retirer (${label})`}
            style={{ position: "absolute", top: -6, right: -6, width: 13, height: 13, borderRadius: 999, background: "#fff", border: `1px solid ${COLORS.red}`, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          >
            <X size={8} color={COLORS.red} />
          </button>
        )}
        {isUploading ? (
          <Loader2 size={11} color={COLORS.accent} className="animate-spin" />
        ) : (
          <span className="text-[8px] font-bold leading-none text-center" style={{ color: meta.present ? COLORS.green : COLORS.inkSoft }}>
            {label.slice(0, 3).toUpperCase()}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl">
      <button onClick={() => setTab("chantiers")} className="flex items-center gap-1 text-xs font-medium mb-3" style={{ color: COLORS.inkSoft }}>
        <ChevronLeft size={14} /> Retour aux chantiers
      </button>

      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: COLORS.ink }}>{chantier.titre}</h1>
          <p className="text-sm" style={{ color: COLORS.inkSoft }}>{chantier.client || "Client non renseigné"} {chantier.nChantier ? `— ${chantier.nChantier}` : ""}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Btn variant="ghost" size="sm" onClick={exportChantierPdf}>Exporter en PDF</Btn>
          {unlocked && <Btn variant="ghost" size="sm" onClick={() => setHeaderEdit(!headerEdit)}>{headerEdit ? "Fermer" : "Modifier les infos"}</Btn>}
          {unlocked && !chantier.isFacturesLibres && !chantier.archived && (
            confirmClose ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: COLORS.red }}>Clôturer ce chantier ?</span>
                <button
                  title="Oui, clôturer et archiver ce chantier"
                  onClick={() => { onArchiveChantier(chantier.id, true); setTab("archives"); }}
                  className="p-1.5 rounded"
                  style={{ background: COLORS.red }}
                >
                  <Check size={12} color="#fff" />
                </button>
                <button title="Annuler" onClick={() => setConfirmClose(false)} className="p-1.5 rounded" style={{ background: "#F0EEE6" }}>
                  <X size={12} color={COLORS.inkSoft} />
                </button>
              </div>
            ) : (
              <Btn variant="ghost" size="sm" onClick={() => setConfirmClose(true)}><Archive size={13} /> Chantier clôturé</Btn>
            )
          )}
        </div>
      </div>
      {exportPdfError && <p className="text-xs mb-3" style={{ color: COLORS.red }}>{exportPdfError}</p>}

      {/* Mentions posées automatiquement quand une RG échue reliée à ce chantier
          (voir "Chantier lié" dans l'onglet Retenues de garantie) est marquée
          réglée depuis "Règlements en attente" ou l'onglet RG — voir markRgReceived. */}
      {chantier.rgReglees && chantier.rgReglees.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-4">
          {chantier.rgReglees.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-lg" style={{ background: COLORS.greenSoft, border: "1px solid #BFE0CD" }}>
              <span className="text-xs font-semibold" style={{ color: COLORS.green }}>
                RETENUE DE GARANTIE DE {fmtEUR(r.montant)} RÉGLÉE LE {fmtDate(r.dateReglee)}
              </span>
              {unlocked && (
                <button
                  title="Supprimer cette mention"
                  onClick={() => updateChantier({ ...chantier, rgReglees: chantier.rgReglees.filter((x) => x.id !== r.id) })}
                >
                  <X size={13} color={COLORS.inkSoft} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Card className="p-0 mb-4 overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {[
            { icon: Building2, label: "BET / Architecte", value: chantier.betArchi },
            { icon: Clock, label: "Démarrage", value: chantier.dateDemarrage ? fmtDate(chantier.dateDemarrage) : null },
            { icon: Clock, label: "Durée prévue", value: chantier.dureePrevue },
          ].map((it, i) => (
            <div
              key={it.label}
              className="flex items-center gap-2.5 px-3.5 py-3"
              style={{ borderLeft: i === 0 ? "none" : `1px solid ${COLORS.line}`, borderTop: "none" }}
            >
              <div className="flex items-center justify-center rounded-md shrink-0" style={{ width: 30, height: 30, background: COLORS.accentSoft }}>
                <it.icon size={15} color={COLORS.accent} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>{it.label}</div>
                <div className="text-sm font-medium truncate" style={{ color: it.value ? COLORS.ink : COLORS.inkSoft }}>{it.value || "non renseigné"}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 mb-4" style={{ border: `1px solid ${missingDocs.length ? "#E8C4BE" : "#BFE0CD"}` }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 36, height: 36, background: missingDocs.length ? COLORS.redSoft : COLORS.greenSoft }}>
            <FileWarning size={17} color={missingDocs.length ? COLORS.red : COLORS.green} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold mb-0.5" style={{ color: COLORS.ink }}>Documents contractuels</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium" style={{ color: missingDocs.length ? COLORS.red : COLORS.green }}>
                {missingDocs.length ? `${missingDocs.length} document${missingDocs.length > 1 ? "s" : ""} manquant${missingDocs.length > 1 ? "s" : ""}` : "Dossier documentaire complet"}
              </span>
              {!hasBetArchi(chantier) && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: "#F0EEE6", color: COLORS.inkSoft }}>
                  petit chantier sans BET/archi
                </span>
              )}
            </div>
            {docsTotalCount > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: "#EDEAE0", maxWidth: 240 }}>
                  <div style={{ height: "100%", width: `${docsPresentPct}%`, background: missingDocs.length ? COLORS.amber : COLORS.green, borderRadius: 999, transition: "width 0.2s" }} />
                </div>
                <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{docsPresentCount}/{docsTotalCount} réunis</span>
              </div>
            )}
          </div>
        </div>
        {docError && <p className="text-xs mb-2" style={{ color: COLORS.red }}>{docError}</p>}
        <input
          ref={docFileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.heic,.heif"
          style={{ display: "none" }}
          onChange={handleDocFileInputChange}
        />
        <input
          ref={situationDocFileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: "none" }}
          onChange={handleSituationDocFileInputChange}
        />
        <input
          ref={fournisseurFactureFileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          style={{ display: "none" }}
          onChange={handleFournisseurFactureFileInputChange}
        />
        <div className="flex flex-wrap gap-2.5 items-start">
          {reqDocs.map((d) => {
            const meta = getDocMeta(docs, d.key);
            const isUploading = uploadingDocKey === d.key;
            const isDragOver = dragOverDocKey === d.key;
            const clickable = !isUploading && (meta.present || unlocked);
            return (
              <div
                key={d.key}
                onDragOver={(e) => { if (!unlocked || isUploading) return; e.preventDefault(); setDragOverDocKey(d.key); }}
                onDragLeave={() => setDragOverDocKey((k) => (k === d.key ? null : k))}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverDocKey((k) => (k === d.key ? null : k));
                  if (!unlocked || isUploading) return;
                  const f = e.dataTransfer.files && e.dataTransfer.files[0];
                  if (f) uploadDocument(d.key, f);
                }}
                onClick={() => {
                  if (isUploading) return;
                  if (meta.present) { openDocument(d.key); return; }
                  if (unlocked) triggerDocUpload(d.key);
                }}
                title={meta.present ? (meta.fileName || "Document réuni — cliquer pour ouvrir") : (unlocked ? "Cliquer ou glisser-déposer un fichier ici" : "Document manquant")}
                className="relative flex flex-col items-center justify-center text-center gap-1"
                style={{
                  width: 118,
                  minHeight: 92,
                  borderRadius: 16,
                  padding: "10px 8px",
                  border: `2px ${meta.present ? "solid" : "dashed"} ${meta.present ? COLORS.green : isDragOver ? COLORS.accent : COLORS.red}`,
                  background: meta.present ? "#fff" : isDragOver ? COLORS.accentSoft : "#fff",
                  cursor: clickable ? "pointer" : "default",
                  opacity: isUploading ? 0.6 : 1,
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                {unlocked && !isUploading && (
                  <button
                    onClick={(e) => { e.stopPropagation(); d.isAvenant ? removeAvenant(d.key) : toggleDocTypeActif(d.key); }}
                    title={d.isAvenant ? "Supprimer cet avenant (et son PDF)" : "Retirer ce type de document de la liste (et son PDF)"}
                    style={{ position: "absolute", top: 4, left: 4 }}
                  >
                    <Trash2 size={11} color={COLORS.inkSoft} />
                  </button>
                )}
                {unlocked && meta.present && !isUploading && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeDocument(d.key); }}
                    title="Retirer le document"
                    style={{ position: "absolute", top: 4, right: 4 }}
                  >
                    <X size={11} color={COLORS.red} />
                  </button>
                )}
                {isUploading ? (
                  <Loader2 size={20} color={COLORS.accent} className="animate-spin" />
                ) : (
                  <FileWarning size={20} color={meta.present ? COLORS.green : COLORS.red} />
                )}
                {d.isAvenant && unlocked ? (
                  <input
                    value={d.label}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => renameAvenant(d.key, e.target.value)}
                    className="text-[11px] font-medium text-center"
                    style={{ color: COLORS.ink, border: "none", background: "transparent", width: "100%", padding: 0 }}
                  />
                ) : (
                  <span className="text-[11px] font-medium leading-tight" style={{ color: COLORS.ink }}>{d.label}</span>
                )}
                {meta.present ? (
                  <span className="text-[10px] truncate" style={{ color: COLORS.inkSoft, maxWidth: 100 }}>{meta.fileName || "Réuni"}</span>
                ) : (
                  <span className="text-[10px]" style={{ color: COLORS.inkSoft }}>{isUploading ? "Envoi..." : unlocked ? "glisser un fichier" : "manquant"}</span>
                )}
              </div>
            );
          })}
          {unlocked && FIXED_DOC_TYPES.filter((t) => !(chantier.docTypesActifs || []).includes(t.key)).map((t) => (
            <button
              key={t.key}
              onClick={() => toggleDocTypeActif(t.key)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium h-fit"
              style={{ color: COLORS.accent, border: `1px dashed ${COLORS.accent}` }}
            >
              <Plus size={12} /> {t.label}
            </button>
          ))}
          {unlocked && (
            <button onClick={addAvenant} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium h-fit" style={{ color: COLORS.accent, border: `1px dashed ${COLORS.accent}` }}>
              <Plus size={12} /> Avenant
            </button>
          )}
        </div>
      </Card>

      {!chantier.isFacturesLibres && (
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 36, height: 36, background: COLORS.accentSoft }}>
                <HardHat size={17} color={COLORS.accent} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>Sous-traitance</div>
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>
                  {(chantier.sousTraitance || []).length
                    ? `${(chantier.sousTraitance || []).length} sous-traitant${(chantier.sousTraitance || []).length > 1 ? "s" : ""} sur ce chantier`
                    : "Aucun sous-traitant employé sur ce chantier"}
                </div>
              </div>
            </div>
            {unlocked && (
              <Btn size="sm" variant="ghost" onClick={addSousTraitanceEntry}><Plus size={13} /> Sous-traitant</Btn>
            )}
          </div>
          {(chantier.sousTraitance || []).length === 0 ? (
            <p className="text-xs" style={{ color: COLORS.inkSoft }}>
              {unlocked ? "Ajoute un sous-traitant employé sur ce chantier pour suivre son contrat, son DC4 et ses attestations à jour." : "Aucun sous-traitant renseigné."}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {(chantier.sousTraitance || []).map((entry) => {
                const sst = sousTraitants.find((s) => s.id === entry.sousTraitantId);
                return (
                  <div key={entry.id} className="rounded-lg p-3" style={{ border: `1px solid ${COLORS.line}`, background: "#FBFAF6" }}>
                    <div className="flex flex-wrap items-end gap-2 mb-2.5">
                      <Field label="Sous-traitant">
                        <select
                          value={entry.sousTraitantId || ""}
                          disabled={!unlocked}
                          onChange={(e) => {
                            if (e.target.value === "__new__") { setAddingSousTraitantForEntryId(entry.id); setNewSousTraitantNom(""); return; }
                            updateSousTraitanceEntry(entry.id, { sousTraitantId: e.target.value });
                          }}
                          style={{ ...inputStyle, minWidth: 190 }}
                          className="outline-none focus:ring-2"
                        >
                          <option value="">— Choisir —</option>
                          {sousTraitants.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                          {unlocked && <option value="__new__">+ Nouveau sous-traitant…</option>}
                        </select>
                      </Field>
                      <Field label="Montant HT">
                        <TextInput
                          type="number"
                          value={entry.montant ?? ""}
                          disabled={!unlocked}
                          onChange={(e) => updateSousTraitanceEntry(entry.id, { montant: e.target.value === "" ? null : Number(e.target.value) })}
                          style={{ width: 110 }}
                        />
                      </Field>
                      <Field label="Date début">
                        <TextInput type="date" value={entry.dateDebut || ""} disabled={!unlocked} onChange={(e) => updateSousTraitanceEntry(entry.id, { dateDebut: e.target.value })} style={{ width: 145 }} />
                      </Field>
                      <Field label="Date fin">
                        <TextInput type="date" value={entry.dateFin || ""} disabled={!unlocked} onChange={(e) => updateSousTraitanceEntry(entry.id, { dateFin: e.target.value })} style={{ width: 145 }} />
                      </Field>
                      <Field label="Statut DC4">
                        <select value={entry.statutDc4 || ""} disabled={!unlocked} onChange={(e) => updateSousTraitanceEntry(entry.id, { statutDc4: e.target.value })} style={{ ...inputStyle, minWidth: 155 }} className="outline-none focus:ring-2">
                          <option value="">— (non concerné)</option>
                          {SS_TRAITANCE_STATUTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </Field>
                      <Field label="Statut Contrat">
                        <select value={entry.statutContrat || ""} disabled={!unlocked} onChange={(e) => updateSousTraitanceEntry(entry.id, { statutContrat: e.target.value })} style={{ ...inputStyle, minWidth: 155 }} className="outline-none focus:ring-2">
                          <option value="">—</option>
                          {SS_TRAITANCE_STATUTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </Field>
                      {unlocked && (
                        <button onClick={() => removeSousTraitanceEntry(entry.id)} title="Supprimer ce sous-traitant de ce chantier (et ses pièces jointes)" className="p-1.5 rounded-md h-fit">
                          <Trash2 size={14} color={COLORS.red} />
                        </button>
                      )}
                    </div>
                    {addingSousTraitantForEntryId === entry.id && (
                      <div className="flex items-center gap-2 mb-2.5 p-2 rounded-md" style={{ background: COLORS.accentSoft }}>
                        <TextInput
                          autoFocus
                          placeholder="Nom de l'entreprise"
                          value={newSousTraitantNom}
                          onChange={(e) => setNewSousTraitantNom(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") confirmNewSousTraitant(entry.id); }}
                          style={{ flex: 1, minWidth: 140 }}
                        />
                        <Btn size="sm" variant="accent" onClick={() => confirmNewSousTraitant(entry.id)}>Ajouter</Btn>
                        <button onClick={() => { setAddingSousTraitantForEntryId(null); setNewSousTraitantNom(""); }}><X size={14} color={COLORS.inkSoft} /></button>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center gap-1">
                        {renderSousTraitanceDocBubble(entry.id, "dc4", "DC4")}
                        {renderSousTraitanceDocBubble(entry.id, "contrat", "Contrat")}
                      </div>
                      <div style={{ width: 1, height: 20, background: COLORS.line }} />
                      <div className="flex items-center gap-1">
                        {ATTESTATION_TYPES.map((a) => renderSousTraitanceDocBubble(entry.id, a.key, a.label))}
                      </div>
                    </div>
                    {sst && (sst.representant || sst.telephone || sst.email) && (
                      <div className="text-[11px] mt-2" style={{ color: COLORS.inkSoft }}>
                        {sst.representant}{sst.representant && (sst.telephone || sst.email) ? " — " : ""}{sst.telephone}{sst.telephone && sst.email ? " · " : ""}{sst.email}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {analyzingDoc && (
        <Card className="p-3 mb-4 flex items-center gap-2 text-xs" style={{ color: COLORS.inkSoft }}>
          <Loader2 size={14} className="animate-spin" /> Lecture automatique du document en cours...
        </Card>
      )}
      {docAnalysisError && (
        <Card className="p-3 mb-4 text-xs" style={{ color: COLORS.red, border: "1px solid #E8C4BE" }}>
          {docAnalysisError}
        </Card>
      )}
      {docAnalysis && (
        <Card className="p-4 mb-4" style={{ border: `1px solid ${COLORS.accent}` }}>
          <div className="text-sm font-semibold mb-1" style={{ color: COLORS.ink }}>Informations trouvées dans le document</div>
          <p className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
            Coche les informations à appliquer à la fiche chantier (déjà décochées si un champ est déjà rempli). Rien n'est modifié tant que tu ne cliques pas sur "Appliquer".
          </p>
          <div className="flex flex-col gap-1.5 mb-3">
            {[
              { key: "titre", label: "Nom du chantier" },
              { key: "client", label: "Client" },
              { key: "nChantier", label: "N° chantier" },
              { key: "betArchi", label: "BET / Architecte" },
              { key: "dateDemarrage", label: "Date démarrage" },
              { key: "montantHt", label: "Montant HT du marché" },
            ]
              .filter((f) => docAnalysis.extracted[f.key] !== null && docAnalysis.extracted[f.key] !== undefined && docAnalysis.extracted[f.key] !== "")
              .map((f) => {
                const val = docAnalysis.extracted[f.key];
                const display = f.key === "montantHt" ? fmtEUR(val) : f.key === "dateDemarrage" ? fmtDate(val) : val;
                return (
                  <label key={f.key} className="flex items-center gap-2 text-xs" style={{ color: COLORS.ink }}>
                    <input type="checkbox" checked={!!docAnalysis.selected[f.key]} onChange={() => toggleDocAnalysisField(f.key)} />
                    <span style={{ minWidth: 140 }}>{f.label}</span>
                    <span className="font-medium">{display}</span>
                    {!docAnalysis.currentlyEmpty[f.key] && (
                      <span className="text-[10px]" style={{ color: COLORS.amber }}>déjà renseigné — cocher pour remplacer</span>
                    )}
                  </label>
                );
              })}
          </div>
          {docAnalysis.extracted.confiance && docAnalysis.extracted.confiance !== "haute" && (
            <p className="text-[11px] mb-3" style={{ color: COLORS.amber }}>
              Confiance {docAnalysis.extracted.confiance} sur ces informations — vérifie-les avant/après application.
            </p>
          )}
          <div className="flex gap-2">
            <Btn size="sm" variant="primary" onClick={applyDocAnalysis}>Appliquer la sélection</Btn>
            <Btn size="sm" variant="ghost" onClick={() => setDocAnalysis(null)}>Ignorer</Btn>
          </div>
        </Card>
      )}

      {headerEdit ? (
        <>
          <Card className="p-4 mb-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <Field label="Nom du chantier"><TextInput value={chantier.titre || ""} onChange={(e) => updateHeaderField({ titre: e.target.value })} /></Field>
            <Field label="Client"><TextInput value={chantier.client || ""} onChange={(e) => updateHeaderField({ client: e.target.value })} /></Field>
            <Field label="Email client"><TextInput type="email" placeholder="contact@client.fr" value={chantier.clientEmail || ""} onChange={(e) => updateHeaderField({ clientEmail: e.target.value })} /></Field>
            <Field label="N° chantier"><TextInput value={chantier.nChantier || ""} onChange={(e) => updateHeaderField({ nChantier: e.target.value })} /></Field>
            <Field label="BET / Archi"><TextInput value={chantier.betArchi || ""} onChange={(e) => updateHeaderField({ betArchi: e.target.value })} /></Field>
            <Field label="Date démarrage"><TextInput type="date" value={chantier.dateDemarrage || ""} onChange={(e) => updateHeaderField({ dateDemarrage: e.target.value })} /></Field>
            <Field label="Durée prévue"><TextInput value={chantier.dureePrevue || ""} onChange={(e) => updateHeaderField({ dureePrevue: e.target.value })} /></Field>
            <div className="flex items-end gap-2">
              <Btn variant="primary" onClick={() => setHeaderEdit(false)}>Terminé</Btn>
            </div>
          </Card>
          <p className="text-xs mb-5" style={{ color: COLORS.inkSoft, marginTop: -8 }}>
            Chaque champ est enregistré automatiquement dès que tu le modifies. Pour les documents contractuels attendus (Acte d'engagement, OS, CCAP, DC4...), utilise les boutons "+" dans le bloc "Documents contractuels" ci-dessus.
          </p>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: COLORS.ink }}>Marché principal &amp; TS</span>
            <Btn size="sm" variant="ghost" onClick={addMarche}><Plus size={13} /> Ajouter un marché / TS</Btn>
            <Btn size="sm" variant="ghost" onClick={addProrataBloc}><Plus size={13} /> Ajouter un bloc PRORATA</Btn>
          </div>
          <div className="flex flex-col gap-3 mb-5">
            {chantier.marches.map((m) => (
              <Card key={m.id} className="p-4">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <TextInput value={m.nom} onChange={(e) => updateMarche(m.id, { nom: e.target.value })} style={{ fontWeight: 600, fontSize: 14, border: "none", padding: "2px 0", flex: "0 1 auto", width: 110 }} />
                  <TextInput
                    value={m.description || ""}
                    onChange={(e) => updateMarche(m.id, { description: e.target.value })}
                    placeholder="Nom / description (optionnel)"
                    style={{ flex: 1, fontSize: 13 }}
                  />
                  {chantier.marches.length > 1 && (
                    <button onClick={() => removeMarche(m.id)} title="Supprimer ce marché/TS"><X size={14} color={COLORS.red} /></button>
                  )}
                </div>
                <p className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
                  Affiché partout comme : <span className="font-medium">{marcheDisplayName(m)}</span>
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                  <Field label="Type de bloc">
                    <select value={m.type || "ts"} onChange={(e) => updateMarche(m.id, { type: e.target.value })} style={inputStyle} className="outline-none focus:ring-2">
                      <option value="principal">Marché principal</option>
                      <option value="ts">TS / avenant</option>
                      <option value="prorata">PRORATA</option>
                    </select>
                  </Field>
                  {m.type !== "prorata" && (
                    <>
                      <Field label="Montant HT"><TextInput type="number" value={m.montantHt ?? ""} onChange={(e) => updateMarche(m.id, { montantHt: e.target.value === "" ? "" : parseFloat(e.target.value) })} /></Field>
                      <Field label="Retenue de garantie (RG)">
                        <select value={m.rgMode || "5pct"} onChange={(e) => updateMarche(m.id, { rgMode: e.target.value })} style={inputStyle} className="outline-none focus:ring-2">
                          <option value="5pct">5 %</option>
                          <option value="banque">Caution banque</option>
                          <option value="aucune">Pas de RG</option>
                        </select>
                      </Field>
                      <Field label="Prorata % (ex 0.01)"><TextInput type="number" step="0.001" value={m.prorataPct ?? ""} onChange={(e) => updateMarche(m.id, { prorataPct: e.target.value === "" ? "" : parseFloat(e.target.value) })} /></Field>
                      <Field label="ADD (montant)"><TextInput type="number" value={m.addMontant ?? ""} onChange={(e) => updateMarche(m.id, { addMontant: e.target.value === "" ? "" : parseFloat(e.target.value) })} /></Field>
                      <Field label="Date ADD"><TextInput type="date" value={m.addDate || ""} onChange={(e) => updateMarche(m.id, { addDate: e.target.value })} /></Field>
                      {m.addMontant ? (() => {
                        const autoRembourse = chantier.situations.filter((s) => s.marcheId === m.id).reduce((a, s) => a + (s.rembAdd || 0), 0);
                        const isManual = m.addRembourseManuel !== "" && m.addRembourseManuel !== null && m.addRembourseManuel !== undefined;
                        return (
                          <Field label="Déjà remboursé (ADD)">
                            <TextInput
                              type="number" step="0.01"
                              value={m.addRembourseManuel ?? ""}
                              placeholder={fmtEUR(autoRembourse)}
                              onChange={(e) => updateMarche(m.id, { addRembourseManuel: e.target.value === "" ? "" : parseFloat(e.target.value) })}
                            />
                            <p className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>
                              Somme auto de la colonne "Remb. ADD" des situations : <span className="font-medium">{fmtEUR(autoRembourse)}</span>
                              {isManual && (
                                <> · <button type="button" onClick={() => updateMarche(m.id, { addRembourseManuel: "" })} style={{ color: COLORS.accent, textDecoration: "underline" }}>revenir à l'auto</button></>
                              )}
                            </p>
                          </Field>
                        );
                      })() : null}
                      <Field label="Régime de TVA (s'applique à toutes les situations de ce marché/TS)">
                        <select value={m.tvaRegime || "085"} onChange={(e) => updateMarche(m.id, { tvaRegime: e.target.value })} style={inputStyle} className="outline-none focus:ring-2">
                          {Object.entries(TVA_REGIMES).map(([key, r]) => (
                            <option key={key} value={key}>{r.label}</option>
                          ))}
                        </select>
                      </Field>
                    </>
                  )}
                  {m.type === "prorata" && (
                    <p className="text-xs" style={{ color: COLORS.inkSoft, gridColumn: "1 / -1" }}>
                      Montant HT, TVA, RG... se renseignent directement sur chaque situation enregistrée dans ce bloc.
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: COLORS.ink }}>Cession de paiement fournisseur</span>
            <span className="text-xs" style={{ color: COLORS.inkSoft }}>commune à tout le chantier — pas de répétition par marché/TS</span>
          </div>
          <Card className="p-4 mb-5">
            <Field label="Cession de paiement fournisseur ?">
              <select value={chantier.cessionPaiement || "NON"} onChange={(e) => updateChantier({ ...chantier, cessionPaiement: e.target.value })} style={{ ...inputStyle, maxWidth: 200 }} className="outline-none focus:ring-2">
                <option value="NON">Non</option>
                <option value="OUI">Oui</option>
              </select>
            </Field>
            {chantier.cessionPaiement === "OUI" && (
              <div className="mt-3">
                <span className="text-xs font-medium" style={{ color: COLORS.inkSoft }}>Fournisseur(s) cessionnaire(s) — enveloppe globale par fournisseur</span>
                {(chantier.fournisseurs || []).map((f, idx) => {
                  const utilise = montantUtiliseFournisseur(f.nom);
                  const restant = f.enveloppe !== "" && f.enveloppe != null ? Math.round((f.enveloppe - utilise) * 100) / 100 : null;
                  return (
                    <div key={idx} className="mt-1.5">
                      <div className="flex items-center gap-2">
                        <TextInput value={f.nom} onChange={(e) => updateChantierFournisseur(idx, "nom", e.target.value)} placeholder="Nom du fournisseur" style={{ flex: 2 }} />
                        <TextInput type="number" step="0.01" value={f.enveloppe ?? ""} onChange={(e) => updateChantierFournisseur(idx, "enveloppe", e.target.value === "" ? "" : parseFloat(e.target.value))} placeholder="Enveloppe totale" style={{ flex: 1 }} />
                        {renderFournisseurCessionBubble(f)}
                        <button onClick={() => removeChantierFournisseur(idx)} title="Supprimer"><X size={13} color={COLORS.red} /></button>
                      </div>
                      {restant !== null && (
                        <p className="text-xs mt-0.5" style={{ color: restant < 0 ? COLORS.red : COLORS.inkSoft }}>
                          {fmtEUR(utilise)} déjà cédés sur les situations — reste {fmtEUR(restant)} disponible
                        </p>
                      )}
                    </div>
                  );
                })}
                <button onClick={addChantierFournisseur} className="text-xs font-medium mt-1.5" style={{ color: COLORS.accent }}>+ Ajouter un fournisseur</button>
              </div>
            )}
          </Card>
        </>
      ) : (
        <>
          <ResponsiveGrid min={130} className="mb-3">
            <Card className="p-3"><div className="text-xs" style={{ color: COLORS.inkSoft }}>Marché HT (total)</div><div className="text-sm font-semibold tabular-nums">{fmtEUR(totalMarcheHt)}</div></Card>
            <Card className="p-3"><div className="text-xs" style={{ color: COLORS.inkSoft }}>Marché TTC (total)</div><div className="text-sm font-semibold tabular-nums">{fmtEUR(totalMarcheTtc)}</div></Card>
            <Card className="p-3"><div className="text-xs" style={{ color: COLORS.inkSoft }}>Facturé TTC</div><div className="text-sm font-semibold tabular-nums">{fmtEUR(totalFactureTtc)}</div></Card>
            <Card className="p-3"><div className="text-xs" style={{ color: COLORS.inkSoft }}>Reste à facturer TTC</div><div className="text-sm font-semibold tabular-nums">{fmtEUR(resteAFacturer)}</div></Card>
            <Card className="p-3"><div className="text-xs" style={{ color: COLORS.inkSoft }}>En attente règlement</div><div className="text-sm font-semibold tabular-nums" style={{ color: totalAttente > 0 ? COLORS.amber : COLORS.green }}>{fmtEUR(totalAttente)}</div></Card>
          </ResponsiveGrid>

          {allSupplierNames.length > 0 && (
            <Card className="p-3 mb-3">
              <div className="text-xs font-medium mb-2" style={{ color: COLORS.inkSoft }}>Cessions fournisseurs — montant restant disponible</div>
              <div className="flex flex-col gap-1.5">
                {(chantier.fournisseurs || []).filter((f) => f.nom).map((f, idx) => {
                  const utilise = montantUtiliseFournisseur(f.nom);
                  const hasEnveloppe = f.enveloppe !== "" && f.enveloppe != null;
                  const restant = hasEnveloppe ? Math.round((f.enveloppe - utilise) * 100) / 100 : null;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs gap-2">
                      <span style={{ color: COLORS.ink }}>
                        <span className="font-medium">{f.nom}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {hasEnveloppe ? (
                          <span className="tabular-nums" style={{ color: restant < 0 ? COLORS.red : COLORS.ink }}>
                            {fmtEUR(restant)} <span style={{ color: COLORS.inkSoft }}>restant sur {fmtEUR(f.enveloppe)}</span>
                          </span>
                        ) : (
                          <span className="tabular-nums" style={{ color: COLORS.inkSoft }}>{fmtEUR(utilise)} cédés (pas d'enveloppe définie)</span>
                        )}
                        {renderFournisseurCessionBubble(f)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

        </>
      )}

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold" style={{ color: COLORS.ink }}>Situations ({chantier.situations.length})</h2>
      </div>
      {situationDocError && <p className="text-xs mb-2" style={{ color: COLORS.red }}>{situationDocError}</p>}
      {emailNotice && <p className="text-xs mb-2" style={{ color: COLORS.accent }}>{emailNotice}</p>}

      {(() => {
        // % d'avancement toujours calculé EN DIRECT à partir des situations
        // actuelles (jamais depuis la valeur enregistrée sur la situation,
        // qui ne se met à jour que quand CETTE situation précise est
        // sauvegardée, ou au tout premier chargement de la page) — sinon la
        // situation n°1 peut continuer d'afficher un % périmé après l'ajout
        // ou la modification d'une autre situation du même marché dans la
        // même session, tant que la page n'a pas été rechargée.
        const pctMap = computeSituationPercentages(chantier.situations, chantier.marches);
        // Une bulle PDF pour un type de document donné ("recap" ou
        // "avancement") sur une situation donnée. Toujours consultable
        // (ouverture du PDF déjà déposé) même en lecture seule ; seuls le
        // dépôt/remplacement/suppression sont réservés au mode édition.
        const renderSituationDocBubble = (s, docType, label) => {
          const meta = situationDocMeta(s, docType);
          const stateKey = s.id + ":" + docType;
          const isUploading = uploadingSituationDocId === stateKey;
          const isDragOver = dragOverSituationId === stateKey;
          const clickable = !isUploading && (meta.present || unlocked);
          const typeLabel = docType === "recap" ? "Récapitulatif" : docType === "ea" ? "État d'acompte" : docType === "facture" ? "Facture signée" : "Avancement";
          return (
            <div
              key={docType}
              onDragOver={(e) => { if (!unlocked || isUploading) return; e.preventDefault(); setDragOverSituationId(stateKey); }}
              onDragLeave={() => setDragOverSituationId((k) => (k === stateKey ? null : k))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverSituationId((k) => (k === stateKey ? null : k));
                if (!unlocked || isUploading) return;
                const f = e.dataTransfer.files && e.dataTransfer.files[0];
                if (f) uploadSituationDocument(s.id, docType, f);
              }}
              onClick={() => {
                if (isUploading) return;
                if (meta.present) { openSituationDocument(s.id, docType); return; }
                if (unlocked) triggerSituationDocUpload(s.id, docType);
              }}
              title={`${typeLabel}${meta.present ? " — " + (meta.fileName || "cliquer pour ouvrir") : unlocked ? " — cliquer ou glisser-déposer le PDF ici" : " — aucun PDF déposé"}`}
              className="relative inline-flex items-center justify-center"
              style={{
                width: 24, height: 24, borderRadius: 7,
                border: `1.5px ${meta.present ? "solid" : "dashed"} ${meta.present ? COLORS.green : isDragOver ? COLORS.accent : COLORS.line}`,
                background: meta.present ? COLORS.greenSoft : isDragOver ? COLORS.accentSoft : "#fff",
                cursor: clickable ? "pointer" : "default",
                opacity: isUploading ? 0.6 : 1,
              }}
            >
              {unlocked && meta.present && !isUploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeSituationDocument(s.id, docType); }}
                  title={`Retirer le PDF (${typeLabel})`}
                  style={{ position: "absolute", top: -6, right: -6, width: 13, height: 13, borderRadius: 999, background: "#fff", border: `1px solid ${COLORS.red}`, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                >
                  <X size={8} color={COLORS.red} />
                </button>
              )}
              {isUploading ? (
                <Loader2 size={11} color={COLORS.accent} className="animate-spin" />
              ) : (
                <span className="text-[9px] font-bold leading-none" style={{ color: meta.present ? COLORS.green : COLORS.inkSoft }}>{label}</span>
              )}
            </div>
          );
        };
        // Bulle "factures fournisseurs cédées" : accepte PLUSIEURS PDF (un
        // dépôt s'ajoute à la liste, n'écrase jamais les précédents — voir
        // uploadFournisseurFactureFiles). Quand une seule facture est
        // déposée, un clic sur la bulle l'ouvre directement dans un nouvel
        // onglet — exactement comme les bulles R/A/EA/F — pour que le geste
        // "je dépose une facture, je clique dessus pour la consulter" marche
        // du premier coup. À partir de 2 fichiers, un clic ne peut plus
        // désigner un fichier précis : il ouvre/ferme la petite liste
        // juste en dessous. Le petit chevron en bas à droite permet, dans
        // tous les cas, d'ouvrir cette liste pour consulter/retirer un
        // fichier précis (utile même s'il n'y en a qu'un, pour le retirer).
        const renderFournisseurFacturesBubble = (s) => {
          const files = s.fournisseurFactures || [];
          const stateKey = s.id + ":fournFact";
          const isUploading = uploadingSituationDocId === stateKey;
          const isDragOver = dragOverSituationId === stateKey;
          const present = files.length > 0;
          const listOpen = openFournisseurFacturesId === s.id;
          const clickable = !isUploading && (present || unlocked);
          return (
            <div
              key="fournFact"
              onDragOver={(e) => { if (!unlocked || isUploading) return; e.preventDefault(); setDragOverSituationId(stateKey); }}
              onDragLeave={() => setDragOverSituationId((k) => (k === stateKey ? null : k))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverSituationId((k) => (k === stateKey ? null : k));
                if (!unlocked || isUploading) return;
                const fs = Array.from(e.dataTransfer.files || []);
                if (fs.length) uploadFournisseurFactureFiles(s.id, fs);
              }}
              onClick={() => {
                if (isUploading) return;
                if (present) {
                  if (files.length === 1) { openFournisseurFactureFile(files[0]); return; }
                  setOpenFournisseurFacturesId((id) => (id === s.id ? null : s.id));
                  return;
                }
                if (unlocked) triggerFournisseurFactureUpload(s.id);
              }}
              title={`Factures fournisseurs cédées${present ? ` — ${files.length} déposée${files.length > 1 ? "s" : ""}, ${files.length === 1 ? "cliquer pour ouvrir" : "cliquer pour voir la liste"}` : unlocked ? " — cliquer ou glisser-déposer le(s) PDF ici" : " — aucune facture déposée"}`}
              className="relative inline-flex items-center justify-center"
              style={{
                width: 24, height: 24, borderRadius: 7,
                border: `1.5px ${present ? "solid" : "dashed"} ${present ? COLORS.green : isDragOver ? COLORS.accent : COLORS.line}`,
                background: present ? COLORS.greenSoft : isDragOver ? COLORS.accentSoft : "#fff",
                cursor: clickable ? "pointer" : "default",
                opacity: isUploading ? 0.6 : 1,
              }}
            >
              {unlocked && present && !isUploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); triggerFournisseurFactureUpload(s.id); }}
                  title="Ajouter une autre facture fournisseur"
                  style={{ position: "absolute", top: -6, right: -6, width: 13, height: 13, borderRadius: 999, background: "#fff", border: `1px solid ${COLORS.accent}`, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                >
                  <Plus size={8} color={COLORS.accent} />
                </button>
              )}
              {present && !isUploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenFournisseurFacturesId((id) => (id === s.id ? null : s.id)); }}
                  title={listOpen ? "Masquer la liste des factures" : "Voir le détail des factures déposées"}
                  style={{ position: "absolute", bottom: -6, right: -6, width: 13, height: 13, borderRadius: 999, background: "#fff", border: `1px solid ${COLORS.green}`, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                >
                  <ChevronDown size={9} color={COLORS.green} style={{ transform: listOpen ? "rotate(180deg)" : "none" }} />
                </button>
              )}
              {isUploading ? (
                <Loader2 size={11} color={COLORS.accent} className="animate-spin" />
              ) : (
                <span className="text-[9px] font-bold leading-none" style={{ color: present ? COLORS.green : COLORS.inkSoft }}>
                  {present ? files.length : "FF"}
                </span>
              )}
            </div>
          );
        };
        const renderMarcheBlock = (m) => {
        const sits = [...chantier.situations].filter((s) => s.marcheId === m.id).sort((a, b) => (a.dateFacture || "").localeCompare(b.dateFacture || ""));
        const totalHt = sits.reduce((a, s) => a + (s.montantHt || 0), 0);
        const isProrata = m.type === "prorata";
        return (
          <div key={m.id} className="mb-5">
            <div className="flex items-center justify-between mb-1.5 px-0.5 flex-wrap gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: isProrata ? "#8B5CF6" : COLORS.ink }}>{marcheDisplayName(m)}</span>
                {!isProrata && <Pill color="accent">{fmtEUR(m.montantHt)} HT marché</Pill>}
                <span className="text-xs" style={{ color: COLORS.inkSoft }}>
                  facturé {fmtEUR(totalHt)}
                  {!isProrata && (
                    <>
                      {m.montantHt ? ` · reste à facturer ${fmtEUR(Math.round((m.montantHt - totalHt) * 100) / 100)}` : ""}
                      {" · RG "}{m.rgMode === "banque" ? "caution banque" : m.rgMode === "aucune" ? "pas de RG" : fmtPct(m.rgPct)}
                      {m.addMontant ? ` · ADD ${fmtEUR(m.addMontant)}${m.addDate ? " le " + fmtDate(m.addDate) : ""} · déjà remboursé ${fmtEUR(addRembourseTotal(m.id))} · reste à rembourser ${fmtEUR(addResteARembourser(m.id))}` : ""}
                    </>
                  )}
                </span>
              </div>
              {unlocked && (
                <Btn size="sm" variant="ghost" onClick={() => openNew(m.id)}>
                  <Plus size={13} />
                  {!isProrata && " Situation sur ce marché"}
                </Btn>
              )}
            </div>
            <Card className="overflow-x-auto" style={isProrata ? { border: "1px solid #DDD6FE" } : undefined}>
              <div style={{ overflowX: "auto" }}>
                <table className="text-xs" style={{ width: "100%", minWidth: 1040 }}>
                  <thead>
                    <tr style={{ color: COLORS.inkSoft, background: isProrata ? "#F5F3FF" : "#F7F5EF" }}>
                      <th className="text-center font-medium px-1.5 py-2">PDF</th>
                      {!isProrata && <th className="text-left font-medium px-3 py-2">N°</th>}
                      <th className="text-left font-medium px-2 py-2">Facture</th>
                      <th className="text-left font-medium px-2 py-2">Date</th>
                      {!isProrata && <th className="text-right font-medium px-2 py-2">% Av.</th>}
                      <th className="text-right font-medium px-2 py-2">Mt HT</th>
                      <th className="text-right font-medium px-2 py-2">TTC</th>
                      {!isProrata && (
                        <>
                          <th className="text-right font-medium px-2 py-2">RG</th>
                          <th className="text-right font-medium px-2 py-2">Prorata</th>
                          <th className="text-right font-medium px-2 py-2">Remb. ADD</th>
                          <th className="text-right font-medium px-2 py-2">Fournisseur</th>
                        </>
                      )}
                      <th className="text-right font-medium px-2 py-2">À recevoir</th>
                      <th className="text-left font-medium px-2 py-2">Envoi</th>
                      <th className="text-left font-medium px-2 py-2">Val. BET</th>
                      <th className="text-left font-medium px-2 py-2">Paiement</th>
                      {unlocked && <th className="px-3 py-2"></th>}
                      <th className="px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sits.length === 0 && (
                      <tr><td colSpan={16} className="px-3 py-5 text-center" style={{ color: COLORS.inkSoft }}>Aucune situation sur ce marché</td></tr>
                    )}
                    {sits.map((s) => (
                      <tr key={s.id} style={{ borderTop: `1px solid ${COLORS.line}` }}>
                        <td className="px-1.5 py-2">
                          <div className="flex items-center gap-1">
                            {isProrata ? (
                              renderSituationDocBubble(s, "facture", "F")
                            ) : (
                              <>
                                {renderSituationDocBubble(s, "recap", "R")}
                                {renderSituationDocBubble(s, "avancement", "A")}
                                {renderSituationDocBubble(s, "ea", "EA")}
                              </>
                            )}
                            {renderFournisseurFacturesBubble(s)}
                          </div>
                          {openFournisseurFacturesId === s.id && (
                            <div className="flex flex-col gap-1 mt-1.5 p-1.5 rounded-md" style={{ background: "#F7F5EF", border: `1px solid ${COLORS.line}`, minWidth: 150 }}>
                              {(s.fournisseurFactures || []).map((f) => (
                                <div key={f.id} className="flex items-center justify-between gap-1.5">
                                  <button
                                    onClick={() => openFournisseurFactureFile(f)}
                                    title={f.fileName || "Ouvrir"}
                                    className="text-left truncate"
                                    style={{ color: COLORS.accent, fontSize: 10, maxWidth: 140 }}
                                  >
                                    {f.fileName || "Facture"}
                                  </button>
                                  {unlocked && (
                                    <button onClick={() => removeFournisseurFactureFile(s.id, f.id)} title="Retirer cette facture">
                                      <X size={9} color={COLORS.red} />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {unlocked && (
                                <button
                                  onClick={() => triggerFournisseurFactureUpload(s.id)}
                                  className="flex items-center gap-1 text-left"
                                  style={{ color: COLORS.accent, fontSize: 10 }}
                                >
                                  <Plus size={9} /> Ajouter
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        {!isProrata && (
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1">
                              {s.nSituation ?? "—"}
                              {s.note && (
                                <span title={s.note}>
                                  <StickyNote size={11} color={COLORS.accent} style={{ opacity: 0.8 }} />
                                </span>
                              )}
                            </span>
                          </td>
                        )}
                        <td className="px-2 py-2">
                          <span className="inline-flex items-center gap-1">
                            {s.nFact || "—"}
                            {isProrata && s.note && (
                              <span title={s.note}>
                                <StickyNote size={11} color={COLORS.accent} style={{ opacity: 0.8 }} />
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-2 py-2">{fmtDate(s.dateFacture)}</td>
                        {!isProrata && <td className="px-2 py-2 text-right tabular-nums">{fmtPct(pctMap.get(s.id) ?? s.pctAvancement)}</td>}
                        <td className="px-2 py-2 text-right tabular-nums">{fmtEUR(s.montantHt)}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{fmtEUR(s.montantTtc)}</td>
                        {!isProrata && (
                          <>
                            <td className="px-2 py-2 text-right tabular-nums">{fmtEUR(s.rg)}</td>
                            <td className="px-2 py-2 text-right tabular-nums">{s.prorata ? fmtEUR(s.prorata) : "—"}</td>
                            <td className="px-2 py-2 text-right tabular-nums">{s.rembAdd ? fmtEUR(s.rembAdd) : "—"}</td>
                            <td className="px-2 py-2 text-right tabular-nums">
                              {(s.fournisseurs && s.fournisseurs.length)
                                ? (s.fournisseurs.length === 1
                                    ? `${s.fournisseurs[0].nom} ${fmtEUR(s.fournisseurs[0].montant)}`
                                    : (
                                      <div className="flex flex-col items-end gap-0.5">
                                        {s.fournisseurs.map((f, idx) => (
                                          <span key={idx} className="whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{f.nom} {fmtEUR(f.montant)}</span>
                                        ))}
                                        <span className="font-medium whitespace-nowrap" style={{ color: COLORS.ink }}>
                                          Total {fmtEUR(s.fournisseurs.reduce((a, f) => a + (f.montant || 0), 0))}
                                        </span>
                                      </div>
                                    ))
                                : "—"}
                            </td>
                          </>
                        )}
                        <td className="px-2 py-2 text-right tabular-nums font-medium">{fmtEUR(s.totalARecevoir)}</td>
                        <td className="px-2 py-2" style={{ color: COLORS.inkSoft }}>{s.dateEnvoi ? fmtDate(s.dateEnvoi) : "—"}</td>
                        <td className="px-2 py-2" style={{ color: COLORS.inkSoft }}>{s.validBet ? fmtDate(s.validBet) : "—"}</td>
                        <td className="px-2 py-2">
                          {s.paye ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1">
                                <Pill color="green">{s.datePaiement ? fmtDate(s.datePaiement) : "réglé"}</Pill>
                                {hasMontantRegle(s) && Math.abs(Number(s.montantRegle) - (s.totalARecevoir || 0)) > 0.01 && (
                                  <span title={`Réglé ${fmtEUR(s.montantRegle)} au lieu de ${fmtEUR(s.totalARecevoir)} attendu`}>
                                    <AlertTriangle size={12} color={COLORS.red} />
                                  </span>
                                )}
                              </div>
                              {hasMontantRegle(s) && (
                                <span className="tabular-nums" style={{ color: Math.abs(Number(s.montantRegle) - (s.totalARecevoir || 0)) > 0.01 ? COLORS.red : COLORS.inkSoft }}>
                                  {fmtEUR(s.montantRegle)} reçu
                                </span>
                              )}
                            </div>
                          ) : hasMontantRegle(s) ? (
                            <div className="flex flex-col gap-0.5">
                              <Pill color="amber">partiel</Pill>
                              <span className="tabular-nums" style={{ color: COLORS.inkSoft }}>
                                {fmtEUR(s.montantRegle)} reçu · reste {fmtEUR(soldeRestant(s))}
                              </span>
                            </div>
                          ) : <Pill color="amber">en attente</Pill>}
                        </td>
                        {unlocked && (
                          <td className="px-3 py-2">
                            <div className="flex gap-1 justify-end">
                              <button title={s.paye ? "Modifier le règlement" : "Marquer réglé"} onClick={() => setPayingSituation(s)} className="p-1 rounded" style={{ background: s.paye ? COLORS.amberSoft : COLORS.greenSoft }}>
                                <Check size={12} color={s.paye ? COLORS.amber : COLORS.green} />
                              </button>
                              <button title="Modifier" onClick={() => openEdit(s)} className="p-1 rounded" style={{ background: COLORS.accentSoft }}>
                                <Settings size={12} color={COLORS.accent} />
                              </button>
                              <button title="Supprimer" onClick={() => deleteSituation(s.id)} className="p-1 rounded" style={{ background: COLORS.redSoft }}>
                                <X size={12} color={COLORS.red} />
                              </button>
                            </div>
                          </td>
                        )}
                        <td className="px-2 py-2">
                          <button
                            title="Envoyer cette situation par email (télécharge les PDF puis ouvre un brouillon pré-rempli)"
                            onClick={() => sendSituationByEmail(s, isProrata)}
                            disabled={sendingEmailId === s.id + ":send"}
                            className="p-1 rounded"
                            style={{ background: COLORS.accentSoft, opacity: sendingEmailId === s.id + ":send" ? 0.6 : 1 }}
                          >
                            {sendingEmailId === s.id + ":send" ? (
                              <Loader2 size={12} color={COLORS.accent} className="animate-spin" />
                            ) : (
                              <Send size={12} color={COLORS.accent} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );
        };

        const regular = chantier.marches.filter((m) => m.type !== "prorata");
        const prorata = chantier.marches.filter((m) => m.type === "prorata");
        return (
          <>
            {regular.map(renderMarcheBlock)}
            {prorata.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-2 mt-1">
                  <div className="h-px flex-1" style={{ background: "#DDD6FE" }} />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#6D28D9" }}>Prorata</span>
                  <div className="h-px flex-1" style={{ background: "#DDD6FE" }} />
                </div>
                {prorata.map(renderMarcheBlock)}
              </>
            )}
          </>
        );
      })()}

      {(() => {
        const marcheIds = new Set(chantier.marches.map((m) => m.id));
        const orphans = chantier.situations.filter((s) => !marcheIds.has(s.marcheId));
        if (orphans.length === 0) return null;
        return (
          <div className="mb-5">
            <div className="text-sm font-semibold mb-1.5" style={{ color: COLORS.red }}>Situations non rattachées à un marché ({orphans.length})</div>
            <Card className="overflow-x-auto p-2">
              {orphans.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs px-2 py-1.5" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                  <span>{s.nFact || s.nSituation} — {fmtDate(s.dateFacture)} — {fmtEUR(s.totalARecevoir)}</span>
                  {unlocked && <button onClick={() => openEdit(s)} className="text-xs font-medium" style={{ color: COLORS.accent }}>Rattacher un marché</button>}
                </div>
              ))}
            </Card>
          </div>
        );
      })()}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(22,35,59,0.55)" }}>
          <Card className="w-full max-w-2xl p-5 overflow-y-auto" style={{ maxHeight: "85vh" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base" style={{ color: COLORS.ink }}>{editingId ? "Modifier la situation" : "Nouvelle situation"}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} color={COLORS.inkSoft} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <Field label="Marché / TS">
                <select
                  value={form.marcheId || chantier.marches[0]?.id || ""}
                  onChange={(e) => setForm({ ...form, marcheId: e.target.value })}
                  style={inputStyle}
                  className="outline-none focus:ring-2"
                >
                  {chantier.marches.map((m) => (
                    <option key={m.id} value={m.id}>{marcheDisplayName(m)}</option>
                  ))}
                </select>
              </Field>
              {getMarche(form.marcheId || chantier.marches[0]?.id)?.type !== "prorata" && (
                <Field label="N° situation"><TextInput value={form.nSituation} onChange={(e) => setForm({ ...form, nSituation: e.target.value })} /></Field>
              )}
              <Field label="N° facture"><TextInput value={form.nFact} onChange={(e) => setForm({ ...form, nFact: e.target.value })} /></Field>
              <Field label="Date facture"><TextInput type="date" value={form.dateFacture} onChange={(e) => setForm({ ...form, dateFacture: e.target.value })} /></Field>
              <Field label="Montant HT"><TextInput type="number" step="0.01" value={form.montantHt} onChange={(e) => setFormAuto({ montantHt: e.target.value })} /></Field>
              {(() => {
                const selMarcheTva = getMarche(form.marcheId || chantier.marches[0]?.id);
                const isProrataForm = selMarcheTva?.type === "prorata";
                const rate = TVA_REGIMES[selMarcheTva?.tvaRegime]?.rate ?? 0.085;
                const marcheHt = num(selMarcheTva?.montantHt);
                const cumulHt = cumulativeMontantHt(selMarcheTva?.id || form.marcheId, num(form.montantHt), form.id, form);
                const pct = marcheHt ? (cumulHt / marcheHt) * 100 : 0;
                return (
                  <>
                    {!isProrataForm && (
                      <Field label="% Avancement (cumulé : total facturé sur ce marché / montant HT marché)">
                        <div style={{ ...inputStyle, background: "#F4F2ED", color: COLORS.inkSoft }}>
                          {pct.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %
                        </div>
                      </Field>
                    )}
                    <Field label={`TVA calculée (${TVA_REGIMES[selMarcheTva?.tvaRegime]?.label || "085"}, réglée sur le marché)`}>
                      <div style={{ ...inputStyle, background: "#F4F2ED", color: COLORS.inkSoft }}>
                        {fmtEUR(Math.round(num(form.montantHt) * rate * 100) / 100)}
                      </div>
                    </Field>
                    <Field label="Montant TTC (calculé)">
                      <div style={{ ...inputStyle, background: "#F4F2ED", color: COLORS.inkSoft }}>
                        {fmtEUR(Math.round((num(form.montantHt) + num(form.montantHt) * rate) * 100) / 100)}
                      </div>
                    </Field>
                  </>
                );
              })()}
              {getMarche(form.marcheId || chantier.marches[0]?.id)?.type !== "prorata" && (() => {
                const selMarche = getMarche(form.marcheId || chantier.marches[0]?.id);
                const selRgMode = selMarche && selMarche.rgMode;
                const rgOff = selRgMode === "banque" || selRgMode === "aucune";
                const rgOffLabel = selRgMode === "banque" ? "RG (couverte par caution banque)" : selRgMode === "aucune" ? "RG (aucune retenue de garantie)" : "RG (auto si vide, 5 %)";
                return (
                  <Field label={rgOffLabel}>
                    {rgOff ? (
                      <div style={{ ...inputStyle, background: "#F0EEE6", color: COLORS.inkSoft }}>0,00 €</div>
                    ) : (
                      <TextInput type="number" step="0.01" value={form.rg} onChange={(e) => setFormAuto({ rg: e.target.value })} />
                    )}
                  </Field>
                );
              })()}
              {getMarche(form.marcheId || chantier.marches[0]?.id)?.type !== "prorata" && (
                <>
                  <Field label="Prorata"><TextInput type="number" step="0.01" value={form.prorata} onChange={(e) => setFormAuto({ prorata: e.target.value })} /></Field>
                  <Field label="Remb. ADD"><TextInput type="number" step="0.01" value={form.rembAdd} onChange={(e) => setFormAuto({ rembAdd: e.target.value })} /></Field>
                </>
              )}
              {(() => {
                const selMarcheCalc = getMarche(form.marcheId || chantier.marches[0]?.id) || {};
                const isProrataForm = selMarcheCalc.type === "prorata";
                const rate = TVA_REGIMES[selMarcheCalc.tvaRegime]?.rate ?? 0.085;
                const ht = num(form.montantHt);
                const ttc = Math.round((ht + ht * rate) * 100) / 100;
                const rgOff = selMarcheCalc.rgMode === "banque" || selMarcheCalc.rgMode === "aucune";
                const rgPct = typeof selMarcheCalc.rgPct === "number" ? selMarcheCalc.rgPct : 0.05;
                const rg = isProrataForm ? 0 : rgOff ? 0 : (form.rg !== "" ? num(form.rg) : Math.round(ttc * rgPct * 100) / 100);
                const prorata = isProrataForm ? 0 : num(form.prorata);
                const fournisseurTotal = isProrataForm ? 0 : (form.fournisseurs || []).reduce((a, f) => a + (num(f.montant) || 0), 0);
                const remb = isProrataForm ? 0 : num(form.rembAdd);
                const autoTotal = Math.round((ttc - rg - prorata - fournisseurTotal - remb) * 100) / 100;
                const isManual = form.totalARecevoir !== "";
                return (
                  <Field label="Total à recevoir">
                    <TextInput type="number" step="0.01" value={form.totalARecevoir} placeholder={fmtEUR(autoTotal)} onChange={(e) => setForm({ ...form, totalARecevoir: e.target.value })} />
                    <p className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>
                      {isProrataForm ? (
                        <>Calcul auto (TTC) : <span className="font-medium">{fmtEUR(autoTotal)}</span></>
                      ) : (
                        <>Calcul auto (TTC − RG − Prorata − Cession fournisseur{remb ? " − Remb. ADD" : ""}) : <span className="font-medium">{fmtEUR(autoTotal)}</span></>
                      )}
                      {isManual && <> · <button type="button" onClick={() => setForm({ ...form, totalARecevoir: "" })} style={{ color: COLORS.accent, textDecoration: "underline" }}>revenir à l'auto</button></>}
                    </p>
                  </Field>
                );
              })()}
              <Field label="Date envoi"><TextInput type="date" value={form.dateEnvoi} onChange={(e) => setForm({ ...form, dateEnvoi: e.target.value })} /></Field>
              <Field label="Date dépôt Chorus"><TextInput type="date" value={form.dateDepotChorus || ""} onChange={(e) => setForm({ ...form, dateDepotChorus: e.target.value })} /></Field>
              <Field label="Validation BET"><TextInput type="date" value={form.validBet} onChange={(e) => setForm({ ...form, validBet: e.target.value })} /></Field>
              <Field label="Validation AMO"><TextInput type="date" value={form.validAmo} onChange={(e) => setForm({ ...form, validAmo: e.target.value })} /></Field>
              <Field label="Date paiement (laisser vide si non réglé)"><TextInput type="date" value={form.datePaiement} onChange={(e) => setForm({ ...form, datePaiement: e.target.value })} /></Field>
              <Field label="Montant réglé (si différent du montant à recevoir)"><TextInput type="number" step="0.01" value={form.montantRegle ?? ""} onChange={(e) => setForm({ ...form, montantRegle: e.target.value })} /></Field>
              <Field label="Note"><TextInput value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Remarque, contexte..." /></Field>
            </div>

            {getMarche(form.marcheId || chantier.marches[0]?.id)?.type !== "prorata" && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: COLORS.inkSoft }}>Cessions fournisseur (une ligne par fournisseur)</span>
                  <Btn size="sm" variant="ghost" onClick={addFournisseurRow}><Plus size={12} /> Ajouter un fournisseur</Btn>
                </div>
                {(!form.fournisseurs || form.fournisseurs.length === 0) && (
                  <p className="text-xs" style={{ color: COLORS.inkSoft }}>Aucun fournisseur cédé sur cette situation.</p>
                )}
                {(form.fournisseurs || []).map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <TextInput placeholder="Nom du fournisseur" value={f.nom} onChange={(e) => updateFournisseurRow(idx, "nom", e.target.value)} style={{ flex: 2 }} />
                    <TextInput type="number" step="0.01" placeholder="Montant" value={f.montant} onChange={(e) => updateFournisseurRow(idx, "montant", e.target.value)} style={{ flex: 1 }} />
                    <button onClick={() => removeFournisseurRow(idx)} title="Supprimer"><X size={14} color={COLORS.red} /></button>
                  </div>
                ))}
                {form.fournisseurs && form.fournisseurs.length > 0 && (
                  <p className="text-xs" style={{ color: COLORS.inkSoft }}>
                    Total cédé : {fmtEUR(form.fournisseurs.reduce((a, f) => a + (num(f.montant) || 0), 0))}
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-5">
              <Btn variant="ghost" onClick={() => setShowForm(false)}>Annuler</Btn>
              <Btn variant="primary" onClick={submitForm}>{editingId ? "Enregistrer" : "Ajouter"}</Btn>
            </div>
          </Card>
        </div>
      )}

      {payingSituation && (
        <MarkPaidModal
          defaultDate={payingSituation.datePaiement || new Date().toISOString().slice(0, 10)}
          defaultMontant={payingSituation.paye ? payingSituation.montantRegle : soldeRestant(payingSituation)}
          alreadyPaid={!!payingSituation.paye}
          onClose={() => setPayingSituation(null)}
          onConfirm={(date, montant) => confirmPaid(payingSituation.id, date, montant)}
          onUnmark={() => unmarkPaid(payingSituation.id)}
        />
      )}
    </div>
  );
}
// ---------- RG view ----------
// chantierId (facultatif) relie une RG échue/à venir à une fiche chantier réelle de
// l'appli — quand il est renseigné, marquer la RG comme réglée (voir markRgReceived)
// dépose automatiquement une mention "RETENUE DE GARANTIE ... RÉGLÉE LE ..." sur cette
// fiche. Laissé vide, la RG reste en saisie libre comme avant (elle disparaît juste des
// listes une fois réglée, sans mention automatique nulle part).
const emptyRgEchue = () => ({ id: uid("rg-e"), chantierId: "", nChantier: "", nom: "", montantHt: "", montantTtc: "", betMo: "", dateEnvoi: "", notes: "", validBet: false });
const emptyRgVenir = () => ({ id: uid("rg-v"), chantierId: "", nChantier: "", nom: "", montantHt: "", montantTtc: "", betMo: "", dateEcheance: "" });

function RgView({ rgDues, updateRg, unlocked, chantiers, setTab, setSelectedChantier, onExtractMarcheRgBulk }) {
  const [showEchue, setShowEchue] = useState(false);
  const [showVenir, setShowVenir] = useState(false);
  const [formE, setFormE] = useState(emptyRgEchue());
  const [formV, setFormV] = useState(emptyRgVenir());
  const autoRg = useMemo(() => computeAutoRgCumulees(chantiers), [chantiers]);

  // Dès qu'un chantier soldé à 100 % est détecté (voir computeAutoRgCumulees),
  // sa RG cumulée est aussitôt transformée en une vraie ligne "RG à venir"
  // (chantierId renseigné, pour la mention automatique sur la fiche chantier
  // une fois réglée — voir markRgReceived) au lieu de rester une simple
  // suggestion calculée à la volée. Elle devient alors modifiable comme
  // n'importe quelle ligne saisie à la main (date d'échéance, montants...) —
  // c'est ce qui manquait pour pouvoir corriger la date d'un chantier comme
  // SCI HORIZONS. rgExtracted est marqué dans le même mouvement pour que le
  // chantier ne soit plus jamais re-proposé par la détection auto.
  useEffect(() => {
    if (autoRg.length === 0) return;
    const newEntries = autoRg.map((item) => {
      const rate = TVA_REGIMES[item.tvaRegime]?.rate ?? 0.085;
      const montantHtRg = Math.round((item.totalRg / (1 + rate)) * 100) / 100;
      return {
        id: uid("rg-v"), chantierId: item.chantierId, nChantier: item.nChantier || "", nom: item.chantierTitre,
        montantHt: montantHtRg, montantTtc: item.totalRg, betMo: "",
        dateEcheance: new Date().toISOString().slice(0, 10),
      };
    });
    updateRg({ ...rgDues, aVenir: [...rgDues.aVenir, ...newEntries] });
    onExtractMarcheRgBulk(autoRg.map((item) => item.chantierId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRg]);

  function addEchue() {
    updateRg({ ...rgDues, echues: [...rgDues.echues, { ...formE, id: uid("rg-e") }] });
    setFormE(emptyRgEchue()); setShowEchue(false);
  }
  function addVenir() {
    updateRg({ ...rgDues, aVenir: [...rgDues.aVenir, { ...formV, id: uid("rg-v") }] });
    setFormV(emptyRgVenir()); setShowVenir(false);
  }
  function moveToEchue(item) {
    updateRg({
      aVenir: rgDues.aVenir.filter((r) => r.id !== item.id),
      echues: [...rgDues.echues, { ...item, dateEnvoi: new Date().toISOString().slice(0, 10), notes: "" }],
    });
  }
  function removeEchue(id) { updateRg({ ...rgDues, echues: rgDues.echues.filter((r) => r.id !== id) }); }
  function updateEchue(id, patch) { updateRg({ ...rgDues, echues: rgDues.echues.map((r) => (r.id === id ? { ...r, ...patch } : r)) }); }
  function removeVenir(id) { updateRg({ ...rgDues, aVenir: rgDues.aVenir.filter((r) => r.id !== id) }); }
  function updateVenir(id, patch) { updateRg({ ...rgDues, aVenir: rgDues.aVenir.map((r) => (r.id === id ? { ...r, ...patch } : r)) }); }

  const totalEchues = rgDues.echues.reduce((a, r) => a + (r.montantTtc || r.montantHt || 0), 0);

  return (
    <div className="p-4 max-w-6xl">
      <h1 className="text-xl font-semibold mb-1" style={{ color: COLORS.ink }}>Retenues de garantie</h1>
      <p className="text-sm mb-5" style={{ color: COLORS.inkSoft }}>Suivi des RG échues à réclamer et à venir</p>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold" style={{ color: COLORS.ink }}>RG échues — {fmtEUR(totalEchues)}</h2>
        {unlocked && <Btn size="sm" variant="primary" onClick={() => setShowEchue(true)}><Plus size={13} /> Ajouter</Btn>}
      </div>
      <Card className="overflow-x-auto mb-6">
        <div style={{ overflowX: "auto" }}>
        <table className="text-xs" style={{ width: "100%", minWidth: 820 }}>
          <thead>
            <tr style={{ color: COLORS.inkSoft, background: "#F7F5EF" }}>
              <th className="text-left font-medium px-3 py-2">N° chantier</th>
              <th className="text-left font-medium px-2 py-2">Nom</th>
              <th className="text-left font-medium px-2 py-2">Chantier lié</th>
              <th className="text-right font-medium px-2 py-2">Montant HT</th>
              <th className="text-right font-medium px-2 py-2">Montant TTC</th>
              <th className="text-left font-medium px-2 py-2">BET / MO</th>
              <th className="text-left font-medium px-2 py-2">Date envoi</th>
              <th className="text-center font-medium px-2 py-2">Validation BET</th>
              <th className="text-left font-medium px-2 py-2">Notes</th>
              {unlocked && <th className="px-3 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {rgDues.echues.length === 0 && <tr><td colSpan={10} className="px-3 py-6 text-center" style={{ color: COLORS.inkSoft }}>Aucune RG échue</td></tr>}
            {rgDues.echues.map((r) => (
              <tr key={r.id} style={{ borderTop: `1px solid ${COLORS.line}` }}>
                {unlocked ? (
                  <>
                    <td className="px-1 py-1"><TextInput value={r.nChantier || ""} onChange={(e) => updateEchue(r.id, { nChantier: e.target.value })} style={{ minWidth: 90 }} /></td>
                    <td className="px-1 py-1"><TextInput value={r.nom || ""} onChange={(e) => updateEchue(r.id, { nom: e.target.value })} style={{ minWidth: 120 }} /></td>
                    <td className="px-1 py-1">
                      <select
                        value={r.chantierId || ""}
                        onChange={(e) => {
                          const cid = e.target.value;
                          const ch = chantiers.find((c) => c.id === cid);
                          updateEchue(r.id, {
                            chantierId: cid,
                            nom: ch ? ch.titre : r.nom,
                            nChantier: ch ? (ch.nChantier || r.nChantier) : r.nChantier,
                          });
                        }}
                        style={{ ...inputStyle, minWidth: 140 }}
                        className="outline-none focus:ring-2"
                        title="Relie cette RG à une fiche chantier de l'appli — permet de poser automatiquement la mention 'réglée' dessus une fois la RG reçue"
                      >
                        <option value="">— aucun —</option>
                        {chantiers.filter((c) => !c.isFacturesLibres).map((c) => (
                          <option key={c.id} value={c.id}>{c.titre}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-1 py-1"><TextInput type="number" step="0.01" value={r.montantHt ?? ""} onChange={(e) => updateEchue(r.id, { montantHt: e.target.value === "" ? "" : parseFloat(e.target.value) })} style={{ minWidth: 90, textAlign: "right" }} /></td>
                    <td className="px-1 py-1"><TextInput type="number" step="0.01" value={r.montantTtc ?? ""} onChange={(e) => updateEchue(r.id, { montantTtc: e.target.value === "" ? "" : parseFloat(e.target.value) })} style={{ minWidth: 90, textAlign: "right" }} /></td>
                    <td className="px-1 py-1"><TextInput value={r.betMo || ""} onChange={(e) => updateEchue(r.id, { betMo: e.target.value })} style={{ minWidth: 90 }} /></td>
                    <td className="px-1 py-1"><TextInput type="date" value={r.dateEnvoi || ""} onChange={(e) => updateEchue(r.id, { dateEnvoi: e.target.value })} style={{ minWidth: 130 }} /></td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={!!r.validBet} onChange={(e) => updateEchue(r.id, { validBet: e.target.checked })} style={{ width: 15, height: 15 }} />
                    </td>
                    <td className="px-1 py-1"><TextInput value={r.notes || ""} onChange={(e) => updateEchue(r.id, { notes: e.target.value })} placeholder="Remarque..." style={{ minWidth: 130 }} /></td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2">{r.nChantier || "—"}</td>
                    <td className="px-2 py-2 font-medium">{r.nom}</td>
                    <td className="px-2 py-2">
                      {r.chantierId ? (
                        <button className="hover:underline text-left" style={{ color: COLORS.accent }} onClick={() => { setSelectedChantier(r.chantierId); setTab("chantierDetail"); }}>
                          Voir la fiche
                        </button>
                      ) : <span style={{ color: COLORS.inkSoft }}>—</span>}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">{fmtEUR(r.montantHt)}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{fmtEUR(r.montantTtc)}</td>
                    <td className="px-2 py-2">{r.betMo || "—"}</td>
                    <td className="px-2 py-2">{fmtDate(r.dateEnvoi)}</td>
                    <td className="px-2 py-2 text-center">{r.validBet ? <Check size={13} color={COLORS.green} /> : "—"}</td>
                    <td className="px-2 py-2" style={{ color: COLORS.inkSoft }}>{r.notes || "—"}</td>
                  </>
                )}
                {unlocked && <td className="px-3 py-2 text-right"><button onClick={() => removeEchue(r.id)}><X size={13} color={COLORS.red} /></button></td>}
              </tr>
            ))}
          </tbody>
        </table>
            </div>
      </Card>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold" style={{ color: COLORS.ink }}>RG à venir</h2>
        {unlocked && <Btn size="sm" variant="primary" onClick={() => setShowVenir(true)}><Plus size={13} /> Ajouter</Btn>}
      </div>
      <Card className="overflow-x-auto">
        <div style={{ overflowX: "auto" }}>
        <table className="text-xs" style={{ width: "100%", minWidth: 700 }}>
          <thead>
            <tr style={{ color: COLORS.inkSoft, background: "#F7F5EF" }}>
              <th className="text-left font-medium px-3 py-2">N° chantier</th>
              <th className="text-left font-medium px-2 py-2">Nom</th>
              <th className="text-right font-medium px-2 py-2">Montant HT</th>
              <th className="text-right font-medium px-2 py-2">Montant TTC</th>
              <th className="text-left font-medium px-2 py-2">BET / MO</th>
              <th className="text-left font-medium px-2 py-2">Échéance</th>
              <th className="text-left font-medium px-2 py-2">À réclamer ?</th>
              {unlocked && <th className="px-3 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {rgDues.aVenir.length === 0 && <tr><td colSpan={8} className="px-3 py-6 text-center" style={{ color: COLORS.inkSoft }}>Aucune RG à venir</td></tr>}
            {[...rgDues.aVenir].sort((a, b) => (a.dateEcheance || "9999").localeCompare(b.dateEcheance || "9999")).map((r) => {
              const d = daysUntil(r.dateEcheance);
              const soon = d !== null && d <= 30;
              return (
                <tr key={r.id} style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  {unlocked ? (
                    <>
                      <td className="px-1 py-1"><TextInput value={r.nChantier || ""} onChange={(e) => updateVenir(r.id, { nChantier: e.target.value })} style={{ minWidth: 90 }} /></td>
                      <td className="px-1 py-1"><TextInput value={r.nom || ""} onChange={(e) => updateVenir(r.id, { nom: e.target.value })} style={{ minWidth: 120 }} /></td>
                      <td className="px-1 py-1"><TextInput type="number" step="0.01" value={r.montantHt ?? ""} onChange={(e) => updateVenir(r.id, { montantHt: e.target.value === "" ? "" : parseFloat(e.target.value) })} style={{ minWidth: 90, textAlign: "right" }} /></td>
                      <td className="px-1 py-1"><TextInput type="number" step="0.01" value={r.montantTtc ?? ""} onChange={(e) => updateVenir(r.id, { montantTtc: e.target.value === "" ? "" : parseFloat(e.target.value) })} style={{ minWidth: 90, textAlign: "right" }} /></td>
                      <td className="px-1 py-1"><TextInput value={r.betMo || ""} onChange={(e) => updateVenir(r.id, { betMo: e.target.value })} style={{ minWidth: 90 }} /></td>
                      <td className="px-1 py-1"><TextInput type="date" value={r.dateEcheance || ""} onChange={(e) => updateVenir(r.id, { dateEcheance: e.target.value })} style={{ minWidth: 130 }} /></td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2">{r.nChantier || "—"}</td>
                      <td className="px-2 py-2 font-medium">{r.nom}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{fmtEUR(r.montantHt)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{fmtEUR(r.montantTtc)}</td>
                      <td className="px-2 py-2">{r.betMo || "—"}</td>
                      <td className="px-2 py-2">{fmtDate(r.dateEcheance)}</td>
                    </>
                  )}
                  <td className="px-2 py-2">{soon ? <Pill color="amber">oui — {d}j</Pill> : <Pill>non</Pill>}</td>
                  {unlocked && (
                    <td className="px-3 py-2">
                      <div className="flex gap-2 justify-end">
                        <button title="Marquer comme réclamée" onClick={() => moveToEchue(r)}><Check size={13} color={COLORS.green} /></button>
                        <button title="Supprimer" onClick={() => removeVenir(r.id)}><X size={13} color={COLORS.red} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
            </div>
      </Card>

      {showEchue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(22,35,59,0.55)" }}>
          <Card className="w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold" style={{ color: COLORS.ink }}>Nouvelle RG échue</h3><button onClick={() => setShowEchue(false)}><X size={18} color={COLORS.inkSoft} /></button></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              <Field label="Chantier lié (facultatif)">
                <select
                  value={formE.chantierId || ""}
                  onChange={(e) => {
                    const cid = e.target.value;
                    const ch = chantiers.find((c) => c.id === cid);
                    setFormE({ ...formE, chantierId: cid, nom: ch ? ch.titre : formE.nom, nChantier: ch ? (ch.nChantier || formE.nChantier) : formE.nChantier });
                  }}
                  style={inputStyle}
                  className="outline-none focus:ring-2"
                >
                  <option value="">— aucun (saisie libre) —</option>
                  {chantiers.filter((c) => !c.isFacturesLibres).map((c) => (
                    <option key={c.id} value={c.id}>{c.titre}</option>
                  ))}
                </select>
              </Field>
              <Field label="N° chantier"><TextInput value={formE.nChantier} onChange={(e) => setFormE({ ...formE, nChantier: e.target.value })} /></Field>
              <Field label="Nom"><TextInput value={formE.nom} onChange={(e) => setFormE({ ...formE, nom: e.target.value })} /></Field>
              <Field label="Montant HT"><TextInput type="number" value={formE.montantHt} onChange={(e) => setFormE({ ...formE, montantHt: e.target.value })} /></Field>
              <Field label="Montant TTC"><TextInput type="number" value={formE.montantTtc} onChange={(e) => setFormE({ ...formE, montantTtc: e.target.value })} /></Field>
              <Field label="BET / MO"><TextInput value={formE.betMo} onChange={(e) => setFormE({ ...formE, betMo: e.target.value })} /></Field>
              <Field label="Date envoi"><TextInput type="date" value={formE.dateEnvoi} onChange={(e) => setFormE({ ...formE, dateEnvoi: e.target.value })} /></Field>
              <Field label="Notes"><TextInput value={formE.notes} onChange={(e) => setFormE({ ...formE, notes: e.target.value })} /></Field>
            </div>
            <div className="flex justify-end gap-2 mt-4"><Btn variant="ghost" onClick={() => setShowEchue(false)}>Annuler</Btn><Btn variant="primary" onClick={addEchue}>Ajouter</Btn></div>
          </Card>
        </div>
      )}
      {showVenir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(22,35,59,0.55)" }}>
          <Card className="w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold" style={{ color: COLORS.ink }}>Nouvelle RG à venir</h3><button onClick={() => setShowVenir(false)}><X size={18} color={COLORS.inkSoft} /></button></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              <Field label="N° chantier"><TextInput value={formV.nChantier} onChange={(e) => setFormV({ ...formV, nChantier: e.target.value })} /></Field>
              <Field label="Nom"><TextInput value={formV.nom} onChange={(e) => setFormV({ ...formV, nom: e.target.value })} /></Field>
              <Field label="Montant HT"><TextInput type="number" value={formV.montantHt} onChange={(e) => setFormV({ ...formV, montantHt: e.target.value })} /></Field>
              <Field label="Montant TTC"><TextInput type="number" value={formV.montantTtc} onChange={(e) => setFormV({ ...formV, montantTtc: e.target.value })} /></Field>
              <Field label="BET / MO"><TextInput value={formV.betMo} onChange={(e) => setFormV({ ...formV, betMo: e.target.value })} /></Field>
              <Field label="Date échéance"><TextInput type="date" value={formV.dateEcheance} onChange={(e) => setFormV({ ...formV, dateEcheance: e.target.value })} /></Field>
            </div>
            <div className="flex justify-end gap-2 mt-4"><Btn variant="ghost" onClick={() => setShowVenir(false)}>Annuler</Btn><Btn variant="primary" onClick={addVenir}>Ajouter</Btn></div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ---------- Sous-traitants ----------
// Deux sections : le répertoire (entreprises réutilisables d'un chantier à
// l'autre, éditable ici même) et la vue globale de tous les contrats déjà
// saisis sur les chantiers (lecture seule ici — l'édition détaillée d'un
// contrat, avec ses bulles PDF DC4/Contrat/attestations, se fait toujours
// depuis la fiche du chantier concerné ; cliquer une ligne y amène).
function SousTraitantsView({ chantiers, sousTraitants, unlocked, setTab, setSelectedChantier, onAddSousTraitant, onUpdateSousTraitant, onRemoveSousTraitant }) {
  const [section, setSection] = useState("repertoire");
  const [q, setQ] = useState("");

  const allContrats = useMemo(() => {
    const out = [];
    for (const c of chantiers) {
      if (c.isFacturesLibres) continue;
      const docs = c.documents || {};
      for (const e of (c.sousTraitance || [])) {
        const sst = sousTraitants.find((s) => s.id === e.sousTraitantId);
        const attestationsPresentes = ATTESTATION_TYPES.filter((a) => docPresent(docs, sousTraitanceDocKey(e.id, a.key))).length;
        out.push({
          ...e,
          chantierId: c.id,
          chantierTitre: c.titre,
          sousTraitantNom: sst ? sst.nom : "(sous-traitant supprimé du répertoire)",
          attestationsPresentes,
        });
      }
    }
    return out.sort((a, b) => (b.dateDebut || "").localeCompare(a.dateDebut || ""));
  }, [chantiers, sousTraitants]);

  const qLower = q.trim().toLowerCase();
  const filteredContrats = qLower
    ? allContrats.filter((e) => (e.sousTraitantNom || "").toLowerCase().includes(qLower) || (e.chantierTitre || "").toLowerCase().includes(qLower))
    : allContrats;
  const filteredRepertoire = qLower
    ? sousTraitants.filter((s) => (s.nom || "").toLowerCase().includes(qLower) || (s.representant || "").toLowerCase().includes(qLower))
    : sousTraitants;

  return (
    <div className="p-4 max-w-6xl">
      <h1 className="text-xl font-semibold mb-1" style={{ color: COLORS.ink }}>Sous-traitants</h1>
      <p className="text-sm mb-5" style={{ color: COLORS.inkSoft }}>
        Répertoire des entreprises sous-traitantes et vue globale de tous leurs contrats, tous chantiers confondus.
      </p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setSection("repertoire")}
          className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          style={{ background: section === "repertoire" ? COLORS.navy : "transparent", color: section === "repertoire" ? "#fff" : COLORS.inkSoft }}
        >
          Répertoire ({sousTraitants.length})
        </button>
        <button
          onClick={() => setSection("contrats")}
          className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          style={{ background: section === "contrats" ? COLORS.navy : "transparent", color: section === "contrats" ? "#fff" : COLORS.inkSoft }}
        >
          Tous les contrats ({allContrats.length})
        </button>
        <div className="relative ml-auto">
          <Search size={13} style={{ position: "absolute", left: 8, top: 9 }} color={COLORS.inkSoft} />
          <TextInput placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 26, width: 220 }} />
        </div>
      </div>

      {section === "repertoire" ? (
        <>
          {unlocked && (
            <div className="flex justify-end mb-2">
              <Btn size="sm" variant="primary" onClick={() => onAddSousTraitant({})}><Plus size={13} /> Nouveau sous-traitant</Btn>
            </div>
          )}
          <Card className="overflow-x-auto">
            <div style={{ overflowX: "auto" }}>
              <table className="text-xs" style={{ width: "100%", minWidth: 1080 }}>
                <thead>
                  <tr style={{ color: COLORS.inkSoft, background: "#F7F5EF" }}>
                    <th className="text-left font-medium px-3 py-2">Entreprise</th>
                    <th className="text-left font-medium px-2 py-2">Représentant</th>
                    <th className="text-left font-medium px-2 py-2">Téléphone</th>
                    <th className="text-left font-medium px-2 py-2">Email</th>
                    <th className="text-left font-medium px-2 py-2">Banque</th>
                    <th className="text-left font-medium px-2 py-2">IBAN</th>
                    <th className="text-left font-medium px-2 py-2">SIRET</th>
                    <th className="text-left font-medium px-2 py-2">Adresse</th>
                    <th className="text-left font-medium px-2 py-2">Validité CACES</th>
                    {unlocked && <th className="px-3 py-2"></th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRepertoire.length === 0 && (
                    <tr><td colSpan={10} className="px-3 py-6 text-center" style={{ color: COLORS.inkSoft }}>Aucun sous-traitant{qLower ? " ne correspond à cette recherche" : ""}</td></tr>
                  )}
                  {filteredRepertoire.map((s) => {
                    const cacesDaysUntil = s.caces ? daysUntil(s.caces) : null;
                    const cacesExpired = cacesDaysUntil !== null && cacesDaysUntil < 0;
                    const cacesBientot = cacesDaysUntil !== null && cacesDaysUntil >= 0 && cacesDaysUntil <= 60;
                    return (
                      <tr key={s.id} style={{ borderTop: `1px solid ${COLORS.line}` }}>
                        {unlocked ? (
                          <>
                            <td className="px-1 py-1"><TextInput value={s.nom || ""} onChange={(e) => onUpdateSousTraitant(s.id, { nom: e.target.value })} style={{ minWidth: 140 }} /></td>
                            <td className="px-1 py-1"><TextInput value={s.representant || ""} onChange={(e) => onUpdateSousTraitant(s.id, { representant: e.target.value })} style={{ minWidth: 120 }} /></td>
                            <td className="px-1 py-1"><TextInput value={s.telephone || ""} onChange={(e) => onUpdateSousTraitant(s.id, { telephone: e.target.value })} style={{ minWidth: 100 }} /></td>
                            <td className="px-1 py-1"><TextInput value={s.email || ""} onChange={(e) => onUpdateSousTraitant(s.id, { email: e.target.value })} style={{ minWidth: 150 }} /></td>
                            <td className="px-1 py-1"><TextInput value={s.banque || ""} onChange={(e) => onUpdateSousTraitant(s.id, { banque: e.target.value })} style={{ minWidth: 90 }} /></td>
                            <td className="px-1 py-1"><TextInput value={s.iban || ""} onChange={(e) => onUpdateSousTraitant(s.id, { iban: e.target.value })} style={{ minWidth: 170 }} /></td>
                            <td className="px-1 py-1"><TextInput value={s.siret || ""} onChange={(e) => onUpdateSousTraitant(s.id, { siret: e.target.value })} style={{ minWidth: 110 }} /></td>
                            <td className="px-1 py-1"><TextInput value={s.adresse || ""} onChange={(e) => onUpdateSousTraitant(s.id, { adresse: e.target.value })} style={{ minWidth: 200 }} /></td>
                            <td className="px-1 py-1"><TextInput type="date" value={s.caces || ""} onChange={(e) => onUpdateSousTraitant(s.id, { caces: e.target.value })} style={{ minWidth: 130 }} /></td>
                            <td className="px-2 py-1"><button onClick={() => onRemoveSousTraitant(s.id)} title="Supprimer du répertoire"><Trash2 size={13} color={COLORS.red} /></button></td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2 font-medium" style={{ color: COLORS.ink }}>{s.nom || "—"}</td>
                            <td className="px-2 py-2">{s.representant || "—"}</td>
                            <td className="px-2 py-2">{s.telephone || "—"}</td>
                            <td className="px-2 py-2">{s.email || "—"}</td>
                            <td className="px-2 py-2">{s.banque || "—"}</td>
                            <td className="px-2 py-2">{s.iban || "—"}</td>
                            <td className="px-2 py-2">{s.siret || "—"}</td>
                            <td className="px-2 py-2">{s.adresse || "—"}</td>
                            <td className="px-2 py-2">
                              {s.caces ? (
                                <Pill color={cacesExpired ? "red" : cacesBientot ? "amber" : "green"}>{fmtDate(s.caces)}</Pill>
                              ) : "—"}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <Card className="overflow-x-auto">
          <div style={{ overflowX: "auto" }}>
            <table className="text-xs" style={{ width: "100%", minWidth: 900 }}>
              <thead>
                <tr style={{ color: COLORS.inkSoft, background: "#F7F5EF" }}>
                  <th className="text-left font-medium px-3 py-2">Sous-traitant</th>
                  <th className="text-left font-medium px-2 py-2">Chantier</th>
                  <th className="text-right font-medium px-2 py-2">Montant HT</th>
                  <th className="text-left font-medium px-2 py-2">Début</th>
                  <th className="text-left font-medium px-2 py-2">Fin</th>
                  <th className="text-left font-medium px-2 py-2">Statut DC4</th>
                  <th className="text-left font-medium px-2 py-2">Statut Contrat</th>
                  <th className="text-center font-medium px-2 py-2">Attestations</th>
                </tr>
              </thead>
              <tbody>
                {filteredContrats.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-6 text-center" style={{ color: COLORS.inkSoft }}>Aucun contrat de sous-traitance{qLower ? " ne correspond à cette recherche" : " enregistré pour l'instant"}</td></tr>
                )}
                {filteredContrats.map((e) => (
                  <tr key={e.id} style={{ borderTop: `1px solid ${COLORS.line}` }}>
                    <td className="px-3 py-2 font-medium" style={{ color: COLORS.ink }}>{e.sousTraitantNom}</td>
                    <td className="px-2 py-2">
                      <button className="hover:underline" style={{ color: COLORS.accent }} onClick={() => { setSelectedChantier(e.chantierId); setTab("chantierDetail"); }}>
                        {e.chantierTitre}
                      </button>
                    </td>
                    <td className="px-2 py-2 text-right">{fmtEUR(e.montant)}</td>
                    <td className="px-2 py-2">{fmtDate(e.dateDebut)}</td>
                    <td className="px-2 py-2">{fmtDate(e.dateFin)}</td>
                    <td className="px-2 py-2">{e.statutDc4 ? <Pill color={ssTraitanceStatutColor(e.statutDc4)}>{ssTraitanceStatutLabel(e.statutDc4)}</Pill> : "—"}</td>
                    <td className="px-2 py-2">{e.statutContrat ? <Pill color={ssTraitanceStatutColor(e.statutContrat)}>{ssTraitanceStatutLabel(e.statutContrat)}</Pill> : "—"}</td>
                    <td className="px-2 py-2 text-center">
                      <Pill color={e.attestationsPresentes === ATTESTATION_TYPES.length ? "green" : e.attestationsPresentes === 0 ? "red" : "amber"}>
                        {e.attestationsPresentes}/{ATTESTATION_TYPES.length}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------- Settings panel ----------
// ---------- Documents contractuels ----------
function DocumentsView({ chantiers, setTab, setSelectedChantier }) {
  const rows = chantiers
    .map((c) => ({ chantier: c, missing: missingDocuments(c) }))
    .filter((r) => r.missing.length > 0)
    .sort((a, b) => b.missing.length - a.missing.length);

  const totalMissing = rows.reduce((a, r) => a + r.missing.length, 0);

  return (
    <div className="p-4 max-w-6xl">
      <h1 className="text-xl font-semibold mb-1" style={{ color: COLORS.ink }}>Documents contractuels</h1>
      <p className="text-sm mb-5" style={{ color: COLORS.inkSoft }}>
        Documents cochés comme attendus (dans "Modifier les infos" de chaque chantier) mais pas encore déposés.
      </p>

      {rows.length === 0 ? (
        <Card className="p-8 text-center text-sm" style={{ color: COLORS.inkSoft }}>Tous les chantiers ont leurs documents essentiels 🎉</Card>
      ) : (
        <>
          <div className="text-sm font-semibold mb-3" style={{ color: COLORS.red }}>{rows.length} chantier(s) — {totalMissing} document(s) manquant(s)</div>
          <div className="flex flex-col gap-2">
            {rows.map(({ chantier, missing }) => (
              <Card key={chantier.id} className="p-3" style={{ background: COLORS.redSoft, border: "1px solid #E8C4BE" }}>
                <div className="flex items-center justify-between">
                  <button
                    className="font-medium text-sm hover:underline text-left"
                    style={{ color: COLORS.ink }}
                    onClick={() => { setSelectedChantier(chantier.id); setTab("chantierDetail"); }}
                  >
                    {chantier.titre}
                  </button>
                  <span className="text-xs" style={{ color: COLORS.inkSoft }}>{chantier.client || ""}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {missing.map((d) => (
                    <span key={d.key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs" style={{ background: "#fff", color: COLORS.red, border: "1px solid #E8C4BE" }}>
                      <X size={10} /> {d.label}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SettingsPanel({ onClose, editCode, onChangeCode, onReloadFromSource }) {
  const [code, setCode] = useState(editCode);
  const [confirmReload, setConfirmReload] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // même en cas d'erreur réseau, on tente la redirection : le
      // middleware redemandera le mot de passe si le cookie est toujours là.
    }
    window.location.href = "/login";
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(22,35,59,0.55)" }}>
      <Card className="w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-3"><h3 className="font-semibold" style={{ color: COLORS.ink }}>Réglages</h3><button onClick={onClose}><X size={18} color={COLORS.inkSoft} /></button></div>
        <Field label="Code d'édition (donné uniquement à Morgane)">
          <TextInput value={code} onChange={(e) => setCode(e.target.value)} />
        </Field>
        <p className="text-xs mt-2" style={{ color: COLORS.inkSoft }}>
          Ce code n'est pas un mot de passe sécurisé — c'est un simple verrou pour éviter les modifications accidentelles par l'équipe en consultation.
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={() => { onChangeCode(code); onClose(); }}>Enregistrer</Btn>
        </div>
        <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${COLORS.line}` }}>
          <p className="text-xs font-medium mb-1" style={{ color: COLORS.ink }}>Accès au site</p>
          <p className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>
            Utile sur un ordinateur partagé ou celui d'un collègue : ferme l'accès au site sur cet appareil (le mot de passe sera redemandé).
          </p>
          <Btn variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Déconnexion..." : "Se déconnecter de ce site"}
          </Btn>
        </div>
        <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${COLORS.line}` }}>
          <p className="text-xs font-medium mb-1" style={{ color: COLORS.ink }}>Recharger les données d'origine</p>
          <p className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>
            Tes saisies sont désormais toujours conservées, même après une mise à jour de l'outil. Utilise ceci uniquement si tu veux tout écraser avec les dernières données corrigées — <span style={{ color: COLORS.red, fontWeight: 500 }}>ça efface toutes tes saisies en cours</span>.
          </p>
          {!confirmReload ? (
            <Btn variant="ghost" size="sm" onClick={() => setConfirmReload(true)}>Recharger depuis les données source…</Btn>
          ) : (
            <div className="flex gap-2">
              <Btn variant="ghost" size="sm" onClick={() => setConfirmReload(false)}>Annuler</Btn>
              <Btn variant="primary" size="sm" onClick={() => { onReloadFromSource(); setConfirmReload(false); onClose(); }} style={{ background: COLORS.red }}>Oui, tout écraser</Btn>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
// ---------- Main App ----------
const DEFAULT_EDIT_CODE = "MK2026";
const DATA_VERSION = "2026-08-05-21";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [chantiers, setChantiers] = useState([]);
  const [rgDues, setRgDues] = useState({ echues: [], aVenir: [] });
  // Répertoire global des sous-traitants (réutilisable d'un chantier à
  // l'autre) — les contrats/DC4/attestations, eux, restent rattachés à
  // chaque chantier (chantier.sousTraitance, voir ChantierDetail).
  const [sousTraitants, setSousTraitants] = useState([]);
  const [editCode, setEditCode] = useState(DEFAULT_EDIT_CODE);
  const [unlocked, setUnlocked] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [selectedChantierId, setSelectedChantierId] = useState(null);
  const [saveError, setSaveError] = useState(false);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Compteur d'écritures en cours : tant qu'une sauvegarde est en vol, on ne
  // resynchronise pas depuis le serveur pour ne pas écraser localement ce
  // qu'on vient tout juste de modifier (voir refreshFromServer plus bas).
  const pendingWritesRef = useRef(0);

  // ---- Bouton "Annuler la dernière action" -------------------------------
  // On garde en mémoire (jamais en base) un historique des derniers états
  // (chantiers + rg-dues) tels qu'ils étaient AVANT chaque action de
  // modification déclenchée depuis l'appli. "Annuler" dépile le dernier
  // instantané et le réécrit tel quel — ça permet de revenir en arrière sur
  // les 2-3 (ou plus) dernières actions, une par une. Ce n'est pas un
  // vrai "refaire" : une fois qu'on a annulé, on ne peut pas re-avancer.
  const MAX_UNDO = 8;
  const chantiersRef = useRef([]);
  const rgDuesRef = useRef({ echues: [], aVenir: [] });
  const undoStackRef = useRef([]);
  const [undoCount, setUndoCount] = useState(0);
  useEffect(() => { chantiersRef.current = chantiers; }, [chantiers]);
  useEffect(() => { rgDuesRef.current = rgDues; }, [rgDues]);
  const pushUndoSnapshot = useCallback(() => {
    undoStackRef.current = [...undoStackRef.current, { chantiers: chantiersRef.current, rgDues: rgDuesRef.current }].slice(-MAX_UNDO);
    setUndoCount(undoStackRef.current.length);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let ch, rg, settings, stt;
        try { ch = await storage.get("chantiers", true); } catch { ch = null; }
        try { rg = await storage.get("rg-dues", true); } catch { rg = null; }
        try { settings = await storage.get("settings", true); } catch { settings = null; }
        try { stt = await storage.get("sous-traitants", true); } catch { stt = null; }

        const parsedSettings = settings && settings.value ? JSON.parse(settings.value) : {};
        // Once real data exists in storage, it always wins — never auto-overwrite it again.
        // (Earlier builds force-reseeded on every version bump, which silently wiped out
        // anything the person had already entered. Seeding now only ever happens once,
        // on a genuine first-ever load when nothing is stored yet.)
        if (ch && ch.value) {
          const parsedChantiers = JSON.parse(ch.value);
          const { changed, chantiers: fixedChantiers } = normalizeChantiersData(parsedChantiers);
          setChantiers(fixedChantiers);
          if (changed) {
            // Auto-réparation silencieuse de données déjà enregistrées avec
            // des champs numériques en string (voir normalizeChantiersData).
            storage.set("chantiers", JSON.stringify(fixedChantiers), true).catch(() => {});
          }
        } else {
          setChantiers(SEED_CHANTIERS);
          await storage.set("chantiers", JSON.stringify(SEED_CHANTIERS), true);
        }
        if (rg && rg.value) {
          setRgDues(JSON.parse(rg.value));
        } else {
          setRgDues(SEED_RG);
          await storage.set("rg-dues", JSON.stringify(SEED_RG), true);
        }
        if (settings && settings.value) {
          setEditCode(parsedSettings.editCode || DEFAULT_EDIT_CODE);
        } else {
          await storage.set("settings", JSON.stringify({ editCode: parsedSettings.editCode || DEFAULT_EDIT_CODE }), true);
        }
        if (stt && stt.value) {
          setSousTraitants(JSON.parse(stt.value));
        } else {
          setSousTraitants(SEED_SOUS_TRAITANTS);
          await storage.set("sous-traitants", JSON.stringify(SEED_SOUS_TRAITANTS), true);
        }
      } catch (e) {
        console.error("Erreur de chargement", e);
        setChantiers(SEED_CHANTIERS);
        setRgDues(SEED_RG);
        setSousTraitants(SEED_SOUS_TRAITANTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistChantiers = useCallback(async (next, opts) => {
    if (!opts || !opts.skipHistory) pushUndoSnapshot();
    setChantiers(next);
    chantiersRef.current = next;
    pendingWritesRef.current++;
    try {
      await storage.set("chantiers", JSON.stringify(next), true);
      setSaveError(false);
    } catch (e) {
      console.error("Erreur de sauvegarde", e);
      setSaveError(true);
    } finally {
      pendingWritesRef.current--;
    }
  }, [pushUndoSnapshot]);

  const persistRg = useCallback(async (next, opts) => {
    if (!opts || !opts.skipHistory) pushUndoSnapshot();
    setRgDues(next);
    rgDuesRef.current = next;
    pendingWritesRef.current++;
    try {
      await storage.set("rg-dues", JSON.stringify(next), true);
      setSaveError(false);
    } catch (e) {
      console.error("Erreur de sauvegarde", e);
      setSaveError(true);
    } finally {
      pendingWritesRef.current--;
    }
  }, [pushUndoSnapshot]);

  // Répertoire des sous-traitants : volontairement HORS du système "Annuler
  // la dernière action" (comme le code d'édition) — ce sont des fiches
  // contact, pas des saisies comptables où une fausse manip coûte cher.
  const persistSousTraitants = useCallback(async (next) => {
    setSousTraitants(next);
    pendingWritesRef.current++;
    try {
      await storage.set("sous-traitants", JSON.stringify(next), true);
      setSaveError(false);
    } catch (e) {
      console.error("Erreur de sauvegarde", e);
      setSaveError(true);
    } finally {
      pendingWritesRef.current--;
    }
  }, []);
  // Crée une entreprise dans le répertoire et retourne aussitôt son id
  // (avant même que la sauvegarde réseau ne se termine) : utilisé depuis la
  // fiche chantier pour affecter tout de suite la nouvelle entreprise au
  // contrat en cours de saisie, sans attendre un aller-retour serveur.
  const addSousTraitant = useCallback((patch) => {
    const entry = { ...emptySousTraitant(), ...patch };
    setSousTraitants((prev) => {
      const next = [...prev, entry];
      persistSousTraitants(next);
      return next;
    });
    return entry.id;
  }, [persistSousTraitants]);
  const updateSousTraitant = useCallback((id, patch) => {
    setSousTraitants((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s));
      persistSousTraitants(next);
      return next;
    });
  }, [persistSousTraitants]);
  // Ne supprime QUE la fiche du répertoire — les contrats déjà saisis sur
  // les chantiers restent tels quels (sousTraitantId ne pointera simplement
  // plus vers personne), pour ne jamais faire disparaître un contrat/DC4/
  // des attestations déjà déposées suite à la suppression d'une fiche.
  const removeSousTraitant = useCallback((id) => {
    setSousTraitants((prev) => {
      const next = prev.filter((s) => s.id !== id);
      persistSousTraitants(next);
      return next;
    });
  }, [persistSousTraitants]);

  // Dépile le dernier instantané et le réécrit (chantiers + rg-dues
  // ensemble, pour rester cohérent même si un seul des deux a changé).
  const undoLastAction = useCallback(() => {
    const stack = undoStackRef.current;
    if (!stack.length) return;
    const snapshot = stack[stack.length - 1];
    undoStackRef.current = stack.slice(0, -1);
    setUndoCount(undoStackRef.current.length);
    persistChantiers(snapshot.chantiers, { skipHistory: true });
    persistRg(snapshot.rgDues, { skipHistory: true });
  }, [persistChantiers, persistRg]);

  // Recharge silencieusement les données les plus récentes depuis le
  // serveur et remplace l'état local.
  //
  // Pourquoi c'est nécessaire : l'appli charge "chantiers"/"rg-dues" UNE
  // SEULE FOIS à l'ouverture, garde tout en mémoire, puis à CHAQUE
  // modification réécrit l'intégralité du tableau en base (pas seulement
  // la ligne changée). Si un onglet ou l'appli sur iPhone reste ouvert
  // plusieurs jours (iOS suspend l'appli en arrière-plan sans forcément la
  // recharger quand on y revient), sa copie en mémoire devient périmée. La
  // moindre saisie faite depuis cette session périmée réécrivait alors TOUT
  // avec cette copie ancienne — effaçant silencieusement les ajouts/
  // modifications faits entre-temps depuis une autre session (autre
  // appareil, ou l'appli rouverte le lendemain). C'est le bug remonté :
  // des données saisies "disparaissent" quelques jours plus tard.
  //
  // Le correctif : on resynchronise automatiquement depuis le serveur dès
  // que l'appli revient au premier plan (retour d'arrière-plan, onglet
  // réactivé) et périodiquement pendant qu'elle reste ouverte, pour que la
  // copie locale ne soit (quasiment) jamais périmée au moment d'une
  // sauvegarde. On saute la resynchro si une écriture est en cours
  // (pendingWritesRef) pour ne pas courir après notre propre sauvegarde.
  const refreshFromServer = useCallback(async () => {
    if (pendingWritesRef.current > 0) return;
    try {
      const [ch, rg, stt] = await Promise.all([
        storage.get("chantiers", true).catch(() => null),
        storage.get("rg-dues", true).catch(() => null),
        storage.get("sous-traitants", true).catch(() => null),
      ]);
      if (ch && ch.value) {
        const { chantiers: fixedChantiers } = normalizeChantiersData(JSON.parse(ch.value));
        setChantiers(fixedChantiers);
      }
      if (rg && rg.value) {
        setRgDues(JSON.parse(rg.value));
      }
      if (stt && stt.value) {
        setSousTraitants(JSON.parse(stt.value));
      }
    } catch (e) {
      console.error("Erreur de resynchronisation", e);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshFromServer();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refreshFromServer);
    // Resynchro immédiate dès que ces écouteurs sont posés (couvre le cas
    // où l'appli était déjà restée ouverte/suspendue avant ce chargement).
    // setTimeout(...,0) plutôt qu'un appel direct : on ne veut pas déclencher
    // un setState de façon synchrone pendant l'exécution de l'effet lui-même.
    const kickoffId = setTimeout(refreshFromServer, 0);
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") refreshFromServer();
    }, 3 * 60 * 1000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refreshFromServer);
      clearTimeout(kickoffId);
      clearInterval(intervalId);
    };
  }, [loading, refreshFromServer]);

  function updateChantier(updated) {
    persistChantiers(chantiers.map((c) => (c.id === updated.id ? updated : c)));
  }

  // Marque plusieurs chantiers "rgExtracted" en un seul persistChantiers (voir
  // RgView) : les appeler un par un ré-écrirait chaque fois depuis le même
  // "chantiers" figé au moment du rendu, et les appels précédents seraient
  // perdus (seul le dernier persisterait réellement).
  function markMarcheRgExtractedBulk(chantierIds) {
    const idSet = new Set(chantierIds);
    persistChantiers(chantiers.map((c) => (idSet.has(c.id) ? { ...c, rgExtracted: true } : c)));
  }

  function createChantier({ titre, client }) {
    const newC = {
      id: uid("ch"), sheet: titre, titre, client, clientEmail: "", nChantier: "", dateDemarrage: null,
      betArchi: null, dureePrevue: null, cessionPaiement: "NON", fournisseurs: [],
      marches: [{
        id: "marche-principal", nom: "Marché principal", montantHt: 0, tauxTva: 0.085,
        rgMode: "5pct", rgPct: 0.05, prorataPct: null,
        addMontant: null, addDate: null, tvaRegime: "085", type: "principal",
      }],
      situations: [],
      documents: { acteEngagement: false, ccap: false, devisSigne: false, avenants: [], dc4Statut: "manquant" },
      docTypesActifs: [],
      sousTraitance: [],
    };
    persistChantiers([...chantiers, newC]);
    setSelectedChantierId(newC.id);
    setTab("chantierDetail");
  }

  // Quick add for one-off small jobs billed in a single invoice — creates the chantier,
  // its (only) marché, and the situation itself in one step, without going through the
  // usual "set up the marché first" flow.
  const FACTURES_LIBRES_ID = "factures-libres";

  function archiveChantier(id, archived) {
    persistChantiers(chantiers.map((c) => (c.id === id ? { ...c, archived } : c)));
  }

  function deleteChantier(id) {
    persistChantiers(chantiers.filter((c) => c.id !== id));
    if (selectedChantierId === id) {
      setSelectedChantierId(null);
      setTab("chantiers");
    }
  }

  // Quick add for one-off small jobs billed in a single invoice — these are NOT chantiers.
  // They all live inside one shared, hidden container so they never clutter the Chantiers
  // list, but they still show up normally in "Règlements en attente" like any situation.
  function createFactureSeule({ titre, client, nFact, dateFacture, montantHt, tvaRegime }) {
    const rate = TVA_REGIMES[tvaRegime]?.rate ?? 0.085;
    const ht = montantHt || 0;
    const tva = Math.round(ht * rate * 100) / 100;
    const ttc = Math.round((ht + tva) * 100) / 100;
    const marcheId = uid("marche");
    const newMarche = {
      id: marcheId, nom: titre, montantHt: ht, tauxTva: rate,
      rgMode: "banque", rgPct: 0.05, prorataPct: null,
      addMontant: null, addDate: null, tvaRegime: tvaRegime || "085", type: "principal",
      factureClient: client || "",
    };
    const newSit = {
      id: uid("sit"), nSituation: 1, nFact: nFact || "", dateFacture: dateFacture || "",
      pctAvancement: 1, montantHt: ht, tva, montantTtc: ttc, rg: 0, avanceDeduite: 0, prorata: 0, rembAdd: 0,
      fournisseurs: [], totalARecevoir: ttc, dateEnvoi: dateFacture || "", validBet: "", validAmo: "", validAutre: "",
      datePaiement: "", montantRegle: null, dateDepotChorus: "", paye: false, note: "", marcheId,
    };
    const existing = chantiers.find((c) => c.id === FACTURES_LIBRES_ID);
    if (existing) {
      const updated = { ...existing, marches: [...existing.marches, newMarche], situations: [...existing.situations, newSit] };
      persistChantiers(chantiers.map((c) => (c.id === FACTURES_LIBRES_ID ? updated : c)));
    } else {
      const newC = {
        id: FACTURES_LIBRES_ID, sheet: "Factures ponctuelles", titre: "Factures ponctuelles", client: null,
        nChantier: "", dateDemarrage: null, betArchi: null, dureePrevue: null, cessionPaiement: "NON", fournisseurs: [],
        marches: [newMarche], situations: [newSit],
        documents: { acteEngagement: false, ccap: false, devisSigne: false, avenants: [], dc4Statut: "non_concerne" },
        docTypesActifs: [],
        sousTraitance: [],
        isFacturesLibres: true,
      };
      persistChantiers([...chantiers, newC]);
    }
    setSelectedChantierId(FACTURES_LIBRES_ID);
    setTab("chantierDetail");
  }

  function markPaid(chantierId, situationId, dateStr, montant) {
    const next = chantiers.map((c) => {
      if (c.id !== chantierId) return c;
      return { ...c, situations: c.situations.map((s) => {
        if (s.id !== situationId) return s;
        const dejaRecu = s.montantRegle || 0;
        const montantCePaiement = montant != null ? montant : Math.max(0, (s.totalARecevoir || 0) - dejaRecu);
        const totalRecu = Math.round((dejaRecu + montantCePaiement) * 100) / 100;
        const solde = Math.round(((s.totalARecevoir || 0) - totalRecu) * 100) / 100;
        return { ...s, datePaiement: dateStr, montantRegle: totalRecu, paye: solde <= 0.01 };
      }) };
    });
    persistChantiers(next);
  }

  function markAddPaid(chantierId, marcheId, dateStr) {
    const next = chantiers.map((c) => c.id !== chantierId ? c : {
      ...c, marches: c.marches.map((m) => (m.id === marcheId ? { ...m, addDate: dateStr } : m)),
    });
    persistChantiers(next);
  }

  // Retire la RG échue de la liste (elle disparaît donc à la fois de "RG
  // échues" et de "Règlements en attente"). Si elle était reliée à une fiche
  // chantier réelle (chantierId, voir emptyRgEchue), dépose en plus une
  // mention "RETENUE DE GARANTIE ... RÉGLÉE LE ..." sur cette fiche, pour
  // qu'elle reste visible même une fois la RG sortie des deux listes.
  function markRgReceived(rgEchueId, dateStr, montant) {
    const entry = rgDues.echues.find((r) => r.id === rgEchueId);
    persistRg({ ...rgDues, echues: rgDues.echues.filter((r) => r.id !== rgEchueId) });
    if (entry && entry.chantierId) {
      const montantFinal = montant != null ? montant : (entry.montantTtc || entry.montantHt || 0);
      const dateFinal = dateStr || new Date().toISOString().slice(0, 10);
      persistChantiers(chantiers.map((c) => c.id !== entry.chantierId ? c : {
        ...c,
        rgReglees: [...(c.rgReglees || []), { id: uid("rg-r"), montant: montantFinal, dateReglee: dateFinal, nom: entry.nom || "" }],
      }));
    }
  }

  // Supprime une ligne de RG échue directement — utilisé depuis "Règlements
  // en attente" (l'écran RG a déjà son propre bouton de suppression).
  function deleteRgEchue(rgEchueId) {
    persistRg({ ...rgDues, echues: rgDues.echues.filter((r) => r.id !== rgEchueId) });
  }

  function deleteSituationGlobal(chantierId, situationId) {
    const next = chantiers.map((c) => c.id !== chantierId ? c : { ...c, situations: c.situations.filter((s) => s.id !== situationId) });
    persistChantiers(next);
  }

  function changeEditCode(newCode) {
    setEditCode(newCode);
    storage.set("settings", JSON.stringify({ editCode: newCode }), true).catch(() => {});
  }

  function reloadFromSource() {
    persistChantiers(SEED_CHANTIERS);
    persistRg(SEED_RG);
  }

  const computed = useComputed(chantiers, rgDues);
  const selectedChantier = chantiers.find((c) => c.id === selectedChantierId);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
        <div className="flex items-center gap-2" style={{ color: COLORS.inkSoft }}>
          <Loader2 size={18} className="animate-spin" /> Chargement des données...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col" style={{ background: COLORS.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {isMobile && (
        <div className="flex items-center justify-between px-3 py-2.5 shrink-0" style={{ background: COLORS.navy }}>
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-md" aria-label="Menu">
            <Menu size={20} color="#fff" />
          </button>
          <img src={LOGO_SYNERGIE} alt="SYNERGIE BTP" style={{ height: 24 }} />
          <button onClick={() => (unlocked ? setUnlocked(false) : setShowGate(true))} className="p-1.5 rounded-md" aria-label="Édition">
            {unlocked ? <Unlock size={18} color={COLORS.green} /> : <Lock size={18} color="#B7C3D6" />}
          </button>
        </div>
      )}
      <div className="flex flex-1 min-h-0">
        <Sidebar
          tab={tab === "chantierDetail" ? "chantiers" : tab}
          setTab={(t) => { setTab(t); setSelectedChantierId(null); }}
          unlocked={unlocked}
          onLockClick={() => (unlocked ? setUnlocked(false) : setShowGate(true))}
          onSettingsClick={() => setShowSettings(true)}
          isMobile={isMobile}
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          undoCount={undoCount}
          onUndoClick={undoLastAction}
        />
      <div className="flex-1 overflow-y-auto">
        {saveError && (
          <div className="px-4 py-2 text-xs font-medium" style={{ background: COLORS.redSoft, color: COLORS.red }}>
            La dernière modification n'a pas pu être sauvegardée. Vérifiez la connexion et réessayez.
          </div>
        )}
        {tab === "dashboard" && <Dashboard chantiers={chantiers} rgDues={rgDues} computed={computed} setTab={setTab} setSelectedChantier={setSelectedChantierId} />}
        {tab === "reglements" && (
          <Reglements computed={computed} unlocked={unlocked} onMarkPaid={markPaid} onMarkAddPaid={markAddPaid} onMarkRgReceived={markRgReceived} onDeleteRgEchue={deleteRgEchue} setTab={setTab} setSelectedChantier={setSelectedChantierId} onCreateFactureSeule={createFactureSeule} onDeleteSituation={deleteSituationGlobal} />
        )}
        {tab === "chantiers" && (
          <ChantiersList chantiers={chantiers} setTab={setTab} setSelectedChantier={setSelectedChantierId} unlocked={unlocked} onCreateChantier={createChantier} onArchiveChantier={archiveChantier} onDeleteChantier={deleteChantier} />
        )}
        {tab === "archives" && (
          <ChantiersList chantiers={chantiers} setTab={setTab} setSelectedChantier={setSelectedChantierId} unlocked={unlocked} onCreateChantier={createChantier} onArchiveChantier={archiveChantier} onDeleteChantier={deleteChantier} archivedOnly />
        )}
        {tab === "chantierDetail" && selectedChantier && (
          <ChantierDetail chantier={selectedChantier} updateChantier={updateChantier} unlocked={unlocked} setTab={setTab} onArchiveChantier={archiveChantier} sousTraitants={sousTraitants} onAddSousTraitant={addSousTraitant} />
        )}
        {tab === "rg" && <RgView rgDues={rgDues} updateRg={persistRg} unlocked={unlocked} chantiers={chantiers} setTab={setTab} setSelectedChantier={setSelectedChantierId} onExtractMarcheRgBulk={markMarcheRgExtractedBulk} />}
        {tab === "documents" && <DocumentsView chantiers={chantiers} setTab={setTab} setSelectedChantier={setSelectedChantierId} />}
        {tab === "soustraitants" && (
          <SousTraitantsView
            chantiers={chantiers}
            sousTraitants={sousTraitants}
            unlocked={unlocked}
            setTab={setTab}
            setSelectedChantier={setSelectedChantierId}
            onAddSousTraitant={addSousTraitant}
            onUpdateSousTraitant={updateSousTraitant}
            onRemoveSousTraitant={removeSousTraitant}
          />
        )}
      </div>
      </div>

      {showGate && (
        <EditGateModal
          currentCode={editCode}
          onClose={() => setShowGate(false)}
          onUnlock={() => { setUnlocked(true); setShowGate(false); }}
        />
      )}
      {showSettings && (
        <SettingsPanel editCode={editCode} onChangeCode={changeEditCode} onClose={() => setShowSettings(false)} onReloadFromSource={reloadFromSource} />
      )}
    </div>
  );
}
