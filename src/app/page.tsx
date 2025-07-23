'use client'

import React, { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { ShoppingStreet } from '@/components/ShoppingStreet'
import { FacilitiesPanel } from '@/components/FacilitiesPanel'
import { ClockTower } from '@/components/ClockTower'
import { ChatWindow } from '@/components/ChatWindow'

import SettingsButton from '@/components/SettingsButton'
import { TopLeftIcons } from '@/components/TopLeftIcons'
import { Shop } from '../types'
import { supabase } from '@/lib/supabaseClient';
import EntityEditForm from '@/components/EntityEditForm';
import { HolidayCalendar } from '@/components/HolidayCalendar';
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { v4 as uuidv4 } from 'uuid';
import { Trash2 } from 'lucide-react';

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

  // Supabaseからデータを読み込む
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data from Supabase...');
        
        // 店舗データを読み込み
        const { data: shopsData, error: shopsError } = await supabase
          .from('shops')
          .select('*');
        
        if (shopsError) {
          console.error('Error loading shops:', shopsError);
        } else {
          console.log('Loaded shops:', shopsData);
          setShops(shopsData || []);
        }
        
        // 施設データを読み込み
        const { data: facilitiesData, error: facilitiesError } = await supabase
          .from('facilities')
          .select('*');
        
        if (facilitiesError) {
          console.error('Error loading facilities:', facilitiesError);
        } else {
          console.log('Loaded facilities:', facilitiesData);
          setFacilities(facilitiesData || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, [setShops, setFacilities]);

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
    try {
      console.log('handleSaveShop - Saving shop:', updatedShop);
      console.log('handleSaveShop - Selected shop ID:', selectedShopId);
      
      if (!selectedShopId) {
        console.error('No shop selected');
        alert('店舗が選択されていません');
        return;
      }
      
      // データベースのカラム名に合わせてデータを整形
      const shopData = {
        name: updatedShop.name || '',
        category: updatedShop.category || '',
        stance: updatedShop.stance || '',
        appearance: updatedShop.appearance || updatedShop.icon || '🏪',
        commercial_text: updatedShop.commercial_text || '',
        homepage_url: updatedShop.homepage_url || '',
        hours_start: updatedShop.hours_start || '',
        hours_end: updatedShop.hours_end || '',
        recruit: updatedShop.recruit || '',
        phone: updatedShop.phone || '',
        address: updatedShop.address || '',
        vision_enabled: updatedShop.vision_enabled ?? false,
        holidays: updatedShop.holidays || [],
        position: updatedShop.position || {}
      };
      
      console.log('handleSaveShop - Processed shop data:', shopData);
      
      // データベースに保存
      const { error } = await supabase
        .from('shops')
        .update(shopData)
        .eq('id', selectedShopId);
      
      if (error) {
        console.error('Error saving shop:', error);
        alert('店舗の保存に失敗しました: ' + error.message);
        return;
      }
      
      // ローカル状態を更新
      setShops(shops.map(s => s.id === selectedShopId ? { ...s, ...shopData } : s));
      setSelectedShopId(null);
      setAddingShop(false);
      
      console.log('Shop saved successfully');
      alert('店舗の保存が完了しました');
    } catch (error) {
      console.error('Error in handleSaveShop:', error);
      alert('店舗の保存中にエラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ブラックテーマの背景エフェクト */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-gray-900/30 to-black pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_50%)] pointer-events-none" />
      
      <TopLeftIcons
        showMyStreet={showMyStreet}
        onToggleMyStreet={() => setShowMyStreet(s => !s)}
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <Card className="bg-gray-900 border-gray-700 max-w-lg w-full mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettingsOptions(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => {
                  setSettingsType('basic')
                  setShowSettingsOptions(false)
                  setShowSettings(true)
                }}
                className="w-full p-4 text-left bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 h-auto"
              >
                <div className="text-lg font-semibold break-words">Basic Settings</div>
                <div className="text-sm opacity-80 mt-1 break-words">Community name and public facilities</div>
              </Button>
              <Button
                onClick={() => {
                  setSettingsType('shop')
                  setShowSettingsOptions(false)
                  setShowSettings(true)
                }}
                className="w-full p-4 text-left bg-green-600 hover:bg-green-700 text-white border border-green-500 h-auto"
              >
                <div className="text-lg font-semibold break-words">Shops & Offices</div>
                <div className="text-sm opacity-80 mt-1 break-words">Manage shops, offices and their settings</div>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-600 min-w-[700px] max-w-3xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">
                  {settingsType === 'basic' ? 'Basic Settings' : 'Shops & Offices'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSettings(false)
                    setShowSettingsOptions(true)
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* コミュニティ名編集欄を追加 */}
              {settingsType === 'basic' && (
                <div className="mb-6">
                  <label className="block font-semibold mb-1 text-white">Community Name</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      className="bg-gray-700 border-gray-600 text-white"
                      value={editingCommunityTitle}
                      onChange={e => setEditingCommunityTitle(e.target.value)}
                      placeholder="e.g. MachiMachi Shopping Street"
                    />
                    <Button
                      onClick={() => setCommunityTitle(editingCommunityTitle)}
                      disabled={editingCommunityTitle === communityTitle}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}

              {/* 基本設定（公共施設） */}
              {settingsType === 'basic' && (
                <div className="flex gap-6 relative">
                  {/* 左カラム：施設リスト＋追加ボタン */}
                  <div className="w-1/3 border-r border-gray-600 pr-4 max-h-96 overflow-y-auto">
                    <div className="font-semibold mb-2 text-white">Public Facilities</div>
                    {facilities.map(facility => (
                      <div
                        key={facility.id}
                        className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                          selectedFacilityId === facility.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                        }`}
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
                    <Button
                      className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        setAddingFacility(true);
                        setSelectedFacilityId(null);
                        setNewFacility({ ...initialFacility, id: uuidv4() });
                      }}
                    >
                      ＋ Add Facility
                    </Button>
                  </div>
                  {/* 右カラム：編集パネル */}
                  <div className="flex-1 max-h-96 overflow-y-auto">
                    {addingFacility ? (
                      // 新規追加フォーム
                      <div>
                        <div className="font-semibold mb-2 text-white">Add New Facility</div>
                        <div className="space-y-2">
                          <Input
                            type="text"
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Facility Name"
                            value={newFacility.name}
                            onChange={e => setNewFacility(s => ({ ...s, name: e.target.value }))}
                          />
                          <Input
                            type="text"
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Icon (emoji)"
                            value={newFacility.icon}
                            onChange={e => setNewFacility(s => ({ ...s, icon: e.target.value }))}
                          />
                          <Input
                            type="text"
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Category"
                            value={newFacility.category}
                            onChange={e => setNewFacility(s => ({ ...s, category: e.target.value }))}
                          />
                          <Input
                            type="text"
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Philosophy"
                            value={newFacility.philosophy}
                            onChange={e => setNewFacility(s => ({ ...s, philosophy: e.target.value }))}
                          />
                          <Input
                            type="text"
                            className="bg-gray-700 border-gray-600 text-white"
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
                            <label htmlFor="facilityVisible" className="text-gray-300">Show on Street</label>
                          </div>
                          <div>
                            <Button
                              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => {
                                const id = uuidv4();
                                setFacilities([...facilities, { ...newFacility, id }]);
                                setNewFacility({ ...initialFacility, id: uuidv4() });
                                setAddingFacility(false);
                                setSelectedFacilityId(id);
                              }}
                            >
                              Save
                            </Button>
                          </div>
                          <div>
                            <Button
                              variant="outline"
                              className="mt-4 w-full border-gray-600 text-gray-300 hover:text-white"
                              onClick={() => {
                                setAddingFacility(false);
                                setNewFacility({ ...initialFacility, id: uuidv4() });
                              }}
                            >
                              Cancel
                            </Button>
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
                  <div className="w-1/3 border-r border-gray-600 pr-4 max-h-96 overflow-y-auto" ref={shopListRef}>
                    <div className="font-semibold mb-2 text-white">Shop & Office List</div>
                                      {shops.map(shop => (
                    <div
                      key={shop.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        selectedShopId === shop.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <div 
                        className="flex items-center space-x-2 flex-1"
                        onClick={() => { 
                          console.log('Selecting shop:', shop);
                          setSelectedShopId(shop.id); 
                          setAddingShop(false); 
                        }}
                      >
                        <span className="text-2xl">{shop.appearance}</span>
                        <span>{shop.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm(`「${shop.name}」を削除しますか？`)) {
                            try {
                              const { error } = await supabase
                                .from('shops')
                                .delete()
                                .eq('id', shop.id);
                              
                              if (error) {
                                alert('削除に失敗しました: ' + error.message);
                                return;
                              }
                              
                              setShops(shops.filter(s => s.id !== shop.id));
                              if (selectedShopId === shop.id) {
                                setSelectedShopId(null);
                              }
                              alert('店舗を削除しました');
                            } catch (error) {
                              console.error('Error deleting shop:', error);
                              alert('削除中にエラーが発生しました');
                            }
                          }
                        }}
                        className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                    <Button
                      className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => { setAddingShop(true); setSelectedShopId(null); }}
                    >
                      ＋ Add Shop
                    </Button>
                  </div>
                  <div className="flex-1 max-h-96 overflow-y-auto">
                    {addingShop ? (
                      // 新規追加フォーム
                      <div>
                        <div className="font-semibold mb-2 text-white">Add New Shop & Office</div>
                        <div className="space-y-2">
                          <Input
                            type="text"
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Shop Name"
                            value={newShop.name}
                            onChange={e => setNewShop(s => ({ ...s, name: e.target.value }))}
                          />
                          <Input
                            type="text"
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Business Type"
                            value={newShop.category}
                            onChange={e => setNewShop(s => ({ ...s, category: e.target.value }))}
                          />
                          <Input
                            type="text"
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Icon (emoji) - e.g., 🏪 🍕 🏥"
                            value={newShop.appearance}
                            onChange={e => setNewShop(s => ({ ...s, appearance: e.target.value }))}
                          />
                          <Input
                            type="text"
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Address"
                            value={newShop.address}
                            onChange={e => setNewShop(s => ({ ...s, address: e.target.value }))}
                          />
                          <Input
                            type="text"
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Phone Number"
                            value={newShop.phone}
                            onChange={e => setNewShop(s => ({ ...s, phone: e.target.value }))}
                          />
                          <Input
                            type="text"
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="URL"
                            value={newShop.homepage_url}
                            onChange={e => setNewShop(s => ({ ...s, homepage_url: e.target.value }))}
                          />
                          <div className="flex space-x-2">
                            <select
                              className="bg-gray-700 border-gray-600 text-white rounded px-2 py-1 w-1/2"
                              value={newShop.hours_start || ''}
                              onChange={e => setNewShop(s => ({ ...s, hours_start: e.target.value }))}
                            >
                              <option value="">Start Time</option>
                              {Array.from({length: 24}, (_, i) => `${i}:00`).map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                            <select
                              className="bg-gray-700 border-gray-600 text-white rounded px-2 py-1 w-1/2"
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
                            <label htmlFor="recruit" className="text-gray-300">Job Recruitment Available</label>
                          </div>
                          <div>
                            <label className="block font-semibold mb-1 text-white">Holidays</label>
                            <HolidayCalendar
                              selectedDates={newShop.holidays || []}
                              onDateChange={(dates) => setNewShop(s => ({ ...s, holidays: dates }))}
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1 text-white">Announcement</label>
                            <Input
                              type="text"
                              className="bg-gray-700 border-gray-600 text-white"
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
                              <label htmlFor="visionEnabled" className="text-gray-300">Display on Vision</label>
                            </div>
                          </div>
                          <div>
                            <label className="block font-semibold mb-1 text-white">AI Chat Settings</label>
                            <Textarea
                              className="bg-gray-700 border-gray-600 text-white"
                              rows={3}
                              value={newShop.stance}
                              onChange={e => setNewShop(s => ({ ...s, stance: e.target.value }))}
                              placeholder="AI chat character and description"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1 text-white">Knowledge Base (Text Files)</label>
                            <div className="text-sm text-gray-400 mb-2">
                              店舗を保存してからファイルをアップロードしてください
                            </div>
                          </div>
                          <div>
                            <Button
                              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={async () => {
                                try {
                                  console.log('Creating new shop:', newShop);
                                  
                                  if (!newShop.name.trim()) {
                                    alert('店舗名を入力してください');
                                    return;
                                  }
                                  
                                  const id = uuidv4();
                                  const position = getNextShopPosition(shops);
                                  
                                  const newShopObj = {
                                    id,
                                    name: newShop.name.trim(),
                                    category: newShop.category || '',
                                    stance: newShop.stance || '',
                                    appearance: newShop.appearance || '🏪', // デフォルトアイコン
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
                                  
                                  console.log('New shop object:', newShopObj);
                                  
                                  // shopsテーブルにinsert
                                  const { error: shopInsertError } = await supabase.from('shops').insert(newShopObj);
                                  if (shopInsertError) {
                                    console.error('Shop insert error:', shopInsertError);
                                    alert('店舗の登録に失敗しました: ' + shopInsertError.message);
                                    return;
                                  }
                                  
                                  // ローカル状態用にiconプロパティを追加
                                  const shopWithIcon = {
                                    ...newShopObj,
                                    icon: newShopObj.appearance // TypeScript型定義用
                                  };
                                  setShops([...shops, shopWithIcon]);
                                  setShopDetails(details => ({
                                    ...details,
                                    [id]: {
                                      name: newShop.name.trim(),
                                      category: newShop.category,
                                      hours: newShop.hours_start,
                                      commercial_text: newShop.commercial_text,
                                      stance: newShop.stance,
                                    }
                                  }));
                                  setNewShop({ ...initialShop, id: uuidv4() });
                                  setAddingShop(false);
                                  setSelectedShopId(id);
                                  
                                  console.log('Shop created successfully');
                                  alert('店舗を登録しました');
                                } catch (error) {
                                  console.error('Error creating shop:', error);
                                  alert('店舗の作成中にエラーが発生しました');
                                }
                              }}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      selectedShopId ? (
                        // ショップ編集パネル
                        <div className="space-y-4">
                          {(() => {
                            const selectedShop = shops.find(s => s.id === selectedShopId);
                            console.log('Selected shop for editing:', selectedShop);
                            if (!selectedShop) {
                              console.error('Selected shop not found:', selectedShopId);
                              return <div className="text-red-400">店舗が見つかりません</div>;
                            }
                            return (
                              <EntityEditForm
                                entity={selectedShop}
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
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="text-gray-400">Please select a shop or office</div>
                      )
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {timeMode === 'night' && (
        <div className="fixed inset-0 pointer-events-none">
          {/* より多くの星を配置 */}
          {[...Array(50)].map((_, i) => {
            const top = Math.random() * 90 + 2; // 2%〜92%
            const left = Math.random() * 95 + 1; // 1%〜96%
            const size = Math.random() * 3 + 1; // 1px〜4px
            const opacity = Math.random() * 0.8 + 0.2; // 0.2〜1
            const delay = Math.random() * 3; // 0〜3秒のランダム遅延
            return (
              <div
                key={i}
                className="absolute bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity,
                  filter: 'blur(0.5px)',
                  animationDelay: `${delay}s`
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}