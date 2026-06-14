import { writeFileSync } from 'fs'
import { generateDevisPdf, DevisData } from '../src/app/devis/generateDevisPdf'

const sample: DevisData = {
  date: '2026-06-11',
  date_formatee: 'jeudi 11 juin 2026',
  heure: '10:00',
  prenom: 'Jean',
  nom: 'Dupont',
  telephone: '06 12 34 56 78',
  email: 'jean.dupont@example.com',
  societe: 'Dupont SARL',
  adresse: '2 Rue de la Harpe, 61100 Flers',
  surface_m2: 120,
  type_toiture: 'Toiture terrasse',
  etat_general: 'Bon état',
  accessibilite: 'Accès facile',
  description: "Présence d'infiltrations visibles au plafond du salon, surtout en cas de fortes pluies.",
  devis_numero: 'DEV-2026-0042',
  devis_honoraires: 200,
  devis_deplacement: 50,
  devis_distance_km: 35,
  devis_total_ht: 250,
  devis_total_ttc: 300,
  devis_signe: false,
}

generateDevisPdf(sample).then((base64) => {
  writeFileSync('/tmp/devis-test.pdf', Buffer.from(base64, 'base64'))
  console.log('written /tmp/devis-test.pdf')
})
