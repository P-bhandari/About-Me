'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  Pill,
  Sparkles,
  Volume2,
  VolumeX,
  Wine,
} from 'lucide-react';
import type { Project, SiteData } from '@/lib/site-data';
import { playCinematicSound } from '@/lib/cinematic-sound';
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
    label: 'GitHub',
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

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function AtlasNavigation() {
  const reducedMotion = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [moving, setMoving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() =>
    typeof window === 'undefined'
      ? true
      : window.localStorage.getItem('atlas-sound') !== 'muted',
  );
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
    if (soundEnabled) playCinematicSound(cue);
  };

  function begin() {
    setStarted(true);
    sound('start');
  }
  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    window.localStorage.setItem('atlas-sound', next ? 'on' : 'muted');
    if (next) playCinematicSound('tick');
  }

  async function visit(destination: (typeof atlasDestinations)[number]) {
    if (moving) return;
    sound('tick');
    if (reducedMotion) {
      if ('external' in destination && destination.external)
        window.location.assign(destination.href);
      else document.querySelector(destination.href)?.scrollIntoView();
      return;
    }
    setMoving(true);
    setFocus(destination);
    const route = curvedTravel(currentPlayer.current, destination);
    setTrail(route.path);
    const footstep = soundEnabled
      ? window.setInterval(() => playCinematicSound('step'), 190)
      : null;
    await playerControls.start({
      left: route.x,
      top: route.y,
      transition: {
        duration: motionTiming.travel,
        times: [0, 0.5, 1],
        ease: cinematicEase,
      },
    });
    if (footstep) window.clearInterval(footstep);
    currentPlayer.current = { x: destination.x, y: destination.y };
    setTrail(null);
    setArrival({
      x: destination.x,
      y: destination.y,
      label: destination.label,
    });
    sound('arrive');
    await wait(260);
    setTransitioning(true);
    sound('whoosh');
    await wait(280);
    if ('external' in destination && destination.external) {
      window.location.assign(destination.href);
      return;
    }
    document
      .querySelector(destination.href)
      ?.scrollIntoView({ behavior: 'smooth' });
    await wait(500);
    setTransitioning(false);
    setArrival(null);
    setFocus(null);
    setMoving(false);
  }

  function trackPointer(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType === 'touch') return;
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
      <motion.div
        className="world-camera"
        animate={{
          x: focus?.cameraX ?? 0,
          y: focus?.cameraY ?? 0,
          scale: focus ? 1.025 : 1,
        }}
        transition={{ duration: 0.85, ease: cinematicEase }}
      >
        <motion.div className="world-parallax" style={{ x: artX, y: artY }}>
          <motion.img
            className="world-art"
            src="/pixel-world.png"
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
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(16px)' }}
            transition={{ duration: 0.72, ease: cinematicEase }}
          >
            <motion.p
              className="game-overline"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              An interactive portfolio
            </motion.p>
            <motion.h1
              id="hero-title"
              initial="hidden"
              animate="visible"
              variants={revealGroup}
            >
              <motion.span variants={revealItem}>Piyush</motion.span>
              <motion.em variants={revealItem}>Bhandari</motion.em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              About Me
            </motion.p>
            <motion.div
              className="play-cta"
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.7,
                type: 'spring',
                stiffness: 190,
                damping: 16,
              }}
            >
              <span className="click-here-sign" aria-hidden="true">
                Click here! <span>↘</span>
              </span>
              <button className="play-button" onClick={begin}>
                <span>Play</span>
                <Gamepad2 size={18} aria-hidden="true" />
              </button>
            </motion.div>
            <small>Or scroll to explore the accessible portfolio</small>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {started && (
          <motion.div
            className="world-interface"
            initial="hidden"
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
                    initial={{ pathLength: 0, opacity: 0 }}
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
              initial={{ left: '48.25%', top: '45%', opacity: 0, scale: 0.4 }}
              animate={playerControls}
              variants={revealItem}
              aria-hidden="true"
            >
              <Image src="/player-avatar.png" alt="" width={92} height={116} />
            </motion.div>
            <AnimatePresence>
              {arrival && (
                <motion.div
                  className="arrival-burst"
                  style={{ left: `${arrival.x}%`, top: `${arrival.y}%` }}
                  initial={{ opacity: 0, scale: 0.2 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.2, 1, 1.8] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  aria-hidden="true"
                >
                  <span>{arrival.label}</span>
                </motion.div>
              )}
            </AnimatePresence>
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
            <div className="touch-controls" aria-hidden="true">
              <span>↑</span>
              <span>←</span>
              <span>↓</span>
              <span>→</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="cinematic-wipe"
            initial={{ scaleY: 0 }}
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
      initial="hidden"
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

function AnimatedProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const reducedMotion = useReducedMotion();
  const baseX = useMotionValue(0);
  const baseY = useMotionValue(0);
  const rotateX = useSpring(baseX, { stiffness: 220, damping: 24 });
  const rotateY = useSpring(baseY, { stiffness: 220, damping: 24 });
  const destination = project.liveUrl || project.repoUrl;
  function tilt(event: PointerEvent<HTMLElement>) {
    if (reducedMotion || event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    baseY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 5);
    baseX.set(-((event.clientY - bounds.top) / bounds.height - 0.5) * 5);
  }
  return (
    <motion.article
      className="project-card"
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      initial={{
        opacity: 0,
        y: 56,
        clipPath: index % 2 ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)',
      }}
      whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.82, delay: index * 0.08, ease: cinematicEase }}
      onPointerMove={tilt}
      onPointerLeave={() => {
        baseX.set(0);
        baseY.set(0);
      }}
    >
      <div className={`project-visual visual-${index % 4}`}>
        <span className="project-glyph">
          <ProjectGlyph title={project.title} />
        </span>
        <span>0{index + 1}</span>
      </div>
      <div className="project-copy">
        <div className="card-meta">
          <span>{project.tags.split(',')[0]}</span>
          <span>BUILD / {String(project.sortOrder).padStart(2, '0')}</span>
        </div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="tags">
          {project.tags.split(',').map((tag) => (
            <span key={tag}>{tag.trim()}</span>
          ))}
        </div>
        {destination && (
          <a href={destination} target="_blank" rel="noreferrer">
            {project.liveUrl ? 'Open live app' : 'View on GitHub'}{' '}
            <ArrowUpRight size={16} />
          </a>
        )}
      </div>
    </motion.article>
  );
}

