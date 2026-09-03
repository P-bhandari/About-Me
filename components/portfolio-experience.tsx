'use client';

import { useState } from 'react';
import {
  ArrowDown, ArrowUpRight, BookOpen, BriefcaseBusiness,
  ExternalLink, GitBranch, GraduationCap, Mail,
  Sparkles, Gamepad2, Volume2, Aperture, Pill, Wine,
} from 'lucide-react';
import type { SiteData } from '@/lib/site-data';

const experience = [
  { years: '2023—NOW', company: 'Boston Consulting Group', role: 'Project Leader', detail: 'Leading enterprise AI adoption, technology transformation, cloud resilience, operating-model design, and productivity programs.' },
  { years: '2017—2021', company: 'Samsung', role: 'Product Manager & Lead Software Engineer', detail: 'Worked across Samsung TV and cloud platforms—building personalized discovery experiences, leading cross-functional product delivery, and engineering services used across global markets.' },
];

const education = [
  { school: 'The Wharton School', degree: 'MBA · Business Analytics', years: '2021—2023', note: 'Joseph Wharton Fellow · GMAT 760' },
  { school: 'Indian Institute of Technology, Patna', degree: 'B.Tech · Electrical Engineering', years: '2013—2017', note: 'Top 5% · Highest Honors' },
];

const atlasDestinations = [
  { href: '#about', label: 'About Me', detail: 'My story & experience', icon: BriefcaseBusiness, x: 24, y: 25 },
  { href: 'https://www.linkedin.com/in/piyush-bhandari95/', label: 'LinkedIn', detail: 'Professional profile', icon: ExternalLink, x: 13, y: 54, external: true },
  { href: '#work', label: 'GitHub', detail: 'Apps & experiments', icon: GitBranch, x: 51, y: 20 },
  { href: '#research', label: 'Publications', detail: 'Papers & research', icon: BookOpen, x: 73, y: 28 },
  { href: '#contact', label: 'Contact Me', detail: 'Reach out', icon: Mail, x: 72, y: 59 },
];

function AtlasNavigation() {
  const [started, setStarted] = useState(false);
  const [player, setPlayer] = useState({ x: 48.25, y: 45 });
  const [moving, setMoving] = useState(false);

  function visit(destination: (typeof atlasDestinations)[number]) {
    if (moving) return;
    setMoving(true);
    setPlayer({ x: destination.x, y: destination.y });
    window.setTimeout(() => {
      if (destination.external) window.location.href = destination.href;
      else {
        document.querySelector(destination.href)?.scrollIntoView({ behavior: 'smooth' });
        setMoving(false);
      }
    }, 850);
  }
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
        <div className={moving ? 'player-marker is-moving' : 'player-marker'} style={{ left: `${player.x}%`, top: `${player.y}%` }} aria-hidden="true"><img src="/player-avatar.png" alt="" /></div>
        <div className="destination-menu" aria-label="World destinations">
          {atlasDestinations.map((destination, index) => {
            const { href, label, detail, icon: Icon } = destination;
            return (
              <button key={href} className={`destination destination-${index + 1}`} onClick={() => visit(destination)} disabled={moving} aria-label={`${label}: ${detail}`}>
                <span className="destination-pulse" aria-hidden="true" />
                <span className="destination-icon"><Icon size={17} strokeWidth={2} aria-hidden="true" /></span>
                <span className="destination-label"><strong>{label}</strong><small>{detail}</small></span>
              </button>
            );
          })}
        </div>
        <div className="touch-controls" aria-hidden="true"><span>↑</span><span>←</span><span>↓</span><span>→</span></div>
      </>}
    </div>
  );
}

function SectionHead({ number, place, title, dark = false }: { number: string; place: string; title: string; dark?: boolean }) {
  return <div className="section-heading"><div className="section-number">{number}</div><div><p className={`eyebrow ${dark ? '' : 'dark'}`}><span /> {place}</p><h2>{title}</h2></div></div>;
}

function ProjectGlyph({ title }: { title: string }) {
  if (title === 'Nutrition Scanner') return <Pill size={64} strokeWidth={1.5} />;
  if (title === 'Date Night') return <span className="project-toast"><Wine size={54} strokeWidth={1.5} /><Wine size={54} strokeWidth={1.5} /></span>;
  return <Aperture size={68} strokeWidth={1.4} />;
}

