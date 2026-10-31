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
import { professionChoices, racesFor, specsFor } from './engine/lookups.js'
import { STEPS, useRun } from './hooks/useRun.js'

export default function App() {
  const machine = useRun(catalog)
  const { run, spinning } = machine
  const previewItem = run.preview?.item

  return (
    <div className="cabinet-grain min-h-svh px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Header onReset={machine.reset} />
        {run.step !== STEPS.DONE && run.step !== STEPS.QUICK_FIRE ? <ProgressStrip run={run} /> : null}

        <main className="rounded-sm bg-felt/80 p-4 sm:p-8 cabinet-frame">
          {run.step === STEPS.SELF_FOUND ? (
            <div className="flex flex-col">
              <SelfFoundStep onChoose={machine.chooseSelfFound} />
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
              onReset={machine.reset}
              onSkip={machine.skipQuick}
            />
          ) : null}

          {run.step === STEPS.FACTION ? (
            <FactionStep factions={catalog.factions} onChoose={machine.setFaction} />
          ) : null}

          {run.step === STEPS.CLASS ? (
            <RollOrPickStep
              stepLabel="Step 03"
              title="Roll or pick your class"
              pool={catalog.classes}
              preview={run.preview?.key === 'class' ? previewItem : null}
              spinning={spinning}
              onRoll={() => machine.chooseClass()}
              onPick={machine.chooseClass}
            />
          ) : null}

          {run.step === STEPS.SPEC ? (
            <RollOrPickStep
              stepLabel="Step 04"
              title="Roll or pick your spec"
              pool={specsFor(catalog, run.class)}
              preview={run.preview?.key === 'spec' ? previewItem : null}
              spinning={spinning}
              onRoll={() => machine.chooseSpec()}
              onPick={machine.chooseSpec}
            />
          ) : null}

          {run.step === STEPS.RACE ? (
            <RollOrPickStep
              stepLabel="Step 05"
              title="Roll or pick your race"
              pool={racesFor(catalog, run.class, run.faction.id)}
              preview={run.preview?.key === 'race' ? previewItem : null}
              spinning={spinning}
              onRoll={() => machine.chooseRace()}
              onPick={machine.chooseRace}
            />
          ) : null}

          {run.step === STEPS.PROFESSIONS ? (
            <RollOrPickStep
              stepLabel="Step 06"
              title="Roll or pick professions"
              pool={professionChoices(catalog, run.class)}
              preview={run.preview?.key === 'profession' ? previewItem : null}
              spinning={spinning}
              onRoll={() => machine.chooseProfession()}
              onPick={machine.chooseProfession}
              groupBy
            />
          ) : null}

          {run.step === STEPS.AFFIX_ASK ? (
            <AffixAskStep
              leftover={machine.leftover.length}
              onYes={machine.startAffix}
              onNo={machine.skipAffixes}
            />
          ) : null}

          {run.step === STEPS.AFFIX ? (
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

          {run.step === STEPS.DONE ? <DoneStep run={run} onReset={machine.reset} /> : null}
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
