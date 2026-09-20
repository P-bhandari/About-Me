'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  Aperture,
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  ExternalLink,
  Gamepad2,
  GitBranch,
  GraduationCap,
  Mail,
  Menu,
  Pill,
  Sparkles,
  Volume2,
  VolumeX,
  Wine,
} from 'lucide-react';
import type { Project, PublicSiteData } from '@/lib/site-data';
import { playCinematicSound } from '@/lib/cinematic-sound';
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  cinematicEase,
  curvedTravel,
  motionTiming,
  revealGroup,
  revealItem,
  slideReveal,
} from '@/lib/motion-system';

const experience = [
  {
    years: '2023—NOW',
    company: 'Boston Consulting Group',
    role: 'Project Leader',
    detail:
      'Leading enterprise AI adoption, technology transformation, cloud resilience, operating-model design, and productivity programs.',
  },
  {
    years: '2017—2021',
    company: 'Samsung',
    role: 'Product Manager & Lead Software Engineer',
    detail:
      'Worked across Samsung TV and cloud platforms—building personalized discovery experiences, leading cross-functional product delivery, and engineering services used across global markets.',
  },
];

const education = [
  {
    school: 'The Wharton School',
    degree: 'MBA · Business Analytics',
    years: '2021—2023',
    note: 'Joseph Wharton Fellow · GMAT 760',
  },
  {
    school: 'Indian Institute of Technology, Patna',
    degree: 'B.Tech · Electrical Engineering',
    years: '2013—2017',
    note: 'Top 5% · Highest Honors',
  },
];

const atlasDestinations = [
  {
    href: '#about',
    label: 'About Me',
    detail: 'My story & experience',
    icon: BriefcaseBusiness,
    x: 24,
    y: 25,
    cameraX: 10,
    cameraY: 6,
  },
  {
    href: 'https://www.linkedin.com/in/piyush-bhandari95/',
    label: 'LinkedIn',
    detail: 'Professional profile',
    icon: ExternalLink,
    x: 13,
    y: 54,
    cameraX: 13,
    cameraY: -2,
    external: true,
  },
  {
    href: '#work',
    label: 'Apps',
    detail: 'Apps & experiments',
    icon: GitBranch,
    x: 51,
    y: 20,
    cameraX: 0,
    cameraY: 8,
  },
  {
    href: '#research',
    label: 'Publications',
    detail: 'Papers & research',
    icon: BookOpen,
    x: 73,
    y: 28,
    cameraX: -10,
    cameraY: 5,
  },
  {
    href: '#contact',
    label: 'Contact Me',
    detail: 'Reach out',
    icon: Mail,
    x: 72,
    y: 59,
    cameraX: -9,
    cameraY: -4,
  },
] as const;

const particles = Array.from({ length: 18 }, (_, index) => ({
  left: `${5 + ((index * 29) % 90)}%`,
  top: `${12 + ((index * 37) % 72)}%`,
  delay: `${(index % 7) * 0.35}s`,
  duration: `${4.2 + (index % 5) * 0.65}s`,
}));


