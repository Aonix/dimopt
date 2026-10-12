/**
 * ============================================================================
 * DEMO CONTENT — every person, quote, metric and message below is fictional,
 * written to demonstrate the layout. Replace wholesale before any real launch.
 * ============================================================================
 */

export interface Stat {
  value: string;
  label: string;
}

export interface Pillar {
  index: string;
  title: string;
  strap: string;
  body: string;
  marks: string[];
}

export interface Transformation {
  name: string;
  town: string;
  age: number;
  role: string;
  startKg: number;
  endKg: number;
  weeks: number;
  quote: string;
  beforeAlt: string;
  afterAlt: string;
}

export interface WhatsAppThread {
  contact: string;
  time: string;
  messages: { from: 'client' | 'coach'; text: string; time: string }[];
}

export interface Faq {
  q: string;
  a: string;
}

export const BRAND = {
  name: 'Surrey Elite Performance',
  mark: 'SEP',
  coach: 'Dominic Hale',
  intake: 'Q3 Intake',
  spacesLeft: 3,
  spacesTotal: 10,
  phone: '+44 7700 900184',
  email: 'dominic@surreyeliteperformance.co.uk',
  facility: 'Private studio, Guildford GU1',
} as const;

export const HERO = {
  eyebrow: 'Guildford · Cobham · Weybridge · Esher',
  headline: 'Drop 8–12kg and rebuild peak athletic energy in 90 days',
  headlineTail:
    'without two-hour gym sessions or turning down a single dinner.',
  sub: 'A private, cut-to-measure programme for Surrey professionals who are done guessing. Train at my invitation-only Guildford studio, remotely from wherever the week takes you, or both — the plan is built around your diary, not the other way round.',
  cta: 'Start 2-minute qualifier',
  ctaNote: 'Four questions. No card, no call script, no obligation.',
} as const;

export const TRUST_STATS: Stat[] = [
  { value: '140+', label: 'Surrey clients coached' },
  { value: '90', label: 'Day transformation' },
  { value: '45', label: 'Minute capped sessions' },
  { value: '5.0', label: 'Rating from 63 reviews' },
];

export const ARCHITECT = {
  eyebrow: 'The architect',
  title: 'I spent eleven years on a trading floor learning exactly how a body falls apart.',
  lede: 'Then I spent six rebuilding them — including my own.',
  body: [
    'I traded institutional FX at a desk in the City until I was 34. Waterloo at 05:52, home past nine, dinner from a plastic tray, three "restart Monday" gym memberships running at once. At my worst I was 104kg with a resting heart rate of 82 and a consultant telling me my bloods looked like a man fifteen years older.',
    'What actually worked was not a bootcamp, a shake, or a 5am ice bath. It was accepting that my week was non-negotiable and building the training around it — short, heavy, precise sessions and a nutrition structure that survived client dinners at The Ivy in Guildford and a Thursday in Frankfurt.',
    'That is the entire method. I do not sell discipline, because you already have more of it than most people alive — you simply spend it at work. Surrey Elite Performance exists to take the last four hours of your week and turn them into the thing everyone comments on by Christmas.',
  ],
  credentials: [
    'CIMSPA Level 4 Advanced Practitioner',
    'Precision Nutrition L2 certified',
    'ASCC strength & conditioning',
    'Six years, 140+ private clients',
  ],
} as const;

export const PILLARS: Pillar[] = [
  {
    index: '01',
    title: 'Metabolic architecture',
    strap: 'Flexible nutrition, built around your social calendar',
    body:
      'No meal plan, no banned foods, no weighing broccoli at a dinner party. You get a daily protein and calorie envelope, a short list of defaults for the days you cannot think, and a rehearsed strategy for restaurants, client lunches and airport lounges. It is designed to survive a real Surrey diary — because a plan you abandon in week three is worth nothing.',
    marks: ['Restaurant playbook', 'Travel protocols', 'Zero banned foods'],
  },
  {
    index: '02',
    title: 'Hypertrophy & joint longevity',
    strap: 'Time-capped 45-minute sessions, three or four times a week',
    body:
      'Sessions are hard-capped at 45 minutes and built on a small number of lifts you will get measurably stronger at. Every programme is screened against your history — the old rugby shoulder, the disc you did in 2019, the knee that objects to lunges. We train around it and then we train it, so you finish the ninety days more robust than when you started, not held together with tape.',
    marks: ['45 min hard cap', 'Injury-screened', '3–4 sessions weekly'],
  },
  {
    index: '03',
    title: 'Executive accountability',
    strap: 'Daily monitoring, weekly adaptation, one human on the other end',
    body:
      'You check in daily through the app — thirty seconds, weight and adherence. Every Sunday I read every number and rewrite the week: load, calories, session count. If you go quiet on a Tuesday you hear from me on the Tuesday, not at the end of the month. This is the part nobody else does properly, and it is the reason the results hold.',
    marks: ['Sunday rewrite', 'WhatsApp direct line', '30-second check-ins'],
  },
];

