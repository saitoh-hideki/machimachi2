"use client"
import React from 'react'
import { NightModeToggle } from './NightModeToggle'
import { Star } from 'lucide-react'

interface TopLeftIconsProps {
  showMyStreet: boolean
  onToggleMyStreet: () => void
  onToggleNightMode: () => void
}

export const TopLeftIcons: React.FC<TopLeftIconsProps> = ({ showMyStreet, onToggleMyStreet, onToggleNightMode }) => (
  <div className="fixed top-6 left-6 flex flex-row items-center space-x-4 z-30 sm:top-2 sm:left-2 sm:space-x-2">
    <button
      className="w-12 h-12 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors sm:w-10 sm:h-10"
      onClick={onToggleNightMode}
      title="夜モード切替"
    >
      <NightModeToggle />
    </button>
    <button
      onClick={onToggleMyStreet}
      className={`w-12 h-12 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors ${showMyStreet ? 'ring-2 ring-yellow-400' : ''} sm:w-10 sm:h-10`}
      title="マイ商店街（お気に入り）"
    >
      <Star size={24} className={showMyStreet ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
    </button>
  </div>
) 