export function PortfolioExperience({ data }: { data: SiteData }) {
  const { profile, projects, publications } = data;
  const [activeSection, setActiveSection] = useState('top');
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });
  const aboutCopy = profile.longBio
    .replace(', cloud resilience roadmaps', '')
    .replace(', and cost transformations', '')
    .replace('Before consulting', '\n\nPrior to consulting');
  useEffect(() => {
    const sections = ['top', 'about', 'work', 'research', 'contact']
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-25% 0px -55%', threshold: [0, 0.2, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    const visibility = () =>
      document.documentElement.classList.toggle(
        'motion-paused',
        document.hidden,
      );
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect();
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
      <a className="skip-link" href="#about">
        Skip to profile
      </a>
      <section className="atlas-hero" id="top" aria-labelledby="hero-title">
        <nav className="topbar" aria-label="Primary navigation">
          <a className="monogram" href="#top" aria-label="Piyush Bhandari home">
            PB
          </a>
          <div className="nav-links">
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
              className={activeSection === 'work' ? 'active' : ''}
              href="#work"
            >
              GitHub
            </a>
            <a
              className={activeSection === 'research' ? 'active' : ''}
              href="#research"
            >
              Publications
            </a>
          </div>
        </nav>
        <AtlasNavigation />
        <a className="world-scroll" href="#about">
          <span>Continue to portfolio</span>
          <ArrowDown size={16} aria-hidden="true" />
        </a>
      </section>
      <section className="content-section profile-section" id="about">
        <SectionHead number="01 / ABOUT ME" title="About Me" />
        <motion.div
          className="profile-story profile-story-wide"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={revealGroup}
        >
          {aboutCopy.split(/\n\s*\n/).map((paragraph, index) => (
            <motion.p className="lead" key={paragraph} variants={revealItem}>
              {index === 0 &&
                'I help businesses get the most value from the technologies they buy. '}
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
              initial="hidden"
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
          initial="hidden"
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
      <section className="content-section dark-section" id="work">
        <SectionHead
          dark
          number="02 / GITHUB"
          place="The Workshop"
          title="Portfolio of Apps"
        />
        <div className="project-grid">
          {projects
            .filter((project) => project.featured)
            .map((project, index) => (
              <AnimatedProjectCard
                project={project}
                index={index}
                key={project.id}
              />
            ))}
        </div>
        <motion.a
          className="section-link light"
          href={profile.githubUrl}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <GitBranch size={18} /> Explore all work on GitHub{' '}
          <ArrowUpRight size={16} />
        </motion.a>
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
            initial={{ opacity: 0 }}
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
              initial="hidden"
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
        initial="hidden"
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
        <Link href="/dashboard">Owner dashboard</Link>
      </footer>
    </main>
  );
}
