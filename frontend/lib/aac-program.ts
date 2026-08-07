export const AAC_IMAGES = {
  hero: "/programs/aac/discovery-booth.png",
  discoveryBooth: "/programs/aac/discovery-booth.png",
  marketEvent: "/programs/aac/market-event.png",
  greenhouseGroup: "/programs/aac/greenhouse-group.png",
  greenhouseInterior: "/programs/aac/greenhouse-interior.png",
  fieldTraining: "/programs/aac/field-training.png",
  agroforestryLesson: "/programs/aac/agroforestry-lesson.png",
  plantingDemo: "/programs/aac/planting-demo.png",
  communityTraining: "/programs/aac/community-training.png",
} as const

export const AAC_VIDEOS = [
  {
    id: "story-1",
    title: "AAC programme story",
    youtubeId: "8Tew0o-KShA",
  },
  {
    id: "story-2",
    title: "Regenerative agriculture in practice",
    youtubeId: "UPNkJwzLh-o",
  },
  {
    id: "story-3",
    title: "Closing the loop together",
    youtubeId: "dMq_WM9ZlKA",
  },
] as const

export const AAC_HERO_STATS = [
  { label: "Farmers trained", value: "150" },
  { label: "Kiambu sub-counties", value: "3" },
  { label: "Working Group members", value: "38" },
  { label: "Organisations mapped", value: "75" },
] as const

export const AAC_ENDLINE_STATS = [
  { label: "Attended all or part of training", value: "99.3%" },
  { label: "Rated useful or very useful", value: "99.3%" },
  { label: "Willing to apply new techniques", value: "99.3%" },
  { label: "Would recommend the training", value: "100%" },
  { label: "Recorded a specific action plan", value: "91.0%" },
  { label: "Satisfied or very satisfied", value: "92.1%" },
] as const

export const AAC_SYSTEM_CONSTRAINTS = [
  {
    title: "Evidence gap",
    description: "Limited locally validated agronomic and economic proof.",
  },
  {
    title: "Extension-capacity gap",
    description: "Insufficient practical exposure, tools and incentives for extension actors.",
  },
  {
    title: "Trust gap",
    description: "Limited confidence in advice, product claims and verification.",
  },
  {
    title: "Coordination gap",
    description: "Fragmented organisations and producers unable to build shared infrastructure.",
  },
  {
    title: "Market gap",
    description: "Weak visibility, availability, storytelling and demand-conversion mechanisms.",
  },
  {
    title: "Finance gap",
    description: "Limited products suited to transition timelines and early-stage risk.",
  },
] as const

export const AAC_IMPACT_PATHWAY = [
  "Convene and diagnose",
  "Prioritise leverage points",
  "Co-design pilots",
  "Test and measure",
  "Adapt and scale",
] as const

export const AAC_TIMELINE = [
  {
    date: "27 Nov 2025",
    stage: "Sense-making",
    detail:
      "World Café identified circularity as a systems problem and mapped barriers, enablers and actors.",
  },
  {
    date: "Jan 2026",
    stage: "Priority definition",
    detail:
      "Capacity/research-to-practice and market access were selected as priority pathways.",
  },
  {
    date: "Feb–Mar 2026",
    stage: "Pilot co-design",
    detail:
      "Workstreams framed problems, generated concepts and assessed delivery options and risks.",
  },
  {
    date: "1–10 Apr 2026",
    stage: "Readiness design",
    detail:
      "Hybrid models, users, geography, partners, activities and governance were advanced.",
  },
  {
    date: "17 Apr 2026",
    stage: "Plenary validation",
    detail: "Pilot A and Pilot B were approved for proof-of-concept implementation.",
  },
  {
    date: "Jun–Jul 2026",
    stage: "Implementation & evidence",
    detail: "Farmer training and consumer activation generated the first outcome datasets.",
  },
] as const

