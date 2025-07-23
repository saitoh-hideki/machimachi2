'use client'

import React, { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

interface FacilitiesPanelProps {
  visibleFacilityIds?: string[]
  facilityDetails?: Record<string, { name: string; announcement: string }>
}

export const FacilitiesPanel: React.FC<FacilitiesPanelProps> = ({ visibleFacilityIds, facilityDetails }) => {
  const { facilities, selectFacility } = useStore()

  // お知らせメッセージ配列
  const announcementMessages = [
    { text: "防災訓練を実施します。詳細は市役所まで。", sender: "市役所" },
    { text: "今月のごみ収集日は変更があります。", sender: "市役所" },
    { text: "図書館の新刊入荷のお知らせ。", sender: "図書館" },
    { text: "公園でイベント開催予定。", sender: "公園" },
  ]
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAnnouncementIndex((prev) => (prev + 1) % announcementMessages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed left-4 top-32 space-y-3 z-20">
      {/* ビジョン（お知らせ） - ブラックテーマ */}
      <motion.div
        key={currentAnnouncementIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-black/80 backdrop-blur-md text-white shadow-2xl p-3 rounded-xl border border-gray-700 text-xs max-w-xs"
      >
        <div className="text-center">
          <div className="font-bold text-gray-300 mb-1">{announcementMessages[currentAnnouncementIndex].sender}</div>
          <div className="text-gray-200">{announcementMessages[currentAnnouncementIndex].text}</div>
        </div>
      </motion.div>
      
      <div className="space-y-2">
        {facilities.filter(f => f.isVisible && (!visibleFacilityIds || visibleFacilityIds.includes(f.id))).map((facility, index) => {
          const name = facilityDetails?.[facility.id]?.name || facility.name
          return (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-2"
            >
              <button
                onClick={() => selectFacility(facility)}
                className="facility-icon bg-black/80 backdrop-blur-md border border-gray-700 shadow-2xl rounded-lg p-2 hover:bg-gray-800/80 transition-colors"
                title={name}
              >
                <span className="text-2xl">{facility.icon}</span>
              </button>
              <span className="text-sm font-semibold text-white">{name}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}