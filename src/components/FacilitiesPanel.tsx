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
      <div className="bg-gradient-to-b from-white via-gray-50 to-gray-200 text-gray-800 shadow p-3 rounded-lg mb-4 max-w-xs border border-gray-200">
        <h3 className="font-bold text-sm mb-2">市からのお知らせ</h3>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAnnouncementIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="vision-display text-xs"
            style={{
              width: '200px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <div className="text-center">
              <div className="font-bold">{announcementMessages[currentAnnouncementIndex].sender}</div>
              <div>{announcementMessages[currentAnnouncementIndex].text}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
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
                className="facility-icon bg-white border border-gray-200 shadow-sm"
                title={name}
              >
                <span className="text-2xl">{facility.icon}</span>
              </button>
              <span className="text-sm font-semibold">{name}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}