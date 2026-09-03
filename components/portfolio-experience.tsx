'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDown, ArrowUpRight, BookOpen, BriefcaseBusiness, Dumbbell,
  ExternalLink, GitBranch, GraduationCap, Mail, MapPinned, Phone,
  Plane, Satellite, Sparkles, Gamepad2, Volume2,
} from 'lucide-react';
import { feature } from 'topojson-client';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import world from 'world-atlas/countries-110m.json';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { exerciseLabels, type Exercise, type LiftEntry, type Place, type SiteData } from '@/lib/site-data';

const experience = [
  { years: '2023—NOW', company: 'Boston Consulting Group', role: 'Project Leader', detail: 'Leading enterprise AI adoption, technology transformation, cloud resilience, operating-model design, and measurable productivity programs.', stat: '4+ weeks', statLabel: 'faster regulatory filing' },
  { years: '2019—2021', company: 'Samsung', role: 'Product Manager', detail: 'Owned Samsung TV+ and launched personalized discovery experiences, leading an 18-person cross-functional product team.', stat: '5.4M', statLabel: 'active users' },
  { years: '2017—2019', company: 'Samsung', role: 'Lead Software Engineer', detail: 'Restructured high-scale login services and delivered Tizen OS licensing APIs across 30+ services and four countries.', stat: '73%', statLabel: 'lower response time' },
];

const education = [
  { school: 'The Wharton School', degree: 'MBA · Business Analytics', years: '2021—2023', note: 'Joseph Wharton Fellow · GMAT 760' },
  { school: 'Indian Institute of Technology, Patna', degree: 'B.Tech · Electrical Engineering', years: '2013—2017', note: 'Top 5% · Highest Honors' },
];

const atlasDestinations = [
  { href: '#about', label: 'The Studio', detail: 'About & experience', icon: BriefcaseBusiness, dialog: 'The path from engineering large-scale systems to leading enterprise AI and product strategy.' },
  { href: '#work', label: 'The Workshop', detail: 'Products & systems', icon: Sparkles, dialog: 'A curated set of public engineering projects and the systems behind them.' },
  { href: '#research', label: 'The Library', detail: 'Published research', icon: BookOpen, dialog: 'Four peer-reviewed publications across computer vision, gesture analysis, stereo depth, and emotion recognition.' },
  { href: '#travel', label: 'The Airfield', detail: 'Places visited', icon: Plane, dialog: 'An evolving world map of cities visited, paired with an accessible city list.' },
  { href: '#strength', label: 'The Gym', detail: 'Strength log', icon: Dumbbell, dialog: 'A public progress dashboard for bench, squat, overhead press, and push-ups.' },
  { href: '#contact', label: 'The Postbox', detail: 'Get in touch', icon: Mail, dialog: 'Email, LinkedIn, GitHub, and Google Scholar—all in one place.' },
];

function AtlasNavigation() {
  const [started, setStarted] = useState(false);
  return (
    <div className={started ? 'game-world is-playing' : 'game-world'} id="atlas" aria-label="Explore Piyush's personal world">
      <img className="world-art" src="/pixel-world.png" alt="An illustrated island containing a studio, technology workshop, library, airfield, outdoor gym, and postbox" />
      <div className="world-vignette" aria-hidden="true" />
      {!started ? <div className="start-screen">
        <p className="game-overline">An interactive portfolio</p>
        <h1 id="hero-title">Piyush<br/><em>Bhandari</em></h1>
        <p>Product leader · AI strategist · Builder</p>
        <button className="play-button" onClick={() => setStarted(true)}><span>Play</span><Gamepad2 size={18} aria-hidden="true" /></button>
        <small>Or scroll to explore the accessible portfolio</small>
      </div> : <>
        <div className="game-hud">
          <span className="hud-avatar">PB</span><span><small>Explorer</small><strong>Piyush’s World</strong></span>
        </div>
        <div className="game-status"><span className="status-dot" /> Choose a destination <Volume2 size={14} aria-hidden="true" /></div>
        <div className="player-marker" aria-hidden="true"><span>PB</span></div>
        <div className="destination-menu" aria-label="World destinations">
          {atlasDestinations.map(({ href, label, detail, icon: Icon, dialog }, index) => (
            <Dialog key={href}>
              <DialogTrigger className={`destination destination-${index + 1}`} aria-label={`${label}: ${detail}`}>
                <span className="destination-pulse" aria-hidden="true" />
                <span className="destination-icon"><Icon size={17} strokeWidth={2} aria-hidden="true" /></span>
                <span className="destination-label"><strong>{label}</strong><small>{detail}</small></span>
              </DialogTrigger>
              <DialogContent className="atlas-dialog">
                <DialogHeader>
                  <span className="dialog-symbol"><Icon size={22} aria-hidden="true" /></span>
                  <DialogTitle>{label}</DialogTitle>
                  <DialogDescription>{dialog}</DialogDescription>
                </DialogHeader>
                <a className="dialog-continue" href={href}>Enter destination <ArrowDown size={15} aria-hidden="true" /></a>
              </DialogContent>
            </Dialog>
          ))}
        </div>
        <div className="touch-controls" aria-hidden="true"><span>↑</span><span>←</span><span>↓</span><span>→</span></div>
      </>}
    </div>
  );
}

