'use client'

import React, { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { ShoppingStreet } from '@/components/ShoppingStreet'
import { FacilitiesPanel } from '@/components/FacilitiesPanel'
import { ClockTower } from '@/components/ClockTower'
import { ChatWindow } from '@/components/ChatWindow'
import { NightModeToggle } from '@/components/NightModeToggle'
import SettingsButton from '@/components/SettingsButton'
import { TopLeftIcons } from '@/components/TopLeftIcons'
import { Shop } from '../types'
import { supabase } from '@/lib/supabaseClient';
import ShopEditForm from '../components/ShopEditForm';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const { timeMode, setTimeMode } = useStore()
  const [showSettings, setShowSettings] = React.useState(false)
  const [streetName, setStreetName] = React.useState('まちまちチャット商店街')
  const [editingStreetName, setEditingStreetName] = React.useState(streetName)
  const { facilities } = useStore()
  const [visibleFacilityIds, setVisibleFacilityIds] = React.useState(facilities.filter(f => f.isVisible).map(f => f.id))
  // 施設ごとの名前・お知らせ内容を管理
  const [facilityDetails, setFacilityDetails] = React.useState(() =>
    facilities.reduce((acc, f) => {
      acc[f.id] = { name: f.name, announcement: '' }
      return acc
    }, {} as Record<string, { name: string; announcement: string }>)
  )
  const { shops, setShops } = useStore()
  const [settingsTab, setSettingsTab] = React.useState<'facility' | 'shop'>('facility')
  const [selectedShopId, setSelectedShopId] = React.useState<string | null>(null)
  const [shopDetails, setShopDetails] = React.useState(() =>
    shops.reduce((acc, s) => {
      acc[s.id] = {
        name: s.name,
        category: s.category,
        hours: '',
        commercial_text: s.commercial_text,
        stance: s.stance,
      }
      return acc
    }, {} as Record<string, { name: string; category: string; hours: string; commercial_text: string; stance: string }>)
  )
  const [addingShop, setAddingShop] = React.useState(false)
  const [newShop, setNewShop] = React.useState({
    name: '',
    category: '',
    hours: '',
    hoursStart: '',
    hoursEnd: '',
    recruit: '',
    phone: '',
    address: '',
    catchphrase: '',
    commercialText: '',
    stance: '',
    appearance: '🏪',
    homepageUrl: '',
    visionEnabled: false,
  })
  const { favoriteShops } = useStore()
  const [showMyStreet, setShowMyStreet] = React.useState(false)
  const shopListRef = useRef<HTMLDivElement>(null)
  const [uploading, setUploading] = React.useState(false);
  const [uploadMessage, setUploadMessage] = React.useState<string | null>(null);
  const [shopLags, setShopLags] = React.useState<Record<string, Array<{ id: string, file_url: string, file_name: string }>>>({});
  const [pendingLags, setPendingLags] = React.useState<Array<{ file_url: string, file_name: string }>>([]);

  // 追加時の自動配置ロジック（4列対応）
  function getNextShopPosition(currentShops: import('@/types').Shop[]): { row: number; column: number } {
    const count = currentShops.length
    const column = count % 4
    const row = Math.floor(count / 4)
    return { row, column }
  }

  // 店舗選択時にラグ一覧を取得
  useEffect(() => {
    const fetchLags = async () => {
      if (!selectedShopId) return;
      const { data } = await supabase.from('shop_lags').select('id, file_url, file_name').eq('shop_id', selectedShopId);
      setShopLags(lags => ({ ...lags, [selectedShopId]: data || [] }));
    };
    fetchLags();
  }, [selectedShopId]);

  useEffect(() => {
    const hour = new Date().getHours()
    const isNight = hour >= 18 || hour < 6
    setTimeMode(isNight ? 'night' : 'day')
  }, [setTimeMode])

  useEffect(() => {
    if (shopListRef.current) {
      shopListRef.current.scrollTop = shopListRef.current.scrollHeight
    }
  }, [shops.length])

  // onUploadの定義
  const handleUpload = async (file: File) => {
    if (!selectedShopId) {
      setUploadMessage('店舗IDが不正です。');
      return;
    }
    setUploading(true);
    setUploadMessage(null);
    const uniqueName = `${Date.now()}_${file.name}`;
    const filePath = `${selectedShopId}/${uniqueName}`;
    const { data, error } = await supabase.storage
      .from('shop-lags')
      .upload(filePath, file);
    if (error) {
      setUploadMessage('アップロード失敗: ' + error.message);
      setUploading(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage
      .from('shop-lags')
      .getPublicUrl(filePath);
    // DB登録
    const { error: insertError } = await supabase.from('shop_lags').insert({
      shop_id: selectedShopId,
      file_url: publicUrlData.publicUrl,
      file_name: uniqueName,
      description: '',
    });
    if (insertError) {
      setUploadMessage('DB登録失敗: ' + insertError.message);
      setUploading(false);
      return;
    }
    // 再取得
    const { data: lags } = await supabase.from('shop_lags').select('id, file_url, file_name').eq('shop_id', selectedShopId);
    setShopLags(l => ({ ...l, [selectedShopId]: lags || [] }));
    setUploadMessage('アップロード完了: ' + file.name);
    setUploading(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${
      timeMode === 'night' ? 'night-mode' : 'day-mode'
    }`}>
      {/* 地球のイメージとなる大きな丸（さらにうっすら・地球っぽく、波模様追加） */}
      <div className="fixed left-1/2 bottom-[-400px] -translate-x-1/2 z-0 pointer-events-none">
        <div className="w-[1200px] h-[1200px] rounded-full bg-gradient-to-b from-white via-blue-50 to-green-100 shadow-2xl opacity-40 relative">
          {/* 雲や大陸のニュアンス */}
          <div className="absolute left-1/4 top-1/3 w-[300px] h-[120px] bg-white/30 rounded-full blur-2xl opacity-60" />
          <div className="absolute right-1/5 bottom-1/4 w-[220px] h-[90px] bg-green-200/30 rounded-full blur-2xl opacity-40" />
          {/* 波模様（同系色で地球感アップ） */}
          <div className="absolute left-1/3 top-1/2 w-[400px] h-[60px] bg-blue-200/30 rounded-full blur-2xl opacity-30 rotate-12" />
          <div className="absolute left-1/2 top-2/3 w-[350px] h-[50px] bg-green-300/20 rounded-full blur-2xl opacity-30 -rotate-6" />
          <div className="absolute right-1/3 top-1/4 w-[250px] h-[40px] bg-blue-100/30 rounded-full blur-2xl opacity-20 rotate-3" />
        </div>
      </div>
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-green-200/30 pointer-events-none" />
      
      <TopLeftIcons
        showMyStreet={showMyStreet}
        onToggleMyStreet={() => setShowMyStreet(s => !s)}
        onToggleNightMode={() => setTimeMode(timeMode === 'day' ? 'night' : 'day')}
      />
      <FacilitiesPanel visibleFacilityIds={visibleFacilityIds} facilityDetails={facilityDetails} />
      <ClockTower />
      <SettingsButton onClick={() => setShowSettings(true)} />
      
      <main className="relative z-10">
        <ShoppingStreet myStreet={showMyStreet} streetName={streetName} />
      </main>
      
      <ChatWindow />

      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 min-w-[700px] max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">設定</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-800">×</button>
            </div>
            <div className="mb-6">
              <label className="block font-semibold mb-2">商店街名</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingStreetName}
                  onChange={e => setEditingStreetName(e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setStreetName(editingStreetName)}
                >保存</button>
              </div>
            </div>
            <div className="mb-4 flex space-x-4 border-b pb-2">
              <button className={`px-4 py-2 rounded-t ${settingsTab === 'facility' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setSettingsTab('facility')}>公共施設</button>
              <button className={`px-4 py-2 rounded-t ${settingsTab === 'shop' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setSettingsTab('shop')}>店舗・事務所</button>
            </div>
            {settingsTab === 'facility' && (
              <div>
                <div className="font-semibold mb-2">表示する施設アイコン</div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {facilities.map(facility => (
                    <div key={facility.id} className="border rounded p-2 flex items-start space-x-2">
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={visibleFacilityIds.includes(facility.id)}
                          onChange={e => {
                            setVisibleFacilityIds(ids =>
                              e.target.checked
                                ? [...ids, facility.id]
                                : ids.filter(id => id !== facility.id)
                            )
                          }}
                        />
                      </div>
                      <span className="text-2xl pt-1">{facility.icon}</span>
                      <div className="flex-1">
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full mb-1"
                          value={facilityDetails[facility.id]?.name || ''}
                          onChange={e => setFacilityDetails(details => ({
                            ...details,
                            [facility.id]: {
                              ...details[facility.id],
                              name: e.target.value
                            }
                          }))}
                          placeholder="施設名"
                        />
                        <textarea
                          className="border rounded px-2 py-1 w-full text-xs"
                          rows={2}
                          value={facilityDetails[facility.id]?.announcement || ''}
                          onChange={e => setFacilityDetails(details => ({
                            ...details,
                            [facility.id]: {
                              ...details[facility.id],
                              announcement: e.target.value
                            }
                          }))}
                          placeholder="お知らせ内容"
                        />
                        <input type="file" className="border rounded px-2 py-1 w-full mt-1" />
                        <div className="text-xs text-gray-500 mt-1">アップロードしたファイルは施設のお知らせラグとして利用できます（今はUIのみ）</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {settingsTab === 'shop' && (
              <div className="flex gap-6 relative">
                <div className="w-1/3 border-r pr-4 max-h-96 overflow-y-auto" ref={shopListRef}>
                  <div className="font-semibold mb-2">店舗・事務所リスト</div>
                  {shops.map(shop => (
                    <div
                      key={shop.id}
                      className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${selectedShopId === shop.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                      onClick={() => { setSelectedShopId(shop.id); setAddingShop(false); }}
                    >
                      <span className="text-2xl">{shop.appearance}</span>
                      <span>{shop.name}</span>
                    </div>
                  ))}
                  <button
                    className="mt-4 w-full py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition-colors"
                    onClick={() => { setAddingShop(true); setSelectedShopId(null); }}
                  >
                    ＋ 店舗追加
                  </button>
                </div>
                <div className="flex-1">
                  {addingShop ? (
                    // 新規追加フォーム
                    <div>
                      <div className="font-semibold mb-2">新規店舗・事務所の追加</div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="店舗名"
                          value={newShop.name}
                          onChange={e => setNewShop(s => ({ ...s, name: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="業種"
                          value={newShop.category}
                          onChange={e => setNewShop(s => ({ ...s, category: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="住所"
                          value={newShop.address}
                          onChange={e => setNewShop(s => ({ ...s, address: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="電話番号"
                          value={newShop.phone}
                          onChange={e => setNewShop(s => ({ ...s, phone: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="URL"
                          value={newShop.homepageUrl}
                          onChange={e => setNewShop(s => ({ ...s, homepageUrl: e.target.value }))}
                        />
                        <div className="flex space-x-2">
                          <select
                            className="border rounded px-2 py-1 w-1/2"
                            value={newShop.hoursStart || ''}
                            onChange={e => setNewShop(s => ({ ...s, hoursStart: e.target.value }))}
                          >
                            <option value="">開始時刻</option>
                            {Array.from({length: 24}, (_, i) => `${i}:00`).map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <select
                            className="border rounded px-2 py-1 w-1/2"
                            value={newShop.hoursEnd || ''}
                            onChange={e => setNewShop(s => ({ ...s, hoursEnd: e.target.value }))}
                          >
                            <option value="">終了時刻</option>
                            {Array.from({length: 24}, (_, i) => `${i}:00`).map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="recruit"
                            checked={!!newShop.recruit}
                            onChange={e => setNewShop(s => ({ ...s, recruit: e.target.checked ? 'あり' : '' }))}
                          />
                          <label htmlFor="recruit">求人募集あり</label>
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">お知らせ</label>
                          <input
                            type="text"
                            className="border rounded px-2 py-1 w-full"
                            placeholder="お知らせ（例：セール情報など）"
                            value={newShop.commercialText}
                            onChange={e => setNewShop(s => ({ ...s, commercialText: e.target.value }))}
                          />
                          <div className="flex items-center space-x-2 mt-1">
                            <input
                              type="checkbox"
                              id="visionEnabled"
                              checked={!!newShop.visionEnabled}
                              onChange={e => setNewShop(s => ({ ...s, visionEnabled: e.target.checked }))}
                            />
                            <label htmlFor="visionEnabled">ビジョンに流す</label>
                          </div>
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">AIチャット設定</label>
                          <textarea
                            className="border rounded px-2 py-1 w-full"
                            rows={3}
                            value={newShop.stance}
                            onChange={e => setNewShop(s => ({ ...s, stance: e.target.value }))}
                            placeholder="AIチャットのキャラクターや説明文など"
                          />
                        </div>
                        <div>
                          <button
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
                            onClick={async () => {
                              const id = uuidv4(); // ← uuidでID生成
                              const position = getNextShopPosition(shops);
                              const newShopObj = {
                                id,
                                name: newShop.name || '新店舗',
                                category: newShop.category || '',
                                stance: newShop.stance || '',
                                appearance: newShop.appearance || '',
                                commercial_text: newShop.commercialText || '',
                                hours_start: newShop.hoursStart || '',
                                hours_end: newShop.hoursEnd || '',
                                recruit: newShop.recruit || '',
                                phone: newShop.phone || '',
                                address: newShop.address || '',
                                homepage_url: newShop.homepageUrl || '',
                                vision_enabled: newShop.visionEnabled ?? false,
                                position,
                              };
                              // shopsテーブルにinsert
                              const { error: shopInsertError } = await supabase.from('shops').insert(newShopObj);
                              if (shopInsertError) {
                                alert('店舗登録失敗: ' + shopInsertError.message);
                                return;
                              }
                              setShops([...shops, newShopObj]);
                              setShopDetails(details => ({
                                ...details,
                                [id]: {
                                  name: newShop.name || '新店舗',
                                  category: newShop.category,
                                  hours: newShop.hours,
                                  commercialText: newShop.commercialText,
                                  stance: newShop.stance,
                                }
                              }));
                              setNewShop({ name: '', category: '', hours: '', hoursStart: '', hoursEnd: '', recruit: '', phone: '', address: '', catchphrase: '', commercialText: '', stance: '', appearance: '🏪', homepageUrl: '', visionEnabled: false });
                              setAddingShop(false);
                              setSelectedShopId(id);
                            }}
                          >保存</button>
                        </div>
                      </div>
                    </div>
                  ) : selectedShopId ? (
                    // 既存店舗編集フォーム
                    <ShopEditForm
                      shop={shops.find(s => s.id === selectedShopId)!}
                      lags={shopLags[selectedShopId] || []}
                      uploading={uploading}
                      uploadMessage={uploadMessage}
                      onUpload={handleUpload}
                      onDeleteLag={async (lagId) => {
                        await supabase.from('shop_lags').delete().eq('id', lagId);
                        const { data: lags } = await supabase.from('shop_lags').select('id, file_url, file_name').eq('shop_id', selectedShopId);
                        setShopLags(l => ({ ...l, [selectedShopId]: lags || [] }));
                      }}
                      onSave={updatedShop => {
                        setShops(shops.map(s => s.id === selectedShopId ? { ...s, ...updatedShop } : s));
                        setSelectedShopId(null);
                        setAddingShop(false);
                      }}
                      onCancel={() => setSelectedShopId(null)}
                    />
                  ) : (
                    <div className="text-gray-400">店舗・事務所を選択してください</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {timeMode === 'night' && (
        <div className="fixed inset-0 pointer-events-none">
          {/* 星をたくさんランダムに配置 */}
          {[...Array(30)].map((_, i) => {
            const top = Math.random() * 90 + 2; // 2%〜92%
            const left = Math.random() * 95 + 1; // 1%〜96%
            const size = Math.random() * 2 + 1; // 1px〜3px
            const opacity = Math.random() * 0.5 + 0.5; // 0.5〜1
            return (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-pulse"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity,
                  filter: 'blur(0.5px)'
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}