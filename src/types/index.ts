export interface BaseEntity {
  id: string;
  name: string;
  category: string;
  stance: string; // AI応答スタンス
  commercial_text: string; // お知らせ
  holidays?: string[]; // 休日リスト
  vision_enabled: boolean;
  address: string;
  phone: string;
  homepage_url: string;
  hours_start: string;
  hours_end: string;
  recruit: string;
}

export type Shop = BaseEntity & {
  icon?: string; // オプショナルに変更
  appearance: string;
  position: any; // jsonb
};

export interface Facility extends BaseEntity {
  icon: string;
  philosophy: string;
  responseStance: string;
  isVisible: boolean;
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Event {
  id: string
  title: string
  date: Date
  description: string
  organizer: string
  link?: string
}

export type TimeMode = 'day' | 'night'

export interface Vision {
  id: string
  type: 'commercial' | 'announcement'
  content: string
  image?: string
  displayDuration: number
  startDate: Date
  endDate: Date
}