function SectionHead({ number, place, title, dark = false }: { number: string; place: string; title: string; dark?: boolean }) {
  return <div className="section-heading"><div className="section-number">{number}</div><div><p className={`eyebrow ${dark ? '' : 'dark'}`}><span /> {place}</p><h2>{title}</h2></div></div>;
}

function WorldMap({ places }: { places: Place[] }) {
  const [selected, setSelected] = useState<number | null>(places[0]?.id ?? null);
  const { paths, project } = useMemo(() => {
    const collection = feature(world as any, (world as any).objects.countries) as any;
    const projection = geoNaturalEarth1().fitExtent([[12, 12], [988, 488]], collection);
    const path = geoPath(projection);
    return { paths: collection.features.map((item: any, i: number) => ({ id: item.id ?? i, d: path(item) ?? '' })), project: (coords: [number, number]) => projection(coords) };
  }, []);
  return (
    <div className="map-layout">
      <div className="world-map-wrap">
        <svg className="world-map" viewBox="0 0 1000 500" role="img" aria-labelledby="map-title map-desc">
          <title id="map-title">Cities Piyush has visited</title>
          <desc id="map-desc">An interactive map. The same places are available in the list beside the map.</desc>
          <g>{paths.map((country: any) => <path key={country.id} d={country.d} className="country" />)}</g>
          {places.map((place) => {
            const point = project([place.longitude, place.latitude]); if (!point) return null;
            return <g key={place.id} transform={`translate(${point[0]} ${point[1]})`}>
              <button aria-label={`${place.city}, ${place.country}`} onClick={() => setSelected(place.id)}>
                <circle r={selected === place.id ? 10 : 7} className={selected === place.id ? 'map-pin selected' : 'map-pin'} />
                <circle r="2.2" className="map-pin-core" />
              </button>
            </g>;
          })}
        </svg>
        {!places.length && <div className="map-empty"><MapPinned size={26} /><strong>The atlas is ready.</strong><span>Visited cities can be added from the owner dashboard.</span></div>}
      </div>
      <div className="place-list" aria-label="Visited cities list">
        <div className="list-label"><span>City index</span><span>{String(places.length).padStart(2, '0')} places</span></div>
        {places.length ? places.map((place) => <button className={selected === place.id ? 'place-row active' : 'place-row'} key={place.id} onClick={() => setSelected(place.id)}><span><strong>{place.city}</strong><small>{place.country}{place.year ? ` · ${place.year}` : ''}</small></span><span aria-hidden="true">{selected === place.id ? '●' : '○'}</span></button>) : <p className="empty-copy">No cities have been published yet. This list will always mirror the map.</p>}
      </div>
    </div>
  );
}

