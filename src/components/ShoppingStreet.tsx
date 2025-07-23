'use client'

import React from 'react'
import { useStore } from '@/store/useStore'
import { Shop as ShopComponent } from './Shop'
import { Shop } from '@/types'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

interface ShoppingStreetProps {
  myStreet?: boolean
  streetName?: string
}

export const ShoppingStreet: React.FC<ShoppingStreetProps> = ({ myStreet, streetName }) => {
  const { shops, timeMode, favoriteShops } = useStore()
  
  const mockShops: Shop[] = [
    {
      id: '1',
      name: 'Hanasaki Flower Shop',
      category: 'Flower Shop',
      stance: 'Adding color to life with seasonal flowers',
      appearance: '🌸',
      icon: '🌸',
      commercial_text: 'Mother\'s Day Fair Now Open',
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
      name: 'Yamada Bookstore',
      category: 'Bookstore',
      stance: 'Cherishing encounters with books',
      appearance: '📚',
      icon: '📚',
      commercial_text: 'New books have arrived',
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
      name: 'Cafe Aoyama',
      category: 'Cafe',
      stance: 'Please enjoy a relaxing time',
      appearance: '☕',
      icon: '☕',
      commercial_text: 'Seasonal limited drinks now available',
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
      name: 'Tanaka Bakery',
      category: 'Bakery',
      stance: 'Welcoming you with the aroma of fresh bread and smiles',
      appearance: '🥐',
      icon: '🥐',
      commercial_text: 'Fresh bread on sale from 7 AM!',
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

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto bg-black">
      <div className="relative max-w-full mx-auto px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            {streetName || (myStreet ? 'My Street' : 'まちまちChat')}
          </h1>
          <p className="text-gray-400">
            {myStreet ? 'お気に入りの店舗' : 'チャットでお店とつながろう'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {displayShops.map((shop, index) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ShopComponent shop={shop} />
            </motion.div>
          ))}
        </div>

        {displayShops.length === 0 && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-8 text-center">
              <p className="text-white/90">
                {myStreet ? 'お気に入りの店舗がありません' : '店舗が見つかりません'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}