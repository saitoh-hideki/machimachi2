export type Shop = {
  id: string;
  name: string;
  category: string;
  stance: string;
  appearance: string;
  commercial_text: string;
  hours_start: string;
  hours_end: string;
  recruit: string;
  phone: string;
  address: string;
  homepage_url: string;
  vision_enabled: boolean;
  position: any; // jsonb
  holiday?: string; // 休日（YYYY-MM-DD形式）
};

export interface Facility {
  id: string
  name: string
  icon: string
  category: string
  philosophy: string
  responseStance: string
  isVisible: boolean
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