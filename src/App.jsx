import { useEffect } from 'react'
import catalog from './data/catalog.json'
import { Header } from './components/Header.jsx'
import { SiteFooter } from './components/SiteFooter.jsx'
import { ProgressStrip } from './components/ProgressStrip.jsx'
import { QuickRollPanel } from './components/QuickRollPanel.jsx'
import { RunCard } from './components/RunCard.jsx'
import { AffixAskStep } from './components/steps/AffixAskStep.jsx'
import { SelfFoundStep } from './components/steps/SelfFoundStep.jsx'
import { AffixStep } from './components/steps/AffixStep.jsx'
import { DoneStep } from './components/steps/DoneStep.jsx'
import { FactionStep } from './components/steps/FactionStep.jsx'
import { RollOrPickStep } from './components/steps/RollOrPickStep.jsx'
import { AffixCatalogue } from './pages/AffixCatalogue.jsx'
import { FrictionGuide } from './pages/FrictionGuide.jsx'
import { professionChoices, racesFor, specsFor } from './engine/lookups.js'
import { useOverlay } from './hooks/useOverlay.js'
import { isRollPath, useRoute } from './hooks/useRoute.js'
import { STEPS, useRun } from './hooks/useRun.js'

const TITLES = {
  '/affixes': 'Affix catalog — GO AGAIN ROLL',
  '/friction': 'Friction methodology — GO AGAIN ROLL',
}

