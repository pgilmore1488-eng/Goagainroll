import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  affixesFor,
  getProfession,
  professionChoices,
  racesFor,
  remainingAffixes,
  resolveSubRoll,
  specsFor,
  viableCategories,
  viableDifficulties,
} from '../engine/lookups.js'
import { buildQuickSequence, resolveQuickRun, selfFoundDisplay } from '../engine/quickRoll.js'
import { decodeRun, encodeRun, fetchSharedToken, replaceLocation, shortIdFromPath } from '../engine/share.js'
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
const WIZARD_SPIN_MS = 700
const WIZARD_FLASH_MS = 55

function applyQuickEvent(current, event) {
  if (event.key === 'selfFound') return { ...current, selfFound: event.item }
  if (event.key === 'affixCount') return { ...current, plannedAffixCount: event.item }
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
    selfFound: null,
    affixes: [],
    plannedAffixCount: null,
    draft: emptyDraft,
    preview: null,
    shareNotice: null,
    shareLoading: false,
    holdNext: null,
    holdPatch: null,
  }
}

export function useRun(catalog, { pauseBetween = false } = {}) {
  const [run, setRun] = useState(() => {
    if (shortIdFromPath()) return { ...emptyRun(), step: STEPS.DONE, shareLoading: true }
    const token = window.location.hash.replace(/^#/, '')
    const shared = decodeRun(catalog, token)
    if (!shared) return emptyRun()
    return { ...emptyRun(), ...shared, step: STEPS.DONE }
  })
  const [spinning, setSpinning] = useState(false)
  const abortRef = useRef(null)
  const quickGenRef = useRef(0)
  const quickResolvedRef = useRef(null)
  const pauseRef = useRef(pauseBetween)
  const nextWaitRef = useRef(null)
  const runRef = useRef(run)
  pauseRef.current = pauseBetween
  runRef.current = run

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
    const id = shortIdFromPath()
    if (!id) return undefined
    let cancelled = false
    fetchSharedToken(id)
      .then((token) => {
        if (cancelled) return
        const shared = decodeRun(catalog, token)
        if (shared) {
          setRun({ ...emptyRun(), ...shared, step: STEPS.DONE })
          return
        }
        replaceLocation({ pathname: '/', hash: '' })
        setRun(emptyRun())
      })
      .catch(() => {
        if (cancelled) return
        replaceLocation({ pathname: '/', hash: '' })
        setRun(emptyRun())
      })
    return () => {
      cancelled = true
    }
  }, [catalog])

  useEffect(() => {
    if (run.step !== STEPS.DONE || run.shareLoading) return
    if (shortIdFromPath()) return
    const token = encodeRun(run)
    if (token && window.location.hash.replace(/^#/, '') !== token) {
      replaceLocation({ hash: `#${token}` })
    }
  }, [run])

  const startAbort = () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setSpinning(true)
    return controller
  }

  const revealThen = useCallback(async (item, previewKey) => {
    if (!item) return null
    const controller = startAbort()
    try {
      setRun((current) => ({
        ...current,
        preview: { key: previewKey, item, spinning: false },
      }))
      if (!pauseRef.current) {
        await sleep(QUICK_HOLD_MS, controller.signal)
        setRun((current) => ({ ...current, preview: null }))
      }
      return item
    } catch (error) {
      if (error?.name === 'AbortError') return null
      throw error
    } finally {
      setSpinning(false)
    }
  }, [])

  const spinThen = useCallback(async (pool, pick, previewKey, decorate = (item) => item) => {
    const options = (pool ?? []).filter(Boolean)
    const controller = startAbort()
    try {
      if (options.length > 1) {
        const started = Date.now()
        while (Date.now() - started < WIZARD_SPIN_MS) {
          const flash = decorate(evenPick(options))
          setRun((current) => ({
            ...current,
            preview: { key: previewKey, item: flash, spinning: true },
          }))
          await sleep(WIZARD_FLASH_MS, controller.signal)
        }
      }
      const raw = options.length <= 1 ? (options[0] ?? pick()) : pick()
      const chosen = raw ? decorate(raw) : null
      if (!chosen) return null
      setRun((current) => ({
        ...current,
        preview: { key: previewKey, item: chosen, spinning: false },
      }))
      if (!pauseRef.current) {
        await sleep(QUICK_HOLD_MS, controller.signal)
        setRun((current) => ({ ...current, preview: null }))
      }
      return chosen
    } catch (error) {
      if (error?.name === 'AbortError') return null
      throw error
    } finally {
      setSpinning(false)
    }
  }, [])

  const lockPicked = (patch, nextStep) => {
    setRun((current) => ({
      ...current,
      ...patch,
      preview: null,
      holdNext: null,
      holdPatch: null,
      step: nextStep,
    }))
  }

  const lockRolled = (patch, nextStep) => {
    if (!pauseRef.current) {
      lockPicked(patch, nextStep)
      return
    }
    setRun((current) => ({
      ...current,
      holdNext: nextStep,
      holdPatch: patch,
    }))
  }

  const waitForPresenter = async (controller) => {
    if (!pauseRef.current) {
      await sleep(QUICK_HOLD_MS, controller.signal)
      return
    }
    await new Promise((resolve, reject) => {
      const abort = () => {
        nextWaitRef.current = null
        const error = new Error('Aborted')
        error.name = 'AbortError'
        reject(error)
      }
      nextWaitRef.current = () => {
        controller.signal.removeEventListener('abort', abort)
        nextWaitRef.current = null
        setRun((current) => ({ ...current, holdNext: null }))
        resolve()
      }
      controller.signal.addEventListener('abort', abort, { once: true })
      setRun((current) => ({ ...current, holdNext: 'quick' }))
    })
  }

  const continueHold = useCallback(() => {
    if (nextWaitRef.current) {
      nextWaitRef.current()
      return
    }
    setRun((current) => {
      if (!current.holdNext || current.holdNext === 'quick') {
        return { ...current, holdNext: null, holdPatch: null }
      }
      return {
        ...current,
        ...current.holdPatch,
        step: current.holdNext,
        holdNext: null,
        holdPatch: null,
        preview: null,
      }
    })
  }, [])

  useEffect(() => {
    if (pauseBetween) return undefined
    if (nextWaitRef.current) {
      nextWaitRef.current()
      return undefined
    }
    setRun((current) => {
      if (!current.holdNext || current.holdNext === 'quick') {
        return current.holdNext ? { ...current, holdNext: null, holdPatch: null } : current
      }
      return {
        ...current,
        ...current.holdPatch,
        step: current.holdNext,
        holdNext: null,
        holdPatch: null,
        preview: null,
      }
    })
    return undefined
  }, [pauseBetween])

  const setFaction = useCallback(
    async (faction) => {
      if (spinning) return
      if (pauseRef.current) {
        lockPicked({ faction }, STEPS.CLASS)
        return
      }
      const shown = await revealThen(faction, 'faction')
      if (!shown) return
      lockPicked({ faction: shown }, STEPS.CLASS)
    },
    [revealThen, spinning],
  )

  const rollFaction = useCallback(async () => {
    if (spinning) return
    const pool = catalog.factions
    const chosen = await spinThen(pool, () => evenPick(pool), 'faction')
    if (!chosen) return
    lockRolled({ faction: chosen }, STEPS.CLASS)
  }, [catalog.factions, spinThen, spinning])

  const chooseClass = useCallback(
    async (classItem) => {
      if (spinning) return
      if (classItem) {
        if (pauseRef.current) {
          lockPicked({ class: classItem, spec: null }, STEPS.SPEC)
          return
        }
        const chosen = await revealThen(classItem, 'class')
        if (!chosen) return
        lockPicked({ class: chosen, spec: null }, STEPS.SPEC)
        return
      }
      const chosen = await spinThen(catalog.classes, () => evenPick(catalog.classes), 'class')
      if (!chosen) return
      lockRolled({ class: chosen, spec: null }, STEPS.SPEC)
    },
    [catalog.classes, revealThen, spinThen, spinning],
  )

  const chooseSpec = useCallback(
    async (specItem) => {
      if (spinning) return
      const pool = specsFor(catalog, run.class)
      if (specItem) {
        if (pauseRef.current) {
          lockPicked({ spec: specItem }, STEPS.RACE)
          return
        }
        const chosen = await revealThen(specItem, 'spec')
        if (!chosen) return
        lockPicked({ spec: chosen }, STEPS.RACE)
        return
      }
      const chosen = await spinThen(pool, () => evenPick(pool), 'spec')
      if (!chosen) return
      lockRolled({ spec: chosen }, STEPS.RACE)
    },
    [catalog, revealThen, run.class, spinThen, spinning],
  )

  const chooseRace = useCallback(
    async (raceItem) => {
      if (spinning) return
      const pool = racesFor(catalog, run.class, run.faction.id)
      if (raceItem) {
        if (pauseRef.current) {
          lockPicked({ race: raceItem }, STEPS.PROFESSIONS)
          return
        }
        const chosen = await revealThen(raceItem, 'race')
        if (!chosen) return
        lockPicked({ race: chosen }, STEPS.PROFESSIONS)
        return
      }
      const chosen = await spinThen(pool, () => evenPick(pool), 'race')
      if (!chosen) return
      lockRolled({ race: chosen }, STEPS.PROFESSIONS)
    },
    [catalog, revealThen, run.class, run.faction, spinThen, spinning],
  )

  const chooseProfession = useCallback(
    async (pair) => {
      if (spinning) return
      const pool = professionChoices(catalog, run.class)
      if (pair) {
        const picked = getProfession(catalog, pair.id) ?? pair
        const next = remainingAffixes(catalog, { ...runRef.current, profession: picked }).length
          ? STEPS.AFFIX_ASK
          : STEPS.DONE
        if (pauseRef.current) {
          lockPicked({ profession: picked }, next)
          return
        }
        const chosen = await revealThen(picked, 'profession')
        if (!chosen) return
        lockPicked({ profession: chosen }, next)
        return
      }
      const chosen = await spinThen(pool, () => weightedPick(pool), 'profession')
      if (!chosen) return
      const next = remainingAffixes(catalog, { ...runRef.current, profession: chosen }).length
        ? STEPS.AFFIX_ASK
        : STEPS.DONE
      lockRolled({ profession: chosen }, next)
    },
    [catalog, revealThen, run.class, spinThen, spinning],
  )

  const chooseSelfFound = useCallback(
    async (selfFound) => {
      if (spinning) return
      if (pauseRef.current) {
        lockPicked({ selfFound }, STEPS.FACTION)
        return
      }
      const shown = await revealThen(selfFoundDisplay(catalog, selfFound), 'selfFound')
      if (!shown) return
      lockPicked({ selfFound }, STEPS.FACTION)
    },
    [catalog, revealThen, spinning],
  )

  const rollSelfFound = useCallback(async () => {
    if (spinning) return
    const pool = [
      { value: true, ...selfFoundDisplay(catalog, true) },
      { value: false, ...selfFoundDisplay(catalog, false) },
    ]
    const chosen = await spinThen(pool, () => evenPick(pool), 'selfFound')
    if (!chosen) return
    lockRolled({ selfFound: chosen.value }, STEPS.FACTION)
  }, [catalog, spinThen, spinning])

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
      setRun((current) => ({ ...current, preview: null }))
      const viable = viableDifficulties(catalog, ctx)
      const pool = viable.length ? viable : catalog.difficulties
      const chosen = await spinThen(pool, () => weightedPick(pool), 'difficulty')
      if (!chosen) return
      setRun((current) => ({ ...current, draft: { ...emptyDraft, difficulty: chosen } }))
      return
    }

    if (!ctx.draft.category) {
      const viable = viableCategories(catalog, ctx, ctx.draft.difficulty.id)
      const pool = viable.length ? viable : catalog.affixCategories
      const chosen = await spinThen(pool, () => evenPick(pool), 'category')
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
      preview: null,
      holdNext: null,
      holdPatch: null,
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
    replaceLocation({ pathname: '/', hash: '' })
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
        for (const event of sequence) {
          if (pauseRef.current && event.locked) {
            if (!stillGoing()) return
            setRun((current) => ({
              ...applyQuickEvent(current, event),
              quick: { center: null, placing: placingKey(event) },
            }))
            await sleep(QUICK_PLACE_MS, controller.signal)
            continue
          }

          const canSpin = !event.locked && (event.pool?.length ?? 0) > 1

          if (canSpin) {
            const started = Date.now()
            while (Date.now() - started < QUICK_SPIN_MS) {
              if (!stillGoing()) return
              setRun((current) => ({
                ...current,
                quick: { center: spinningCenter(event), placing: null },
              }))
              await sleep(QUICK_FLASH_MS, controller.signal)
            }
          }

          if (!stillGoing()) return
          setRun((current) => ({
            ...current,
            quick: {
              center: { key: event.key, item: event.display, spinning: false },
              placing: null,
            },
          }))
          await waitForPresenter(controller)

          if (!stillGoing()) return
          setRun((current) => ({
            ...applyQuickEvent(current, event),
            quick: { center: null, placing: placingKey(event) },
          }))
          await sleep(QUICK_PLACE_MS, controller.signal)
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
    rollFaction,
    chooseClass,
    chooseSpec,
    chooseRace,
    chooseProfession,
    chooseSelfFound,
    rollSelfFound,
    skipAffixes,
    startAffix,
    rollAffixTier,
    addAnotherAffix,
    finish,
    reset,
    startQuickRoll,
    startLucky,
    skipQuick,
    continueHold,
  }
}
