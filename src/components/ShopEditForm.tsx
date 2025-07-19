import React, { useState, useEffect } from 'react';
import { Shop } from '@/types';

interface ShopLag {
  id: string;
  file_url: string;
  file_name: string;
}

interface ShopEditFormProps {
  shop: Shop;
  lags: ShopLag[];
  uploading: boolean;
  uploadMessage: string | null;
  onUpload: (file: File) => void;
  onDeleteLag: (lagId: string) => void;
  onSave: (updatedShop: Shop) => void;
  onCancel: () => void;
}

const ShopEditForm: React.FC<ShopEditFormProps> = ({ shop, lags, uploading, uploadMessage, onUpload, onDeleteLag, onSave, onCancel }) => {
  const [form, setForm] = useState<Shop>({ ...shop });

  useEffect(() => {
    setForm({ ...shop });
  }, [shop]);

  return (
    <div>
      <div className="font-semibold mb-2">店舗・事務所の編集</div>
      <div className="space-y-2">
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="店舗名"
          value={form.name}
          onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
        />
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="業種"
          value={form.category}
          onChange={e => setForm(s => ({ ...s, category: e.target.value }))}
        />
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="住所"
          value={form.address}
          onChange={e => setForm(s => ({ ...s, address: e.target.value }))}
        />
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="電話番号"
          value={form.phone}
          onChange={e => setForm(s => ({ ...s, phone: e.target.value }))}
        />
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="URL"
          value={form.homepageUrl}
          onChange={e => setForm(s => ({ ...s, homepageUrl: e.target.value }))}
        />
        <div className="flex space-x-2">
          <select
            className="border rounded px-2 py-1 w-1/2"
            value={form.hoursStart || ''}
            onChange={e => setForm(s => ({ ...s, hoursStart: e.target.value }))}
          >
            <option value="">開始時刻</option>
            {Array.from({length: 24}, (_, i) => `${i}:00`).map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          <select
            className="border rounded px-2 py-1 w-1/2"
            value={form.hoursEnd || ''}
            onChange={e => setForm(s => ({ ...s, hoursEnd: e.target.value }))}
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
            id="recruit-edit"
            checked={!!form.recruit}
            onChange={e => setForm(s => ({ ...s, recruit: e.target.checked ? 'あり' : '' }))}
          />
          <label htmlFor="recruit-edit">求人募集あり</label>
        </div>
        <div>
          <label className="block font-semibold mb-1">お知らせ</label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-full"
            placeholder="お知らせ（例：セール情報など）"
            value={form.commercialText}
            onChange={e => setForm(s => ({ ...s, commercialText: e.target.value }))}
          />
          <div className="flex items-center space-x-2 mt-1">
            <input
              type="checkbox"
              id="visionEnabled-edit"
              checked={!!form.visionEnabled}
              onChange={e => setForm(s => ({ ...s, visionEnabled: e.target.checked }))}
            />
            <label htmlFor="visionEnabled-edit">ビジョンに流す</label>
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">AIチャット設定</label>
          <textarea
            className="border rounded px-2 py-1 w-full"
            rows={3}
            value={form.stance}
            onChange={e => setForm(s => ({ ...s, stance: e.target.value }))}
            placeholder="AIチャットのキャラクターや説明文など"
          />
        </div>
        {/* --- ラグ（ファイルアップロード）欄 --- */}
        <div>
          <label className="block font-semibold mb-1">データアップロード（ラグ）</label>
          <input
            type="file"
            className="border rounded px-2 py-1 w-full"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
            disabled={uploading}
          />
          {uploading && <div className="text-xs text-blue-600 mt-1">アップロード中...</div>}
          {uploadMessage && <div className="text-xs text-green-600 mt-1">{uploadMessage}</div>}
          <div className="text-xs text-gray-500 mt-1">アップロードしたファイルはAIチャットのラグとして利用できます</div>
        </div>
        {/* --- ラグリスト --- */}
        <div>
          <label className="block font-semibold mb-1 mt-2">アップロード済みラグ一覧</label>
          <ul className="space-y-1">
            {lags && lags.length > 0 ? lags.map(lag => (
              <li key={lag.id} className="flex items-center space-x-2">
                <a href={lag.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{lag.file_name}</a>
                <button className="text-xs text-red-500 hover:underline" onClick={() => onDeleteLag(lag.id)}>削除</button>
              </li>
            )) : <li className="text-gray-400">ラグはありません</li>}
          </ul>
        </div>
        {/* --- 保存・キャンセル --- */}
        <div className="flex gap-2 mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
            onClick={() => onSave(form)}
          >保存</button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 w-full"
            onClick={onCancel}
          >キャンセル</button>
        </div>
      </div>
    </div>
  );
};

export default ShopEditForm; 