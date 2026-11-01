import { toBlob } from 'html-to-image'
import catalog from '../data/catalog.json'
import { affixFriction, affixFrictionRange, scoreRun } from './friction.js'

export const AFFIX_ALIASES = {
  'open-book': 'take-five',
  demonetised: 'playing-with-fire',
  'quiet-on-set': 'creature-of-habit',
  'breeze-block': 'totem-duty',
  'clean-conscience': 'spreading-rumors',
  'spreading-rumours': 'spreading-rumors',
  'ankh-ious': 'hidebound',
  'lightning-rod': 'hidebound',
  nudist: 'it-s-spelt-armour-with-a-u',
  'weaponised-incompetence': 'weaponized-incompetence',
  'sweeping-generalisations': 'sweeping-generalizations',
  'flurry-cancelled': 'flurry-canceled',
  'snow-day-cancelled': 'snow-day-canceled',
  'group-therapy-cancelled': 'group-therapy-canceled',
}

function toBase64Url(value) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '')
}

function fromBase64Url(value) {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)))
}

export function encodeRun(run) {
  if (!run.faction || !run.class || !run.spec || !run.race || !run.profession) return ''
  return toBase64Url(
    JSON.stringify({
      v: 3,
      f: run.faction.id,
      c: run.class.id,
      s: run.spec.name,
      r: run.race.id,
      p: run.profession.id,
      sf: Boolean(run.selfFound),
      a: (run.affixes ?? []).map((affix) => ({
        i: affix.id,
        d: affix.difficulty,
        k: affix.scope,
        n: affix.subRoll ?? affix.condition ?? null,
      })),
    }),
  )
}

function findById(list, id) {
  return list.find((item) => item.id === id) ?? null
}

function findProfession(catalog, id) {
  if (!id) return null
  const exact = findById(catalog.professionPairs, id)
  if (exact) return exact
  const sorted = String(id).split('-').filter(Boolean).sort().join('-')
  return catalog.professionPairs.find((pair) => pair.id.split('-').sort().join('-') === sorted) ?? null
}

function resolveAffix(catalog, entry) {
  const requested = entry?.i
  const aliased = AFFIX_ALIASES[requested]
  const affix = findById(catalog.affixes, requested) ?? (aliased ? findById(catalog.affixes, aliased) : null)
  if (!affix) return { missing: requested || 'unknown' }
  return {
    remapped: aliased && affix.id === aliased ? requested : null,
    affix: {
      ...affix,
      difficulty: entry.d || affix.difficulty,
      subRoll: entry.n || null,
    },
  }
}

export function decodeRun(catalog, token) {
  if (!token) return null
  try {
    const payload = JSON.parse(fromBase64Url(token))
    const faction = findById(catalog.factions, payload.f)
    const classItem = findById(catalog.classes, payload.c)
    const spec = catalog.specs.find((item) => item.classId === payload.c && item.name === payload.s)
    const race = findById(catalog.races, payload.r)
    const profession = findProfession(catalog, payload.p)
    if (!faction || !classItem || !spec || !race || !profession) return null

    const remapped = []
    const missing = []
    const affixes = []
    for (const entry of payload.a ?? []) {
      const resolved = resolveAffix(catalog, entry)
      if (resolved.missing) missing.push(resolved.missing)
      if (resolved.affix) affixes.push(resolved.affix)
      if (resolved.remapped) remapped.push(resolved.remapped)
    }

    return {
      faction,
      class: classItem,
      spec,
      race,
      profession,
      selfFound: Boolean(payload.sf),
      affixes,
      shareNotice: remapped.length || missing.length ? { remapped, missing } : null,
    }
  } catch {
    return null
  }
}

const shortLinkCache = new Map()
const shortLinkInflight = new Map()

export function hashShareUrl(token) {
  if (!token) return ''
  const url = new URL(window.location.origin)
  url.hash = token
  return url.toString()
}

export function shareUrl(run) {
  return hashShareUrl(encodeRun(run))
}

async function mintShortId(token) {
  const response = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  if (!response.ok) return null
  const data = await response.json()
  return data?.id || null
}

export async function resolveShareUrl(run) {
  const token = encodeRun(run)
  if (!token) return ''
  const fallback = hashShareUrl(token)
  if (shortLinkCache.has(token)) {
    return `${window.location.origin}/r/${shortLinkCache.get(token)}`
  }
  let pending = shortLinkInflight.get(token)
  if (!pending) {
    pending = mintShortId(token).finally(() => shortLinkInflight.delete(token))
    shortLinkInflight.set(token, pending)
  }
  try {
    const id = await pending
    if (!id) return fallback
    shortLinkCache.set(token, id)
    return `${window.location.origin}/r/${id}`
  } catch {
    return fallback
  }
}

