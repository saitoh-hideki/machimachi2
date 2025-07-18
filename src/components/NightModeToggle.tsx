'use client'

import React from 'react'
import { useStore } from '@/store/useStore'
import { Moon, Sun } from 'lucide-react'

export const NightModeToggle: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { timeMode } = useStore()
  return (
    <span
      onClick={onClick}
      className="cursor-pointer"
      title={timeMode === 'day' ? '夜モードに切替' : '昼モードに切替'}
    >
      {timeMode === 'day' ? (
        <Moon size={24} className="text-gray-700" />
      ) : (
        <Sun size={24} className="text-yellow-500" />
      )}
    </span>
  )
}