export default function App() {
  const path = useRoute()
  const onRollPage = isRollPath(path)
  const { overlay, toggleOverlay } = useOverlay(onRollPage)
  const overlayLive = overlay && onRollPage
  const machine = useRun(catalog, { pauseBetween: overlayLive })
  const showRoller = onRollPage
  const { run, spinning } = machine
  const holding = overlayLive && Boolean(run.holdNext)
  const showOverlayCard = overlayLive && run.step !== STEPS.DONE && run.step !== STEPS.QUICK_FIRE
  const previewItem = run.preview?.item
  const showStep = !holding
  const overlayCenter =
    holding && run.preview?.item
      ? { key: run.preview.key, item: run.preview.item, spinning: Boolean(run.preview.spinning) }
      : null

  useEffect(() => {
    document.title = onRollPage
      ? 'GO AGAIN ROLL — Forever Hardcore Challenge Generator'
      : TITLES[path] || 'GO AGAIN ROLL — Forever Hardcore Challenge Generator'
  }, [onRollPage, path])

  useEffect(() => {
    if (!overlayLive) return undefined

    const typing = (node) => {
      if (!node || node === document.body) return false
      const tag = node.tagName
      return tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || node.isContentEditable
    }

    const onKey = (event) => {
      if (typing(event.target)) return
      if (event.repeat) return

      if (event.key === 'Escape') {
        event.preventDefault()
        if (spinning && !run.holdNext) return
        if (run.step === STEPS.AFFIX && (run.draft?.affix || run.affixes.length)) {
          machine.finish()
          return
        }
        if (run.step === STEPS.AFFIX_ASK) {
          machine.skipAffixes()
          return
        }
        toggleOverlay()
        return
      }

      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      if (run.holdNext) {
        machine.continueHold()
        return
      }
      if (spinning) return
      if (run.step === STEPS.SELF_FOUND) machine.rollSelfFound()
      else if (run.step === STEPS.FACTION) machine.rollFaction()
      else if (run.step === STEPS.CLASS) machine.chooseClass()
      else if (run.step === STEPS.SPEC) machine.chooseSpec()
      else if (run.step === STEPS.RACE) machine.chooseRace()
      else if (run.step === STEPS.PROFESSIONS) machine.chooseProfession()
      else if (run.step === STEPS.AFFIX_ASK) machine.startAffix()
      else if (run.step === STEPS.AFFIX) {
        if (machine.affixButton) machine.rollAffixTier()
        else if (machine.leftover.length > 0) machine.addAnotherAffix()
        else machine.finish()
      } else if (run.step === STEPS.DONE) {
        document.getElementById('overlay-generate-card')?.click()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [overlayLive, spinning, run, machine, toggleOverlay])

  return (
    <div
      className={
        overlayLive
          ? 'overlay-shell min-h-svh px-4 py-8 sm:px-8 sm:py-10'
          : 'cabinet-grain min-h-svh px-4 py-8 sm:px-8 sm:py-10'
      }
    >
      {overlayLive ? (
        <button
          type="button"
          onClick={toggleOverlay}
          className="fixed top-3 right-3 z-50 min-h-11 border border-gold/50 bg-felt-deep/90 px-3 font-ui text-[11px] tracking-[0.28em] text-gold uppercase"
        >
          Exit overlay
        </button>
      ) : null}
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {overlayLive ? null : (
          <Header
            onReset={machine.reset}
            showReset={showRoller}
            showLastRoll={run.step !== STEPS.QUICK_FIRE}
            lastRollLabel={showRoller ? 'Reload your last roll' : 'Go back to your last roll'}
          />
        )}
        {showRoller && !overlayLive && run.step !== STEPS.DONE && run.step !== STEPS.QUICK_FIRE ? (
          <ProgressStrip run={run} />
        ) : null}

        <main className="rounded-sm bg-felt/80 p-4 sm:p-8 cabinet-frame">
          {!showRoller && path === '/affixes' ? <AffixCatalogue /> : null}
          {!showRoller && path === '/friction' ? <FrictionGuide /> : null}
          {showRoller ? (
          <>
          {showOverlayCard ? (
            <div className={showStep ? 'mb-10' : ''}>
              <RunCard
                run={run}
                overlay={overlayLive}
                center={overlayCenter}
                onReset={machine.reset}
                onContinue={machine.continueHold}
              />
            </div>
          ) : null}

          {showStep && run.step === STEPS.SELF_FOUND ? (
            <div className="flex flex-col">
              <SelfFoundStep
                onChoose={machine.chooseSelfFound}
                onRoll={machine.rollSelfFound}
                preview={run.preview?.key === 'selfFound' ? previewItem : null}
                spinning={spinning}
                reelSpinning={run.preview?.key === 'selfFound' && Boolean(run.preview.spinning)}
              />
              <div className="mt-16 border-t border-gold/20 pt-12">
                <QuickRollPanel onQuickRoll={machine.startQuickRoll} onLucky={machine.startLucky} />
              </div>
            </div>
          ) : null}

          {run.step === STEPS.QUICK_FIRE ? (
            <RunCard
              run={run}
              center={run.quick?.center}
              placing={run.quick?.placing}
              overlay={overlayLive}
              onReset={machine.reset}
              onSkip={machine.skipQuick}
              onContinue={machine.continueHold}
            />
          ) : null}

          {showStep && run.step === STEPS.FACTION ? (
            <FactionStep
              factions={catalog.factions}
              onChoose={machine.setFaction}
              onRoll={machine.rollFaction}
              preview={run.preview?.key === 'faction' ? previewItem : null}
              spinning={spinning}
              reelSpinning={run.preview?.key === 'faction' && Boolean(run.preview.spinning)}
            />
          ) : null}

          {showStep && run.step === STEPS.CLASS ? (
            <RollOrPickStep
              stepLabel="Step 03"
              title="Roll or pick your class"
              pool={catalog.classes}
              preview={run.preview?.key === 'class' ? previewItem : null}
              spinning={spinning}
              reelSpinning={run.preview?.key === 'class' && Boolean(run.preview.spinning)}
              onRoll={() => machine.chooseClass()}
              onPick={machine.chooseClass}
            />
          ) : null}

          {showStep && run.step === STEPS.SPEC ? (
            <RollOrPickStep
              stepLabel="Step 04"
              title="Roll or pick your spec"
              pool={specsFor(catalog, run.class)}
              preview={run.preview?.key === 'spec' ? previewItem : null}
              spinning={spinning}
              reelSpinning={run.preview?.key === 'spec' && Boolean(run.preview.spinning)}
              onRoll={() => machine.chooseSpec()}
              onPick={machine.chooseSpec}
            />
          ) : null}

          {showStep && run.step === STEPS.RACE ? (
            <RollOrPickStep
              stepLabel="Step 05"
              title="Roll or pick your race"
              pool={racesFor(catalog, run.class, run.faction.id)}
              preview={run.preview?.key === 'race' ? previewItem : null}
              spinning={spinning}
              reelSpinning={run.preview?.key === 'race' && Boolean(run.preview.spinning)}
              onRoll={() => machine.chooseRace()}
              onPick={machine.chooseRace}
            />
          ) : null}

          {showStep && run.step === STEPS.PROFESSIONS ? (
            <RollOrPickStep
              stepLabel="Step 06"
              title="Roll or pick professions"
              pool={professionChoices(catalog, run.class)}
              preview={run.preview?.key === 'profession' ? previewItem : null}
              spinning={spinning}
              reelSpinning={run.preview?.key === 'profession' && Boolean(run.preview.spinning)}
              onRoll={() => machine.chooseProfession()}
              onPick={machine.chooseProfession}
              groupBy
            />
          ) : null}

          {showStep && run.step === STEPS.AFFIX_ASK ? (
            <AffixAskStep
              leftover={machine.leftover.length}
              onYes={machine.startAffix}
              onNo={machine.skipAffixes}
            />
          ) : null}

          {showStep && run.step === STEPS.AFFIX ? (
            <AffixStep
              draft={run.draft}
              preview={run.preview}
              spinning={spinning}
              buttonLabel={machine.affixButton}
              leftover={machine.leftover.length}
              hasCommittedAffixes={run.affixes.length > 0}
              onRoll={machine.rollAffixTier}
              onAddAnother={machine.addAnotherAffix}
              onFinish={machine.finish}
            />
          ) : null}

          {run.step === STEPS.DONE ? (
            <DoneStep run={run} overlay={overlayLive} onReset={machine.reset} />
          ) : null}
          </>
          ) : null}
        </main>

        {overlayLive ? null : <SiteFooter onOverlay={showRoller ? toggleOverlay : undefined} />}
      </div>
    </div>
  )
}
