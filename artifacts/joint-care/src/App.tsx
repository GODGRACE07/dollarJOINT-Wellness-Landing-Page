import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Dna,
  Flower2,
  FlaskConical,
  Leaf,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  CTA_COPY,
  FOOTER_COPY,
  HERO_COPY,
  NAV_ITEMS,
  PILLARS,
  PRINCIPLES,
  SITE_COPY,
  TELEGRAM_URL,
  TIMELINE,
  X_URL,
} from "./config";

const mascot = `${import.meta.env.BASE_URL}assets/joint-mascot.jpg`;
const mascotSmall = `${import.meta.env.BASE_URL}assets/joint-mascot-480.webp`;
const mascotSrcSet = [
  `${import.meta.env.BASE_URL}assets/joint-mascot-480.webp 480w`,
  `${import.meta.env.BASE_URL}assets/joint-mascot-800.webp 800w`,
  `${import.meta.env.BASE_URL}assets/joint-mascot-1024.webp 1024w`,
].join(", ");
const introVideoUrl = `${import.meta.env.BASE_URL}joint-intro.mp4`;
const INTRO_SESSION_KEY = "joint-video-intro-seen";
const INTRO_START_TIMEOUT_MS = 5000;
const INTRO_STALL_TIMEOUT_MS = 8000;

function shouldShowIntro(reducedMotion: boolean) {
  if (typeof window === "undefined" || reducedMotion) {
    return false;
  }

  const params = new URLSearchParams(window.location.search);

  if (params.has("skip-intro")) {
    return false;
  }

  // Allows the intro to be tested repeatedly.
  if (params.has("replay-intro")) {
    return true;
  }

  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
  } catch {
    // The video remains dismissible even when session storage is unavailable.
  }
}

function useFinePointer() {
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return finePointer;
}

function useLowPowerDevice() {
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number })
      .deviceMemory;
    setLowPower(
      (navigator.hardwareConcurrency > 0 &&
        navigator.hardwareConcurrency <= 4) ||
        (typeof deviceMemory === "number" && deviceMemory <= 4) ||
        Boolean(connection?.saveData) ||
        connection?.effectiveType === "slow-2g" ||
        connection?.effectiveType === "2g",
    );
  }, []);

  return lowPower;
}

