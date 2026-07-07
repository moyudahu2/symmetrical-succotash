export const SKINS = [
  {
    id: 'default_blue',
    name: '深海摸鱼蓝',
    cost: 0,
    colors: {
      primary: '#4A90E2',
      'primary-light': '#E8F0FE',
      bg: '#F0F8FF',
      card: '#FFFFFF',
      accent: '#A78BFA',
    },
  },
  {
    id: 'cyber_fish',
    name: '赛博咸鱼紫',
    cost: 50,
    colors: {
      primary: '#9B59B6',
      'primary-light': '#F0E6F6',
      bg: '#1A1A2E',
      card: '#16213E',
      accent: '#E94560',
    },
  },
  {
    id: 'forest_frog',
    name: '青蛙王子绿',
    cost: 80,
    colors: {
      primary: '#2ECC71',
      'primary-light': '#E8F8F0',
      bg: '#F0FFF4',
      card: '#FFFFFF',
      accent: '#F39C12',
    },
  },
  {
    id: 'tangerine',
    name: '橘子汽水橙',
    cost: 120,
    colors: {
      primary: '#FF6B35',
      'primary-light': '#FFF0E8',
      bg: '#FFF8F0',
      card: '#FFFFFF',
      accent: '#FFD166',
    },
  },
  {
    id: 'midnight_squid',
    name: '墨鱼汁暗夜',
    cost: 200,
    colors: {
      primary: '#6C63FF',
      'primary-light': '#EEECFF',
      bg: '#0F0F23',
      card: '#1A1A3E',
      accent: '#FF6584',
    },
  },
]

export const SKIN_STORAGE_KEY = 'skin_unlocked'
export const SKIN_EQUIPPED_KEY = 'skin_equipped'

export function loadUnlocked() {
  try {
    const raw = localStorage.getItem(SKIN_STORAGE_KEY)
    return raw ? JSON.parse(raw) : ['default_blue']
  } catch { return ['default_blue'] }
}

export function saveUnlocked(ids) {
  try { localStorage.setItem(SKIN_STORAGE_KEY, JSON.stringify(ids)) } catch {}
}

export function loadEquipped() {
  try { return localStorage.getItem(SKIN_EQUIPPED_KEY) || 'default_blue' } catch { return 'default_blue' }
}

export function saveEquipped(id) {
  try { localStorage.setItem(SKIN_EQUIPPED_KEY, id) } catch {}
}
