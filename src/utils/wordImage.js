// ─── Word image resolution with synonym mapping & tiered strategy ───

// Synonym mapping: search keyword → visual-safe synonym for image lookup
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
  // Common CET-4 nouns that benefit from images
  machine: 'industrial machine', factory: 'factory building', garden: 'flower garden',
  island: 'tropical island', village: 'small village', city: 'city skyline',
  ocean: 'ocean waves', desert: 'sand desert', forest: 'forest trees',
  beach: 'sandy beach', mountain: 'mountain range', valley: 'green valley',
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
  // More CET-4
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
  umbrella: 'colorful umbrella', camera: 'digital camera', telephone: 'vintage telephone',
  battery: 'battery cell', engine: 'car engine', wheel: 'car wheel',
  bridge: 'suspension bridge', tower: 'clock tower', wall: 'brick wall',
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

// Tier 1: Concrete nouns with reliable synonym mapping
const TIER1_WORDS = new Set(Object.keys(SYNONYM_MAP))

// Tier 3: Function words that should have NO image
const TIER3_POS = ['prep.', 'conj.', 'pron.', 'art.', 'num.', 'det.', 'interj.']

export function getWordImageTier(word) {
  const pos = (word.pos || '').toLowerCase()
  const base = word.word.toLowerCase()

  // Tier 3: function words
  if (TIER3_POS.some(p => pos.startsWith(p.replace('.','')))) return 3

  // Tier 1: has synonym mapping
  if (TIER1_WORDS.has(base)) return 1

  // Otherwise Tier 2
  return 2
}

export function getImageUrl(word) {
  const base = word.word.toLowerCase()
  const query = SYNONYM_MAP[base] || base
  return `https://source.unsplash.com/featured/400x300/?${encodeURIComponent(query)}`
}

export function getGradientColors(word) {
  const palettes = [
    ['from-blue-400 to-indigo-500', 'text-blue-50'],
    ['from-emerald-400 to-teal-500', 'text-emerald-50'],
    ['from-violet-400 to-purple-500', 'text-violet-50'],
    ['from-rose-400 to-pink-500', 'text-rose-50'],
    ['from-amber-400 to-orange-500', 'text-amber-50'],
    ['from-cyan-400 to-sky-500', 'text-cyan-50'],
  ]
  // Deterministic selection based on word
  const idx = word.word.length % palettes.length
  return palettes[idx]
}

// Icon name mapping for Tier 2 (verbs/adjectives)
export function getIconName(word) {
  const pos = (word.pos || '').toLowerCase()
  if (pos.startsWith('v')) return 'Zap'
  if (pos.startsWith('adj')) return 'Sparkles'
  if (pos.startsWith('adv')) return 'MoveRight'
  if (pos.startsWith('n')) return 'FileText'
  return 'HelpCircle'
}
