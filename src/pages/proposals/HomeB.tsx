import { BoomsweeperShowcase, PlayButton, StudioButton } from '../../components/Showcase'
import { ScopeTrace } from '../../components/ScopeTrace'
import { boomsweeper, hero, profile, projects, studio } from '../../content/site'
import {
  AboutSection,
  ContactSection,
  ExperienceSection,
  InstrumentsSection,
  ProjectsSection,
} from '../Home'

/** A name-first hero: who Daniel is, what he runs, and the game, before anything else. */
function FounderHero() {
  return (
    <section className="px-4 pt-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden border-2 border-line bg-screen">
          <ScopeTrace className="absolute inset-0 h-full opacity-50" />
          <div className="relative grid gap-8 px-6 py-8 sm:px-10 md:grid-cols-[1.25fr_1fr] md:items-center">
            <div>
              <p className="silkscreen mb-4 text-cyan">
                Software engineer · {studio.role}, {studio.name}
              </p>
              <h1 className="text-[clamp(2.4rem,6.5vw,4.4rem)] leading-[0.98] font-bold tracking-tight">
                {profile.name.replace(' M.', '')}
              </h1>
              <p className="mt-4 max-w-[34ch] text-lg leading-snug font-semibold text-bright">
                {hero.headline}
              </p>
              <p className="mt-3 max-w-[50ch] text-[0.9rem] leading-relaxed">
                I run {studio.name}, an independent game studio, and spent five years before that
                building Unity and C# training simulations for military aircraft maintenance.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <PlayButton />
                <StudioButton />
              </div>
            </div>
            <div className="relative mx-auto flex w-full max-w-[340px] justify-center">
              <img
                src={boomsweeper.features[2].image}
                alt=""
                className="absolute top-8 left-0 w-[52%] -rotate-6 rounded-[1.1rem] border-4 border-rail opacity-80 shadow-xl"
              />
              <img
                src={boomsweeper.features[0].image}
                alt="Boomsweeper on Android"
                className="relative z-10 ml-[30%] w-[58%] rotate-3 rounded-[1.1rem] border-4 border-rail shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Proposal B — founder first, the game as a full press-kit section. */
export function HomeB() {
  return (
    <>
      <FounderHero />
      <BoomsweeperShowcase />
      <InstrumentsSection />
      <ProjectsSection items={projects.filter((p) => p.id !== 'boomsweeper')} />
      <ExperienceSection />
      <AboutSection />
      <ContactSection />
    </>
  )
}
