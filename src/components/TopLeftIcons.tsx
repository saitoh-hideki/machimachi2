"use client"
import React from 'react'
import { Star } from 'lucide-react'

interface TopLeftIconsProps {
  showMyStreet: boolean
  onToggleMyStreet: () => void
}

export const TopLeftIcons: React.FC<TopLeftIconsProps> = ({ showMyStreet, onToggleMyStreet }) => (
  <div className="fixed top-6 left-6 flex flex-row items-center space-x-4 z-30 sm:top-2 sm:left-2 sm:space-x-2">
    <button
      onClick={onToggleMyStreet}
      className={`w-12 h-12 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-full shadow-2xl hover:bg-gray-800/80 transition-colors ${showMyStreet ? 'ring-2 ring-yellow-400' : ''} sm:w-10 sm:h-10 border border-gray-700`}
      title="マイ商店街（お気に入り）"
    >
      <Star size={24} className={showMyStreet ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
    </button>
  </div>
) 