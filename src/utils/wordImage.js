// ─── Tiered word image strategy ───
//
// Tier 0 (HIGH_FREQ): Top 20% high-frequency concrete nouns → Unsplash HD
// Tier 1 (CONCRETE):  Regular concrete nouns → Unsplash standard
// Tier 2 (ABSTRACT):  Abstract nouns / concepts → AI-generated via Pollinations.ai
// Tier 3 (VERB_ADJ):  Verbs, adjectives, adverbs → gradient color block + Lucide icon
// Tier 4 (FUNCTION):  Function words (prep, conj, etc.) → no image (hidden)

const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt'

// ─── Synonym map: search keyword → visual-safe query for Unsplash ───
const SYNONYM_MAP = {
  // Animals
  dog: 'puppy', cat: 'kitten', bird: 'sparrow', fish: 'aquarium', horse: 'mare',
  cow: 'cattle', sheep: 'lamb', pig: 'piglet', lion: 'lion', tiger: 'tiger',
  elephant: 'elephant', monkey: 'monkey', bear: 'bear', rabbit: 'rabbit', mouse: 'mouse',
  // Nature
  flower: 'blossom', tree: 'oak', river: 'stream', mountain: 'peak', sea: 'ocean',
  rain: 'raindrops', snow: 'snowflake', wind: 'breeze', sun: 'sunlight', moon: 'moonlight',
  star: 'night sky', cloud: 'clouds', fire: 'campfire', water: 'water drops', earth: 'globe',
  // Food
  apple: 'red apple', bread: 'fresh bread', milk: 'glass of milk', egg: 'eggs',
  rice: 'rice bowl', meat: 'steak', cake: 'chocolate cake', fruit: 'fruit bowl',
  vegetable: 'fresh vegetables', sugar: 'sugar cubes', salt: 'salt crystals',
  // Body
  hand: 'human hand', eye: 'human eye', ear: 'ear', nose: 'human nose', mouth: 'smile',
  head: 'person head', heart: 'heart shape', foot: 'human foot', hair: 'hairstyle',
  face: 'human face', skin: 'skin texture', bone: 'skeleton', blood: 'blood drops',
  // Home
  chair: 'wooden chair', table: 'wooden table', door: 'wooden door', window: 'window frame',
  bed: 'bedroom', lamp: 'desk lamp', clock: 'wall clock', phone: 'smartphone',
  book: 'open book', pen: 'fountain pen', key: 'metal key', mirror: 'mirror reflection',
  // City
  car: 'red car', bus: 'city bus', train: 'railway train', plane: 'airplane',
  road: 'highway', bridge: 'suspension bridge', building: 'skyscraper', house: 'cottage',
  shop: 'storefront', market: 'farmers market', park: 'city park', bank: 'bank building',
  school: 'school building', hospital: 'hospital', library: 'library interior',
  // Technology
  computer: 'laptop', screen: 'computer screen', camera: 'camera lens', radio: 'vintage radio',
  television: 'tv screen', internet: 'wi-fi signal', robot: 'white robot',
  remote: 'television remote controller',
  plastic: 'recycling plastic texture',
  // Clothes
  shirt: 'dress shirt', shoes: 'sneakers', hat: 'straw hat', coat: 'winter coat',
  dress: 'elegant dress', watch: 'wristwatch', ring: 'gold ring', glasses: 'eyeglasses',
  // Sport
  ball: 'soccer ball', game: 'board game', race: 'running race', sport: 'sports equipment',
  swim: 'swimming pool', run: 'running shoes', jump: 'jumping person',
  // Music
  music: 'musical notes', song: 'microphone', dance: 'dancing silhouette',
  instrument: 'musical instrument', piano: 'piano keys', guitar: 'acoustic guitar',
  // Abstract visuals
  map: 'world map', picture: 'framed picture', circle: 'geometric circle',
  line: 'straight line', color: 'color palette', light: 'light bulb',
  // Common CET-4 nouns
  machine: 'industrial machine', factory: 'factory building', garden: 'flower garden',
  island: 'tropical island', village: 'small village', city: 'city skyline',
  ocean: 'ocean waves', desert: 'sand desert', forest: 'forest trees',
  beach: 'sandy beach', valley: 'green valley',
  newspaper: 'newspaper pages', magazine: 'magazine cover', letter: 'envelope letter',
  stamp: 'postage stamp', coin: 'gold coin', money: 'currency bills',
  ticket: 'airline ticket', passport: 'passport document', bag: 'leather bag',
  bottle: 'glass bottle', cup: 'coffee cup', plate: 'ceramic plate',
  knife: 'kitchen knife', fork: 'dining fork', spoon: 'metal spoon',
  candle: 'lit candle', soap: 'soap bar', towel: 'folded towel',
  blanket: 'warm blanket', pillow: 'white pillow', curtain: 'window curtains',
  // CET-4 specific
  campus: 'university campus', dormitory: 'dorm room', graduate: 'graduation cap',
  scholarship: 'scholarship medal', professor: 'professor teaching', lecture: 'lecture hall',
  exam: 'exam paper', score: 'test score', degree: 'diploma',
  environment: 'green nature', pollution: 'air pollution', nature: 'natural landscape',
  population: 'crowd of people', society: 'people community', culture: 'cultural art',
  economy: 'economic graph', industry: 'industrial plant', technology: 'technology circuit',
  science: 'science lab', research: 'research microscope', education: 'education books',
  health: 'healthy lifestyle', energy: 'energy light', resource: 'natural resources',
  material: 'construction materials', product: 'product display', customer: 'shopping customer',
  service: 'customer service', company: 'office building', business: 'business meeting',
  job: 'job interview', career: 'career ladder', office: 'office workspace',
  team: 'teamwork group', leader: 'team leader', manager: 'business manager',
  meeting: 'meeting room', report: 'business report', plan: 'planning board',
  project: 'project planning', goal: 'target goal', success: 'success achievement',
  accident: 'car accident', storm: 'thunder storm', flood: 'flood water',
  earthquake: 'earthquake damage', fire: 'fire flame', disease: 'medical research',
  treatment: 'medical treatment', medicine: 'medicine pills', surgery: 'surgery room',
  patient: 'hospital patient', doctor: 'doctor medical', nurse: 'nurse hospital',
  // Transport
  bicycle: 'bicycle outdoor', taxi: 'yellow taxi', truck: 'delivery truck',
  ship: 'cargo ship', boat: 'sail boat', airport: 'airport terminal',
  station: 'train station', highway: 'highway road', traffic: 'traffic jam',
  // Place
  restaurant: 'restaurant dining', hotel: 'hotel building', museum: 'museum interior',
  theater: 'theater stage', cinema: 'movie theater', stadium: 'sports stadium',
  church: 'church building', temple: 'ancient temple', square: 'town square',
  // Object
  umbrella: 'colorful umbrella', battery: 'battery cell', engine: 'car engine',
  wheel: 'car wheel', tower: 'clock tower', wall: 'brick wall',
  floor: 'wooden floor', roof: 'house roof', gate: 'garden gate',
  fence: 'wooden fence', path: 'garden path', corner: 'street corner',
  // Clothing accessory
  necklace: 'gold necklace', bracelet: 'silver bracelet', earring: 'diamond earring',
  belt: 'leather belt', wallet: 'leather wallet', purse: 'handbag purse',
  // Food extended
  coffee: 'coffee cup', tea: 'tea cup', juice: 'orange juice', wine: 'red wine glass',
  beer: 'beer glass', cheese: 'cheese plate', butter: 'butter spread',
  chicken: 'roasted chicken', beef: 'grilled beef', pork: 'pork dish',
  // Sports extended
  football: 'american football', basketball: 'basketball game', tennis: 'tennis ball',
  golf: 'golf course', skiing: 'ski slope', cycling: 'road cycling',
  // Nature extended
  leaf: 'green leaf', grass: 'grass field', rock: 'large rock', stone: 'smooth stone',
  sand: 'sand texture', mud: 'mud puddle', dust: 'dust particles', smoke: 'smoke cloud',
}