function AtlasNavigation({ tagline }: { tagline: string }) {
  const reducedMotion = useReducedMotion();
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 759px)');
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const [started, setStarted] = useState(false);
  const [moving, setMoving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  useEffect(() => {
    try { setSoundEnabled(window.localStorage.getItem('atlas-sound') === 'on'); } catch { /* Storage is optional. */ }
  }, []);
  const [trail, setTrail] = useState<string | null>(null);
  const [arrival, setArrival] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);
  const [focus, setFocus] = useState<(typeof atlasDestinations)[number] | null>(
    null,
  );
  const [transitioning, setTransitioning] = useState(false);
  const currentPlayer = useRef({ x: 48.25, y: 45 });
  const playerControls = useAnimationControls();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, {
    stiffness: 70,
    damping: 22,
    mass: 0.7,
  });
  const smoothY = useSpring(pointerY, {
    stiffness: 70,
    damping: 22,
    mass: 0.7,
  });
  const artX = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const artY = useTransform(smoothY, [-0.5, 0.5], [-7, 7]);

  useEffect(() => {
    if (started)
      void playerControls.start({
        left: '48.25%',
        top: '45%',
        opacity: 1,
        scale: 1,
        transition: {
          delay: 0.36,
          type: 'spring',
          stiffness: 170,
          damping: 18,
        },
      });
  }, [playerControls, started]);
  const sound = (cue: Parameters<typeof playCinematicSound>[0]) => {
    try { if (soundEnabled) playCinematicSound(cue); } catch { /* Sound is optional. */ }
  };

  function begin() {
    setStarted(true);
    sound('start');
  }
  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try { window.localStorage.setItem('atlas-sound', next ? 'on' : 'muted'); } catch { /* Storage is optional. */ }
    if (next) playCinematicSound('tick');
  }

  async function visit(destination: (typeof atlasDestinations)[number]) {
    if (moving) return;
    const navigate = () => {
      if ('external' in destination && destination.external) {
        window.location.assign(destination.href);
      } else {
        document.querySelector(destination.href)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
        window.history.replaceState(null, '', destination.href);
      }
    };
    if (reducedMotion) { navigate(); return; }
    setMoving(true);
    setFocus(destination);
    const route = curvedTravel(currentPlayer.current, destination);
    const travelDuration = compact ? 0.6 : motionTiming.travel;
    setTrail(route.path);
    let footstep: number | null = null;
    let timeout: number | undefined;
    try {
      sound('tick');
      if (soundEnabled) footstep = window.setInterval(() => playCinematicSound('step'), 190);
      await Promise.race([
        playerControls.start({ left: route.x, top: route.y, transition: { duration: travelDuration, times: [0, 0.5, 1], ease: cinematicEase } }),
        new Promise<void>(resolve => { timeout = window.setTimeout(resolve, (travelDuration + 0.6) * 1000); }),
      ]);
      currentPlayer.current = { x: destination.x, y: destination.y };
    } catch { /* Navigation must work even when animation fails. */ }
    finally {
      if (footstep !== null) window.clearInterval(footstep);
      window.clearTimeout(timeout);
      playerControls.stop();
      setTrail(null); setArrival(null); setFocus(null); setMoving(false); setTransitioning(false);
      navigate();
    }
  }

  function trackPointer(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || compact || event.pointerType === 'touch' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  return (
    <div
      className={started ? 'game-world is-playing' : 'game-world'}
      id="atlas"
      aria-label="Explore Piyush's personal world"
      onPointerMove={trackPointer}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      {started && <h1 className="sr-only" id="hero-title">Piyush Bhandari — {tagline}</h1>}
      <motion.div
        className="world-camera"
        animate={{
          x: compact ? 0 : focus?.cameraX ?? 0,
          y: compact ? 0 : focus?.cameraY ?? 0,
          scale: focus && !compact ? 1.025 : 1,
        }}
        transition={{ duration: 0.85, ease: cinematicEase }}
      >
        <motion.div className="world-parallax" style={{ x: artX, y: artY }}>
          <motion.img
            className="world-art"
            src="/pixel-world-1672.webp"
            srcSet="/pixel-world-840.webp 840w, /pixel-world-1280.webp 1280w, /pixel-world-1672.webp 1672w"
            sizes="(max-width: 759px) 100vw, 100vw"
            width={1672}
            height={941}
            fetchPriority="high"
            loading="eager"
            alt="An illustrated island containing a studio, technology workshop, library, airfield, outdoor gym, and postbox"
            animate={
              started
                ? { scale: 1.01, filter: 'brightness(1) saturate(1)' }
                : {
                    scale: 1.08,
                    filter: 'brightness(.53) saturate(.72) blur(1px)',
                  }
            }
            transition={{ duration: motionTiming.opening, ease: cinematicEase }}
          />
        </motion.div>
      </motion.div>
      <div className="world-vignette" aria-hidden="true" />
      <div className="world-light-sweep" aria-hidden="true" />
      <div className="world-particles" aria-hidden="true">
        {particles.map((particle, index) => (
          <i
            key={index}
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>
      <AnimatePresence>
        {!started && (
          <motion.div
            className="start-screen"
            initial={false}
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(16px)' }}
            transition={{ duration: 0.72, ease: cinematicEase }}
          >
            <motion.p
              className="game-overline"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              An interactive portfolio
            </motion.p>
            <motion.h1
              id="hero-title"
              initial={false}
              animate="visible"
              variants={revealGroup}
            >
              <motion.span variants={revealItem}>Piyush</motion.span>
              <motion.em variants={revealItem}>Bhandari</motion.em>
            </motion.h1>
            <motion.p
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              {tagline}
            </motion.p>
            <motion.div
              className="play-cta"
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.7,
                type: 'spring',
                stiffness: 190,
                damping: 16,
              }}
            >
              <button className="play-button" onClick={begin}>
                <span>Explore my world</span>
                <Gamepad2 size={18} aria-hidden="true" />
              </button>
              <a className="apps-cta" href="#work">View apps <ArrowDown size={18} aria-hidden="true" /></a>
            </motion.div>
            <small>Product leadership. Engineering roots. Things I build.</small>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {started && (
          <motion.div
            className="world-interface"
            initial={false}
            animate="visible"
            variants={revealGroup}
          >
            <motion.div className="game-hud" variants={revealItem}>
              <span className="hud-avatar">PB</span>
              <span>
                <small>Explorer</small>
                <strong>Piyush’s World</strong>
              </span>
              <button
                className="sound-toggle"
                type="button"
                onClick={toggleSound}
                aria-label={
                  soundEnabled ? 'Mute world sounds' : 'Turn on world sounds'
                }
                aria-pressed={soundEnabled}
              >
                {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
              </button>
            </motion.div>
            <motion.div className="game-status" variants={revealItem}>
              <span className="status-dot" />{' '}
              {moving ? 'Travelling…' : 'Choose a destination'}
            </motion.div>
            <div className="world-stage">
            <svg
              className="travel-trail"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <AnimatePresence>
                {trail && (
                  <motion.path
                    key={trail}
                    d={trail}
                    initial={false}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: motionTiming.travel,
                      ease: cinematicEase,
                    }}
                  />
                )}
              </AnimatePresence>
            </svg>
            <motion.div
              className={moving ? 'player-marker is-moving' : 'player-marker'}
              initial={false}
              animate={playerControls}
              aria-hidden="true"
              style={{ left: '48.25%', top: '45%' }}
            >
              <img src="/player-avatar-184.webp" srcSet="/player-avatar-92.webp 92w, /player-avatar-184.webp 184w, /player-avatar-276.webp 276w" sizes="(max-width: 759px) 80px, 92px" alt="" width={92} height={92} />
            </motion.div>
            <AnimatePresence>
              {arrival && (
                <motion.div
                  className="arrival-burst"
                  style={{ left: `${arrival.x}%`, top: `${arrival.y}%` }}
                  initial={false}
                  animate={{ opacity: [0, 1, 0], scale: [0.2, 1, 1.8] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  aria-hidden="true"
                >
                  <span>{arrival.label}</span>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
            <div className="destination-menu" aria-label="World destinations">
              {atlasDestinations.map((destination, index) => {
                const { href, label, detail, icon: Icon } = destination;
                return (
                  <motion.button
                    key={href}
                    className={`destination destination-${index + 1} ${focus?.href === href ? 'is-active' : ''}`}
                    onClick={() => visit(destination)}
                    disabled={moving}
                    aria-label={`${label}: ${detail}`}
                    variants={revealItem}
                    whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                  >
                    <span className="destination-pulse" aria-hidden="true" />
                    <span className="destination-icon">
                      <Icon size={17} strokeWidth={2} aria-hidden="true" />
                    </span>
                    <span className="destination-label">
                      <strong>{label}</strong>
                      <small>{detail}</small>
                    </span>
                  </motion.button>
                );
              })}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="cinematic-wipe"
            initial={false}
            animate={{ scaleY: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.85,
              times: [0, 0.48, 1],
              ease: cinematicEase,
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionHead({
  number,
  place,
  title,
  dark = false,
}: {
  number: string;
  place?: string;
  title: string;
  dark?: boolean;
}) {
  return (
    <motion.div
      className="section-heading"
      initial={false}
      whileInView="visible"
      viewport={{ once: true, amount: 0.45 }}
      variants={revealGroup}
    >
      <motion.div className="section-number" variants={slideReveal}>
        {number}
      </motion.div>
      <motion.div className="heading-mask" variants={revealItem}>
        {place && (
          <p className={`eyebrow ${dark ? '' : 'dark'}`}>
            <span /> {place}
          </p>
        )}
        <h2>{title}</h2>
      </motion.div>
    </motion.div>
  );
}

function ProjectGlyph({ title }: { title: string }) {
  if (title === 'Nutrition Scanner')
    return <Pill size={64} strokeWidth={1.5} />;
  if (title === 'Date Night')
    return (
      <span className="project-toast">
        <Wine size={54} strokeWidth={1.5} />
        <Wine size={54} strokeWidth={1.5} />
      </span>
    );
  return <Aperture size={68} strokeWidth={1.4} />;
}

function ProjectPreview({ project }: { project: Project }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = project.imageKey
    ? (project.imageKey.startsWith('/projects/') ? project.imageKey : `/api/files/${project.imageKey.split('/').map(encodeURIComponent).join('/')}`)
    : null;
  return <div className={`project-preview ${source && failedSource !== source ? 'has-preview' : ''}`}>
    {source && failedSource !== source
      ? <img src={source} alt={`${project.title} app preview`} width={1440} height={900} loading="lazy" onError={() => setFailedSource(source)} />
      : <div className="project-preview-fallback"><ProjectGlyph title={project.title} /><span>{project.title}</span></div>}
  </div>;
}

function ProjectCard({ project }: { project: Project }) {
  return <article className="project-card">
    <ProjectPreview project={project} />
    <div className="project-copy">
      <div className="card-meta"><span>{project.archived ? 'Archived project' : 'Featured build'}</span></div>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <div className="tags">{project.tags.split(',').filter(Boolean).map(tag => <span key={tag}>{tag.trim()}</span>)}</div>
      <div className="project-actions">
        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">Open live app <ArrowUpRight size={16} aria-hidden="true" /></a>}
        {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer">View source <GitBranch size={16} aria-hidden="true" /></a>}
      </div>
    </div>
  </article>;
}

export function PortfolioExperience({ data }: { data: PublicSiteData }) {
  const { profile, projects, publications } = data;
  const [activeSection, setActiveSection] = useState('top');
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });
  const aboutCopy = profile.longBio;
  const publishedProjects = projects.filter(project => project.published).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const update = () => document.documentElement.style.setProperty('--portfolio-header-offset', `${header.getBoundingClientRect().height + 16}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    const query = window.matchMedia('(min-width: 760px)');
    const closeOnDesktop = () => { if (query.matches) setMenuOpen(false); };
    query.addEventListener('change', closeOnDesktop);
    return () => { observer.disconnect(); query.removeEventListener('change', closeOnDesktop); document.documentElement.style.removeProperty('--portfolio-header-offset'); };
  }, []);
  useEffect(() => {
    const sections = ['top', 'work', 'about', 'research', 'contact']
      .map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const updateSection = () => {
      const position = window.scrollY + (document.querySelector('.topbar')?.getBoundingClientRect().height ?? 136) + 24;
      setActiveSection([...sections].reverse().find(section => section.offsetTop <= position)?.id ?? 'top');
    };
    updateSection();
    window.addEventListener('scroll', updateSection, { passive: true });
    window.addEventListener('resize', updateSection);
    const visibility = () =>
      document.documentElement.classList.toggle(
        'motion-paused',
        document.hidden,
      );
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('scroll', updateSection);
      window.removeEventListener('resize', updateSection);
      document.removeEventListener('visibilitychange', visibility);
      document.documentElement.classList.remove('motion-paused');
    };
  }, []);

  return (
    <main>
      <motion.div
        className="scroll-progress"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />
      <a className="skip-link" href="#work">
        Skip to apps
      </a>
      <section className="atlas-hero" id="top" aria-labelledby="hero-title">
        <nav ref={headerRef} className="topbar" aria-label="Primary navigation">
          <a className="monogram" href="#top" aria-label="Piyush Bhandari home">
            PB
          </a>
          <div className="nav-links">
            <a
              className={activeSection === 'work' ? 'active' : ''}
              href="#work"
            >
              Apps
            </a>
            <a
              className={activeSection === 'about' ? 'active' : ''}
              href="#about"
            >
              About Me
            </a>
            {profile.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            )}
            <a
              className={activeSection === 'research' ? 'active' : ''}
              href="#research"
            >
              Publications
            </a>
            <a href="#contact" className={activeSection === 'contact' ? 'active' : ''}>Contact</a>
          </div>
          <div className="mobile-navigation">
            <a className={activeSection === 'work' ? 'active' : ''} href="#work">Apps</a>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger className="mobile-menu-trigger"><Menu size={20} aria-hidden="true" /> Menu</SheetTrigger>
              <SheetContent className="mobile-menu-panel" side="right">
                <SheetTitle className="mobile-menu-title">Explore</SheetTitle>
                <SheetDescription className="sr-only">Choose a section of Piyush’s portfolio.</SheetDescription>
                <nav aria-label="Mobile navigation" className="mobile-menu-links">
                  {[
                    { href: '#work', label: 'Apps' },
                    { href: '#about', label: 'About Me' },
                    ...(profile.linkedinUrl ? [{ href: profile.linkedinUrl, label: 'LinkedIn' }] : []),
                    { href: '#research', label: 'Publications' },
                    { href: '#contact', label: 'Contact' },
                  ].map(link => <a key={link.href} href={link.href} aria-current={link.href === `#${activeSection}` ? 'location' : undefined} onClick={() => setMenuOpen(false)} {...(link.href.startsWith('https:') ? { target: '_blank', rel: 'noreferrer' } : {})}>{link.label}<ArrowUpRight size={20} aria-hidden="true" /></a>)}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
        <AtlasNavigation tagline={profile.tagline} />
        <a className="world-scroll" href="#work">
          <span>Explore the apps</span>
          <ArrowDown size={16} aria-hidden="true" />
        </a>
      </section>
      <section className="content-section dark-section" id="work">
        <SectionHead
          dark
          number="01 / APPS"
          place="The Workshop"
          title="Portfolio of Apps"
        />
        <p className="work-intro">Tools I build, ideas I test, and the code behind them.</p>
        <div className="project-grid">
          {publishedProjects.filter(project => project.featured).map(project => <ProjectCard project={project} key={project.id} />)}
        </div>
        {publishedProjects.some(project => !project.featured) && <div className="repository-section">
          <h3>More code & experiments</h3>
          <div className="repository-list">
            {publishedProjects.filter(project => !project.featured).map(project => <article className="repository-row" key={project.id}>
              <div><h4>{project.title} {project.archived && <span className="archive-badge">Archived</span>}</h4><p>{project.summary}</p><span className="repository-tags">{project.tags}</span></div>
              {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" aria-label={`View ${project.title} source on GitHub`}><GitBranch size={18} aria-hidden="true" /><span>Source</span><ArrowUpRight size={16} aria-hidden="true" /></a>}
            </article>)}
          </div>
        </div>}
        {publishedProjects.length === 0 && <p className="empty-projects">New projects are on the way. Explore my GitHub below.</p>}
        <motion.a
          className="section-link light"
          href={profile.githubUrl}
          target="_blank"
          rel="noreferrer"
          initial={false}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <GitBranch size={18} /> Explore all work on GitHub{' '}
          <ArrowUpRight size={16} />
        </motion.a>
      </section>
      <section className="content-section profile-section" id="about">
        <SectionHead number="02 / ABOUT ME" title="About Me" />
        <motion.div
          className="profile-story profile-story-wide"
          initial={false}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={revealGroup}
        >
          {aboutCopy.split(/\n\s*\n/).map((paragraph, index) => (
            <motion.p className="lead" key={paragraph} variants={revealItem}>
              {paragraph}
            </motion.p>
          ))}
          <motion.div className="credentials" variants={revealGroup}>
            {[
              <>
                <GraduationCap size={18} /> Wharton MBA
              </>,
              <>
                <Sparkles size={18} /> GenAI leader
              </>,
              <>
                <GitBranch size={18} /> Builder at heart
              </>,
            ].map((item, index) => (
              <motion.span key={index} variants={revealItem}>
                {item}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
        <div className="experience-list">
          {experience.map((item, index) => (
            <motion.article
              className="experience-row"
              key={item.years}
              initial={false}
              whileInView="visible"
              viewport={{ once: true, amount: 0.45 }}
              custom={index}
              variants={slideReveal}
            >
              <span className="experience-index">0{index + 1}</span>
              <span className="experience-years">{item.years}</span>
              <div>
                <p className="role">{item.role}</p>
                <h3>{item.company}</h3>
                <p>{item.detail}</p>
              </div>
            </motion.article>
          ))}
        </div>
        <motion.div
          className="education-grid"
          initial={false}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={revealGroup}
        >
          {education.map((item) => (
            <motion.article
              key={item.school}
              variants={revealItem}
              whileHover={{ y: -6 }}
            >
              <GraduationCap size={24} />
              <span>{item.years}</span>
              <h3>{item.school}</h3>
              <p>{item.degree}</p>
              <small>{item.note}</small>
            </motion.article>
          ))}
        </motion.div>
      </section>
      <section className="content-section research-section" id="research">
        <div className="publication-heading">
          <SectionHead
            number="03 / PUBLICATIONS"
            place="The Library"
            title="Publications"
          />
          <motion.a
            className="scholar-title-link"
            href={profile.scholarUrl}
            target="_blank"
            rel="noreferrer"
            initial={false}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <BookOpen size={18} /> View on Google Scholar{' '}
            <ArrowUpRight size={16} />
          </motion.a>
        </div>
        <div className="publication-list">
          {publications.map((pub, index) => (
            <motion.a
              className="publication-row"
              href={pub.url}
              target="_blank"
              rel="noreferrer"
              key={pub.id}
              initial={false}
              whileInView="visible"
              viewport={{ once: true, amount: 0.55 }}
              variants={slideReveal}
              custom={index}
            >
              <span className="pub-index">0{index + 1}</span>
              <span className="pub-year">{pub.year}</span>
              <div>
                <span className="pub-venue">{pub.venue}</span>
                <h3>{pub.title}</h3>
                <p>{pub.authors}</p>
              </div>
              <ArrowUpRight size={20} />
            </motion.a>
          ))}
        </div>
      </section>
      <motion.section
        className="contact-section"
        id="contact"
        initial={false}
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={revealGroup}
      >
        <div className="contact-orbit" aria-hidden="true" />
        <motion.p className="eyebrow" variants={revealItem}>
          <span /> The Postbox
        </motion.p>
        <motion.h2 variants={revealItem}>
          Reach out
          <br />
          <em>and say hello.</em>
        </motion.h2>
        <motion.p variants={revealItem}>
          The easiest way to reach me is by email. You can also find my
          professional work and updates on LinkedIn and GitHub.
        </motion.p>
        <motion.div className="contact-links" variants={revealGroup}>
          <motion.a variants={revealItem} href={`mailto:${profile.email}`}>
            <Mail size={20} />
            <span>
              <small>Email</small>
              {profile.email}
            </span>
            <ArrowUpRight size={18} />
          </motion.a>
          {profile.linkedinUrl && (
            <motion.a
              variants={revealItem}
              href={profile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={20} />
              <span>
                <small>LinkedIn</small>Connect professionally
              </span>
              <ArrowUpRight size={18} />
            </motion.a>
          )}
          <motion.a
            variants={revealItem}
            href={profile.githubUrl}
            target="_blank"
            rel="noreferrer"
          >
            <GitBranch size={20} />
            <span>
              <small>GitHub</small>@P-bhandari
            </span>
            <ArrowUpRight size={18} />
          </motion.a>
        </motion.div>
      </motion.section>
      <footer>
        <a className="monogram" href="#top">
          PB
        </a>
        <span>© {new Date().getFullYear()} Piyush Bhandari</span>
        <a href="/dashboard">Owner dashboard</a>
      </footer>
    </main>
  );
}
