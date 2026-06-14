import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib'

export interface DevisData {
  date: string
  date_formatee: string
  heure: string
  prenom: string
  nom: string
  telephone: string
  email: string
  societe: string
  adresse: string
  surface_m2: number
  type_toiture: string
  etat_general: string
  accessibilite: string
  description: string
  devis_numero: string
  devis_honoraires: number
  devis_deplacement: number
  devis_distance_km: number
  devis_total_ht: number
  devis_total_ttc: number
  devis_signe: boolean
}

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 40
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const NAVY = rgb(0.1176, 0.2275, 0.3725)
const ORANGE = rgb(0.9765, 0.4510, 0.0863)
const ORANGE_50 = rgb(1, 0.969, 0.929)
const BLUE_50 = rgb(0.937, 0.965, 1)
const BLUE_100 = rgb(0.851, 0.918, 0.996)
const SLATE_50 = rgb(0.973, 0.980, 0.988)
const SLATE_100 = rgb(0.945, 0.961, 0.976)
const SLATE_200 = rgb(0.886, 0.910, 0.941)
const SLATE_400 = rgb(0.580, 0.639, 0.722)
const SLATE_500 = rgb(0.392, 0.455, 0.545)
const SLATE_700 = rgb(0.200, 0.255, 0.333)
const WHITE = rgb(1, 1, 1)

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (current && font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export async function generateDevisPdf(devis: DevisData): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  function text(value: string, x: number, y: number, size: number, f: PDFFont, color = SLATE_700) {
    page.drawText(value, { x, y, size, font: f, color })
  }

  function textRight(value: string, xRight: number, y: number, size: number, f: PDFFont, color = SLATE_700) {
    const width = f.widthOfTextAtSize(value, size)
    page.drawText(value, { x: xRight - width, y, size, font: f, color })
  }

  function rect(x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>) {
    page.drawRectangle({ x, y, width: w, height: h, color })
  }

  // ---- En-tête ----
  const headerHeight = 130
  rect(0, PAGE_HEIGHT - headerHeight, PAGE_WIDTH, headerHeight, NAVY)

  page.drawCircle({ x: MARGIN + 14, y: PAGE_HEIGHT - 40, size: 14, color: ORANGE })
  text('N', MARGIN + 14 - bold.widthOfTextAtSize('N', 14) / 2, PAGE_HEIGHT - 45, 14, bold, WHITE)

  text('NORMANDIE ÉTANCHÉITÉ', MARGIN + 38, PAGE_HEIGHT - 35, 16, bold, WHITE)
  text('16 Impasse Beau Vallon, 61100 Flers', MARGIN + 38, PAGE_HEIGHT - 52, 9, font, SLATE_400)
  text('SIRET : XXX XXX XXX XXXXX  |  Assurance : N° XXXXXXXXXXXX', MARGIN + 38, PAGE_HEIGHT - 65, 9, font, SLATE_400)

  textRight('DEVIS', PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 45, 24, bold, ORANGE)
  textRight(`N° ${devis.devis_numero}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 65, 11, bold, WHITE)
  textRight('Valable 30 jours', PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 78, 8, font, SLATE_400)

  // ---- Blocs Client / Intervention ----
  let cursorY = PAGE_HEIGHT - headerHeight - 25
  const boxWidth = (CONTENT_WIDTH - 16) / 2
  const boxHeight = 100
  const boxTop = cursorY
  const boxBottom = boxTop - boxHeight

  rect(MARGIN, boxBottom, boxWidth, boxHeight, SLATE_50)
  rect(MARGIN + boxWidth + 16, boxBottom, boxWidth, boxHeight, SLATE_50)

  // Client
  let cy = boxTop - 18
  const clientX = MARGIN + 14
  text('CLIENT', clientX, cy, 8, bold, SLATE_400)
  cy -= 16
  text(`${devis.prenom} ${devis.nom}`, clientX, cy, 11, bold, NAVY)
  cy -= 15
  if (devis.societe) {
    text(devis.societe, clientX, cy, 9, font, SLATE_500)
    cy -= 13
  }
  text(`${devis.telephone}  |  ${devis.email}`, clientX, cy, 9, font, SLATE_500)
  cy -= 13
  for (const line of wrapText(devis.adresse, font, 9, boxWidth - 28)) {
    text(line, clientX, cy, 9, font, SLATE_500)
    cy -= 12
  }

  // Intervention
  cy = boxTop - 18
  const interX = MARGIN + boxWidth + 16 + 14
  text('INTERVENTION', interX, cy, 8, bold, SLATE_400)
  cy -= 16
  text(capitalize(devis.date_formatee), interX, cy, 11, bold, NAVY)
  cy -= 15
  text(`Créneau : ${devis.heure}`, interX, cy, 9, font, SLATE_500)
  cy -= 13
  text(`Surface : ${devis.surface_m2} m²  |  ${devis.type_toiture}`, interX, cy, 9, font, SLATE_500)
  cy -= 13
  text(`État : ${devis.etat_general}`, interX, cy, 9, font, SLATE_500)
  cy -= 13
  text(`Accès : ${devis.accessibilite}`, interX, cy, 9, font, SLATE_500)

  cursorY = boxBottom - 16

  // ---- Description ----
  if (devis.description) {
    const descLines = wrapText(devis.description, font, 9, CONTENT_WIDTH - 28)
    const descHeight = 28 + descLines.length * 12
    rect(MARGIN, cursorY - descHeight, CONTENT_WIDTH, descHeight, BLUE_50)
    page.drawRectangle({
      x: MARGIN,
      y: cursorY - descHeight,
      width: CONTENT_WIDTH,
      height: descHeight,
      borderColor: BLUE_100,
      borderWidth: 1,
    })
    let dy = cursorY - 16
    text('DESCRIPTION', MARGIN + 14, dy, 8, bold, SLATE_400)
    dy -= 15
    for (const line of descLines) {
      text(line, MARGIN + 14, dy, 9, font, SLATE_700)
      dy -= 12
    }
    cursorY -= descHeight + 16
  }

  // ---- Tableau de prix ----
  const tva = Math.round((devis.devis_total_ttc - devis.devis_total_ht) * 100) / 100
  const rowHeight = 28
  const rows: Array<{ label: string; value: string; bg?: ReturnType<typeof rgb>; f?: PDFFont; color?: ReturnType<typeof rgb>; size?: number }> = [
    { label: `Honoraires d'expertise (${devis.surface_m2} m²)`, value: `${devis.devis_honoraires.toFixed(2)} €` },
    { label: `Frais de déplacement (${devis.devis_distance_km} km)`, value: `${devis.devis_deplacement.toFixed(2)} €` },
    { label: 'Total HT', value: `${devis.devis_total_ht.toFixed(2)} €`, bg: SLATE_50, f: bold, color: NAVY },
    { label: 'TVA 20 %', value: `${tva.toFixed(2)} €`, color: SLATE_500, size: 9 },
    { label: 'Total TTC', value: `${devis.devis_total_ttc.toFixed(2)} €`, bg: ORANGE_50, f: bold, color: ORANGE, size: 13 },
  ]

  const tableHeight = rowHeight + rows.length * rowHeight
  const tableTop = cursorY
  rect(MARGIN, tableTop - rowHeight, CONTENT_WIDTH, rowHeight, NAVY)
  text('Désignation', MARGIN + 14, tableTop - rowHeight + 9, 10, bold, WHITE)
  textRight('Montant HT', PAGE_WIDTH - MARGIN - 14, tableTop - rowHeight + 9, 10, bold, WHITE)

  let rowY = tableTop - rowHeight
  for (const row of rows) {
    rowY -= rowHeight
    if (row.bg) rect(MARGIN, rowY, CONTENT_WIDTH, rowHeight, row.bg)
    page.drawLine({
      start: { x: MARGIN, y: rowY },
      end: { x: MARGIN + CONTENT_WIDTH, y: rowY },
      thickness: 0.5,
      color: SLATE_200,
    })
    const f = row.f || font
    const color = row.color || SLATE_700
    const size = row.size || 10
    text(row.label, MARGIN + 14, rowY + 9, size, f, color)
    textRight(row.value, PAGE_WIDTH - MARGIN - 14, rowY + 9, size, f, color)
  }

  cursorY = rowY - 24

  // ---- Mention légale ----
  const legal = 'Ce devis est valable 30 jours. La signature électronique vaut acceptation des conditions générales de vente.'
  for (const line of wrapText(legal, italic, 8, CONTENT_WIDTH)) {
    const width = italic.widthOfTextAtSize(line, 8)
    text(line, MARGIN + (CONTENT_WIDTH - width) / 2, cursorY, 8, italic, SLATE_400)
    cursorY -= 12
  }

  // ---- Zone de signature ----
  const signatureHeight = 110
  const signatureTop = MARGIN + 40 + signatureHeight
  page.drawRectangle({
    x: MARGIN,
    y: signatureTop - signatureHeight,
    width: CONTENT_WIDTH,
    height: signatureHeight,
    borderColor: SLATE_200,
    borderWidth: 1,
    color: SLATE_50,
  })
  text('SIGNATURE DU CLIENT — Bon pour accord', MARGIN + 14, signatureTop - 18, 9, bold, SLATE_700)
  text(`Date : ${devis.date_formatee}`, MARGIN + 14, signatureTop - 34, 9, font, SLATE_500)

  // ---- Pied de page ----
  rect(0, 0, PAGE_WIDTH, 24, NAVY)
  const footer = 'NORMANDIE ÉTANCHÉITÉ — 16 Impasse Beau Vallon, 61100 Flers — normandie-etancheite.fr'
  const footerWidth = font.widthOfTextAtSize(footer, 8)
  text(footer, (PAGE_WIDTH - footerWidth) / 2, 9, 8, font, SLATE_400)

  return pdfDoc.saveAsBase64()
}