// ─── Top 20% high-frequency concrete nouns (visually rich, highly recallable) ───
const HIGH_FREQ_CONCRETE = new Set([
  'water','food','book','school','house','city','road','car','tree','flower',
  'river','mountain','sea','sun','moon','star','hand','eye','head','face',
  'door','window','table','chair','bed','room','wall','street','shop','market',
  'park','garden','letter','map','music','picture','color','light','paper',
  'money','coin','key','bag','box','cup','bottle','plate','knife','fork',
  'spoon','clock','phone','computer','camera','wheel','bridge','boat','ship',
  'plane','train','bus','bike','ball','game','song','dance','film','book',
  'friend','family','child','teacher','doctor','nurse','student','leader',
  'team','group','world','country','city','town','farm','office','bank',
  'hospital','school','hotel','restaurant','station','airport','beach','island',
  'forest','desert','lake','river','mountain','ocean','road','street','wall',
  'gate','roof','floor','pen','clock','watch','phone','computer','camera',
  'television','radio','lamp','mirror','key','umbrella','candle','towel','soap',
])

// ─── Function word POS markers ───
const FUNCTION_POS = ['prep.', 'conj.', 'pron.', 'art.', 'num.', 'det.', 'interj.', 'int.']

// ─── Abstract word → AI prompt for Pollinations.ai ───
const ABSTRACT_PROMPTS = {
  freedom: 'minimalist vector illustration of a bird flying out of an open cage, flat design, clean white background',
  justice: 'minimalist vector illustration of balanced scales, flat design, clean background',
  peace: 'minimalist vector of a white dove with olive branch, flat design, clean background',
  love: 'minimalist vector of two hearts intertwined, flat design style, clean background',
  hope: 'minimalist vector illustration of a sunrise over horizon, flat design, clean background',
  truth: 'minimalist vector of a magnifying glass over document, flat design, clean background',
  wisdom: 'minimalist vector of an owl sitting on open book, flat design, clean background',
  knowledge: 'minimalist vector of an open book with glowing light, flat design, clean background',
  power: 'minimalist vector of a lightning bolt, flat design, clean background',
  strength: 'minimalist vector of a flexed arm, flat design, clean background',
  courage: 'minimalist vector of a person standing alone on a cliff, flat design, clean background',
  honor: 'minimalist vector of a medal on a ribbon, flat design, clean background',
  glory: 'minimalist vector of a laurel wreath crown, flat design, clean background',
  spirit: 'minimalist vector of a glowing flame, flat design style, clean background',
  soul: 'minimalist vector illustration of a glowing silhouette, flat design, dark clean background',
  faith: 'minimalist vector of hands clasped in prayer, flat design, clean background',
  fate: 'minimalist vector of a winding path splitting in two, flat design, clean background',
  dream: 'minimalist vector of a person sleeping under a starry sky, flat design, clean background',
  memory: 'minimalist vector of a polaroid photo fading, flat design, clean background',
  thought: 'minimalist vector of a head silhouette with a lightbulb, flat design, clean background',
  idea: 'minimalist vector of a glowing lightbulb, flat design style, clean background',
  mind: 'minimalist vector of a brain connected to floating thoughts, flat design, clean background',
  time: 'minimalist vector of an hourglass with sand falling, flat design, clean background',
  life: 'minimalist vector of a seed growing into a tree, flat design, clean background',
  death: 'minimalist vector of a fallen leaf on ground, flat design, clean background',
  nature: 'minimalist vector landscape with trees mountains river, flat design, clean background',
  beauty: 'minimalist vector of a blooming flower, flat design style, clean background',
  art: 'minimalist vector of a paint palette with brush, flat design, clean background',
  culture: 'minimalist vector of diverse people in a circle, flat design, clean background',
  history: 'minimalist vector of stacked ancient scrolls, flat design, clean background',
  future: 'minimalist vector of a person looking at a glowing horizon, flat design, clean background',
  past: 'minimalist vector of a winding road fading into distance sepia, flat design, clean background',
  world: 'minimalist vector of planet earth, flat design style, clean background',
  universe: 'minimalist vector of stars and galaxies, flat design, dark background',
  space: 'minimalist vector of a rocket in starry space, flat design, clean background',
  science: 'minimalist vector of a microscope and molecules, flat design, clean background',
  technology: 'minimalist vector of circuit board patterns, flat design, clean background',
  progress: 'minimalist vector of an upward arrow graph, flat design, clean background',
  development: 'minimalist vector of building blocks stacking up, flat design, clean background',
  growth: 'minimalist vector of a plant growing through stages, flat design, clean background',
  success: 'minimalist vector of a person on mountain peak holding trophy, flat design, clean background',
  happiness: 'minimalist vector of a smiling sun with rainbow, flat design, clean background',
  sadness: 'minimalist vector of a person sitting under rain cloud, flat design, clean background',
  anger: 'minimalist vector of a red exploding volcano, flat design, clean background',
  fear: 'minimalist vector of a person casting long shadow, flat design, clean background',
  surprise: 'minimalist vector of a jack-in-the-box popping out, flat design, clean background',
  trust: 'minimalist vector of two hands shaking, flat design style, clean background',
  respect: 'minimalist vector of a person bowing respectfully, flat design, clean background',
  pride: 'minimalist vector of a person standing tall with chest out, flat design, clean background',
  humility: 'minimalist vector of a person sitting on ground looking down, flat design, clean background',
  patience: 'minimalist vector of a person meditating zen, flat design, clean background',
  kindness: 'minimalist vector of a hand helping another up, flat design, clean background',
  generosity: 'minimalist vector of hands giving a gift box, flat design, clean background',
  honesty: 'minimalist vector of an open hand showing palm, flat design, clean background',
  loyalty: 'minimalist vector of a dog sitting faithfully, flat design, clean background',
  friendship: 'minimalist vector of two people arm in arm, flat design, clean background',
  education: 'minimalist vector of a graduation cap on books, flat design, clean background',
  learning: 'minimalist vector of a brain absorbing book pages, flat design, clean background',
  study: 'minimalist vector of a desk with lamp open notebook, flat design, clean background',
  effort: 'minimalist vector of a person climbing a steep hill, flat design, clean background',
  challenge: 'minimalist vector of a person at the base of a tall wall, flat design, clean background',
  opportunity: 'minimalist vector of an open doorway with light beyond, flat design, clean background',
  choice: 'minimalist vector of a crossroads signpost, flat design, clean background',
  decision: 'minimalist vector of a hand placing a chess piece, flat design, clean background',
  problem: 'minimalist vector of a tangled knot of yarn, flat design, clean background',
  solution: 'minimalist vector of puzzle pieces clicking together, flat design, clean background',
  answer: 'minimalist vector of a hand raising with confidence, flat design, clean background',
  question: 'minimalist vector of a large question mark, flat design, clean background',
  reason: 'minimalist vector of a chain of logical links, flat design, clean background',
  result: 'minimalist vector of a line graph trending upward, flat design, clean background',
  effect: 'minimalist vector of dropping a stone in water with ripples, flat design, clean background',
  cause: 'minimalist vector of dominoes falling in sequence, flat design, clean background',
  difference: 'minimalist vector of two contrasting shapes side by side, flat design, clean background',
  advantage: 'minimalist vector of a person standing on a platform looking ahead, flat design, clean background',
  benefit: 'minimalist vector of a gift box with hearts, flat design, clean background',
  value: 'minimalist vector of a diamond gemstone, flat design, clean background',
  quality: 'minimalist vector of a star rating badge, flat design, clean background',
  standard: 'minimalist vector of a measuring ruler against a line, flat design, clean background',
  level: 'minimalist vector of a layered pyramid, flat design, clean background',
  position: 'minimalist vector of numbered steps on a podium, flat design, clean background',
  rank: 'minimalist vector of a military insignia badge, flat design, clean background',
  status: 'minimalist vector of a leaderboard with crown, flat design, clean background',
  role: 'minimalist vector of a theater mask and costume, flat design, clean background',
  duty: 'minimalist vector of a checklist with completed items, flat design, clean background',
  responsibility: 'minimalist vector of a person carrying a globe on shoulders, flat design, clean background',
  right: 'minimalist vector of a raised fist with a checkmark, flat design, clean background',
  rule: 'minimalist vector of a book of rules with bookmark, flat design, clean background',
  law: 'minimalist vector of a judge gavel on block, flat design, clean background',
  order: 'minimalist vector of neatly arranged rows of objects, flat design, clean background',
  peace: 'minimalist vector of a dove with an olive branch, flat design, clean background',
  war: 'minimalist vector of a cracked battlefield with flags, flat design, clean background',
  conflict: 'minimalist vector of two arrows pointing at each other, flat design, clean background',
  agreement: 'minimalist vector of a signed document with handshake, flat design, clean background',
  communication: 'minimalist vector of speech bubbles between two people, flat design, clean background',
  information: 'minimalist vector of a folder with documents and data streams, flat design, clean background',
  news: 'minimalist vector of a newspaper with breaking news banner, flat design, clean background',
  story: 'minimalist vector of an open storybook with castle scene, flat design, clean background',
  experience: 'minimalist vector of a backpack with travel stamps, flat design, clean background',
  practice: 'minimalist vector of a person sharpening a pencil, flat design, clean background',
  theory: 'minimalist vector of a chalkboard with formulas, flat design, clean background',
  method: 'minimalist vector of step-by-step flowchart, flat design, clean background',
  system: 'minimalist vector of interconnected gear wheels, flat design, clean background',
  process: 'minimalist vector of a conveyor belt with items, flat design, clean background',
  chance: 'minimalist vector of rolling dice on a table, flat design, clean background',
  luck: 'minimalist vector of a four-leaf clover, flat design style, clean background',
  risk: 'minimalist vector of a person walking on a tightrope, flat design, clean background',
  danger: 'minimalist vector of a caution yellow warning sign, flat design, clean background',
  safety: 'minimalist vector of a shield with checkmark, flat design, clean background',
  protection: 'minimalist vector of an umbrella sheltering from rain, flat design, clean background',
  comfort: 'minimalist vector of a cozy armchair with blanket, flat design, clean background',
  luxury: 'minimalist vector of a champagne glass with bubbles, flat design, clean background',
  wealth: 'minimalist vector of stacks of gold coins, flat design, clean background',
  poverty: 'minimalist vector of an empty bowl, flat design style, clean background',
}

