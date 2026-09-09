/**
 * Every word on the site lives here. Components read from this file, so
 * copy edits never mean touching JSX.
 */

export const profile = {
  name: 'Daniel M. Barcus',
  shortName: 'D. M. Barcus',
  title: 'Software Engineer',
  discipline: 'Simulation & Full-Stack',
  location: 'Rome, GA',
  email: 'danielmbarcus@gmail.com',
  linkedin: 'https://linkedin.com/in/danielbarcus',
  github: 'https://github.com/dmbarc',
  available: true,
  availabilityNote: 'Open to work — onsite in NW Georgia or remote',
}

export const hero = {
  eyebrow: 'CH1 — SOFTWARE ENGINEER II',
  headline: 'I build the machines that teach the machines.',
  lede: `Five years of Unity and C#/.NET training simulations for military maintenance — cockpit
    interfaces, electrical diagnostics, and instruments modelled straight from the engineering
    drawings, for the people who then go fix the real aircraft.`,
  // The invitation matters more than the claim: the instruments below are
  // running code, not screenshots.
  cta: 'The instruments on this site are real. Turn the knobs.',
}

export const readout = [
  { key: 'Experience', value: '5+ yrs', channel: 1 },
  { key: 'Primary stack', value: 'C# / .NET', channel: 2 },
  { key: 'Engine', value: 'Unity', channel: 1 },
  { key: 'Certified', value: 'PSM I', channel: 2 },
] as const

export const about = {
  heading: 'About',
  body: [
    `My job for the last five years was turning documents that were never meant to be software —
     wiring diagrams, repair manuals, engineering specs — into simulations that behave the way the
     hardware actually behaves. If a gauge reads wrong, a technician learns the wrong thing, so
     "close enough" was never the standard.`,
    `Before simulation I spent two years at Publix keeping five internal enterprise systems alive:
     Tier 3 incidents, overnight on-call, nightly installs. I have restored the deli labeling system
     at 4am so a store could open on time. That work taught me more about writing software people
     depend on than any project since.`,
    `I am looking for my next role now — my position at Carley ended in August 2026 when the
     contracts that funded that line of work were not awarded. I am open to simulation, games,
     backend .NET, or full-stack web.`,
  ],
}

/** Live, interactive demos built for this site. */
export type Demo = {
  id: string
  index: string
  name: string
  blurb: string
  detail: string
  tags: string[]
  status: 'live' | 'building'
  /** Route to the working instrument, once it exists. */
  to?: string
}

export const demos: Demo[] = [
  {
    id: 'oscilloscope',
    index: '01',
    name: 'Oscilloscope & Function Generator',
    blurb: 'A working two-channel scope. Real controls, real signal math.',
    detail: `At Carley I built a waveform generator and oscilloscope that replicated real-device
      behaviour in real time. This is that instrument, rebuilt for the browser: volts and time per
      division, trigger level and slope, AC/DC coupling, and a generator feeding it. Nothing is
      pre-rendered — the trace is computed per frame from the signal parameters.`,
    tags: ['TypeScript', 'Canvas', 'Signal math'],
    status: 'live',
    to: '/instruments/oscilloscope',
  },
  {
    id: 'fault-isolation',
    index: '02',
    name: 'Electrical Fault Isolation',
    blurb: 'A circuit, a hidden fault, and a multimeter. Find it.',
    detail: `I helped lead a team delivering 30+ electrical-diagnostics lessons for a mock F-18
      trainer in under twelve months. This is the same idea on a generic circuit: a fault is injected
      at random, and you isolate it by probing test points with a meter. The circuit is solved from
      its actual topology, so every reading you take is consistent with every other one.`,
    tags: ['TypeScript', 'Circuit solver', 'SVG'],
    status: 'building',
  },
  {
    id: 'mfd',
    index: '03',
    name: 'Multi-Function Display',
    blurb: 'A glass cockpit panel — softkeys, paged displays, CDU scratchpad.',
    detail: `I engineered simulated CH-53K MFD and CDU cockpit interfaces in Coherent UI embedded in
      Unity, and the customer preferred them to the training software they already had. That aircraft
      is not mine to show, so this is the same interface grammar on an invented airframe: bezel
      softkeys, page hierarchy, a scratchpad line, and annunciators driven by a small systems model.`,
    tags: ['React', 'State machines', 'Systems model'],
    status: 'building',
  },
]

/** Shipped and personal work that exists outside this site. */
export type Project = {
  id: string
  name: string
  blurb: string
  detail: string
  tags: string[]
  status: string
  statusTone: 'live' | 'caution' | 'idle'
  href?: string
  hrefLabel?: string
}