/**
 * Génère le PDF "modèle" à téléverser UNE SEULE FOIS dans Docuseal.
 * Mise en page soignée aux couleurs de la marque (bleu nuit + orange).
 * Les cartes claires servent de zones où Docuseal insère les champs
 * (numero, client, intervention, description, prix, Signature).
 */
export async function generateDevisTemplatePdf(): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  function text(value: string, x: number, y: number, size: number, f: PDFFont, color = SLATE_700) {
    page.drawText(value, { x, y, size, font: f, color })
  }
  function textRight(value: string, xRight: number, y: number, size: number, f: PDFFont, color = SLATE_700) {
    const width = f.widthOfTextAtSize(value, size)
    page.drawText(value, { x: xRight - width, y, size, font: f, color })
  }
  function rect(x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>) {
    page.drawRectangle({ x, y, width: w, height: h, color })
  }

  // Rectangle aux coins arrondis. (xLeft, yTop) = coin supérieur gauche en
  // coordonnées PDF ; le tracé SVG se développe vers le bas.
  function roundedRect(
    xLeft: number,
    yTop: number,
    w: number,
    h: number,
    r: number,
    opts: { color?: ReturnType<typeof rgb>; borderColor?: ReturnType<typeof rgb>; borderWidth?: number },
  ) {
    const path =
      `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${h - r} ` +
      `Q ${w} ${h} ${w - r} ${h} L ${r} ${h} Q 0 ${h} 0 ${h - r} L 0 ${r} Q 0 0 ${r} 0 Z`
    page.drawSvgPath(path, {
      x: xLeft,
      y: yTop,
      color: opts.color,
      borderColor: opts.borderColor,
      borderWidth: opts.borderWidth,
    })
  }

  // Carte claire = zone de champ Docuseal.
  function card(xLeft: number, yTop: number, w: number, h: number, fill = WHITE, borderColor = SLATE_200) {
    roundedRect(xLeft, yTop, w, h, 7, { color: fill, borderColor, borderWidth: 1 })
  }

  // Intitulé de section avec petit repère orange.
  function sectionTitle(label: string, x: number, baseline: number) {
    roundedRect(x, baseline + 9, 3.5, 12, 1.5, { color: ORANGE })
    text(label, x + 11, baseline, 10, bold, NAVY)
  }

  // ---- En-tête ----
  const headerHeight = 124
  rect(0, PAGE_HEIGHT - headerHeight, PAGE_WIDTH, headerHeight, NAVY)
  // Fin liseré orange de l'en-tête
  rect(0, PAGE_HEIGHT - headerHeight, PAGE_WIDTH, 4, ORANGE)

  // Médaillon logo
  const logoCx = MARGIN + 20
  const logoCy = PAGE_HEIGHT - 48
  page.drawCircle({ x: logoCx, y: logoCy, size: 19, color: ORANGE, borderColor: WHITE, borderWidth: 1.5 })
  text('N', logoCx - bold.widthOfTextAtSize('N', 20) / 2, logoCy - 7, 20, bold, WHITE)

  // Identité
  text('NORMANDIE ÉTANCHÉITÉ', MARGIN + 50, PAGE_HEIGHT - 38, 17, bold, WHITE)
  text('Expertise en étanchéité & couverture', MARGIN + 50, PAGE_HEIGHT - 54, 9, font, SLATE_400)
  text('16 Impasse Beau Vallon, 61100 Flers', MARGIN + 50, PAGE_HEIGHT - 68, 8, font, SLATE_400)

  // Bloc DEVIS + numéro (à droite)
  textRight('DEVIS', PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 42, 27, bold, ORANGE)
  const pillW = 158
  const pillX = PAGE_WIDTH - MARGIN - pillW
  card(pillX, PAGE_HEIGHT - 56, pillW, 24, WHITE, WHITE)
  text('N°', pillX + 12, PAGE_HEIGHT - 72, 11, bold, NAVY)

  // ---- Corps ----
  const colGap = 18
  const colW = (CONTENT_WIDTH - colGap) / 2
  const rightX = MARGIN + colW + colGap
  const titleGap = 12

  let cursorY = PAGE_HEIGHT - headerHeight - 34

  // Ligne 1 : Client | Intervention
  sectionTitle('COORDONNÉES DU CLIENT', MARGIN, cursorY)
  sectionTitle('INTERVENTION PROGRAMMÉE', rightX, cursorY)
  let cardTop = cursorY - titleGap
  const infoH = 112
  card(MARGIN, cardTop, colW, infoH)
  card(rightX, cardTop, colW, infoH)
  cursorY = cardTop - infoH - 28

  // Descriptif
  sectionTitle('DESCRIPTIF DE LA DEMANDE', MARGIN, cursorY)
  cardTop = cursorY - titleGap
  const descH = 78
  card(MARGIN, cardTop, CONTENT_WIDTH, descH)
  cursorY = cardTop - descH - 28

  // Détail financier (carte mise en valeur)
  sectionTitle('DÉTAIL FINANCIER', MARGIN, cursorY)
  cardTop = cursorY - titleGap
  const prixH = 108
  card(MARGIN, cardTop, CONTENT_WIDTH, prixH, ORANGE_50, ORANGE)
  cursorY = cardTop - prixH - 26

  // Mention légale
  const legal =
    'Devis valable 30 jours à compter de sa date de remise. La signature électronique apposée ci-dessous vaut acceptation pleine et entière des conditions du présent devis.'
  for (const line of wrapText(legal, italic, 8, CONTENT_WIDTH - 20)) {
    const width = italic.widthOfTextAtSize(line, 8)
    text(line, MARGIN + (CONTENT_WIDTH - width) / 2, cursorY, 8, italic, SLATE_400)
    cursorY -= 11
  }
  cursorY -= 16

  // Acceptation & signature
  sectionTitle('ACCEPTATION & SIGNATURE', MARGIN, cursorY)
  cardTop = cursorY - titleGap
  const signH = 104
  card(MARGIN, cardTop, CONTENT_WIDTH, signH)

  // Colonne gauche : mention "Bon pour accord"
  let sy = cardTop - 24
  text('Bon pour accord', MARGIN + 18, sy, 11, bold, NAVY)
  sy -= 16
  text('Lu et approuvé par le client', MARGIN + 18, sy, 8, italic, SLATE_500)
  sy -= 26
  text('Fait à Flers, le', MARGIN + 18, sy, 9, font, SLATE_500)
  page.drawLine({
    start: { x: MARGIN + 88, y: sy - 2 },
    end: { x: MARGIN + colW - 6, y: sy - 2 },
    thickness: 0.75,
    color: SLATE_200,
  })

  // Colonne droite : cadre de signature
  const sigBoxX = rightX
  const sigBoxW = colW
  roundedRect(sigBoxX, cardTop - 14, sigBoxW, signH - 28, 5, { color: SLATE_50, borderColor: SLATE_200, borderWidth: 0.75 })
  text('Signature du client', sigBoxX + 10, cardTop - 26, 8, bold, SLATE_400)

  // ---- Pied de page ----
  const footerH = 30
  rect(0, 0, PAGE_WIDTH, footerH, NAVY)
  rect(0, footerH, PAGE_WIDTH, 2, ORANGE)
  const footer =
    'NORMANDIE ÉTANCHÉITÉ   •   16 Impasse Beau Vallon, 61100 Flers   •   contact@normandie-etancheite.com   •   normandie-etancheite.com'
  const footerWidth = font.widthOfTextAtSize(footer, 7)
  text(footer, (PAGE_WIDTH - footerWidth) / 2, 11, 7, font, SLATE_400)

  return pdfDoc.saveAsBase64()
}