export const AAC_PILOTS = [
  {
    id: "pilot-a",
    name: "Pilot A",
    title: "Building Capacity Through the Extension System",
    description:
      "A farm-based Live-in Lab at Sylvia's Basket / Kilimo Endelevu Farm in Ndeiya, Kiambu County. Five extension workers from Limuru, Kabete and Kikuyu participated, supported by the Kiambu Director of Agriculture. Knowledge then travelled into farmer training across three sub-counties.",
    highlights: [
      "145 farmer baseline records · 144 endline records",
      "Average understanding score: 3.32 / 4 (83.1%)",
      "Average confidence score: 3.54 / 5 (70.8%)",
      "Top planned practices: mulching (88.9%), composting (84.7%), farm-waste reuse (81.2%)",
    ],
    image: AAC_IMAGES.greenhouseGroup,
  },
  {
    id: "pilot-b",
    name: "Pilot B",
    title: "Testing Consumer Demand, Trust & Market Access",
    description:
      "A hybrid consumer activation combining shared marketing and trust-building. Producers including Forest Foods, Kaijuju and Sylvia's Basket connected with consumers at the HereAfrica Food and Drink Festival — with six discovery booths and 600+ attendees.",
    highlights: [
      "95.2% willing or maybe willing to pay slightly more (n=21)",
      "61.9% requested follow-up after the expo",
      "100% interested in future engagement (events, markets, farm visits)",
      "Health, taste and freshness were the strongest purchase motivations",
    ],
    image: AAC_IMAGES.marketEvent,
  },
] as const

export const AAC_KEY_CHANGES = [
  {
    title: "From consultation to joint experimentation",
    detail:
      "A 38-member Working Group moved from individual perspectives to collective problem-solving — diagnosing, prioritising, designing and implementing two pilots together.",
    evidence: "38-member Working Group · 2 workstreams · 2 pilot interventions implemented",
  },
  {
    title: "County extension pathway to farmer learning",
    detail:
      "Pilot A combined county-linked extension participation with practical learning and an onward farmer-training cohort across Kikuyu, Kabete and Limuru.",
    evidence: "145 baseline and 144 endline farmer records · 99.3% attendance",
  },
  {
    title: "From general interest to explicit application plans",
    detail:
      "141 of 142 valid respondents were willing to apply a new technique; 131 of 144 recorded a specific farm change — evidence of adoption readiness.",
    evidence: "91.0% with a specific action plan · 92.9% intending to start within one month",
  },
  {
    title: "Market access as a collective trust problem",
    detail:
      "Pilot B reframed limited regenerative-product demand as requiring collective visibility, credible trust signals and coordinated storytelling.",
    evidence: "Collective producer activation · consumer feedback · emerging trust identity",
  },
] as const

export const AAC_STORY_GALLERY = [
  {
    src: AAC_IMAGES.discoveryBooth,
    alt: "AAC Discovery Booth at HereAfrica festival, Nairobi",
    caption: "Discovery Booth — connecting producers and consumers at HereAfrica, June 2026",
  },
  {
    src: AAC_IMAGES.fieldTraining,
    alt: "Field training session on regenerative agriculture",
    caption: "Learning by seeing — practical field training with extension officers and farmers",
  },
  {
    src: AAC_IMAGES.agroforestryLesson,
    alt: "Syntropic agroforestry lesson at Forest Foods",
    caption: "Syntropic agroforestry at Forest Foods — theory translated into practice",
  },
  {
    src: AAC_IMAGES.greenhouseInterior,
    alt: "Circular farming systems inside a greenhouse",
    caption: "Live-in Lab — circular systems including aquaculture ponds and integrated crops",
  },
  {
    src: AAC_IMAGES.plantingDemo,
    alt: "Farmers planting saplings during a demonstration",
    caption: "Hands-on demonstration — planting and regenerative practice in the field",
  },
  {
    src: AAC_IMAGES.communityTraining,
    alt: "Community training session outdoors",
    caption: "Peer learning — farmers sharing knowledge in community training spaces",
  },
  {
    src: AAC_IMAGES.greenhouseGroup,
    alt: "Extension officers and farmers at a greenhouse",
    caption: "From the living lab to farmers' fields — knowledge that travels",
  },
  {
    src: AAC_IMAGES.marketEvent,
    alt: "Consumer engagement at AAC market event",
    caption: "Market activation — regenerative products meeting consumers face to face",
  },
] as const

export const AAC_STORY_ANGLES = [
  "From the living lab to farmers' fields",
  "Regenerative practice in Limuru",
  "Learning by seeing at Forest Foods",
  "Circular inputs need demand",
  "Financing regeneration",
  "Knowledge that travels — extension officers as storytellers",
  "AAC at the HereAfrica festival",
] as const

