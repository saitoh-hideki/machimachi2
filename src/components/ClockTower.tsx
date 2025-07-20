'use client'

import React, { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'

export const ClockTower: React.FC = () => {
  const { timeMode, shops } = useStore()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // ビジョンに流す店舗のお知らせを動的に生成
  const commercialMessages = shops
    .filter(shop => shop.vision_enabled && shop.commercial_text)
    .map(shop => ({ text: shop.commercial_text, shop: shop.name }))
    // デフォルトがなければモック
    .concat(shops.length === 0 ? [
      { text: "Big Thanksgiving Sale this weekend!", shop: "Tanaka Bakery" },
      { text: "Mother's Day Fair in progress", shop: "Hanasaki Flower Shop" },
      { text: "New books have arrived", shop: "Yamada Bookstore" },
      { text: "Seasonal limited drinks now available", shop: "Cafe Aoyama" },
    ] : []);

  const [currentAdIndex, setCurrentAdIndex] = useState(0)

  useEffect(() => {
    const adTimer = setInterval(() => {
      setCurrentAdIndex((prev) => {
        if (commercialMessages.length === 0) return 0;
        return (prev + 1) % commercialMessages.length;
      });
    }, 5000);
    return () => clearInterval(adTimer);
  }, [commercialMessages.length]);

  const hourAngle = (currentTime.getHours() % 12) * 30 + currentTime.getMinutes() * 0.5
  const minuteAngle = currentTime.getMinutes() * 6

  return (
    <div className="fixed top-4 right-4 z-20 flex flex-col items-end">
      {/* カレンダーと日付表示 */}
      <div className="mb-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 flex items-center space-x-2">
        <Calendar size={20} className="text-blue-600" />
        <div className="text-sm font-medium text-gray-800">
          {currentTime.getFullYear()}年{currentTime.getMonth() + 1}月{currentTime.getDate()}日
        </div>
      </div>
      
      {/* 時計本体 */}
      <div className="w-32 h-32 bg-gradient-to-b from-gray-200 via-white to-gray-100 rounded-full flex items-center justify-center relative">
        <div className="w-28 h-28 bg-white rounded-full border border-gray-200 shadow-md flex items-center justify-center relative">
          <div className="w-24 h-24 bg-white rounded-full border border-gray-100 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-2 bg-gray-800"
                style={{
                  top: '4px',
                  left: '50%',
                  transform: `translateX(-50%) rotate(${i * 30}deg)`,
                  transformOrigin: 'center 44px',
                }}
              />
            ))}
          </div>
          <div
            className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-black origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-black origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
            }}
          />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
      {/* ビジョン（お知らせ） */}
      <motion.div
        key={currentAdIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-2 bg-gradient-to-b from-white via-gray-50 to-gray-200 text-gray-800 shadow p-2 rounded-lg text-xs max-w-xs"
      >
        <div className="text-center">
          {commercialMessages.length > 0 ? (
            <>
              <div className="font-bold">{commercialMessages[currentAdIndex].shop}</div>
              <div>{commercialMessages[currentAdIndex].text}</div>
            </>
          ) : (
            <div className="text-gray-400">現在お知らせはありません</div>
          )}
        </div>
      </motion.div>
    </div>
  )
}