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
        className="shop-building w-[3cm] h-[3cm] bg-white border border-gray-200 shadow-md rounded-lg flex items-center justify-center relative text-gray-800"
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
            onClick={e => { e.stopPropagation(); if (shop.homepageUrl) window.open(shop.homepageUrl, '_blank') }}
            className={`p-1 rounded-full bg-white/80 hover:bg-white transition-colors ${shop.homepageUrl ? 'text-blue-600' : 'text-gray-400'}`}
            title="ホームページ"
            disabled={!shop.homepageUrl}
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
              <h2 className="text-lg font-bold">店舗情報</h2>
              <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-gray-800">×</button>
            </div>
            <div className="space-y-2">
              <div><span className="font-semibold">店舗名：</span>{shop.name}</div>
              <div><span className="font-semibold">業種：</span>{shop.category}</div>
              <div><span className="font-semibold">住所：</span>{shop.address}</div>
              <div><span className="font-semibold">電話番号：</span>{shop.phone}</div>
              <div><span className="font-semibold">URL：</span>{shop.homepageUrl ? (<a href={shop.homepageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{shop.homepageUrl}</a>) : '未登録'}</div>
              <div><span className="font-semibold">開始時間：</span>{shop.hoursStart || ''}</div>
              <div><span className="font-semibold">終了時間：</span>{shop.hoursEnd || ''}</div>
              <div><span className="font-semibold">求人募集：</span>{shop.recruit ? 'あり' : 'なし'}</div>
              <div><span className="font-semibold">お知らせ：</span>{shop.commercialText}</div>
              {/* ここまでが基本情報。AIチャット設定やラグはこの下に追加可能 */}
              {lags.length > 0 && (
                <div className="mt-4">
                  <div className="font-semibold text-xs mb-1">アップロード済みラグ一覧</div>
                  <ul className="space-y-1">
                    {lags.map(lag => (
                      <li key={lag.id} className="flex items-center space-x-2">
                        <a href={lag.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{lag.file_name}</a>
                        <button
                          className="text-xs text-red-600 hover:underline"
                          onClick={async () => {
                            const filePath = lag.file_url.split('/shop-lags/')[1];
                            if (filePath) {
                              await supabase.storage.from('shop-lags').remove([filePath]);
                            }
                            await supabase.from('shop_lags').delete().eq('id', lag.id);
                            const { data } = await supabase.from('shop_lags').select('id, file_url, file_name').eq('shop_id', shop.id);
                            setLags(data || []);
                          }}
                        >削除</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}