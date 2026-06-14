import { writeFileSync } from 'fs'
import { generateDevisTemplatePdf } from '../src/app/devis/generateDevisPdf'

generateDevisTemplatePdf().then((base64) => {
  writeFileSync('/tmp/devis-template-docuseal.pdf', Buffer.from(base64, 'base64'))
  console.log('written /tmp/devis-template-docuseal.pdf')
})