// ─── Gradient palette pool ───
const PALETTES = [
  ['from-blue-400 to-indigo-500', 'text-blue-50'],
  ['from-emerald-400 to-teal-500', 'text-emerald-50'],
  ['from-violet-400 to-purple-500', 'text-violet-50'],
  ['from-rose-400 to-pink-500', 'text-rose-50'],
  ['from-amber-400 to-orange-500', 'text-amber-50'],
  ['from-cyan-400 to-sky-500', 'text-cyan-50'],
  ['from-fuchsia-400 to-pink-600', 'text-fuchsia-50'],
  ['from-lime-400 to-green-500', 'text-lime-50'],
]

// ─── POS → Lucide icon ───
const POS_ICON = {
  v:   'Zap',
  vi:  'Zap',
  vt:  'Zap',
  adj: 'Sparkles',
  adv: 'MoveRight',
  n:   'FileText',
}

// ─── Tiers ───
export const TIER = {
  HIGH_FREQ: 0,
  CONCRETE:  1,
  ABSTRACT:  2,
  VERB_ADJ:  3,
  FUNCTION:  4,
}

export function getWordImageTier(word) {
  const pos = (word.pos || '').toLowerCase().replace('.', '')
  const base = word.word.toLowerCase()

  // Tier 4: function words → no image
  if (FUNCTION_POS.some(p => p.startsWith(pos))) return TIER.FUNCTION

  // Tier 0: high-frequency concrete nouns
  if (HIGH_FREQ_CONCRETE.has(base)) return TIER.HIGH_FREQ

  // Tier 1: concrete nouns (in synonym map)
  if (SYNONYM_MAP.hasOwnProperty(base)) return TIER.CONCRETE

  // Tier 2: abstract nouns
  if (pos === 'n') return TIER.ABSTRACT

  // Tier 3: verbs, adjectives, adverbs
  return TIER.VERB_ADJ
}

