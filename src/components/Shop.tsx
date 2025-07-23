'use client'

import React, { useEffect, useState } from 'react'
import { Shop as ShopType } from '@/types'
import { useStore } from '@/store/useStore'
import { Heart, Info, Globe, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ShopProps {
  shop: ShopType
}

export const Shop: React.FC<ShopProps> = ({ shop }) => {
  const [showInfo, setShowInfo] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { selectShop, favoriteShops, toggleFavorite, shops, setShops } = useStore()
  const isFavorite = favoriteShops.includes(shop.id)

  // 休日チェック機能
  const isHoliday = () => {
    if (!shop.holidays || shop.holidays.length === 0) return false;
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayString = `${todayYear}-${todayMonth}-${todayDay}`;
    return shop.holidays.includes(todayString);
  }

  const handleClick = () => {
    selectShop(shop)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(shop.id)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      console.log('Deleting shop:', shop.id)
      
      // データベースから削除
      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('id', shop.id)
      
      if (error) {
        console.error('Error deleting shop:', error)
        alert('店舗の削除に失敗しました: ' + error.message)
        return
      }
      
      // ローカル状態から削除
      setShops(shops.filter(s => s.id !== shop.id))
      setShowDeleteConfirm(false)
      
      console.log('Shop deleted successfully')
      alert('店舗を削除しました')
    } catch (error) {
      console.error('Error in handleDeleteConfirm:', error)
      alert('店舗の削除中にエラーが発生しました')
    }
  }

  const [lags, setLags] = useState<Array<{ id: string, file_url: string, file_name: string }>>([]);
  useEffect(() => {
    if (!showInfo) return;
    const fetchLags = async () => {
      const { data } = await supabase.from('shop_lags').select('id, file_url, file_name').eq('shop_id', shop.id);
      setLags(data || []);
    };
    fetchLags();
  }, [showInfo, shop.id]);

  return (
    <div className="relative w-full max-w-[calc(100%-2rem)]">
              <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
            isHoliday() ? 'border-red-500 border-2' : 'border-white/20'
          } bg-white/10 backdrop-blur-md shadow-lg hover:shadow-black/50`}
          onClick={handleClick}
        >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="text-2xl drop-shadow-lg flex-shrink-0">{shop.appearance}</div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white text-sm drop-shadow-sm truncate">{shop.name}</h3>
                <p className="text-xs text-white/70 truncate">{shop.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {/* 地球儀アイコン - URLがある場合は色を変える */}
              <Button
                variant="ghost"
                size="sm"
                onClick={e => { 
                  e.stopPropagation(); 
                  if (shop.homepage_url && shop.homepage_url.trim()) {
                    window.open(shop.homepage_url, '_blank');
                  }
                }}
                className={`p-1 h-8 w-8 rounded-full transition-colors ${
                  shop.homepage_url && shop.homepage_url.trim() 
                    ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 cursor-pointer' 
                    : 'text-gray-500 cursor-not-allowed'
                }`}
                title={shop.homepage_url && shop.homepage_url.trim() ? "ホームページを開く" : "ホームページが設定されていません"}
                disabled={!shop.homepage_url || !shop.homepage_url.trim()}
              >
                <Globe size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className="p-1 h-8 w-8 text-gray-400 hover:text-red-500"
              >
                <Heart
                  size={16}
                  className={isFavorite ? 'fill-red-500 text-red-500' : ''}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="p-1 h-8 w-8 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-xs text-white/90 mb-3 line-clamp-2 drop-shadow-sm break-words">{shop.stance}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={e => { e.stopPropagation(); setShowInfo(true); }}
                className="h-6 px-2 text-xs text-gray-400 hover:text-white"
              >
                <Info size={12} className="mr-1" />
                詳細
              </Button>
            </div>
            
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-7 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-200 flex-shrink-0"
            >
              チャット
            </Button>
          </div>
          
          {/* 休日表示 - 固定位置でサイズ変更なし */}
          <div className="mt-2 h-6 flex items-center">
            {isHoliday() && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">休日</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md w-full mx-4">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">店舗を削除</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                「{shop.name}」を削除しますか？この操作は取り消せません。
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  削除
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-white/30 text-white/80 hover:text-white hover:border-white/50"
                >
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 店舗詳細モーダル */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{shop.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfo(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">営業時間</h4>
                <p className="text-gray-300 text-sm">
                  {shop.hours_start} - {shop.hours_end}
                </p>
              </div>
              
              {shop.phone && (
                <div>
                  <h4 className="font-medium text-white mb-2">電話番号</h4>
                  <p className="text-gray-300 text-sm">{shop.phone}</p>
                </div>
              )}
              
              {shop.address && (
                <div>
                  <h4 className="font-medium text-white mb-2">住所</h4>
                  <p className="text-gray-300 text-sm">{shop.address}</p>
                </div>
              )}
              
              {shop.commercial_text && (
                <div>
                  <h4 className="font-medium text-white mb-2">お知らせ</h4>
                  <p className="text-gray-300 text-sm">{shop.commercial_text}</p>
                </div>
              )}
              
              {lags.length > 0 && (
                <div>
                  <h4 className="font-medium text-white mb-2">アップロード済みファイル</h4>
                  <div className="space-y-1">
                    {lags.map((lag) => (
                      <div key={lag.id} className="text-gray-300 text-sm">
                        📎 {lag.file_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}