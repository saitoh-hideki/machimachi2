import React, { useState, useEffect } from 'react';
import { Shop, Facility } from '@/types';
import { HolidayCalendar } from './HolidayCalendar';

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
    setForm({ ...entity });
  }, [entity]);

  return (
    <div>
      <div className="font-semibold mb-2">Edit {entityType === 'shop' ? 'Shop & Office' : 'Facility'}</div>
      <div className="space-y-2">
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder={entityType === 'shop' ? 'Shop Name' : 'Facility Name'}
          value={form.name}
          onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
        />
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="Category"
          value={form.category}
          onChange={e => setForm(s => ({ ...s, category: e.target.value }))}
        />
        {entityType === 'shop' && (
          <input
            type="text"
            className="border rounded px-2 py-1 w-full"
            placeholder="Appearance"
            value={(form as Shop).appearance || ''}
            onChange={e => setForm(s => ({ ...s, appearance: e.target.value }))}
          />
        )}
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="Address"
          value={form.address}
          onChange={e => setForm(s => ({ ...s, address: e.target.value }))}
        />
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="Phone Number"
          value={form.phone}
          onChange={e => setForm(s => ({ ...s, phone: e.target.value }))}
        />
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="URL"
          value={form.homepage_url}
          onChange={e => setForm(s => ({ ...s, homepage_url: e.target.value }))}
        />
        <div className="flex space-x-2">
          <select
            className="border rounded px-2 py-1 w-1/2"
            value={form.hours_start || ''}
            onChange={e => setForm(s => ({ ...s, hours_start: e.target.value }))}
          >
            <option value="">Start Time</option>
            {Array.from({length: 24}, (_, i) => `${i}:00`).map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          <select
            className="border rounded px-2 py-1 w-1/2"
            value={form.hours_end || ''}
            onChange={e => setForm(s => ({ ...s, hours_end: e.target.value }))}
          >
            <option value="">End Time</option>
            {Array.from({length: 24}, (_, i) => `${i}:00`).map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Holidays</label>
          <HolidayCalendar
            selectedDates={form.holidays || []}
            onDateChange={(dates) => setForm(s => ({ ...s, holidays: dates }))}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="recruit-edit"
            checked={!!form.recruit}
            onChange={e => setForm(s => ({ ...s, recruit: e.target.checked ? 'Available' : '' }))}
          />
          <label htmlFor="recruit-edit">Job Recruitment Available</label>
        </div>
        <div>
          <label className="block font-semibold mb-1">Announcement</label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-full"
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
            <label htmlFor="visionEnabled-edit">Display on Vision</label>
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">AI Chat Settings</label>
          <textarea
            className="border rounded px-2 py-1 w-full"
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
              <label className="block font-semibold mb-1">Data Upload (Lag)</label>
              <input
                type="file"
                className="border rounded px-2 py-1 w-full"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file && onUpload) onUpload(file);
                }}
                disabled={uploading}
              />
              {uploading && <div className="text-xs text-blue-600 mt-1">Uploading...</div>}
              {uploadMessage && <div className="text-xs text-green-600 mt-1">{uploadMessage}</div>}
              <div className="text-xs text-gray-500 mt-1">Uploaded files can be used as AI chat lag</div>
            </div>
            {/* --- ラグリスト --- */}
            <div>
              <label className="block font-semibold mb-1 mt-2">Uploaded Lag List</label>
              <div className="max-h-32 overflow-y-auto border rounded p-2">
                <ul className="space-y-1">
                  {lags && lags.length > 0 ? lags.map(lag => (
                    <li key={lag.id} className="flex items-center space-x-2">
                      <a href={lag.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{lag.file_name}</a>
                      <button className="text-xs text-red-500 hover:underline" onClick={() => onDeleteLag && onDeleteLag(lag.id)}>Delete</button>
                    </li>
                  )) : <li className="text-gray-400">No lags available</li>}
                </ul>
              </div>
            </div>
          </>
        )}
        {entityType === 'facility' && (
          <>
            <input
              type="text"
              className="border rounded px-2 py-1 w-full"
              placeholder="Icon (emoji or url)"
              value={(form as Facility).icon || ''}
              onChange={e => setForm(s => ({ ...s, icon: e.target.value }))}
            />
            <input
              type="text"
              className="border rounded px-2 py-1 w-full"
              placeholder="Philosophy"
              value={(form as Facility).philosophy || ''}
              onChange={e => setForm(s => ({ ...s, philosophy: e.target.value }))}
            />
            <input
              type="text"
              className="border rounded px-2 py-1 w-full"
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
              <label htmlFor="isVisible-edit">Visible</label>
            </div>
          </>
        )}
        {/* --- 保存・キャンセル --- */}
        <div className="flex gap-2 mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
            onClick={() => onSave(form)}
          >Save</button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 w-full"
            onClick={onCancel}
          >Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EntityEditForm; 