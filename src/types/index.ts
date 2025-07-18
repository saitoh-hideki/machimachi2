export interface Shop {
  id: string
  name: string
  category: string
  stance: string
  appearance: string
  commercialText: string
  commercialImage?: string
  homepageUrl?: string
  hoursStart?: string
  hoursEnd?: string
  recruit?: string
  phone?: string
  address?: string
  catchphrase?: string
  position: {
    row: number
    side: 'left' | 'right'
  }
}

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