function aggregateLifts(entries: LiftEntry[], exercise: Exercise, range: string) {
  const days = range === '1m' ? 31 : range === '3m' ? 93 : range === '6m' ? 186 : null;
  const cutoff = days ? new Date(Date.now() - days * 86400000) : null;
  const selected = entries.filter((entry) => entry.exercise === exercise && (!cutoff || new Date(`${entry.date}T00:00:00`) >= cutoff));
  const byDate = new Map<string, { date: string; best: number; volume: number }>();
  for (const entry of selected) {
    const weight = exercise === 'push-ups' ? entry.reps : (entry.weightLb ?? 0);
    const volume = exercise === 'push-ups' ? entry.sets * entry.reps : weight * entry.sets * entry.reps;
    const current = byDate.get(entry.date) ?? { date: entry.date, best: 0, volume: 0 };
    current.best = Math.max(current.best, weight); current.volume += volume; byDate.set(entry.date, current);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function StrengthTracker({ entries }: { entries: LiftEntry[] }) {
  const [exercise, setExercise] = useState<Exercise>('bench-press');
  const [range, setRange] = useState('6m');
  const data = useMemo(() => aggregateLifts(entries, exercise, range), [entries, exercise, range]);
  const current = data.at(-1)?.best ?? null;
  const best = data.length ? Math.max(...data.map((x) => x.best)) : null;
  const suffix = exercise === 'push-ups' ? ' reps' : ' lb';
  return <div className="strength-shell">
    <div className="tracker-controls">
      <div className="segmented" role="group" aria-label="Exercise">
        {(Object.keys(exerciseLabels) as Exercise[]).map((key) => <button key={key} className={exercise === key ? 'active' : ''} onClick={() => setExercise(key)}>{exerciseLabels[key]}</button>)}
      </div>
      <div className="range-controls" role="group" aria-label="Date range">
        {['1m','3m','6m','all'].map((key) => <button key={key} className={range === key ? 'active' : ''} onClick={() => setRange(key)}>{key === 'all' ? 'All' : key.toUpperCase()}</button>)}
      </div>
    </div>
    <div className="tracker-body">
      <div className="stat-stack"><div><span>Current</span><strong>{current == null ? '—' : `${current}${suffix}`}</strong></div><div><span>Personal best</span><strong>{best == null ? '—' : `${best}${suffix}`}</strong></div><div><span>Logged sessions</span><strong>{data.length || '—'}</strong></div></div>
      <div className="chart-panel">
        {data.length ? <ChartContainer config={{ best: { label: exercise === 'push-ups' ? 'Best set' : 'Best weight', color: '#55d6c2' }, volume: { label: 'Volume', color: '#ff6b4a' } }} className="h-[310px] w-full aspect-auto">
          <LineChart accessibilityLayer data={data} margin={{ left: 0, right: 18, top: 18, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(242,236,217,.13)" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={12} minTickGap={28} tickFormatter={(value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
            <YAxis tickLine={false} axisLine={false} width={45} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Line type="monotone" dataKey="best" stroke="var(--color-best)" strokeWidth={3} dot={{ r: 3, fill: '#091426' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ChartContainer> : <div className="tracker-empty"><Dumbbell size={28}/><strong>No sessions published yet</strong><p>The tracker is live and ready for bench, squat, overhead press, and push-up entries from the private dashboard.</p></div>}
      </div>
    </div>
  </div>;
}

export function PortfolioExperience({ data }: { data: SiteData }) {
  const { profile, projects, publications, places, lifts } = data;
  const profileImage = profile.profileImageKey ? `/api/files/${encodeURIComponent(profile.profileImageKey)}` : 'https://avatars.githubusercontent.com/u/13988533?s=512&v=4';
  return <main>
    <a className="skip-link" href="#about">Skip to profile</a>
    <section className="atlas-hero" id="top" aria-labelledby="hero-title">
      <nav className="topbar" aria-label="Primary navigation"><a className="monogram" href="#top" aria-label="Piyush Bhandari home">PB</a><div className="nav-links"><a href="#about">About</a><a href="#work">Work</a><a href="#research">Research</a><a href="#strength">Strength</a></div><a className="signal-link" href={`mailto:${profile.email}`}>Say hello <span aria-hidden="true">↗</span></a></nav>
      <AtlasNavigation />
      <a className="world-scroll" href="#about"><span>Continue to portfolio</span><ArrowDown size={16} aria-hidden="true" /></a>
    </section>

    <section className="content-section profile-section" id="about"><SectionHead number="01 / PROFILE" place="The Studio" title="From engineering systems to shaping enterprises." /><div className="profile-grid"><div className="profile-portrait"><img src={profileImage} alt="Piyush Bhandari"/><span className="portrait-tag">Product · AI · Technology</span></div><div className="profile-story"><p className="lead">{profile.longBio}</p><div className="credentials"><span><GraduationCap size={18}/> Wharton MBA</span><span><Sparkles size={18}/> GenAI leader</span><span><GitBranch size={18}/> Builder at heart</span></div></div></div>
      <div className="experience-list">{experience.map((item, index) => <article className="experience-row" key={item.years}><span className="experience-index">0{index+1}</span><span className="experience-years">{item.years}</span><div><p className="role">{item.role}</p><h3>{item.company}</h3><p>{item.detail}</p></div><div className="experience-stat"><strong>{item.stat}</strong><span>{item.statLabel}</span></div></article>)}</div>
      <div className="education-grid">{education.map((item) => <article key={item.school}><GraduationCap size={24}/><span>{item.years}</span><h3>{item.school}</h3><p>{item.degree}</p><small>{item.note}</small></article>)}</div>
    </section>

    <section className="content-section dark-section" id="work"><SectionHead dark number="02 / SELECTED BUILDS" place="The Workshop" title="Tools, systems, and experiments built to be used." /><div className="project-grid">{projects.filter((p) => p.featured).map((project, index) => <article className="project-card" key={project.id}><div className={`project-visual visual-${index % 4}`}><Satellite size={42}/><span>0{index+1}</span></div><div className="project-copy"><div className="card-meta"><span>{project.tags.split(',')[0]}</span><span>BUILD / {String(project.sortOrder).padStart(2,'0')}</span></div><h3>{project.title}</h3><p>{project.summary}</p><div className="tags">{project.tags.split(',').map((tag) => <span key={tag}>{tag.trim()}</span>)}</div>{project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer">View repository <ArrowUpRight size={16}/></a>}</div></article>)}</div><a className="section-link light" href={profile.githubUrl} target="_blank" rel="noreferrer"><GitBranch size={18}/> Explore all work on GitHub <ArrowUpRight size={16}/></a></section>

    <section className="content-section research-section" id="research"><SectionHead number="03 / RESEARCH" place="The Library" title="Earlier work in computer vision and machine learning." /><div className="publication-list">{publications.map((pub, index) => <a className="publication-row" href={pub.url} target="_blank" rel="noreferrer" key={pub.id}><span className="pub-index">0{index+1}</span><span className="pub-year">{pub.year}</span><div><span className="pub-venue">{pub.venue}</span><h3>{pub.title}</h3><p>{pub.authors}</p></div><ArrowUpRight size={20}/></a>)}</div><a className="section-link" href={profile.scholarUrl} target="_blank" rel="noreferrer"><BookOpen size={18}/> Google Scholar profile <ArrowUpRight size={16}/></a></section>

    <section className="content-section map-section" id="travel"><SectionHead number="04 / FIELD NOTES" place="The Airfield" title="A world map of places visited." /><WorldMap places={places}/></section>
    <section className="content-section dark-section" id="strength"><SectionHead dark number="05 / TRAINING LOG" place="The Gym" title="Progress, measured one session at a time." /><StrengthTracker entries={lifts}/></section>

    <section className="contact-section" id="contact"><div className="contact-orbit" aria-hidden="true"/><p className="eyebrow"><span/> The Postbox</p><h2>Have an ambitious problem?<br/><em>Let’s compare notes.</em></h2><p>I’m always interested in thoughtful conversations about enterprise AI, product strategy, technology systems, and what it takes to move from pilot to production.</p><div className="contact-links"><a href={`mailto:${profile.email}`}><Mail size={20}/><span><small>Email</small>{profile.email}</span><ArrowUpRight size={18}/></a>{profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"><ExternalLink size={20}/><span><small>LinkedIn</small>Connect professionally</span><ArrowUpRight size={18}/></a>}<a href={profile.githubUrl} target="_blank" rel="noreferrer"><GitBranch size={20}/><span><small>GitHub</small>@P-bhandari</span><ArrowUpRight size={18}/></a>{profile.phone && <a href={`tel:${profile.phone.replace(/\D/g,'')}`}><Phone size={20}/><span><small>Phone</small>{profile.phone}</span><ArrowUpRight size={18}/></a>}</div></section>
    <footer><a className="monogram" href="#top">PB</a><span>© {new Date().getFullYear()} Piyush Bhandari</span><a href="/dashboard">Owner dashboard</a></footer>
  </main>;
}