export const TRANSFORMATIONS: Transformation[] = [
  {
    name: 'James R.',
    town: 'Cobham',
    age: 44,
    role: 'Private equity, London',
    startKg: 101.4,
    endKg: 87.2,
    weeks: 14,
    quote:
      'I travelled nine of the fourteen weeks. That used to be my excuse — Dom just built the plan around the flights and it stopped being one.',
    beforeAlt: 'Client James at the start of his programme',
    afterAlt: 'Client James after fourteen weeks of coaching',
  },
  {
    name: 'Priya N.',
    town: 'Guildford',
    age: 38,
    role: 'NHS consultant',
    startKg: 78.9,
    endKg: 68.5,
    weeks: 16,
    quote:
      'Shift work wrecked every plan I had tried. This is the first one that had an actual answer for nights instead of telling me to sleep more.',
    beforeAlt: 'Client Priya at the start of her programme',
    afterAlt: 'Client Priya after sixteen weeks of coaching',
  },
  {
    name: 'Marcus T.',
    town: 'Weybridge',
    age: 51,
    role: 'Founder, logistics',
    startKg: 96.0,
    endKg: 84.8,
    weeks: 12,
    quote:
      'Fifty-one, two bad knees and I deadlift more than I did at thirty. My golf handicap came down four shots as a side effect.',
    beforeAlt: 'Client Marcus at the start of his programme',
    afterAlt: 'Client Marcus after twelve weeks of coaching',
  },
];

export const WHATSAPP_THREADS: WhatsAppThread[] = [
  {
    contact: 'James R. · Cobham',
    time: 'Today',
    messages: [
      { from: 'client', text: 'Mate. 87.2 this morning 😳', time: '06:41' },
      { from: 'client', text: 'That is 14.2kg. Suit fitting on Saturday and they have to take the whole jacket in', time: '06:41' },
      { from: 'coach', text: 'Outstanding. And you did it through nine weeks of travel — that is the bit to be proud of.', time: '06:58' },
      { from: 'client', text: 'Genuinely never thought I would see the 80s again', time: '07:12' },
    ],
  },
  {
    contact: 'Priya N. · Guildford',
    time: 'Yesterday',
    messages: [
      { from: 'client', text: 'Just did 4 nights in a row and stayed on plan the whole way through', time: '21:03' },
      { from: 'coach', text: 'Every single day logged. How did the pre-shift template hold up?', time: '21:15' },
      { from: 'client', text: 'Perfectly. No 4am vending machine for the first time in about a decade honestly', time: '21:18' },
    ],
  },
];

export const FAQS: Faq[] = [
  {
    q: 'I travel constantly for work. Is this realistic for me?',
    a: 'It is designed for exactly that. Roughly two thirds of my clients travel monthly or more. You get hotel-gym and bodyweight versions of every session, a restaurant and lounge ordering playbook, and adjusted targets for travel weeks so the plan flexes instead of breaking. James in the case studies above was away for nine of his fourteen weeks and still finished 14.2kg down.',
  },
  {
    q: 'Do I need a commercial gym membership in Surrey?',
    a: 'No. In-person clients train at my private studio in Guildford, which is included — no separate membership, no waiting for a rack at 6pm. If you would rather use a facility you already belong to, or a home setup, the programme is written against whatever equipment you actually have access to. Fully remote clients need nothing more than a bench, adjustable dumbbells and somewhere to pull from.',
  },
  {
    q: 'How does the money-back guarantee work?',
    a: 'Follow the programme for 90 days — attend your sessions, hit your protein and calorie envelope on at least 80% of days, and complete your daily check-ins — and if you have not made measurable progress against the metrics we agreed in week one, you get every penny back. The adherence bar exists because I cannot be accountable for a plan nobody ran. It is 80%, not perfection, and it is measured from the data you are logging anyway.',
  },
  {
    q: 'I am carrying an old injury. Will you take me on?',
    a: 'Usually yes, and it is one of the more common reasons people come to me. Every client is screened before a single session is written, and where it is warranted I will ask to speak to your physio or consultant first. Marcus, above, arrived at 51 with two arthritic knees. We trained around them for six weeks and then trained them directly. He is now pulling heavier than he did in his thirties.',
  },
  {
    q: 'What does it actually cost?',
    a: 'Private 1:1 coaching runs from £395 per month for fully remote through to £1,150 per month for twice-weekly in-person sessions at the Guildford studio, on a three-month minimum. I quote you a specific figure on the qualifying call once I know which of those you need — not before, because guessing at it wastes both our time. If it is not the right fit financially I will say so on the call and point you somewhere sensible.',
  },
  {
    q: 'What actually happens after I submit the qualifier?',
    a: 'I read it personally, usually the same day. If I think I can get you the result, you get a WhatsApp with two or three call slots in the next 48 hours. The call is 20 minutes, it is a conversation rather than a pitch, and you will know by the end of it whether we are working together. If I do not think I am the right coach for what you want, I will tell you that instead — I run ten private spaces and filling them with the wrong people helps nobody.',
  },
];

export const GUARANTEE = {
  eyebrow: 'The terms',
  title: '90 days. Measurable progress, or every penny back.',
  body:
    'Attend your sessions, hit your envelope on 80% of days, complete your check-ins. If the numbers we agreed in week one have not moved, you are refunded in full — no forms, no negotiation.',
} as const;
