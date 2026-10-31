import catalog from '../src/data/catalog.json' with { type: 'json' }
import { AFFIX_ALIASES, decodeRun, encodeRun } from '../src/engine/share.js'

const sample = {
  faction: catalog.factions[0],
  class: catalog.classes.find((item) => item.id === 'priest'),
  spec: catalog.specs.find((item) => item.id === 'priest-shadow'),
  race: catalog.races.find((item) => item.id === 'human'),
  profession: catalog.professionPairs[0],
  selfFound: false,
  affixes: [],
}

const token = encodeRun({
  ...sample,
  affixes: [{ id: 'open-book', difficulty: 'hard', scope: 'class', subRoll: null }],
})
const fake = JSON.parse(
  Buffer.from(
    token.replaceAll('-', '+').replaceAll('_', '/') + '==',
    'base64',
  ).toString('utf8'),
)
fake.a = [{ i: 'open-book', d: 'hard', k: 'class', n: null }]
const aliasedToken = Buffer.from(JSON.stringify(fake))
  .toString('base64')
  .replaceAll('+', '-')
  .replaceAll('/', '_')
  .replace(/=+$/g, '')

const decoded = decodeRun(catalog, aliasedToken)
if (decoded.affixes[0]?.id !== 'take-five') throw new Error(`expected take-five, got ${decoded.affixes[0]?.id}`)
if (!decoded.shareNotice?.remapped.includes('open-book')) throw new Error('missing remapped notice')

const swapped = encodeRun({ ...sample, profession: { ...sample.profession, id: 'enchant-tailor' } })
// encode uses whatever id is on the object; decode should accept swapped pair ids in payload
fake.p = sample.profession.id.split('-').reverse().join('-')
const swappedToken = Buffer.from(JSON.stringify(fake))
  .toString('base64')
  .replaceAll('+', '-')
  .replaceAll('/', '_')
  .replace(/=+$/g, '')
const swappedRun = decodeRun(catalog, swappedToken)
if (!swappedRun?.profession) throw new Error(`profession alias failed for ${fake.p}`)

for (const [from, to] of Object.entries(AFFIX_ALIASES)) {
  if (!catalog.affixes.some((affix) => affix.id === to)) throw new Error(`alias target missing: ${from} -> ${to}`)
}

console.log('share aliases ok', decoded.affixes[0].name, swappedRun.profession.id)
