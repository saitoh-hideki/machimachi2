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
import EntityEditForm from '@/components/EntityEditForm';
import { HolidayCalendar } from '@/components/HolidayCalendar';

import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const { timeMode, setTimeMode } = useStore()
  const [showSettings, setShowSettings] = React.useState(false)
  const [showSettingsOptions, setShowSettingsOptions] = React.useState(false)
  const [settingsType, setSettingsType] = React.useState<'basic' | 'shop'>('basic')
  const [streetName, setStreetName] = React.useState('まちまちチャット商店街')
  const [editingStreetName, setEditingStreetName] = React.useState(streetName)
  const { facilities, setFacilities, communityTitle, setCommunityTitle } = useStore()
  const [editingCommunityTitle, setEditingCommunityTitle] = React.useState(communityTitle)
  React.useEffect(() => { setEditingCommunityTitle(communityTitle) }, [communityTitle])
  const [selectedFacilityId, setSelectedFacilityId] = React.useState<string | null>(null)
  const [addingFacility, setAddingFacility] = React.useState(false)
  // 施設追加時の初期値
  const initialFacility = {
    id: uuidv4(),
    name: '',
    icon: '',
    category: '',
    philosophy: '',
    responseStance: '',
    isVisible: true,
    stance: '',
    commercial_text: '',
    vision_enabled: false,
    address: '',
    phone: '',
    homepage_url: '',
    hours_start: '',
    hours_end: '',
    recruit: '',
    holidays: [],
    communityName: '',
  };
  const [newFacility, setNewFacility] = React.useState(initialFacility);
  const { shops, setShops } = useStore()
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
  const initialShop = {
    id: uuidv4(),
    name: '',
    icon: '',
    category: '',
    stance: '',
    appearance: '',
    commercial_text: '',
    hours_start: '',
    hours_end: '',
    recruit: '',
    phone: '',
    address: '',
    homepage_url: '',
    vision_enabled: false,
    position: {},
    holidays: [] as string[],
  };
  const [newShop, setNewShop] = React.useState(initialShop);
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

  const handleSaveFacility = async (updatedFacility: any) => {
    setFacilities(facilities.map(f => f.id === selectedFacilityId ? { ...f, ...updatedFacility } : f));
    setSelectedFacilityId(null);
    setAddingFacility(false);
  };

  const handleSaveShop = async (updatedShop: any) => {
    setShops(shops.map(s => s.id === selectedShopId ? { ...s, ...updatedShop } : s));
    setSelectedShopId(null);
    setAddingShop(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${
      timeMode === 'night' ? 'night-mode' : 'day-mode'
    }`}>
      {/* 地球のイメージとなる大きな丸（さらにうっすら・地球っぽく、波模様追加） */}
      {/* 削除ここから
      <div className="fixed left-1/2 bottom-[-400px] -translate-x-1/2 z-0 pointer-events-none">
        <div className="w-[1200px] h-[1200px] rounded-full bg-gradient-to-b from-white via-blue-50 to-green-100 shadow-2xl opacity-40 relative">
          <div className="absolute left-1/4 top-1/3 w-[300px] h-[120px] bg-white/30 rounded-full blur-2xl opacity-60" />
          <div className="absolute right-1/5 bottom-1/4 w-[220px] h-[90px] bg-green-200/30 rounded-full blur-2xl opacity-40" />
          <div className="absolute left-1/3 top-1/2 w-[400px] h-[60px] bg-blue-200/30 rounded-full blur-2xl opacity-30 rotate-12" />
          <div className="absolute left-1/2 top-2/3 w-[350px] h-[50px] bg-green-300/20 rounded-full blur-2xl opacity-30 -rotate-6" />
          <div className="absolute right-1/3 top-1/4 w-[250px] h-[40px] bg-blue-100/30 rounded-full blur-2xl opacity-20 rotate-3" />
        </div>
      </div>
      削除ここまで */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-green-200/30 pointer-events-none" />
      
      <TopLeftIcons
        showMyStreet={showMyStreet}
        onToggleMyStreet={() => setShowMyStreet(s => !s)}
        onToggleNightMode={() => setTimeMode(timeMode === 'day' ? 'night' : 'day')}
      />
      <FacilitiesPanel visibleFacilityIds={facilities.filter(f => f.isVisible).map(f => f.id)} facilityDetails={facilities.reduce((acc, f) => {
        acc[f.id] = { name: f.name, announcement: '' }
        return acc
      }, {} as Record<string, { name: string; announcement: string }>)} />
      <ClockTower />
      <SettingsButton onClick={() => setShowSettingsOptions(true)} />
      
      <main className="relative z-10">
        <ShoppingStreet myStreet={showMyStreet} streetName={communityTitle} />
      </main>
      
      <ChatWindow />

      {/* 設定オプション選択画面 */}
      {showSettingsOptions && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Settings</h2>
              <button 
                onClick={() => setShowSettingsOptions(false)} 
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSettingsType('basic')
                  setShowSettingsOptions(false)
                  setShowSettings(true)
                }}
                className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <div className="text-lg font-semibold text-blue-800">Basic Settings</div>
                <div className="text-sm text-blue-600 mt-1">Community name and public facilities</div>
              </button>
              <button
                onClick={() => {
                  setSettingsType('shop')
                  setShowSettingsOptions(false)
                  setShowSettings(true)
                }}
                className="w-full p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
              >
                <div className="text-lg font-semibold text-green-800">Shops & Offices</div>
                <div className="text-sm text-green-600 mt-1">Manage shops, offices and their settings</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 min-w-[700px] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                {settingsType === 'basic' ? 'Basic Settings' : 'Shops & Offices'}
              </h2>
              <button onClick={() => {
                setShowSettings(false)
                setShowSettingsOptions(true)
              }} className="text-gray-500 hover:text-gray-800">×</button>
            </div>

            {/* コミュニティ名編集欄を追加 */}
            {settingsType === 'basic' && (
              <div className="mb-6">
                <label className="block font-semibold mb-1">Community Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-full"
                    value={editingCommunityTitle}
                    onChange={e => setEditingCommunityTitle(e.target.value)}
                    placeholder="e.g. MachiMachi Shopping Street"
                  />
                  <button
                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setCommunityTitle(editingCommunityTitle)}
                    disabled={editingCommunityTitle === communityTitle}
                  >Save</button>
                </div>
              </div>
            )}


            {/* 基本設定（公共施設） */}
            {settingsType === 'basic' && (
              <div className="flex gap-6 relative">
                {/* 左カラム：施設リスト＋追加ボタン */}
                <div className="w-1/3 border-r pr-4 max-h-96 overflow-y-auto">
                  <div className="font-semibold mb-2">Public Facilities</div>
                  {facilities.map(facility => (
                    <div
                      key={facility.id}
                      className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${selectedFacilityId === facility.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                      onClick={() => { setSelectedFacilityId(facility.id); setAddingFacility(false); }}
                    >
                      <span className="text-2xl">{facility.icon}</span>
                      <span>{facility.name}</span>
                      <input
                        type="checkbox"
                        checked={facility.isVisible}
                        onChange={e => {
                          setFacilities(facilities.map(f => f.id === facility.id ? { ...f, isVisible: e.target.checked } : f));
                        }}
                        className="ml-auto"
                        title="Show/Hide"
                      />
                    </div>
                  ))}
                  <button
                    className="mt-4 w-full py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition-colors"
                    onClick={() => {
                      setAddingFacility(true);
                      setSelectedFacilityId(null);
                      setNewFacility({ ...initialFacility, id: uuidv4() });
                    }}
                  >
                    ＋ Add Facility
                  </button>
                </div>
                {/* 右カラム：編集パネル */}
                <div className="flex-1 max-h-96 overflow-y-auto">
                  {addingFacility ? (
                    // 新規追加フォーム
                    <div>
                      <div className="font-semibold mb-2">Add New Facility</div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="Facility Name"
                          value={newFacility.name}
                          onChange={e => setNewFacility(s => ({ ...s, name: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="Icon (emoji)"
                          value={newFacility.icon}
                          onChange={e => setNewFacility(s => ({ ...s, icon: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="Category"
                          value={newFacility.category}
                          onChange={e => setNewFacility(s => ({ ...s, category: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="Philosophy"
                          value={newFacility.philosophy}
                          onChange={e => setNewFacility(s => ({ ...s, philosophy: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="Response Stance"
                          value={newFacility.responseStance}
                          onChange={e => setNewFacility(s => ({ ...s, responseStance: e.target.value }))}
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="facilityVisible"
                            checked={!!newFacility.isVisible}
                            onChange={e => setNewFacility(s => ({ ...s, isVisible: e.target.checked }))}
                          />
                          <label htmlFor="facilityVisible">Show on Street</label>
                        </div>
                        <div>
                          <button
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
                            onClick={() => {
                              const id = uuidv4();
                              setFacilities([...facilities, { ...newFacility, id }]);
                              setNewFacility({ ...initialFacility, id: uuidv4() });
                              setAddingFacility(false);
                              setSelectedFacilityId(id);
                            }}
                          >Save</button>
                        </div>
                        <div>
                          <button
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
                            onClick={() => {
                              setAddingFacility(false);
                              setNewFacility({ ...initialFacility, id: uuidv4() });
                            }}
                          >Cancel</button>
                        </div>
                      </div>
                    </div>
                  ) : selectedFacilityId ? (
                    // 施設編集パネル
                    <EntityEditForm
                      entity={facilities.find(f => f.id === selectedFacilityId)!}
                      entityType="facility"
                      onSave={handleSaveFacility}
                      onCancel={() => setSelectedFacilityId(null)}
                    />
                  ) : (
                    <div className="text-gray-400">Please select a facility</div>
                  )}
                </div>
              </div>
            )}

            {/* ショップ&オフィス設定 */}
            {settingsType === 'shop' && (
              <div className="flex gap-6 relative">
                <div className="w-1/3 border-r pr-4 max-h-96 overflow-y-auto" ref={shopListRef}>
                  <div className="font-semibold mb-2">Shop & Office List</div>
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
                    ＋ Add Shop
                  </button>
                </div>
                <div className="flex-1 max-h-96 overflow-y-auto">
                  {addingShop ? (
                    // 新規追加フォーム
                    <div>
                      <div className="font-semibold mb-2">Add New Shop & Office</div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="Shop Name"
                          value={newShop.name}
                          onChange={e => setNewShop(s => ({ ...s, name: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="Business Type"
                          value={newShop.category}
                          onChange={e => setNewShop(s => ({ ...s, category: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="Address"
                          value={newShop.address}
                          onChange={e => setNewShop(s => ({ ...s, address: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="Phone Number"
                          value={newShop.phone}
                          onChange={e => setNewShop(s => ({ ...s, phone: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder="URL"
                          value={newShop.homepage_url}
                          onChange={e => setNewShop(s => ({ ...s, homepage_url: e.target.value }))}
                        />
                        <div className="flex space-x-2">
                          <select
                            className="border rounded px-2 py-1 w-1/2"
                            value={newShop.hours_start || ''}
                            onChange={e => setNewShop(s => ({ ...s, hours_start: e.target.value }))}
                          >
                            <option value="">Start Time</option>
                            {Array.from({length: 24}, (_, i) => `${i}:00`).map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <select
                            className="border rounded px-2 py-1 w-1/2"
                            value={newShop.hours_end || ''}
                            onChange={e => setNewShop(s => ({ ...s, hours_end: e.target.value }))}
                          >
                            <option value="">End Time</option>
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
                            onChange={e => setNewShop(s => ({ ...s, recruit: e.target.checked ? 'Available' : '' }))}
                          />
                          <label htmlFor="recruit">Job Recruitment Available</label>
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Holidays</label>
                          <HolidayCalendar
                            selectedDates={newShop.holidays || []}
                            onDateChange={(dates) => setNewShop(s => ({ ...s, holidays: dates }))}
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Announcement</label>
                          <input
                            type="text"
                            className="border rounded px-2 py-1 w-full"
                            placeholder="Announcement (e.g., sale information)"
                            value={newShop.commercial_text}
                            onChange={e => setNewShop(s => ({ ...s, commercial_text: e.target.value }))}
                          />
                          <div className="flex items-center space-x-2 mt-1">
                            <input
                              type="checkbox"
                              id="visionEnabled"
                              checked={!!newShop.vision_enabled}
                              onChange={e => setNewShop(s => ({ ...s, vision_enabled: e.target.checked }))}
                            />
                            <label htmlFor="visionEnabled">Display on Vision</label>
                          </div>
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">AI Chat Settings</label>
                          <textarea
                            className="border rounded px-2 py-1 w-full"
                            rows={3}
                            value={newShop.stance}
                            onChange={e => setNewShop(s => ({ ...s, stance: e.target.value }))}
                            placeholder="AI chat character and description"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Knowledge Base (Text Files)</label>
                          <div className="text-sm text-gray-500 mb-2">
                            店舗を保存してからファイルをアップロードしてください
                          </div>
                        </div>
                        <div>
                          <button
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
                            onClick={async () => {
                              const id = uuidv4(); // ← uuidでID生成
                              const position = getNextShopPosition(shops);
                              const newShopObj = {
                                id,
                                name: newShop.name || 'New Shop',
                                category: newShop.category || '',
                                stance: newShop.stance || '',
                                appearance: newShop.appearance || '',
                                commercial_text: newShop.commercial_text || '',
                                hours_start: newShop.hours_start || '',
                                hours_end: newShop.hours_end || '',
                                recruit: newShop.recruit || '',
                                phone: newShop.phone || '',
                                address: newShop.address || '',
                                homepage_url: newShop.homepage_url || '',
                                vision_enabled: newShop.vision_enabled ?? false,
                                holidays: newShop.holidays || [],
                                position,
                              };
                              // shopsテーブルにinsert
                              const { error: shopInsertError } = await supabase.from('shops').insert(newShopObj);
                              if (shopInsertError) {
                                alert('Shop registration failed: ' + shopInsertError.message);
                                return;
                              }
                              setShops([...shops, newShopObj]);
                              setShopDetails(details => ({
                                ...details,
                                [id]: {
                                  name: newShop.name || 'New Shop',
                                  category: newShop.category,
                                  hours: newShop.hours_start,
                                  commercial_text: newShop.commercial_text,
                                  stance: newShop.stance,
                                }
                              }));
                              setNewShop({ ...initialShop, id: uuidv4() });
                              setAddingShop(false);
                              setSelectedShopId(id);
                            }}
                          >Save</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    selectedShopId ? (
                      // ショップ編集パネル
                      <div className="space-y-4">
                        <EntityEditForm
                          entity={shops.find(s => s.id === selectedShopId)!}
                          entityType="shop"
                          lags={shopLags[selectedShopId] || []}
                          uploading={uploading}
                          uploadMessage={uploadMessage}
                          onUpload={handleUpload}
                          onDeleteLag={async (lagId: string) => {
                            await supabase.from('shop_lags').delete().eq('id', lagId);
                            const { data: lags } = await supabase.from('shop_lags').select('id, file_url, file_name').eq('shop_id', selectedShopId);
                            setShopLags((prev: any) => ({ ...prev, [selectedShopId]: lags || [] }));
                          }}
                          onSave={handleSaveShop}
                          onCancel={() => setSelectedShopId(null)}
                        />

                      </div>
                    ) : (
                      <div className="text-gray-400">Please select a shop or office</div>
                    )
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