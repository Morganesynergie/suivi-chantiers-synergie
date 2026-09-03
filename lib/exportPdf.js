"use client";

// Ouverture des documents imprimables (situations, règlements, RG...).
//
// Dans un navigateur classique (Chrome/Safari desktop, onglet mobile normal),
// on garde le flux historique : une nouvelle fenêtre avec le HTML du
// document, et un bouton "Imprimer / Enregistrer en PDF" qui appelle
// window.print().
//
// MAIS : quand l'appli est installée sur l'écran d'accueil d'un iPhone
// ("Ajouter à l'écran d'accueil", mode PWA "standalone"), iOS/Safari ne
// fournit tout simplement AUCUNE interface d'impression aux apps lancées
// depuis l'écran d'accueil — window.print() ne fait rigoureusement rien,
// silencieusement, y compris dans une fenêtre ouverte avec window.open().
// C'est ce qui provoquait "je clique sur Imprimer/Enregistrer et il ne se
// passe rien" : l'app est bien installée en PWA sur le téléphone du
// collègue (pas d'onglet Safari visible dans sa vidéo).
//
// Dans ce cas, on génère un vrai fichier PDF côté client (html2canvas pour
// rendre le HTML en image, jsPDF pour assembler les pages) puis on
// l'ouvre via la fenêtre de partage native du téléphone (Enregistrer dans
// Fichiers, Imprimer, envoyer par mail/WhatsApp...), qui elle fonctionne
// très bien depuis une PWA.

let jsPDFPromise = null;
function loadJsPDF() {
  if (!jsPDFPromise) {
    jsPDFPromise = import("jspdf").then((m) => m.jsPDF || m.default);
  }
  return jsPDFPromise;
}

let html2canvasPromise = null;
function loadHtml2Canvas() {
  if (!html2canvasPromise) {
    html2canvasPromise = import("html2canvas").then((m) => m.default || m);
  }
  return html2canvasPromise;
}

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  return (
    window.navigator.standalone === true ||
    (typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches)
  );
}

// iPhone/iPad (y compris iPadOS 13+, qui se fait passer pour un Mac mais a
// un écran tactile — d'où le test maxTouchPoints).
function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || "";
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

// Le flux "génère un vrai PDF côté client puis ouvre le partage natif" n'a
// été conçu QUE pour contourner l'absence totale d'interface d'impression
// sur iOS/Safari en PWA installée (voir le commentaire en tête de fichier).
// isStandalonePwa() seule est trop large : une appli "installée" sous
// Windows (Edge/Chrome "Installer cette appli") matche aussi
// display-mode:standalone, alors que window.print() y fonctionne
// normalement. Sans ce garde-fou supplémentaire sur iOS, "Générer le PDF"
// déclenchait navigator.share() sur Windows, qui ouvre le volet de partage
// natif de Windows (Contacts, Partage à proximité, "Obtenir des
// applications"...) au lieu de simplement enregistrer/imprimer le PDF —
// c'est ce qui provoquait "ça me demande un contact / partage à
// proximité / obtenir des applications du store" chez Morgane.
function needsPdfShareFlow() {
  return isStandalonePwa() && isIOS();
}