function useSectionState() {
  const [heroVisible, setHeroVisible] = useState(true);
  const [finalVisible, setFinalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("mission");

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("#home");
    const final = document.querySelector<HTMLElement>("#join");
    if (!hero || !final) return;
    const heroObserver = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.12 },
    );
    const finalObserver = new IntersectionObserver(
      ([entry]) => setFinalVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    heroObserver.observe(hero);
    finalObserver.observe(final);

    const sections = ["mission", "pillars", "launch"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              second.intersectionRatio - first.intersectionRatio,
          )[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-24% 0px -58% 0px", threshold: [0.05, 0.2, 0.45] },
    );
    sections.forEach((section) => sectionObserver.observe(section));

    return () => {
      heroObserver.disconnect();
      finalObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return { heroVisible, finalVisible, activeSection };
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? window.scrollY / max : 0);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

function ParticleField({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !host || !context || reducedMotion) return;

    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number })
      .deviceMemory;
    const lowPower =
      (navigator.hardwareConcurrency > 0 &&
        navigator.hardwareConcurrency <= 4) ||
      (typeof deviceMemory === "number" && deviceMemory <= 4) ||
      (connection?.saveData ?? false);
    const count = fine && !lowPower ? 42 : 18;
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let pointerX = -1000;
    let pointerY = -1000;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 2.2 + 0.7,
      drift: (Math.random() - 0.5) * 0.18,
      speed: Math.random() * 0.00012 + 0.00007,
      phase: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.25 + 0.15,
    }));

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const move = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
    };
    const draw = (time: number) => {
      if (!visible || document.hidden) return;
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        particle.y -= particle.speed * 16;
        if (particle.y < -0.03) {
          particle.y = 1.03;
          particle.x = Math.random();
        }
        const x =
          particle.x * width + Math.sin(time * 0.0003 + particle.phase) * 15;
        const y = particle.y * height;
        const dx = x - pointerX;
        const dy = y - pointerY;
        const distance = Math.hypot(dx, dy);
        const repel = fine && distance < 105 && distance > 0;
        const offset = repel ? (105 - distance) * 0.16 : 0;
        const px = x + (repel ? (dx / distance) * offset : 0);
        const py = y + (repel ? (dy / distance) * offset : 0);
        context.beginPath();
        context.arc(px, py, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(14, 75, 79, ${particle.opacity})`;
        context.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !document.hidden) frame = requestAnimationFrame(draw);
      else cancelAnimationFrame(frame);
    });
    visibility.observe(host);
    resize();
    window.addEventListener("resize", resize);
    host.addEventListener("pointermove", move, { passive: true });
    const onVisibilityChange = () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else if (visible) frame = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reducedMotion]);

  return (
    <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />
  );
}

function Preloader({ reducedMotion }: { reducedMotion: boolean }) {
  const [visible, setVisible] = useState(() => shouldShowIntro(reducedMotion));
  const [started, setStarted] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const finishIntro = () => {
    markIntroSeen();

    const video = document.getElementById(
      "joint-intro-video",
    ) as HTMLVideoElement | null;

    if (video) {
      video.pause();
    }

    setVisible(false);
  };

  const startIntro = async () => {
    const video = document.getElementById(
      "joint-intro-video",
    ) as HTMLVideoElement | null;

    if (!video) {
      setLoadError(true);
      return;
    }

    // Start the video with its original audio turned on.
    video.muted = false;
    video.volume = 1;

    try {
      await video.play();
      setStarted(true);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#073f3e",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
      }}
    >
      <video
        id="joint-intro-video"
        src={introVideoUrl}
        poster={mascot}
        playsInline
        preload="auto"
        onEnded={finishIntro}
        onError={() => setLoadError(true)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#073f3e",
        }}
      />

      {!started && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "18px",
            padding: "24px",
            background: "rgba(7, 63, 62, 0.55)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#f1c66d",
              fontSize: "clamp(28px, 5vw, 48px)",
              letterSpacing: "3px",
              margin: 0,
            }}
          >
            JOINT CARE
          </h2>

          <p
            style={{
              color: "#ffffff",
              fontSize: "16px",
              margin: 0,
            }}
          >
            Watch our introduction with sound.
          </p>

          <button
            type="button"
            onClick={startIntro}
            style={{
              border: 0,
              borderRadius: "999px",
              padding: "15px 25px",
              background: "#f1c66d",
              color: "#073f3e",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ▶ PLAY INTRO WITH SOUND
          </button>

          {loadError && (
            <p style={{ color: "#ffffff", margin: 0 }}>
              The video did not start. Please try the button again.
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={finishIntro}
        style={{
          position: "absolute",
          right: "20px",
          bottom: "20px",
          zIndex: 3,
          border: "1px solid rgba(255,255,255,0.6)",
          borderRadius: "999px",
          padding: "10px 18px",
          background: "rgba(7, 63, 62, 0.9)",
          color: "#ffffff",
          cursor: "pointer",
        }}
      >
        Skip intro
      </button>
    </div>
  );
}
function BrandMark({
  compact = false,
  onClick,
}: {
  compact?: boolean;
  onClick?: () => void;
}) {
  return (
    <a
      className={`brand-mark${compact ? " brand-mark--compact" : ""}`}
      href="#home"
      aria-label="JOINT CARE"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        textDecoration: "none",
      }}
    >
      <img
        className="brand-emblem"
        src={mascotSmall}
        alt="Joint Care logo"
        width={48}
        height={48}
        decoding="async"
        style={{
          display: "block",
          width: "48px",
          height: "48px",
          flexShrink: 0,
          objectFit: "contain",
        }}
      />

      <span
        className="brand-wordmark"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <span className="brand-name">JOINT CARE</span>
        <span className="brand-ticker">{SITE_COPY.tagline}</span>
      </span>
    </a>
  );
}

function SocialButton({
  variant = "primary",
  compact = false,
  onClick,
}: {
  variant?: "primary" | "secondary" | "dark";
  compact?: boolean;
  onClick?: () => void;
}) {
  const isTelegram = variant !== "secondary";
  const label = isTelegram ? SITE_COPY.telegramLabel : SITE_COPY.xLabel;
  const url = isTelegram ? TELEGRAM_URL : X_URL;
  const text = isTelegram ? SITE_COPY.telegramButton : SITE_COPY.xButton;

  return (
    <a
      className={`social-button social-button--${variant}${compact ? " social-button--compact" : ""}`}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      data-cursor={isTelegram ? "Join" : "Follow"}
      onClick={onClick}
    >
      <span>{text}</span>
      {isTelegram ? (
        <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
      ) : (
        <XMark />
      )}
    </a>
  );
}

function XMark() {
  return (
    <svg className="x-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M18.8 2H22l-7 8.1L23.2 22h-6.4l-5-7.3L5.5 22H2.2l7.5-8.7L1.8 2h6.6l4.5 6.7L18.8 2Zm-1.1 18h1.8L7.4 3.9H5.5L17.7 20Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MobileMenu({
  open,
  onClose,
  toggleRef,
}: {
  open: boolean;
  onClose: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, toggleRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          className="mobile-menu-sheet"
          role="dialog"
          aria-modal="true"
          aria-label={SITE_COPY.menuLabel}
          initial={{
            clipPath: "circle(0% at calc(100% - 42px) 38px)",
            opacity: 0.96,
          }}
          animate={{
            clipPath: "circle(150% at calc(100% - 42px) 38px)",
            opacity: 1,
          }}
          exit={{
            clipPath: "circle(0% at calc(100% - 42px) 38px)",
            opacity: 0.96,
          }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mobile-menu-top">
            <BrandMark onClick={onClose} />
            <button
              type="button"
              className="menu-close"
              onClick={onClose}
              aria-label={SITE_COPY.closeMenu}
            >
              <X size={24} />
            </button>
          </div>
          <nav
            className="mobile-menu-links"
            aria-label={SITE_COPY.primaryNavigation}
          >
            {NAV_ITEMS.map((item, index) => (
              <motion.a
                key={item.id}
                ref={index === 0 ? firstLinkRef : undefined}
                href={`#${item.id}`}
                onClick={onClose}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08, duration: 0.42 }}
              >
                <span>0{index + 1}</span>
                {item.label}
                <ArrowUpRight size={20} aria-hidden="true" />
              </motion.a>
            ))}
          </nav>
          <div className="mobile-menu-socials">
            <SocialButton compact onClick={onClose} />
            <SocialButton variant="secondary" compact onClick={onClose} />
          </div>
          <p className="menu-tagline">{SITE_COPY.tagline}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Navbar({
  activeSection,
  onMenuChange,
}: {
  activeSection: string;
  onMenuChange: (open: boolean) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    onMenuChange(false);
  }, [onMenuChange]);
  const toggleMenu = () => {
    setMenuOpen((current) => !current);
    onMenuChange(!menuOpen);
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        {SITE_COPY.skipLink}
      </a>
      <header
        className={`site-header${menuOpen ? " site-header--menu-open" : ""}`}
      >
        <div className="nav-shell">
          <BrandMark />
          <nav className="desktop-nav" aria-label={SITE_COPY.primaryNavigation}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeSection === item.id ? "active" : ""}
                aria-current={
                  activeSection === item.id ? "location" : undefined
                }
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="nav-right">
            <SocialButton compact />
            <button
              ref={toggleRef}
              className={`menu-toggle${menuOpen ? " is-open" : ""}`}
              type="button"
              aria-label={menuOpen ? SITE_COPY.closeMenu : SITE_COPY.openMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={toggleMenu}
            >
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
      </header>
      <div id="mobile-navigation">
        <MobileMenu open={menuOpen} onClose={closeMenu} toggleRef={toggleRef} />
      </div>
    </>
  );
}

