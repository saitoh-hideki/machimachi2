'use client'

import React, { useState } from 'react'
import { useStore } from '@/store/useStore'
import { ChevronRight, Store, Building, PanelLeftClose, PanelRightClose } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shop } from '@/types'

// Mock data
const mockStreets = [
  { id: 'street1', name: 'まちまちチャット商店街' },
  { id: 'street2', name: 'あおぞら通り商店街' },
]
const mockShops: (Shop & { streetId: string })[] = [
  { id: '1', name: 'Hanasaki Flower Shop', category: 'Flower Shop', streetId: 'street1', appearance: '🌸', stance: '', commercial_text: '', holidays: [], vision_enabled: false, address: '', phone: '', homepage_url: '', hours_start: '', hours_end: '', recruit: '', position: {}, icon: '' },
  { id: '2', name: 'Yamada Bookstore', category: 'Bookstore', streetId: 'street1', appearance: '📚', stance: '', commercial_text: '', holidays: [], vision_enabled: false, address: '', phone: '', homepage_url: '', hours_start: '', hours_end: '', recruit: '', position: {}, icon: '' },
  { id: '3', name: 'Cafe Aoyama', category: 'Cafe', streetId: 'street2', appearance: '☕', stance: '', commercial_text: '', holidays: [], vision_enabled: false, address: '', phone: '', homepage_url: '', hours_start: '', hours_end: '', recruit: '', position: {}, icon: '' },
  { id: '4', name: 'Tanaka Bakery', category: 'Bakery', streetId: 'street2', appearance: '🥐', stance: '', commercial_text: '', holidays: [], vision_enabled: false, address: '', phone: '', homepage_url: '', hours_start: '', hours_end: '', recruit: '', position: {}, icon: '' },
]

export const Sidebar: React.FC = () => {
  const { selectShop, selectedShop, isSidebarCollapsed, toggleSidebar } = useStore()
  const [expandedStreets, setExpandedStreets] = useState<Set<string>>(new Set(['street1']))

  const toggleStreet = (streetId: string) => {
    setExpandedStreets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(streetId)) {
        newSet.delete(streetId)
      } else {
        newSet.add(streetId)
      }
      return newSet
    })
  }

  return (
    <motion.div
      animate={{ width: isSidebarCollapsed ? '5rem' : '16rem' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-gray-50 border-r border-gray-200 z-40 flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        {!isSidebarCollapsed && <h2 className="text-lg font-semibold text-gray-800">商店街一覧</h2>}
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-md"
        >
          {isSidebarCollapsed ? <PanelRightClose size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
        {mockStreets.map(street => (
          <div key={street.id}>
            <button
              onClick={() => toggleStreet(street.id)}
              className="w-full flex items-center justify-between text-left text-gray-700 hover:bg-gray-200 rounded-md px-2 py-2 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Building size={18} />
                {!isSidebarCollapsed && <span className="font-medium">{street.name}</span>}
              </div>
              {!isSidebarCollapsed && (
                <ChevronRight
                  size={16}
                  className={`transform transition-transform ${expandedStreets.has(street.id) ? 'rotate-90' : ''}`}
                />
              )}
            </button>
            <AnimatePresence>
              {!isSidebarCollapsed && expandedStreets.has(street.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pl-4 mt-1 space-y-1 overflow-hidden"
                >
                  {mockShops.filter(s => s.streetId === street.id).map(shop => (
                    <button
                      key={shop.id}
                      onClick={() => selectShop(shop)}
                      className={`w-full flex items-center space-x-2 text-left text-sm text-gray-600 hover:bg-gray-200 rounded-md px-2 py-2 transition-colors ${selectedShop?.id === shop.id ? 'bg-blue-100 text-blue-700' : ''}`}
                    >
                      <Store size={16} />
                      <span>{shop.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </motion.div>
  )
} 