// `pageNumbers`: quand true, tamponne "Page i / N" (texte vectoriel réel,
// pas rasterisé) en bas à droite de chaque page du PDF généré — utilisé par
// les documents qui doivent afficher une pagination fiable (contrat de
// sous-traitance, DC4). Chrome ne supporte pas les compteurs CSS
// (@page { @bottom-right { content: counter(page) } }) pour l'impression
// classique (window.print()), d'où le choix de sortir un vrai PDF (voir
// openGeneratedPdf ci-dessous) plutôt que de compter sur le CSS.
export async function generatePdfBlob(html, { pageNumbers = false } = {}) {
  const [jsPDFCtor, html2canvas] = await Promise.all([loadJsPDF(), loadHtml2Canvas()]);

  const PAGE_W = 794; // ~A4 à 96dpi
  const PAGE_H = 1123;
  // Marge (blanche) réservée en haut ET en bas de CHAQUE page du PDF final.
  // Sans ça, le découpage ci-dessous ne fait que couper l'image complète en
  // tranches brutes de PAGE_H pixels : seule la 1re page respire (grâce au
  // padding du <body>, qui n'existe qu'une fois, en haut du tout premier
  // pixel de contenu) — à partir de la 2e page, le contenu recommence pile
  // au ras du bord, sans aucune marge, et peut même chevaucher le numéro de
  // page tamponné en bas ("Page i / N", voir pageNumbers). GUTTER_TOP/BOTTOM
  // définissent la marge ajoutée uniformément sur toutes les pages ; CONTENT_H
  // est donc la hauteur de contenu réellement utilisable par page — c'est
  // CETTE valeur (et non PAGE_H brut) qui sert à la fois à décider où couper
  // les pages et où repousser les blocs "avoid-break" ci-dessous, pour que
  // les deux calculs restent cohérents entre eux.
  const GUTTER_TOP = 44;
  const GUTTER_BOTTOM = pageNumbers ? 40 : 26;
  const CONTENT_H = PAGE_H - GUTTER_TOP - GUTTER_BOTTOM;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = PAGE_W + "px";
  iframe.style.height = PAGE_H + "px";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  try {
    await new Promise((resolve) => {
      iframe.onload = resolve;
      iframe.srcdoc = html;
    });
    // Laisse le temps au DOM/images (logo en base64, déjà inline) de se stabiliser.
    await new Promise((r) => setTimeout(r, 150));

    const doc = iframe.contentDocument;
    // Le bandeau "Imprimer / Fermer" n'a de sens qu'à l'écran, pas dans le PDF final.
    const closeBar = doc.querySelector(".close-bar");
    if (closeBar) closeBar.remove();

    // Le découpage en pages ci-dessous est purement mécanique (tranches de
    // PAGE_H pixels dans l'image rendue) : sans intervention, un encadré
    // (bloc de signature, rubrique DC4...) qui tombe pile à cheval sur une
    // limite de page se retrouve tranché en deux — la moitié du bas atterrit
    // seule en haut de la page suivante, qui reste ensuite quasi vide. Les
    // blocs marqués "avoid-break" dans le HTML source sont donc repoussés en
    // haut de la page suivante s'ils chevauchent une limite de page, plutôt
    // que d'être coupés.
    const avoidBreakEls = Array.from(doc.querySelectorAll(".avoid-break"));
    for (const el of avoidBreakEls) {
      const top = el.offsetTop;
      const height = el.offsetHeight;
      if (height >= CONTENT_H) continue; // ne tiendrait de toute façon pas sur une seule page
      const topPage = Math.floor(top / CONTENT_H);
      const bottomPage = Math.floor((top + height - 1) / CONTENT_H);
      if (bottomPage > topPage) {
        const nextPageTop = (topPage + 1) * CONTENT_H;
        const currentMarginTop = parseFloat(iframe.contentWindow.getComputedStyle(el).marginTop) || 0;
        el.style.marginTop = `${currentMarginTop + (nextPageTop - top)}px`;
        // Le margin-top qu'on vient de poser peut fusionner avec le
        // margin-bottom de l'élément précédent (collapsing CSS standard entre
        // deux blocs voisins : l'écart réellement affiché est le MAX des deux
        // margins, pas leur somme). Résultat sans ce correctif : le bloc
        // n'est repoussé que partiellement, continue de chevaucher la limite
        // de page, et on voit un encadré vide (son haut, sans texte) en bas
        // d'une page suivi du même bloc, complet cette fois, en haut de la
        // suivante. On mesure donc la position réelle après coup et on
        // complète le margin-top si besoin, jusqu'à ce que le bloc atterrisse
        // effectivement en haut de la page suivante.
        let guard = 0;
        while (el.offsetTop < nextPageTop && guard < 10) {
          const shortfall = nextPageTop - el.offsetTop;
          const mt = parseFloat(iframe.contentWindow.getComputedStyle(el).marginTop) || 0;
          el.style.marginTop = `${mt + shortfall}px`;
          guard++;
        }
      }
    }

    const canvas = await html2canvas(doc.body, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: PAGE_W,
    });
    // Facteur d'échelle réel entre le canvas rendu (scale:2 ci-dessus) et les
    // pixels "CSS" utilisés partout ailleurs (PAGE_W/PAGE_H, offsetTop...) —
    // calculé plutôt que supposé fixe à 2, au cas où html2canvas l'ajuste.
    const scale = canvas.width / PAGE_W;
    const imgHeight = canvas.height / scale;
    const pageCount = Math.max(1, Math.ceil(imgHeight / CONTENT_H));

    const pdf = new jsPDFCtor({ unit: "px", format: [PAGE_W, PAGE_H] });
    for (let i = 0; i < pageCount; i++) {
      if (i > 0) pdf.addPage();
      // Compose CETTE page sur un canvas blanc dédié, en n'y recopiant QUE la
      // tranche de contenu qui lui revient (voir CONTENT_H ci-dessus), décalée
      // de GUTTER_TOP vers le bas — contrairement à un simple décalage négatif
      // de l'image complète (l'ancienne méthode), ça laisse une vraie marge
      // blanche en haut ET en bas de chaque page, sans dupliquer ni perdre de
      // contenu d'une page à l'autre.
      const sliceH = Math.min(CONTENT_H, imgHeight - i * CONTENT_H);
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.round(PAGE_H * scale);
      const ctx = pageCanvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0, Math.round(i * CONTENT_H * scale), canvas.width, Math.round(sliceH * scale),
        0, Math.round(GUTTER_TOP * scale), canvas.width, Math.round(sliceH * scale)
      );
      const pageData = pageCanvas.toDataURL("image/jpeg", 0.92);
      pdf.addImage(pageData, "JPEG", 0, 0, PAGE_W, PAGE_H);
      if (pageNumbers) {
        pdf.setFontSize(9);
        pdf.setTextColor(130, 130, 130);
        pdf.text(`Page ${i + 1} / ${pageCount}`, PAGE_W - 70, PAGE_H - 18);
      }
    }

    return pdf.output("blob");
  } finally {
    document.body.removeChild(iframe);
  }
}

