import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { generateDevisTemplatePdf } from '../src/app/devis/generateDevisPdf'

const logo = new Uint8Array(readFileSync(join(__dirname, 'devis-logo.png')))

generateDevisTemplatePdf(logo).then((base64) => {
  writeFileSync('/tmp/devis-template-docuseal.pdf', Buffer.from(base64, 'base64'))
  console.log('written /tmp/devis-template-docuseal.pdf')
})