function Hero({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section className="hero-section" id="home" aria-labelledby="hero-heading">
      <div className="hero-mesh" aria-hidden="true" />
      <ParticleField reducedMotion={reducedMotion} />
      <div className="hero-inner page-width">
        <div className="hero-copy">
          <motion.p
            className="eyebrow hero-eyebrow"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.65 }}
          >
            <span className="eyebrow-mark" aria-hidden="true" />
            {HERO_COPY.eyebrow}
          </motion.p>
          <motion.h1 id="hero-heading" aria-label={HERO_COPY.heading.join(" ")}>
            {HERO_COPY.heading.map((line, index) => (
              <motion.span
                className={index === 1 ? "title-highlight" : undefined}
                key={line}
                aria-hidden="true"
                initial={reducedMotion ? false : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.16 + index * 0.12,
                  duration: 0.78,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {line}
              </motion.span>
            ))}
          </motion.h1>
          <p className="hero-subhead">{HERO_COPY.subheadline}</p>
          <motion.div
            className="hero-actions"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46, duration: 0.56 }}
          >
            <SocialButton />
            <SocialButton variant="secondary" />
          </motion.div>
        </div>

        <motion.div
          className="mascot-stage"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.88, y: 22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mascot-halo" aria-hidden="true" />
          <div
            className="mascot-orbit mascot-orbit--outer"
            aria-hidden="true"
          />
          <div
            className="mascot-orbit mascot-orbit--inner"
            aria-hidden="true"
          />
          <div className="mascot-badge" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path
                  id="badge-circle"
                  d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
                />
              </defs>
              <text>
                <textPath href="#badge-circle">{SITE_COPY.badgeText}</textPath>
              </text>
            </svg>
            <Flower2 size={20} strokeWidth={1.4} />
          </div>
          <div className="mascot-float">
            <img
              className="hero-mascot"
              src={mascot}
              srcSet={mascotSrcSet}
              sizes="(max-width: 767px) 82vw, (max-width: 1200px) 46vw, 580px"
              alt={SITE_COPY.mascotAlt}
              width="1024"
              height="1024"
              fetchPriority="high"
            />
          </div>
          <div className="hero-chip hero-chip--education" aria-hidden="true">
            <FlaskConical size={15} />
            {SITE_COPY.chips[0]}
          </div>
          <div className="hero-chip hero-chip--patient" aria-hidden="true">
            <ShieldCheck size={15} />
            {SITE_COPY.chips[1]}
          </div>
          <div className="hero-chip hero-chip--community" aria-hidden="true">
            <Leaf size={15} />
            {SITE_COPY.chips[2]}
          </div>
        </motion.div>
      </div>
      <a
        className="scroll-cue"
        href="#mission"
        aria-label={SITE_COPY.scrollCue}
      >
        <span>{SITE_COPY.scrollCue}</span>
        <ArrowDown size={16} aria-hidden="true" />
      </a>
    </section>
  );
}