export const projects: Project[] = [
  {
    id: 'idle-explorers',
    name: 'Idle Explorers MMO',
    blurb: 'A server-authoritative Unity MMO on ASP.NET Core and Postgres.',
    detail: `The game is parked, but the architecture is the part worth reading. Every rule lives on
      the server in one shared C# tree; the Unity client can only ask, never decide. Row-level
      security is enabled and forced with no policies on every table, so the database denies by
      default and the API is the only way in. The build refuses to compile if a secret-class key ever
      appears in client config.`,
    tags: ['C#', 'ASP.NET Core', 'Postgres', 'Unity', 'WebGL'],
    status: 'Parked · source public',
    statusTone: 'idle',
    href: 'https://github.com/dmbarc/Idle-Explorers-MMO',
    hrefLabel: 'Read the source',
  },
  {
    id: 'boomsweeper',
    name: 'Boomsweeper',
    blurb: 'An idle minesweeper for Android where flags score nothing, on purpose.',
    detail: `Flagging a mine earns you exactly zero. The only way to score is to keep clicking cells
      you are not certain about, which turns the safest move in minesweeper into the least rewarding
      one. Currently in development toward a store release.`,
    tags: ['Unity', 'C#', 'Android'],
    status: 'In development',
    statusTone: 'caution',
  },
]

export type Role = {
  org: string
  title: string
  location: string
  dates: string
  bullets: string[]
}

export const experience: Role[] = [
  {
    org: 'Carley Corporation',
    title: 'Software Engineer II',
    location: 'Orlando, FL',
    dates: 'Mar 2021 – Aug 2026',
    bullets: [
      `Built full-stack Unity training simulations for military mechanical and electrical
       maintenance — UI, 3D world interaction, animation and simulation logic in C# from the ground
       up, across multiple software suites.`,
      `Engineered simulated CH-53K MFD and CDU cockpit interfaces in Coherent UI (JavaScript, HTML,
       CSS) embedded in Unity; delivered interfaces the customer praised over their existing training
       software.`,
      `Built a fully functional waveform generator and oscilloscope simulation that replicated real
       device behaviour in real time.`,
      `Interpreted electrical diagrams, engineering drawings and repair manuals to model accurate
       system and gauge behaviour, performing the underlying simulation calculations.`,
      `Led conversion of legacy HDRP projects to URP, substantially improving rendering performance
       and finishing ahead of schedule.`,
      `Helped lead a small team delivering 30+ electrical-diagnostics lessons for a mock F-18 trainer
       in under twelve months; onboarded and mentored new engineers on standards and Kanban flow.`,
    ],
  },
  {
    org: 'Publix Super Markets',
    title: 'Programmer, Application Support',
    location: 'Lakeland, FL',
    dates: 'Apr 2019 – Mar 2021',
    bullets: [
      `Supported five internal enterprise systems end to end: production troubleshooting, Tier 3
       incident resolution, overnight on-call, and nightly installs and updates.`,
      `Developed and maintained features in C# .NET, ASP.NET, Visual Basic and SQL; joined the SIIMS
       web application team delivering backlog items with Telerik UI, Azure DevOps and Git.`,
      `Automated file transfers, package installs and reporting across remote systems with PowerShell
       and SQL; built SharePoint solutions with Power Automate and PowerApps.`,
      `Restored the deli and meat labeling systems before peak business hours during critical
       incidents, preventing lost sales.`,
    ],
  },
  {
    org: 'Publix Super Markets',
    title: 'Grocery Leadership',
    location: 'Canton / Dahlonega, GA',
    dates: 'Aug 2014 – Apr 2019',
    bullets: [
      `Led grocery department teams — priority planning, training and mentoring associates — and
       analysed inventory, pricing and sales-trend data to drive replenishment and reduce waste.`,
    ],
  },
]

export const skills = [
  { group: 'Languages', items: ['C#', 'TypeScript', 'JavaScript', 'SQL', 'PowerShell', 'HTML', 'CSS', 'Visual Basic'] },
  { group: 'Frameworks', items: ['.NET / ASP.NET', 'Unity', 'React', 'Coherent UI', 'Telerik / Kendo UI', 'SharePoint'] },
  { group: 'Tools', items: ['Azure DevOps', 'Git', 'Visual Studio', 'JIRA', 'Postgres', 'Supabase'] },
  { group: 'Practice', items: ['Agile / Scrum (PSM I)', 'Kanban', 'Unit testing', 'On-call support'] },
]

export const education = [
  { what: 'B.S. Computer Science', where: 'University of North Georgia', when: 'Dec 2016' },
  { what: 'Professional Scrum Master I', where: 'Scrum.org', when: 'Oct 2020' },
]
