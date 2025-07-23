'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { ChatMessage } from '@/types'
import { X, Send, Heart, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { toRomaji } from 'wanakana'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

// Supabase Edge FunctionのエンドポイントURLを指定
const SUPABASE_URL = "https://mokjknnkqshriboykvtc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1va2prbm5rcXNocmlib3lrdnRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDk5MDYsImV4cCI6MjA2ODQyNTkwNn0.oZjWC7JNUe2xPW0f8Xmq7kUKkx8o-1sS_kKsVVLrqCw";

const SUPABASE_EDGE_URL = `${SUPABASE_URL}/functions/v1/chat`;
const SUPABASE_TTS_URL = `${SUPABASE_URL}/functions/v1/tts`;

export const ChatWindow: React.FC = () => {
  const { selectedShop, selectedFacility, selectShop, selectFacility, toggleFavorite, favoriteShops } = useStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<'ja' | 'en'>('ja')
  const [playingTTS, setPlayingTTS] = useState<string | null>(null)
  const [streamingMessage, setStreamingMessage] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const entity = selectedShop || selectedFacility

  const playTTS = async (text: string, lang: 'ja' | 'en' = 'ja') => {
    try {
      setPlayingTTS(text);
      const res = await fetch(SUPABASE_TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ text, language: lang })
      });
      if (!res.ok) {
        alert("音声生成に失敗しました");
        setPlayingTTS(null);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      setPlayingTTS(null);
    } catch (error) {
      console.error('TTS error:', error);
      alert("音声生成に失敗しました");
      setPlayingTTS(null);
    }
  };

  // 店舗名をローマ字に変換する関数（英語モード時のみ）
  const convertShopName = (name: string) => {
    if (language === 'en') {
      // 漢字を含む名前の場合は、手動でマッピング
      const nameMapping: Record<string, string> = {
        '斉藤': 'Saitou',
        '田中': 'Tanaka',
        '山田': 'Yamada',
        '佐藤': 'Sato',
        '鈴木': 'Suzuki',
        '高橋': 'Takahashi',
        '渡辺': 'Watanabe',
        '伊藤': 'Ito',
        '中村': 'Nakamura',
        '小林': 'Kobayashi',
        '加藤': 'Kato',
        '吉田': 'Yoshida',
        '山本': 'Yamamoto',
        '松本': 'Matsumoto',
        '井上': 'Inoue',
        '木村': 'Kimura',
        '林': 'Hayashi',
        '斎藤': 'Saitou',
        '清水': 'Shimizu',
        '森': 'Mori',
        '池田': 'Ikeda',
        '橋本': 'Hashimoto',
        '阿部': 'Abe',
        '石川': 'Ishikawa',
        '山下': 'Yamashita',
        '中島': 'Nakajima',
        '石井': 'Ishii',
        '小川': 'Ogawa',
        '前田': 'Maeda',
        '岡田': 'Okada',
        '長谷川': 'Hasegawa',
        '藤田': 'Fujita',
        '近藤': 'Kondo',
        '青木': 'Aoki',
        '福田': 'Fukuda',
        '西村': 'Nishimura',
        '藤井': 'Fujii',
        '岡本': 'Okamoto',
        '松田': 'Matsuda',
        '中川': 'Nakagawa',
        '中野': 'Nakano',
        '原田': 'Harada',
        '田村': 'Tamura',
        '竹内': 'Takeuchi',
        '和田': 'Wada',
        '山口': 'Yamaguchi',
        '河野': 'Kono',
        '市役所': 'City Hall',
        '学校': 'School',
        '図書館': 'Library',
        '商工会議所': 'Chamber of Commerce',
        'スマートライフAO': 'Smart Life AO',
        '公園': 'Park',
        '体育館': 'Gymnasium'
      }
      
      // マッピングに存在する場合はそれを使用、そうでなければtoRomajiを使用
      if (nameMapping[name]) {
        return nameMapping[name]
      }
      
      // 部分一致を試す（例：「斉藤商店」→「Saitou Store」）
      for (const [japanese, english] of Object.entries(nameMapping)) {
        if (name.includes(japanese)) {
          return name.replace(japanese, english)
        }
      }
      
      // 最後の手段としてtoRomajiを使用
      return toRomaji(name)
    }
    return name
  }

  useEffect(() => {
    if (entity) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: language === 'ja' 
          ? (selectedShop 
              ? `こんにちは！${convertShopName(selectedShop.name)}へようこそ。${selectedShop.stance} 何かご質問はありますか？`
              : `${convertShopName(selectedFacility!.name)}です。${selectedFacility!.philosophy} お気軽にお声がけください。`)
          : (selectedShop 
              ? `Hello! Welcome to ${convertShopName(selectedShop.name)}. ${selectedShop.stance} Do you have any questions?`
              : `This is ${convertShopName(selectedFacility!.name)}. ${selectedFacility!.philosophy} Please feel free to ask us anything.`),
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [entity, selectedShop, selectedFacility, language])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage])

  const handleClose = () => {
    if (selectedShop) {
      selectShop(null)
    } else if (selectedFacility) {
      selectFacility(null)
    }
    setMessages([])
    setStreamingMessage('')
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
    setStreamingMessage('')

    try {
      // APIリクエスト用のshopTypeをcategoryから決定
      const shopType = selectedShop ? selectedShop.category : undefined;
      const shopId = selectedShop ? selectedShop.id : undefined;
      const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));
      
      const requestBody = {
        message: inputMessage,
        conversationHistory,
        shopType,
        shopId,
        language
      };
      
      const res = await fetch(SUPABASE_EDGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // ストリーミングレスポンスを処理
      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // デコードしてテキストを取得
        const chunk = new TextDecoder().decode(value);
        accumulatedContent += chunk;
        setStreamingMessage(accumulatedContent);
      }

      // ストリーミング完了後、メッセージを追加
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: accumulatedContent,
        timestamp: new Date(),
      }]);
      setStreamingMessage('');
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      setStreamingMessage('');
      // エラー時のメッセージを追加
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'ja' ? '申し訳ございません。応答を生成できませんでした。' : 'Sorry, I could not generate a response.',
        timestamp: new Date(),
      }]);
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {language === 'en' ? convertShopName(entity.name) : entity.name}
            </h2>
            <p className="text-sm text-gray-400">{entity.category}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-gray-300 hover:text-white"
        >
          <X size={20} />
        </Button>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {message.role === 'assistant' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playTTS(message.content, language)}
                  disabled={playingTTS === message.content}
                  className="mt-2 h-6 px-2 text-xs text-gray-300 hover:text-white"
                >
                  {playingTTS === message.content ? '再生中...' : '🔊'}
                </Button>
              )}
            </div>
          </motion.div>
        ))}
        
        {/* ストリーミングメッセージ */}
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-700 text-gray-100">
              <p className="text-sm">{streamingMessage}</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージ入力"
            className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send size={16} />
          </Button>
        </div>
        
        {/* 言語切り替えボタン */}
        <div className="flex justify-center mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
            className="text-xs border-gray-600 text-gray-300 hover:text-white"
          >
            {language === 'ja' ? 'English' : '日本語'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}