export function PortfolioExperience({ data }: { data: SiteData }) {
  const { profile, projects, publications } = data;
  return <main>
    <a className="skip-link" href="#about">Skip to profile</a>
    <section className="atlas-hero" id="top" aria-labelledby="hero-title">
      <nav className="topbar" aria-label="Primary navigation"><a className="monogram" href="#top" aria-label="Piyush Bhandari home">PB</a><div className="nav-links"><a href="#about">About Me</a>{profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}<a href="#work">GitHub</a><a href="#research">Publications</a></div><a className="signal-link" href={`mailto:${profile.email}`}>Contact me <span aria-hidden="true">↗</span></a></nav>
      <AtlasNavigation />
      <a className="world-scroll" href="#about"><span>Continue to portfolio</span><ArrowDown size={16} aria-hidden="true" /></a>
    </section>

    <section className="content-section profile-section" id="about"><SectionHead number="01 / ABOUT ME" place="The Studio" title="Helping businesses get the most value from the technology they buy." /><div className="profile-story profile-story-wide"><p className="lead">I help enterprises turn technology investments into practical business value. {profile.longBio}</p><div className="credentials"><span><GraduationCap size={18}/> Wharton MBA</span><span><Sparkles size={18}/> GenAI leader</span><span><GitBranch size={18}/> Builder at heart</span></div></div>
      <div className="experience-list">{experience.map((item, index) => <article className="experience-row" key={item.years}><span className="experience-index">0{index+1}</span><span className="experience-years">{item.years}</span><div><p className="role">{item.role}</p><h3>{item.company}</h3><p>{item.detail}</p></div></article>)}</div>
      <div className="education-grid">{education.map((item) => <article key={item.school}><GraduationCap size={24}/><span>{item.years}</span><h3>{item.school}</h3><p>{item.degree}</p><small>{item.note}</small></article>)}</div>
    </section>

    <section className="content-section dark-section" id="work"><SectionHead dark number="02 / GITHUB" place="The Workshop" title="My Apps and Experiments" /><div className="project-grid">{projects.filter((p) => p.featured).map((project, index) => { const destination = project.liveUrl || project.repoUrl; return <article className="project-card" key={project.id}><div className={`project-visual visual-${index % 4}`}><span className="project-glyph"><ProjectGlyph title={project.title} /></span><span>0{index+1}</span></div><div className="project-copy"><div className="card-meta"><span>{project.tags.split(',')[0]}</span><span>BUILD / {String(project.sortOrder).padStart(2,'0')}</span></div><h3>{project.title}</h3><p>{project.summary}</p><div className="tags">{project.tags.split(',').map((tag) => <span key={tag}>{tag.trim()}</span>)}</div>{destination && <a href={destination} target="_blank" rel="noreferrer">{project.liveUrl ? 'Open live app' : 'View on GitHub'} <ArrowUpRight size={16}/></a>}</div></article>; })}</div><a className="section-link light" href={profile.githubUrl} target="_blank" rel="noreferrer"><GitBranch size={18}/> Explore all work on GitHub <ArrowUpRight size={16}/></a></section>

    <section className="content-section research-section" id="research"><div className="publication-heading"><SectionHead number="03 / PUBLICATIONS" place="The Library" title="Publications" /><a className="scholar-title-link" href={profile.scholarUrl} target="_blank" rel="noreferrer"><BookOpen size={18}/> View on Google Scholar <ArrowUpRight size={16}/></a></div><div className="publication-list">{publications.map((pub, index) => <a className="publication-row" href={pub.url} target="_blank" rel="noreferrer" key={pub.id}><span className="pub-index">0{index+1}</span><span className="pub-year">{pub.year}</span><div><span className="pub-venue">{pub.venue}</span><h3>{pub.title}</h3><p>{pub.authors}</p></div><ArrowUpRight size={20}/></a>)}</div></section>

    <section className="contact-section" id="contact"><div className="contact-orbit" aria-hidden="true"/><p className="eyebrow"><span/> The Postbox</p><h2>Reach out<br/><em>and say hello.</em></h2><p>The easiest way to reach me is by email. You can also find my professional work and updates on LinkedIn and GitHub.</p><div className="contact-links"><a href={`mailto:${profile.email}`}><Mail size={20}/><span><small>Email</small>{profile.email}</span><ArrowUpRight size={18}/></a>{profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"><ExternalLink size={20}/><span><small>LinkedIn</small>Connect professionally</span><ArrowUpRight size={18}/></a>}<a href={profile.githubUrl} target="_blank" rel="noreferrer"><GitBranch size={20}/><span><small>GitHub</small>@P-bhandari</span><ArrowUpRight size={18}/></a></div></section>
    <footer><a className="monogram" href="#top">PB</a><span>© {new Date().getFullYear()} Piyush Bhandari</span><a href="/dashboard">Owner dashboard</a></footer>
  </main>;
}
