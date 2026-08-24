export const AAC_IMAGES = {
  hero: "/programs/aac/here-event/discovery-booth.jpg",
  discoveryBooth: "/programs/aac/here-event/discovery-booth.jpg",
  marketEvent: "/programs/aac/here-event/evening-tent.jpg",
  greenhouseGroup: "/programs/aac/greenhouse-group.png",
  greenhouseInterior: "/programs/aac/greenhouse-interior.png",
  fieldTraining: "/programs/aac/field-training.png",
  agroforestryLesson: "/programs/aac/agroforestry-lesson.png",
  plantingDemo: "/programs/aac/planting-demo.png",
  communityTraining: "/programs/aac/community-training.png",
  livingLabGroup: "/programs/aac/living-lab/group.jpg",
  livingLabCurriculum: "/programs/aac/living-lab/curriculum.jpg",
  livingLabWorkshop: "/programs/aac/living-lab/workshop.jpg",
  livingLabCircle: "/programs/aac/living-lab/circle.jpg",
  livingLabSeedBank: "/programs/aac/living-lab/seed-bank.jpg",
  livingLabSeedJars: "/programs/aac/living-lab/seed-jars.jpg",
  forestFoodMulch: "/programs/aac/forest-food/mulch-demo.jpg",
  forestFoodLeaf: "/programs/aac/forest-food/leaf-lesson.jpg",
  forestFoodPlanting: "/programs/aac/forest-food/planting-demo.jpg",
  forestFoodTogether: "/programs/aac/forest-food/planting-together.jpg",
  forestFoodConversation: "/programs/aac/forest-food/field-conversation.jpg",
  hereEventGroup: "/programs/aac/here-event/team-group.jpg",
  hereEventBooth: "/programs/aac/here-event/discovery-booth.jpg",
  hereEventBanners: "/programs/aac/here-event/banners.jpg",
  hereEventProduce: "/programs/aac/here-event/produce-box.jpg",
  hereEventEvening: "/programs/aac/here-event/evening-tent.jpg",
} as const

export type AacPhoto = {
  src: string
  alt: string
  caption: string
}

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
    detail:
      "150 farmers trained across Kikuyu, Kabete and Limuru; consumer activation generated the first outcome datasets.",
  },
] as const

export const AAC_FARMER_GUIDE = {
  href: "/programs/aac/farmer-guide.pdf",
  title: "A Simple Farmer's Guide — Understanding Regenerative and Circular Farming",
  subtitle:
    "Based on the AAC Pilot A training curriculum at Sylvia's Basket Farm, Ndeiya, Kiambu. Written for farmers and walked through by extension officers.",
} as const

export const AAC_PILOT_A_CURRICULUM = [
  {
    chapter: "1",
    title: "What is regenerative and circular farming?",
    summary:
      "Circular farming brings waste, cost and risk back into use on the farm. Regenerative farming leaves land healthier each year. Together they mean less waste, a stronger farm, more income, and more nutritious food.",
  },
  {
    chapter: "2",
    title: "Five principles",
    summary: "A practical spine for the field — not a rigid package.",
    items: [
      "Disturb the soil as little as possible",
      "Keep the soil covered",
      "Keep living roots in the soil",
      "Grow many kinds of plants",
      "Bring animals back onto the land",
    ],
  },
  {
    chapter: "3",
    title: "Soil as the foundation",
    summary:
      "Soil is alive. Farmers learn four field questions — can water get in, can air get in, can roots grow deep, and are living things present — and the practice of feeding the soil, not just the plant.",
  },
  {
    chapter: "4",
    title: "Farm loops",
    summary: "What already exists on the farm can cycle back into production.",
    items: [
      "Nutrient loop — manure and compost",
      "Water loop — hold moisture, cut waste",
      "Seed loop — save from the healthiest plants",
      "Biodiversity and pest loop — mix crops, observe before spraying",
      "Livestock loop — housing, feed, and safe manure handling",
      "Energy and biomass loop — mulch and compost, not burning",
      "Home-made inputs — compost teas and sprays as a complement, not a substitute",
    ],
  },
  {
    chapter: "5",
    title: "Why this matters — and first steps",
    summary:
      "Lower input costs, less water work, less risk, stronger land over time, safer food, and trust with buyers. Farmers do not need to change everything at once: start with soil, one compost heap, cover bare ground, save seed, and fix one water loss.",
  },
] as const