async function shareOrDownloadBlob(blob, fileName) {
  const file = new File([blob], fileName, { type: "application/pdf" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: fileName });
      return;
    } catch (e) {
      // L'utilisateur a annulé le partage, ou le partage a échoué : on
      // retombe sur le téléchargement direct plutôt que de rester bloqué.
      if (e && e.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/**
 * Ouvre un document imprimable à partir d'un HTML complet (déjà généré par
 * les fonctions d'export). `fileName` sert de nom de fichier si un vrai PDF
 * doit être généré (mode PWA installée).
 */
export async function openPrintableDocument(html, { fileName = "export.pdf", onError } = {}) {
  if (!needsPdfShareFlow()) {
    const win = window.open("", "_blank");
    if (!win) {
      if (onError) onError("La fenêtre d'aperçu a été bloquée par le navigateur. Autorisez les pop-ups pour ce site puis réessayez.");
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
    return;
  }

  try {
    const blob = await generatePdfBlob(html);
    await shareOrDownloadBlob(blob, fileName);
  } catch (e) {
    console.error("openPrintableDocument (PWA) failed", e);
    if (onError) {
      onError(
        "Impossible de générer le PDF automatiquement. Réessayez, ou ouvrez l'appli dans Safari (pas depuis l'icône ajoutée à l'écran d'accueil) pour utiliser l'impression classique."
      );
    }
  }
}

/**
 * Génère un vrai fichier PDF (voir generatePdfBlob) et l'ouvre directement
 * dans un nouvel onglet, au lieu d'ouvrir une page HTML "à imprimer" comme
 * openPrintableDocument. Utilisé pour les documents où la pagination réelle
 * compte (contrat de sous-traitance, DC4) : le visualiseur PDF intégré du
 * navigateur affiche nativement le numéro de page / nombre total de pages,
 * et le contenu s'écoule sans les grands blancs que peut provoquer un
 * `page-break-after` CSS mal calé sur un contenu de longueur variable.
 * Fonctionne aussi bien sur desktop (onglet PDF natif) qu'en PWA iOS
 * installée (partage/téléchargement, comme openPrintableDocument).
 */
export async function openGeneratedPdf(html, { fileName = "export.pdf", onError, pageNumbers = false } = {}) {
  try {
    const blob = await generatePdfBlob(html, { pageNumbers });
    if (needsPdfShareFlow()) {
      await shareOrDownloadBlob(blob, fileName);
      return;
    }
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      // Pop-up bloquée : on retombe sur le téléchargement direct plutôt
      // que de laisser Morgane sans aucun moyen de récupérer le document.
      await shareOrDownloadBlob(blob, fileName);
      return;
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) {
    console.error("openGeneratedPdf failed", e);
    if (onError) {
      onError("Impossible de générer le PDF. Réessayez, ou vérifiez que les pop-ups sont autorisées pour ce site.");
    }
  }
}
