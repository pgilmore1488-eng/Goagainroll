import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  affixesFor,
  getProfession,
  pickUntil,
  professionChoices,
  racesFor,
  remainingAffixes,
  resolveSubRoll,
  specsFor,
  viableCategories,
  viableDifficulties,
} from '../engine/lookups.js'
import { buildQuickSequence, resolveQuickRun } from '../engine/quickRoll.js'
import { decodeRun, encodeRun } from '../engine/share.js'
import { evenPick, sleep, weightedPick } from '../engine/weighted.js'

export const STEPS = {
  FACTION: 'faction',
  CLASS: 'class',
  SPEC: 'spec',
  RACE: 'race',
  PROFESSIONS: 'professions',
  SELF_FOUND: 'self-found',
  AFFIX_ASK: 'affix-ask',
  AFFIX: 'affix',
  QUICK_FIRE: 'quick-fire',
  DONE: 'done',
}

const QUICK_SPIN_MS = 1100
const QUICK_FLASH_MS = 70
const QUICK_HOLD_MS = 1280
const QUICK_PLACE_MS = 800
const QUICK_LOCKED_STAGGER_MS = 120

function applyQuickEvent(current, event) {
  if (event.key === 'selfFound') return { ...current, selfFound: event.item }
  if (event.key === 'affixCount') return current
  if (event.key === 'affix') return { ...current, affixes: [...current.affixes, event.item] }
  return { ...current, [event.key]: event.item }
}

function placingKey(event) {
  return event.key === 'affix' ? `affix:${event.item.id}` : event.key
}

function spinningCenter(event) {
  const pool = event.pool?.length ? event.pool : [event.display]
  return { key: event.key, item: evenPick(pool), spinning: true }
}

const emptyDraft = {
  difficulty: null,
  category: null,
  affix: null,
}

function emptyRun() {
  return {
    step: STEPS.SELF_FOUND,
    faction: null,
    class: null,
    spec: null,
    race: null,
    profession: null,
    selfFound: false,
    affixes: [],
    draft: emptyDraft,
    preview: null,
    shareNotice: null,
  }
}

