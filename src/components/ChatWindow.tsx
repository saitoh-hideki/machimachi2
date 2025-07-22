'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { ChatMessage } from '@/types'
import { X, Send, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { toRomaji } from 'wanakana'

// Supabase Edge FunctionのエンドポイントURLを指定
const SUPABASE_URL = "https://mokjknnkqshriboykvtc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1va2prbm5rcXNocmlib3lrdnRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDk5MDYsImV4cCI6MjA2ODQyNTkwNn0.oZjWC7JNUe2xPW0f8Xmq7kUKkx8o-1sS_kKsVVLrqCw";
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SUPABASE_EDGE_URL = `${SUPABASE_URL}/functions/v1/chat`;
const SUPABASE_TTS_URL = `${SUPABASE_URL}/functions/v1/tts`;

export const ChatWindow: React.FC = () => {
  const { selectedShop, selectedFacility, selectShop, selectFacility, toggleFavorite, favoriteShops } = useStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<'ja' | 'en'>('ja')
  const [playingTTS, setPlayingTTS] = useState<string | null>(null)
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
    console.log('convertShopName called:', { name, language, toRomajiResult: toRomaji(name) })
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
      if (!res.body) throw new Error('No response body');

      // まず「考え中…」のAIメッセージを追加
      const aiMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMessageId,
        role: 'assistant',
        content: language === 'ja' ? '考え中…' : 'Thinking…',
        timestamp: new Date(),
      }]);
      // 100msだけ待つことで「考え中…」が確実に表示されるようにする
      await new Promise(r => setTimeout(r, 100));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      let firstChunk = true;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // OpenAIのSSE形式: data: ...\n\n で来るのでパース
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.replace('data:', '').trim();
            if (data === '[DONE]') continue;
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content || '';
              if (delta) {
                aiContent += delta;
                // 最初のchunkで「考え中…」を消す
                setMessages(prev => prev.map(m =>
                  m.id === aiMessageId ? { ...m, content: firstChunk ? delta : aiContent } : m
                ));
                firstChunk = false;
              }
            } catch {
              // 無視
            }
          }
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      // エラー時はAIメッセージをエラー文に置き換え
      setMessages(prev => prev.map(m =>
        m.role === 'assistant' && (m.content === '考え中…' || m.content === 'Thinking…')
          ? { ...m, content: language === 'ja' ? '申し訳ございません。応答を生成できませんでした。' : 'Sorry, I could not generate a response.' }
          : m
      ));
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
  let windowPositionStyle: React.CSSProperties = { left: '50%', transform: 'translateX(-50%)' };
  if (selectedShop) {
    // ShoppingStreetのrows構造を再現してcolIdxを正確に特定
    const { shops } = useStore.getState();
    let displayShops = shops.length > 0 ? shops : [
      {
        id: '1', name: 'Tanaka Bakery', category: 'Bakery', stance: '', appearance: '', commercialText: '', position: { row: 0, side: 'left' }
      },
      {
        id: '2', name: 'Hanasaki Flower Shop', category: 'Flower Shop', stance: '', appearance: '', commercialText: '', position: { row: 0, side: 'right' }
      },
      {
        id: '3', name: 'Yamada Bookstore', category: 'Bookstore', stance: '', appearance: '', commercialText: '', position: { row: 1, side: 'left' }
      },
      {
        id: '4', name: 'Cafe Aoyama', category: 'Cafe', stance: '', appearance: '', commercialText: '', position: { row: 1, side: 'right' }
      }
    ];
    let colIdx = -1;
    for (let i = 0; i < Math.min(displayShops.length, 20); i += 4) {
      const rowShops = displayShops.slice(i, i + 4);
      const foundIdx = rowShops.findIndex(s => s.id === selectedShop.id);
      if (foundIdx !== -1) {
        colIdx = foundIdx;
        break;
      }
    }
    if (colIdx === 0 || colIdx === 1) {
      windowPositionStyle = { left: 40, right: 'auto', transform: 'none' };
    } else if (colIdx === 2 || colIdx === 3) {
      windowPositionStyle = { right: 40, left: 'auto', transform: 'none' };
    }
  } else if (selectedFacility) {
    // 公共施設は左側に表示
    windowPositionStyle = { left: 40, right: 'auto', transform: 'none' };
  } else {
    // 未選択時は中央
    windowPositionStyle = { left: '50%', transform: 'translateX(-50%)' };
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={"fixed inset-y-0 z-50 p-4 flex items-center"}
      style={windowPositionStyle}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[500px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">
              {selectedShop ? selectedShop.appearance : selectedFacility!.icon}
            </span>
            <h3 className="font-bold text-lg">{convertShopName(entity.name)}</h3>
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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
              className="px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title={language === 'ja' ? 'Switch to English' : '日本語に切り替え'}
            >
              <span className="text-sm font-medium text-blue-600">
                {language === 'ja' ? 'EN' : 'JP'}
              </span>
            </button>

            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
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
                } flex items-center`}
              >
                <p className="text-sm">{message.content}</p>
                {/* 音声再生ボタン（assistantメッセージのみ） */}
                {message.role === 'assistant' && message.content && (
                  <button
                    onClick={() => playTTS(message.content, language)}
                    disabled={playingTTS === message.content}
                    className={`ml-2 text-xl focus:outline-none transition-all duration-200 ${
                      playingTTS === message.content 
                        ? 'text-orange-500 scale-110 animate-pulse' 
                        : 'text-gray-600 hover:text-blue-500 hover:scale-110 active:scale-95'
                    }`}
                    title={playingTTS === message.content ? "音声生成中..." : "音声で再生"}
                  >
                    {playingTTS === message.content ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    ) : (
                      '🔊'
                    )}
                  </button>
                )}
                <p className="text-xs mt-1 opacity-70 ml-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && !(messages[messages.length - 1]?.role === 'assistant' && (messages[messages.length - 1]?.content === '考え中…' || messages[messages.length - 1]?.content === 'Thinking…')) && (
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
              placeholder={language === 'ja' ? 'メッセージを入力...' : 'Type a message...'}
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