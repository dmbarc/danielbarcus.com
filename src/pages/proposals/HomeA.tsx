import { FeaturedBoomsweeper, StudioPanel } from '../../components/Showcase'
import { projects, studio } from '../../content/site'
import {
  AboutSection,
  ContactSection,
  ExperienceSection,
  HeroSection,
  InstrumentsSection,
  ProjectsSection,
} from '../Home'

/** Proposal A — same instrument panel, with the studio and the shipped game up front. */
export function HomeA() {
  return (
    <>
      <HeroSection eyebrow={`Software engineer · Founder of ${studio.name}`}>
        <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          <a href="#shipping" className="silkscreen text-amber hover:text-bright">
            Boomsweeper, out now on Google Play →
          </a>
          <a href={studio.url} target="_blank" rel="noreferrer" className="silkscreen text-cyan hover:text-amber">
            {studio.urlLabel} →
          </a>
        </p>
      </HeroSection>
      <FeaturedBoomsweeper />
      <StudioPanel />
      <InstrumentsSection />
      <ProjectsSection items={projects.filter((p) => p.id !== 'boomsweeper')} />
      <ExperienceSection />
      <AboutSection />
      <ContactSection />
    </>
  )
}
