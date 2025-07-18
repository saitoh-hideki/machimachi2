import { create } from 'zustand'
import { Shop, Facility, TimeMode, Event } from '@/types'

interface StoreState {
  shops: Shop[]
  facilities: Facility[]
  selectedShop: Shop | null
  selectedFacility: Facility | null
  timeMode: TimeMode
  favoriteShops: string[]
  events: Event[]
  
  setShops: (shops: Shop[]) => void
  setFacilities: (facilities: Facility[]) => void
  selectShop: (shop: Shop | null) => void
  selectFacility: (facility: Facility | null) => void
  setTimeMode: (mode: TimeMode) => void
  toggleFavorite: (shopId: string) => void
  addEvent: (event: Event) => void
  removeEvent: (eventId: string) => void
}

export const useStore = create<StoreState>((set) => ({
  shops: [],
  facilities: [
    {
      id: 'city-hall',
      name: '市役所',
      icon: '🏛️',
      category: '行政',
      philosophy: '市民の皆様に寄り添う行政サービスを提供します',
      responseStance: '丁寧に制度を案内',
      isVisible: true,
    },
    {
      id: 'school',
      name: '学校',
      icon: '🏫',
      category: '教育',
      philosophy: '地域の未来を担う子どもたちの成長を支援します',
      responseStance: '教育相談に親身に対応',
      isVisible: true,
    },
    {
      id: 'library',
      name: '図書館',
      icon: '📚',
      category: '文化',
      philosophy: '知識と文化の発信拠点として地域に貢献します',
      responseStance: '本の相談や学習支援',
      isVisible: true,
    },
    {
      id: 'chamber',
      name: '商工会議所',
      icon: '🏢',
      category: '経済',
      philosophy: '地域経済の活性化を支援します',
      responseStance: 'ビジネス相談に専門的に対応',
      isVisible: true,
    },
    {
      id: 'smart-life',
      name: 'スマートライフAO',
      icon: '💡',
      category: 'テクノロジー',
      philosophy: 'デジタル技術で生活をより便利に',
      responseStance: 'IT相談やデジタル活用支援',
      isVisible: true,
    },
    {
      id: 'park',
      name: '公園',
      icon: '🌳',
      category: 'レクリエーション',
      philosophy: '憩いとコミュニティの場を提供します',
      responseStance: '公園利用やイベント相談',
      isVisible: true,
    },
    {
      id: 'gym',
      name: '体育館',
      icon: '🏟️',
      category: 'スポーツ',
      philosophy: '健康的な生活を支援します',
      responseStance: 'スポーツ活動の相談と案内',
      isVisible: true,
    },
  ],
  selectedShop: null,
  selectedFacility: null,
  timeMode: 'day',
  favoriteShops: [],
  events: [],
  
  setShops: (shops) => set({ shops }),
  setFacilities: (facilities) => set({ facilities }),
  selectShop: (shop) => set({ selectedShop: shop, selectedFacility: null }),
  selectFacility: (facility) => set({ selectedFacility: facility, selectedShop: null }),
  setTimeMode: (mode) => set({ timeMode: mode }),
  toggleFavorite: (shopId) => set((state) => ({
    favoriteShops: state.favoriteShops.includes(shopId)
      ? state.favoriteShops.filter(id => id !== shopId)
      : [...state.favoriteShops, shopId]
  })),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  removeEvent: (eventId) => set((state) => ({
    events: state.events.filter(e => e.id !== eventId)
  })),
}))