export const SITE = {
  brand: '$JOINT',
  brandMark: '$',
  title: '$JOINT | Joint Care: Medical Cannabis & Wellness',
  description:
    'A dedicated brand bringing medical cannabis education, joint care, and physical healing to the community.',
  tagline: 'Medical Cannabis & Wellness',
  handle: '@PassTheJointSol',
  launchDate: 'December 2026',
  launchAtLocal: { year: 2026, month: 11, day: 1 },
  disclaimer:
    'Educational content only. Not medical advice. Consult a licensed healthcare professional. Cannabis laws vary by region; you must meet local legal age requirements. $JOINT is not financial advice.',
  copyright: '© 2026 $JOINT. All rights reserved.',
  social: {
    telegram: 'https://t.me/PassTheJointSol',
    x: 'https://x.com/PassTheJointSol',
  },
  aria: {
    skip: 'Skip to content',
    brand: '$JOINT home',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    mobileMenu: 'Main navigation',
    telegram: 'Join the official $JOINT Telegram',
    x: 'Follow $JOINT on X',
    mascot: '$JOINT Joint Care mascot, a friendly leafy character holding a medical shield',
    countdown: 'Countdown to the official launch on December 1, 2026 at midnight local time',
    menuDialog: 'Navigation menu',
    xLogo: 'X',
  },
  nav: [
    { label: 'Mission', href: '#mission' },
    { label: 'Pillars', href: '#pillars' },
    { label: 'Launch', href: '#launch' },
  ],
  hero: {
    eyebrow: 'Medical Cannabis & Wellness',
    headlineLines: ['Natural Relief.', 'Patient Advocacy.', 'Web3 Wellness.'],
    subheadline:
      'A dedicated brand bringing medical cannabis education, joint care, and physical healing to the community.',
    telegram: 'Join Official Telegram',
    followX: 'Follow on X',
    note: 'Education first. Community always.',
    chips: ['Education First', 'Patient Led', 'Community Driven'],
    scroll: 'Scroll to explore',
    badge: 'MEDICAL CANNABIS & WELLNESS',
  },
  mission: {
    eyebrow: 'Core Mission',
    heading: 'Educational Pillars',
    sideNote: 'A grounded approach to plant education and patient advocacy.',
    cards: [
      {
        number: '01',
        title: 'Medical Cannabis Science',
        description:
          'Breaking down plant therapy, the Entourage Effect, and natural cannabinoid recovery.',
      },
      {
        number: '02',
        title: 'Joint Care & Relief',
        description:
          'Raising awareness for non-pharmaceutical solutions for chronic pain and inflammation.',
      },
      {
        number: '03',
        title: 'Patient Advocacy',
        description:
          'Supporting patient rights, access, and real-world plant education.',
      },
    ],
  },
  launch: {
    eyebrow: 'Launch Timeline & Brand Philosophy',
    heading: 'Built for the Long Term',
    body:
      'We are skipping short-term speculative hype to focus on authentic community engagement, verified educational resources, and brand authority.',
    officialDateLabel: 'Official Launch Date',
    principles: ['Authentic Community', 'Verified Education', 'Brand Authority'],
    timeline: [
      { label: 'Community Building', stage: 'now' },
      { label: 'Education Library', stage: 'next' },
      { label: 'Official Launch: December 2026', stage: 'launch' },
    ],
    live: 'We are live.',
    countdownLabels: ['Days', 'Hours', 'Minutes', 'Seconds'],
  },
  finalCta: {
    heading: 'Join the community.',
    body: 'Follow along for education, updates, and launch news.',
  },
  footer: {
    socials: 'Follow along',
    navigation: 'Explore',
    socialsHeading: 'Community',
  },
} as const;

export const ASSETS = {
  mascot: '/assets/joint-mascot.jpg',
  openGraph: '/og-joint.jpg',
  favicon: '/favicon.svg',
  manifest: '/site.webmanifest',
} as const;

export const TELEGRAM_URL = SITE.social.telegram;
export const X_URL = SITE.social.x;

export const SITE_COPY = {
  brand: SITE.aria.brand,
  tagline: SITE.tagline,
  primaryNavigation: SITE.aria.mobileMenu,
  footerNavigation: SITE.footer.navigation,
  menuLabel: SITE.aria.menuDialog,
  openMenu: SITE.aria.openMenu,
  closeMenu: SITE.aria.closeMenu,
  skipLink: SITE.aria.skip,
  preloaderSkip: 'Skip',
  telegramLabel: SITE.aria.telegram,
  xLabel: SITE.aria.x,
  telegramButton: SITE.hero.telegram,
  xButton: SITE.hero.followX,
  badgeText: `${SITE.hero.badge} · ${SITE.hero.badge} · `,
  mascotAlt: SITE.aria.mascot,
  chips: SITE.hero.chips,
  scrollCue: 'Explore our mission',
  pillarsEyebrow: SITE.mission.eyebrow,
  pillarsHeading: SITE.mission.heading,
  launchEyebrow: SITE.launch.eyebrow,
  launchHeading: SITE.launch.heading,
  launchBody: SITE.launch.body,
  launchEventLabel: SITE.launch.officialDateLabel,
  launchDate: SITE.launchDate,
  launchDateLabel: SITE.launch.officialDateLabel,
  countdownUnits: SITE.launch.countdownLabels,
  countdownAccessible: SITE.aria.countdown,
  liveMessage: SITE.launch.live,
  timelineLabel: 'Launch timeline',
  principlesLabel: 'Our principles',
  marqueeWords: ['RELIEF', 'ADVOCACY', 'WELLNESS', 'EDUCATION'],
} as const;

export const HERO_COPY = {
  eyebrow: SITE.hero.eyebrow,
  heading: SITE.hero.headlineLines,
  subheadline: SITE.hero.subheadline,
} as const;

export const NAV_ITEMS = SITE.nav.map((item) => ({
  id: item.href.replace(/^#/, ''),
  label: item.label,
}));

export const PILLARS = SITE.mission.cards.map((card, index) => ({
  ...card,
  icon: ['science', 'joint', 'advocacy'][index],
  accent: ['leaf', 'gold', 'rose'][index],
}));

export const PRINCIPLES = SITE.launch.principles;

export const TIMELINE = SITE.launch.timeline.map((item, index) => ({
  step: `0${index + 1}`,
  title: item.label,
  note: item.stage === 'now' ? 'Now' : '',
}));

export const CTA_COPY = {
  heading: SITE.finalCta.heading,
  body: SITE.finalCta.body,
} as const;

export const FOOTER_COPY = {
  disclaimer: SITE.disclaimer,
  copyright: SITE.copyright,
  handle: SITE.handle,
} as const;
