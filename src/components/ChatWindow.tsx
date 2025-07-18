'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { ChatMessage } from '@/types'
import { X, Send, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

export const ChatWindow: React.FC = () => {
  const { selectedShop, selectedFacility, selectShop, selectFacility, toggleFavorite, favoriteShops } = useStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const entity = selectedShop || selectedFacility

  useEffect(() => {
    if (entity) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: selectedShop 
          ? `こんにちは！${selectedShop.name}へようこそ。${selectedShop.stance} 何かご質問はありますか？`
          : `${selectedFacility!.name}です。${selectedFacility!.philosophy} お気軽にお声がけください。`,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [entity, selectedShop, selectedFacility])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleClose = () => {
    selectShop(null)
    selectFacility(null)
    setMessages([])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const systemPrompt = selectedShop
        ? `あなたは${selectedShop.name}の店主です。${selectedShop.stance} ${selectedShop.category}の専門知識を活かして、親しみやすく温かい対応をしてください。ユーザーの言語に応じて、同じ言語で返答してください。`
        : `あなたは${selectedFacility!.name}の職員です。${selectedFacility!.philosophy} ${selectedFacility!.responseStance}の姿勢で対応してください。ユーザーの言語に応じて、同じ言語で返答してください。`

      setTimeout(() => {
        const mockResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `ありがとうございます。「${inputMessage}」について、お答えします。${entity?.name}では、皆様のお役に立てるよう心がけております。他にもご質問がございましたら、お気軽にお聞かせください。`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, mockResponse])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error sending message:', error)
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!entity) return null

  const isFavorite = selectedShop && favoriteShops.includes(selectedShop.id)

  // チャットウィンドウの表示位置を決定
  let justifyClass = 'justify-center'
  if (selectedShop) {
    if (selectedShop.position.side === 'left') justifyClass = 'justify-start'
    if (selectedShop.position.side === 'right') justifyClass = 'justify-end'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`fixed inset-0 bg-black/50 flex items-center ${justifyClass} z-50 p-4`}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[500px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">
              {selectedShop ? selectedShop.appearance : selectedFacility!.icon}
            </span>
            <h3 className="font-bold text-lg">{entity.name}</h3>
            {selectedShop && (
              <button
                onClick={() => toggleFavorite(selectedShop.id)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Heart
                  size={20}
                  className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                />
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}