export const AAC_PARTNERS = ["DOEN Foundation", "Impact Hub Nairobi"] as const

export const AAC_CONTACT_EMAIL = "ihn.programs@impacthub.net"

export const AAC_TAGLINE = "Closing the loop, together."

export const AAC_REPORTING_PERIOD = "September 2025 – August 2026"

export const AAC_SECTIONS = [
  { id: "impact", label: "Impact" },
  { id: "pathway", label: "Pathway" },
  { id: "pilots", label: "Pilots" },
  { id: "data", label: "Data" },
  { id: "journey", label: "Journey" },
  { id: "stories", label: "Stories" },
  { id: "videos", label: "Videos" },
] as const

export const AAC_STORY_ARC = [
  {
    step: "Learn",
    title: "Live-in Lab",
    description:
      "Extension officers encounter practical, farm-tested regenerative methods at Sylvia's Basket Farm — then carry that knowledge into communities.",
    image: AAC_IMAGES.agroforestryLesson,
    accent: "#7ebb55",
  },
  {
    step: "Apply",
    title: "Farmer training",
    description:
      "150 farmers across Kikuyu, Kabete and Limuru adapt regenerative practices — mulching, composting, farm-waste reuse and more.",
    image: AAC_IMAGES.fieldTraining,
    accent: "#41bed0",
  },
  {
    step: "Connect",
    title: "Ecosystem exchange",
    description:
      "Working Group members, producers and partners compare evidence, build confidence and co-design the next phase together.",
    image: AAC_IMAGES.communityTraining,
    accent: "#822929",
  },
  {
    step: "Scale",
    title: "Market activation",
    description:
      "Regenerative products meet consumers at HereAfrica — testing trust, traceability and demand in a collective, consumer-facing environment.",
    image: AAC_IMAGES.discoveryBooth,
    accent: "#ffd546",
  },
] as const

export const AAC_PRACTICE_ADOPTION = [
  { label: "Mulching", value: 88.9 },
  { label: "Composting", value: 84.7 },
  { label: "Farm waste reuse", value: 81.2 },
  { label: "Manure management", value: 78.5 },
  { label: "Seed saving", value: 75.0 },
  { label: "Crop rotation", value: 74.3 },
  { label: "Natural pest control", value: 73.6 },
  { label: "Water conservation", value: 72.2 },
] as const

export const AAC_UNDERSTANDING_BY_TOPIC = [
  { label: "Farm-waste reduction & reuse", value: 96.5 },
  { label: "Soil fertility (local resources)", value: 95.7 },
  { label: "Compost & manure management", value: 92.3 },
  { label: "Crop rotation & agroforestry", value: 90.8 },
  { label: "Natural pest management", value: 83.8 },
  { label: "Post-harvest handling", value: 77.7 },
  { label: "Market access", value: 60.6 },
] as const

export const AAC_BASELINE_CHALLENGES = [
  { label: "Climate & weather changes", value: 86.2 },
  { label: "High input costs", value: 84.8 },
  { label: "Pests & diseases", value: 81.4 },
  { label: "Water shortage", value: 71.0 },
  { label: "Low income from sales", value: 64.8 },
] as const

export const AAC_STAKEHOLDER_QUOTES = [
  {
    quote:
      "It's a simple shift with a big impact — beginning with minimal soil disturbance and building from there.",
    name: "Eunice Wainana",
    role: "Extension Officer, Kabete Sub-County",
    theme: "Knowledge that travels",
  },
  {
    quote:
      "The hardest part isn't the soil — it's the capital. Regenerative systems need financial instruments that recognise the time required for soil, tree and market systems to mature.",
    name: "Sven Verwiel",
    role: "Founder, Forest Foods",
    theme: "Financing regeneration",
  },
  {
    quote:
      "Good food has a story. Hear it here — the solutions already exist. The task ahead is building the partnerships that allow them to flourish.",
    name: "Dr. Keni Kariuki",
    role: "Director, Impact Hub Nairobi",
    theme: "Closing the loop",
  },
] as const

export const AAC_SUPPORT_NEEDS = [
  { label: "Access to finance", value: 61.1 },
  { label: "Extension support", value: 56.9 },
  { label: "Follow-up visits", value: 54.9 },
  { label: "More training", value: 54.9 },
] as const