// ─── Unsplash URL (concrete nouns) ───
export function getUnsplashUrl(word) {
  const base = word.word.toLowerCase()
  const query = SYNONYM_MAP[base] || base
  return `https://source.unsplash.com/featured/400x300/?${encodeURIComponent(query)}`
}

// ─── Pollinations.ai URL (abstract nouns) ───
export function getPollinationsUrl(word) {
  const base = word.word.toLowerCase()
  const custom = ABSTRACT_PROMPTS[base]
  if (custom) {
    return `${POLLINATIONS_BASE}/${encodeURIComponent(custom)}?width=400&height=300&nofeed=true`
  }
  // Generic: use word definition to guide AI
  const def = (word.definition || '').slice(0, 80)
  const prompt = `minimalist vector illustration representing "${def}", flat design style, clean white background, simple geometric shapes`
  return `${POLLINATIONS_BASE}/${encodeURIComponent(prompt)}?width=400&height=300&nofeed=true&seed=${encodeURIComponent(base)}`
}

// ─── Gradient + icon (verbs / adjectives) ───
export function getGradientColors(word) {
  const idx = word.word.length % PALETTES.length
  return PALETTES[idx]
}

export function getIconName(word) {
  const pos = (word.pos || '').toLowerCase().replace('.', '')
  // Try matching start: 'v' matches 'v.', 'vi.', 'vt.'
  for (const [key, icon] of Object.entries(POS_ICON)) {
    if (pos.startsWith(key)) return icon
  }
  return 'HelpCircle'
}