export const AAC_PILOTS = [
  {
    id: "pilot-a",
    name: "Pilot A",
    title: "Building Capacity Through the Extension System",
    description:
      "Pilot A tested whether practical, farm-based learning — delivered through Kenya's existing public extension system — could build farmer capacity in regenerative and circular agriculture at pace. The training cohort was 150 farmers in Kiambu County.",
    overview:
      "The Live-in Lab sat at Sylvia's Basket / Kilimo Endelevu Farm in Ndeiya. Five extension workers from Limuru, Kabete and Kikuyu took part, with support from the Kiambu County Director of Agriculture. Officers then carried a shared curriculum into farmer training across those three sub-counties. Baseline and endline surveys captured learning among 145 and 144 records respectively; 99.3% of surveyed farmers attended all or part of the training.",
    facts: [
      { label: "Farmers trained", value: "150" },
      { label: "Sub-counties", value: "Kikuyu, Kabete, Limuru" },
      { label: "Extension officers", value: "5, plus County Director of Agriculture" },
      { label: "Host farm", value: "Sylvia's Basket / Kilimo Endelevu, Ndeiya" },
    ],
    howItWorked: [
      "Extension officers first learned on a working circular farm, not only in a classroom.",
      "Delivery ran through the county extension pathway so knowledge could travel after the pilot.",
      "150 farmers were trained on the same regenerative and circular curriculum.",
      "Learning was measured with baseline and endline surveys, including planned farm changes.",
    ],
    highlights: [
      "150 farmers trained · 145 baseline records · 144 endline records",
      "Average understanding score: 3.32 / 4 (83.1%)",
      "Average confidence score: 3.54 / 5 (70.8%)",
      "Top planned practices: mulching (88.9%), composting (84.7%), farm-waste reuse (81.2%)",
    ],
    image: AAC_IMAGES.livingLabGroup,
  },
  {
    id: "pilot-b",
    name: "Pilot B",
    title: "Testing Consumer Demand, Trust & Market Access",
    description:
      "Pilot B asked a market question: will consumers recognise, trust and pay for regenerative and circular products when producers appear together — with a shared story — rather than as isolated brands?",
    overview:
      "The test was a hybrid consumer activation at the HereAfrica Food and Drink Festival: shared marketing, trust-building and face-to-face conversation. Forest Foods, Kaijuju and Sylvia's Basket joined six discovery booths in front of 600+ attendees. A short consumer survey (n=21) captured willingness to pay, follow-up interest and purchase motivations. The sample is small, so the results are directional evidence for Year Two, not a full market study.",
    facts: [
      { label: "Event", value: "HereAfrica Food & Drink Festival" },
      { label: "Discovery booths", value: "6" },
      { label: "Attendees", value: "600+" },
      { label: "Producers", value: "Forest Foods, Kaijuju, Sylvia's Basket" },
    ],
    howItWorked: [
      "Producers showed up as a collective regenerative presence, not competing one-off stalls.",
      "Discovery booths let visitors taste, ask how food is grown, and meet the people behind it.",
      "Conversation focused on health, taste, freshness and credible claims — the trust gap the Working Group had named.",
      "Interest in follow-up (events, markets, farm visits) was captured to test whether attention could become a relationship.",
    ],
    highlights: [
      "95.2% willing or maybe willing to pay slightly more (n=21)",
      "61.9% requested follow-up after the expo",
      "100% interested in future engagement (events, markets, farm visits)",
      "Health, taste and freshness were the strongest purchase motivations",
    ],
    image: AAC_IMAGES.hereEventBooth,
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
      "Pilot A combined county-linked extension participation with practical learning and an onward cohort of 150 farmers across Kikuyu, Kabete and Limuru.",
    evidence: "150 farmers trained · 145 baseline and 144 endline records · 99.3% attendance",
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

export const AAC_LIVING_LAB_PHOTOS: AacPhoto[] = [
  {
    src: AAC_IMAGES.livingLabGroup,
    alt: "Participants of the AAC Live-in Lab posing with the Advancing Agricultural Circularity banner",
    caption: "Live-in Lab cohort at Sylvia's Basket / Kilimo Endelevu Farm, Ndeiya",
  },
  {
    src: AAC_IMAGES.livingLabCurriculum,
    alt: "Facilitator presenting the five principles of regenerative agriculture on a flipchart",
    caption: "Curriculum in the tent — regenerative principles and a closed farming loop",
  },
  {
    src: AAC_IMAGES.livingLabWorkshop,
    alt: "Four participants writing Advancing Agricultural Circularity notes during a workshop",
    caption: "Co-creating ideas at the Live-in Lab — nothing goes to waste",
  },
  {
    src: AAC_IMAGES.livingLabCircle,
    alt: "Farmers seated in a circle outdoors during an AAC living-lab discussion",
    caption: "Peer learning in the field — farmers working through the curriculum together",
  },
  {
    src: AAC_IMAGES.livingLabSeedBank,
    alt: "Three women standing in front of the seed bank building at the living lab",
    caption: "The seed bank at the Live-in Lab — saving diversity for the next season",
  },
  {
    src: AAC_IMAGES.livingLabSeedJars,
    alt: "Glass jars of saved seeds on a wooden shelf with a sign about planting hope for the future",
    caption: "Community seed store — every saved seed plants hope for the future",
  },
]

export const AAC_FOREST_FOOD_PHOTOS: AacPhoto[] = [
  {
    src: AAC_IMAGES.forestFoodMulch,
    alt: "Facilitator explaining mulched raised beds to a group at Forest Foods",
    caption: "Closing the Loop at Forest Food — mulching and closing nutrient loops, 4 July 2026",
  },
  {
    src: AAC_IMAGES.forestFoodLeaf,
    alt: "Farm host holding up a green leaf while visitors take notes in the field",
    caption: "Farm Showcase — reading plant health in the field at Forest Foods",
  },
  {
    src: AAC_IMAGES.forestFoodPlanting,
    alt: "Participants planting a sapling together during the Forest Foods farm showcase",
    caption: "Hands-on planting — learning by doing along the farm rows",
  },
  {
    src: AAC_IMAGES.forestFoodTogether,
    alt: "Two people packing soil around a newly planted sapling at Forest Foods",
    caption: "Planting together — regenerative practice shared between partners and visitors",
  },
  {
    src: AAC_IMAGES.forestFoodConversation,
    alt: "Visitor kneeling beside a sapling while talking with others in the field",
    caption: "Field conversation — questions, soil and young trees at the Farm Showcase",
  },
]

export const AAC_HERE_EVENT_PHOTOS: AacPhoto[] = [
  {
    src: AAC_IMAGES.hereEventBooth,
    alt: "AAC Discovery Booth at HereAfrica with partner produce and banners",
    caption: "Discovery Booth — HereAfrica Food & Drink Festival, Nairobi, 13 June 2026",
  },
  {
    src: AAC_IMAGES.hereEventGroup,
    alt: "AAC team and partners posing in front of the Discovery Booth tents",
    caption: "Closing the loop, together — the AAC presence at HereAfrica",
  },
  {
    src: AAC_IMAGES.hereEventBanners,
    alt: "Participant standing between AAC banners reading Food has a story",
    caption: "Good food has a story — AAC storytelling at the festival",
  },
  {
    src: AAC_IMAGES.hereEventProduce,
    alt: "Open Forest Foods box filled with fresh regenerative produce on the grass",
    caption: "Forest Foods produce at the booth — regenerative harvest meeting consumers",
  },
  {
    src: AAC_IMAGES.hereEventEvening,
    alt: "Evening gathering under a lit marquee tent with communal tables at HereAfrica",
    caption: "Festival atmosphere — shared tables, stalls and regenerative food stories",
  },
]

export const AAC_STORY_GALLERY: AacPhoto[] = [
  ...AAC_LIVING_LAB_PHOTOS,
  ...AAC_FOREST_FOOD_PHOTOS,
  ...AAC_HERE_EVENT_PHOTOS,
  {
    src: AAC_IMAGES.fieldTraining,
    alt: "Field training session on regenerative agriculture",
    caption: "Learning by seeing — practical field training with extension officers and farmers",
  },
  {
    src: AAC_IMAGES.greenhouseInterior,
    alt: "Circular farming systems inside a greenhouse",
    caption: "Circular systems — aquaculture ponds and integrated crops",
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
]

export const AAC_STORY_ANGLES = [
  "From the living lab to farmers' fields",
  "Regenerative practice in Limuru",
  "Learning by seeing at Forest Foods",
  "Circular inputs need demand",
  "Financing regeneration",
  "Knowledge that travels — extension officers as storytellers",
  "AAC at the HereAfrica festival",
] as const

export type AacPartner = {
  name: string
  logo: string
  href?: string
  /** Logo artwork is designed for a dark background */
  onDark?: boolean
}

export const AAC_PARTNERS: AacPartner[] = [
  {
    name: "Digital Green",
    logo: "/programs/aac/partners/digital-green.png",
    href: "https://www.digitalgreen.org",
  },
  {
    name: "Chemichemi Organics",
    logo: "/programs/aac/partners/chemi-chemi-organic.png",
  },
  {
    name: "Dimitri Food",
    logo: "/programs/aac/partners/dimitri-food.png",
  },
  {
    name: "AgriFlex",
    logo: "/programs/aac/partners/agriflex.png",
  },
  {
    name: "NutriMzuri",
    logo: "/programs/aac/partners/nutrimzuri.png",
    onDark: true,
  },
  {
    name: "GGGI",
    logo: "/programs/aac/partners/gggi.png",
    href: "https://gggi.org",
    onDark: true,
  },
  {
    name: "Forest Foods",
    logo: "/programs/aac/partners/forest-foods.png",
    onDark: true,
  },
  {
    name: "SYSTEMIQ",
    logo: "/programs/aac/partners/systemiq.png",
    href: "https://www.systemiq.earth",
  },
  {
    name: "Green Intelligence",
    logo: "/programs/aac/partners/green-intelligence.png",
    onDark: true,
  },
  {
    name: "ICRW",
    logo: "/programs/aac/partners/icrw.png",
    href: "https://www.icrw.org",
  },
  {
    name: "griincom",
    logo: "/programs/aac/partners/griincom.png",
  },
  {
    name: "JBQ Africa",
    logo: "/programs/aac/partners/jbq-africa.png",
  },
  {
    name: "Kenya Climate Innovation Center",
    logo: "/programs/aac/partners/kcic.png",
    href: "https://www.kenyacic.org",
    onDark: true,
  },
  {
    name: "Inspire Nature Consulting Africa",
    logo: "/programs/aac/partners/inspire-nature.png",
    onDark: true,
  },
  {
    name: "Kuza",
    logo: "/programs/aac/partners/kuza.png",
    href: "https://www.kuza.one",
  },
  {
    name: "Sylvia's Basket",
    logo: "/programs/aac/partners/sylvias-basket.png",
    onDark: true,
  },
  {
    name: "Vi Agroforestry",
    logo: "/programs/aac/partners/vi-agroforestry.png",
    href: "https://viagroforestry.org",
  },
  {
    name: "R&S Farms",
    logo: "/programs/aac/partners/rs-farms.png",
  },
  {
    name: "IBMA Kenya",
    logo: "/programs/aac/partners/ibma-kenya.png",
    onDark: true,
  },
  {
    name: "IFJAD",
    logo: "/programs/aac/partners/ifjad.png",
    onDark: true,
  },
]

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
  { id: "working-group", label: "Working Group" },
  { id: "partners", label: "Partners" },
] as const

export const AAC_STORY_ARC = [
  {
    step: "Learn",
    title: "Live-in Lab",
    description:
      "Extension officers encounter practical, farm-tested regenerative methods at Sylvia's Basket Farm — then carry that knowledge into communities.",
    image: AAC_IMAGES.livingLabCurriculum,
    accent: "#7ebb55",
  },
  {
    step: "Apply",
    title: "Farmer training",
    description:
      "150 farmers across Kikuyu, Kabete and Limuru adapt regenerative practices — mulching, composting, farm-waste reuse and more.",
    image: AAC_IMAGES.livingLabCircle,
    accent: "#41bed0",
  },
  {
    step: "Connect",
    title: "Ecosystem exchange",
    description:
      "Working Group members, producers and partners compare evidence, build confidence and co-design the next phase together.",
    image: AAC_IMAGES.forestFoodMulch,
    accent: "#822929",
  },
  {
    step: "Scale",
    title: "Market activation",
    description:
      "Regenerative products meet consumers at HereAfrica — testing trust, traceability and demand in a collective, consumer-facing environment.",
    image: AAC_IMAGES.hereEventBooth,
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
