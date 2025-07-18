'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'

export const Road: React.FC = () => {
  const { timeMode } = useStore()

  const cars = [
    { id: 1, lane: 'up', delay: 0 },
    { id: 2, lane: 'up', delay: 10 },
    { id: 3, lane: 'down', delay: 5 },
    { id: 4, lane: 'down', delay: 15 },
  ]

  return (
    <div className="absolute inset-x-0 top-0 bottom-0 flex justify-center">
      <div className="w-64 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 relative overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 border-r-4 border-dashed border-gray-200"></div>
          <div className="w-1/2"></div>
        </div>
        
        {cars.map((car) => (
          <motion.div
            key={car.id}
            className={`absolute w-8 h-12 ${
              car.lane === 'up' ? 'left-4' : 'right-4'
            }`}
            initial={{
              y: car.lane === 'up' ? '100vh' : '-200px',
            }}
            animate={{
              y: car.lane === 'up' ? '-200px' : '100vh',
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              delay: car.delay,
              ease: 'linear',
            }}
          >
            <div className="relative">
              <div className={`w-8 h-12 rounded-lg ${
                timeMode === 'night' ? 'bg-gray-800' : 'bg-gradient-to-b from-blue-200 to-blue-400 shadow'
              }`}>
                {timeMode === 'night' && (
                  <>
                    <div className="absolute top-1 left-1 w-2 h-2 bg-yellow-300 rounded-full car-headlight"></div>
                    <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-300 rounded-full car-headlight"></div>
                  </>
                )}
              </div>
              <div className="text-xs text-center mt-1">🚗</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}