export async function fetchSharedToken(id) {
  const response = await fetch(`/api/links/${encodeURIComponent(id)}`)
  if (!response.ok) return null
  const data = await response.json()
  return typeof data?.token === 'string' ? data.token : null
}

export function shortIdFromPath(pathname = window.location.pathname) {
  const match = pathname.match(/^\/r\/([A-Za-z0-9]{5,8})$/)
  return match?.[1] ?? null
}

export function shareCardSiteLine(url) {
  const match = String(url || '').match(/\/r\/([A-Za-z0-9]{5,8})\/?$/)
  if (match) return `See this challenge at goagainroll.com/r/${match[1]}`
  return 'Roll your own at goagainroll.com'
}

export function replaceLocation({ pathname, hash } = {}) {
  const url = new URL(window.location.href)
  if (pathname != null) url.pathname = pathname
  if (hash != null) url.hash = hash
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

export function prefersFileShare() {
  return Boolean(window.matchMedia?.('(pointer: coarse)').matches && navigator.maxTouchPoints > 0)
}

export function summarizeRun(run, catalog) {
  const affixLines = (run.affixes ?? []).map((affix) => {
    const extra = affix.subRoll ? ` (${affix.subRoll})` : ''
    const range = affixFrictionRange(affix)
    const rangeText = range ? `, range ${range.min}–${range.max}` : ''
    return `- ${affix.name}${extra} [${affixFriction(affix)}${rangeText}]: ${affix.description}`
  })
  const score = catalog ? scoreRun(catalog, run) : null
  const synergyLines = score?.synergies?.length
    ? score.synergies.map((synergy) => `- +${synergy.friction}: ${synergy.warning}`).join('\n')
    : null
  return [
    `${run.faction.name} ${run.race.name} ${run.spec.name} ${run.class.name}`,
    `Professions: ${run.profession.name}`,
    run.selfFound ? 'Self Found' : 'Regular',
    score
      ? `Friction: ${score.total} — ${score.rank.name} (affixes ${score.base} + spec ${score.specScore} + professions ${score.professionScore} + self found ${score.selfFoundScore} + synergy ${score.synergyScore} + affix count ${score.stackingScore})`
      : null,
    affixLines.length ? `Affixes:\n${affixLines.join('\n')}` : 'Affixes: none',
    synergyLines ? `Synergies:\n${synergyLines}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export function canNativeShare() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

function fileSafe(value) {
  return String(value)
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function shareCardFileName(run) {
  const identity = [run?.race?.name, run?.spec?.name, run?.class?.name].filter(Boolean).join(' ')
  const sf = run?.selfFound ? ' SF' : ''
  const total = run ? scoreRun(catalog, run).total : null
  const scoreBit = Number.isFinite(total) ? ` - ${total}` : ''
  const body = identity ? `${identity}${sf}${scoreBit}` : 'run'
  return `GO AGAIN ROLL - ${fileSafe(body)}.png`
}

function downloadBlob(blob, name) {
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(href)
}

async function waitForImages(node) {
  const images = [...node.querySelectorAll('img')]
  await Promise.all(
    images.map((image) => {
      if (image.complete) return null
      return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true })
        image.addEventListener('error', resolve, { once: true })
      })
    }),
  )
}

export async function downloadShareCard(node, run) {
  const blob = await captureShareCard(node)
  downloadBlob(blob, shareCardFileName(run))
}

export async function captureShareCard(node) {
  if (!node) throw new Error('share card missing')
  await waitForImages(node)
  const blob = await toBlob(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#040b07',
  })
  if (!blob) throw new Error('share card capture failed')
  return blob
}

export async function shareRun({ node, url, run }) {
  const blob = await captureShareCard(node)
  const fileName = shareCardFileName(run)
  const file = new File([blob], fileName, { type: 'image/png' })
  const title = 'GO AGAIN ROLL'
  const withUrl = { title, url, files: [file] }
  const withText = { title, text: url, files: [file] }

  if (!prefersFileShare()) {
    downloadBlob(blob, fileName)
    return 'downloaded'
  }

  try {
    if (navigator.canShare?.(withUrl)) {
      await navigator.share(withUrl)
      return 'shared'
    }
    if (navigator.canShare?.(withText)) {
      await navigator.share(withText)
      return 'shared'
    }
    if (typeof navigator.share === 'function') {
      await navigator.share({ title, url })
      downloadBlob(blob, fileName)
      return 'shared-link'
    }
  } catch (error) {
    if (error?.name === 'AbortError') return 'aborted'
    throw error
  }

  downloadBlob(blob, fileName)
  try {
    await copyText(url)
  } catch {
    /* clipboard can be blocked; the image still downloaded */
  }
  return 'downloaded'
}

export async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }
  const field = document.createElement('textarea')
  field.value = value
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.left = '-9999px'
  document.body.appendChild(field)
  field.select()
  const ok = document.execCommand('copy')
  field.remove()
  if (!ok) throw new Error('copy failed')
}
