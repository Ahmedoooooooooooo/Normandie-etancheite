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
 * Design professionnel : zones de champs discrètes (fond gris clair, pas d'étiquettes visibles).
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
  function rect(x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>, border?: { color: ReturnType<typeof rgb>; width: number }) {
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      color,
      ...(border && { borderColor: border.color, borderWidth: border.width }),
    })
  }

  // Zone de champ discrète : fond gris très léger, bordure subtile
  function fieldZone(x: number, yTop: number, w: number, h: number) {
    rect(x, yTop - h, w, h, SLATE_50, { color: SLATE_200, width: 0.5 })
  }

  // ---- En-tête (fixe) ----
  const headerHeight = 110
  rect(0, PAGE_HEIGHT - headerHeight, PAGE_WIDTH, headerHeight, NAVY)

  // Logo cercle
  page.drawCircle({ x: MARGIN + 16, y: PAGE_HEIGHT - 35, size: 16, color: ORANGE })
  text('N', MARGIN + 16 - bold.widthOfTextAtSize('N', 16) / 2, PAGE_HEIGHT - 40, 16, bold, WHITE)

  // Titre et coordonnées
  text('NORMANDIE ÉTANCHÉITÉ', MARGIN + 42, PAGE_HEIGHT - 28, 18, bold, WHITE)
  text('Expertises en étanchéité et couverture', MARGIN + 42, PAGE_HEIGHT - 42, 9, font, SLATE_400)
  text('16 Impasse Beau Vallon, 61100 Flers', MARGIN + 42, PAGE_HEIGHT - 54, 8, font, SLATE_400)

  // Devis titre et numéro
  textRight('DEVIS', PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 32, 28, bold, ORANGE)
  fieldZone(PAGE_WIDTH - MARGIN - 140, PAGE_HEIGHT - 62, 140, 20)
  text('N°', PAGE_WIDTH - MARGIN - 130, PAGE_HEIGHT - 57, 9, bold, SLATE_400)

  let cursorY = PAGE_HEIGHT - headerHeight - 20

  // ---- Sections principales ----
  const sectionLabelSize = 10
  const sectionLabelColor = NAVY
  const contentSize = 9
  const lineHeight = 14

  // Client
  text('COORDONNÉES DU CLIENT', MARGIN, cursorY, sectionLabelSize, bold, sectionLabelColor)
  cursorY -= 14
  fieldZone(MARGIN, cursorY, CONTENT_WIDTH, 60)
  cursorY -= 60 + 16

  // Intervention
  text('INTERVENTION PROGRAMMÉE', MARGIN, cursorY, sectionLabelSize, bold, sectionLabelColor)
  cursorY -= 14
  fieldZone(MARGIN, cursorY, CONTENT_WIDTH, 50)
  cursorY -= 50 + 16

  // Descriptif
  text('DESCRIPTIF DE LA DEMANDE', MARGIN, cursorY, sectionLabelSize, bold, sectionLabelColor)
  cursorY -= 14
  fieldZone(MARGIN, cursorY, CONTENT_WIDTH, 56)
  cursorY -= 56 + 16

  // Prix
  text('DÉTAIL FINANCIER', MARGIN, cursorY, sectionLabelSize, bold, sectionLabelColor)
  cursorY -= 14
  fieldZone(MARGIN, cursorY, CONTENT_WIDTH, 70)
  cursorY -= 70 + 16

  // ---- Mention légale ----
  const legal = 'Ce devis est valable 30 jours à partir de la date de remise. Tout travail entrepris sans signature constitue une acceptation implicite de ses conditions.'
  cursorY -= 4
  for (const line of wrapText(legal, italic, 8, CONTENT_WIDTH)) {
    const width = italic.widthOfTextAtSize(line, 8)
    text(line, MARGIN + (CONTENT_WIDTH - width) / 2, cursorY, 8, italic, SLATE_400)
    cursorY -= 11
  }
  cursorY -= 12

  // ---- Zone signature ----
  text('ACCEPTATION ET SIGNATURE', MARGIN, cursorY, sectionLabelSize, bold, sectionLabelColor)
  cursorY -= 14
  fieldZone(MARGIN, cursorY, 250, 60)
  cursorY -= 60 + 8
  text('En signant ci-dessus, j\'accepte les conditions du devis.', MARGIN, cursorY, 8, font, SLATE_500)

  // ---- Pied de page ----
  rect(0, 0, PAGE_WIDTH, 28, NAVY)
  const footer = 'NORMANDIE ÉTANCHÉITÉ  •  Tel. +33 (0)2 XX XX XX XX  •  contact@normandie-etancheite.fr  •  normandie-etancheite.fr'
  const footerWidth = font.widthOfTextAtSize(footer, 7)
  text(footer, (PAGE_WIDTH - footerWidth) / 2, 11, 7, font, SLATE_400)

  return pdfDoc.saveAsBase64()
}
