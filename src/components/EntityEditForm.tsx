import React, { useState, useEffect } from 'react';
import { Shop, Facility } from '@/types';
import { HolidayCalendar } from './HolidayCalendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ShopLag {
  id: string;
  file_url: string;
  file_name: string;
}

type EntityEditFormProps = {
  entity: Shop | Facility;
  entityType: 'shop' | 'facility';
  lags?: ShopLag[];
  uploading?: boolean;
  uploadMessage?: string | null;
  onUpload?: (file: File) => void;
  onDeleteLag?: (lagId: string) => void;
  onSave: (updated: Shop | Facility) => void;
  onCancel: () => void;
};

const EntityEditForm: React.FC<EntityEditFormProps> = ({ entity, entityType, lags = [], uploading = false, uploadMessage = null, onUpload, onDeleteLag, onSave, onCancel }) => {
  const [form, setForm] = useState<Shop | Facility>({ ...entity });

  useEffect(() => {
    console.log('EntityEditForm - Entity changed:', entity);
    setForm({ ...entity });
  }, [entity]);

  const handleSave = () => {
    console.log('EntityEditForm - Saving entity:', form);
    console.log('EntityEditForm - Entity type:', entityType);
    console.log('EntityEditForm - Selected dates:', (form as Shop).holidays);
    
    // 型チェックとデータ整形
    if (entityType === 'shop') {
      const shopForm = form as Shop;
      const shopData = {
        ...form,
        id: shopForm.id, // IDを確実に含める
        appearance: shopForm.appearance || form.icon || '🏪',
        holidays: shopForm.holidays || []
      };
      console.log('EntityEditForm - Processed shop data:', shopData);
      onSave(shopData);
    } else {
      onSave(form);
    }
  };

  return (
    <div>
      <div className="font-semibold mb-2 text-white">Edit {entityType === 'shop' ? 'Shop & Office' : 'Facility'}</div>
      <div className="space-y-2">
        <Input
          type="text"
          className="bg-gray-700 border-gray-600 text-white"
          placeholder="Icon (emoji or image URL)"
          value={form.icon || ''}
          onChange={e => setForm(s => ({ ...s, icon: e.target.value }))}
        />
        <Input
          type="text"
          className="bg-gray-700 border-gray-600 text-white"
          placeholder={entityType === 'shop' ? 'Shop Name' : 'Facility Name'}
          value={form.name}
          onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
        />
        <Input
          type="text"
          className="bg-gray-700 border-gray-600 text-white"
          placeholder="Category"
          value={form.category}
          onChange={e => setForm(s => ({ ...s, category: e.target.value }))}
        />
        {entityType === 'shop' && (
          <Input
            type="text"
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Appearance"
            value={(form as Shop).appearance || ''}
            onChange={e => setForm(s => ({ ...s, appearance: e.target.value }))}
          />
        )}
        <Input
          type="text"
          className="bg-gray-700 border-gray-600 text-white"
          placeholder="Address"
          value={form.address}
          onChange={e => setForm(s => ({ ...s, address: e.target.value }))}
        />
        <Input
          type="text"
          className="bg-gray-700 border-gray-600 text-white"
          placeholder="Phone Number"
          value={form.phone}
          onChange={e => setForm(s => ({ ...s, phone: e.target.value }))}
        />
        <Input
          type="text"
          className="bg-gray-700 border-gray-600 text-white"
          placeholder="URL"
          value={form.homepage_url}
          onChange={e => setForm(s => ({ ...s, homepage_url: e.target.value }))}
        />
        <div className="flex space-x-2">
          <select
            className="bg-gray-700 border-gray-600 text-white rounded px-2 py-1 w-1/2"
            value={form.hours_start || ''}
            onChange={e => setForm(s => ({ ...s, hours_start: e.target.value }))}
          >
            <option value="">Start Time</option>
            {Array.from({length: 24}, (_, i) => `${i}:00`).map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          <select
            className="bg-gray-700 border-gray-600 text-white rounded px-2 py-1 w-1/2"
            value={form.hours_end || ''}
            onChange={e => setForm(s => ({ ...s, hours_end: e.target.value }))}
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
            id="recruit-edit"
            checked={!!form.recruit}
            onChange={e => setForm(s => ({ ...s, recruit: e.target.checked ? 'Available' : '' }))}
          />
          <label htmlFor="recruit-edit" className="text-gray-300">Job Recruitment Available</label>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-white">Holidays</label>
          <HolidayCalendar
            selectedDates={(form as Shop).holidays || []}
            onDateChange={(dates) => setForm(s => ({ ...s, holidays: dates }))}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-white">Announcement</label>
          <Input
            type="text"
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Announcement (e.g., sale information)"
            value={form.commercial_text}
            onChange={e => setForm(s => ({ ...s, commercial_text: e.target.value }))}
          />
          <div className="flex items-center space-x-2 mt-1">
            <input
              type="checkbox"
              id="visionEnabled-edit"
              checked={!!form.vision_enabled}
              onChange={e => setForm(s => ({ ...s, vision_enabled: e.target.checked }))}
            />
            <label htmlFor="visionEnabled-edit" className="text-gray-300">Display on Vision</label>
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-white">AI Chat Settings</label>
          <Textarea
            className="bg-gray-700 border-gray-600 text-white"
            rows={3}
            value={form.stance}
            onChange={e => setForm(s => ({ ...s, stance: e.target.value }))}
            placeholder="AI chat character and description"
          />
        </div>
        {entityType === 'shop' && (
          <>
            {/* --- ラグ（ファイルアップロード）欄 --- */}
            <div>
              <label className="block font-semibold mb-1 text-white">Data Upload (Lag)</label>
              <input
                type="file"
                className="bg-gray-700 border-gray-600 text-white rounded px-2 py-1 w-full"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file && onUpload) onUpload(file);
                }}
                disabled={uploading}
              />
              {uploading && <div className="text-xs text-blue-400 mt-1">Uploading...</div>}
              {uploadMessage && <div className="text-xs text-green-400 mt-1">{uploadMessage}</div>}
              <div className="text-xs text-gray-400 mt-1">Uploaded files can be used as AI chat lag</div>
            </div>
            {/* --- ラグリスト --- */}
            <div>
              <label className="block font-semibold mb-1 mt-2 text-white">Uploaded Lag List</label>
              <div className="max-h-32 overflow-y-auto border border-gray-600 rounded p-2 bg-gray-700">
                <ul className="space-y-1">
                  {lags && lags.length > 0 ? lags.map(lag => (
                    <li key={lag.id} className="flex items-center space-x-2">
                      <a href={lag.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{lag.file_name}</a>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-400 hover:text-red-300 h-6 px-2"
                        onClick={() => onDeleteLag && onDeleteLag(lag.id)}
                      >
                        Delete
                      </Button>
                    </li>
                  )) : <li className="text-gray-400">No lags available</li>}
                </ul>
              </div>
            </div>
          </>
        )}
        {entityType === 'facility' && (
          <>
            <Input
              type="text"
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Philosophy"
              value={(form as Facility).philosophy || ''}
              onChange={e => setForm(s => ({ ...s, philosophy: e.target.value }))}
            />
            <Input
              type="text"
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Response Stance"
              value={(form as Facility).responseStance || ''}
              onChange={e => setForm(s => ({ ...s, responseStance: e.target.value }))}
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVisible-edit"
                checked={(form as Facility).isVisible}
                onChange={e => setForm(s => ({ ...s, isVisible: e.target.checked }))}
              />
              <label htmlFor="isVisible-edit" className="text-gray-300">Visible</label>
            </div>
          </>
        )}
        {/* --- 保存・キャンセル --- */}
        <div className="flex gap-2 mt-4">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:text-white"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EntityEditForm; 