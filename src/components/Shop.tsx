'use client'

import React, { useEffect, useState } from 'react'
import { Shop as ShopType } from '@/types'
import { useStore } from '@/store/useStore'
import { Heart, Info, Globe } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient';

interface ShopProps {
  shop: ShopType
}

export const Shop: React.FC<ShopProps> = ({ shop }) => {
  const [showInfo, setShowInfo] = React.useState(false)
  const { selectShop, favoriteShops, toggleFavorite } = useStore()
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
    <div className="relative w-[3cm] max-w-md">
      <div
        className={`shop-building w-[3cm] h-[3cm] bg-white border shadow-md rounded-lg flex items-center justify-center relative text-gray-800 ${
          isHoliday() ? 'border-red-500 border-2' : 'border-gray-200'
        }`}
        onClick={handleClick}
      >
        <div className="shop-sign sm:text-xs">
          {shop.name}
        </div>
        <div className="bg-white rounded-full shadow-sm p-2 flex items-center justify-center">
          <span className="text-5xl sm:text-3xl">{shop.appearance}</span>
        </div>
        {/* 下段に業種を表示 */}
        <div className="text-xs text-center mt-1 text-gray-600">{shop.category}</div>
        {/* 休日表示 */}
        {isHoliday() && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">休日</span>
          </div>
        )}
        {/* 右上に詳細・リンクアイコン */}
        <div className="absolute top-2 right-2 flex space-x-1 z-10 sm:top-1 sm:right-1">
          <button
            onClick={e => { e.stopPropagation(); setShowInfo(true); }}
            className="p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
            title="店舗詳細"
          >
            <Info size={18} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); if (shop.homepage_url) window.open(shop.homepage_url, '_blank') }}
            className={`p-1 rounded-full bg-white/80 hover:bg-white transition-colors ${shop.homepage_url ? 'text-blue-600' : 'text-gray-400'}`}
            title="ホームページ"
            disabled={!shop.homepage_url}
          >
            <Globe size={18} />
          </button>
        </div>
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 left-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors sm:top-1 sm:left-1"
        >
          <Heart
            size={20}
            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </button>
      </div>
      {/* 店舗詳細モーダル */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 min-w-[320px] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Shop Information</h2>
              <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-gray-800">×</button>
            </div>
            <div className="space-y-2">
              <div><span className="font-semibold">Shop Name: </span>{shop.name}</div>
              <div><span className="font-semibold">Business Type: </span>{shop.category}</div>
              <div><span className="font-semibold">Address: </span>{shop.address}</div>
              <div><span className="font-semibold">Phone: </span>{shop.phone}</div>
              <div><span className="font-semibold">URL: </span>{shop.homepage_url ? (<a href={shop.homepage_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{shop.homepage_url}</a>) : 'Not registered'}</div>
              <div><span className="font-semibold">Start Time: </span>{shop.hours_start || ''}</div>
              <div><span className="font-semibold">End Time: </span>{shop.hours_end || ''}</div>
              <div><span className="font-semibold">Holidays: </span>{shop.holidays && shop.holidays.length > 0 ? shop.holidays.map(date => new Date(date).toLocaleDateString()).join(', ') : 'Not set'}</div>
              <div><span className="font-semibold">Job Recruitment: </span>{shop.recruit ? 'Available' : 'Not available'}</div>
              <div><span className="font-semibold">Announcement: </span>{shop.commercial_text}</div>
              {/* ここまでが基本情報。AIチャット設定やラグはこの下に追加可能 */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}