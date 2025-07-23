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
    <div className="fixed top-4 right-4 z-20 flex flex-col items-end space-y-3">
      {/* カレンダーと日付表示 - ブラックテーマ */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-black/80 backdrop-blur-md rounded-xl shadow-2xl p-4 flex items-center space-x-3 border border-gray-700"
      >
        <div className="bg-gradient-to-br from-gray-600 to-gray-800 p-2 rounded-lg">
          <Calendar size={18} className="text-white" />
        </div>
        <div className="text-sm font-semibold text-white">
          {currentTime.getFullYear()}年{currentTime.getMonth() + 1}月{currentTime.getDate()}日
        </div>
      </motion.div>
      
      {/* 時計本体 - ブラックテーマ */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <div className="w-36 h-36 bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-full flex items-center justify-center relative shadow-2xl border border-gray-700">
          {/* 外側のリング */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-400/20 to-gray-600/20 blur-sm"></div>
          
          <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-black rounded-full border border-gray-600 shadow-inner flex items-center justify-center relative">
            <div className="w-28 h-28 bg-black rounded-full border border-gray-700 relative flex items-center justify-center">
              {/* 時計の目盛り */}
              <div className="absolute inset-0 rounded-full border border-gray-600"></div>
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-3 bg-gradient-to-b from-gray-300 to-gray-500"
                  style={{
                    top: '2px',
                    left: '50%',
                    transform: `translateX(-50%) rotate(${i * 30}deg)`,
                    transformOrigin: 'center 42px',
                  }}
                />
              ))}
              
              {/* 時針 */}
              <div
                className="absolute top-1/2 left-1/2 w-1 h-7 bg-gradient-to-b from-gray-200 to-gray-400 origin-bottom rounded-full"
                style={{
                  transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
                }}
              />
              {/* 分針 */}
              <div
                className="absolute top-1/2 left-1/2 w-0.5 h-9 bg-gradient-to-b from-gray-300 to-gray-500 origin-bottom rounded-full"
                style={{
                  transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
                }}
              />
              {/* 中心点 */}
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg" />
            </div>
          </div>
          

        </div>
      </motion.div>
      
      {/* ビジョン（お知らせ） - ブラックテーマ */}
      <motion.div
        key={currentAdIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-black/80 backdrop-blur-md text-white shadow-2xl p-3 rounded-xl border border-gray-700 text-xs max-w-xs"
      >
        <div className="text-center">
          {commercialMessages.length > 0 ? (
            <>
              <div className="font-bold text-gray-300 mb-1">{commercialMessages[currentAdIndex].shop}</div>
              <div className="text-gray-200">{commercialMessages[currentAdIndex].text}</div>
            </>
          ) : (
            <div className="text-gray-400">現在お知らせはありません</div>
          )}
        </div>
      </motion.div>
    </div>
  )
}