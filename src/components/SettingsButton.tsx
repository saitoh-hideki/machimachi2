import React from 'react'
import { Settings } from 'lucide-react'

interface SettingsButtonProps {
  onClick: () => void
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed left-4 bottom-4 p-3 bg-black/80 backdrop-blur-md rounded-full shadow-2xl hover:bg-gray-800/80 transition-colors z-30 border border-gray-700"
    title="設定"
  >
    <Settings size={24} className="text-gray-300" />
  </button>
)

export default SettingsButton 