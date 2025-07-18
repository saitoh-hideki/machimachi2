import React from 'react'
import { Settings } from 'lucide-react'

interface SettingsButtonProps {
  onClick: () => void
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed left-4 bottom-4 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors z-30"
    title="設定"
  >
    <Settings size={24} className="text-gray-700" />
  </button>
)

export default SettingsButton 