export function useRun(catalog) {
  const [run, setRun] = useState(() => {
    const token = window.location.hash.replace(/^#/, '')
    const shared = decodeRun(catalog, token)
    if (!shared) return emptyRun()
    return { ...emptyRun(), ...shared, step: STEPS.DONE }
  })
  const [spinning, setSpinning] = useState(false)
  const abortRef = useRef(null)
  const quickGenRef = useRef(0)
  const quickResolvedRef = useRef(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  useEffect(() => {
    const onHashChange = () => {
      const token = window.location.hash.replace(/^#/, '')
      if (!token) return
      const shared = decodeRun(catalog, token)
      if (shared) setRun({ ...emptyRun(), ...shared, step: STEPS.DONE })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [catalog])

  useEffect(() => {
    if (run.step !== STEPS.DONE) return
    const token = encodeRun(run)
    if (token && window.location.hash.replace(/^#/, '') !== token) {
      window.history.replaceState(null, '', `#${token}`)
    }
  }, [run])

  const spinThen = useCallback(async (pool, pick, previewKey, decorate = (item) => item) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setSpinning(true)
    try {
      const started = Date.now()
      while (Date.now() - started < 700) {
        const flash = decorate(evenPick(pool))
        setRun((current) => ({ ...current, preview: { key: previewKey, item: flash } }))
        await sleep(55, controller.signal)
      }
      const chosen = decorate(pick())
      setRun((current) => ({ ...current, preview: null }))
      return chosen
    } catch (error) {
      if (error?.name === 'AbortError') return null
      throw error
    } finally {
      setSpinning(false)
    }
  }, [])

  const setFaction = useCallback((faction) => {
    setRun((current) => ({ ...current, faction, step: STEPS.CLASS }))
  }, [])

  const chooseClass = useCallback(
    async (classItem) => {
      if (classItem) {
        setRun((current) => ({ ...current, class: classItem, spec: null, step: STEPS.SPEC }))
        return
      }
      const chosen = await spinThen(catalog.classes, () => evenPick(catalog.classes), 'class')
      if (!chosen) return
      setRun((current) => ({ ...current, class: chosen, spec: null, step: STEPS.SPEC }))
    },
    [catalog.classes, spinThen],
  )

  const chooseSpec = useCallback(
    async (specItem) => {
      const pool = specsFor(catalog, run.class)
      if (specItem) {
        setRun((current) => ({ ...current, spec: specItem, step: STEPS.RACE }))
        return
      }
      const chosen = await spinThen(pool, () => evenPick(pool), 'spec')
      if (!chosen) return
      setRun((current) => ({ ...current, spec: chosen, step: STEPS.RACE }))
    },
    [catalog, run.class, spinThen],
  )

  const chooseRace = useCallback(
    async (raceItem) => {
      const pool = racesFor(catalog, run.class, run.faction.id)
      if (raceItem) {
        setRun((current) => ({ ...current, race: raceItem, step: STEPS.PROFESSIONS }))
        return
      }
      const chosen = await spinThen(pool, () => evenPick(pool), 'race')
      if (!chosen) return
      setRun((current) => ({ ...current, race: chosen, step: STEPS.PROFESSIONS }))
    },
    [catalog, run.class, run.faction, spinThen],
  )

  const chooseProfession = useCallback(
    async (pair) => {
      const pool = professionChoices(catalog, run.class)
      if (pair) {
        setRun((current) => ({
          ...current,
          profession: getProfession(catalog, pair.id) ?? pair,
          step: remainingAffixes(catalog, { ...current, profession: getProfession(catalog, pair.id) ?? pair })
            .length
            ? STEPS.AFFIX_ASK
            : STEPS.DONE,
        }))
        return
      }
      const chosen = await spinThen(pool, () => weightedPick(pool), 'profession')
      if (!chosen) return
      setRun((current) => ({
        ...current,
        profession: chosen,
        step: remainingAffixes(catalog, { ...current, profession: chosen }).length
          ? STEPS.AFFIX_ASK
          : STEPS.DONE,
      }))
    },
    [catalog, run.class, spinThen],
  )

  const chooseSelfFound = useCallback((selfFound) => {
    setRun((current) => ({ ...current, selfFound, step: STEPS.FACTION }))
  }, [])

  const skipAffixes = useCallback(() => {
    setRun((current) => ({ ...current, step: STEPS.DONE, draft: emptyDraft }))
  }, [])

  const startAffix = useCallback(() => {
    setRun((current) => ({ ...current, step: STEPS.AFFIX, draft: emptyDraft }))
  }, [])

  const rollAffixTier = useCallback(async () => {
    if (spinning) return
    const ctx = run

    if (!ctx.draft.difficulty) {
      const pool = catalog.difficulties
      const viable = viableDifficulties(catalog, ctx)
      const chosen = await spinThen(pool, () => weightedPick(viable.length ? viable : pool), 'difficulty')
      if (!chosen) return
      setRun((current) => ({ ...current, draft: { ...emptyDraft, difficulty: chosen } }))
      return
    }

    if (!ctx.draft.category) {
      const pool = catalog.affixCategories
      const chosen = await spinThen(
        pool,
        () =>
          pickUntil(pool, (item) =>
            viableCategories(catalog, ctx, ctx.draft.difficulty.id).some((row) => row.id === item.id),
          ),
        'category',
      )
      if (!chosen) return
      setRun((current) => ({
        ...current,
        draft: { ...current.draft, category: chosen, affix: null },
      }))
      return
    }

    if (!ctx.draft.affix) {
      const pool = affixesFor(catalog, ctx, ctx.draft.difficulty.id, ctx.draft.category.id)
      const chosen = await spinThen(pool, () => evenPick(pool), 'affix', resolveSubRoll)
      if (!chosen) return
      setRun((current) => ({
        ...current,
        draft: { ...current.draft, affix: chosen },
      }))
    }
  }, [catalog, run, spinThen, spinning])

  const commitDraft = (current) =>
    current.draft.affix ? [...current.affixes, current.draft.affix] : current.affixes

  const addAnotherAffix = useCallback(() => {
    setRun((current) => ({
      ...current,
      affixes: commitDraft(current),
      draft: emptyDraft,
      step: STEPS.AFFIX,
    }))
  }, [])

  const finish = useCallback(() => {
    setRun((current) => ({
      ...current,
      affixes: commitDraft(current),
      step: STEPS.DONE,
      draft: emptyDraft,
    }))
  }, [])

  const reset = useCallback(() => {
    quickGenRef.current += 1
    quickResolvedRef.current = null
    abortRef.current?.abort()
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setRun(emptyRun())
  }, [])

  const skipQuick = useCallback(() => {
    const resolved = quickResolvedRef.current
    if (!resolved) return
    quickGenRef.current += 1
    abortRef.current?.abort()
    setSpinning(false)
    setRun({
      ...emptyRun(),
      ...resolved.run,
      step: STEPS.DONE,
      quick: null,
    })
  }, [])

  const startQuickSequence = useCallback(
    async (picks, options = {}) => {
      abortRef.current?.abort()
      const gen = quickGenRef.current + 1
      quickGenRef.current = gen
      const controller = new AbortController()
      abortRef.current = controller
      const resolved = resolveQuickRun(catalog, picks, options)
      const sequence = buildQuickSequence(catalog, resolved)
      quickResolvedRef.current = resolved
      const stillGoing = () => quickGenRef.current === gen && !controller.signal.aborted

      setSpinning(true)
      setRun({
        ...emptyRun(),
        step: STEPS.QUICK_FIRE,
        selfFound: null,
        faction: null,
        class: null,
        spec: null,
        race: null,
        profession: null,
        affixes: [],
        quick: { center: null, placing: null },
      })

      try {
        for (let index = 0; index < sequence.length; index += 1) {
          const event = sequence[index]
          const next = sequence[index + 1]

          if (!event.locked) {
            const started = Date.now()
            while (Date.now() - started < QUICK_SPIN_MS) {
              if (!stillGoing()) return
              setRun((current) => ({
                ...current,
                quick: { ...current.quick, center: spinningCenter(event) },
              }))
              await sleep(QUICK_FLASH_MS, controller.signal)
            }
            if (!stillGoing()) return
            setRun((current) => ({
              ...current,
              quick: {
                ...current.quick,
                center: { key: event.key, item: event.display, spinning: false },
              },
            }))
            await sleep(QUICK_HOLD_MS, controller.signal)
          }

          if (!stillGoing()) return
          setRun((current) => ({
            ...applyQuickEvent(current, event),
            quick: {
              center: next && !next.locked ? spinningCenter(next) : null,
              placing: placingKey(event),
            },
          }))

          if (!next) {
            await sleep(QUICK_PLACE_MS, controller.signal)
          } else if (next.locked) {
            await sleep(QUICK_LOCKED_STAGGER_MS, controller.signal)
          }
        }
        if (!stillGoing()) return
        quickResolvedRef.current = null
        setRun({
          ...emptyRun(),
          ...resolved.run,
          step: STEPS.DONE,
          quick: null,
        })
      } catch (error) {
        if (error?.name === 'AbortError') return
        throw error
      } finally {
        setSpinning(false)
      }
    },
    [catalog],
  )

  const startQuickRoll = useCallback((picks) => startQuickSequence(picks, {}), [startQuickSequence])
  const startLucky = useCallback(() => startQuickSequence({}, { lucky: true }), [startQuickSequence])

  const leftover = useMemo(() => remainingAffixes(catalog, run), [catalog, run])
  const affixButton = !run.draft.difficulty
    ? 'Roll difficulty'
    : !run.draft.category
      ? 'Roll category'
      : !run.draft.affix
        ? 'Roll affix'
        : null

  return {
    run,
    spinning,
    leftover,
    affixButton,
    setFaction,
    chooseClass,
    chooseSpec,
    chooseRace,
    chooseProfession,
    chooseSelfFound,
    skipAffixes,
    startAffix,
    rollAffixTier,
    addAnotherAffix,
    finish,
    reset,
    startQuickRoll,
    startLucky,
    skipQuick,
  }
}
