'use client'

import React from 'react'
import { useStore } from '@/store/useStore'
import { Shop as ShopComponent } from './Shop'
import { Shop } from '@/types'
import { motion } from 'framer-motion'

interface ShoppingStreetProps {
  myStreet?: boolean
  streetName?: string
}

export const ShoppingStreet: React.FC<ShoppingStreetProps> = ({ myStreet, streetName }) => {
  const { shops, timeMode, favoriteShops } = useStore()
  
  const mockShops: Shop[] = [
    {
      id: '1',
      name: '花咲生花店',
      category: '花屋',
      stance: '季節の花で暮らしに彩りを',
      appearance: '🌸',
      commercial_text: '母の日フェア開催中',
      hours_start: '09:00',
      hours_end: '19:00',
      recruit: '',
      phone: '',
      address: '',
      homepage_url: '',
      vision_enabled: false,
      position: { row: 0, side: 'left' }
    },
    {
      id: '2',
      name: '山田書店',
      category: '本屋',
      stance: '本との出会いを大切に',
      appearance: '📚',
      commercial_text: '新刊入荷しました',
      hours_start: '10:00',
      hours_end: '20:00',
      recruit: '',
      phone: '',
      address: '',
      homepage_url: '',
      vision_enabled: false,
      position: { row: 0, side: 'right' }
    },
    {
      id: '3',
      name: 'カフェ青山',
      category: 'カフェ',
      stance: 'ゆったりとした時間をお過ごしください',
      appearance: '☕',
      commercial_text: '季節限定ドリンク登場',
      hours_start: '08:00',
      hours_end: '22:00',
      recruit: '',
      phone: '',
      address: '',
      homepage_url: '',
      vision_enabled: false,
      position: { row: 1, side: 'left' }
    },
    {
      id: '4',
      name: '田中パン屋',
      category: 'パン屋',
      stance: '焼きたての香りと笑顔でお迎えします',
      appearance: '🥐',
      commercial_text: '朝7時から焼きたてパン販売中！',
      hours_start: '07:00',
      hours_end: '18:00',
      recruit: '',
      phone: '',
      address: '',
      homepage_url: '',
      vision_enabled: false,
      position: { row: 1, side: 'right' }
    },
  ]

  let displayShops = shops.length > 0 ? shops : mockShops
  if (myStreet) {
    displayShops = displayShops.filter(shop => favoriteShops.includes(shop.id))
  }

  // 4列で縦に並べるため、行ごとにグループ化
  const rows: Array<{ shops: Shop[] }> = []
  for (let i = 0; i < Math.min(displayShops.length, 20); i += 4) {
    rows.push({
      shops: displayShops.slice(i, i + 4),
    })
  }

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto">
      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="inline-block bg-gradient-to-b from-white via-gray-50 to-gray-200 px-12 py-4 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold font-handwritten text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              {streetName || 'まちまちチャット商店街'}
            </h1>
          </div>
        </motion.div>

        <div className="relative mt-8 flex w-full" style={{ minHeight: `${rows.length * 12 + 20}rem` }}>
          {/* 店舗を4列で表示 - 左上の焦点を一コマ分動かし、間隔を狭める */}
          <div className="relative z-10 flex-1">
            <div className="flex flex-col gap-y-16">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-4 gap-x-4 ml-16">
                  {row.shops.map((shop, colIdx) => (
                    <div key={shop.id} className="flex justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: rowIndex * 0.1 + colIdx * 0.02 }}
                      >
                        <ShopComponent shop={shop} />
                      </motion.div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}