function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="eyebrow section-eyebrow">
      <span className="eyebrow-mark" aria-hidden="true" />
      {children}
    </p>
  );
}

function PillarIcon({ icon }: { icon: string }) {
  if (icon === "science") {
    return (
      <span className="pillar-icon pillar-icon--leaf">
        <FlaskConical size={24} strokeWidth={1.6} />
        <Leaf className="icon-leaf" size={14} strokeWidth={1.6} />
      </span>
    );
  }
  if (icon === "joint") {
    return (
      <span className="pillar-icon pillar-icon--gold">
        <Dna size={25} strokeWidth={1.6} />
      </span>
    );
  }
  return (
    <span className="pillar-icon pillar-icon--rose">
      <ShieldCheck size={25} strokeWidth={1.6} />
      <span className="medical-cross" aria-hidden="true">
        +
      </span>
    </span>
  );
}

function PillarCard({
  number,
  title,
  description,
  icon,
  accent,
  index,
}: {
  number: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  index: number;
}) {
  const [pressed, setPressed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const activate = () => {
    setPressed(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPressed(false), 700);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <motion.article
      className={`pillar-card pillar-card--${accent}${pressed ? " is-pressed" : ""}`}
      data-reveal
      role="button"
      whileHover={{ y: -5, rotateX: 1.4, rotateY: index === 1 ? -1.2 : 1.2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      onClick={activate}
      onFocus={activate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      }}
      tabIndex={0}
      aria-label={`${number} ${title}. ${description}`}
    >
      <div className="card-topline">
        <span className="card-number">{number}</span>
        <span className="card-arrow">
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>
      </div>
      <PillarIcon icon={icon} />
      <div className="pillar-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span className="card-glow" aria-hidden="true" />
    </motion.article>
  );
}

function Pillars() {
  return (
    <section
      className="pillars-section"
      id="mission"
      aria-labelledby="pillars-heading"
    >
      <div className="page-width">
        <div className="pillars-intro" data-reveal>
          <div id="pillars">
            <SectionEyebrow>{SITE_COPY.pillarsEyebrow}</SectionEyebrow>
            <h2 id="pillars-heading">{SITE_COPY.pillarsHeading}</h2>
          </div>
        </div>
        <div className="pillar-grid">
          {PILLARS.map((pillar, index) => (
            <PillarCard key={pillar.number} {...pillar} index={index} />
          ))}
        </div>
      </div>
      <div className="marquee-band" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <span key={copy}>
              {SITE_COPY.marqueeWords.map((word) => (
                <span key={word}>
                  {word}
                  <i>✳</i>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Countdown() {
  const [parts, setParts] = useState<number[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const launch = new Date(2026, 11, 1, 0, 0, 0, 0);
    const update = () => {
      const remaining = launch.getTime() - Date.now();
      if (remaining <= 0) {
        setLive(true);
        setParts([]);
        return;
      }
      const days = Math.floor(remaining / 86_400_000);
      const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
      const minutes = Math.floor((remaining % 3_600_000) / 60_000);
      const seconds = Math.floor((remaining % 60_000) / 1_000);
      setParts([days, hours, minutes, seconds]);
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const units = SITE_COPY.countdownUnits;
  return (
    <div className="countdown-wrap">
      <p className="countdown-label">{SITE_COPY.launchDateLabel}</p>
      <div className="countdown" aria-hidden="true">
        {live ? (
          <div className="live-message">{SITE_COPY.liveMessage}</div>
        ) : (
          parts.map((value, index) => (
            <div
              className={`countdown-tile${index === 3 ? " countdown-tile--seconds" : ""}`}
              key={units[index]}
            >
              <span className="countdown-value">
                {index === 0 ? value : String(value).padStart(2, "0")}
              </span>
              <span className="countdown-unit">{units[index]}</span>
              {index === 3 && (
                <span className="seconds-ring" aria-hidden="true" />
              )}
            </div>
          ))
        )}
      </div>
      <p className="sr-only" aria-live="off">
        {live ? SITE_COPY.liveMessage : SITE_COPY.countdownAccessible}
      </p>
    </div>
  );
}

function Timeline() {
  return (
    <div className="timeline-track">
      <span className="timeline-progress" aria-hidden="true" />

      <ol className="timeline" aria-label={SITE_COPY.timelineLabel}>
        {TIMELINE.map((item, index) => {
          const isCompleted = index < 2;
          const isEducationalPillars = index === 1;

          return (
            <li
              className={`timeline-item timeline-item--${item.stage}${
                index === 0 ? " timeline-item--current" : ""
              }${isEducationalPillars ? " timeline-item--highlighted" : ""}`}
              key={item.title}
              data-reveal
            >
              <span
                className="timeline-node"
                aria-hidden="true"
                style={
                  isCompleted
                    ? {
                        display: "grid",
                        placeItems: "center",
                        backgroundColor: "#e6c56f",
                        border: "2px solid #f4e3ac",
                        color: "#073f3e",
                        boxShadow: "0 0 0 5px rgba(230,197,111,0.18)",
                      }
                    : undefined
                }
              >
                {isCompleted ? <Check size={13} strokeWidth={3} /> : null}
              </span>

              <span className="timeline-step">{item.step}</span>

              <span
                className="timeline-title"
                style={
                  isEducationalPillars
                    ? {
                        color: "#f0d58d",
                        fontWeight: 700,
                      }
                    : undefined
                }
              >
                {item.title}
              </span>

              {item.note && <span className="timeline-note">{item.note}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
function Launch() {
  return (
    <section
      className="launch-section"
      id="launch"
      aria-labelledby="launch-heading"
    >
      <div className="launch-glow launch-glow--one" aria-hidden="true" />
      <div className="launch-glow launch-glow--two" aria-hidden="true" />
      <div className="page-width launch-content">
        <div className="launch-heading" data-reveal>
          <SectionEyebrow>{SITE_COPY.launchEyebrow}</SectionEyebrow>
          <h2 id="launch-heading">{SITE_COPY.launchHeading}</h2>
          <p>{SITE_COPY.launchBody}</p>
        </div>
        <div className="launch-event" data-reveal>
          <div className="launch-date-block">
            <span className="date-icon">
              <Dna size={19} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <span className="date-kicker">{SITE_COPY.launchEventLabel}</span>
              <strong>{SITE_COPY.launchDate}</strong>
            </div>
          </div>
          <Countdown />
        </div>
        <div className="timeline-block">
          <Timeline />
        </div>
        <div className="principle-row" aria-label={SITE_COPY.principlesLabel}>
          {PRINCIPLES.map((principle) => (
            <span className="principle-chip" key={principle}>
              <Check size={14} aria-hidden="true" />
              {principle}
            </span>
          ))}
        </div>
      </div>
      <div className="launch-helix" aria-hidden="true">
        <Dna size={124} strokeWidth={0.5} />
      </div>
    </section>
  );
}

function FinalCta() {
  const [burst, setBurst] = useState(false);
  const triggerBurst = () => {
    setBurst(true);
    window.setTimeout(() => setBurst(false), 950);
  };

  return (
    <section
      className={`final-cta${burst ? " is-bursting" : ""}`}
      id="join"
      aria-labelledby="join-heading"
    >
      <div className="cta-orb" aria-hidden="true" />
      <div className="cta-mascot-peek" aria-hidden="true">
        <img src={mascot} alt="" width="260" height="260" loading="lazy" />
      </div>
      <div className="cta-leaves" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <Leaf key={index} size={16 + (index % 3) * 3} />
        ))}
      </div>
      <div className="page-width final-cta-inner" data-reveal>
        <div className="cta-copy">
          <h2 id="join-heading">{CTA_COPY.heading}</h2>
          <p>{CTA_COPY.body}</p>
        </div>
        <div
          className="cta-actions"
          onMouseEnter={triggerBurst}
          onClick={triggerBurst}
        >
          <SocialButton onClick={triggerBurst} />
          <SocialButton variant="secondary" onClick={triggerBurst} />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-width footer-main">
        <div className="footer-brand">
          <BrandMark />
          <span>{SITE_COPY.tagline}</span>
        </div>
        <nav className="footer-nav" aria-label={SITE_COPY.footerNavigation}>
          {NAV_ITEMS.map((item) => (
            <a href={`#${item.id}`} key={item.id}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="footer-socials">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={SITE_COPY.telegramLabel}
          >
            <span>Telegram</span>
            <ArrowUpRight size={15} />
          </a>
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={SITE_COPY.xLabel}
          >
            <span>Follow on X</span>
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
      <div className="page-width footer-bottom">
        <p className="disclaimer">{FOOTER_COPY.disclaimer}</p>
        <div className="footer-meta">
          <span>{FOOTER_COPY.copyright}</span>
          <a href={X_URL} target="_blank" rel="noopener noreferrer">
            {FOOTER_COPY.handle}
          </a>
        </div>
      </div>
    </footer>
  );
}

function CustomCursor({ enabled }: { enabled: boolean }) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    let x = -100;
    let y = -100;
    let ringX = x;
    let ringY = y;
    let frame = 0;
    let label = "";
    const setTarget = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-cursor]",
      );
      label = target?.dataset.cursor ?? "";
      cursorRef.current?.style.setProperty("--cursor-x", `${x}px`);
      cursorRef.current?.style.setProperty("--cursor-y", `${y}px`);
      ringRef.current?.style.setProperty("--cursor-label", `"${label}"`);
      ringRef.current?.classList.toggle("cursor-ring--active", Boolean(label));
    };
    const animate = () => {
      ringX += (x - ringX) * 0.16;
      ringY += (y - ringY) * 0.16;
      ringRef.current?.style.setProperty("--cursor-x", `${ringX}px`);
      ringRef.current?.style.setProperty("--cursor-y", `${ringY}px`);
      frame = requestAnimationFrame(animate);
    };
    const press = () => ringRef.current?.classList.add("cursor-ring--pressed");
    const release = () =>
      ringRef.current?.classList.remove("cursor-ring--pressed");
    window.addEventListener("pointermove", setTarget, { passive: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    frame = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("pointermove", setTarget);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className="custom-cursor" ref={cursorRef} aria-hidden="true">
      <span />
      <div className="cursor-ring" ref={ringRef} />
    </div>
  );
}

function ScrollReveals({ reducedMotion }: { reducedMotion: boolean }) {
  useEffect(() => {
    if (reducedMotion) {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((element) => {
          element.classList.add("is-visible");
        });
      return;
    }

    let gsap: typeof import("gsap").gsap;
    let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
    let cleanup: (() => void) | undefined;
    let refreshFrame = 0;
    let active = true;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, triggerModule]) => {
        if (!active) return;
        gsap = gsapModule.gsap;
        ScrollTrigger = triggerModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        const refresh = () => {
          cancelAnimationFrame(refreshFrame);
          refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
        };
        window.addEventListener("resize", refresh);
        window.addEventListener("orientationchange", refresh);
        const context = gsap.context(() => {
          gsap.fromTo(
            ".timeline-progress",
            { scaleX: 0, scaleY: 0 },
            {
              scaleX: 1,
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: ".timeline-track",
                start: "top 78%",
                end: "bottom 72%",
                scrub: true,
              },
            },
          );
          gsap.utils
            .toArray<HTMLElement>("[data-reveal]")
            .forEach((element) => {
              gsap.fromTo(
                element,
                { y: 24, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.75,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: element,
                    start: "top 90%",
                    once: true,
                  },
                },
              );
            });
        });
        cleanup = () => {
          window.removeEventListener("resize", refresh);
          window.removeEventListener("orientationchange", refresh);
          cancelAnimationFrame(refreshFrame);
          context.revert();
        };
      },
    );
    return () => {
      active = false;
      cleanup?.();
      cancelAnimationFrame(refreshFrame);
    };
  }, [reducedMotion]);

  return null;
}

function SmoothScroll({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    let cleanup: (() => void) | undefined;
    let active = true;
    void Promise.all([
      import("lenis"),
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([lenisModule, gsapModule, triggerModule]) => {
      if (!active) return;
      const lenis = new lenisModule.default({
        duration: 1.12,
        smoothWheel: true,
        syncTouch: false,
      });
      const gsap = gsapModule.gsap;
      const ScrollTrigger = triggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);
      const ticker = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);
      cleanup = () => {
        lenis.off("scroll", onScroll);
        lenis.destroy();
        gsap.ticker.remove(ticker);
        ScrollTrigger.refresh();
      };
    });
    return () => {
      active = false;
      cleanup?.();
    };
  }, [enabled]);

  return null;
}

function StickyMobileCta({
  visible,
  onMenuChange,
}: {
  visible: boolean;
  onMenuChange: (open: boolean) => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="sticky-mobile-cta"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <SocialButton compact onClick={() => onMenuChange(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const finePointer = useFinePointer();
  const lowPower = useLowPowerDevice();
  const { heroVisible, finalVisible, activeSection } = useSectionState();
  const [menuOpen, setMenuOpen] = useState(false);
  const simplifyMotion = prefersReducedMotion || lowPower;

  return (
    <MotionConfig reducedMotion={simplifyMotion ? "always" : "user"}>
      <div className={`app-shell${lowPower ? " app-shell--low-power" : ""}`}>
        <ScrollProgress />
        <Preloader reducedMotion={prefersReducedMotion} />
        <Navbar activeSection={activeSection} onMenuChange={setMenuOpen} />
        <main id="main-content" tabIndex={-1}>
          <Hero reducedMotion={simplifyMotion} />
          <Pillars />
          <Launch />
          <FinalCta />
        </main>
        <Footer />
        <StickyMobileCta
          visible={!heroVisible && !finalVisible && !menuOpen}
          onMenuChange={setMenuOpen}
        />
        <CustomCursor enabled={finePointer && !simplifyMotion} />
        <ScrollReveals reducedMotion={simplifyMotion} />
        <SmoothScroll enabled={finePointer && !simplifyMotion} />
      </div>
    </MotionConfig>
  );
}

export default App;
